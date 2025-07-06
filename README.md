# Magenta Bookstore - Admin Panel

A comprehensive online bookstore with a modern dark-themed admin panel for managing users, books, orders, and more.

## Features

### Frontend
- **Modern Dark Theme**: Beautiful dark UI with gradients and modern design
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **User Authentication**: Secure login and registration system
- **Shopping Cart**: Full cart functionality with real-time updates
- **Book Management**: Browse, search, and purchase books
- **Order Management**: Complete order tracking and history

### Admin Panel
- **Secure Admin Login**: Separate admin authentication system
- **Dashboard**: Real-time statistics and overview
- **User Management**: Add, edit, delete, and manage user accounts
- **Book Management**: Upload, edit, and manage book inventory
- **Order Management**: Track and update order statuses
- **Category Management**: Organize books by categories
- **Reports & Analytics**: Sales reports and user analytics
- **File Upload**: Support for book cover images and documents

## Admin Panel Features

### Dashboard
- Total users, books, orders, and revenue statistics
- Recent orders and user registrations
- Quick access to all admin functions

### User Management
- View all registered users
- Add new users with custom roles
- Edit user information and status
- Delete users with confirmation
- Search and filter users

### Book Management
- Upload new books with cover images
- Edit book details, prices, and stock
- Manage book categories and authors
- Bulk operations for inventory
- Image upload and management

### Order Management
- View all orders with customer details
- Update order status and payment status
- Order history and tracking
- Order analytics and reports

### Category Management
- Create and manage book categories
- Hierarchical category structure
- Category-based book organization

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=online_bookstore
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   FRONTEND_URL=http://localhost:5000
   ```

4. Set up the database:
   ```bash
   mysql -u your_username -p < ../database/schema.sql
   ```

5. Create an admin user:
   ```sql
   INSERT INTO users (username, email, password_hash, role) 
   VALUES ('admin', 'admin@magenta.com', '$2a$10$hashed_password', 'admin');
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open the frontend directory in your browser or use a local server
2. The admin panel is accessible at `pages/admin-login.html`
3. Use the admin credentials to log in

## API Endpoints

### Admin Routes
- `POST /api/admin/login` - Admin login
- `POST /api/admin/verify` - Verify admin token
- `GET /api/admin/dashboard` - Get dashboard statistics

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id` - Get user details

### Book Management
- `GET /api/books` - Get all books
- `POST /api/books` - Add new book (with file upload)
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/:id` - Get book details

### Order Management
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/summary` - Get order statistics

### Category Management
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/tree/structure` - Get category tree

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## File Structure

```
project/
├── frontend/
│   ├── css/
│   │   ├── style.css          # Main styles including admin panel
│   │   └── responsive.css     # Responsive design
│   ├── js/
│   │   ├── admin.js           # Admin panel functionality
│   │   ├── auth.js            # Authentication
│   │   ├── api.js             # API utilities
│   │   └── main.js            # Main functionality
│   ├── pages/
│   │   ├── admin-login.html   # Admin login page
│   │   ├── admin-dashboard.html # Main admin panel
│   │   └── ...                # Other pages
│   └── images/
├── backend/
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── routes/
│   │   ├── admin.js           # Admin routes
│   │   ├── users.js           # User management
│   │   ├── books.js           # Book management
│   │   ├── orders.js          # Order management
│   │   ├── categories.js      # Category management
│   │   └── auth.js            # Authentication routes
│   ├── uploads/               # File uploads directory
│   ├── package.json
│   └── server.js              # Main server file
└── database/
    └── schema.sql             # Database schema
```

## Usage

### Admin Login
1. Navigate to `pages/admin-login.html`
2. Enter admin credentials
3. Access the full admin dashboard

### Managing Users
1. Go to the Users tab in the admin panel
2. View all registered users
3. Add new users with the "Add New User" button
4. Edit or delete existing users

### Managing Books
1. Go to the Books tab
2. Upload new books with cover images
3. Edit book details, prices, and stock
4. Organize books by categories

### Managing Orders
1. Go to the Orders tab
2. View all customer orders
3. Update order status and payment status
4. Track order history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team. 