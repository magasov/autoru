import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import url from "url";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

const JWT_SECRET = process.env.JWT_SECRET;

const clients = new Map();

export const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const query = url.parse(req.url, true).query;
    const token = query.token;

    if (!token) {
      ws.close(4000, "Токен не предоставлен");
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      User.findById(userId).then((user) => {
        if (!user) {
          ws.close(4001, "Пользователь не найден");
          return;
        }

        clients.set(userId, ws);

        ws.send(JSON.stringify({ type: "connected", userId }));

        ws.on("message", async (data) => {
          try {
            const message = JSON.parse(data);
            const { recipientId, postId, content } = message;

            if (!recipientId || !postId || !content) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "recipientId, postId и content обязательны",
                })
              );
              return;
            }

            const recipient = await User.findById(recipientId);
            const post = await Post.findById(postId);
            if (!recipient || !post) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Получатель или объявление не найдены",
                })
              );
              return;
            }

            const newMessage = new Message({
              senderId: userId,
              recipientId,
              postId,
              content,
              status: "sent",
            });
            await newMessage.save();

            ws.send(
              JSON.stringify({
                type: "message",
                message: {
                  _id: newMessage._id,
                  senderId: userId,
                  recipientId,
                  postId,
                  content,
                  status: newMessage.status,
                  createdAt: newMessage.createdAt,
                },
              })
            );

            const recipientWs = clients.get(recipientId);
            if (recipientWs) {
              newMessage.status = "delivered";
              await newMessage.save();
              recipientWs.send(
                JSON.stringify({
                  type: "message",
                  message: {
                    _id: newMessage._id,
                    senderId: userId,
                    recipientId,
                    postId,
                    content,
                    status: newMessage.status,
                    createdAt: newMessage.createdAt,
                  },
                })
              );
            }
          } catch (error) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Ошибка обработки сообщения",
              })
            );
          }
        });

        ws.on("close", () => {
          clients.delete(userId);
        });
      });
    } catch (error) {
      ws.close(4002, "Неверный токен");
    }
  });
};

export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const { recipientId, postId } = req.query;

    if (!recipientId || !postId) {
      return res
        .status(400)
        .json({ message: "recipientId и postId обязательны" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId, postId },
        { senderId: recipientId, recipientId: userId, postId },
      ],
    })
      .populate("senderId", "email name")
      .populate("recipientId", "email name")
      .populate("postId", "brand model price")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        senderId: recipientId,
        recipientId: userId,
        postId,
        status: { $in: ["sent", "delivered"] },
      },
      { status: "read" }
    );

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.user;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            postId: "$postId",
            otherUserId: {
              $cond: [
                { $eq: ["$senderId", userId] },
                "$recipientId",
                "$senderId",
              ],
            },
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.otherUserId",
          foreignField: "_id",
          as: "otherUser",
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id.postId",
          foreignField: "_id",
          as: "post",
        },
      },
      {
        $unwind: "$otherUser",
      },
      {
        $unwind: "$post",
      },
      {
        $project: {
          postId: "$_id.postId",
          otherUser: { email: "$otherUser.email", name: "$otherUser.name" },
          post: {
            brand: "$post.brand",
            model: "$post.model",
            price: "$post.price",
          },
          lastMessage: {
            content: "$lastMessage.content",
            createdAt: "$lastMessage.createdAt",
            status: "$lastMessage.status",
          },
        },
      },
    ]);

    res.status(200).json({ chats: messages });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};
