// src/utils/auth.ts
export type UserGroup = 'admin' | 'edi-developer' | 'monitor';

export const getLoggedUserGroup = (): UserGroup | null => {
  return localStorage.getItem('userGroup') as UserGroup | null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  localStorage.removeItem('userGroup');
  window.location.href = '/login';
};