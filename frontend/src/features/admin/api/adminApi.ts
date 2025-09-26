import axios from 'axios';
import type { User } from '../pages/UserManagement';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  const res = await axios.get<{ users: User[] }>(`${BASE_URL}/users`);
  return res.data.users ?? [];
};

// Block / Unblock user
export const updateUserStatus = async (userId: string, status: "Active" | "Inactive" | "Blocked") => {
  await axios.patch(`${BASE_URL}/users/${userId}/status`, { status });
};

// Delete user
export const deleteUser = async (userId: string) => {
  await axios.patch(`${BASE_URL}/users/${userId}/delete`);
};
