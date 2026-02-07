
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verifyToken = require('../middleware/authMiddleware');

// Middleware to check if user is admin or instructor
const requireAdmin = async (req, res, next) => {
    const { uid } = req.user;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', uid)
            .single();

        console.log(`DEBUG: requireAdmin check - uid: ${uid}, found user: ${!!user}, role: ${user?.role}`);

        if (error || !user) {
            console.log('DEBUG: requireAdmin - User not found or error');
            return res.status(403).json({ error: 'Access denied: user not found in database', details: error?.message });
        }

        if (user.role === 'admin' || user.role === 'instructor') {
            req.user.role = user.role; // Attach role to request
            console.log(`DEBUG: requireAdmin - Access granted for role: ${user.role}`);
            next();
        } else {
            console.log(`DEBUG: requireAdmin - Access denied for role: ${user.role}`);
            return res.status(403).json({ error: `Access denied: insufficient permissions (role: ${user.role})` });
        }
    } catch (error) {
        console.error('Error verifying admin role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

router.use(verifyToken);
router.use(requireAdmin);

// Debug route to check current role/id
router.get('/me', (req, res) => {
    res.json({ user: req.user });
});

// Helper to check course ownership
const checkCourseOwnership = async (courseId, userId, userRole) => {
    console.log(`DEBUG: checkCourseOwnership - courseId: ${courseId}, userId: ${userId}, role: ${userRole}`);
    if (userRole === 'admin') return true; // Admins can manage everything
    const { data, error } = await supabase
        .from('courses')
        .select('instructor_id')
        .eq('id', courseId)
        .single();
    if (error || !data) {
        console.log(`DEBUG: checkCourseOwnership - Course not found or error: ${error?.message}`);
        return false;
    }
    const isOwner = data.instructor_id === userId;
    console.log(`DEBUG: checkCourseOwnership - instructor_id: ${data.instructor_id}, isOwner: ${isOwner}`);
    return isOwner;
};

// GET /api/admin/stats - Admin Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: totalCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true });

        // Detailed enrollment stats
        const { data: enrollments } = await supabase.from('enrollments').select('status, progress');

        const stats = {
            totalParticipants: enrollments?.length || 0,
            yetToStart: enrollments?.filter(e => e.status === 'yet_to_start' || e.progress === 0).length || 0,
            inProgress: enrollments?.filter(e => e.status === 'in_progress' || (e.progress > 0 && e.progress < 100)).length || 0,
            completed: enrollments?.filter(e => e.status === 'completed' || e.progress === 100).length || 0
        };

        // Revenue (Optional, keeping if exists)
        const { data: revenueData } = await supabase.from('invoices').select('amount').eq('status', 'paid');
        const totalRevenue = revenueData ? revenueData.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0) : 0;

        res.json({
            ...stats,
            totalUsers,
            totalCourses,
            totalRevenue
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/admin/courses - List all courses (including drafts)
router.get('/courses', async (req, res) => {
    const { uid, role } = req.user;
    try {
        let query = supabase
            .from('courses')
            .select('*, instructor:users(full_name)')
            .order('created_at', { ascending: false });

        // If instructor, only show own courses
        if (role === 'instructor') {
            query = query.eq('instructor_id', uid);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching admin courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// POST /api/admin/courses - Create new course
router.post('/courses', async (req, res) => {
    const { title, description, short_description, price, thumbnail_url, tags, is_published, visibility, access_rule } = req.body;
    const { uid } = req.user;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        const { data, error } = await supabase
            .from('courses')
            .insert([{
                title,
                description,
                short_description,
                price: parseFloat(price) || 0,
                thumbnail_url,
                tags,
                is_published: !!is_published,
                visibility: visibility || 'everyone',
                access_rule: access_rule || 'open',
                instructor_id: uid
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Failed to create course', details: error.message });
    }
});

// PUT /api/admin/courses/:id - Update course
router.put('/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, short_description, price, thumbnail_url, tags, is_published, visibility, access_rule } = req.body;
    const { uid, role } = req.user;

    try {
        if (!(await checkCourseOwnership(id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized to update this course' });
        }

        const updates = {
            title,
            description,
            short_description,
            price: price !== undefined ? parseFloat(price) : undefined,
            thumbnail_url,
            tags,
            is_published,
            visibility,
            access_rule
        };

        // Filter out undefined fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const { data, error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Failed to update course', details: error.message });
    }
});

// DELETE /api/admin/courses/:id - Delete course
router.delete('/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { uid, role } = req.user;

    try {
        if (!(await checkCourseOwnership(id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized to delete this course' });
        }

        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

// POST /api/admin/modules - Create module
router.post('/modules', async (req, res) => {
    const { course_id, title, order_index } = req.body;
    const { uid, role } = req.user;

    if (!course_id || !title) return res.status(400).json({ error: 'Missing required fields' });

    try {
        const isOwner = await checkCourseOwnership(course_id, uid, role);
        console.log(`DEBUG: POST /modules - isOwner: ${isOwner} for role: ${role}`);
        if (!isOwner) {
            return res.status(403).json({
                error: 'Not authorized to add modules to this course',
                debug: { role, uid, course_id }
            });
        }

        const { data, error } = await supabase
            .from('modules')
            .insert([{ course_id, title, order_index }])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create module' });
    }
});

// POST /api/admin/lessons - Create lesson
router.post('/lessons', async (req, res) => {
    const { module_id, title, type, content_url, text_content, order_index, is_free } = req.body;
    const { uid, role } = req.user;

    if (!module_id || !title || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Verify ownership via module -> course
        const { data: moduleData, error: modError } = await supabase
            .from('modules')
            .select('course_id')
            .eq('id', module_id)
            .single();

        if (modError || !moduleData) return res.status(404).json({ error: 'Module not found' });

        if (!(await checkCourseOwnership(moduleData.course_id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized to add lessons to this module' });
        }

        const { data, error } = await supabase
            .from('lessons')
            .insert([{ module_id, title, type, content_url, text_content, order_index, is_free }])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create lesson' });
    }
});

// GET /api/admin/lessons/:id - Get full lesson details
router.get('/lessons/:id', async (req, res) => {
    const { id } = req.params;
    const { uid, role } = req.user;

    try {
        const { data: lesson, error: lError } = await supabase.from('lessons').select('*').eq('id', id).single();
        if (lError || !lesson) return res.status(404).json({ error: 'Lesson not found' });

        // Verify ownership
        const { data: moduleData } = await supabase.from('modules').select('course_id').eq('id', lesson.module_id).single();
        if (moduleData && !(await checkCourseOwnership(moduleData.course_id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Fetch questions if any
        const { data: questions } = await supabase.from('quiz_questions').select('*').eq('lesson_id', id).order('order_index', { ascending: true });

        res.json({ ...lesson, questions: questions || [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch lesson details' });
    }
});

// PUT /api/admin/lessons/:id - Update lesson (including settings)
router.put('/lessons/:id', async (req, res) => {
    const { id } = req.params;
    const { title, type, content_url, text_content, order_index, is_free, settings } = req.body;
    const { uid, role } = req.user;

    try {
        // Verify ownership
        const { data: lessonData, error: lError } = await supabase.from('lessons').select('module_id').eq('id', id).single();
        if (lError || !lessonData) return res.status(404).json({ error: 'Lesson not found' });

        const { data: moduleData } = await supabase.from('modules').select('course_id').eq('id', lessonData.module_id).single();
        if (!moduleData) return res.status(404).json({ error: 'Module not found' });

        if (!(await checkCourseOwnership(moduleData.course_id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { data, error } = await supabase
            .from('lessons')
            .update({ title, type, content_url, text_content, order_index, is_free, settings })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({ error: 'Failed to update lesson' });
    }
});

// DELETE /api/admin/lessons/:id - Delete lesson
router.delete('/lessons/:id', async (req, res) => {
    const { id } = req.params;
    const { uid, role } = req.user;

    try {
        const { data: lessonData, error: lError } = await supabase.from('lessons').select('module_id').eq('id', id).single();
        if (lError || !lessonData) return res.status(404).json({ error: 'Lesson not found' });

        const { data: moduleData } = await supabase.from('modules').select('course_id').eq('id', lessonData.module_id).single();

        if (!(await checkCourseOwnership(moduleData.course_id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ error: 'Failed to delete lesson' });
    }
});

// POST /api/admin/quiz-questions - Add question to lesson
router.post('/quiz-questions', async (req, res) => {
    const { lesson_id, question, options, correct_answer, points } = req.body;
    const { uid, role } = req.user;

    if (!lesson_id || !question || !options || !correct_answer) return res.status(400).json({ error: 'Missing required fields' });

    try {
        // Verify ownership via lesson -> module -> course
        // Optimized query: join not directly supported in single call easily without strict key config, 
        // so chain lookup or use RPC. Chain for now.
        const { data: lessonData, error: lError } = await supabase
            .from('lessons')
            .select('module_id')
            .eq('id', lesson_id)
            .single();
        if (lError || !lessonData) return res.status(404).json({ error: 'Lesson not found' });

        const { data: moduleData, error: mError } = await supabase
            .from('modules')
            .select('course_id')
            .eq('id', lessonData.module_id)
            .single();
        if (mError || !moduleData) return res.status(404).json({ error: 'Module not found' });

        if (!(await checkCourseOwnership(moduleData.course_id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized to add questions to this lesson' });
        }

        const { data, error } = await supabase
            .from('quiz_questions')
            .insert([{ lesson_id, question, options, correct_answer, points }])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create question' });
    }
});

// PUT /api/admin/lessons/:id/questions - Sync all questions for a lesson
router.put('/lessons/:id/questions', async (req, res) => {
    const { id } = req.params;
    const { questions } = req.body; // Array of { question, options, correct_answer, points }
    const { uid, role } = req.user;

    try {
        // Verify ownership
        const { data: lessonData, error: lError } = await supabase.from('lessons').select('module_id').eq('id', id).single();
        if (lError || !lessonData) return res.status(404).json({ error: 'Lesson not found' });

        const { data: moduleData } = await supabase.from('modules').select('course_id').eq('id', lessonData.module_id).single();
        if (!(await checkCourseOwnership(moduleData.course_id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // 1. Delete existing questions
        await supabase.from('quiz_questions').delete().eq('lesson_id', id);

        // 2. Insert new ones
        if (questions && questions.length > 0) {
            const questionsWithId = questions.map(q => ({
                lesson_id: id,
                question: q.question,
                options: q.options,
                correct_answer: q.correct_answer,
                points: q.points || 10
            }));
            const { error: insError } = await supabase.from('quiz_questions').insert(questionsWithId);
            if (insError) throw insError;
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error syncing quiz questions:', error);
        res.status(500).json({ error: 'Failed to sync questions' });
    }
});


// GET /api/admin/reports/:courseId - Get comprehensive report for a course
router.get('/reports/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const { uid, role } = req.user;

    try {
        let query = supabase
            .from('enrollments')
            .select('*, user:users(email, full_name, id), course:courses(title, id)');

        if (courseId !== 'all') {
            query = query.eq('course_id', courseId);
            // Verify ownership
            if (!(await checkCourseOwnership(courseId, uid, role))) {
                return res.status(403).json({ error: 'Not authorized for this course report' });
            }
        } else if (role === 'instructor') {
            // For 'all', filter by courses owned by instructor
            // This is complex in one query. Better to get instructor's course IDs first.
            const { data: myCourses } = await supabase.from('courses').select('id').eq('instructor_id', uid);
            const myCourseIds = myCourses.map(c => c.id);
            query = query.in('course_id', myCourseIds);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// GET /api/admin/courses/:id/attendees - Get enrolled users
router.get('/courses/:id/attendees', async (req, res) => {
    const { id } = req.params;
    const { uid, role } = req.user;

    try {
        if (!(await checkCourseOwnership(id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { data, error } = await supabase
            .from('enrollments')
            .select('*, user:users(id, email, full_name, avatar_url)')
            .eq('course_id', id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching attendees:', error);
        res.status(500).json({ error: 'Failed to fetch attendees' });
    }
});

// POST /api/admin/courses/:id/invite - Invite user by email
router.post('/courses/:id/invite', async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    const { uid, role } = req.user;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        if (!(await checkCourseOwnership(id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Find user by email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found with this email' });
        }

        // Check if already enrolled
        const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', id)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'User is already enrolled' });
        }

        // Enroll user
        const { data, error } = await supabase
            .from('enrollments')
            .insert([{ user_id: user.id, course_id: id }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, enrollment: data });
    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ error: 'Failed to invite user' });
    }
});

// POST /api/admin/courses/:id/contact - Contact all attendees
router.post('/courses/:id/contact', async (req, res) => {
    const { id } = req.params;
    const { subject, body } = req.body;
    const { uid, role } = req.user;

    if (!subject || !body) return res.status(400).json({ error: 'Subject and body are required' });

    try {
        if (!(await checkCourseOwnership(id, uid, role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get all attendees emails
        const { data: enrollments, error } = await supabase
            .from('enrollments')
            .select('user:users(email)')
            .eq('course_id', id);

        if (error) throw error;

        const emails = enrollments.map(e => e.user?.email).filter(Boolean);

        // MOCK SENDING EMAIL
        console.log(`[MOCK EMAIL] Sending to ${emails.length} recipients`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log(`Recipients: ${emails.join(', ')}`);

        // In production, integrate with SendGrid/AWS SES here

        res.json({ success: true, recipientCount: emails.length });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
