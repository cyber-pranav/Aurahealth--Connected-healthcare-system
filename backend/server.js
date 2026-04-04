const express = require('express');
const mongoose = require('./mock-db');

const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const HealthEvent = require('./models/HealthEvent');
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
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for hackathon
  },
  credentials: true
}));
app.use(express.json());

// Health check for Cloud Run
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes imports
const authRoutes = require('./routes/authRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const carePlanRoutes = require('./routes/carePlanRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/care-plans', carePlanRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ name: 'Aura Health Systems API', version: '2.0.0', status: 'running' });
});

// ============= Socket.io: Unified Communication Hub =============
// Track online users and active video sessions
const onlineUsers = new Map(); // socketId -> { userId, name, role }
const videoRooms = new Map();  // roomId -> { participants: [], startedAt }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register user for notifications
  socket.on('register_user', (userData) => {
    onlineUsers.set(socket.id, { ...userData, socketId: socket.id });
    socket.join(`user_${userData.userId}`); // Personal notification room
    console.log(`User registered: ${userData.name} (${userData.userId})`);
  });

  // ---- Chat functionality ----
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const msg = new Message({
        roomId: data.roomId,
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.message,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
      });
      await msg.save();
      socket.to(data.roomId).emit('receive_message', data);
    } catch (err) {
      console.error('Failed to save message:', err.message);
      socket.to(data.roomId).emit('receive_message', data);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', { senderId: data.senderId, senderName: data.senderName });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.roomId).emit('user_stop_typing', { senderId: data.senderId });
  });

  // ---- Video Consultation Signaling ----
  socket.on('video_join', (data) => {
    const { roomId, userId, userName } = data;
    socket.join(`video_${roomId}`);
    
    if (!videoRooms.has(roomId)) {
      videoRooms.set(roomId, { participants: [], startedAt: new Date() });
    }
    const room = videoRooms.get(roomId);
    room.participants.push({ userId, userName, socketId: socket.id });
    
    // Notify others in the room
    socket.to(`video_${roomId}`).emit('video_user_joined', { userId, userName, socketId: socket.id });
    
    // Send existing participants to the joiner
    const others = room.participants.filter(p => p.socketId !== socket.id);
    socket.emit('video_existing_participants', others);
    
    console.log(`Video: ${userName} joined room ${roomId}`);
  });

  socket.on('video_offer', (data) => {
    socket.to(data.target).emit('video_offer', {
      sdp: data.sdp,
      caller: data.caller,
      callerName: data.callerName
    });
  });

  socket.on('video_answer', (data) => {
    socket.to(data.target).emit('video_answer', {
      sdp: data.sdp,
      answerer: data.answerer
    });
  });

  socket.on('video_ice_candidate', (data) => {
    socket.to(data.target).emit('video_ice_candidate', {
      candidate: data.candidate,
      from: data.from
    });
  });

  socket.on('video_leave', (data) => {
    const { roomId, userId } = data;
    socket.leave(`video_${roomId}`);
    socket.to(`video_${roomId}`).emit('video_user_left', { userId });
    
    if (videoRooms.has(roomId)) {
      const room = videoRooms.get(roomId);
      room.participants = room.participants.filter(p => p.userId !== userId);
      if (room.participants.length === 0) videoRooms.delete(roomId);
    }
  });

  // Video chat messages (in-call chat)
  socket.on('video_chat_message', (data) => {
    socket.to(`video_${data.roomId}`).emit('video_chat_message', data);
  });

  // ---- Real-time notifications ----
  socket.on('send_notification', async (data) => {
    try {
      const n = new Notification(data);
      await n.save();
      io.to(`user_${data.userId}`).emit('new_notification', data);
    } catch (err) {
      console.error('Notification error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    // Clean up video rooms
    for (const [roomId, room] of videoRooms.entries()) {
      const participant = room.participants.find(p => p.socketId === socket.id);
      if (participant) {
        room.participants = room.participants.filter(p => p.socketId !== socket.id);
        socket.to(`video_${roomId}`).emit('video_user_left', { userId: participant.userId });
        if (room.participants.length === 0) videoRooms.delete(roomId);
      }
    }
    onlineUsers.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

console.log('Connected to Local JSON DB (Mock)');
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
