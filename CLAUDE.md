# CLAUDE.md - Claude Code 협업 가이드

이 문서는 Claude Code가 본 프로젝트에서 효과적으로 작업할 수 있도록 핵심 정보를 제공합니다.

---

## 프로젝트 개요

**상호작용 가능한 데일리 리포트 시스템**

이메일 클라이언트에서 iframe을 통해 상호작용 가능한 차트 리포트를 제공하는 시스템입니다.

### 핵심 기능
- **차트 에디터**: 드래그앤드롭 기반 리포트 레이아웃 편집
- **동적 데이터 바인딩**: 차트 X/Y축에 DB 컬럼 매핑
- **자동 리포트 생성**: Cron을 통한 일일 자동 발행
- **URL 기반 접근**: `/report/yyyymmdd` 형태로 날짜별 리포트 조회

### 기술 스택
| 영역 | 기술 |
|------|------|
| Frontend | React + TypeScript + Vite |
| 차트 | Recharts |
| 레이아웃 | react-grid-layout |
| Backend | Django + DRF |
| Database | MySQL |
| 스케줄러 | django-crontab |
| Infrastructure | Docker + Nginx |

---

## 작업 절차 (필수 확인사항)

### 1. 파일 수정 전 반드시 Read 도구로 먼저 읽기
- 기존 코드 구조를 파악한 후 수정
- 프로젝트 컨벤션을 확인하고 일관성 유지

### 2. 작업 완료 후 검증
```bash
# Frontend
npm run lint        # ESLint 검사
npm run type-check  # TypeScript 타입 체크
npm run build       # 빌드 검증

# Backend
python manage.py test   # Django 테스트
python manage.py check  # 시스템 검사
```

### 3. 커밋 메시지 규칙
- **한국어로 작성**
- Semantic Commit 형식 준수:
  - `feat:` 새 기능
  - `fix:` 버그 수정
  - `docs:` 문서 수정
  - `style:` 코드 포맷팅
  - `refactor:` 리팩토링
  - `test:` 테스트 코드
  - `chore:` 빌드, 설정 변경

---

## 아키텍처 원칙

### Frontend-Backend 통신
- REST API 기반 통신
- 날짜 형식: `YYYYMMDD` (URL), `YYYY-MM-DD` (API)

### 데이터 저장 전략
| 유형 | 저장소 | 예시 |
|------|--------|------|
| 영구 데이터 | MySQL | 템플릿, 리포트 기록 |
| 설정 정보 | JSON 필드 | 차트 설정, 레이아웃 |
| 임시 상태 | React State | 에디터 편집 중 상태 |

### 컴포넌트 설계 원칙
- **차트 컴포넌트**: Recharts 기반, 설정 객체로 동적 렌더링
- **레이아웃 에디터**: react-grid-layout으로 드래그앤드롭
- **재사용성**: 공통 컴포넌트는 `/components/common/`에 배치

### JSON 템플릿 구조
```typescript
interface ChartTemplate {
  id: string;
  name: string;
  layout: LayoutItem[];    // 위치/크기 정보
  charts: ChartConfig[];   // 차트 설정 배열
}

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  dataBinding: {
    xAxis: string;         // 컬럼명
    yAxis: string[];       // 컬럼명 배열
    dataSource: string;    // 테이블명
  };
  style: { colors: string[]; };
}
```

---

## 보안 및 주의사항

### 금지 사항
- API 키, DB 비밀번호 등 민감 정보 하드코딩 금지
- `.env` 파일 커밋 금지
- SQL Injection 취약점이 있는 raw query 사용 금지

### 데이터 접근
- Django ORM을 통한 데이터 접근 권장
- 사용자 입력값은 반드시 검증 후 사용

### 코드 환경 차이점 (중요)

> **GitHub 레포지토리 코드 ≠ 사내 운영 코드**

본 프로젝트는 다음과 같은 운영 방식을 따릅니다:

| 환경 | 설명 |
|------|------|
| **GitHub 레포** | 민감 정보가 제거된 공개 가능한 코드 |
| **사내 PC** | GitHub에서 clone/pull 후, 민감 정보가 포함된 로컬 전용 코드 추가 |

#### 사내 PC에만 존재하는 항목 (예시)
- DB 연결 정보가 포함된 설정 파일
- 내부 API 엔드포인트 및 인증 키
- 사내 전용 데이터 소스 연결 로직
- 운영 환경 전용 Docker/Nginx 설정

#### Claude Code 작업 시 유의사항
1. **코드 누락 가능성 인지**: 레포에 없는 코드가 사내 환경에 존재할 수 있음
2. **Placeholder 패턴 사용**: 민감 정보는 `# TODO: 사내 환경에서 설정` 또는 환경 변수로 대체
3. **질문하기**: 특정 설정이나 연결 정보가 필요할 경우, 사용자에게 확인 요청

```python
# 예시: 레포에 커밋되는 코드
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///local.db')

# 예시: 사내 PC에서만 존재하는 .env.local
# DATABASE_URL=mysql://user:password@internal-server:3306/reports
```

---

## URL 구조

| 경로 | 용도 | 접근 대상 |
|------|------|-----------|
| `/editor` | 차트 에디터 | 관리자 |
| `/report/{yyyymmdd}` | 날짜별 리포트 뷰 | 이메일 iframe |
| `/api/templates/` | 템플릿 CRUD | Backend |
| `/api/data/` | 데이터 조회 | Backend |

---

## 디렉토리 구조 (계획)

```
email-report/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/      # Recharts 기반 차트 컴포넌트
│   │   │   ├── editor/      # 레이아웃 에디터 컴포넌트
│   │   │   └── common/      # 공통 UI 컴포넌트
│   │   ├── pages/
│   │   │   ├── Editor.tsx   # 차트 에디터 페이지
│   │   │   └── Report.tsx   # 리포트 뷰어 페이지
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── types/           # TypeScript 타입 정의
│   │   └── utils/           # 유틸리티 함수
│   └── vite.config.ts
│
├── backend/                  # Django 백엔드
│   ├── reports/             # 리포트 앱
│   │   ├── models.py        # 템플릿, 리포트 모델
│   │   ├── views.py         # API 뷰
│   │   ├── serializers.py   # DRF 시리얼라이저
│   │   └── urls.py          # URL 라우팅
│   ├── data_sources/        # 데이터 소스 앱
│   └── manage.py
│
├── docker/                   # Docker 설정
│   ├── docker-compose.yml
│   ├── nginx/               # Nginx 설정
│   └── mysql/               # MySQL 초기화 스크립트
│
└── docs/                     # 문서
    └── README.md            # 기안서
```

---

## 개발 단계별 가이드

### Phase 1: 기반 구축
1. 정적 리포트 페이지 (`/report/yyyymmdd`) 구현
2. Recharts로 Bar, Line, Pie 차트 컴포넌트 생성
3. Django API로 날짜별 데이터 조회 연동
4. iframe 실환경 테스트

### Phase 2: 에디터 개발
1. react-grid-layout으로 드래그앤드롭 구현
2. 차트 추가/삭제/설정 UI 개발
3. 템플릿 저장/불러오기 API 연동

### Phase 3: 자동화
1. django-crontab으로 스케줄러 설정
2. 자동 리포트 생성 로직 구현
3. (선택) 이메일 자동 발송 연동

---

## Claude Code 활용 가이드

### 추천 작업 흐름
1. **탐색**: 코드베이스 구조 파악 시 Task(Explore) 활용
2. **구현**: 기능 개발 시 TodoWrite로 단계별 계획 수립
3. **검증**: 작업 완료 후 lint/type-check 실행

### 효과적인 요청 예시
```
# 좋은 예시
"Recharts로 Bar 차트 컴포넌트를 만들어줘.
 props로 data, xAxisKey, yAxisKey를 받고,
 호버 시 툴팁이 표시되어야 해."

# 구체적 컨텍스트 제공
"react-grid-layout을 사용해서 차트 에디터를 만들어줘.
 기안서 2.2절의 기능 요구사항을 참고해줘."
```

### 핵심 참고 문서
- `README.md`: 전체 시스템 기안서
- `docs/`: 추가 기술 문서 (향후 추가)

---

## 테스트 전략

### Frontend 테스트
- 차트 컴포넌트 단위 테스트 (Vitest)
- 에디터 상호작용 테스트

### Backend 테스트
- API 엔드포인트 테스트 (Django TestCase)
- 데이터 바인딩 로직 테스트

### E2E 테스트
- iframe 삽입 동작 확인
- 차트 상호작용 (호버, 클릭) 검증

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
