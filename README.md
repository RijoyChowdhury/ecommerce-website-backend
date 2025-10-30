# Ecommerce Backend Project

An e-commerce web application backend built using **Node.js** for backend API and **MongoDB** for data storage. This project provides users with the ability to browse products, add them to cart, and place orders.

- Frontend Github: https://github.com/RijoyChowdhury/ecommerce-website-frontend/edit/main/README.md
- Backend Github: https://github.com/RijoyChowdhury/ecommerce-website-backend/edit/main/README.md

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

---

## Features

- User authentication (Register/Login)
- Product catalog with search and filter
- Shopping cart with add/remove/update items
- Secure checkout process
- Order history and user profile
- Admin dashboard to manage products and orders

---

## Tech Stack

- **Frontend:** [React](https://react.dev), [Redux](https://redux.js.org/)
- **Backend:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **Styling:** Material-UI
- **Authentication:** JWT (JSON Web Token)

---

## Installation

### Prerequisites

- Node.js >= 16.x
- npm >= 8.x
- MongoDB (local or Atlas)

### Clone the Repository

```bash
git clone https://github.com/yourusername/ecommerce-frontend-react.git
cd ecommerce-frontend-react
```

### Install Dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd ../server
npm install
```

### Environment Variables
Create .env files in both /client and /server as needed. For example, in /server/.env:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Running the Application

#### Backend (Node.js + Express)
```bash
cd server
npm run dev
```

#### Frontend (React)
```bash
cd client
npm start
```

By default:
- Frontend runs on http://localhost:3000
- Backend runs on http://localhost:5000

---

## Contributing
Contributions are welcome! To contribute, please:

- Fork the repository
- Create a new branch
- Make changes and commit
- Create a Pull Request
