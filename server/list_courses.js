const supabase = require('./supabase');

async function listCourses() {
    console.log('--- LISTING ALL COURSES ---');
    const { data: courses, error } = await supabase
        .from('courses')
        .select('id, title, is_published');

    if (error) {
        console.error('Fetch Error:', error);
    } else {
        console.log('Total Courses:', courses.length);
        courses.forEach(c => {
            console.log(`- [${c.is_published ? 'PUBLISHED' : 'DRAFT'}] ${c.title} (${c.id})`);
        });
    }
}

listCourses();
