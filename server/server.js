const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const coursesRoutes = require('./routes/courses');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Routes
app.use('/api/courses', coursesRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_classroom', ({ roomId, username }) => {
        socket.join(roomId);
        console.log(`${username} joined room: ${roomId}`);
        io.to(roomId).emit('message', { user: 'System', text: `${username} has joined the chat.` });
    });

    socket.on('send_message', ({ roomId, user, text }) => {
        io.to(roomId).emit('message', { user, text });
    });

    // WebRTC Signaling
    socket.on('call-user', ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit('call-user', { signal: signalData, from, name });
    });

    socket.on('answer-call', (data) => {
        io.to(data.to).emit('call-accepted', data.signal);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
