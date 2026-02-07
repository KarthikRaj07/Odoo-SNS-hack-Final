const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verifyToken = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// POST /api/auth/register
// Register a new user
router.post('/register', async (req, res) => {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate UUID for user
        const userId = crypto.randomUUID();

        // Create user in Supabase
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([
                {
                    id: userId,
                    email: email,
                    full_name: full_name || email.split('@')[0],
                    password_hash: hashedPassword,
                    role: 'learner'
                }
            ])
            .select()
            .single();

        if (createError) throw createError;

        // Generate JWT token
        const token = jwt.sign(
            { uid: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Error registering user:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
});

// POST /api/auth/login
// Login with email and password
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Find user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { uid: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                avatar_url: user.avatar_url
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// POST /api/auth/sync (for compatibility with existing code)
// Syncs authenticated user
router.post('/sync', verifyToken, async (req, res) => {
    const { uid } = req.user;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', uid)
            .single();

        if (error) throw error;

        res.json({ user });

    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

module.exports = router;
