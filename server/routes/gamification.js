
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/gamification/leaderboard - Get top users
router.get('/leaderboard', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name, avatar_url, total_points, badge_level')
            .order('total_points', { ascending: false })
            .limit(10);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// GET /api/gamification/stats - Get current user stats
router.get(['/stats', '/my-stats'], verifyToken, async (req, res) => {
    const { uid } = req.user;
    try {
        const { data, error } = await supabase
            .from('users')
            .select('total_points, badge_level')
            .eq('id', uid)
            .single();

        if (error) throw error;

        // Calculate rank (optional, expensive query)
        // For now just return points
        res.json(data);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

const determineBadge = (points) => {
    if (points >= 5000) return 'Grandmaster';
    if (points >= 2500) return 'Guru';
    if (points >= 1000) return 'Expert';
    if (points >= 500) return 'Adept';
    if (points >= 100) return 'Learner';
    return 'Newbie';
};

module.exports = { router, determineBadge };
