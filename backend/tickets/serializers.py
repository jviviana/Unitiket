from rest_framework import serializers
from .models import User, Ticket


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class TicketSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reporter.username')

    class Meta:
        model = Ticket
        fields = (
            'id', 'reporter', 'reporter_name', 'location', 'equipment_id',
            'description', 'status', 'resolution_comment', 'created_at'
        )
        read_only_fields = ('reporter', 'created_at', 'status', 'resolution_comment')
