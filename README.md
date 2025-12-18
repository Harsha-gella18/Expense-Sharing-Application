# Expense Sharing App

A web application to manage and split expenses among groups. Create groups, add expenses, track balances, and settle payments with approval workflow.

## Features

- User authentication
- Create and join groups with join codes
- Add expenses with multiple split types (Equal/Exact/Percentage)
- Expense approval system
- Track balances and settlements
- Settlement approval workflow

## How to Run

### Backend

1. Navigate to Backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=7000
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:7000`

### Frontend

1. Navigate to Frontend folder:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

**Note:** Make sure the backend is running before starting the frontend.
