# 🚀 Tester - Complete Project

An Intelligent Mock Test & Answer Evaluation System with full-stack implementation, designed to provide a seamless testing experience.

## ✨ Features

- 📝 Create and take mock tests
- 🤖 AI-powered answer evaluation
- 📊 Performance analytics
- 🔐 User authentication
- 📱 Responsive design
- 📦 Easy deployment

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI/ML**: Custom evaluation engine
- **Authentication**: JWT

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or Yarn
- MongoDB (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/johan-droid/tester-complete-project.git
   cd tester-complete-project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

## 📂 Project Structure

```
tester-complete-project/
├── backend/           # Backend server code
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── app.js         # Express app setup
├── frontend/          # Frontend code
│   ├── assets/        # Static assets
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   └── index.html     # Main HTML file
├── .gitignore
└── README.md
```

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tester
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## 📚 API Documentation

API documentation is available at `http://localhost:5000/api-docs` when the backend server is running.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project.
- Icons by [Feather Icons](https://feathericons.com/)
- Built with ❤️ by Johan
