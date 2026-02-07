const express = require('express');
const router = express.Router();

let courses = [
    { id: 1, title: 'Introduction to React', instructor: 'John Doe', rating: 4.8, students: 120, image: 'https://placehold.co/600x400' },
    { id: 2, title: 'Advanced NodeJS', instructor: 'Jane Smith', rating: 4.9, students: 85, image: 'https://placehold.co/600x400' },
    { id: 3, title: 'UI/UX Design Principles', instructor: 'Bob Johnson', rating: 4.7, students: 200, image: 'https://placehold.co/600x400' }
];

router.get('/', (req, res) => {
    res.json(courses);
});

module.exports = router;
