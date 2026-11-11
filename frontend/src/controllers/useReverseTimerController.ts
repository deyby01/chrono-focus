import { useState, useEffect, useRef, useCallback } from 'react';
import { LogSessionPayload, Task } from '../models/types';
import { formatCountdown } from '../utils/timeFormatters';
import { SoundService } from '../services/soundService';

interface UseReverseTimerProps {
  activeTask: Task | null;
  onSessionLogged: (payload: LogSessionPayload) => Promise<void>;
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

  useEffect(() => {
    if (!activeTask) {
      activeTaskIdRef.current = null;
      return;
    }
    if (activeTask.id !== activeTaskIdRef.current) {
      activeTaskIdRef.current = activeTask.id;
      setIsRunning(false);
      sessionStartRef.current = null;
      lastTickTimestampRef.current = null;

      const plannedTotalSec = activeTask.planned_duration_minutes * 60;
      const remainingPlannedSec = Math.max(60, plannedTotalSec - activeTask.actual_duration_seconds);
      const initialSec =
        activeTask.actual_duration_seconds > 0 && activeTask.actual_duration_seconds < plannedTotalSec
          ? remainingPlannedSec
          : plannedTotalSec;

      setTargetSeconds(initialSec);
      setRemainingSeconds(initialSec);
      setLastCompletedBanner(null);
    }
  }, [activeTask]);

  const elapsedSeconds = Math.max(0, targetSeconds - remainingSeconds);
  const progressPercent =
    targetSeconds > 0 ? Math.min(100, Math.max(0, (remainingSeconds / targetSeconds) * 100)) : 0;

  const finalizeSession = useCallback(
    async (
      loggedSeconds: number,
      completedCountdown: boolean,
      markTaskDone: boolean
    ) => {
      if (!activeTask || loggedSeconds <= 0) return;

      const endedAt = new Date().toISOString();
      const startedAt =
        sessionStartRef.current || new Date(Date.now() - loggedSeconds * 1000).toISOString();

      await onSessionLogged({
        task_id: activeTask.id,
        planned_seconds: targetSeconds,
        duration_seconds: loggedSeconds,
        completed_countdown: completedCountdown,
        notes:
          sessionNotes.trim() ||
          (completedCountdown
            ? `Completed ${Math.round(targetSeconds / 60)}m reverse countdown session.`
            : `Logged ${Math.max(1, Math.round(loggedSeconds / 60))}m focus sprint.`),
        started_at: startedAt,
        ended_at: endedAt,
        mark_task_completed: markTaskDone,
      });

      sessionStartRef.current = null;
      setSessionNotes('');
    },
    [activeTask, onSessionLogged, sessionNotes, targetSeconds]
  );

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
        const taskLabel = activeTask ? activeTask.title : 'Focus Session';
        document.title = `(${formatCountdown(next)}) ${taskLabel} | ChronoFocus`;

        if (next === 0 && prev > 0) {
          setIsRunning(false);
          SoundService.playCompletionChime(soundEnabled);
          setLastCompletedBanner(
            `Countdown finished! Logged ${Math.round(targetSeconds / 60)}m on "${
              activeTask?.title || 'Task'
            }".`
          );
          void finalizeSession(targetSeconds, true, autoCompleteTask);
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, activeTask, soundEnabled, targetSeconds, autoCompleteTask, finalizeSession]);

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

