This repository contains a production-ready backend API that implements a unified Like System similar to platforms like YouTube, Twitter, and Instagram.

The API supports:

Liking & unliking videos

Liking & unliking tweets

Liking & unliking comments

Fetching liked videos for a user

All likes are handled using a single, centralized Like model, ensuring scalability and clean data design.

🛠 Tech Stack

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

REST API Architecture

✨ Features

Toggle like functionality (Like ↔ Unlike)

Single Like model for videos, tweets, and comments

MongoDB ObjectId validation

Proper error handling with custom ApiError

Standardized API responses using ApiResponse

Optimized queries with indexing

Frontend-friendly responses (isLiked state)

🧠 Key Concepts Used

MongoDB relations & population

RESTful API design

Middleware-based async error handling

Database indexing for performance

Clean and reusable backend logic

🎯 Ideal For

Backend developers

MERN stack learners

Interview preparation

Real-world API design reference
