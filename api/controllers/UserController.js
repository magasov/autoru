import User from "../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: `"Autoru Magasov" <${EMAIL_USER}>`,
      to: email,
      subject: "Код верификации",
      text: `Ваш код верификации: ${code}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Ошибка при отправке письма: ${error.message}`);
  }
};

export const requestAuthCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Некорректный email" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    const verificationCode = generateCode();
    user.verificationCode = verificationCode;
    await user.save();

    await sendVerificationEmail(email, verificationCode);
    res.status(200).json({ message: "Код верификации отправлен на email" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const verifyAuthCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Неверный код" });
    }

    user.verificationCode = undefined;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      message: "Вход успешен",
      token,
      user: { email: user.email, name: user.name || "" },
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email не верифицирован" });
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
      user.email = email;
      user.isVerified = false;
      const verificationCode = generateCode();
      user.verificationCode = verificationCode;
      await user.save();
      await sendVerificationEmail(email, verificationCode);
      return res
        .status(200)
        .json({ message: "Код верификации отправлен на новый email" });
    }

    await user.save();
    res.status(200).json({
      message: "Профиль обновлен",
      user: { email: user.email, name: user.name || "" },
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json({
      message: "Данные пользователя получены",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};
