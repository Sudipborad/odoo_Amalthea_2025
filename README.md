# Expense Reimbursement System 💰

A comprehensive multi-role expense reimbursement system built with React, Node.js, and MongoDB. Features OCR receipt processing, hierarchical approval workflows, and real-time analytics.

## 🚀 Features

### Core Functionality
- **Multi-Role System**: Employee, Manager, Finance, Director, CFO, Admin roles
- **OCR Receipt Processing**: Automatic data extraction from receipt images
- **Hierarchical Approval Workflow**: Configurable approval rules and sequences
- **Multi-Currency Support**: Automatic currency conversion
- **Company Isolation**: Multi-tenant architecture with data separation

### User Roles & Capabilities
- **Employee**: Submit expenses, view personal expense history
- **Manager**: Approve team expenses, submit expenses for team members
- **Finance/Director**: Review and approve expenses based on rules
- **CFO**: Full expense visibility and approval authority
- **Admin**: User management, approval rules, system configuration

### Advanced Features
- **Real-time Analytics**: Expense trends, category breakdowns, approval metrics
- **Dashboard Views**: Role-specific dashboards with relevant insights
- **Receipt Upload**: Image processing with automatic data extraction
- **Approval Rules**: Percentage-based, specific approver, and hybrid workflows
- **Export Functionality**: CSV/Excel export of expense data
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Tesseract.js** for OCR processing

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Context API** for state management
- **Axios** for API calls
- **Chart.js** for analytics visualization

## 📋 Prerequisites

Before setting up the application, ensure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**
- **npm** or **yarn**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Sudipborad/odoo_Amalthea_2025.git
cd odoo_Amalthea_2025
```

### 2. Backend Setup

#### Navigate to backend directory
```bash
cd backend
```

#### Install dependencies
```bash
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-reimbursement
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

#### Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if MongoDB is installed as service)
net start MongoDB

# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Start Backend Server
```bash
npm start
```
Backend will run on `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to frontend directory (new terminal)
```bash
cd frontend
```

#### Install dependencies
```bash
npm install
```

#### Start Frontend Development Server
```bash
npm start
```
Frontend will run on `http://localhost:3000`

## 🎯 Usage Guide

### Initial Setup

1. **Access the Application**: Open `http://localhost:3000`

2. **Admin Registration**: 
   - Click "Sign Up"
   - Select "Admin" role
   - Choose country (sets company currency)
   - Complete registration

3. **User Management**:
   - Login as Admin
   - Navigate to "User Management"
   - Add users with appropriate roles
   - Set manager relationships

### Expense Workflow

1. **Submit Expense** (Employee):
   - Upload receipt image
   - OCR automatically extracts data
   - Review and submit

2. **Approval Process**:
   - Managers approve team expenses
   - Higher roles can override approvals
   - CFO has universal approval authority

3. **Analytics & Reporting**:
   - View expense trends
   - Category-wise breakdowns
   - Export data for external analysis

## 🏗️ Project Structure

```
expense-reimbursement-system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth & validation
│   │   └── index.js        # Server entry point
│   ├── uploads/            # Receipt storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route components
│   │   ├── contexts/       # React contexts
│   │   ├── api/           # API integration
│   │   └── App.tsx        # Main app component
│   ├── public/
│   └── package.json
└── README.md
```

## 🔐 Authentication & Authorization

### Role Hierarchy (1-6 scale)
1. **Employee** - Basic expense submission
2. **Manager** - Team expense approval
3. **Finance** - Financial review and approval
4. **Director** - Senior management approval
5. **CFO** - Executive approval authority
6. **Admin** - System administration

### Security Features
- JWT-based authentication
- Role-based access control
- Company data isolation
- Secure file upload handling

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Expenses
- `POST /api/expenses` - Submit expense
- `GET /api/expenses/me` - Get user expenses
- `GET /api/expenses/team` - Get team expenses

### Approvals
- `GET /api/approvals/pending` - Get pending approvals
- `POST /api/approvals/:id` - Process approval

### Services
- `POST /api/services/ocr/upload` - OCR processing
- `GET /api/services/currency/convert` - Currency conversion

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   mongosh
   # If connection fails, start MongoDB service
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   # Or change PORT in .env file
   ```

3. **OCR Not Working**
   - Ensure image files are properly uploaded
   - Check file size limits (default: 5MB)
   - Verify Tesseract.js installation

4. **Frontend Build Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-production-jwt-secret
PORT=5000
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Deploy Options
- **Heroku**: Use provided Procfile
- **AWS**: EC2 with PM2 process manager
- **Docker**: Containerized deployment
- **Vercel/Netlify**: Frontend static hosting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Sudip Borad
- **Institution**: IIT Gandhinagar
- **Event**: Amalthea 2025

## 📞 Support

For support and queries:
- Create an issue on GitHub
- Email: support@expense-system.com

---

**Made with ❤️ for Amalthea 2025**