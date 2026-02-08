
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
        const { data: user, error } = await supabase
            .from('users')
            .select('total_points, badge_level')
            .eq('id', uid)
            .maybeSingle();

        if (error) throw error;
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Calculate next badge info
        const currentPoints = user.total_points || 0;
        const currentBadgeIndex = BADGES.findIndex(b => b.name === user.badge_level);
        const nextBadge = currentBadgeIndex > 0 ? BADGES[currentBadgeIndex - 1] : null;

        let pointsToNext = 0;
        let progressPercent = 100;

        if (nextBadge) {
            const currentBadgeMin = BADGES[currentBadgeIndex].minPoints;
            const nextBadgeMin = nextBadge.minPoints;
            pointsToNext = nextBadgeMin - currentPoints;
            progressPercent = Math.round(((currentPoints - currentBadgeMin) / (nextBadgeMin - currentBadgeMin)) * 100);
        }

        res.json({
            ...user,
            nextBadge,
            pointsToNext,
            progressPercent
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

const BADGES = [
    { name: 'Grandmaster', minPoints: 5000 },
    { name: 'Guru', minPoints: 2500 },
    { name: 'Expert', minPoints: 1000 },
    { name: 'Adept', minPoints: 500 },
    { name: 'Learner', minPoints: 100 },
    { name: 'Newbie', minPoints: 0 }
];

const determineBadge = (points) => {
    const badge = BADGES.find(b => points >= b.minPoints);
    return badge ? badge.name : 'Newbie';
};

module.exports = { router, determineBadge, BADGES };
