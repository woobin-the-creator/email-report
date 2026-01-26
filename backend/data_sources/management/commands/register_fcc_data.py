"""
Django Management Command: fcc_data DataSource 등록

Usage:
    python manage.py register_fcc_data
"""

from django.core.management.base import BaseCommand
from django.db import connection
from data_sources.models import DataSource


class Command(BaseCommand):
    help = 'fcc_data 테이블을 DataSource에 등록합니다'

    def handle(self, *args, **options):
        """
        fcc_data DataSource 등록 실행
        """
        self.stdout.write(self.style.WARNING('=' * 60))
        self.stdout.write(self.style.WARNING('fcc_data DataSource 등록 시작'))
        self.stdout.write(self.style.WARNING('=' * 60))

        # 1. 테이블 존재 확인
        table_name = 'fcc_data'
        self.stdout.write(f'\n[1/3] {table_name} 테이블 존재 확인...')

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT 1 FROM information_schema.tables "
                    "WHERE table_schema = DATABASE() "
                    "AND table_name = %s",
                    [table_name]
                )
                result = cursor.fetchone()

                if not result:
                    self.stdout.write(
                        self.style.ERROR(
                            f'✗ 테이블 {table_name}이(가) 존재하지 않습니다.'
                        )
                    )
                    self.stdout.write(
                        self.style.WARNING(
                            '\n테이블을 먼저 생성해주세요:\n'
                            'CREATE TABLE fcc_data (\n'
                            '  id INT AUTO_INCREMENT PRIMARY KEY,\n'
                            '  cdate TIMESTAMP,\n'
                            '  fcc_group VARCHAR(100),\n'
                            '  fcc FLOAT,\n'
                            '  classname VARCHAR(100),\n'
                            '  classid VARCHAR(100)\n'
                            ');'
                        )
                    )
                    return

                self.stdout.write(self.style.SUCCESS(f'✓ 테이블 {table_name} 확인됨'))

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ 테이블 확인 중 오류: {str(e)}')
            )
            return

        # 2. 컬럼 정보 조회
        self.stdout.write(f'\n[2/3] 테이블 컬럼 정보 조회...')

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT COLUMN_NAME, DATA_TYPE "
                    "FROM information_schema.COLUMNS "
                    "WHERE table_schema = DATABASE() "
                    "AND table_name = %s "
                    "ORDER BY ORDINAL_POSITION",
                    [table_name]
                )
                columns_info = cursor.fetchall()

                if not columns_info:
                    self.stdout.write(
                        self.style.ERROR('✗ 컬럼 정보를 가져올 수 없습니다.')
                    )
                    return

                # 컬럼 메타데이터 생성
                columns_metadata = {}
                for col_name, col_type in columns_info:
                    # id 컬럼은 제외 (PK이므로 리포트에 사용하지 않음)
                    if col_name == 'id':
                        continue

                    # 한글 라벨 매핑
                    label_map = {
                        'cdate': '날짜',
                        'fcc_group': 'FCC 그룹',
                        'fcc': 'FCC 값',
                        'classname': '클래스명',
                        'classid': '클래스 ID'
                    }

                    columns_metadata[col_name] = {
                        'type': col_type.lower(),
                        'label': label_map.get(col_name, col_name)
                    }

                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ 컬럼 {len(columns_metadata)}개 확인됨: '
                        f'{", ".join(columns_metadata.keys())}'
                    )
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ 컬럼 조회 중 오류: {str(e)}')
            )
            return

        # 3. DataSource 등록 또는 업데이트
        self.stdout.write(f'\n[3/3] DataSource 등록...')

        try:
            data_source, created = DataSource.objects.update_or_create(
                table_name=table_name,
                defaults={
                    'name': 'FCC 데이터',
                    'description': 'FCC(First Contentful Paint) 성능 데이터 - 일별/그룹별 집계',
                    'columns_metadata': columns_metadata,
                    'is_active': True
                }
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ DataSource 등록 완료 (ID: {data_source.id})'
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ DataSource 업데이트 완료 (ID: {data_source.id})'
                    )
                )

            # 등록된 정보 출력
            self.stdout.write('\n' + '=' * 60)
            self.stdout.write(self.style.SUCCESS('등록된 DataSource 정보:'))
            self.stdout.write('=' * 60)
            self.stdout.write(f'ID: {data_source.id}')
            self.stdout.write(f'이름: {data_source.name}')
            self.stdout.write(f'테이블명: {data_source.table_name}')
            self.stdout.write(f'설명: {data_source.description}')
            self.stdout.write(f'활성 상태: {data_source.is_active}')
            self.stdout.write(f'컬럼 메타데이터:')
            for col, meta in columns_metadata.items():
                self.stdout.write(f'  - {col}: {meta["label"]} ({meta["type"]})')

            self.stdout.write('\n' + '=' * 60)
            self.stdout.write(
                self.style.SUCCESS('✓ fcc_data DataSource 등록 완료!')
            )
            self.stdout.write('=' * 60)

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ DataSource 등록 중 오류: {str(e)}')
            )
            return
