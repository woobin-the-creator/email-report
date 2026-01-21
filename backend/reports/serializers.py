"""
DRF Serializers for reports app.

리포트 템플릿 및 생성된 리포트에 대한 Serializer 정의
"""

import re
from rest_framework import serializers
from .models import ReportTemplate, GeneratedReport


class ReportTemplateSerializer(serializers.ModelSerializer):
    """
    리포트 템플릿 Serializer (CRUD 전용)

    layout과 charts 필드에 대한 JSON 구조 검증 포함
    """

    class Meta:
        model = ReportTemplate
        fields = [
            'id',
            'name',
            'description',
            'layout',
            'charts',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_layout(self, value):
        """
        react-grid-layout 배열 구조 검증

        필수 필드: i, x, y, w, h
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("layout은 배열이어야 합니다.")

        if len(value) == 0:
            raise serializers.ValidationError("최소 1개 이상의 레이아웃 아이템이 필요합니다.")

        required_fields = {'i', 'x', 'y', 'w', 'h'}

        for idx, item in enumerate(value):
            if not isinstance(item, dict):
                raise serializers.ValidationError(
                    f"레이아웃 아이템 {idx}는 객체여야 합니다."
                )

            missing_fields = required_fields - set(item.keys())
            if missing_fields:
                raise serializers.ValidationError(
                    f"레이아웃 아이템 {idx}에 필수 필드가 누락되었습니다: {missing_fields}"
                )

            # 타입 검증
            if not isinstance(item['i'], str):
                raise serializers.ValidationError(
                    f"레이아웃 아이템 {idx}의 'i'는 문자열이어야 합니다."
                )

            for field in ['x', 'y', 'w', 'h']:
                if not isinstance(item[field], (int, float)):
                    raise serializers.ValidationError(
                        f"레이아웃 아이템 {idx}의 '{field}'는 숫자여야 합니다."
                    )

        return value

    def validate_charts(self, value):
        """
        차트 설정 배열 구조 검증

        필수 필드: id, type, title, dataBinding
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("charts는 배열이어야 합니다.")

        if len(value) == 0:
            raise serializers.ValidationError("최소 1개 이상의 차트가 필요합니다.")

        required_fields = {'id', 'type', 'title', 'dataBinding'}
        valid_chart_types = {'bar', 'line', 'pie', 'area'}

        for idx, chart in enumerate(value):
            if not isinstance(chart, dict):
                raise serializers.ValidationError(
                    f"차트 {idx}는 객체여야 합니다."
                )

            # 필수 필드 검증
            missing_fields = required_fields - set(chart.keys())
            if missing_fields:
                raise serializers.ValidationError(
                    f"차트 {idx}에 필수 필드가 누락되었습니다: {missing_fields}"
                )

            # 차트 타입 검증
            if chart['type'] not in valid_chart_types:
                raise serializers.ValidationError(
                    f"차트 {idx}의 타입이 유효하지 않습니다. "
                    f"허용된 타입: {valid_chart_types}"
                )

            # dataBinding 구조 검증
            data_binding = chart.get('dataBinding')
            if not isinstance(data_binding, dict):
                raise serializers.ValidationError(
                    f"차트 {idx}의 dataBinding은 객체여야 합니다."
                )

            # dataBinding 필수 필드
            db_required = {'xAxis', 'yAxis', 'dataSource'}
            db_missing = db_required - set(data_binding.keys())
            if db_missing:
                raise serializers.ValidationError(
                    f"차트 {idx}의 dataBinding에 필수 필드가 누락되었습니다: {db_missing}"
                )

            # yAxis는 배열이어야 함
            if not isinstance(data_binding['yAxis'], list):
                raise serializers.ValidationError(
                    f"차트 {idx}의 dataBinding.yAxis는 배열이어야 합니다."
                )

            # SQL Injection 방지: 컬럼명과 테이블명 검증
            column_pattern = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*$')

            # xAxis 검증
            if not column_pattern.match(data_binding['xAxis']):
                raise serializers.ValidationError(
                    f"차트 {idx}의 xAxis 컬럼명이 유효하지 않습니다. "
                    f"영문자로 시작하고 영문자/숫자/언더스코어만 사용 가능합니다."
                )

            # yAxis 검증 (배열)
            for y_idx, y_col in enumerate(data_binding['yAxis']):
                if not column_pattern.match(y_col):
                    raise serializers.ValidationError(
                        f"차트 {idx}의 yAxis[{y_idx}] 컬럼명이 유효하지 않습니다. "
                        f"영문자로 시작하고 영문자/숫자/언더스코어만 사용 가능합니다."
                    )

            # dataSource (테이블명) 검증
            if not column_pattern.match(data_binding['dataSource']):
                raise serializers.ValidationError(
                    f"차트 {idx}의 dataSource 테이블명이 유효하지 않습니다. "
                    f"영문자로 시작하고 영문자/숫자/언더스코어만 사용 가능합니다."
                )

        return value

    def validate(self, attrs):
        """
        교차 검증: layout과 charts의 id 일치 여부 확인
        """
        layout = attrs.get('layout', [])
        charts = attrs.get('charts', [])

        # layout의 i 값들
        layout_ids = {item['i'] for item in layout}

        # charts의 id 값들
        chart_ids = {chart['id'] for chart in charts}

        # 일치하지 않는 경우 경고 (에러는 아님, 유연성 허용)
        if layout_ids != chart_ids:
            missing_in_charts = layout_ids - chart_ids
            missing_in_layout = chart_ids - layout_ids

            if missing_in_charts:
                raise serializers.ValidationError(
                    f"layout에 있지만 charts에 없는 id: {missing_in_charts}"
                )

            if missing_in_layout:
                raise serializers.ValidationError(
                    f"charts에 있지만 layout에 없는 id: {missing_in_layout}"
                )

        return attrs


class ReportTemplateListSerializer(serializers.ModelSerializer):
    """
    리포트 템플릿 목록용 Serializer (간소화 버전)

    list API에서 사용하여 응답 크기 최소화
    """

    chart_count = serializers.SerializerMethodField()

    class Meta:
        model = ReportTemplate
        fields = [
            'id',
            'name',
            'description',
            'chart_count',
            'is_active',
            'updated_at'
        ]

    def get_chart_count(self, obj):
        """차트 개수 반환"""
        return len(obj.charts) if obj.charts else 0


class GeneratedReportSerializer(serializers.ModelSerializer):
    """
    생성된 리포트 Serializer

    리포트 생성 기록 및 상태 관리
    """

    template_name = serializers.CharField(
        source='template.name',
        read_only=True
    )

    class Meta:
        model = GeneratedReport
        fields = [
            'id',
            'template',
            'template_name',
            'report_date',
            'generated_at',
            'status',
            'error_message'
        ]
        read_only_fields = ['id', 'generated_at']

    def validate_report_date(self, value):
        """
        리포트 날짜 검증

        - 미래 날짜 방지
        """
        from datetime import date

        if value > date.today():
            raise serializers.ValidationError(
                "미래 날짜의 리포트는 생성할 수 없습니다."
            )

        return value

    def validate(self, attrs):
        """
        교차 검증: 동일 날짜/템플릿 중복 체크
        """
        template = attrs.get('template')
        report_date = attrs.get('report_date')

        # 업데이트인 경우 현재 인스턴스 제외
        if self.instance:
            existing = GeneratedReport.objects.filter(
                template=template,
                report_date=report_date
            ).exclude(id=self.instance.id)
        else:
            existing = GeneratedReport.objects.filter(
                template=template,
                report_date=report_date
            )

        if existing.exists():
            raise serializers.ValidationError(
                f"템플릿 '{template.name}'의 {report_date} 리포트가 이미 존재합니다."
            )

        return attrs
