const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

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

// Mock Data
let courses = [
    { id: 1, title: 'Introduction to React', instructor: 'John Doe', rating: 4.8, students: 120, image: 'https://placehold.co/600x400' },
    { id: 2, title: 'Advanced NodeJS', instructor: 'Jane Smith', rating: 4.9, students: 85, image: 'https://placehold.co/600x400' },
    { id: 3, title: 'UI/UX Design Principles', instructor: 'Bob Johnson', rating: 4.7, students: 200, image: 'https://placehold.co/600x400' }
];

let users = [];

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

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/api/courses', (req, res) => {
    res.json(courses);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
