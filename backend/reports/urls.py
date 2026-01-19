"""
URL configuration for reports app.
"""

from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # TODO: API 엔드포인트 추가 예정
    # 예시:
    # path('templates/', views.TemplateListView.as_view(), name='template-list'),
    # path('templates/<int:pk>/', views.TemplateDetailView.as_view(), name='template-detail'),
    # path('<str:date>/', views.ReportView.as_view(), name='report-view'),
]
