import { WebSocketServer } from "ws";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import transporter from "../utils/mailer.js";

const clients = new Map();

const sendMessageNotificationEmail = async (
  recipientEmail,
  senderName,
  content,
  post
) => {
  try {
    const mailOptions = {
      from: `"Oushauto" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: "Новое сообщение в чате",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; border-radius: 10px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px; text-align: center;">
              Новое сообщение от ${senderName || "пользователя"}
            </h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              ${content}
            </p>
            ${
              post
                ? `
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 10px;">
                      Объявление
                    </h2>
                    <p style="color: #333; font-size: 16px; margin: 5px 0;">
                      <strong>Автомобиль:</strong> ${post.brand} ${post.model}
                    </p>
                    <p style="color: #333; font-size: 16px; margin: 5px 0;">
                      <strong>Цена:</strong> ${post.price.toLocaleString(
                        "ru-RU"
                      )} ₽
                    </p>
                  </div>`
                : ""
            }
            <div style="text-align: center;">
              <a href="http://localhost:4200/chat" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                Ответить в чате
              </a>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
              Это автоматическое письмо, пожалуйста, не отвечайте на него.
            </p>
          </div>
          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            © 2025 Oushauto. Все права защищены.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Уведомление отправлено на ${recipientEmail}`);
  } catch (error) {
    console.error(`Ошибка при отправке уведомления: ${error.message}`);
  }
};

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

  clients.set(userId, ws);
  console.log(`Клиент ${userId} подключён. Текущие клиенты:`, Array.from(clients.keys()));

ws.on("message", async (data) => {
  try {
    const message = JSON.parse(data);
    const { type, recipientId, content, postId, sdp, candidate } = message;

    if (!recipientId) {
      ws.send(JSON.stringify({ error: "recipientId обязателен" }));
      return;
    }

    const sender = await User.findById(userId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) {
      ws.send(JSON.stringify({ error: "Пользователь не найден" }));
      return;
    }

    const recipientWs = clients.get(recipientId);

    if (type === "call") {
      if (!recipientWs) {
        console.log(`Получатель ${recipientId} не в сети`);
        ws.send(JSON.stringify({ error: "Получатель не в сети" }));
        return;
      }

      console.log(`Отправка сообщения звонка от ${userId} к ${recipientId}:`, { sdp, candidate, content });
      recipientWs.send(
        JSON.stringify({
          type: "call",
          senderId: userId,
          recipientId,
          sdp,
          candidate,
          content,
        })
      );
      console.log(`Сообщение звонка успешно отправлено ${recipientId}`);
    } else if (type === "message") {
      // Проверка на пустое сообщение
      if (!content || content.trim() === "") {
        ws.send(JSON.stringify({ error: "Сообщение не может быть пустым" }));
        return;
      }

      // Сохранение сообщения в базе данных
      const post = postId ? await Post.findById(postId) : null;
      const newMessage = new Message({
        sender: userId,
        recipient: recipientId,
        content,
        postId: postId || null,
        chatId: [userId, recipientId].sort().join("_"),
        createdAt: new Date(),
      });

      await newMessage.save();

      // Формирование ответа с ID сообщения
      const messageData = {
        type: "message",
        id: newMessage._id,
        senderId: userId,
        recipientId,
        content,
        postId: postId || null,
        createdAt: newMessage.createdAt,
      };

      // Отправка сообщения отправителю и получателю
      [userId, recipientId].forEach((id) => {
        const clientWs = clients.get(id);
        if (clientWs) {
          clientWs.send(JSON.stringify(messageData));
          console.log(`Сообщение отправлено ${id}`);
        } else {
          console.log(`Клиент ${id} не в сети, сообщение сохранено в БД`);
        }
      });

      // Отправка email-уведомления получателю
      await sendMessageNotificationEmail(
        recipient.email,
        sender.name || "Пользователь",
        content,
        post
      );

      // Уведомление всех клиентов об обновлении чата
      const chatUpdate = {
        type: "chatUpdate",
        chatId: newMessage.chatId,
        recipientId: userId === recipientId ? sender._id : recipient._id,
        lastMessage: content,
        lastMessageTime: new Date(newMessage.createdAt).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        postId: postId || null,
        carName: post ? `${post.brand} ${post.model}` : "Unknown Car",
        price: post ? `${post.price.toLocaleString("ru-RU")} ₽` : "0 ₽",
      };

      [userId, recipientId].forEach((id) => {
        const clientWs = clients.get(id);
        if (clientWs) {
          clientWs.send(JSON.stringify(chatUpdate));
        }
      });
    } else {
      ws.send(JSON.stringify({ error: "Недопустимый тип сообщения" }));
    }
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
      .populate("sender", "email name avatar lastSeen")
      .populate("recipient", "email name avatar lastSeen")
      .populate("postId", "brand model price photos")
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
        select: "email name avatar lastSeen",
      })
      .populate({
        path: "recipient",
        select: "email name avatar lastSeen",
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
          lastSeen: recipient.lastSeen
            ? recipient.lastSeen.toISOString()
            : "unknown",
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
          postId: message.postId?._id.toString() || null,
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
    const user = await User.findById(id).select("email name avatar lastSeen");
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        lastSeen: user.lastSeen ? user.lastSeen.toISOString() : "unknown",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};
