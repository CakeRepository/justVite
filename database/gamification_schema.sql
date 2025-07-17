-- Additional gamification tables for courses and achievements
-- Add this to your existing schema

-- Create courses table
CREATE TABLE public.courses (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    lessons JSONB NOT NULL DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '{"min_score": 70, "completion_criteria": []}'::jsonb,
    rewards JSONB DEFAULT '{"xp": 100, "badge": null, "unlock_courses": []}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user progress table
CREATE TABLE public.user_progress (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    current_lesson INTEGER DEFAULT 0,
    completed_lessons INTEGER[] DEFAULT '{}',
    total_score INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    streak_days INTEGER DEFAULT 0,
    best_session_score INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('score', 'streak', 'completion', 'engagement', 'mastery')),
    criteria JSONB NOT NULL,
    reward_xp INTEGER DEFAULT 50,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB DEFAULT '{"current": 0, "target": 0}'::jsonb,
    UNIQUE(user_id, achievement_id)
);

-- Create user stats table
CREATE TABLE public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    achievements_earned INTEGER DEFAULT 0,
    rank_position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for courses (public read access)
CREATE POLICY "Anyone can view courses" ON public.courses
    FOR SELECT USING (true);

-- Create policies for user progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for achievements (public read access)
CREATE POLICY "Anyone can view achievements" ON public.achievements
    FOR SELECT USING (true);

-- Create policies for user achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for user stats
CREATE POLICY "Users can view their own stats" ON public.user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON public.user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX idx_user_progress_status ON public.user_progress(status);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_difficulty ON public.courses(difficulty);

-- Create triggers for updating timestamps
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, type, criteria, reward_xp, rarity) VALUES
('First Steps', 'Complete your first learning session', '🎯', 'engagement', '{"sessions_completed": 1}', 25, 'common'),
('Curious Mind', 'Ask 10 questions in a single session', '🤔', 'engagement', '{"messages_in_session": 10}', 50, 'common'),
('Rising Star', 'Achieve a score of 80 or higher', '⭐', 'score', '{"min_score": 80}', 75, 'rare'),
('Streak Master', 'Learn for 7 days in a row', '🔥', 'streak', '{"streak_days": 7}', 100, 'rare'),
('Course Champion', 'Complete your first course', '🏆', 'completion', '{"courses_completed": 1}', 150, 'epic'),
('Perfect Score', 'Achieve a perfect score of 100', '💯', 'score', '{"min_score": 100}', 200, 'epic'),
('Scholar', 'Complete 5 courses', '📚', 'completion', '{"courses_completed": 5}', 300, 'legendary'),
('Socratic Master', 'Have 50 interactions with the Socratic agent', '🎓', 'mastery', '{"socratic_interactions": 50}', 250, 'epic');

-- Insert sample courses
INSERT INTO public.courses (title, description, category, difficulty, topics, lessons, requirements, rewards) VALUES
('Introduction to Photosynthesis', 'Learn how plants convert light energy into chemical energy', 'Biology', 'beginner', 
'["light reactions", "dark reactions", "chloroplasts", "ATP synthesis"]',
'[
  {"id": 1, "title": "What is Photosynthesis?", "description": "Basic understanding of the process", "questions": ["What do plants need to make food?", "Where does photosynthesis happen?"]},
  {"id": 2, "title": "The Light Reactions", "description": "How plants capture light energy", "questions": ["What happens in the thylakoids?", "How is ATP made?"]},
  {"id": 3, "title": "The Calvin Cycle", "description": "Converting CO2 into glucose", "questions": ["What is the role of NADPH?", "How is glucose formed?"]},
  {"id": 4, "title": "Factors Affecting Photosynthesis", "description": "Environmental influences", "questions": ["How does light intensity affect the rate?", "What about temperature?"]}
]',
'{"min_score": 70, "completion_criteria": ["complete_all_lessons", "pass_final_assessment"]}',
'{"xp": 200, "badge": "🌱", "unlock_courses": ["advanced_plant_biology"]}'),

('Mastering Quadratic Equations', 'Complete guide to solving and understanding quadratic equations', 'Mathematics', 'intermediate',
'["standard form", "factoring", "quadratic formula", "completing the square"]',
'[
  {"id": 1, "title": "Understanding Quadratic Form", "description": "Recognize ax² + bx + c = 0", "questions": ["What makes an equation quadratic?", "What do a, b, and c represent?"]},
  {"id": 2, "title": "Factoring Method", "description": "Solving by factoring", "questions": ["When can we factor?", "How do we find the factors?"]},
  {"id": 3, "title": "Quadratic Formula", "description": "The universal solution method", "questions": ["What is the discriminant?", "How do we apply the formula?"]},
  {"id": 4, "title": "Completing the Square", "description": "Alternative solution method", "questions": ["Why complete the square?", "What are the steps?"]}
]',
'{"min_score": 75, "completion_criteria": ["complete_all_lessons", "solve_practice_problems"]}',
'{"xp": 250, "badge": "🔢", "unlock_courses": ["advanced_algebra"]}'),

('JavaScript Fundamentals', 'Build a solid foundation in JavaScript programming', 'Programming', 'beginner',
'["variables", "functions", "objects", "arrays", "loops"]',
'[
  {"id": 1, "title": "Variables and Data Types", "description": "Storing and using data", "questions": ["What are the primitive types?", "How do we declare variables?"]},
  {"id": 2, "title": "Functions", "description": "Reusable code blocks", "questions": ["What is a function?", "How do parameters work?"]},
  {"id": 3, "title": "Objects and Arrays", "description": "Complex data structures", "questions": ["How do we create objects?", "What methods do arrays have?"]},
  {"id": 4, "title": "Control Flow", "description": "Making decisions and loops", "questions": ["When do we use if statements?", "What are the different loop types?"]}
]',
'{"min_score": 70, "completion_criteria": ["complete_all_lessons", "build_project"]}',
'{"xp": 300, "badge": "💻", "unlock_courses": ["advanced_javascript", "web_development"]}');
