DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS scholarships;
DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  interests TEXT,
  field_of_study TEXT,
  country TEXT,
  gpa NUMERIC,
  age INTEGER,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  marital_status TEXT,
  race TEXT,
  current_education TEXT,
  language_proficiency TEXT[],
  preferred_industries TEXT[],
  technical_skills TEXT[],
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  application_data JSONB,
  recommendations UUID[]
);

CREATE TABLE scholarships (
  id UUID PRIMARY KEY,
  scholarship_name TEXT NOT NULL,
  scholarship_description TEXT,
  scholarship_amount INT,
  scholarship_deadline DATE,
  scholarship_url TEXT,
  scholarship_image TEXT,
  scholarship_status TEXT DEFAULT 'active',
  scholarship_category TEXT[],
  scholarship_min_gpa NUMERIC,
  scholarship_min_education_level TEXT,
  scholarship_country TEXT, 
  scholarship_gender_looking_for TEXT,
  scholarship_max_age INT,
  tags TEXT[],
  recommended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  scholarship_id UUID REFERENCES scholarships(id),
  form_data JSONB,
  status VARCHAR(32) DEFAULT 'pending',
  essay TEXT,
  documents TEXT[],
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT now(),
  last_edited TIMESTAMP DEFAULT now(),

  CONSTRAINT unique_user_scholarship UNIQUE (user_id, scholarship_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Scholarships policies (public read access)
CREATE POLICY "Anyone can view scholarships" ON scholarships
  FOR SELECT USING (true);

-- Applications policies
CREATE POLICY "Users can view their own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" ON applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications" ON applications
  FOR DELETE USING (auth.uid() = user_id);
