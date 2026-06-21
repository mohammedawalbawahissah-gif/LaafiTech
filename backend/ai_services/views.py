from django.conf import settings
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from distributions.models import School

from .services import ask_education_assistant, ask_platform_assistant, score_need_priority


class IsAuthenticatedOrGatewaySecret(permissions.BasePermission):
    """
    Allows two callers:
    1. Logged-in platform users (web/mobile in-app assistant), via normal
       token auth.
    2. The USSD/SMS/WhatsApp gateway, which isn't a platform user and can't
       hold a user token -- it authenticates with a shared secret sent in
       the X-Gateway-Secret header instead.

    If AI_GATEWAY_SECRET isn't configured, gateway access is disabled
    (fails closed) rather than silently falling back to AllowAny.
    """

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return True
        gateway_secret = getattr(settings, "AI_GATEWAY_SECRET", "")
        provided = request.headers.get("X-Gateway-Secret", "")
        return bool(gateway_secret) and provided == gateway_secret


class NeedPriorityView(APIView):
    """GET /api/ai/need-priority/<school_id>/ -- explainable priority score for one school."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, school_id):
        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
        return Response({"school": school.name, **score_need_priority(school)})


class NeedPriorityRankingView(APIView):
    """GET /api/ai/need-priority-ranking/ -- all schools ranked by need score,
    used by Admin (where to send agents) and Funder dashboard (what to fund)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        results = []
        for school in School.objects.all():
            result = score_need_priority(school)
            results.append({"school_id": school.id, "school": school.name, "district": school.district, **result})
        results.sort(key=lambda r: r["score"], reverse=True)
        return Response(results)


class PlatformAssistantView(APIView):
    """
    POST /api/ai/assistant/  {"messages": [{"role": "user", "content": "..."}]}
    The in-app chat widget for logged-in agents/funders/admins. Distinct
    from /api/ai/ask/ (the SMS education assistant) -- this one is
    role-aware and only ever sees the caller's own scoped data.
    """
    permission_classes = [permissions.IsAuthenticated]

    MAX_HISTORY = 12  # caps prompt size / API cost per request

    def post(self, request):
        messages = request.data.get("messages")
        if not isinstance(messages, list) or not messages:
            return Response({"detail": "messages is required and must be a non-empty list."}, status=400)
        trimmed = messages[-self.MAX_HISTORY:]
        answer = ask_platform_assistant(request.user, trimmed)
        return Response({"answer": answer})


class EducationAssistantView(APIView):
    """
    POST /api/ai/ask/  {"question": "..."}
    Used by:
    - The USSD/SMS/WhatsApp gateway (server-to-server), authenticated via
      the X-Gateway-Secret header.
    - The in-app AI assistant (web/mobile), authenticated via normal user
      token auth -- the gateway secret is never exposed client-side.
    """
    permission_classes = [IsAuthenticatedOrGatewaySecret]

    def post(self, request):
        question = request.data.get("question", "").strip()
        if not question:
            return Response({"detail": "Question is required."}, status=400)
        answer = ask_education_assistant(question)
        return Response({"answer": answer})
