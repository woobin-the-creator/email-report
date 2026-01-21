"""
URL configuration for data_sources app.

생성되는 URL 패턴:
- /api/data-sources/sources/              - 데이터 소스 목록 및 생성 (GET, POST)
- /api/data-sources/sources/{id}/         - 데이터 소스 상세, 수정, 삭제 (GET, PUT, PATCH, DELETE)
- /api/data-sources/sources/{id}/columns/ - 컬럼 목록 조회 (GET)
- /api/data-sources/sources/{id}/test/    - 연결 테스트 (POST)

- /api/data-sources/query/                - 데이터 조회 (POST)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'data_sources'

# DRF Router 설정
router = DefaultRouter()

# ViewSet 등록
router.register(
    r'sources',
    views.DataSourceViewSet,
    basename='datasource'
)

urlpatterns = [
    # Router로 생성된 URL 패턴 포함
    path('', include(router.urls)),

    # 추가 API 엔드포인트
    path(
        'query/',
        views.DataQueryAPIView.as_view(),
        name='data-query'
    ),
]
