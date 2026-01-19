from django.contrib import admin
from .models import ReportTemplate, GeneratedReport


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    """리포트 템플릿 Admin"""
    list_display = ['name', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('템플릿 설정', {
            'fields': ('layout', 'charts'),
            'classes': ('collapse',),
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


@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    """생성된 리포트 Admin"""
    list_display = ['report_date', 'template', 'status', 'generated_at']
    list_filter = ['status', 'template', 'generated_at']
    search_fields = ['template__name', 'error_message']
    readonly_fields = ['generated_at']
    date_hierarchy = 'report_date'

    fieldsets = (
        ('리포트 정보', {
            'fields': ('template', 'report_date', 'status')
        }),
        ('에러 정보', {
            'fields': ('error_message',),
            'classes': ('collapse',),
        }),
        ('메타 정보', {
            'fields': ('generated_at',),
            'classes': ('collapse',),
        }),
    )

    def has_add_permission(self, request):
        """Admin에서 직접 추가 불가 (Cron으로만 생성)"""
        return False
