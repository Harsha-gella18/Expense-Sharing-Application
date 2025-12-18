# Expense Sharing Application

A full-stack expense sharing application built with React, Vite, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm

### Installation & Running

1. **Start Backend** (Terminal 1):
   ```bash
   cd Backend
   npm install
   npm start
   ```
   Backend runs on: http://localhost:5000

2. **Start Frontend** (Terminal 2):
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
   Frontend runs on: http://localhost:3000

### Windows Quick Start
Double-click these files:
- `start-backend.bat` - Starts backend server
- `start-frontend.bat` - Starts frontend server

## 📚 Documentation

- **[Complete Setup Guide](./SETUP_GUIDE.md)** - Detailed installation and setup
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Frontend README](./Frontend/README.md)** - Frontend specific docs
- **[Backend README](./Backend/README.md)** - Backend specific docs

## ✨ Features

- 🔐 User authentication (JWT)
- 👥 Create and join groups
- 💰 Add and split expenses (Equal/Exact/Percentage)
- ✅ Expense approval workflow
- 📊 Balance tracking
- 💸 Settle balances

## 🛠 Tech Stack

**Frontend:** React 18, Vite, React Router, Axios
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT
**Authentication:** JWT with bcrypt

## 📁 Project Structure

```
venkyproject/
├── Backend/          # Node.js + Express API
├── Frontend/         # React + Vite application
├── API_DOCUMENTATION.md
├── SETUP_GUIDE.md
└── README.md
```

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-sharing
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

### Frontend (vite.config.js)
Proxy configured to forward `/api` requests to `http://localhost:5000`

## 📖 Usage

1. **Sign up** - Create a new account
2. **Create a group** - Get a 6-digit join code
3. **Add members** - Share the code with friends
4. **Add expenses** - Track who paid what
5. **Approve expenses** - All participants must approve
6. **View balances** - See who owes whom
7. **Settle up** - Mark payments as settled

## 🎯 API Endpoints

### Authentication
- `POST /auth/signup` - Register
- `POST /auth/login` - Login

### Groups
- `GET /groups` - Get user's groups
- `POST /groups` - Create group
- `POST /groups/join` - Join group

### Expenses
- `GET /groups/:groupId/expenses` - Get expenses
- `POST /groups/:groupId/expenses` - Create expense
- `POST /expenses/:expenseId/respond` - Accept/reject

### Balances
- `GET /groups/:groupId/balances` - Get balances
- `POST /groups/:groupId/settle` - Settle balance

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details.

## 🐛 Troubleshooting

**MongoDB not starting?**
```bash
# Windows
net start MongoDB

# macOS/Linux
brew services start mongodb-community
```

**Port already in use?**
Change ports in:
- Backend: `.env` → `PORT=5000`
- Frontend: `vite.config.js` → `server.port`

**CORS issues?**
- Backend has CORS enabled
- Frontend uses proxy in vite.config.js

## 🔒 Security

⚠️ Before production:
- Change JWT_SECRET
- Use HTTPS
- Enable MongoDB auth
- Add rate limiting
- Validate all inputs

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

**Built with ❤️ using React, Vite, Node.js, and MongoDB**
