
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`DEBUG: SUPABASE_URL: ${supabaseUrl}`);
console.log(`DEBUG: SUPABASE_KEY defined: ${!!supabaseServiceKey}`);

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or Service Role Key is missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
