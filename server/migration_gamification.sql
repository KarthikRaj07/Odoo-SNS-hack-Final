
-- Function to increment user points safelyETC 
create or replace function increment_points(x_user_id uuid, x_points int)
returns void as $$
begin
  update users
  set total_points = total_points + x_points
  where id = x_user_id;
end;
$$ language plpgsql security definer;

-- Ensure total_points column exists and defaults to 0
alter table users 
add column if not exists total_points int default 0;

-- Ensure badge_level column exists
alter table users 
add column if not exists badge_level text default 'Newbie';
