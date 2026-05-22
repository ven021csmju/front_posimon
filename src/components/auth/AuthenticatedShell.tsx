import type { ReactNode } from 'react';
import { useRealTimeNotifications } from '../../hooks/useRealTimeNotifications';

/** Side effects that should only run for signed-in users. */
export default function AuthenticatedShell({ children }: { children: ReactNode }) {
  useRealTimeNotifications();
  return <>{children}</>;
}
