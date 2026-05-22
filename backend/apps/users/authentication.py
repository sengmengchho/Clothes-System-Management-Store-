import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .models import User


class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT authentication that works with our own User model.
    Reads: Authorization: Bearer <token>
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return None                 # no token → let other auth handle it

        token = auth_header.split(' ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token.")

        if payload.get('type') != 'access':
            raise AuthenticationFailed("Invalid token type.")

        try:
            user = User.objects.get(user_id=payload['user_id'], status='Active')
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found or inactive.")

        return (user, token)
