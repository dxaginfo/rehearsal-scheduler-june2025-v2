# Rehearsal Scheduler

A comprehensive web application designed to automate and streamline the process of scheduling band rehearsals, tracking attendance, sending reminders, and suggesting optimal rehearsal times based on member availability.

![Rehearsal Scheduler Banner](https://images.unsplash.com/photo-1508025801566-c289f8a3a6a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80)

## 🎵 Features

### Core Features
- **User Management**: Registration, authentication, and role-based access control
- **Band Management**: Create and manage multiple bands/music groups
- **Rehearsal Scheduling**: Set up one-time or recurring rehearsals with location details
- **Availability Tracking**: Members set their regular availability patterns
- **Attendance Management**: RSVP functionality and attendance history
- **Smart Notifications**: Automated reminders via email and push notifications
- **Optimal Time Suggestion**: Algorithm to find the best rehearsal times based on member availability
- **Resource Management**: Track equipment needs and venue bookings
- **Mobile Responsive**: Works seamlessly on all devices

### For Band Leaders
- Create and manage band profiles
- Invite members via email
- Schedule regular or one-off rehearsals
- View member availability at a glance
- Receive optimal rehearsal time suggestions
- Track attendance and follow up with absent members

### For Band Members
- Join multiple bands and manage all commitments
- Set weekly availability preferences
- RSVP to upcoming rehearsals
- Receive timely reminders
- View conflict detection with existing commitments

## 🚀 Technology Stack

### Frontend
- React.js with TypeScript
- Redux for state management
- Material-UI components
- FullCalendar.js for scheduling
- Progressive Web App capabilities

### Backend
- Node.js with Express
- JWT authentication
- Socket.io for real-time updates
- RESTful API architecture

### Database
- PostgreSQL
- Sequelize ORM
- Redis for caching and real-time features

### DevOps
- Docker containerization
- CI/CD with GitHub Actions
- AWS/Heroku deployment

## 📋 Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- PostgreSQL (v12 or later)
- Redis (optional, for enhanced performance)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/dxaginfo/rehearsal-scheduler-june2025-v2.git
   cd rehearsal-scheduler-june2025-v2
   ```

2. Install dependencies for both frontend and backend
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables
   ```bash
   # In the server directory, create a .env file
   cp .env.example .env
   
   # Edit the .env file with your database credentials and other settings
   ```

4. Set up the database
   ```bash
   # In the server directory
   npm run db:create
   npm run db:migrate
   npm run db:seed  # Optional: adds sample data
   ```

5. Start the development servers
   ```bash
   # Start the backend server
   cd server
   npm run dev
   
   # In a new terminal, start the frontend server
   cd client
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## 📱 Mobile App Installation

As a Progressive Web App, you can install Rehearsal Scheduler on your mobile device:

1. Open the application in your mobile browser (Chrome, Safari, etc.)
2. Navigate to the browser menu and select "Add to Home Screen"
3. Follow the prompts to install the application

## 🔐 Environment Configuration

The application requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (optional)
- `JWT_SECRET`: Secret key for JWT token generation
- `SENDGRID_API_KEY`: API key for email delivery
- `CLIENT_URL`: URL of the client application

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📦 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

1. Build the frontend
   ```bash
   cd client
   npm run build
   ```

2. Configure your production environment variables

3. Start the production server
   ```bash
   cd server
   npm start
   ```

## 📝 API Documentation

API documentation is available at `/api/docs` when the server is running in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@rehearsal-scheduler.com or join our Discord community.

## 🙏 Acknowledgements

- [FullCalendar.js](https://fullcalendar.io/)
- [Material-UI](https://material-ui.com/)
- [Socket.io](https://socket.io/)
- [Unsplash](https://unsplash.com/) for the banner image