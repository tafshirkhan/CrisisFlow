
import type { UserRole } from '../types/auth.types';
import type { Role } from '../../../types/app.types';

const roleMap: Record<UserRole, Role> = {
  CITIZEN: 'Citizen',
  DISPATCHER: 'Dispatcher',
  RESPONDER: 'Responder',
  ADMIN: 'Administrator',
};

export function mapUserRoleToAppRole(role: UserRole): Role {
  return roleMap[role];
}
