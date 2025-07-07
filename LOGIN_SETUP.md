# Login Setup Guide - Magenta Bookstore

This guide will help you set up and test the login functionality for both regular users and admin users.

## Quick Setup

### 1. Database Setup
First, make sure your MySQL database is running and create the database:

```sql
CREATE DATABASE online_bookstore;
USE online_bookstore;
```

Then import the schema:
```bash
mysql -u your_username -p online_bookstore < database/schema.sql
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=online_bookstore
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
```

### 4. Test Setup
Run the test setup script to create test users and verify everything works:

```bash
npm run test-setup
```

This will create:
- Admin user: `admin@magenta.com` / `admin123`
- Test customer: `user@magenta.com` / `password123`

### 5. Start the Backend
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Testing the Login

### Regular User Login
1. Open `frontend/pages/login.html` in your browser
2. Use the test customer credentials:
   - Email: `user@magenta.com`
   - Password: `password123`
3. Click "Sign in"
4. You should be redirected to the home page

### Admin Login
1. Open `frontend/pages/admin-login.html` in your browser
2. Use the admin credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Sign in"
4. You should be redirected to the admin dashboard

### User Registration
1. Open `frontend/pages/register.html` in your browser
2. Fill in the registration form
3. Click "Create account"
4. You should be redirected to the home page after successful registration

## Features

### ✅ Working Features
- **User Login**: Email/password authentication
- **User Registration**: New user signup with validation
- **Admin Login**: Separate admin authentication
- **Password Toggle**: Show/hide password functionality
- **Form Validation**: Client-side validation
- **Notifications**: Success/error messages
- **Loading States**: Loading spinners during requests
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Secure password storage with bcrypt

### 🔧 Technical Details
- **Backend**: Node.js/Express with MySQL
- **Frontend**: Vanilla JavaScript with modern ES6+
- **Authentication**: JWT tokens with 24-hour expiry
- **Security**: Password hashing, input validation, CORS protection
- **Database**: MySQL with proper user and customer tables

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your MySQL credentials in `.env`
   - Ensure MySQL is running
   - Verify the database exists

2. **CORS Errors**
   - Make sure the frontend URL in `.env` matches your setup
   - Check that the backend is running on port 3000

3. **Login Fails**
   - Verify the test users were created with `npm run test-setup`
   - Check the browser console for error messages
   - Ensure the backend is running

4. **Registration Fails**
   - Check that all required fields are filled
   - Ensure password meets requirements (8+ characters)
   - Verify email format is valid

### Debug Mode
To see detailed error messages, set in `.env`:
```env
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Verify JWT token

### Admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/verify` - Verify admin token
- `GET /api/admin/dashboard` - Admin dashboard data

## Next Steps

After successful login setup, you can:
1. Test the admin panel functionality
2. Add more user management features
3. Implement book management
4. Add order processing
5. Set up email notifications

For more information, see the main README.md file. 