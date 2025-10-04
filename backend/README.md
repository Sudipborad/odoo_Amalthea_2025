# Expense Reimbursement System Backend

A complete multi-role expense reimbursement system with Admin, Manager, and Employee features.

## Features

- **Authentication**: JWT-based auth with role-based access control
- **Multi-role System**: Admin, Manager, Employee roles
- **Expense Management**: Submit, approve, reject expenses
- **Currency Conversion**: Auto-convert to company base currency
- **OCR Integration**: Receipt processing (stub implementation)
- **Approval Workflow**: Multi-level approval with conditional rules
- **External APIs**: Countries/currencies and exchange rates

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-reimbursement
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

3. Start MongoDB service

4. Run the application:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create company + admin user
- `POST /auth/login` - JWT login

### Users (Admin Only)
- `POST /users` - Create employee/manager
- `PUT /users/:id/role` - Change role
- `PUT /users/:id/manager` - Assign manager

### Expenses
- `POST /expenses` - Submit expense
- `GET /expenses/me` - Get own expenses
- `GET /expenses` - Admin: view all expenses

### Approvals
- `POST /approvals/:expenseId` - Approve/reject expense
- `GET /approvals/pending` - View pending approvals
- `POST /approvals/rules` - Define approval rules
- `GET /approvals/rules` - Fetch approval rules
- `PUT /approvals/:expenseId/override` - Admin override

### Services
- `GET /currency/convert` - Convert currency
- `POST /ocr/upload` - OCR receipt processing

## Database Schema

The system uses MongoDB with the following collections:
- Users (with roles and company relationships)
- Companies (with country and currency)
- Expenses (with approval workflow)
- ApprovalRules (conditional approval logic)

## Architecture

- **Models**: Mongoose schemas for data structure
- **Controllers**: Business logic handlers
- **Routes**: API endpoint definitions
- **Middleware**: Authentication and authorization
- **Services**: External API integrations and workflow logic