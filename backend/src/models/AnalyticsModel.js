import { Category, Task, FocusSession } from './entities.js';
import { TaskModel } from './TaskModel.js';
import { FocusSessionModel } from './FocusSessionModel.js';

/**
 * Computes productivity analytics from tasks and focus sessions.
 * Aggregation happens in JavaScript over ORM results (no raw SQL).
 */
export class AnalyticsModel {
  /**
   * Builds the end-of-day summary for one date: task completion stats,
   * planned vs. focused time, per-category breakdown, schedule, and sessions.
   * `focusedSeconds` uses the larger of session totals and task totals so time
   * logged directly on a task is not lost.
   *
   * @param {string|null} [targetDate=null] - Date (YYYY-MM-DD); defaults to today (UTC).
   * @returns {Promise<import('../types.js').DailyResume>}
   */
  static async getDailyResume(targetDate = null) {
    const resolvedDate = targetDate || new Date().toISOString().slice(0, 10);

    const [schedule, sessions, categories] = await Promise.all([
      TaskModel.findAll({ date: resolvedDate }),
      FocusSessionModel.findAll({ date: resolvedDate, limit: 200 }),
      Category.findAll({ order: [['id', 'ASC']] }),
    ]);

    const totalTasks = schedule.length;
    const completedTasks = schedule.filter((t) => t.status === 'completed').length;
    const inProgressTasks = schedule.filter((t) => t.status === 'in_progress').length;
    const pendingTasks = schedule.filter((t) => t.status === 'pending').length;

    const plannedSeconds = schedule.reduce(
      (sum, t) => sum + Number(t.planned_duration_minutes || 0) * 60,
      0
    );
    const taskAccumulatedSeconds = schedule.reduce(
      (sum, t) => sum + Number(t.actual_duration_seconds || 0),
      0
    );
    const sessionFocusedSeconds = sessions.reduce(
      (sum, s) => sum + Number(s.duration_seconds || 0),
      0
    );
    const longestSessionTodaySeconds = sessions.reduce(
      (max, s) => Math.max(max, Number(s.duration_seconds || 0)),
      0
    );

    const focusedSeconds = Math.max(sessionFocusedSeconds, taskAccumulatedSeconds);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const categoryBreakdown = categories
      .map((catInstance) => {
        const cat = catInstance.get({ plain: true });
        const catTasks = schedule.filter((t) => t.category_id === cat.id);
        const catSessions = sessions.filter((s) => s.category_id === cat.id);

        const catPlannedSeconds = catTasks.reduce(
          (sum, t) => sum + Number(t.planned_duration_minutes || 0) * 60,
          0
        );
        const catSessionSeconds = catSessions.reduce(
          (sum, s) => sum + Number(s.duration_seconds || 0),
          0
        );
        const catTaskSeconds = catTasks.reduce(
          (sum, t) => sum + Number(t.actual_duration_seconds || 0),
          0
        );

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          color: cat.color,
          icon: cat.icon,
          daily_target_minutes: cat.daily_target_minutes,
          tasks_count: catTasks.length,
          completed_count: catTasks.filter((t) => t.status === 'completed').length,
          planned_seconds: catPlannedSeconds,
          focused_seconds: Math.max(catSessionSeconds, catTaskSeconds),
        };
      })
      .sort(
        (a, b) =>
          b.focused_seconds - a.focused_seconds ||
          b.tasks_count - a.tasks_count ||
          a.id - b.id
      );

    return {
      date: resolvedDate,
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionRate,
        plannedSeconds,
        focusedSeconds,
        sessionsCount: sessions.length,
        longestSessionTodaySeconds,
      },
      categoryBreakdown,
      schedule,
      sessions,
    };
  }

  /**
   * Computes all-time "My Best Time" records:
   * - `bestSession`: longest single focus session
   * - `bestDay`: day with the most total focus time
   * - `peakProductivityHour`: hour bucket (UTC) with the most focus time
   * - `overall`: totals, completed-task time, and average session length
   * - `weeklyActivity`: focus seconds and completions for the last 7 days
   * - `categoryTotals`: all-time seconds invested per category
   *
   * @returns {Promise<import('../types.js').PerformanceMetrics>}
   */
  static async getPerformanceMetrics() {
    const [allSessionsInstances, allTasksInstances, allCategoriesInstances] = await Promise.all([
      FocusSession.findAll({
        include: [
          {
            model: Task,
            as: 'task',
            attributes: ['id', 'title', 'category_id'],
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'color', 'icon'],
              },
            ],
          },
        ],
        order: [
          ['duration_seconds', 'DESC'],
          ['started_at', 'DESC'],
        ],
      }),
      Task.findAll(),
      Category.findAll({ order: [['id', 'ASC']] }),
    ]);

    const allSessions = allSessionsInstances.map((s) => s.get({ plain: true }));
    const allTasks = allTasksInstances.map((t) => t.get({ plain: true }));
    const allCategories = allCategoriesInstances.map((c) => c.get({ plain: true }));

    const topSession = allSessions[0] || null;
    const bestSession = topSession
      ? {
          id: topSession.id,
          duration_seconds: Number(topSession.duration_seconds),
          planned_seconds: Number(topSession.planned_seconds),
          started_at: topSession.started_at,
          task_title: topSession.task?.title || '',
          category_name: topSession.task?.category?.name || '',
          category_color: topSession.task?.category?.color || '#3B82F6',
        }
      : null;

    const dayBuckets = new Map();
    const hourBuckets = new Map();

    for (const s of allSessions) {
      const startedDate = new Date(s.started_at);
      const dateStr = startedDate.toISOString().slice(0, 10);
      const dur = Number(s.duration_seconds || 0);

      const prevDay = dayBuckets.get(dateStr) || { date: dateStr, total_seconds: 0, sessions_count: 0 };
      prevDay.total_seconds += dur;
      prevDay.sessions_count += 1;
      dayBuckets.set(dateStr, prevDay);

      const hour = startedDate.getUTCHours();
      const prevHour = hourBuckets.get(hour) || { hour, total_seconds: 0, sessions_count: 0 };
      prevHour.total_seconds += dur;
      prevHour.sessions_count += 1;
      hourBuckets.set(hour, prevHour);
    }

    const sortedDays = Array.from(dayBuckets.values()).sort(
      (a, b) => b.total_seconds - a.total_seconds || b.date.localeCompare(a.date)
    );
    const bestDay = sortedDays[0] || null;

    const sortedHours = Array.from(hourBuckets.values()).sort(
      (a, b) => b.total_seconds - a.total_seconds || b.sessions_count - a.sessions_count
    );
    const rawPeak = sortedHours[0] || null;
    const peakProductivityHour = rawPeak
      ? {
          hour: rawPeak.hour,
          formattedRange: `${String(rawPeak.hour).padStart(2, '0')}:00 - ${String(
            (rawPeak.hour + 1) % 24
          ).padStart(2, '0')}:00`,
          totalSeconds: rawPeak.total_seconds,
          sessionsCount: rawPeak.sessions_count,
        }
      : null;

    const totalFocusedSeconds = allTasks.reduce(
      (sum, t) => sum + Number(t.actual_duration_seconds || 0),
      0
    );
    const completedTasksFocusedSeconds = allTasks
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.actual_duration_seconds || 0), 0);
    const totalTasksCompleted = allTasks.filter((t) => t.status === 'completed').length;
    const totalTasksCreated = allTasks.length;
    const totalSessions = allSessions.length;
    const totalSessionDuration = allSessions.reduce(
      (sum, s) => sum + Number(s.duration_seconds || 0),
      0
    );
    const averageSessionSeconds =
      totalSessions > 0 ? Math.round(totalSessionDuration / totalSessions) : 0;

    const overall = {
      total_focused_seconds: totalFocusedSeconds,
      completed_tasks_focused_seconds: completedTasksFocusedSeconds,
      total_tasks_completed: totalTasksCompleted,
      total_tasks_created: totalTasksCreated,
      total_sessions: totalSessions,
      average_session_seconds: averageSessionSeconds,
    };

    const weeklyActivity = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - offset);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = dayNames[d.getUTCDay()];
      const dayRecord = dayBuckets.get(dateStr);
      const tasksCompletedOnDay = allTasks.filter(
        (t) => t.scheduled_date === dateStr && t.status === 'completed'
      ).length;

      weeklyActivity.push({
        date: dateStr,
        day_label: dayLabel,
        focused_seconds: dayRecord ? dayRecord.total_seconds : 0,
        tasks_completed: tasksCompletedOnDay,
      });
    }

    const categoryTotals = allCategories
      .map((cat) => {
        const catTasks = allTasks.filter((t) => t.category_id === cat.id);
        return {
          id: cat.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          total_tasks: catTasks.length,
          completed_tasks: catTasks.filter((t) => t.status === 'completed').length,
          total_seconds: catTasks.reduce(
            (sum, t) => sum + Number(t.actual_duration_seconds || 0),
            0
          ),
        };
      })
      .sort((a, b) => b.total_seconds - a.total_seconds || a.id - b.id);

    return {
      bestSession,
      bestDay,
      peakProductivityHour,
      overall,
      weeklyActivity,
      categoryTotals,
    };
  }
}
