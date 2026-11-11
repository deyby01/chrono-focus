CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL UNIQUE,
  color VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
  icon VARCHAR(40) NOT NULL DEFAULT 'book',
  description TEXT NOT NULL DEFAULT '',
  daily_target_minutes INTEGER NOT NULL DEFAULT 60 CHECK (daily_target_minutes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
  planned_duration_minutes INTEGER NOT NULL DEFAULT 25 CHECK (planned_duration_minutes > 0),
  actual_duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (actual_duration_seconds >= 0),
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_start_time VARCHAR(10) DEFAULT NULL,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  planned_seconds INTEGER NOT NULL CHECK (planned_seconds > 0),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  completed_countdown BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_task_id ON focus_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at);

