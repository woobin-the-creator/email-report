from django.db import models


class ReportTemplate(models.Model):
    """리포트 템플릿 - 차트 레이아웃과 설정 저장"""
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="템플릿 이름"
    )
    description = models.TextField(
        blank=True,
        verbose_name="설명"
    )
    layout = models.JSONField(
        verbose_name="레이아웃 정보",
        help_text="react-grid-layout 설정 배열"
    )
    charts = models.JSONField(
        verbose_name="차트 설정",
        help_text="차트 설정 객체 배열"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="활성화"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'report_templates'
        ordering = ['-updated_at']
        verbose_name = '리포트 템플릿'
        verbose_name_plural = '리포트 템플릿들'

    def __str__(self):
        return self.name


class GeneratedReport(models.Model):
    """생성된 리포트 기록"""
    STATUS_CHOICES = [
        ('pending', '대기중'),
        ('success', '성공'),
        ('failed', '실패'),
    ]

    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.CASCADE,
        related_name='generated_reports',
        verbose_name="템플릿"
    )
    report_date = models.DateField(
        verbose_name="리포트 날짜",
        help_text="YYYY-MM-DD 형식"
    )
    generated_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="생성 시간"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="상태"
    )
    error_message = models.TextField(
        blank=True,
        null=True,
        verbose_name="에러 메시지"
    )

    class Meta:
        db_table = 'generated_reports'
        ordering = ['-report_date']
        unique_together = [('template', 'report_date')]
        verbose_name = '생성된 리포트'
        verbose_name_plural = '생성된 리포트들'
        indexes = [
            models.Index(fields=['report_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.template.name} - {self.report_date}"
