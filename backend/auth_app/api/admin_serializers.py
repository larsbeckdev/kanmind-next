"""Serializers for the administrative user management."""

from rest_framework import serializers

from ..models import User

ROLE_ADMIN = 'admin'
ROLE_STAFF = 'staff'
ROLE_USER = 'user'


class AdminUserSerializer(serializers.ModelSerializer):
    """Full user representation for the admin area.

    The three boolean flags Django uses for permissions are also exposed as a
    single ``role`` so the frontend can offer one dropdown instead of three
    checkboxes that can be combined into meaningless states.
    """

    role = serializers.SerializerMethodField()
    owned_board_count = serializers.IntegerField(read_only=True)
    board_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'fullname', 'role', 'is_active', 'is_staff',
                  'is_superuser', 'date_joined', 'last_login',
                  'owned_board_count', 'board_count']
        read_only_fields = fields

    def get_role(self, obj):
        """Return the coarse role that matches the permission flags."""
        if obj.is_superuser:
            return ROLE_ADMIN
        return ROLE_STAFF if obj.is_staff else ROLE_USER


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Apply a role change or an activation change to a single user."""

    role = serializers.ChoiceField(
        choices=[ROLE_ADMIN, ROLE_STAFF, ROLE_USER], required=False)

    class Meta:
        model = User
        fields = ['role', 'is_active']

    def validate(self, attrs):
        """Keep an administrator from locking themselves out."""
        request = self.context['request']
        if self.instance != request.user:
            return attrs
        if attrs.get('role', ROLE_ADMIN) != ROLE_ADMIN:
            raise serializers.ValidationError(
                {'role': 'You cannot take away your own admin role.'})
        if attrs.get('is_active', True) is False:
            raise serializers.ValidationError(
                {'is_active': 'You cannot deactivate your own account.'})
        return attrs

    def update(self, instance, validated_data):
        """Translate the role back into the Django permission flags."""
        role = validated_data.pop('role', None)
        if role is not None:
            instance.is_superuser = role == ROLE_ADMIN
            instance.is_staff = role in (ROLE_ADMIN, ROLE_STAFF)
        if 'is_active' in validated_data:
            instance.is_active = validated_data['is_active']
        instance.save()
        return instance


class SessionRoleSerializer(serializers.ModelSerializer):
    """Tell the frontend whether the signed in user may open the admin area."""

    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'fullname', 'role', 'is_staff',
                  'is_superuser']

    def get_role(self, obj):
        """Return the coarse role that matches the permission flags."""
        if obj.is_superuser:
            return ROLE_ADMIN
        return ROLE_STAFF if obj.is_staff else ROLE_USER
