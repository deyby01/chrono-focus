# ChronoFocus — REST API Reference

Base URL: `http://localhost:4001/api`

All responses follow the standard `ApiView` envelope:
```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 1. Health Check

### `GET /api/health`
Verifies API and PostgreSQL connectivity.

---

## 2. Task Categories (Task Types)

### `GET /api/categories?date=YYYY-MM-DD`
Returns all task types (Courses, Projects, Hobbies, etc.) with task counts, today's focused seconds, and all-time spent seconds.

### `POST /api/categories`
Registers a new task type.
```json
{
  "name": "Cloud Architecture Course",
  "color": "#3B82F6",
  "icon": "graduation-cap",
  "description": "AWS & Kubernetes study modules",
  "daily_target_minutes": 90
}
```

### `PUT /api/categories/:id`
Updates an existing task type.

### `DELETE /api/categories/:id`
Deletes a task type (returns `400` if tasks are still assigned to it).

---

## 3. Tasks & Daily Schedule

### `GET /api/tasks`
Query Parameters:
- `date` (`YYYY-MM-DD`): Filter by scheduled date
- `categoryId` (`number`): Filter by task type
- `status` (`pending | in_progress | completed | archived`)
- `priority` (`low | medium | high | critical`)
- `search` (`string`): Case-insensitive title/description search

### `POST /api/tasks`
Creates and schedules a new task with planned time in minutes.
```json
{
  "title": "PostgreSQL Query Optimization Module",
  "description": "Complete indexing lab and notes",
  "category_id": 1,
  "priority": "high",
  "planned_duration_minutes": 45,
  "scheduled_date": "2026-11-06",
  "scheduled_start_time": "09:00",
  "checklist": [
    { "id": "step-1", "text": "Watch lecture video", "done": false },
    { "id": "step-2", "text": "Practice EXPLAIN ANALYZE", "done": false }
  ]
}
```

### `PUT /api/tasks/:id`
Updates task fields, status, planned duration, or checklist progress.

### `DELETE /api/tasks/:id`
Deletes a task and its associated focus sessions.

---

## 4. Focus Sessions (Reverse Chronometer Logs)

### `GET /api/sessions?date=YYYY-MM-DD&taskId=1&limit=50`
Lists recorded focus sessions.

### `POST /api/sessions`
Logs a completed or partial countdown session and atomically increments `actual_duration_seconds` on the task.
```json
{
  "task_id": 2,
  "planned_seconds": 2700,
  "duration_seconds": 2700,
  "completed_countdown": true,
  "notes": "Finished full 45m reverse countdown without distractions",
  "mark_task_completed": true
}
```

### `DELETE /api/sessions/:id`
Removes a session and subtracts its duration from the parent task.

---

## 5. Analytics, Daily Resume & Best Time

### `GET /api/analytics/daily-resume?date=YYYY-MM-DD`
Returns the complete **Daily Resume** for the target date:
- `summary`: `totalTasks`, `completedTasks`, `completionRate`, `plannedSeconds`, `focusedSeconds`, `sessionsCount`, `longestSessionTodaySeconds`
- `categoryBreakdown`: Time spent vs. daily target for each task type on that date
- `schedule`: Ordered list of tasks scheduled for that date
- `sessions`: Focus sessions logged on that date

### `GET /api/analytics/performance`
Returns **My Best Time** and all-time productivity records:
- `bestSession`: Single longest focus session ever recorded
- `bestDay`: Calendar date with the highest total focused time
- `peakProductivityHour`: Hour window of the day (`HH:00 - HH:00`) with the highest cumulative focus time
- `overall`: Total time spent completing tasks, total focused time, total sessions, average session duration
- `weeklyActivity`: Last 7 days focus time and completed task counts
- `categoryTotals`: All-time time investment per category

