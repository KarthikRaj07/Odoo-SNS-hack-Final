const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verifyToken = require('../middleware/authMiddleware');
const { determineBadge } = require('./gamification');

// POST /api/enrollments/:courseId/complete - Mark course as complete
router.post('/:courseId/complete', verifyToken, async (req, res) => {
    const { courseId } = req.params;
    const { uid } = req.user;

    try {
        // 1. Check if enrollment exists
        const { data: enrollment, error: fetchError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', uid)
            .eq('course_id', courseId)
            .single();

        if (fetchError || !enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        // 2. Check if already completed?
        // If not, mark as completed_date = now(), progress = 100?
        // or just issue certificate?
        // Let's ensure progress is 100.

        const { error: updateError } = await supabase
            .from('enrollments')
            .update({
                progress: 100,
                completed_date: new Date().toISOString()
            })
            .eq('id', enrollment.id);

        if (updateError) throw updateError;

        // 3. Issue Certificate
        // Check if already exists
        const { data: existingCert } = await supabase
            .from('certificates')
            .select('id')
            .eq('user_id', uid)
            .eq('course_id', courseId)
            .single();

        let pointsAwarded = 0;

        if (!existingCert) {
            const { error: certError } = await supabase
                .from('certificates')
                .insert([{ user_id: uid, course_id: courseId }]);

            if (certError) throw certError;

            // 4. Award Completion Points (e.g., 100 points)
            pointsAwarded = 100;

            // Fetch current points to determine badge
            const { data: user, error: uError } = await supabase
                .from('users')
                .select('total_points')
                .eq('id', uid)
                .single();

            if (!uError) {
                const newTotal = (user.total_points || 0) + pointsAwarded;
                const newBadge = determineBadge(newTotal);

                await supabase
                    .from('users')
                    .update({
                        total_points: newTotal,
                        badge_level: newBadge
                    })
                    .eq('id', uid);
            }
        }

        res.json({ success: true, pointsAwarded });

    } catch (error) {
        console.error('Error completing course:', error);
        res.status(500).json({ error: 'Failed to complete course' });
    }
});

module.exports = router;
