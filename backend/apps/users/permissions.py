from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only Admin role."""
    message = "Admin access required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and hasattr(request.user, 'role')
            and request.user.role == 'Admin'
        )


class IsAdminOrSale(BasePermission):
    """Admin or Sale role."""
    message = "Admin or Sale access required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and hasattr(request.user, 'role')
            and request.user.role in ['Admin', 'Sale']
        )


class IsCustomer(BasePermission):
    """Only Customer role."""
    message = "Customer access required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and hasattr(request.user, 'role')
            and request.user.role == 'Customer'
        )
