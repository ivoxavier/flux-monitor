// src/utils/auth.ts
export type UserGroup = 'admin' | 'edi-developer' | 'monitor';

export const getLoggedUserGroup = (): UserGroup => {


  return (localStorage.getItem('userGroup') as UserGroup) || 'admin'; 
};