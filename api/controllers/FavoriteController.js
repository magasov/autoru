import Favorite from "../models/Favorite.js";
import Post from "../models/Post.js";

export const addToFavorites = async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ message: "Не указан ID объявления" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Объявление не найдено" });
    }

    const existingFavorite = await Favorite.findOne({ userId, postId });
    if (existingFavorite) {
      return res.status(400).json({ message: "Объявление уже в избранном" });
    }

    const favorite = new Favorite({
      userId,
      postId,
    });

    await favorite.save();
    res
      .status(201)
      .json({ message: "Объявление добавлено в избранное", favorite });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.user;

    const favorites = await Favorite.find({ userId }).populate({
      path: "postId",
      populate: { path: "userId", select: "email name avatar" },
    });

    const validFavorites = favorites.filter((fav) => fav.postId !== null);

    res.status(200).json({ favorites: validFavorites });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const removeFromFavorites = async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const favorite = await Favorite.findOne({ userId, postId });
    if (!favorite) {
      return res
        .status(404)
        .json({ message: "Объявление не найдено в избранном" });
    }

    await favorite.deleteOne();
    res.status(200).json({ message: "Объявление удалено из избранного" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};
