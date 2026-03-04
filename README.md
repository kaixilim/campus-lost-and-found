# Campus Lost & Found Management System

A web-based Lost & Found system for Quest International University.
Built with Node.js, Express, MySQL, HTML5, CSS3, and JavaScript.

## Features
- Report lost and found items
- View and filter items by category or keyword
- Claim items and track status
- Creator-only delete with session authentication
- XSS and SQL injection protection

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

## Tech Stack
- Backend: Node.js, Express.js
- Database: MySQL
- Frontend: HTML5, CSS3, JavaScript
- Security: express-session, parameterized queries, XSS escaping