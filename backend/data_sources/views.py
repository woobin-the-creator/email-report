"""
DRF ViewSets and APIViews for data_sources app.

데이터 소스 및 동적 데이터 조회에 대한 API 뷰 정의
"""

import logging
import re
from django.db import connection

from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import DataSource
from .serializers import (
    DataSourceSerializer,
    DataSourceListSerializer,
    DataQuerySerializer
)

logger = logging.getLogger(__name__)


class DataSourceViewSet(viewsets.ModelViewSet):
    """
    데이터 소스 ViewSet (CRUD)

    ## 기본 엔드포인트
    - GET /api/data-sources/ : 데이터 소스 목록 (간소화)
    - POST /api/data-sources/ : 데이터 소스 생성
    - GET /api/data-sources/{id}/ : 데이터 소스 상세
    - PUT /api/data-sources/{id}/ : 데이터 소스 전체 수정
    - PATCH /api/data-sources/{id}/ : 데이터 소스 부분 수정
    - DELETE /api/data-sources/{id}/ : 데이터 소스 삭제

    ## 커스텀 액션
    - GET /api/data-sources/{id}/columns/ : 테이블의 컬럼 목록 조회
    """

    queryset = DataSource.objects.all()

    def get_serializer_class(self):
        """
        액션별로 다른 Serializer 사용

        - list: 간소화된 DataSourceListSerializer
        - 나머지: 전체 정보 포함 DataSourceSerializer
        """
        if self.action == 'list':
            return DataSourceListSerializer
        return DataSourceSerializer

    def list(self, request, *args, **kwargs):
        """
        데이터 소스 목록 조회

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
            f"데이터 소스 목록 조회: {queryset.count()}개 (is_active={is_active})"
        )

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """데이터 소스 생성"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        logger.info(
            f"데이터 소스 생성: {serializer.data['name']} "
            f"(테이블: {serializer.data['table_name']}, ID: {serializer.data['id']})"
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        """데이터 소스 수정 (PUT/PATCH)"""
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
            f"데이터 소스 {'부분 ' if partial else ''}수정: "
            f"{serializer.data['name']} (ID: {instance.id})"
        )

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """데이터 소스 삭제"""
        instance = self.get_object()
        source_name = instance.name
        source_id = instance.id

        self.perform_destroy(instance)

        logger.info(
            f"데이터 소스 삭제: {source_name} (ID: {source_id})"
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def columns(self, request, pk=None):
        """
        테이블의 컬럼 목록 조회

        GET /api/data-sources/{id}/columns/

        응답:
        {
            "table_name": "테이블명",
            "columns": ["column1", "column2", ...]
        }
        """
        instance = self.get_object()

        try:
            columns = instance.get_columns()

            logger.info(
                f"컬럼 목록 조회: {instance.table_name} - {len(columns)}개"
            )

            return Response({
                'table_name': instance.table_name,
                'columns': columns
            })

        except Exception as e:
            logger.error(
                f"컬럼 목록 조회 실패: {instance.table_name} - {str(e)}"
            )

            return Response(
                {'error': f'테이블 컬럼 조회 실패: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DataQueryAPIView(views.APIView):
    """
    동적 데이터 조회 API (핵심 기능)

    POST /api/data-sources/query/

    ## SQL Injection 방지 3단계 전략

    1. **테이블명 화이트리스트**
       - DataSource 모델에 등록된 테이블만 허용
       - 사전 검증된 table_name만 사용

    2. **컬럼명 화이트리스트**
       - DataSource의 columns_metadata 또는 실제 테이블 컬럼과 대조
       - 정규식 검증: ^[a-zA-Z_][a-zA-Z0-9_]*$

    3. **파라미터화된 쿼리**
       - 날짜 등 사용자 입력값은 %s 플레이스홀더 사용
       - 직접 문자열 삽입 절대 금지

    4. **백틱 감싸기**
       - 테이블명/컬럼명을 백틱(`)으로 감싸서 추가 보호

    ## 요청 본문 예시

    ```json
    {
        "table_name": "daily_sales",
        "columns": ["date", "revenue", "profit"],
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "date_column": "date",
        "limit": 1000
    }
    ```

    ## 응답 예시

    ```json
    {
        "data": [
            {"date": "2024-01-01", "revenue": 10000, "profit": 3000},
            {"date": "2024-01-02", "revenue": 12000, "profit": 3500}
        ],
        "count": 2,
        "table_name": "daily_sales"
    }
    ```
    """

    def post(self, request):
        """
        동적 데이터 조회 실행

        SQL Injection 방지를 위한 엄격한 검증 적용
        """
        # 1. 요청 데이터 검증
        serializer = DataQuerySerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(
                f"데이터 조회 요청 검증 실패: {serializer.errors}"
            )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data

        table_name = validated_data['table_name']
        columns = validated_data['columns']
        start_date = validated_data.get('start_date')
        end_date = validated_data.get('end_date')
        date_column = validated_data.get('date_column', 'date')
        limit = validated_data.get('limit', 1000)

        # 2. 테이블명 화이트리스트 검증 (1단계 방어)
        try:
            data_source = DataSource.objects.get(
                table_name=table_name,
                is_active=True
            )
        except DataSource.DoesNotExist:
            logger.warning(
                f"데이터 조회 실패: 등록되지 않은 테이블 '{table_name}'"
            )
            return Response(
                {
                    'error': f"테이블 '{table_name}'이(가) 등록되지 않았거나 비활성 상태입니다."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # 3. 컬럼명 화이트리스트 검증 (2단계 방어)
        try:
            available_columns = data_source.get_columns()
        except Exception as e:
            logger.error(
                f"테이블 컬럼 조회 실패: {table_name} - {str(e)}"
            )
            return Response(
                {'error': f'테이블 컬럼 조회 실패: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 요청된 컬럼이 실제 테이블 컬럼에 있는지 확인
        invalid_columns = set(columns) - set(available_columns)
        if invalid_columns:
            logger.warning(
                f"데이터 조회 실패: 유효하지 않은 컬럼 {invalid_columns} "
                f"(테이블: {table_name})"
            )
            return Response(
                {
                    'error': f'유효하지 않은 컬럼: {invalid_columns}',
                    'available_columns': available_columns
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # date_column도 검증
        if date_column and date_column not in available_columns:
            logger.warning(
                f"데이터 조회 실패: 유효하지 않은 날짜 컬럼 '{date_column}' "
                f"(테이블: {table_name})"
            )
            return Response(
                {
                    'error': f"날짜 컬럼 '{date_column}'이(가) 테이블에 존재하지 않습니다.",
                    'available_columns': available_columns
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. SQL 쿼리 생성 (3단계 방어: 파라미터화된 쿼리)
        try:
            # 컬럼명 백틱으로 감싸기 (추가 보호)
            safe_columns = [f"`{col}`" for col in columns]
            columns_str = ', '.join(safe_columns)

            # 기본 쿼리
            query = f"SELECT {columns_str} FROM `{table_name}`"
            params = []

            # WHERE 절 추가 (날짜 필터링)
            where_clauses = []

            if start_date:
                where_clauses.append(f"`{date_column}` >= %s")
                params.append(start_date)

            if end_date:
                where_clauses.append(f"`{date_column}` <= %s")
                params.append(end_date)

            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)

            # ORDER BY 추가 (날짜 컬럼이 있으면 날짜순 정렬)
            if date_column in columns:
                query += f" ORDER BY `{date_column}` ASC"

            # LIMIT 추가
            query += f" LIMIT {int(limit)}"  # limit은 이미 검증됨

            logger.info(
                f"데이터 조회 쿼리 실행: {table_name} - "
                f"컬럼 {len(columns)}개, 제한 {limit}건"
            )
            logger.debug(f"쿼리: {query}, 파라미터: {params}")

            # 5. 쿼리 실행
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                rows = cursor.fetchall()

                # 결과를 딕셔너리 배열로 변환
                result_data = []
                for row in rows:
                    row_dict = {}
                    for idx, col in enumerate(columns):
                        value = row[idx]

                        # 날짜/시간 객체를 문자열로 변환
                        if hasattr(value, 'isoformat'):
                            value = value.isoformat()

                        row_dict[col] = value

                    result_data.append(row_dict)

            logger.info(
                f"데이터 조회 성공: {table_name} - {len(result_data)}건 조회"
            )

            return Response({
                'data': result_data,
                'count': len(result_data),
                'table_name': table_name
            })

        except Exception as e:
            logger.error(
                f"데이터 조회 실패: {table_name} - {str(e)}"
            )
            return Response(
                {'error': f'데이터 조회 중 오류 발생: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
