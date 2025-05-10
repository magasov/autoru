import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      brand,
      model,
      year,
      bodyType,
      generation,
      engine,
      drivetrain,
      transmission,
      modification,
      color,
      mileage,
      ptsType,
      description,
      contactName,
      email,
      phone,
      price,
    } = req.body;

    if (
      !brand ||
      !model ||
      !year ||
      !bodyType ||
      !generation ||
      !engine ||
      !drivetrain ||
      !transmission ||
      !modification ||
      !color ||
      !mileage ||
      !ptsType ||
      !description ||
      !contactName ||
      !email ||
      !phone ||
      !price
    ) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Некорректный email" });
    }

    const parsedMileage = parseInt(mileage, 10);
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedMileage) || parsedMileage < 0) {
      return res.status(400).json({ message: "Некорректный пробег" });
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Некорректная цена" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Необходимо загрузить хотя бы одно фото" });
    }

    const photoPaths = req.files.map((file) => file.path);

    const post = new Post({
      userId,
      brand,
      model,
      year,
      bodyType,
      generation,
      engine,
      drivetrain,
      transmission,
      modification,
      color,
      mileage: parsedMileage,
      photos: photoPaths,
      ptsType,
      description,
      contactName,
      email,
      phone,
      price: parsedPrice,
    });

    await post.save();
    res.status(201).json({ message: "Объявление создано", post });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "email name");
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "email name"
    );
    if (!post) {
      return res.status(404).json({ message: "Объявление не найдено" });
    }
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { userId } = req.user;
    const postId = req.params.id;
    const {
      brand,
      model,
      year,
      bodyType,
      generation,
      engine,
      drivetrain,
      transmission,
      modification,
      color,
      mileage,
      ptsType,
      description,
      contactName,
      email,
      phone,
      price,
    } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Объявление не найдено" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Некорректный email" });
    }

    if (mileage !== undefined) {
      const parsedMileage = parseInt(mileage, 10);
      if (isNaN(parsedMileage) || parsedMileage < 0) {
        return res.status(400).json({ message: "Некорректный пробег" });
      }
      post.mileage = parsedMileage;
    }
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: "Некорректная цена" });
      }
      post.price = parsedPrice;
    }

    post.brand = brand || post.brand;
    post.model = model || post.model;
    post.year = year || post.year;
    post.bodyType = bodyType || post.bodyType;
    post.generation = generation || post.generation;
    post.engine = engine || post.engine;
    post.drivetrain = drivetrain || post.drivetrain;
    post.transmission = transmission || post.transmission;
    post.modification = modification || post.modification;
    post.color = color || post.color;
    post.ptsType = ptsType || post.ptsType;
    post.description = description || post.description;
    post.contactName = contactName || post.contactName;
    post.email = email || post.email;
    post.phone = phone || post.phone;

    if (req.files && req.files.length > 0) {
      post.photos = req.files.map((file) => file.path);
    }

    await post.save();
    res.status(200).json({ message: "Объявление обновлено", post });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { userId } = req.user;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Объявление не найдено" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Объявление удалено" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};
