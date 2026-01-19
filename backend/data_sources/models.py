from django.db import models
from django.core.validators import RegexValidator


class DataSource(models.Model):
    """데이터 소스 테이블 정의"""
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="데이터 소스 이름",
        help_text="예: 일일매출, 생산현황"
    )
    table_name = models.CharField(
        max_length=100,
        verbose_name="실제 테이블명",
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z_][a-zA-Z0-9_]*$',
                message='유효한 테이블명이어야 합니다 (영문자, 숫자, 언더스코어만 허용)'
            )
        ],
        help_text="SQL Injection 방지를 위해 영문자로 시작, 영문자/숫자/언더스코어만 사용"
    )
    description = models.TextField(
        blank=True,
        verbose_name="설명"
    )
    columns_metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="컬럼 메타데이터",
        help_text="{'column_name': {'type': 'int', 'label': '매출액'}} 형식"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="활성 상태"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'data_sources'
        ordering = ['name']
        verbose_name = '데이터 소스'
        verbose_name_plural = '데이터 소스들'

    def __str__(self):
        return f"{self.name} ({self.table_name})"

    def get_columns(self):
        """테이블의 컬럼 목록 반환"""
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(f"SHOW COLUMNS FROM {self.table_name}")
            return [row[0] for row in cursor.fetchall()]
