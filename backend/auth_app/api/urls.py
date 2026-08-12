"""URL routes exposed by the authentication app."""

from django.urls import path

from .admin_views import (AdminUserDetailView, AdminUserListView,
                          SessionRoleView)
from .views import EmailCheckView, LoginView, RegistrationView

urlpatterns = [
    path('registration/', RegistrationView.as_view(), name='registration'),
    path('login/', LoginView.as_view(), name='login'),
    path('email-check/', EmailCheckView.as_view(), name='email-check'),
    # Additions to the documented API, restricted to staff accounts.
    path('admin/me/', SessionRoleView.as_view(), name='admin-me'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(),
         name='admin-user-detail'),
]
