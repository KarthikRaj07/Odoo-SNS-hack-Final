
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/courses - Fetch all published courses (or all for admins/instructors)
router.get('/', async (req, res) => {
    try {
        let query = supabase
            .from('courses')
            .select('*, instructor:users!instructor_id(full_name, avatar_url)');

        // Check for token to see if we should show unpublished courses
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                // Use the same secret as authMiddleware
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

                if (decoded && (decoded.role === 'admin' || decoded.role === 'instructor')) {
                    // Admin/Instructor sees all
                } else {
                    query = query.eq('is_published', true);
                }
            } catch (e) {
                query = query.eq('is_published', true);
            }
        } else {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// GET /api/courses/my-courses - Fetch enrolled courses for current user
router.get('/my-courses', verifyToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                course:courses(*)
            `)
            .eq('user_id', uid);

        if (error) throw error;
        res.json(data.map(e => ({
            ...e.course,
            progress: e.progress,
            enrollment_id: e.id,
            completed_lessons: e.completed_lessons
        })));
    } catch (error) {
        console.error('Error fetching my courses:', error);
        res.status(500).json({ error: 'Failed to fetch enrolled courses' });
    }
});

// GET /api/courses/:id - Fetch course details with modules and lessons
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*, instructor:users!instructor_id(full_name, avatar_url)')
            .eq('id', id)
            .single();

        if (courseError) throw courseError;
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Fetch modules and lessons (exclude large content fields to avoid 500 errors)
        const { data: modules, error: modulesError } = await supabase
            .from('modules')
            .select(`
                *,
                lessons(
                    id, module_id, title, type, order_index, is_free, created_at, allow_download
                )
            `)
            .eq('course_id', id)
            .order('order_index', { ascending: true });

        // Sort lessons inside modules
        if (modules) {
            modules.forEach(module => {
                if (module.lessons) {
                    module.lessons.sort((a, b) => a.order_index - b.order_index);
                }
            });
        }

        if (modulesError) throw modulesError;

        res.json({ ...course, modules });
    } catch (error) {
        console.error('DEBUG: Error in GET /api/courses/:id:', error);
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(500).json({ error: 'Failed to fetch course details', details: error.message });
    }
});

// POST /api/courses/:id/enroll - Enroll in a course
router.post('/:id/enroll', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { uid } = req.user;

    try {
        // Check if already enrolled
        const { data: existing, error: checkError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', uid)
            .eq('course_id', id)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already enrolled' });
        }

        // Enroll user
        const { data, error } = await supabase
            .from('enrollments')
            .insert([{ user_id: uid, course_id: id }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ error: 'Failed to enroll in course' });
    }
});

module.exports = router;
