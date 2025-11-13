import { createFileRoute, Outlet } from '@tanstack/react-router';
import { UserDetail } from '@/features/users/components/user-detail';
import { useUser } from '@/features/users/hooks/use-users';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { DeleteUserDialog } from '@/features/users/components/delete-user-dialog';
import { useDeleteUser } from '@/features/users/hooks/use-users';
import type { User } from '@/features/users/types/user.types';

export const Route = createFileRoute('/_authenticated/users/$id')({
  component: UserDetailLayout,
});

function UserDetailLayout() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(id);
  const deleteUserMutation = useDeleteUser();
  const [deleteDialog, setDeleteDialog] = useState<{
    user: User | null;
    isOpen: boolean;
  }>({
    user: null,
    isOpen: false,
  });

  const handleDelete = (user: User) => {
    setDeleteDialog({ user, isOpen: true });
  };

  const confirmDelete = async (user: User) => {
    try {
      await deleteUserMutation.mutateAsync(user.id);
      setDeleteDialog({ user: null, isOpen: false });
      navigate({ to: '/users' });
    } catch (error) {
      console.error('Delete user failed:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !user) {
    return <div>User not found</div>;
  }

  return (
    <>
      <UserDetail
        user={user}
        onDelete={handleDelete}
        isLoading={deleteUserMutation.isPending}
      />
      <DeleteUserDialog
        user={deleteDialog.user}
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ user: null, isOpen: false })}
        onConfirm={confirmDelete}
        isLoading={deleteUserMutation.isPending}
      />
      <Outlet />
    </>
  );
}
