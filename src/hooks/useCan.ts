import { useAuth } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UserCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions, roles }: UserCanParams) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidatePermissions = validateUserPermissions({
    user,
    permissions,
    roles,
  });

  return userHasValidatePermissions;
}