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
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        // 2. Mark as completed
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
        const { data: existingCert, error: certFetchError } = await supabase
            .from('certificates')
            .select('id')
            .eq('user_id', uid)
            .eq('course_id', courseId)
            .maybeSingle();

        if (certFetchError) throw certFetchError;

        let pointsAwarded = 0;

        if (!existingCert) {
            const { error: certError } = await supabase
                .from('certificates')
                .insert([{ user_id: uid, course_id: courseId }]);

            if (certError) {
                // Ignore if it's a conflict (race condition), but throw for other errors
                if (certError.code !== '23505') throw certError;
            } else {
                // 4. Award Completion Points (e.g., 100 points)
                pointsAwarded = 100;

                // Update User Points & Badge Level Atomically
                // Use the rpc function if defined, otherwise fetch and update
                const { error: rpcError } = await supabase.rpc('increment_points', { x_user_id: uid, x_points: pointsAwarded });

                if (rpcError) {
                    // Fallback to manual update if RPC fails
                    const { data: user, error: uError } = await supabase
                        .from('users')
                        .select('total_points')
                        .eq('id', uid)
                        .maybeSingle();

                    if (!uError && user) {
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
                } else {
                    // If RPC success, we still need to update badge_level if it's not handled by RPC
                    // Let's fetch the new total to update badge
                    const { data: user } = await supabase
                        .from('users')
                        .select('total_points')
                        .eq('id', uid)
                        .maybeSingle();
                    if (user) {
                        await supabase
                            .from('users')
                            .update({ badge_level: determineBadge(user.total_points) })
                            .eq('id', uid);
                    }
                }
            }
        }

        res.json({ success: true, pointsAwarded });

    } catch (error) {
        console.error('Error completing course:', error);
        res.status(500).json({ error: 'Failed to complete course' });
    }
});

module.exports = router;
