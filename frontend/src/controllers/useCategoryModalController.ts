import { useCallback, useState } from 'react';
import { Category, CreateCategoryPayload } from '../models/types';

interface CategoryMutations {
  createCategory: (payload: CreateCategoryPayload) => Promise<Category>;
  updateCategory: (id: number, payload: Partial<CreateCategoryPayload>) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
}

/**
 * Owns the category modal state, the create-vs-update save logic, and the
 * delete flow. Delete surfaces a human-readable alert (exposed via
 * `actionAlert`) when the backend refuses to remove a category that still has
 * tasks assigned.
 */
export function useCategoryModalController({
  createCategory,
  updateCategory,
  deleteCategory,
}: CategoryMutations) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const openNew = useCallback(() => {
    setEditingCategory(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const save = useCallback(
    async (payload: CreateCategoryPayload, categoryId?: number) => {
      if (categoryId) {
        await updateCategory(categoryId, payload);
      } else {
        await createCategory(payload);
      }
    },
    [createCategory, updateCategory]
  );

  const remove = useCallback(
    async (id: number) => {
      setActionAlert(null);
      try {
        await deleteCategory(id);
      } catch (err) {
        setActionAlert(
          err instanceof Error
            ? err.message
            : 'Cannot delete a category that still has tasks assigned.'
        );
      }
    },
    [deleteCategory]
  );

  const dismissAlert = useCallback(() => setActionAlert(null), []);

  return {
    isOpen,
    editingCategory,
    actionAlert,
    openNew,
    openEdit,
    close,
    save,
    remove,
    dismissAlert,
  };
}
