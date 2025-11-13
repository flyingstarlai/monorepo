import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useRouterState } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/users')({
  component: UsersLayout,
});

function UsersLayout() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Check if we're on the main users list page
  const isUsersIndex = currentPath === '/users' || currentPath === '/users/';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-2">
            Manage user accounts, roles, and permissions in the system.
          </p>
        </div>
        {isUsersIndex && (
          <Link to="/users/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create User</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}
