# Campus Lost & Found Management System

A web-based Lost & Found system for Quest International University.
Built with Node.js, Express, MySQL, HTML5, CSS3, and JavaScript.

## Live Demo
https://campus-lost-and-found-production-cb6f.up.railway.app

## Features
- Report lost and found items
- View and filter items by category or keyword
- Claim items and track status
- Creator-only delete with session authentication
- XSS and SQL injection protection

## Tech Stack
- Backend: Node.js, Express.js
- Database: MySQL
- Frontend: HTML5, CSS3, JavaScript
- Security: express-session, parameterized queries, XSS escaping

## Setup Instructions

1. Clone the repository
   git clone https://github.com/kaixilim/campus-lost-and-found.git

2. Install dependencies
   npm install

3. Create your .env file (copy from .env.example)
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=lostfound_db
   SESSION_SECRET=yoursecret

4. Import the database
   mysql -u root -p < lostfound_db.sql

5. Start the server
   node server.js

6. Open browser at http://localhost:3000

## Default Test Account
A default user account is available for testing:

   Email    : user123@gmail.com
   Password : user123

## How to Use

### Register & Login
1. Open the website and you will be redirected to the Login page
2. If you don't have an account, click "Sign Up" to register
3. Enter your email and password (minimum 6 characters) to sign up
4. Log in with your registered email and password
5. You can also use the default test account above to log in directly

### Reporting a Lost Item
1. Click "Report Lost" in the navigation bar
2. Fill in all required fields — title, description, category, location, date and contact number
3. Optionally enter your email address for additional contact
4. Click "Submit Report" — the item will appear on the Lost Items page

### Reporting a Found Item
1. Click "Report Found" in the navigation bar
2. Fill in all required fields about the found item
3. Click "Submit Report" — the item will appear on the Found Items page

### Viewing Items
- Click "Lost Items" to view all items reported as lost
- Click "Found Items" to view all items reported as found
- Use the search bar to filter by title, description or location
- Use the category dropdown to filter by item type

### Claiming an Item
1. Browse the Lost or Found items list
2. Click the "Claim" button on the item you want to claim
3. The item status will update to "Claimed"

### Deleting a Report
- Only the user who submitted the report can delete it
- The Delete button is active (red) only for your own reports
- Other users will see a greyed-out Delete button they cannot click

### Logout
- Click the "Logout" button in the top right corner of the navigation bar

## Validation Rules

### Sign Up
- Email must be a valid email format (e.g. user@email.com)
- Password must be at least 6 characters
- Email must not already be registered

### Report Form
- Title, description, category, location, date and contact number are all required
- Contact number must be 10 to 15 digits (e.g. 0123456789)
- Contact email is optional — if provided, must be a valid email format
- Title must not exceed 255 characters
- Status must be either Lost or Found

### Security Validation (Server-Side)
- All inputs are sanitized to prevent XSS attacks
- All database queries use parameterized statements to prevent SQL injection
- Session authentication is required to access all pages
- Only the original reporter can delete their own report (403 Forbidden otherwise)

## Deployment
Live URL: https://campus-lost-and-found-production-cb6f.up.railway.app