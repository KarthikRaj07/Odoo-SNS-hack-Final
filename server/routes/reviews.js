
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/reviews/:courseId - Get reviews for a course
router.get('/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, user:users(full_name, avatar_url)')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST /api/reviews - Add a review
router.post('/', verifyToken, async (req, res) => {
    const { courseId, rating, comment } = req.body;
    const { uid } = req.user;

    if (!courseId || !rating) return res.status(400).json({ error: 'Missing required fields' });

    try {
        // Check if enrolled
        const { data: enrollment, error: enrollError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', uid)
            .eq('course_id', courseId)
            .maybeSingle();

        if (enrollError) throw enrollError;
        if (!enrollment) {
            return res.status(403).json({ error: 'Must be enrolled to review' });
        }

        // Check if already reviewed
        const { data: existing, error: existingError } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', uid)
            .eq('course_id', courseId)
            .maybeSingle();

        if (existingError) throw existingError;

        if (existing) {
            // Update existing (Don't update created_at!)
            const { data, error } = await supabase
                .from('reviews')
                .update({ rating, comment, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select()
                .maybeSingle();
            if (error) throw error;
            return res.json(data);
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert([{ user_id: uid, course_id: courseId, rating, comment }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

module.exports = router;
