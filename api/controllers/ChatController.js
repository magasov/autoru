// controllers/ChatController.js
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
        const { recipientId, content } = JSON.parse(data);

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

        const message = new Message({
          sender: userId,
          recipient: recipientId,
          content,
          chatId: [userId, recipientId].sort().join("_"),
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "email name")
          .populate("recipient", "email name");

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
      .populate("sender", "email name")
      .populate("recipient", "email name")
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
        select: "email name",
      })
      .populate({
        path: "recipient",
        select: "email name",
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
          avatar: "https://example.com/default-avatar.png",
          carName: "Unknown Car",
          price: "0 ₽",
        });
      }
    }

    const recipientIds = Array.from(chatMap.values()).map(
      (chat) => chat.recipientId
    );
    console.log("ID получателей:", recipientIds);

    // Находим посты только если есть recipientIds
    let posts = [];
    if (recipientIds.length > 0) {
      posts = await Post.find({ userId: { $in: recipientIds } });
    }
    console.log("Найдено постов:", posts.length);

    for (const post of posts) {
      const chat = chatMap.get(post.userId.toString());
      if (chat) {
        chat.carName = post.title || "Unknown Car";
        chat.price = post.price ? `${post.price} ₽` : "0 ₽";
        chat.avatar = post.photos?.[0]
          ? `http://localhost:8080/uploads/${post.photos[0]}`
          : chat.avatar;
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
