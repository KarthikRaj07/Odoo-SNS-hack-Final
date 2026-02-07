
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verifyToken = require('../middleware/authMiddleware');

// POST /api/lessons/:id/complete - Mark lesson as complete
router.post('/:id/complete', verifyToken, async (req, res) => {
    const { id } = req.params; // lesson_id
    const { uid } = req.user;
    const { courseId } = req.body;

    try {
        // Fetch current enrollment
        const { data: enrollment, error: fetchError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', uid)
            .eq('course_id', courseId)
            .single();

        if (fetchError || !enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        // Update completed lessons if not already completed
        let completedLessons = enrollment.completed_lessons || [];
        if (!completedLessons.includes(id)) {
            completedLessons.push(id);

            // Calculate progress (simplified for now, ideally count total lessons)
            // For now, let's just update the array. 
            // Calculate Progress
            // Get total lessons count for the course
            const { data: modules, error: modError } = await supabase
                .from('modules')
                .select('lessons(id)')
                .eq('course_id', courseId);

            if (modError) throw modError;

            let totalLessons = 0;
            modules.forEach(m => {
                if (m.lessons) totalLessons += m.lessons.length;
            });

            const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

            const { error: updateError } = await supabase
                .from('enrollments')
                .update({
                    completed_lessons: completedLessons,
                    progress: progress
                })
                .eq('id', enrollment.id);

            if (updateError) throw updateError;

            // Certificate Issuance
            if (progress === 100) {
                // Check if already has certificate
                const { data: existingCert } = await supabase
                    .from('certificates')
                    .select('id')
                    .eq('user_id', uid)
                    .eq('course_id', courseId)
                    .single();

                if (!existingCert) {
                    await supabase
                        .from('certificates')
                        .insert([{ user_id: uid, course_id: courseId }]);

                    // Bonus points for completion?
                    await supabase.rpc('increment_points', { x_user_id: uid, x_points: 50 });
                }
            }
        }

        res.json({ success: true, completedLessons });

    } catch (error) {
        console.error('Error completing lesson:', error);
        res.status(500).json({ error: 'Failed to complete lesson' });
    }
});

module.exports = router;
