import type { User } from '../types/user.types';

export const getUserInitials = (user: User): string => {
  return user.fullName?.charAt(0) || user.username?.charAt(0) || '?';
};

export const getUserDisplayName = (user: User): string => {
  return user.fullName || user.username;
};

export const getRoleVariant = (role: User['role']) => {
  switch (role) {
    case 'admin':
      return 'default';
    case 'regular':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const getStatusVariant = (isActive: boolean) => {
  return isActive ? 'default' : 'destructive';
};

export const formatLastLogin = (lastLoginAt?: Date): string => {
  if (!lastLoginAt) return 'Never';
  return new Date(lastLoginAt).toLocaleString();
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString();
};
