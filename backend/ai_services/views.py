from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from distributions.models import School

from .services import ask_education_assistant, score_need_priority


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


class EducationAssistantView(APIView):
    """
    POST /api/ai/ask/  {"question": "..."}
    Used by the USSD/SMS/WhatsApp gateway integration (gateway calls this
    endpoint server-to-server; not directly exposed to end users).
    """
    permission_classes = [permissions.AllowAny]  # secure with a gateway shared-secret/API key in production

    def post(self, request):
        question = request.data.get("question", "").strip()
        if not question:
            return Response({"detail": "Question is required."}, status=400)
        answer = ask_education_assistant(question)
        return Response({"answer": answer})
