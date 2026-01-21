"""
DRF ViewSets for reports app.

리포트 템플릿 및 생성된 리포트에 대한 API 뷰 정의
"""

import logging
from datetime import datetime

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import ReportTemplate, GeneratedReport
from .serializers import (
    ReportTemplateSerializer,
    ReportTemplateListSerializer,
    GeneratedReportSerializer
)

logger = logging.getLogger(__name__)


class ReportTemplateViewSet(viewsets.ModelViewSet):
    """
    리포트 템플릿 ViewSet (CRUD + 커스텀 액션)

    ## 기본 엔드포인트
    - GET /api/templates/ : 템플릿 목록 (간소화)
    - POST /api/templates/ : 템플릿 생성
    - GET /api/templates/{id}/ : 템플릿 상세
    - PUT /api/templates/{id}/ : 템플릿 전체 수정
    - PATCH /api/templates/{id}/ : 템플릿 부분 수정
    - DELETE /api/templates/{id}/ : 템플릿 삭제

    ## 커스텀 액션
    - GET /api/templates/active/ : 활성화된 템플릿 목록
    - POST /api/templates/{id}/duplicate/ : 템플릿 복제
    """

    queryset = ReportTemplate.objects.all()

    def get_serializer_class(self):
        """
        액션별로 다른 Serializer 사용

        - list: 간소화된 ReportTemplateListSerializer
        - 나머지: 전체 정보 포함 ReportTemplateSerializer
        """
        if self.action == 'list':
            return ReportTemplateListSerializer
        return ReportTemplateSerializer

    def list(self, request, *args, **kwargs):
        """
        템플릿 목록 조회

        쿼리 파라미터:
        - is_active: true/false (활성 상태 필터링)
        """
        queryset = self.get_queryset()

        # 활성 상태 필터링
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)

        serializer = self.get_serializer(queryset, many=True)

        logger.info(
            f"템플릿 목록 조회: {queryset.count()}개 (is_active={is_active})"
        )

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """템플릿 생성"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        logger.info(
            f"템플릿 생성: {serializer.data['name']} (ID: {serializer.data['id']})"
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        """템플릿 수정 (PUT/PATCH)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        logger.info(
            f"템플릿 {'부분 ' if partial else ''}수정: "
            f"{serializer.data['name']} (ID: {instance.id})"
        )

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """템플릿 삭제"""
        instance = self.get_object()
        template_name = instance.name
        template_id = instance.id

        # 연관된 리포트 개수 확인
        report_count = instance.generated_reports.count()

        if report_count > 0:
            logger.warning(
                f"템플릿 삭제 시도: {template_name} (ID: {template_id}) - "
                f"연관된 리포트 {report_count}개 함께 삭제됨"
            )

        self.perform_destroy(instance)

        logger.info(
            f"템플릿 삭제: {template_name} (ID: {template_id})"
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        활성화된 템플릿만 조회

        GET /api/templates/active/
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)

        logger.info(f"활성 템플릿 조회: {queryset.count()}개")

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """
        템플릿 복제

        POST /api/templates/{id}/duplicate/

        요청 본문:
        {
            "name": "복제된 템플릿 이름" (선택, 기본값: "원본 이름 - 복사본")
        }
        """
        # 원본 템플릿 가져오기
        original = self.get_object()

        # 새 템플릿 이름 결정
        new_name = request.data.get('name')
        if not new_name:
            # 기본 이름: "원본 이름 - 복사본"
            base_name = f"{original.name} - 복사본"
            new_name = base_name

            # 중복 이름 체크 및 번호 추가
            counter = 1
            while ReportTemplate.objects.filter(name=new_name).exists():
                new_name = f"{base_name} ({counter})"
                counter += 1

        # 템플릿 복제 (ID는 자동 생성)
        duplicated = ReportTemplate.objects.create(
            name=new_name,
            description=original.description,
            layout=original.layout,
            charts=original.charts,
            is_active=False  # 복제본은 비활성 상태로 생성
        )

        serializer = self.get_serializer(duplicated)

        logger.info(
            f"템플릿 복제: {original.name} (ID: {original.id}) -> "
            f"{duplicated.name} (ID: {duplicated.id})"
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class GeneratedReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    생성된 리포트 ViewSet (읽기 전용)

    ## 기본 엔드포인트
    - GET /api/reports/ : 리포트 목록
    - GET /api/reports/{id}/ : 리포트 상세

    ## 커스텀 액션
    - GET /api/reports/by_date/?date=YYYY-MM-DD : 특정 날짜의 리포트 조회

    참고:
    - 리포트 생성은 django-crontab을 통해 자동으로 처리
    - 수동 생성이 필요한 경우 별도 management command 사용
    """

    queryset = GeneratedReport.objects.select_related('template').all()
    serializer_class = GeneratedReportSerializer

    def list(self, request, *args, **kwargs):
        """
        리포트 목록 조회

        쿼리 파라미터:
        - status: pending/success/failed (상태 필터링)
        - template_id: 템플릿 ID (템플릿별 필터링)
        - date_from: YYYY-MM-DD (날짜 범위 시작)
        - date_to: YYYY-MM-DD (날짜 범위 종료)
        """
        queryset = self.get_queryset()

        # 상태 필터링
        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        # 템플릿 필터링
        template_id = request.query_params.get('template_id')
        if template_id:
            queryset = queryset.filter(template_id=template_id)

        # 날짜 범위 필터링
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if date_from:
            queryset = queryset.filter(report_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(report_date__lte=date_to)

        serializer = self.get_serializer(queryset, many=True)

        logger.info(
            f"리포트 목록 조회: {queryset.count()}개 "
            f"(status={status_param}, template_id={template_id}, "
            f"date_from={date_from}, date_to={date_to})"
        )

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """
        특정 날짜의 리포트 조회

        GET /api/reports/by_date/?date=YYYY-MM-DD

        쿼리 파라미터:
        - date: 리포트 날짜 (필수, YYYY-MM-DD 형식)
        - template_id: 템플릿 ID (선택)

        응답:
        - 해당 날짜의 리포트 배열
        - template_id가 지정되면 해당 템플릿의 리포트만 반환
        """
        # 날짜 파라미터 검증
        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {'error': 'date 파라미터가 필요합니다. (형식: YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 날짜 형식 검증
        try:
            report_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': '날짜 형식이 올바르지 않습니다. (형식: YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 리포트 조회
        queryset = self.get_queryset().filter(report_date=report_date)

        # 템플릿 필터링 (선택)
        template_id = request.query_params.get('template_id')
        if template_id:
            queryset = queryset.filter(template_id=template_id)

        serializer = self.get_serializer(queryset, many=True)

        logger.info(
            f"날짜별 리포트 조회: {date_str} - {queryset.count()}개 "
            f"(template_id={template_id})"
        )

        return Response(serializer.data)
