import jwt
import datetime
from django.conf import settings


def generate_tokens(user):
    """
    Returns access + refresh JWT tokens for our custom User model.
    We cannot use SimpleJWT's default flow because it requires
    Django's built-in auth.User, so we generate tokens manually.
    """
    now = datetime.datetime.utcnow()

    access_payload = {
        'user_id': user.user_id,
        'email':   user.email,
        'role':    user.role,
        'type':    'access',
        'iat':     now,
        'exp':     now + datetime.timedelta(hours=1),
    }

    refresh_payload = {
        'user_id': user.user_id,
        'type':    'refresh',
        'iat':     now,
        'exp':     now + datetime.timedelta(days=7),
    }

    access_token  = jwt.encode(access_payload,  settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')

    return access_token, refresh_token


def decode_token(token):
    """Decode and return payload, or raise jwt exceptions."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
