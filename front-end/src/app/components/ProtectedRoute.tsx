// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { getLoggedUserGroup, UserGroup } from '../../utils/auth';
import { message } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedGroups: UserGroup[];
}

export default function ProtectedRoute({ children, allowedGroups }: ProtectedRouteProps) {
  const userGroup = getLoggedUserGroup();

  if (!allowedGroups.includes(userGroup)) {
    message.error('Não tem permissões para aceder a esta página.');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}