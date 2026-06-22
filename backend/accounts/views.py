from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ProfileUpdateSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Self-registration. In production, agent registration should require
    admin approval (see Agent.verification_status) before activation."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {"user": UserSerializer(user).data, "token": token.key},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Phone number + password login. Swap for OTP-based auth for the agent
    app in production (better fit for low-literacy / shared-phone contexts)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone_number")
        password = request.data.get("password")
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials."}, status=400)

        if not user.check_password(password):
            return Response({"detail": "Invalid credentials."}, status=400)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"user": UserSerializer(user).data, "token": token.key})


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        # Writes go through ProfileUpdateSerializer (see its docstring for
        # why role/phone_number/username are deliberately excluded there).
        if self.request.method in ("PUT", "PATCH"):
            return ProfileUpdateSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        # Respond with the full profile (including read-only fields like
        # role/phone_number) so the frontend can refresh its user state
        # from a single response shape, same as login/register.
        return Response(UserSerializer(self.get_object()).data)
