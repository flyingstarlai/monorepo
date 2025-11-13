import { createFileRoute } from '@tanstack/react-router';
import { UserForm } from '@/features/users/components/user-form';
import { useUser, useUpdateUser } from '@/features/users/hooks/use-users';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import type { UpdateUserData } from '@/features/users/types/user.types';

export const Route = createFileRoute('/_authenticated/users/$id/edit')({
  component: UserEditRoute,
});

function UserEditRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(id);
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (data: UpdateUserData) => {
    try {
      await updateUserMutation.mutateAsync({ id, data });
      navigate({ to: '/users/$id', params: { id } });
    } catch (error) {
      console.error('Update user failed:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Back Button */}
      <Link to="/users">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Button>
      </Link>

      {/* User Form */}
      <UserForm
        user={user}
        onSubmit={handleSubmit}
        isLoading={updateUserMutation.isPending}
      />
    </div>
  );
}
