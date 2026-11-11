import { useState, useEffect, useRef, useCallback } from 'react';
import { LogSessionPayload, Task } from '../models/types';
import { formatCountdown } from '../utils/timeFormatters';
import { SoundService } from '../services/soundService';

interface UseReverseTimerProps {
  activeTask: Task | null;
  onSessionLogged: (payload: LogSessionPayload) => Promise<void>;
}

interface SavedTimerState {
  taskId: number;
  targetSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  sessionStart: string | null;
  lastUpdatedAt: number;
}

const STORAGE_KEY = 'chronofocus_active_timer_v1';

function loadPersistedTimer(taskId: number): SavedTimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedTimerState;
    if (parsed.taskId !== taskId) return null;

    if (parsed.isRunning && parsed.lastUpdatedAt) {
      const elapsedWhileAway = Math.max(
        0,
        Math.round((Date.now() - parsed.lastUpdatedAt) / 1000)
      );
      const nextRemaining = Math.max(0, parsed.remainingSeconds - elapsedWhileAway);
      return {
        ...parsed,
        remainingSeconds: nextRemaining,
        isRunning: nextRemaining > 0,
      };
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePersistedTimer(state: SavedTimerState | null) {
  try {
    if (!state) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function useReverseTimerController({ activeTask, onSessionLogged }: UseReverseTimerProps) {
  const [targetSeconds, setTargetSeconds] = useState<number>(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [autoCompleteTask, setAutoCompleteTask] = useState<boolean>(true);
  const [lastCompletedBanner, setLastCompletedBanner] = useState<string | null>(null);

  const sessionStartRef = useRef<string | null>(null);
  const lastTickTimestampRef = useRef<number | null>(null);
  const activeTaskIdRef = useRef<number | null>(null);
  const taskSnapshotsRef = useRef<
    Record<number, { targetSeconds: number; remainingSeconds: number; sessionStart: string | null }>
  >({});

  const activeTaskRef = useRef<Task | null>(activeTask);
  activeTaskRef.current = activeTask;

  const targetSecondsRef = useRef<number>(targetSeconds);
  targetSecondsRef.current = targetSeconds;

  const remainingSecondsRef = useRef<number>(remainingSeconds);
  remainingSecondsRef.current = remainingSeconds;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const autoCompleteTaskRef = useRef<boolean>(autoCompleteTask);
  autoCompleteTaskRef.current = autoCompleteTask;

  const finalizeSession = useCallback(
    async (
      loggedSeconds: number,
      completedCountdown: boolean,
      markTaskDone: boolean,
      taskOverride?: Task
    ) => {
      const targetTask = taskOverride || activeTaskRef.current;
      if (!targetTask || loggedSeconds <= 0) return;

      const currentTargetSec = targetSecondsRef.current;
      const endedAt = new Date().toISOString();
      const startedAt =
        sessionStartRef.current || new Date(Date.now() - loggedSeconds * 1000).toISOString();

      await onSessionLogged({
        task_id: targetTask.id,
        planned_seconds: currentTargetSec,
        duration_seconds: loggedSeconds,
        completed_countdown: completedCountdown,
        notes:
          sessionNotes.trim() ||
          (completedCountdown
            ? `Completed ${Math.round(currentTargetSec / 60)}m reverse countdown session.`
            : `Logged ${Math.max(1, Math.round(loggedSeconds / 60))}m focus sprint.`),
        started_at: startedAt,
        ended_at: endedAt,
        mark_task_completed: markTaskDone,
      });

      sessionStartRef.current = null;
      delete taskSnapshotsRef.current[targetTask.id];
      savePersistedTimer(null);
      setSessionNotes('');
    },
    [onSessionLogged, sessionNotes]
  );

  const finalizeSessionRef = useRef(finalizeSession);
  finalizeSessionRef.current = finalizeSession;

  useEffect(() => {
    if (!activeTask) {
      activeTaskIdRef.current = null;
      return;
    }

    if (activeTask.id !== activeTaskIdRef.current) {
      const previousTaskId = activeTaskIdRef.current;
      if (previousTaskId !== null) {
        taskSnapshotsRef.current[previousTaskId] = {
          targetSeconds: targetSecondsRef.current,
          remainingSeconds: remainingSecondsRef.current,
          sessionStart: sessionStartRef.current,
        };
      }

      activeTaskIdRef.current = activeTask.id;

      const persisted = loadPersistedTimer(activeTask.id);
      if (persisted) {
        sessionStartRef.current = persisted.sessionStart;
        lastTickTimestampRef.current = persisted.isRunning ? Date.now() : null;
        setTargetSeconds(persisted.targetSeconds);
        setRemainingSeconds(persisted.remainingSeconds);
        setIsRunning(persisted.isRunning);
        setLastCompletedBanner(null);
        return;
      }

      const inMemorySnapshot = taskSnapshotsRef.current[activeTask.id];
      if (inMemorySnapshot) {
        sessionStartRef.current = inMemorySnapshot.sessionStart;
        lastTickTimestampRef.current = null;
        setIsRunning(false);
        setTargetSeconds(inMemorySnapshot.targetSeconds);
        setRemainingSeconds(inMemorySnapshot.remainingSeconds);
        setLastCompletedBanner(null);
        return;
      }

      setIsRunning(false);
      sessionStartRef.current = null;
      lastTickTimestampRef.current = null;

      const plannedTotalSec = activeTask.planned_duration_minutes * 60;
      const remainingPlannedSec = Math.max(
        60,
        plannedTotalSec - activeTask.actual_duration_seconds
      );
      const initialSec =
        activeTask.actual_duration_seconds > 0 &&
        activeTask.actual_duration_seconds < plannedTotalSec
          ? remainingPlannedSec
          : plannedTotalSec;

      setTargetSeconds(initialSec);
      setRemainingSeconds(initialSec);
      setLastCompletedBanner(null);
    }
  }, [activeTask]);

  useEffect(() => {
    if (!activeTask) return;
    taskSnapshotsRef.current[activeTask.id] = {
      targetSeconds,
      remainingSeconds,
      sessionStart: sessionStartRef.current,
    };
    if (isRunning || remainingSeconds < targetSeconds) {
      savePersistedTimer({
        taskId: activeTask.id,
        targetSeconds,
        remainingSeconds,
        isRunning,
        sessionStart: sessionStartRef.current,
        lastUpdatedAt: Date.now(),
      });
    }
  }, [activeTask, targetSeconds, remainingSeconds, isRunning]);

  const elapsedSeconds = Math.max(0, targetSeconds - remainingSeconds);
  const progressPercent =
    targetSeconds > 0 ? Math.min(100, Math.max(0, (remainingSeconds / targetSeconds) * 100)) : 0;

  useEffect(() => {
    if (!isRunning) {
      lastTickTimestampRef.current = null;
      document.title = 'ChronoFocus — Personal Time & Deep Work Platform';
      return;
    }

    if (!sessionStartRef.current) {
      sessionStartRef.current = new Date().toISOString();
    }
    lastTickTimestampRef.current = Date.now();

    const interval = window.setInterval(() => {
      const now = Date.now();
      const deltaSeconds = lastTickTimestampRef.current
        ? Math.max(1, Math.round((now - lastTickTimestampRef.current) / 1000))
        : 1;
      lastTickTimestampRef.current = now;

      setRemainingSeconds((prev) => {
        const next = Math.max(0, prev - deltaSeconds);
        const currentTask = activeTaskRef.current;
        const currentTarget = targetSecondsRef.current;
        const taskLabel = currentTask ? currentTask.title : 'Focus Session';
        document.title = `(${formatCountdown(next)}) ${taskLabel} | ChronoFocus`;

        if (next === 0 && prev > 0) {
          setIsRunning(false);
          SoundService.playCompletionChime(soundEnabledRef.current);
          setLastCompletedBanner(
            `Countdown finished! Logged ${Math.round(currentTarget / 60)}m on "${
              currentTask?.title || 'Task'
            }".`
          );
          void finalizeSessionRef.current(currentTarget, true, autoCompleteTaskRef.current);
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const startTimer = () => {
    if (!activeTask) return;
    if (remainingSeconds === 0) {
      setRemainingSeconds(targetSeconds);
    }
    setLastCompletedBanner(null);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = (customMinutes?: number) => {
    setIsRunning(false);
    sessionStartRef.current = null;
    const nextSec =
      customMinutes !== undefined
        ? Math.max(60, Math.round(customMinutes * 60))
        : activeTask
        ? activeTask.planned_duration_minutes * 60
        : 25 * 60;
    setTargetSeconds(nextSec);
    setRemainingSeconds(nextSec);
    setLastCompletedBanner(null);
    if (activeTask) {
      delete taskSnapshotsRef.current[activeTask.id];
    }
    savePersistedTimer(null);
  };

  const adjustMinutes = (deltaMinutes: number) => {
    const deltaSec = deltaMinutes * 60;
    setTargetSeconds((prev) => Math.max(60, prev + deltaSec));
    setRemainingSeconds((prev) => Math.max(60, prev + deltaSec));
  };

  const setCustomCountdownMinutes = (minutes: number) => {
    const clampedMinutes = Math.max(1, Math.min(480, Math.round(minutes)));
    const seconds = clampedMinutes * 60;
    setIsRunning(false);
    sessionStartRef.current = null;
    setTargetSeconds(seconds);
    setRemainingSeconds(seconds);
  };

  const logCurrentProgress = async (markCompleted = false) => {
    if (!activeTask) return;
    setIsRunning(false);
    const secondsToLog = elapsedSeconds > 0 ? elapsedSeconds : targetSeconds;
    await finalizeSession(secondsToLog, remainingSeconds === 0, markCompleted);
    setLastCompletedBanner(
      markCompleted
        ? `Task "${activeTask.title}" completed and time logged!`
        : `Saved ${Math.max(1, Math.round(secondsToLog / 60))}m progress to "${activeTask.title}".`
    );
    setRemainingSeconds(targetSeconds);
  };

  return {
    targetSeconds,
    remainingSeconds,
    elapsedSeconds,
    progressPercent,
    isRunning,
    soundEnabled,
    sessionNotes,
    autoCompleteTask,
    lastCompletedBanner,
    setSoundEnabled,
    setSessionNotes,
    setAutoCompleteTask,
    setLastCompletedBanner,
    startTimer,
    pauseTimer,
    resetTimer,
    adjustMinutes,
    setCustomCountdownMinutes,
    logCurrentProgress,
  };
}
