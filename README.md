# 🛒 E-Commerce Platform - Full Stack Application

A complete, production-ready e-commerce platform built with Node.js, Express, MySQL, and vanilla JavaScript. Features include user authentication, product management, shopping cart, order processing, and admin dashboard.

![E-Commerce Platform](frontend/images/preview.png)

## ✨ Features

### User Features
- 🔐 **Authentication**: Register, login with JWT tokens
- 🛍️ **Product Browsing**: Browse products by category, search, filter by price/rating
- 📦 **Product Details**: Detailed product pages with images, ratings, reviews
- 🛒 **Shopping Cart**: Add/remove items, update quantities
- ❤️ **Wishlist**: Save favorite products
- 💳 **Checkout**: Multiple payment options (COD, Stripe, PayPal)
- 📋 **Order History**: Track orders and view order details
- 👤 **Profile Management**: Update profile and manage addresses

### Admin Features
- 📊 **Dashboard**: Sales analytics, revenue tracking, user statistics
- 📦 **Product Management**: CRUD operations for products
- 🏷️ **Category Management**: Manage product categories
- 👥 **User Management**: View and manage users
- 📦 **Order Management**: Update order status, tracking numbers
- 🎟️ **Coupon Management**: Create and manage discount coupons

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Payment**: Stripe API integration

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables
- **JavaScript**: Vanilla JS (ES6+)
- **Icons**: Font Awesome 6

## 📁 Project Structure

```
ecommerce-platform/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product CRUD
│   │   ├── cartController.js    # Cart management
│   │   ├── orderController.js   # Order processing
│   │   └── adminController.js   # Admin operations
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── products.js          # Product routes
│   │   ├── cart.js              # Cart routes
│   │   ├── orders.js            # Order routes
│   │   └── admin.js             # Admin routes
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   └── server.js                # Entry point
├── frontend/
│   ├── css/
│   │   └── style.css            # Main stylesheet
│   ├── js/
│   │   ├── config.js            # API configuration
│   │   ├── api.js               # API helper functions
│   │   ├── auth.js              # Auth manager
│   │   └── main.js              # Main app logic
│   ├── images/                  # Static images
│   ├── index.html               # Homepage
│   ├── login.html               # Login/Register
│   ├── cart.html                # Shopping cart
│   ├── checkout.html            # Checkout page
│   └── account.html             # User account
└── database/
    └── schema.sql               # Database schema
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce-platform
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE ecommerce_db;

# Import schema
mysql -u root -p ecommerce_db < database/schema.sql
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=ecommerce_db
# JWT_SECRET=your_secret_key

# Start server
npm run dev
```

The backend server will run on `http://localhost:5000`

### 4. Frontend Setup
```bash
cd frontend

# Open with a local server (e.g., Live Server in VS Code)
# Or use a simple HTTP server:
npx http-server -p 3000
```

The frontend will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get all categories
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user cart (Protected)
- `POST /api/cart` - Add to cart (Protected)
- `PUT /api/cart/:id` - Update cart item (Protected)
- `DELETE /api/cart/:id` - Remove from cart (Protected)
- `DELETE /api/cart` - Clear cart (Protected)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders` - Get user orders (Protected)
- `GET /api/orders/:id` - Get single order (Protected)
- `GET /api/admin/orders` - Get all orders (Admin)
- `PUT /api/admin/orders/:id` - Update order status (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats (Admin)
- `GET /api/admin/users` - Get all users (Admin)
- `PUT /api/admin/users/:id` - Update user role (Admin)
- `DELETE /api/admin/users/:id` - Delete user (Admin)

## 🗄️ Database Schema

### Tables
- **users**: User accounts and authentication
- **products**: Product catalog
- **categories**: Product categories
- **cart**: Shopping cart items
- **orders**: Order records
- **order_items**: Order line items
- **addresses**: User shipping addresses
- **wishlist**: User wishlists
- **coupons**: Discount coupons

## 🔐 Default Credentials

### Admin Account
- Email: `admin@eshop.com`
- Password: `admin123`

### Test User
- Email: `jonathan@example.com`
- Password: `user123`

**Note**: Change these credentials in production!

## 🎨 Design Features

- **Modern UI**: Clean, professional design
- **Responsive**: Works on desktop, tablet, and mobile
- **Animations**: Smooth transitions and hover effects
- **Toast Notifications**: User-friendly feedback
- **Loading States**: Spinners for async operations
- **Form Validation**: Client and server-side validation

## 🚀 Deployment

### Backend (Node.js)
Deploy to platforms like:
- Heroku
- DigitalOcean
- AWS EC2
- Google Cloud Platform

### Frontend
Deploy to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Database
Use managed MySQL services:
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Databases

## 📝 Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ecommerce_db

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_stripe_public_key

# PayPal (Optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
```

## 🧪 Testing

### Test the API
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Get products
curl http://localhost:5000/api/products
```

## 🔧 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### CORS Errors
- Backend CORS is enabled for all origins in development
- Configure specific origins for production

### JWT Errors
- Ensure JWT_SECRET is set in `.env`
- Check token expiration settings

## 📚 Future Enhancements

- [ ] Product reviews and ratings
- [ ] Advanced search with Elasticsearch
- [ ] Email notifications
- [ ] Social media authentication
- [ ] Real-time inventory updates
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for learning and portfolio purposes.

## 🙏 Acknowledgments

- Font Awesome for icons
- Design inspiration from modern e-commerce platforms
- Community tutorials and documentation

---

**Happy Coding! 🚀**
