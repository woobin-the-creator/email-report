"""
URL configuration for reports app.

생성되는 URL 패턴:
- /api/reports/templates/                 - 템플릿 목록 및 생성 (GET, POST)
- /api/reports/templates/{id}/            - 템플릿 상세, 수정, 삭제 (GET, PUT, PATCH, DELETE)
- /api/reports/templates/active/          - 활성 템플릿 조회 (GET)
- /api/reports/templates/{id}/duplicate/  - 템플릿 복제 (POST)

- /api/reports/reports/                   - 리포트 목록 및 생성 (GET, POST)
- /api/reports/reports/{id}/              - 리포트 상세, 수정, 삭제 (GET, PUT, PATCH, DELETE)
- /api/reports/reports/by_date/           - 날짜별 리포트 조회 (GET, query param: date=YYYY-MM-DD)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'reports'

# DRF Router 설정
router = DefaultRouter()

# ViewSet 등록
router.register(
    r'templates',
    views.ReportTemplateViewSet,
    basename='template'
)

router.register(
    r'reports',
    views.GeneratedReportViewSet,
    basename='report'
)

urlpatterns = [
    # Router로 생성된 URL 패턴 포함
    path('', include(router.urls)),
]
