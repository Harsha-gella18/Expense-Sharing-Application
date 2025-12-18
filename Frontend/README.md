# Expense Sharing App - Frontend

A modern React + Vite frontend for the Expense Sharing application.

## Features

- 🔐 **Authentication**: User signup and login
- 👥 **Group Management**: Create groups, join with codes, manage members
- 💰 **Expense Tracking**: Add expenses, split equally/exact/percentage
- ✅ **Expense Approval**: Accept or reject expense splits
- 📊 **Balance Tracking**: View who owes whom
- 💸 **Settlements**: Mark balances as settled

## Tech Stack

- React 18
- Vite
- React Router v6
- Axios for API calls
- React Toastify for notifications
- CSS3 with CSS Variables

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Backend Connection

The frontend is configured to proxy API requests to `http://localhost:5000`. Make sure your backend server is running on port 5000.

## Project Structure

```
Frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Layout.jsx
│   │   ├── CreateGroupModal.jsx
│   │   ├── JoinGroupModal.jsx
│   │   ├── CreateExpenseModal.jsx
│   │   ├── ExpensesList.jsx
│   │   ├── BalancesList.jsx
│   │   └── SettleBalanceModal.jsx
│   ├── context/           # React Context
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Groups.jsx
│   │   └── GroupDetail.jsx
│   ├── services/          # API services
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints Used

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login user

### Groups
- `GET /groups` - Get user's groups
- `POST /groups` - Create new group
- `POST /groups/join` - Request to join group
- `POST /groups/:groupId/join-requests/:requestId/respond` - Accept/reject join request

### Expenses
- `GET /groups/:groupId/expenses` - Get group expenses
- `POST /groups/:groupId/expenses` - Create expense
- `POST /expenses/:expenseId/respond` - Accept/reject expense

### Balances
- `GET /groups/:groupId/balances` - Get group balances
- `POST /groups/:groupId/settle` - Settle balance

## Features Breakdown

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Protected routes with redirect
- Auto-logout on token expiry

### Group Management
- Create groups with auto-generated join codes
- Join groups using 6-digit codes
- View group members
- Real-time member list

### Expense Management
- Three split types: Equal, Exact, Percentage
- Select participants for each expense
- Expense approval workflow
- View expense history

### Balance Management
- Automatic balance calculation
- Separate views for "You Owe" and "You Are Owed"
- Settlement tracking
- Balance validation

## Styling

The app uses a custom CSS design system with:
- CSS Variables for theming
- Responsive design
- Mobile-first approach
- Smooth animations
- Accessible UI components

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
