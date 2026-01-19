from django.contrib import admin
from .models import DataSource


@admin.register(DataSource)
class DataSourceAdmin(admin.ModelAdmin):
    """데이터 소스 Admin"""
    list_display = ['name', 'table_name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'table_name', 'description']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'table_name', 'description', 'is_active')
        }),
        ('메타데이터', {
            'fields': ('columns_metadata',),
            'classes': ('collapse',),
            'description': 'JSON 형식: {"column_name": {"type": "int", "label": "매출액"}}'
        }),
        ('메타 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def get_queryset(self, request):
        """활성/비활성 모두 표시"""
        qs = super().get_queryset(request)
        return qs
