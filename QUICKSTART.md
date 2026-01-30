# 🚀 Quick Start Guide

Get your e-commerce platform up and running in 5 minutes!

## Step 1: Database Setup (2 minutes)

1. Open MySQL:
```bash
mysql -u root -p
```

2. Create and setup database:
```sql
CREATE DATABASE ecommerce_db;
USE ecommerce_db;
SOURCE database/schema.sql;
EXIT;
```

## Step 2: Backend Setup (1 minute)

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
copy .env.example .env
```

4. Edit `.env` and update these values:
```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=any_random_secret_string_here
```

5. Start the server:
```bash
npm run dev
```

✅ Backend running at `http://localhost:5000`

## Step 3: Frontend Setup (1 minute)

1. Open a new terminal and navigate to frontend:
```bash
cd frontend
```

2. Start a local server:

**Option A - Using VS Code:**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

**Option B - Using Node:**
```bash
npx http-server -p 3000
```

**Option C - Using Python:**
```bash
python -m http.server 3000
```

✅ Frontend running at `http://localhost:3000`

## Step 4: Test the Application (1 minute)

### Test Admin Access
1. Go to `http://localhost:3000/login.html`
2. Login with:
   - Email: `admin@eshop.com`
   - Password: `admin123`

### Test User Features
1. Register a new account or login with:
   - Email: `jonathan@example.com`
   - Password: `user123`
2. Browse products
3. Add items to cart
4. Complete checkout

## 🎉 You're Done!

Your e-commerce platform is now running!

## 📋 What's Included

- ✅ 4 Sample Products
- ✅ 4 Product Categories
- ✅ Admin Account
- ✅ Test User Account
- ✅ Sample Cart Items
- ✅ Discount Coupons

## 🔧 Common Issues

### Database Connection Failed
- Make sure MySQL is running
- Check your password in `.env`
- Verify database name is `ecommerce_db`

### Port Already in Use
- Backend: Change `PORT=5000` to another port in `.env`
- Frontend: Use a different port number

### CORS Errors
- Make sure backend is running on port 5000
- Check `API_CONFIG.BASE_URL` in `frontend/js/config.js`

## 📚 Next Steps

1. **Customize Products**: Add your own products via admin panel
2. **Update Branding**: Change logo and colors in CSS
3. **Configure Payments**: Add Stripe/PayPal keys in `.env`
4. **Deploy**: Follow deployment guide in README.md

## 🆘 Need Help?

- Check the full README.md for detailed documentation
- Review API endpoints in README.md
- Check browser console for errors
- Verify backend logs in terminal

---

**Happy Building! 🚀**
