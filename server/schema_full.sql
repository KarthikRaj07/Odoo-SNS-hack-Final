
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE (Synced from Firebase + Email/Password Auth)
create table if not exists users (
  id uuid primary key,
  email text unique not null,
  full_name text,
  password_hash text, -- For email/password authentication
  role text check (role in ('admin', 'instructor', 'learner', 'guest')) default 'learner',
  avatar_url text,
  total_points int default 0,
  badge_level text default 'Newbie', -- Newbie, Explorer, Achiever, Specialist, Expert, Master
  created_at timestamp with time zone default now()
);

-- COURSES TABLE
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  short_description text,
  instructor_id uuid references users(id) on delete set null not null,
  price numeric default 0 check (price >= 0),
  thumbnail_url text,
  tags text[],
  is_published boolean default false,
  visibility text check (visibility in ('everyone', 'signed_in')) default 'everyone',
  access_rule text check (access_rule in ('open', 'invitation', 'payment')) default 'open',
  created_at timestamp with time zone default now()
);

-- MODULES (Sections)
create table if not exists modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  order_index int default 0,
  created_at timestamp with time zone default now()
);

-- LESSONS
create table if not exists lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references modules(id) on delete cascade not null,
  title text not null,
  type text check (type in ('video', 'document', 'image', 'quiz')) not null,
  content_url text, -- For video/image/doc
  text_content text, -- For docs
  allow_download boolean default false, -- For docs/images
  attachments jsonb, -- Array of objects: [{name: "Ref", url: "..."}]
  order_index int default 0,
  is_free boolean default false, -- Preview allowed
  created_at timestamp with time zone default now()
);

-- ENROLLMENTS
create table if not exists enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  progress numeric default 0 check (progress >= 0 and progress <= 100),
  completed_lessons uuid[], -- Array of completed lesson IDs
  enrolled_at timestamp with time zone default now(),
  unique(user_id, course_id)
);

-- REVIEWS
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  rating int check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default now()
);

-- CERTIFICATES TABLE
create table if not exists certificates (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  issued_at timestamp with time zone default now(),
  unique(course_id, user_id)
);

-- QUIZZES (Questions)
create table if not exists quiz_questions (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references lessons(id) on delete cascade not null,
  question text not null,
  options jsonb not null, -- Array of options: ["A", "B", "C"]
  correct_answer text not null,
  points int default 10 check (points >= 0)
);

-- QUIZ ATTEMPTS
create table if not exists quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  lesson_id uuid references lessons(id) on delete cascade not null,
  score int not null,
  attempt_number int default 1,
  passed boolean default false,
  created_at timestamp with time zone default now()
);

-- RLS setup
alter table users enable row level security;
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table reviews enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;

-- POLICIES (Simplified for dev, strict for prod)

-- Users
create policy "Public profiles are viewable by everyone" on users for select using (true);
create policy "Users can update own profile" on users for update using (auth.uid() = id);

-- Courses
-- Everyone can read published courses (visibility check logic in app or advanced policy)
create policy "Published courses are viewable by everyone" on courses for select using (is_published = true);
-- Instructors can manage own courses
create policy "Instructors can manage own courses" on courses for all using (auth.uid() = instructor_id);

-- Modules & Lessons
create policy "Modules viewable if course public or owner" on modules for select using (
  exists (select 1 from courses where id = modules.course_id and (is_published = true or instructor_id = auth.uid()))
);
create policy "Lessons viewable if course public or owner" on lessons for select using (
  exists (select 1 from modules join courses on modules.course_id = courses.id where modules.id = lessons.module_id and (is_published = true or instructor_id = auth.uid()))
);
create policy "Instructors can manage modules" on modules for all using (
  exists (select 1 from courses where id = modules.course_id and instructor_id = auth.uid())
);
create policy "Instructors can manage lessons" on lessons for all using (
  exists (select 1 from modules join courses on modules.course_id = courses.id where modules.id = lessons.module_id and instructor_id = auth.uid())
);

-- Enrollments
create policy "Users can view own enrollments" on enrollments for select using (auth.uid() = user_id);
create policy "Users can enroll" on enrollments for insert with check (auth.uid() = user_id);
create policy "Instructors view course enrollments" on enrollments for select using (
  exists (select 1 from courses where id = enrollments.course_id and instructor_id = auth.uid())
);

-- Policies for Reviews
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Authenticated users can create reviews" on reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on reviews for delete using (auth.uid() = user_id);

-- Policies for Certificates
create policy "Certificates are viewable by owner" on certificates for select using (auth.uid() = user_id);
create policy "System/Admin can issue certificates" on certificates for insert with check (true); -- Ideally restrict to trigger or admin function

-- Quiz Data
create policy "Questions viewable with lesson" on quiz_questions for select using (
  exists (select 1 from lessons join modules on lessons.module_id = modules.id join courses on modules.course_id = courses.id where lessons.id = quiz_questions.lesson_id and (is_published = true or instructor_id = auth.uid()))
);
create policy "Users manage own attempts" on quiz_attempts for all using (auth.uid() = user_id);
create policy "Instructors view lesson attempts" on quiz_attempts for select using (
  exists (select 1 from lessons join modules on lessons.module_id = modules.id join courses on modules.course_id = courses.id where lessons.id = quiz_attempts.lesson_id and instructor_id = auth.uid())
);

-- GAMIFICATION FUNCTIONS
create or replace function increment_points(x_user_id uuid, x_points int)
returns void as $$
begin
  update users
  set total_points = total_points + x_points
  where id = x_user_id;
end;
$$ language plpgsql security definer;

-- Migrations / Updates
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS completed_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS time_spent INT DEFAULT 0; -- in minutes
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'yet_to_start' CHECK (status IN ('yet_to_start', 'in_progress', 'completed'));

