# Online Book Store Management System

A comprehensive web-based online book store built with Java, HTML, CSS, and PHP.

## Features

### For Administrators
- Add, edit, and delete books
- Manage customer accounts
- Track orders and inventory
- Generate sales reports and analytics
- Manage book categories and authors
- Process refunds and returns
- Manage discounts and promotions

### For Customers
- Browse and search books
- Add books to shopping cart
- Place orders online
- Track order status
- View purchase history
- Write book reviews and ratings
- Update profile information
- Wishlist management

### System Features
- User authentication and authorization
- Real-time inventory tracking
- Email notifications for orders
- Advanced search with filters
- Responsive design for all devices
- Secure payment processing
- Order tracking system
- Review and rating system
- Discount and coupon system
- Inventory alerts
- Sales analytics dashboard

## Technology Stack

- **Backend**: Java (Spring Boot)
- **Frontend**: HTML5, CSS3, JavaScript
- **Server-side**: PHP
- **Database**: MySQL
- **Build Tool**: Maven

## Project Structure

```
online-bookstore/
├── backend/                 # Java Spring Boot application
│   ├── src/
│   ├── pom.xml
│   └── application.properties
├── frontend/               # HTML, CSS, JavaScript files
│   ├── css/
│   ├── js/
│   ├── images/
│   └── pages/
├── php/                   # PHP scripts for dynamic content
├── database/              # SQL scripts and database schema
├── docs/                  # Documentation
└── README.md
```

## Installation and Setup

1. **Prerequisites**
   - Java 11 or higher
   - Maven 3.6+
   - MySQL 8.0+
   - PHP 7.4+
   - Web server (Apache/Nginx)

2. **Database Setup**
   ```sql
   CREATE DATABASE online_bookstore;
   USE online_bookstore;
   ```

3. **Backend Setup**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

4. **Frontend Setup**
   - Copy frontend files to web server directory
   - Configure PHP settings
   - Update database connection in PHP files

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Add new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book
- `GET /api/books/search` - Search books
- `GET /api/books/category/{category}` - Get books by category

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Register new customer
- `PUT /api/customers/{id}` - Update customer
- `POST /api/customers/login` - Customer login

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status` - Update order status
- `GET /api/orders/customer/{customerId}` - Get customer orders

### Cart
- `GET /api/cart/{customerId}` - Get customer cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/{itemId}` - Remove item from cart
- `PUT /api/cart/update` - Update cart item quantity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. 