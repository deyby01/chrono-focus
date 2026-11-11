INSERT INTO categories (name, slug, color, icon, description, daily_target_minutes)
VALUES
  ('Courses & Learning', 'courses-learning', '#3B82F6', 'graduation-cap', 'Online courses, certifications, lectures, and technical study', 90),
  ('Software Projects', 'software-projects', '#10B981', 'code', 'Personal and professional engineering projects, architecture, and shipping features', 120),
  ('Hobbies & Creative', 'hobbies-creative', '#A855F7', 'palette', 'Music, design, languages, gaming, and creative exploration', 45),
  ('Deep Work & Career', 'deep-work-career', '#F59E0B', 'briefcase', 'High-leverage career tasks, system design, and core deliverables', 90),
  ('Reading & Research', 'reading-research', '#06B6D4', 'book-open', 'Books, technical papers, documentation, and synthesis notes', 30),
  ('Wellness & Routine', 'wellness-routine', '#F43F5E', 'heart-pulse', 'Workout, meditation, stretching, and daily planning rituals', 30)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  cat_courses INT;
  cat_projects INT;
  cat_hobbies INT;
  cat_deepwork INT;
  cat_reading INT;
  task_1 INT;
  task_2 INT;
  task_3 INT;
  task_4 INT;
BEGIN
  IF (SELECT COUNT(*) FROM tasks) = 0 THEN
    SELECT id INTO cat_courses FROM categories WHERE slug = 'courses-learning' LIMIT 1;
    SELECT id INTO cat_projects FROM categories WHERE slug = 'software-projects' LIMIT 1;
    SELECT id INTO cat_hobbies FROM categories WHERE slug = 'hobbies-creative' LIMIT 1;
    SELECT id INTO cat_deepwork FROM categories WHERE slug = 'deep-work-career' LIMIT 1;
    SELECT id INTO cat_reading FROM categories WHERE slug = 'reading-research' LIMIT 1;

    INSERT INTO tasks (
      title, description, category_id, priority, status,
      planned_duration_minutes, actual_duration_seconds,
      scheduled_date, scheduled_start_time, checklist, completed_at
    ) VALUES (
      'Advanced System Design & PostgreSQL Indexing Course',
      'Complete Module 4 on B-Tree vs GIN indexes, query execution plans, and partitioning strategies.',
      cat_courses, 'high', 'completed',
      45, 2700,
      CURRENT_DATE, '09:00',
      '[{"id":"c1","text":"Watch lecture on EXPLAIN ANALYZE","done":true},{"id":"c2","text":"Run benchmark queries in local Postgres","done":true},{"id":"c3","text":"Write summary notes in markdown","done":true}]'::jsonb,
      NOW() - INTERVAL '3 hours'
    ) RETURNING id INTO task_1;

    INSERT INTO tasks (
      title, description, category_id, priority, status,
      planned_duration_minutes, actual_duration_seconds,
      scheduled_date, scheduled_start_time, checklist
    ) VALUES (
      'Build ChronoFocus MVC Architecture & Reverse Timer',
      'Implement clean Express MVC controllers, PostgreSQL analytics queries, and the React countdown chronometer.',
      cat_projects, 'critical', 'in_progress',
      60, 1800,
      CURRENT_DATE, '11:00',
      '[{"id":"p1","text":"Design PostgreSQL schema & indexes","done":true},{"id":"p2","text":"Implement Express MVC controllers & routes","done":true},{"id":"p3","text":"Connect reverse chronometer with audio cues","done":false}]'::jsonb
    ) RETURNING id INTO task_2;

    INSERT INTO tasks (
      title, description, category_id, priority, status,
      planned_duration_minutes, actual_duration_seconds,
      scheduled_date, scheduled_start_time, checklist
    ) VALUES (
      'TypeScript Generics & Design Patterns Workshop',
      'Practice SOLID principles in TypeScript with factory, strategy, and repository patterns.',
      cat_courses, 'high', 'pending',
      50, 0,
      CURRENT_DATE, '14:30',
      '[{"id":"t1","text":"Review utility types and constraints","done":false},{"id":"t2","text":"Refactor state controller hook","done":false}]'::jsonb
    ) RETURNING id INTO task_3;

    INSERT INTO tasks (
      title, description, category_id, priority, status,
      planned_duration_minutes, actual_duration_seconds,
      scheduled_date, scheduled_start_time, checklist
    ) VALUES (
      'Acoustic Guitar Practice & Ear Training',
      'Practice chord progressions, fingerstyle warmups, and rhythm timing at 95 BPM.',
      cat_hobbies, 'medium', 'pending',
      30, 0,
      CURRENT_DATE, '17:30',
      '[{"id":"h1","text":"10m chromatic warmup","done":false},{"id":"h2","text":"20m song arrangement practice","done":false}]'::jsonb
    ) RETURNING id INTO task_4;

    INSERT INTO tasks (
      title, description, category_id, priority, status,
      planned_duration_minutes, actual_duration_seconds,
      scheduled_date, scheduled_start_time, checklist
    ) VALUES (
      'Read Designing Data-Intensive Applications (Ch. 5)',
      'Replication topologies, leaderless replication, and handling replication lag.',
      cat_reading, 'low', 'pending',
      25, 0,
      CURRENT_DATE, '20:00',
      '[{"id":"r1","text":"Read pages 151-178","done":false},{"id":"r2","text":"Highlight key consistency models","done":false}]'::jsonb
    );

    INSERT INTO focus_sessions (
      task_id, planned_seconds, duration_seconds, completed_countdown, notes, started_at, ended_at
    ) VALUES
      (
        task_1, 2700, 2700, true,
        'Completed full 45-minute countdown session without interruptions.',
        DATE_TRUNC('day', NOW()) + INTERVAL '9 hours',
        DATE_TRUNC('day', NOW()) + INTERVAL '9 hours 45 minutes'
      ),
      (
        task_2, 3600, 1800, false,
        'First 30-minute deep work sprint on backend MVC models.',
        DATE_TRUNC('day', NOW()) + INTERVAL '11 hours',
        DATE_TRUNC('day', NOW()) + INTERVAL '11 hours 30 minutes'
      ),
      (
        task_1, 3600, 3600, true,
        'Deep dive into SQL indexing strategies yesterday.',
        DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '10 hours',
        DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '11 hours'
      ),
      (
        task_2, 2700, 2700, true,
        'Architecture planning session yesterday afternoon.',
        DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '15 hours',
        DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '15 hours 45 minutes'
      );
  END IF;
END $$;

