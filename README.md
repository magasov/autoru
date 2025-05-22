<div align="center">
  <br />
    <a href="https://github.com/magasov" target="_blank">
      <img src="./client/public/assets/readme/banner.png" alt="Project Banner">
    </a>
  <br />
 
  <p>
    <code><img src="https://gitlab.com/uploads/-/system/project/avatar/13388802/angular-js-512.png" alt="react.js" height="30" /></code>
    <code><img src="https://camo.githubusercontent.com/94614fd3e40c34f3025cafff06bccef1032ae5276917e636e6a68634fc59a388/68747470733a2f2f63646e2e66726565626965737570706c792e636f6d2f6c6f676f732f6c617267652f32782f6e6f64656a732d69636f6e2d6c6f676f2d706e672d7472616e73706172656e742e706e67" alt="null" height="30" /></code>
    <code><img src="https://camo.githubusercontent.com/ce56e64adb8fb1ee82bc5fefc504e3b912c4bbca5382226786e6bb2af6986294/68747470733a2f2f6769746c61622e636f6d2f75706c6f6164732f2d2f73797374656d2f67726f75702f6176617461722f31303732303235332f747970657363726970742e706e67" alt="null" height="30" /></code>
    <code><img src="https://cdn.coursehunter.net/category/mongodb.png" alt="react.js" height="30" /></code>
    <code><img src="https://camo.githubusercontent.com/e84d110dc8fc6125b9138856352724ba0f8f6b86ec6ac91961669d407fd71e24/68747470733a2f2f63646e2d69636f6e732d706e672e666c617469636f6e2e636f6d2f3531322f353936382f353936383335382e706e67" alt="null" height="30" /></code>
  </p>
  <h1 align="center">Auto.ru</h1>

   <div align="center">
     Знакомая платформа, но с новыми фишками. Всё как раньше — только лучше.
    </div>
</div>

## 🚀 Что реализовано

- 💬 Чат в реальном времени с отображением онлайн
- ⭐ Избранное с сохранением и быстрым доступом
- ➕🗑️ Добавление, удаление товаров
- 📰 Просмотр и сортировка по категориям
- 🔢 Подсчёт просмотров товаров и постов
- 🔒 Вход по почте с подтверждением через код
- 🔔 Email-уведомления о новых сообщениях
- 🎞 Красивые и адаптивные слайдеры изображений
- 🏷️ Мета-теги

## 📋 Tech Stack

### 🧩 Frontend (Angular)

- 🅰️ Angular 19
- 🌐 Angular Router
- 🎭 Ngx Emoji Mart + emoji-picker-element
- 📡 Axios
- 🔔 Ngx Sonner
- 🔊 Socket.IO Client
- 🧠 RxJS
- 🧪 Jasmine + Karma

### ⚙️ Backend (Node.js + Express)

- 🚂 Express.js
- 💾 MongoDB + Mongoose
- 🔐 JWT (jsonwebtoken)
- 🛡 Express Rate Limit
- 📩 Nodemailer
- 🧱 Multer (загрузка файлов)
- 🔄 Nodemon
- 🧂 bcrypt
- 🔌 Socket.IO
- 🆔 UUID
- 🌍 CORS + dotenv

## 🚀 Как начать

1. Установите [Node.js](https://nodejs.org/) (рекомендуется версия 18+).

2. Склонируйте репозиторий:
   ```bash
   git clone https://github.com/magasov/autoru.git
   cd autoru
   ```
3. В корне backend-проекта создайте файл .env и добавьте в него следующие переменные окружения (без кавычек и с вашими значениями):
   ```env
    JWT_SECRET=секретный_ключ_для_токенов_JWT
    EMAIL_USER=ваш_электронный_адрес_для_отправки_писем
    EMAIL_PASS=пароль_приложения_от_гугл_или_другой_почты (снизу ссылка для генерации)
    MONGO_URI=строка_подключения_к_вашему_кластеру_MongoDB
    PORT=8080
    CLIENT_URL=http://localhost:4200
   ```

> ⚠️ **Генерация пароля для отправки писем**  
> https://myaccount.google.com/apppasswords

4. Установите зависимости и запустите backend:

   ```bash
   cd api
   npm install
   npm run dev
   ```

5. Запустите frontend (в другом терминале):

   ```bash
   cd ../client
   npm install
   npm start
   ```

6. Откройте в браузере: http://localhost:4200

##

> ⚠️ **Дисклеймер**  
> Данный проект является **неофициальной копией Auto.ru**, созданной **исключительно в учебных целях**.  
> Он не связан с оригинальным сайтом Auto.ru, брендом, компанией "Яндекс" или её дочерними организациями.  
> Проект не используется в коммерческих целях и предназначен только для получения **практического опыта в fullstack-разработке с использованием Angular и Node.js**.
