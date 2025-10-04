# Expense Reimbursement System Frontend

A responsive React TypeScript frontend for the multi-role expense reimbursement system.

## Features

- **Responsive Design**: Built with Tailwind CSS for mobile-first responsive design
- **Role-Based Access**: Different dashboards for Admin, Manager, and Employee roles
- **Modern UI**: Clean, professional interface matching the design specifications
- **Real-time Updates**: Dynamic data fetching and state management
- **File Upload**: Receipt upload functionality with drag-and-drop interface

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Pages

### Authentication
- **Login**: Secure login with demo credentials
- **Signup**: Company registration with admin user creation

### Employee Dashboard
- Personal expense statistics
- Quick access to submit and view expenses

### Manager Dashboard
- Team approval statistics
- Pending approvals overview

### Admin Dashboard
- Company-wide expense overview
- User and approval management

### Expense Management
- **Submit Expense**: Form with file upload and currency conversion
- **My Expenses**: Personal expense history with approval status
- **Approvals**: Manager/Admin approval interface
- **Team Expenses**: Overview of all team member expenses

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Collapsible navigation on mobile devices
- Responsive tables with horizontal scrolling
- Touch-friendly interface elements
- Optimized layouts for tablets and desktops

## API Integration

The frontend integrates with the backend API for:
- User authentication and authorization
- Expense submission and management
- Approval workflow processing
- Real-time data updates

## Demo Credentials

- **Admin**: admin@demo.com / admin123
- **Manager**: manager@demo.com / manager123  
- **Employee**: employee@demo.com / employee123