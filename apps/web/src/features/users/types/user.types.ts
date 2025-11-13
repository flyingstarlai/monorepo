export interface User {
  id: string;
  username: string;
  fullName: string;
  deptNo: string;
  deptName: string;
  role: 'admin' | 'regular';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  password: string;
  fullName: string;
  deptNo: string;
  deptName: string;
  role?: User['role'];
  isActive?: boolean;
}

export interface UpdateUserData {
  fullName?: string;
  deptNo?: string;
  deptName?: string;
  role?: User['role'];
  isActive?: boolean;
}

export interface UsersFilters {
  search?: string;
  role?: User['role'];
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
