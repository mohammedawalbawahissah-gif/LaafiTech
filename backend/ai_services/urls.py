from django.urls import path

from .views import EducationAssistantView, NeedPriorityRankingView, NeedPriorityView

urlpatterns = [
    path("need-priority/<int:school_id>/", NeedPriorityView.as_view(), name="ai-need-priority"),
    path("need-priority-ranking/", NeedPriorityRankingView.as_view(), name="ai-need-priority-ranking"),
    path("ask/", EducationAssistantView.as_view(), name="ai-ask"),
]
