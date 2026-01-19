"""
URL configuration for data_sources app.
"""

from django.urls import path
from . import views

app_name = 'data_sources'

urlpatterns = [
    # TODO: API 엔드포인트 추가 예정
    # 예시:
    # path('', views.DataSourceListView.as_view(), name='datasource-list'),
    # path('<int:pk>/', views.DataSourceDetailView.as_view(), name='datasource-detail'),
    # path('<int:pk>/query/', views.DataSourceQueryView.as_view(), name='datasource-query'),
]
