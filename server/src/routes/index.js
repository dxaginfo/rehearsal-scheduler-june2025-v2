const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const bandRoutes = require('./band.routes');
const rehearsalRoutes = require('./rehearsal.routes');
const availabilityRoutes = require('./availability.routes');
const equipmentRoutes = require('./equipment.routes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API documentation endpoint (only in development)
if (process.env.NODE_ENV !== 'production') {
  router.get('/docs', (req, res) => {
    res.status(200).json({
      message: 'API Documentation',
      endpoints: {
        auth: {
          '/api/auth/register': 'Register a new user',
          '/api/auth/login': 'Login and get JWT token',
          '/api/auth/verify': 'Verify JWT token',
          '/api/auth/refresh': 'Refresh JWT token',
          '/api/auth/forgot-password': 'Request password reset',
          '/api/auth/reset-password': 'Reset password with token'
        },
        users: {
          '/api/users': 'GET: List users, POST: Create user',
          '/api/users/:id': 'GET: User details, PUT: Update user, DELETE: Delete user',
          '/api/users/:id/bands': 'GET: User\'s bands',
          '/api/users/:id/availability': 'GET: User\'s availability',
          '/api/users/:id/rehearsals': 'GET: User\'s rehearsals'
        },
        bands: {
          '/api/bands': 'GET: List bands, POST: Create band',
          '/api/bands/:id': 'GET: Band details, PUT: Update band, DELETE: Delete band',
          '/api/bands/:id/members': 'GET: Band members, POST: Add member',
          '/api/bands/:id/rehearsals': 'GET: Band rehearsals',
          '/api/bands/:id/equipment': 'GET: Band equipment'
        },
        rehearsals: {
          '/api/rehearsals': 'GET: List rehearsals, POST: Create rehearsal',
          '/api/rehearsals/:id': 'GET: Rehearsal details, PUT: Update rehearsal, DELETE: Delete rehearsal',
          '/api/rehearsals/:id/attendees': 'GET: Rehearsal attendees, POST: Add attendee',
          '/api/rehearsals/:id/equipment': 'GET: Rehearsal equipment'
        },
        availability: {
          '/api/availability': 'GET: List availability, POST: Create availability',
          '/api/availability/:id': 'GET: Availability details, PUT: Update availability, DELETE: Delete availability',
          '/api/availability/optimal': 'POST: Find optimal rehearsal times'
        },
        equipment: {
          '/api/equipment': 'GET: List equipment, POST: Create equipment',
          '/api/equipment/:id': 'GET: Equipment details, PUT: Update equipment, DELETE: Delete equipment'
        }
      }
    });
  });
}

// Register all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/bands', bandRoutes);
router.use('/rehearsals', rehearsalRoutes);
router.use('/availability', availabilityRoutes);
router.use('/equipment', equipmentRoutes);

module.exports = router;