import { useCallback, useState } from 'react';
import { CreateTaskPayload, Task } from '../models/types';

interface TaskMutations {
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: number, payload: Partial<Task>) => Promise<Task>;
}

/**
 * Owns the task modal's open/edit state and the create-vs-update save logic.
 * Extracted from App so the root component only wires props, not modal state.
 */
export function useTaskModalController({ createTask, updateTask }: TaskMutations) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<number | undefined>(undefined);

  const openNew = useCallback((categoryId?: number) => {
    setEditingTask(null);
    setPreselectedCategoryId(categoryId);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const save = useCallback(
    async (payload: CreateTaskPayload, taskId?: number) => {
      if (taskId) {
        await updateTask(taskId, payload);
      } else {
        await createTask(payload);
      }
    },
    [createTask, updateTask]
  );

  return { isOpen, editingTask, preselectedCategoryId, openNew, openEdit, close, save };
}
