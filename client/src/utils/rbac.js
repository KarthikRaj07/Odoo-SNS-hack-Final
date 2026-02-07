export const ROLES = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    LEARNER: 'learner',
    GUEST: 'guest'
};

export const hasRole = (user, requiredRole) => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true; // Admin has access to everything
    return user.role === requiredRole;
};

export const canManageCourse = (user, course) => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true;
    if (user.role === ROLES.INSTRUCTOR && course.instructor_id === user.id) return true;
    return false;
};
