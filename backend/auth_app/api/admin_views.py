"""API views for the administrative user management.

These endpoints are an addition to the documented KanMind API. They live
below ``/api/admin/`` and are restricted to staff accounts, so none of the
documented routes change their behaviour.
"""

from django.db.models import Count, Q
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from ..models import User
from .admin_serializers import (AdminUserSerializer,
                                AdminUserUpdateSerializer,
                                SessionRoleSerializer)


def users_with_board_counts():
    """Return every user annotated with how many boards they take part in."""
    return User.objects.annotate(
        owned_board_count=Count('owned_boards', distinct=True),
        board_count=Count('boards', distinct=True),
    )


class SessionRoleView(generics.RetrieveAPIView):
    """Report the role of the requesting user.

    Any signed in account may call this - the answer is only about itself and
    is what lets the frontend decide whether to show the admin navigation.
    """

    serializer_class = SessionRoleSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Return the requesting user."""
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    """List every account with its role and board involvement."""

    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        """Return the users, optionally narrowed by a search term."""
        queryset = users_with_board_counts()
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(fullname__icontains=search) | Q(email__icontains=search))
        return queryset


class AdminUserDetailView(generics.GenericAPIView):
    """Change the role and the activation of a user, or delete them."""

    permission_classes = [IsAdminUser]

    def get_queryset(self):
        """Return the annotated users so the response matches the list."""
        return users_with_board_counts()

    def get_serializer_class(self):
        """Use the write serializer for PATCH and the read one otherwise."""
        if self.request.method == 'PATCH':
            return AdminUserUpdateSerializer
        return AdminUserSerializer

    def patch(self, request, *args, **kwargs):
        """Apply the change and answer with the full user representation."""
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        updated = self.get_queryset().get(pk=user.pk)
        return Response(AdminUserSerializer(updated).data,
                        status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        """Delete the account unless it is the one making the request."""
        user = self.get_object()
        if user == request.user:
            raise PermissionDenied('You cannot delete your own account.')
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
