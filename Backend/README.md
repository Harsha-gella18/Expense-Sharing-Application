# Expense Sharing Backend

A complete backend for an expense-sharing application (Splitwise-like) built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT)
- Group creation and management
- Join request approval system
- Expense creation with multiple split types (EQUAL, EXACT, PERCENTAGE)
- Expense approval workflow
- Balance tracking
- Settlement management

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-sharing
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

## Running

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Groups
- `POST /groups` - Create a new group
- `POST /groups/join` - Request to join a group
- `GET /groups` - Get user's groups
- `POST /groups/:groupId/join-requests/:requestId/respond` - Accept/reject join request

### Expenses
- `POST /groups/:groupId/expenses` - Create expense in a group
- `POST /expenses/:expenseId/respond` - Approve/reject expense
- `GET /groups/:groupId/expenses` - Get group expenses

### Balances
- `GET /groups/:groupId/balances` - Get group balances

### Settlements
- `POST /groups/:groupId/settle` - Create a settlement
