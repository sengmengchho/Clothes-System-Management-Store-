import bcrypt
from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = User
        fields = ['name', 'email', 'password', 'phone', 'address']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value.lower()

    def create(self, validated_data):
        raw_password = validated_data.pop('password')
        hashed       = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
        return User.objects.create(password=hashed, **validated_data)


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['user_id', 'name', 'email', 'phone', 'address', 'role', 'status', 'created_at']


class UserListSerializer(serializers.ModelSerializer):
    """Used by Admin to list / manage all users."""
    class Meta:
        model  = User
        fields = ['user_id', 'name', 'email', 'phone', 'role', 'status', 'created_at']


class UserStatusSerializer(serializers.ModelSerializer):
    """Used by Admin to activate / deactivate a user."""
    class Meta:
        model  = User
        fields = ['status']
