const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const coursesRoutes = require('./routes/courses');

const authRoutes = require('./routes/auth');
const { router: gamificationRoutes } = require('./routes/gamification');
const reviewsRoutes = require('./routes/reviews');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Routes
app.use('/api/courses', coursesRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/gamification', gamificationRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/enrollments', require('./routes/enrollments'));

app.get('/', (req, res) => {
    res.send('Server is running');
});



// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
