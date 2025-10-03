// api/adminApi.ts
import api from '../../../utils/axiosConfig'; // Import your existing axios instance
import type { User } from '../pages/UserManagement';

// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  try {
    console.log('🔐 Fetching users...');
    const res = await api.get<User[]>(`/users`);
    console.log('✅ Users response:', res.data);
    return res.data ?? [];
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  const res = await api.patch<User>(`/users/${userId}/edit`, updates);
  return res.data;
};

// Delete user
export const deleteUser = async (userId: string) => {
  await api.patch(`/users/${userId}/delete`);
};

// Update user status only
export const updateUserStatus = async (userId: string, status: string): Promise<User> => {
  const res = await api.patch<User>(`/users/${userId}/status`, { status });
  return res.data;
};