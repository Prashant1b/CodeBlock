# 🏷️ CodeBlock — Online Judge & Competitive Coding Platform

A full-stack **Online Coding Practice & Contest Platform** built using **MongoDB, Express.js, React.js, and Node.js (MERN Stack)**.

---

# 💡 About this Project

CodeBlock is a full-featured coding platform inspired by **LeetCode**, where users can solve DSA problems, participate in coding contests, execute code in multiple programming languages, interact with the community, and get AI-powered assistance—all within an integrated browser-based code editor.

### ✨ Features

- 🔐 User Authentication with OTP-based Password Reset
- 💻 Solve coding problems using the Monaco Code Editor
- 🚀 Run and submit code in **C++, Java, JavaScript, and Python**
- 📊 View submission history and track solved problems
- 🏆 Participate in live coding contests with leaderboard support
- 💬 Community Discussion section for problem discussions
- 🤖 AI-powered "Solve My Doubt" assistant using Google Gemini
- 👨‍💼 Admin Panel to manage problems, contests, users, and discussions

This project helped me strengthen my knowledge of **Data Structures & Algorithms**, **System Design**, **Secure Code Execution**, **Contest Management Systems**, and **AI Integration** in real-world full-stack applications.

---

# ⚡ Technologies Used

### 🌐 Frontend

- ⚛️ React.js (Vite)
- 🛣️ React Router DOM
- 🎨 Tailwind CSS v4
- 🌼 DaisyUI
- 💻 Monaco Editor
- 📝 React Hook Form
- 🔔 React Hot Toast
- 🔗 Axios

### ⚙️ Backend

- 🟢 Node.js
- 🚀 Express.js
- 🍃 MongoDB + Mongoose
- 🔴 Redis
- 🔐 JWT Authentication
- 🔒 bcrypt
- 🍪 Cookie-based Authentication
- ⚡ Judge0 API (RapidAPI)
- 🤖 Google Gemini AI
- 📧 Nodemailer / Brevo API

---

# 🚦 Running the Project

## 📌 Prerequisites

Before running the project, make sure you have:

- Node.js
- npm
- MongoDB Atlas
- Redis
- Judge0 (RapidAPI) API Key
- Google Gemini API Key
- Brevo Account (Email Service)

---

## 📁 Environment Variables

Create a **`.env`** file inside the **Backend** folder.

```env
PORT=5000

MONGODBURL=

JWT_SECRET=

# Redis
REDIS_URL=

# Judge0
Judge0=

# Google Gemini
AI_KEY=

# Email
BREVO_API_KEY=
SMTP_FROM=
SMTP_FROM_NAME=
```

---

# 🔧 Backend Setup

```bash
cd Backend

npm install

npm start
```

Backend will run on:

```text
http://localhost:5000
```

---

# 💻 Frontend Setup

```bash
cd Frontend

npm install

npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

# 📂 Project Structure

```text
CodeBlock/
│
├── Frontend/
│   ├── src/
│   │   ├── Pages/
│   │   ├── components/
│   │   └── App.jsx
│   │
├── Backend/
│   ├── src/
│   │   ├── Controller/
│   │   ├── models/
│   │   ├── route/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── index.js
│
├── package.json
└── README.md
```

---

# 🚀 Deployment

- ▲ Frontend deployed on **Vercel**
- 🚀 Backend can be deployed on **Render**, **Railway**, **AWS**, or any Node.js hosting platform

---

# 🌟 Key Features

- 🔐 JWT Authentication & OTP Password Reset
- 💻 Online Code Editor (Monaco)
- ⚡ Multi-language Code Execution
- 🏆 Live Coding Contest System
- 📈 Leaderboard & Submission Tracking
- 🤖 AI Coding Assistant
- 💬 Community Discussion Forum
- 👨‍💼 Admin Dashboard
- 🚀 Judge0 API Integration
- 🔴 Redis Caching & Rate Limiting

---

# 👨‍💻 Author

**Prashant Bhardwaj**

Full Stack Developer | MERN Stack Developer

---
