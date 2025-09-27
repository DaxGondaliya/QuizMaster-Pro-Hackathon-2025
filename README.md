# 🎓 QuizMaster Pro - Online Quiz System

A comprehensive online quiz platform built with Express.js, featuring real-time timers, admin management, student participation, and competitive leaderboards.

## 🌟 Features

### For Students
- ✅ **Interactive Quiz Taking**: Take quizzes with real-time countdown timers
- ✅ **Progress Tracking**: View detailed history of all quiz attempts
- ✅ **Instant Results**: Get immediate feedback with score breakdown
- ✅ **Leaderboard Competition**: Compare performance with other students
- ✅ **User Authentication**: Secure student registration and login

### For Administrators
- ✅ **Quiz Management**: Create, edit, and manage quizzes
- ✅ **Question Builder**: Add multiple-choice questions with custom points
- ✅ **Student Monitoring**: View all student registrations and performance
- ✅ **Real-time Analytics**: Dashboard with comprehensive statistics
- ✅ **Quiz Analytics**: Detailed performance metrics per quiz

### Technical Features
- ✅ **Real-time Timer**: Socket.io powered countdown with auto-submission
- ✅ **Responsive Design**: Bootstrap-powered UI that works on all devices
- ✅ **Data Persistence**: MongoDB database for reliable data storage
- ✅ **Session Management**: Secure user sessions and authentication
- ✅ **RESTful API**: Well-structured backend API endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd "Web Wizard 2025"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env file with your configurations
   # MongoDB URI, session secrets, etc.
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or make sure your MongoDB Atlas connection is configured
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Or production mode
   npm start
   ```

6. **Access the application**
   - Main Application: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Student Dashboard: http://localhost:3000/student
   - Leaderboard: http://localhost:3000/leaderboard

## 📱 Usage Guide

### Admin Setup
1. Go to http://localhost:3000/admin
2. Login with default credentials:
   - **Email**: admin@quiz.com
   - **Password**: admin123
3. Create your first quiz using the "Create Quiz" section
4. Add questions with multiple choice options
5. Set quiz duration and activate it

### Student Experience
1. Visit http://localhost:3000
2. Register a new student account or login
3. Browse available quizzes on the student dashboard
4. Take quizzes with real-time timer
5. View results immediately after submission
6. Check your progress in the history section
7. Compare your performance on the leaderboard

## 🛠️ Technology Stack

### Backend
- **Express.js** - Web application framework
- **Node.js** - JavaScript runtime
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time communication
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-session** - Session management

### Frontend
- **HTML5** - Markup language
- **Bootstrap 5** - CSS framework
- **JavaScript (Vanilla)** - Client-side scripting
- **Font Awesome** - Icons
- **Socket.io Client** - Real-time client connection

## 📁 Project Structure

```
Web Wizard 2025/
├── models/
│   ├── User.js              # User model (students & admins)
│   ├── Quiz.js              # Quiz model with questions
│   └── QuizAttempt.js       # Quiz attempt tracking
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── admin.js             # Admin management routes
│   ├── quiz.js              # Quiz taking routes
│   └── leaderboard.js       # Leaderboard routes
├── public/
│   ├── index.html           # Landing page
│   ├── admin.html           # Admin dashboard
│   ├── student.html         # Student dashboard
│   ├── quiz.html            # Quiz taking interface
│   ├── leaderboard.html     # Leaderboard display
│   └── history.html         # Student quiz history
├── server.js                # Main application server
├── package.json             # Project dependencies
├── .env                     # Environment variables
└── README.md               # Project documentation
```

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/quiz_system
SESSION_SECRET=your-super-secret-session-key
JWT_SECRET=your-jwt-secret-key
ADMIN_EMAIL=admin@quiz.com
ADMIN_PASSWORD=admin123
```

### Default Admin Account
- **Email**: admin@quiz.com
- **Password**: admin123
- **Role**: Administrator

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Admin Routes
- `POST /api/admin/quiz` - Create new quiz
- `GET /api/admin/quizzes` - Get all quizzes
- `PUT /api/admin/quiz/:id` - Update quiz
- `DELETE /api/admin/quiz/:id` - Delete quiz
- `GET /api/admin/dashboard` - Get dashboard stats

### Quiz Routes
- `GET /api/quiz/available` - Get available quizzes
- `GET /api/quiz/:id` - Get quiz for taking
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `GET /api/quiz/history/user` - Get user's quiz history

### Leaderboard Routes
- `GET /api/leaderboard/overall` - Overall rankings
- `GET /api/leaderboard/recent` - Recent high scores
- `GET /api/leaderboard/top-performers` - Top performers (80%+)

## 🎮 Demo Data

The system comes with sample data structure. To get started quickly:

1. Create an admin account using the default credentials
2. Create sample quizzes with various topics
3. Register test student accounts
4. Take quizzes to populate the leaderboard

## 📷 Screenshots

*(Place screenshots of your application here)*

- Landing Page
- Admin Dashboard
- Quiz Creation Interface
- Student Dashboard
- Quiz Taking Interface with Timer
- Results Page
- Leaderboard
- Quiz History

## 🤝 Team Details

**Project**: Online Quiz System (QuizMaster Pro)
**Event**: Web Wizard Hackathon 2025
**Date**: September 27, 2025

### Team Members
- Add your team member names here
- Include roles and contributions
- Add contact information

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set environment variables for production
2. Ensure MongoDB is accessible
3. Run with PM2 or similar process manager:
```bash
npm install -g pm2
pm2 start server.js --name quiz-app
```

### Docker Deployment (Optional)
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill process using the port: `npx kill-port 3000`

3. **Session Issues**
   - Clear browser cookies
   - Restart the server
   - Check SESSION_SECRET in .env

4. **Timer Not Working**
   - Check Socket.io connection
   - Verify client-side JavaScript is loaded
   - Check browser console for errors

## 📈 Future Enhancements

- [ ] Multiple question types (True/False, Fill-in-blanks)
- [ ] Question categories and tags
- [ ] Quiz scheduling and time windows
- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] Mobile app development
- [ ] Integration with Learning Management Systems
- [ ] Proctoring features
- [ ] Bulk question import (CSV/Excel)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Session management
- Input validation and sanitization
- CORS configuration
- SQL injection prevention (using Mongoose)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Web Wizard Hackathon 2025 organizers
- Bootstrap team for the excellent CSS framework
- Socket.io team for real-time capabilities
- MongoDB team for the database platform
- Express.js community

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the troubleshooting section above

---

**Built with ❤️ for Web Wizard Hackathon 2025**