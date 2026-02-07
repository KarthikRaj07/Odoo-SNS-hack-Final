const supabase = require('./supabase');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const email = 'admin@learnsphere.com';
const password = 'AdminPassword123!';
const fullName = 'System Administrator';

async function createAdmin() {
    try {
        console.log('Initializing Admin Creation (Supabase Only)...');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate UUID or check if exists
        let userId = crypto.randomUUID();

        // Check if user exists to preserve ID if updating
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log('User already exists, updating role...');
            userId = existingUser.id;
        }

        // Insert/Update in Supabase
        const { data, error } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: email,
                password_hash: hashedPassword,
                full_name: fullName,
                role: 'admin',
                avatar_url: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff',
                total_points: 0,
                badge_level: 'Master'
            })
            .select();

        if (error) {
            console.error('Error upserting to Supabase:', error);
        } else {
            console.log('Successfully set admin role in Supabase for:', email);
            console.log('\n==================================================');
            console.log('ADMIN STATUS: READY');
            console.log('Login Email:    ', email);
            console.log('Login Password: ', password);
            console.log('==================================================\n');
        }

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        // Exit process
        setTimeout(() => process.exit(0), 1000);
    }
}

createAdmin();
