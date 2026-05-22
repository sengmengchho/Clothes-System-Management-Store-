from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    TokenRefreshView,
    ProfileView,
    UserListView,
    UserDetailView,
)

urlpatterns = [
    # Public
    path('register/',      RegisterView.as_view(),      name='auth-register'),
    path('login/',         LoginView.as_view(),          name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(),   name='auth-token-refresh'),

    # Authenticated user
    path('profile/',       ProfileView.as_view(),        name='auth-profile'),

    # Admin only
    path('users/',         UserListView.as_view(),       name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(),    name='user-detail'),
]
