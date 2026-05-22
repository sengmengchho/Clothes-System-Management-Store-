import bcrypt
import jwt
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    UserListSerializer,
    UserStatusSerializer,
)
from .tokens import generate_tokens, decode_token
from .authentication import JWTAuthentication
from .permissions import IsAdmin


# ─────────────────────────────────────────────
#  POST /api/auth/register/
# ─────────────────────────────────────────────
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Registration successful.",
                    "user": {
                        "user_id": user.user_id,
                        "name":    user.name,
                        "email":   user.email,
                        "role":    user.role,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
#  POST /api/auth/login/
# ─────────────────────────────────────────────
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email    = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.status == 'Inactive':
            return Response(
                {"error": "Your account is inactive. Please contact support."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not bcrypt.checkpw(password.encode(), user.password.encode()):
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access_token, refresh_token = generate_tokens(user)

        return Response(
            {
                "access":  access_token,
                "refresh": refresh_token,
                "user": {
                    "user_id": user.user_id,
                    "name":    user.name,
                    "email":   user.email,
                    "role":    user.role,
                },
            },
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────
#  POST /api/auth/token/refresh/
# ─────────────────────────────────────────────
class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payload = decode_token(refresh_token)
        except jwt.ExpiredSignatureError:
            return Response(
                {"error": "Refresh token has expired. Please log in again."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except jwt.InvalidTokenError:
            return Response(
                {"error": "Invalid refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if payload.get('type') != 'refresh':
            return Response(
                {"error": "Invalid token type."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            user = User.objects.get(user_id=payload['user_id'], status='Active')
        except User.DoesNotExist:
            return Response(
                {"error": "User not found or inactive."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access_token, new_refresh = generate_tokens(user)

        return Response(
            {"access": access_token, "refresh": new_refresh},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────
#  GET /api/auth/profile/
# ─────────────────────────────────────────────
class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Allow user to update their own name / phone / address."""
        allowed = {k: v for k, v in request.data.items()
                   if k in ['name', 'phone', 'address']}
        serializer = UserProfileSerializer(
            request.user, data=allowed, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
#  GET  /api/auth/users/          (Admin only)
#  GET  /api/auth/users/<id>/     (Admin only)
#  PATCH /api/auth/users/<id>/status/  (Admin only)
# ─────────────────────────────────────────────
class UserListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated, IsAdmin]

    def get(self, request):
        role   = request.query_params.get('role')
        status = request.query_params.get('status')
        users  = User.objects.all().order_by('-created_at')

        if role:
            users = users.filter(role=role)
        if status:
            users = users.filter(status=status)

        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)


class UserDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated, IsAdmin]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserListSerializer(user).data)

    def patch(self, request, pk):
        """Admin can change user role or status."""
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        allowed = {k: v for k, v in request.data.items()
                   if k in ['role', 'status']}
        serializer = UserListSerializer(user, data=allowed, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
