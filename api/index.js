// index.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createServer } from "http";

import {
  getMe,
  requestAuthCode,
  verifyAuthCode,
} from "./controllers/UserController.js";
import { checkAuth } from "./utils/checkAuth.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from "./controllers/PostController.js";
import {
  addToFavorites,
  getUserFavorites,
  removeFromFavorites,
} from "./controllers/FavoriteController.js";
import {
  initializeWebSocket,
  getMessages,
  getChats,
  getUser,
} from "./controllers/ChatController.js";

dotenv.config();

const app = express();
const server = createServer(app);
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|webp|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);
    if (extname && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Только изображения формата JPEG или PNG"));
    }
  },
}).array("photos", 10);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err.message === "Только изображения формата JPEG или PNG") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Initialize WebSocket
initializeWebSocket(server);

// Routes
app.get("/", (req, res) => {
  res.send("Сервер работает!");
});

app.post("/auth", requestAuthCode);
app.post("/auth/verify-code", verifyAuthCode);
app.get("/me", checkAuth, getMe);

app.post("/posts", checkAuth, upload, createPost);
app.get("/posts", getAllPosts);
app.get("/posts/:id", getPostById);
app.put("/posts/:id", checkAuth, upload, updatePost);
app.delete("/posts/:id", checkAuth, deletePost);

app.post("/favorites", checkAuth, addToFavorites);
app.get("/favorites", checkAuth, getUserFavorites);
app.delete("/favorites/:postId-", checkAuth, removeFromFavorites);

// Chat route
app.get("/messages", checkAuth, getMessages);
app.get("/chats", checkAuth, getChats);
app.get("/users/:id", checkAuth, getUser);

app.use("/uploads", express.static("uploads"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Внутренняя ошибка сервера" });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Успешное подключение к базе данных");

    server.listen(process.env.PORT, () => {
      console.log(`Сервер запущен на http://localhost:${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Ошибка при подключении к базе данных:", err);
    process.exit(1);
  }
}

start();
