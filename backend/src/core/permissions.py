from fastapi import Depends, HTTPException, status
from .security import get_current_user
from ..models.users import User


def require_role(role: str):
    """Dependency для проверки роли пользователя"""

    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user

    return role_checker