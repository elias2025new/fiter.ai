-- Create the students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policy to allow the bot (using service role) to do everything
-- Note: Service role bypasses RLS, but it's good practice to have policies.
CREATE POLICY "Enable all access for service role only" ON students
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
