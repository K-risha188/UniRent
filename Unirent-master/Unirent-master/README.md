<div align="center">
  <h1>UniRent 🎓🛒</h1>
  <p><strong>A Premium Academic Rental Marketplace</strong></p>
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)
</div>

<br />

**UniRent** is a premium, peer-to-peer rental marketplace designed specifically for academic communities. It enables students to safely list, discover, and rent items to one another within a trusted campus ecosystem.

Built with a "Premium Academic" design aesthetic, UniRent offers a clean, secure, and sophisticated user experience tailored for modern university life.

---

## ✨ Key Features

- 🏪 **Student Stores:** Users can set up verified personal storefronts to list their rental items (textbooks, electronics, lab gear, etc.).
- 🔒 **Secure Bookings & Escrow:** A complete system for managing rental requests with simulated escrow holds for secure transactions.
- 💬 **Real-time Chat:** Built-in live messaging powered by Socket.io to facilitate instant communication between renters and owners.
- 📸 **Live Device Camera Integration:** Seamlessly snap photos of rental items using your device's native WebRTC camera directly from the web app.
- 🛡️ **Trust & Verification:** Multi-layered verification including Phone OTPs, Email OTPs, and Student ID verification to ensure maximum platform safety.
- 🤖 **AI Pricing Assistant:** Smart pricing suggestions that help students price their rental items fairly based on market averages.

---

## 💻 Tech Stack

### Frontend Client
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Routing:** React Router v7
- **State Management:** React Context API (Lightweight and native)

### Backend Server
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.io

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/K-risha188/UniRent.git
cd UniRent
```

### 2. Set up the Backend
```bash
cd server
npm install

# Start the development server (runs on http://localhost:5000)
npm start
```
*(Make sure to set up your `.env` variables in the `server` directory for MongoDB and JWT Secret!)*

### 3. Set up the Frontend
Open a new terminal window:
```bash
cd client
npm install

# Start the Vite development server
npm run dev
```

### 4. Visit the App
Open your browser and navigate to the localhost URL provided by Vite (usually `http://localhost:5173`).

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

## 📄 License
This project is licensed under the MIT License - see the `LICENSE.md` file for details.

<br />
<div align="center">
  <sub>Built with ❤️ for Students.</sub>
</div>
