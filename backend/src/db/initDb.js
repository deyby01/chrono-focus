import { fileURLToPath } from 'url';
import { sequelize } from '../config/database.js';
import { Category, Task, FocusSession } from '../models/entities.js';

/**
 * Seeds default categories (idempotent via `ignoreDuplicates`) and, only when
 * the `tasks` table is empty, a sample day of tasks and focus sessions.
 *
 * @returns {Promise<void>}
 */
async function seedWithOrm() {
  const defaultCategories = [
    {
      name: 'Courses & Learning',
      slug: 'courses-learning',
      color: '#3B82F6',
      icon: 'graduation-cap',
      description: 'Online courses, certifications, lectures, and technical study',
      daily_target_minutes: 90,
    },
    {
      name: 'Software Projects',
      slug: 'software-projects',
      color: '#10B981',
      icon: 'code',
      description: 'Personal and professional engineering projects, architecture, and shipping features',
      daily_target_minutes: 120,
    },
    {
      name: 'Hobbies & Creative',
      slug: 'hobbies-creative',
      color: '#A855F7',
      icon: 'palette',
      description: 'Music, design, languages, gaming, and creative exploration',
      daily_target_minutes: 45,
    },
    {
      name: 'Deep Work & Career',
      slug: 'deep-work-career',
      color: '#F59E0B',
      icon: 'briefcase',
      description: 'High-leverage career tasks, system design, and core deliverables',
      daily_target_minutes: 90,
    },
    {
      name: 'Reading & Research',
      slug: 'reading-research',
      color: '#06B6D4',
      icon: 'book-open',
      description: 'Books, technical papers, documentation, and synthesis notes',
      daily_target_minutes: 30,
    },
    {
      name: 'Wellness & Routine',
      slug: 'wellness-routine',
      color: '#F43F5E',
      icon: 'heart-pulse',
      description: 'Workout, meditation, stretching, and daily planning rituals',
      daily_target_minutes: 30,
    },
  ];

  await Category.bulkCreate(defaultCategories, { ignoreDuplicates: true });

  const taskCount = await Task.count();
  if (taskCount > 0) return;

  const categories = await Category.findAll();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const todayStr = new Date().toISOString().slice(0, 10);

  const task1 = await Task.create({
    title: 'Advanced System Design & PostgreSQL Indexing Course',
    description:
      'Complete Module 4 on B-Tree vs GIN indexes, query execution plans, and partitioning strategies.',
    category_id: catMap['courses-learning'],
    priority: 'high',
    status: 'completed',
    planned_duration_minutes: 45,
    actual_duration_seconds: 2700,
    scheduled_date: todayStr,
    scheduled_start_time: '09:00',
    checklist: [
      { id: 'c1', text: 'Watch lecture on EXPLAIN ANALYZE', done: true },
      { id: 'c2', text: 'Run benchmark queries in local Postgres', done: true },
      { id: 'c3', text: 'Write summary notes in markdown', done: true },
    ],
    completed_at: new Date(Date.now() - 3 * 3600 * 1000),
  });

  const task2 = await Task.create({
    title: 'Build ChronoFocus MVC Architecture & Reverse Timer',
    description:
      'Implement clean Express MVC controllers, Sequelize ORM models, and the React countdown chronometer.',
    category_id: catMap['software-projects'],
    priority: 'critical',
    status: 'in_progress',
    planned_duration_minutes: 60,
    actual_duration_seconds: 1800,
    scheduled_date: todayStr,
    scheduled_start_time: '11:00',
    checklist: [
      { id: 'p1', text: 'Define Sequelize ORM entities & associations', done: true },
      { id: 'p2', text: 'Implement Express MVC controllers & routes', done: true },
      { id: 'p3', text: 'Connect reverse chronometer with audio cues', done: false },
    ],
  });

  await Task.create({
    title: 'TypeScript Generics & Design Patterns Workshop',
    description: 'Practice SOLID principles in TypeScript with factory, strategy, and repository patterns.',
    category_id: catMap['courses-learning'],
    priority: 'high',
    status: 'pending',
    planned_duration_minutes: 50,
    actual_duration_seconds: 0,
    scheduled_date: todayStr,
    scheduled_start_time: '14:30',
    checklist: [
      { id: 't1', text: 'Review utility types and constraints', done: false },
      { id: 't2', text: 'Refactor state controller hook', done: false },
    ],
  });

  await Task.create({
    title: 'Acoustic Guitar Practice & Ear Training',
    description: 'Practice chord progressions, fingerstyle warmups, and rhythm timing at 95 BPM.',
    category_id: catMap['hobbies-creative'],
    priority: 'medium',
    status: 'pending',
    planned_duration_minutes: 30,
    actual_duration_seconds: 0,
    scheduled_date: todayStr,
    scheduled_start_time: '17:30',
    checklist: [
      { id: 'h1', text: '10m chromatic warmup', done: false },
      { id: 'h2', text: '20m song arrangement practice', done: false },
    ],
  });

  await Task.create({
    title: 'Read Designing Data-Intensive Applications (Ch. 5)',
    description: 'Replication topologies, leaderless replication, and handling replication lag.',
    category_id: catMap['reading-research'],
    priority: 'low',
    status: 'pending',
    planned_duration_minutes: 25,
    actual_duration_seconds: 0,
    scheduled_date: todayStr,
    scheduled_start_time: '20:00',
    checklist: [
      { id: 'r1', text: 'Read pages 151-178', done: false },
      { id: 'r2', text: 'Highlight key consistency models', done: false },
    ],
  });

  const now = new Date();
  const todayNineAm = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 9, 0, 0));
  const todayElevenAm = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 11, 0, 0));
  const yesterdayTenAm = new Date(todayNineAm.getTime() - 23 * 3600 * 1000);
  const yesterdayThreePm = new Date(todayNineAm.getTime() - 18 * 3600 * 1000);

  await FocusSession.bulkCreate([
    {
      task_id: task1.id,
      planned_seconds: 2700,
      duration_seconds: 2700,
      completed_countdown: true,
      notes: 'Completed full 45-minute countdown session without interruptions.',
      started_at: todayNineAm,
      ended_at: new Date(todayNineAm.getTime() + 2700 * 1000),
    },
    {
      task_id: task2.id,
      planned_seconds: 3600,
      duration_seconds: 1800,
      completed_countdown: false,
      notes: 'First 30-minute deep work sprint on backend Sequelize ORM models.',
      started_at: todayElevenAm,
      ended_at: new Date(todayElevenAm.getTime() + 1800 * 1000),
    },
    {
      task_id: task1.id,
      planned_seconds: 3600,
      duration_seconds: 3600,
      completed_countdown: true,
      notes: 'Deep dive into SQL indexing strategies yesterday.',
      started_at: yesterdayTenAm,
      ended_at: new Date(yesterdayTenAm.getTime() + 3600 * 1000),
    },
    {
      task_id: task2.id,
      planned_seconds: 2700,
      duration_seconds: 2700,
      completed_countdown: true,
      notes: 'Architecture planning session yesterday afternoon.',
      started_at: yesterdayThreePm,
      ended_at: new Date(yesterdayThreePm.getTime() + 2700 * 1000),
    },
  ]);
}

/**
 * Connects to PostgreSQL, creates missing tables with `sequelize.sync()`, and seeds data.
 * Retries so the API can start before the database container is fully ready.
 *
 * @param {number} [retries=10] - Maximum connection attempts.
 * @param {number} [delayMs=2000] - Wait between attempts, in milliseconds.
 * @returns {Promise<boolean>} `true` once the database is ready.
 * @throws {Error} The last connection error if every attempt fails.
 */
export async function initializeDatabase(retries = 10, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      await seedWithOrm();
      return true;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => {
      console.log('Database synchronized and seeded via Sequelize ORM.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}
