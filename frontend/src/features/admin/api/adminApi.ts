import axios from 'axios';
import type { User } from '../pages/UserManagement';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  const res = await axios.get<User[]>(`${BASE_URL}/users`); // Direct array response
  return res.data ?? [];
};

// Update user
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  const res = await axios.patch<User>(`${BASE_URL}/users/${userId}/edit`, updates); // Direct user response
  return res.data;
};

// Delete user
export const deleteUser = async (userId: string) => {
  await axios.patch(`${BASE_URL}/users/${userId}/delete`);
};

// Update user status only
export const updateUserStatus = async (userId: string, status: string): Promise<User> => {
  const res = await axios.patch<User>(`${BASE_URL}/users/${userId}/status`, { status });
  return res.data;
};