import { WebSocketServer } from "ws";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

// Создаём Map для хранения WebSocket-соединений
const clients = new Map();

export const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const userId = urlParams.get("userId");

    if (!userId) {
      ws.send(JSON.stringify({ error: "User ID is required" }));
      ws.close();
      return;
    }

    // Сохраняем WebSocket-соединение для пользователя
    clients.set(userId, ws);
    console.log(`Клиент ${userId} подключён`);

    ws.on("message", async (data) => {
      try {
        const { recipientId, content, postId } = JSON.parse(data); // Add postId

        if (!recipientId || !content) {
          ws.send(
            JSON.stringify({ error: "recipientId и content обязательны" })
          );
          return;
        }

        const sender = await User.findById(userId);
        const recipient = await User.findById(recipientId);

        if (!sender || !recipient) {
          ws.send(JSON.stringify({ error: "Пользователь не найден" }));
          return;
        }

        // Validate postId if provided
        let validPostId = null;
        if (postId) {
          const post = await Post.findById(postId);
          if (post) {
            valid_PostId = post._id;
          } else {
            console.warn(`Post with ID ${postId} not found`);
          }
        }

        const message = new Message({
          sender: userId,
          recipient: recipientId,
          content,
          chatId: [userId, recipientId].sort().join("_"),
          postId: validPostId, // Save postId if valid
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "email name avatar")
          .populate("recipient", "email name avatar")
          .populate("postId", "brand model price photos"); // Populate post details

        const recipientWs = clients.get(recipientId);
        if (recipientWs) {
          recipientWs.send(JSON.stringify(populatedMessage));
        }

        ws.send(JSON.stringify(populatedMessage));
      } catch (error) {
        console.error("Ошибка обработки сообщения:", error);
        ws.send(JSON.stringify({ error: "Ошибка сервера" }));
      }
    });

    ws.on("close", () => {
      clients.delete(userId);
      console.log(`Клиент ${userId} отключён`);
    });

    ws.on("error", (error) => {
      console.error(`Ошибка WebSocket для ${userId}:`, error);
      clients.delete(userId);
    });
  });
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.user;
    const { recipientId } = req.query;

    if (!recipientId) {
      return res.status(400).json({ message: "recipientId обязателен" });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    })
      .populate("sender", "email name avatar")
      .populate("recipient", "email name avatar")
      .populate("postId", "brand model price photos") // Populate post details
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getChats = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("Получение чатов для userId:", userId);

    // Проверяем, существует ли пользователь
    const user = await User.findById(userId);
    if (!user) {
      console.log("Пользователь не найден:", userId);
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate({
        path: "sender",
        select: "email name avatar",
      })
      .populate({
        path: "recipient",
        select: "email name avatar",
      })
      .populate({
        path: "postId",
        select: "brand model price photos",
      })
      .sort({ createdAt: -1 });

    console.log("Найдено сообщений:", messages.length);

    const chatMap = new Map();
    for (const message of messages) {
      if (!message.sender || !message.recipient) {
        console.log(
          "Пропущено сообщение с некорректными sender/recipient:",
          message._id
        );
        continue;
      }

      const chatId = message.chatId;
      if (!chatMap.has(chatId)) {
        const recipientId =
          message.sender._id.toString() === userId
            ? message.recipient._id.toString()
            : message.sender._id.toString();
        const recipient =
          message.sender._id.toString() === userId
            ? message.recipient
            : message.sender;

        chatMap.set(chatId, {
          id: recipientId,
          recipientId,
          sellerType: recipient.name ? "Частное лицо" : "Неизвестно",
          lastMessage: message.content || "",
          lastMessageTime: new Date(message.createdAt).toLocaleTimeString(
            "ru-RU",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
          avatar: recipient.avatar || "https://example.com/default-avatar.png",
          carName: message.postId
            ? `${message.postId.brand} ${message.postId.model}`
            : "Unknown Car",
          price: message.postId ? `${message.postId.price} ₽` : "0 ₽",
          postId: message.postId?._id.toString() || null, // Include postId
        });
      }
    }

    const chats = Array.from(chatMap.values());
    console.log("Отправлено чатов:", chats.length);
    res.status(200).json({ chats });
  } catch (error) {
    console.error("Ошибка в getChats:", error.message, error.stack);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("email name avatar");
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};
