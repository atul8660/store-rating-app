# Store Rating Web Application

A full-stack web application where users can view stores and submit ratings from 1 to 5.

## Tech Stack

- Frontend: React.js, Vite, Axios
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JWT + bcrypt

## User Roles

### Admin
- View dashboard statistics
- Add users, admins, store owners and stores
- Search, filter and sort users and stores
- View user details and store ratings

### Normal User
- Register and login
- Search stores by name and address
- View overall and personal ratings
- Submit and modify ratings
- Change password

### Store Owner
- Login and view own store
- View average rating and total ratings
- View users who rated the store
- Sort ratings
- Change password

## Main Features

- JWT-based authentication
- Role-based authorization
- Password hashing using bcrypt
- Store rating system (1–5)
- Search, filtering and sorting
- Input validation
- MySQL database integration
- Protected routes

## Project Structure

```text
store-rating-app/
├── backend/
├── frontend/
├── README.md
└── .gitignore
