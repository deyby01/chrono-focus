# ChronoFocus — PostgreSQL Database Schema

## Entity-Relationship Diagram

```mermaid
erDiagram
    CATEGORIES ||--o{ TASKS : categorizes
    TASKS ||--o{ FOCUS_SESSIONS : logs

    CATEGORIES {
        serial id PK
        varchar name UK
        varchar slug UK
        varchar color
        varchar icon
        text description
        integer daily_target_minutes
        timestamptz created_at
    }

    TASKS {
        serial id PK
        varchar title
        text description
        integer category_id FK
        varchar priority
        varchar status
        integer planned_duration_minutes
        integer actual_duration_seconds
        date scheduled_date
        varchar scheduled_start_time
        jsonb checklist
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }

    FOCUS_SESSIONS {
        serial id PK
        integer task_id FK
        integer planned_seconds
        integer duration_seconds
        boolean completed_countdown
        text notes
        timestamptz started_at
        timestamptz ended_at
    }
```

## Indexes & Constraints
- `idx_tasks_scheduled_date`: Accelerates daily schedule & daily resume queries.
- `idx_tasks_category_id`: Speeds up category breakdown aggregations.
- `idx_tasks_status`: Optimizes completion rate filtering.
- `idx_focus_sessions_task_id` & `idx_focus_sessions_started_at`: Optimizes best-time, peak productivity hour, and 7-day trend analytics.

