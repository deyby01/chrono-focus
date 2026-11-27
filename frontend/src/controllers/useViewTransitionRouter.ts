import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { ActiveView } from '../models/types';

type StartViewTransition = (callback: () => void) => { finished: Promise<void> };

/**
 * Returns a view-selection handler that animates the switch with the
 * View Transitions API (when supported) and moves focus to the main view
 * heading afterwards for accessibility. Falls back to a plain state update
 * plus focus when the API is unavailable.
 */
export function useViewTransitionRouter(
  activeView: ActiveView,
  setActiveView: (view: ActiveView) => void
) {
  return useCallback(
    (nextView: ActiveView) => {
      if (nextView === activeView) return;

      const focusMainHeading = () => {
        document.getElementById('main-view-heading')?.focus();
      };

      const startViewTransition = (
        document as Document & { startViewTransition?: StartViewTransition }
      ).startViewTransition;

      if (!startViewTransition) {
        setActiveView(nextView);
        window.requestAnimationFrame(focusMainHeading);
        return;
      }

      const transition = startViewTransition.call(document, () => {
        flushSync(() => setActiveView(nextView));
      });

      transition.finished.finally(focusMainHeading);
    },
    [activeView, setActiveView]
  );
}
