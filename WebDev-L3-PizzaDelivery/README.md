# 🍕 Oasis Pizza — Full-Stack Pizza Delivery Application

A full-stack pizza delivery web application developed as part of the **Oasis Infobyte Web Development Internship — Level 3, Task 1**.

Oasis Pizza allows customers to browse pizzas, customize their orders, place orders, complete a test payment flow, and track order status. It also provides an admin dashboard for managing pizzas, customer orders, and inventory.

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login.
- Secure password hashing using bcryptjs.
- JWT-based authentication.
- Email verification.
- Forgot password and password reset.
- User profile management.
- Role-based access control for admin operations.

### 🍕 Pizza Menu & Customization
- Browse available pizzas.
- View pizza details, prices, and categories.
- Select pizza sizes.
- Customize pizzas with:
  - 5 Pizza Base options.
  - 5 Sauce options.
  - 5 Cheese options.
  - Multiple vegetable selections.
- Add customized pizzas to the shopping cart.

### 🛒 Cart & Order Management
- Add and remove items from the cart.
- Manage cart quantities.
- Review order details and pricing.
- Place customer orders.
- View personal order history.
- Track order status with automatic updates.

### 💳 Payment
- Mock payment flow for testing checkout.
- Inventory is deducted after successful payment.
- Failed payments do not deduct inventory.

> **Note:** The current application uses a mock payment implementation. It does not process real payments through Razorpay or another payment gateway.

### 📦 Inventory Management
- View inventory items and quantities.
- Add new inventory items.
- Update stock quantities manually.
- Validate ingredient availability.
- Automatically deduct ingredient stock after successful payment.
- Scheduled low-stock monitoring.

### 📧 Email Notifications
- Email verification.
- Password reset emails.
- Low-stock alerts for administrators.
- Order status update emails.
- Nodemailer with Ethereal Email for testing.

> **Note:** Ethereal Email is used as a testing service. Emails are available through preview links in the backend terminal and are not delivered to real customer inboxes.

### 🛠️ Admin Dashboard
- Create, update, and delete pizzas.
- View customer orders.
- Update order statuses.
- Manage inventory items and quantities.
- Monitor low-stock alerts.

## 🧰 Tech Stack

### Frontend
- React 19
- Vite 8
- React Router 7
- Axios
- CSS

### Backend
- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Nodemailer
- node-cron

## 📁 Project Structure

```text
Pizza Delivery Project - OasisInfobyte/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   │   └── payments/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js and npm.
- MongoDB Atlas account or a MongoDB database.
- Git.

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
API_URL=http://localhost:3000
ADMIN_EMAIL=your_admin_email
```

Start the backend:

```bash
node src/server.js
```

The backend API runs at:

`http://localhost:3000`

### 3. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## 🔗 API Routes

| Endpoint | Description |
|---|---|
| `/api/auth` | Authentication and user management |
| `/api/pizzas` | Pizza listing and management |
| `/api/orders` | Order creation and management |
| `/api/inventory` | Inventory management |
| `/api/payments` | Mock payment processing |

## 📦 Automated Inventory Monitoring

The backend uses `node-cron` to run scheduled inventory checks every 5 minutes.

When an inventory item reaches its low-stock threshold, the application can send an alert email to the configured administrator email address.

Inventory deduction takes place after successful payment.

## 🧪 Tested Functionality

- User registration and login.
- Email verification and password reset flows.
- Pizza browsing and customization.
- Cart operations and order creation.
- Successful and failed mock payments.
- Automatic inventory deduction.
- Manual inventory updates.
- Low-stock email alerts.
- Admin pizza and order management.
- Order status updates and tracking.

## 👨‍💻 Internship Details

- **Organization:** Oasis Infobyte
- **Track:** Web Development
- **Level:** Level 3
- **Task:** Task 1 — Pizza Delivery Full-Stack Application

## 🚀 Future Improvements

- Integrate a real payment gateway.
- Deploy the application to a production environment.
- Configure a production email provider.
- Implement WebSocket-based real-time order updates.

## 📄 License

Developed for educational and internship purposes as part of the Oasis Infobyte Web Development Internship.