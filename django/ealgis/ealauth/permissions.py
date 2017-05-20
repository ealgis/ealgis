from rest_framework import permissions
from .models import MapDefinition


class IsMapOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a map to modify it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for all non-modifying requests.
        # i.e. GET, HEAD, and OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed for map owners.
        return obj.owner_user_id == request.user


class IsMapOwner(permissions.BasePermission):
    """
    Custom permission to allow map owners through.
    """
    def has_object_permission(self, request, view, obj):
        return obj.owner_user_id == request.user


class CanCloneMap(permissions.BasePermission):
    """
    Custom permission to allow map owners through.
    """
    def has_object_permission(self, request, view, obj):
        if obj.owner_user_id == request.user:
            return True

        if obj.shared == MapDefinition.AUTHENTICATED_USERS_SHARED or obj.shared == MapDefinition.PUBLIC_SHARED:
            return True
        return False
