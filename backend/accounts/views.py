from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ProfileUpdateSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
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
    """
    Email + role + password login.

    Accepting role at login is what makes same-email multi-role accounts
    work: two rows can share an email as long as their roles differ, so the
    login needs all three fields to unambiguously identify which account the
    user is trying to access.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        role = request.data.get("role", "").strip()
        password = request.data.get("password", "")

        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=400)

        # If role is provided, look up exactly that account.
        # If not provided and only one account exists for this email, use it.
        if role:
            try:
                user = User.objects.get(email__iexact=email, role=role)
            except User.DoesNotExist:
                return Response({"detail": "Invalid credentials."}, status=400)
        else:
            matches = User.objects.filter(email__iexact=email)
            if matches.count() == 1:
                user = matches.first()
            elif matches.count() > 1:
                # Return the list of roles so the frontend can show a picker
                roles = list(matches.values_list("role", flat=True))
                return Response(
                    {"detail": "multiple_roles", "roles": roles},
                    status=300,
                )
            else:
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
        if self.request.method in ("PUT", "PATCH"):
            return ProfileUpdateSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(UserSerializer(self.get_object()).data)
