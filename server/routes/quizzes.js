
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verifyToken = require('../middleware/authMiddleware');
const { determineBadge } = require('./gamification');

// GET /api/quizzes/:lessonId - Fetch quiz for a lesson
router.get('/:lessonId', verifyToken, async (req, res) => {
    const { lessonId } = req.params;
    try {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('lesson_id', lessonId);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
});

// POST /api/quizzes/:lessonId/submit - Submit quiz attempt
router.post('/:lessonId/submit', verifyToken, async (req, res) => {
    const { lessonId } = req.params;
    const { uid } = req.user;
    const { answers } = req.body; // { questionId: "option" }

    try {
        // 1. Fetch questions and correct answers
        const { data: questions, error: qError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('lesson_id', lessonId);

        if (qError) throw qError;

        // 2. Calculate raw score
        let rawScore = 0;
        let maxPoints = 0;

        questions.forEach(q => {
            maxPoints += q.points;
            if (answers[q.id] === q.correct_answer) {
                rawScore += q.points;
            }
        });

        const passed = maxPoints > 0 ? (rawScore / maxPoints) >= 0.7 : true;

        // 3. Check attempt number (Note: Race condition possible without transactions)
        const { count: attemptCount, error: countError } = await supabase
            .from('quiz_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', uid)
            .eq('lesson_id', lessonId);

        if (countError) throw countError;

        const currentAttemptNum = (attemptCount || 0) + 1;

        // 4. Calculate Points to Award based on Lesson Settings
        const { data: lesson, error: lError } = await supabase
            .from('lessons')
            .select('settings')
            .eq('id', lessonId)
            .maybeSingle();

        if (lError) throw lError;
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        let pointsAwarded = 0;
        if (passed) {
            const settings = lesson.settings || {};
            const rewards = settings.rewards || { first: 100, second: 80, third: 60, other: 40 };

            let pointsToGive = rewards.other || 0;
            if (currentAttemptNum === 1) pointsToGive = rewards.first || 0;
            else if (currentAttemptNum === 2) pointsToGive = rewards.second || 0;
            else if (currentAttemptNum === 3) pointsToGive = rewards.third || 0;

            pointsAwarded = pointsToGive;
        }

        // 5. Record attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('quiz_attempts')
            .insert([{
                user_id: uid,
                lesson_id: lessonId,
                score: rawScore,
                passed,
                attempt_number: currentAttemptNum
            }])
            .select()
            .maybeSingle();

        if (attemptError) throw attemptError;

        // 6. Update User Points & Badge Level
        if (pointsAwarded > 0) {
            // Only award if this is the first time they PASS
            const { data: previousPass, error: passError } = await supabase
                .from('quiz_attempts')
                .select('id')
                .eq('user_id', uid)
                .eq('lesson_id', lessonId)
                .eq('passed', true)
                .neq('id', attempt.id)
                .limit(1);

            if (passError) throw passError;

            if (!previousPass || previousPass.length === 0) {
                const { data: user, error: uError } = await supabase
                    .from('users')
                    .select('total_points')
                    .eq('id', uid)
                    .maybeSingle();

                if (uError) throw uError;
                if (user) {
                    const newTotal = (user.total_points || 0) + pointsAwarded;
                    await supabase
                        .from('users')
                        .update({
                            total_points: newTotal,
                            badge_level: determineBadge(newTotal)
                        })
                        .eq('id', uid);
                }
            } else {
                pointsAwarded = 0; // No points for repeat passes
            }
        }

        res.json({
            score: rawScore,
            totalPoints: maxPoints,
            passed,
            attempt,
            pointsAwarded,
            attemptNumber: currentAttemptNum
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

module.exports = router;
