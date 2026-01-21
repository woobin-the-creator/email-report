"""
DRF Serializers for data_sources app.

데이터 소스 및 데이터 조회에 대한 Serializer 정의
"""

import re
from rest_framework import serializers
from .models import DataSource


class DataSourceSerializer(serializers.ModelSerializer):
    """
    데이터 소스 Serializer (CRUD 전용)

    SQL Injection 방지를 위한 엄격한 테이블명/컬럼명 검증 포함
    """

    columns = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DataSource
        fields = [
            'id',
            'name',
            'table_name',
            'description',
            'columns_metadata',
            'columns',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'columns']

    def get_columns(self, obj):
        """
        실제 테이블의 컬럼 목록 반환

        에러 발생 시 빈 리스트 반환
        """
        try:
            return obj.get_columns()
        except Exception:
            # 테이블이 존재하지 않거나 접근 불가한 경우
            return []

    def validate_table_name(self, value):
        """
        테이블명 검증 (SQL Injection 방지)

        - 영문자로 시작
        - 영문자, 숫자, 언더스코어만 허용
        - 최대 100자
        """
        # 정규식 패턴: 영문자로 시작, 영문자/숫자/언더스코어만
        pattern = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*$')

        if not pattern.match(value):
            raise serializers.ValidationError(
                "테이블명은 영문자로 시작하고 영문자/숫자/언더스코어만 사용할 수 있습니다."
            )

        # SQL 예약어 체크 (기본적인 것들만)
        sql_keywords = {
            'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
            'ALTER', 'TABLE', 'DATABASE', 'INDEX', 'VIEW', 'PROCEDURE',
            'FUNCTION', 'TRIGGER', 'SCHEMA', 'GRANT', 'REVOKE'
        }

        if value.upper() in sql_keywords:
            raise serializers.ValidationError(
                f"'{value}'는 SQL 예약어이므로 테이블명으로 사용할 수 없습니다."
            )

        return value

    def validate_columns_metadata(self, value):
        """
        컬럼 메타데이터 구조 검증

        형식: {"column_name": {"type": "int", "label": "매출액"}}
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "columns_metadata는 객체여야 합니다."
            )

        # 빈 객체는 허용
        if len(value) == 0:
            return value

        # 컬럼명 패턴
        column_pattern = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*$')

        for col_name, col_meta in value.items():
            # 컬럼명 검증
            if not column_pattern.match(col_name):
                raise serializers.ValidationError(
                    f"컬럼명 '{col_name}'이 유효하지 않습니다. "
                    f"영문자로 시작하고 영문자/숫자/언더스코어만 사용 가능합니다."
                )

            # 메타데이터는 객체여야 함
            if not isinstance(col_meta, dict):
                raise serializers.ValidationError(
                    f"컬럼 '{col_name}'의 메타데이터는 객체여야 합니다."
                )

            # type 필드는 선택적이지만 있다면 문자열이어야 함
            if 'type' in col_meta and not isinstance(col_meta['type'], str):
                raise serializers.ValidationError(
                    f"컬럼 '{col_name}'의 type은 문자열이어야 합니다."
                )

            # label 필드는 선택적이지만 있다면 문자열이어야 함
            if 'label' in col_meta and not isinstance(col_meta['label'], str):
                raise serializers.ValidationError(
                    f"컬럼 '{col_name}'의 label은 문자열이어야 합니다."
                )

        return value

    def validate(self, attrs):
        """
        교차 검증: 테이블 존재 여부 확인 (선택적)
        """
        table_name = attrs.get('table_name')

        if table_name:
            # 테이블 존재 여부 체크 (생성 시에만)
            if not self.instance:
                from django.db import connection

                try:
                    with connection.cursor() as cursor:
                        # 테이블 존재 여부만 확인 (데이터 조회 안 함)
                        cursor.execute(
                            "SELECT 1 FROM information_schema.tables "
                            "WHERE table_schema = DATABASE() "
                            "AND table_name = %s",
                            [table_name]
                        )
                        result = cursor.fetchone()

                        if not result:
                            # 경고만 하고 통과 (테이블은 나중에 생성될 수 있음)
                            pass
                except Exception:
                    # DB 조회 실패는 무시 (개발 환경에서 테이블이 없을 수 있음)
                    pass

        return attrs


class DataSourceListSerializer(serializers.ModelSerializer):
    """
    데이터 소스 목록용 Serializer (간소화 버전)

    list API에서 사용하여 응답 크기 최소화
    """

    column_count = serializers.SerializerMethodField()

    class Meta:
        model = DataSource
        fields = [
            'id',
            'name',
            'table_name',
            'column_count',
            'is_active',
            'updated_at'
        ]

    def get_column_count(self, obj):
        """컬럼 개수 반환"""
        try:
            columns = obj.get_columns()
            return len(columns)
        except Exception:
            return 0


class DataQuerySerializer(serializers.Serializer):
    """
    데이터 조회 요청 Serializer

    차트에서 데이터를 조회할 때 사용
    SQL Injection 방지를 위한 엄격한 검증
    """

    table_name = serializers.CharField(
        max_length=100,
        required=True,
        help_text="조회할 테이블명"
    )

    columns = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=True,
        help_text="조회할 컬럼명 배열"
    )

    start_date = serializers.DateField(
        required=False,
        help_text="조회 시작 날짜 (YYYY-MM-DD)"
    )

    end_date = serializers.DateField(
        required=False,
        help_text="조회 종료 날짜 (YYYY-MM-DD)"
    )

    date_column = serializers.CharField(
        max_length=100,
        required=False,
        default='date',
        help_text="날짜 필터링에 사용할 컬럼명"
    )

    limit = serializers.IntegerField(
        required=False,
        default=1000,
        min_value=1,
        max_value=10000,
        help_text="최대 조회 건수 (기본: 1000, 최대: 10000)"
    )

    def validate_table_name(self, value):
        """
        테이블명 검증 (SQL Injection 방지)
        """
        pattern = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*$')

        if not pattern.match(value):
            raise serializers.ValidationError(
                "테이블명은 영문자로 시작하고 영문자/숫자/언더스코어만 사용할 수 있습니다."
            )

        # SQL 예약어 체크
        sql_keywords = {
            'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
            'ALTER', 'TABLE', 'DATABASE', 'INDEX', 'VIEW', 'PROCEDURE'
        }

        if value.upper() in sql_keywords:
            raise serializers.ValidationError(
                f"'{value}'는 SQL 예약어이므로 사용할 수 없습니다."
            )

        return value

    def validate_columns(self, value):
        """
        컬럼명 배열 검증 (SQL Injection 방지)
        """
        if not value:
            raise serializers.ValidationError(
                "최소 1개 이상의 컬럼을 지정해야 합니다."
            )

        pattern = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*$')

        for col in value:
            if not pattern.match(col):
                raise serializers.ValidationError(
                    f"컬럼명 '{col}'이 유효하지 않습니다. "
                    f"영문자로 시작하고 영문자/숫자/언더스코어만 사용 가능합니다."
                )

        return value

    def validate_date_column(self, value):
        """
        날짜 컬럼명 검증 (SQL Injection 방지)
        """
        pattern = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*$')

        if not pattern.match(value):
            raise serializers.ValidationError(
                f"컬럼명 '{value}'이 유효하지 않습니다. "
                f"영문자로 시작하고 영문자/숫자/언더스코어만 사용 가능합니다."
            )

        return value

    def validate(self, attrs):
        """
        교차 검증
        """
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        # 날짜 범위 검증
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError(
                    "시작 날짜는 종료 날짜보다 이전이어야 합니다."
                )

        # 날짜 필터링 사용 시 date_column 필수
        if (start_date or end_date) and not attrs.get('date_column'):
            raise serializers.ValidationError(
                "날짜 필터링을 사용하려면 date_column을 지정해야 합니다."
            )

        return attrs
