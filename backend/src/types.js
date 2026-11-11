/**
 * Shared JSDoc type definitions for the ChronoFocus backend.
 * This module exports nothing at runtime; it exists so models, controllers,
 * and views can reference a single source of truth for data shapes.
 * @module types
 */

/**
 * @typedef {'low' | 'medium' | 'high' | 'critical'} TaskPriority
 */

/**
 * @typedef {'pending' | 'in_progress' | 'completed' | 'archived'} TaskStatus
 */

/**
 * A single actionable sub-step inside a task.
 * @typedef {Object} ChecklistItem
 * @property {string} id - Client-generated unique identifier.
 * @property {string} text - Human-readable step description.
 * @property {boolean} done - Whether the step has been completed.
 */

/**
 * Category (task type) enriched with aggregated time statistics.
 * @typedef {Object} CategoryWithStats
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} color - Hex color used by the UI.
 * @property {string} icon - Icon identifier rendered by the frontend.
 * @property {string} description
 * @property {number} daily_target_minutes - Daily time goal for this category.
 * @property {Date} created_at
 * @property {number} total_tasks
 * @property {number} completed_tasks
 * @property {number} total_spent_seconds - All-time focus seconds across its tasks.
 * @property {number} today_spent_seconds - Focus seconds logged on the target date.
 */

/**
 * Payload accepted when creating or updating a category.
 * @typedef {Object} CategoryInput
 * @property {string} [name]
 * @property {string} [color]
 * @property {string} [icon]
 * @property {string} [description]
 * @property {number|string} [daily_target_minutes]
 */

/**
 * Task flattened with its category fields, as returned by the API.
 * @typedef {Object} SerializedTask
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {number} category_id
 * @property {string} category_name
 * @property {string} category_slug
 * @property {string} category_color
 * @property {string} category_icon
 * @property {TaskPriority} priority
 * @property {TaskStatus} status
 * @property {number} planned_duration_minutes - Time the user plans to invest.
 * @property {number} actual_duration_seconds - Time actually logged via sessions.
 * @property {string} scheduled_date - ISO date (YYYY-MM-DD).
 * @property {string|null} scheduled_start_time - Optional time slot (HH:MM).
 * @property {ChecklistItem[]} checklist
 * @property {Date|null} completed_at
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * Payload accepted when creating or updating a task.
 * @typedef {Object} TaskInput
 * @property {string} [title]
 * @property {string} [description]
 * @property {number|string} [category_id]
 * @property {TaskPriority} [priority]
 * @property {TaskStatus} [status]
 * @property {number|string} [planned_duration_minutes]
 * @property {number|string} [actual_duration_seconds]
 * @property {string} [scheduled_date]
 * @property {string|null} [scheduled_start_time]
 * @property {ChecklistItem[]} [checklist]
 */

/**
 * Optional filters for listing tasks. All filters are combined with AND.
 * @typedef {Object} TaskFilters
 * @property {string} [date] - Exact scheduled date (YYYY-MM-DD).
 * @property {number|string} [categoryId]
 * @property {TaskStatus} [status]
 * @property {TaskPriority} [priority]
 * @property {string} [search] - Case-insensitive match on title or description.
 */

/**
 * Focus session flattened with its task and category fields.
 * @typedef {Object} SerializedSession
 * @property {number} id
 * @property {number} task_id
 * @property {string} task_title
 * @property {number} planned_duration_minutes
 * @property {number} category_id
 * @property {string} category_name
 * @property {string} category_color
 * @property {string} category_icon
 * @property {number} planned_seconds - Countdown length the user set.
 * @property {number} duration_seconds - Time actually focused.
 * @property {boolean} completed_countdown - True if the timer reached 00:00.
 * @property {string} notes
 * @property {Date} started_at
 * @property {Date} ended_at
 */

/**
 * Payload accepted when logging a focus session.
 * @typedef {Object} SessionInput
 * @property {number|string} task_id
 * @property {number|string} duration_seconds
 * @property {number|string} [planned_seconds] - Defaults to duration_seconds.
 * @property {boolean} [completed_countdown]
 * @property {string} [notes]
 * @property {string} [started_at] - ISO timestamp; derived from ended_at if omitted.
 * @property {string} [ended_at] - ISO timestamp; defaults to now.
 * @property {boolean} [mark_task_completed] - Also mark the parent task as completed.
 */

/**
 * Optional filters for listing focus sessions.
 * @typedef {Object} SessionFilters
 * @property {string} [date] - Day on which the session started (YYYY-MM-DD).
 * @property {number|string} [taskId]
 * @property {number|string} [limit] - Defaults to 50, capped at 200.
 */

/**
 * End-of-day summary for a single date.
 * @typedef {Object} DailyResume
 * @property {string} date - Resolved date (YYYY-MM-DD).
 * @property {Object} summary
 * @property {number} summary.totalTasks
 * @property {number} summary.completedTasks
 * @property {number} summary.inProgressTasks
 * @property {number} summary.pendingTasks
 * @property {number} summary.completionRate - Percentage 0-100.
 * @property {number} summary.plannedSeconds
 * @property {number} summary.focusedSeconds
 * @property {number} summary.sessionsCount
 * @property {number} summary.longestSessionTodaySeconds
 * @property {Object[]} categoryBreakdown - Planned vs. focused time per category.
 * @property {SerializedTask[]} schedule - Tasks scheduled on the date.
 * @property {SerializedSession[]} sessions - Sessions started on the date.
 */

/**
 * All-time productivity records ("My Best Time").
 * @typedef {Object} PerformanceMetrics
 * @property {Object|null} bestSession - Longest single focus session.
 * @property {{date: string, total_seconds: number, sessions_count: number}|null} bestDay
 * @property {{hour: number, formattedRange: string, totalSeconds: number, sessionsCount: number}|null} peakProductivityHour
 * @property {Object} overall - Global totals and averages.
 * @property {Object[]} weeklyActivity - Focus seconds and completions for the last 7 days.
 * @property {Object[]} categoryTotals - All-time seconds invested per category.
 */

export {};

