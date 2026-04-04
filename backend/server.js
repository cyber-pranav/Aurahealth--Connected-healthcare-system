const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// CORS — allow localhost in dev, Cloud Run frontend URL in prod
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for hackathon — tighten in prod
  },
  credentials: true
}));
app.use(express.json());

// Health check for Cloud Run
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes imports
const authRoutes = require('./routes/authRoutes');
const clinicRoutes = require('./routes/clinicRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/clinic', clinicRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ name: 'Aura Health Systems API', version: '1.0.0', status: 'running' });
});

// Socket.io for Real-time chat & notifications
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    // data = { roomId, message, senderId, timestamp }
    socket.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthcare_mvp';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });
