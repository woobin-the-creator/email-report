"""
Django Management Command: BigQuery에서 fcc_data 로드

이 파일은 사내 환경 전용입니다.
BigQuery 연결 정보 및 SQL 쿼리는 보안상 Git에 커밋하지 않습니다.

Usage:
    python manage.py load_fcc_data
    python manage.py load_fcc_data --days 30
    python manage.py load_fcc_data --dry-run
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection
import pandas as pd
from sqlalchemy import create_engine, text
from django.conf import settings


class Command(BaseCommand):
    help = 'BigQuery에서 fcc_data를 조회하여 MySQL에 저장합니다'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='조회할 일수 (기본값: 30일)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='실제 저장 없이 테스트 실행'
        )
        parser.add_argument(
            '--append',
            action='store_true',
            help='기존 데이터 유지하고 추가 (기본: 전체 교체)'
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        append_mode = options['append']

        self.stdout.write(self.style.WARNING('=' * 60))
        self.stdout.write(self.style.WARNING('fcc_data 로드 시작'))
        self.stdout.write(self.style.WARNING('=' * 60))
        self.stdout.write(f'조회 기간: 최근 {days}일')
        self.stdout.write(f'모드: {"DRY RUN" if dry_run else "실제 실행"}')
        self.stdout.write(f'저장 방식: {"추가" if append_mode else "전체 교체"}')
        self.stdout.write('')

        # 1. BigQuery 로그인
        self.stdout.write('[1/4] BigQuery 로그인...')
        try:
            self._bq_login()
            self.stdout.write(self.style.SUCCESS('✓ BigQuery 로그인 성공'))
        except Exception as e:
            raise CommandError(f'BigQuery 로그인 실패: {str(e)}')

        # 2. 데이터 조회
        self.stdout.write(f'\n[2/4] BigQuery에서 데이터 조회 (최근 {days}일)...')
        try:
            df = self._fetch_data(days)
            self.stdout.write(
                self.style.SUCCESS(f'✓ {len(df):,}개 행 조회됨')
            )

            if len(df) > 0:
                self.stdout.write(f'  컬럼: {", ".join(df.columns.tolist())}')
                self.stdout.write(f'  샘플 데이터:')
                self.stdout.write(str(df.head(3).to_string(index=False)))
        except Exception as e:
            raise CommandError(f'데이터 조회 실패: {str(e)}')

        if dry_run:
            self.stdout.write('\n' + self.style.WARNING('[DRY RUN] 실제 저장을 건너뜁니다.'))
            self.stdout.write(self.style.SUCCESS('✓ DRY RUN 완료'))
            return

        # 3. MySQL 연결 및 저장
        self.stdout.write(f'\n[3/4] MySQL에 데이터 저장...')
        try:
            saved_count = self._save_to_mysql(df, append_mode)
            self.stdout.write(
                self.style.SUCCESS(f'✓ {saved_count:,}개 행 저장됨')
            )
        except Exception as e:
            raise CommandError(f'데이터 저장 실패: {str(e)}')

        # 4. 저장 확인
        self.stdout.write(f'\n[4/4] 저장 확인...')
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM fcc_data")
                total_count = cursor.fetchone()[0]
                self.stdout.write(
                    self.style.SUCCESS(f'✓ 테이블 총 {total_count:,}개 행')
                )
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'! 확인 중 오류 (저장은 완료됨): {str(e)}')
            )

        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('✓ fcc_data 로드 완료!'))
        self.stdout.write('=' * 60)

    def _bq_login(self):
        """
        BigQuery 로그인

        TODO: 사내 환경에서 아래 코드를 실제 구현으로 교체하세요.

        예시:
            from {마스킹처리} import login
            login(id="{사용자 ID}", password="{비밀번호}")
        """
        # ============================================================
        # 사내 환경 전용 코드 - 아래 주석을 해제하고 수정하세요
        # ============================================================
        # from {마스킹처리} import login
        # login(id="{사용자 ID}", password="{비밀번호}")
        # ============================================================

        raise NotImplementedError(
            "BigQuery 로그인이 구현되지 않았습니다. "
            "_bq_login() 메서드를 사내 환경에 맞게 수정하세요."
        )

    def _fetch_data(self, days: int) -> pd.DataFrame:
        """
        BigQuery에서 데이터 조회

        TODO: 사내 환경에서 아래 코드를 실제 구현으로 교체하세요.

        Args:
            days: 조회할 일수

        Returns:
            조회된 DataFrame (컬럼: cdate, fcc_group, fcc, classname, classid)
        """
        # ============================================================
        # 사내 환경 전용 코드 - 아래 주석을 해제하고 수정하세요
        # ============================================================
        # import {마스킹처리} as bdq
        #
        # my_query = f"""
        # -- 여기에 SQL 쿼리를 입력하세요
        # -- days 파라미터 활용 예시:
        # -- WHERE cdate >= DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY)
        # """
        #
        # df = bdq.getData(
        #     param=my_query,
        #     convert_type=True,
        #     user_name="{사용자 ID}"
        # )
        # return df
        # ============================================================

        raise NotImplementedError(
            "BigQuery 데이터 조회가 구현되지 않았습니다. "
            "_fetch_data() 메서드를 사내 환경에 맞게 수정하세요."
        )

    def _save_to_mysql(self, df: pd.DataFrame, append_mode: bool) -> int:
        """
        DataFrame을 MySQL에 저장

        Args:
            df: 저장할 DataFrame
            append_mode: True면 기존 데이터 유지, False면 전체 교체

        Returns:
            저장된 행 수
        """
        # Django settings에서 DB 정보 가져오기
        db_settings = settings.DATABASES['default']

        # SQLAlchemy 엔진 생성
        engine = create_engine(
            f"mysql+pymysql://{db_settings['USER']}:{db_settings['PASSWORD']}"
            f"@{db_settings['HOST']}:{db_settings['PORT']}/{db_settings['NAME']}"
        )

        table_name = 'fcc_data'

        with engine.begin() as conn:
            # 전체 교체 모드면 기존 데이터 삭제
            if not append_mode:
                conn.execute(text(f"DELETE FROM {table_name}"))
                self.stdout.write('  기존 데이터 삭제됨')

        # DataFrame 저장
        df.to_sql(
            name=table_name,
            con=engine,
            if_exists='append',
            index=False
        )

        return len(df)
