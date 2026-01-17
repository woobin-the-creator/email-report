# 상호작용 가능한 데일리 리포트 시스템 구축 기안서

| 항목 | 내용 |
|------|------|
| 작성일 | 2025년 1월 17일 |
| 작성자 | 정우빈 |
| 부서 | 개발팀 |

---

## 1. 배경 및 니즈

### 1.1 현황

현재 사내에서는 각종 업무 데이터(생산현황, 매출, 품질지표 등)를 일별로 취합하여 이메일로 공유하고 있으나, 기존 방식은 다음과 같은 한계가 있습니다.

- 정적인 이미지나 표 형태로 전달되어 세부 데이터 확인이 어려움
- 수신자가 원하는 관점으로 데이터를 탐색할 수 없음
- 리포트 형식 변경 시 매번 수작업 필요

### 1.2 니즈

1. **상호작용 가능한 리포트**: 이메일을 열었을 때 호버, 클릭, 툴팁 등 웹 브라우저와 동일한 상호작용 제공
2. **유연한 레이아웃**: 원하는 형태로 차트를 배치하고 템플릿으로 저장하여 재사용
3. **자동화된 발행**: 매일 자동으로 리포트가 생성되어 별도 수작업 없이 배포
4. **데이터 바인딩**: 차트에 표시할 데이터를 컬럼명으로 지정하면 자동으로 연결

### 1.3 핵심 전제 검증

사내 이메일 클라이언트(자체 개발 시스템)에서 iframe을 통한 외부 웹페이지 삽입이 가능한지 사전 테스트를 수행하였습니다.

| 테스트 항목 | 결과 | 비고 |
|-------------|------|------|
| iframe 삽입 | ✓ 성공 | HTML 렌더링 정상 |
| JavaScript 실행 | ✓ 성공 | 차트 상호작용 동작 |
| 호버 툴팁 | ✓ 성공 | 데이터 포인트 표시 |
| 클릭 이벤트 | ✓ 성공 | 이벤트 핸들러 동작 |

---

## 2. 제안 솔루션

### 2.1 시스템 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Environment                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │  Nginx   │───▶│    Django    │───▶│       MySQL          │   │
│  │ (Proxy)  │    │   Backend    │    │  - 템플릿 저장       │   │
│  └────┬─────┘    └──────────────┘    │  - 데이터 테이블     │   │
│       │                              │  - 리포트 메타정보   │   │
│       │          ┌──────────────┐    └──────────────────────┘   │
│       └─────────▶│    React     │                               │
│                  │   Frontend   │                               │
│                  │  - 차트 에디터│                               │
│                  │  - 리포트 뷰어│                               │
│                  └──────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 주요 기능

| 기능 | 설명 |
|------|------|
| 차트 에디터 | 그리드 기반 드래그앤드롭으로 차트 배치 및 설정 |
| 템플릿 저장 | 완성된 레이아웃을 JSON 형태로 DB에 저장 |
| 데이터 바인딩 | 차트의 X/Y축에 데이터 테이블 컬럼명 매핑 |
| 자동 리포트 생성 | Cron으로 매일 지정 시간에 리포트 생성 |
| URL 기반 접근 | `/report/yyyymmdd` 형태로 날짜별 리포트 접근 |

### 2.3 URL 구조

```
/editor              → 차트 에디터 (관리자용)
/report/20250117     → 해당 날짜 리포트 (이메일 iframe용)
/api/templates/      → 템플릿 CRUD API
/api/data/           → 데이터 조회 API
```

### 2.4 이메일 삽입 형태

```html
<iframe
  src="http://{VM주소}/report/20250117"
  width="100%"
  height="800"
  frameborder="0">
</iframe>
```

---

## 3. 기술 스택

### 3.1 선정 기술

| 영역 | 기술 | 선정 사유 |
|------|------|-----------|
| Frontend | React + TypeScript + Vite | 기존 JFpage 프로젝트와 동일한 스택 |
| 차트 라이브러리 | **Recharts** | React 컴포넌트 방식, 동적 데이터 바인딩에 유리 |
| 레이아웃 에디터 | react-grid-layout | 그리드 기반 드래그앤드롭 지원 |
| Backend | Django + DRF | 기존 인프라 활용 |
| Database | MySQL | 기존 인프라 활용 |
| 스케줄러 | django-crontab | 매일 리포트 자동 생성 |
| Infrastructure | Docker + Nginx | 기존 인프라 활용 |

### 3.2 차트 라이브러리 비교 (Recharts 선정 근거)

| 기준 | Recharts | Chart.js | ECharts |
|------|----------|----------|---------|
| React 친화성 | ⭐⭐⭐ 최고 | ⭐⭐ 래퍼 필요 | ⭐⭐ 래퍼 필요 |
| TypeScript 지원 | ⭐⭐⭐ 내장 | ⭐⭐ 보통 | ⭐⭐ 보통 |
| 동적 차트 구성 | ⭐⭐⭐ 매우 유리 | ⭐⭐ 가능 | ⭐⭐ 가능 |
| 코드 가독성 | ⭐⭐⭐ JSX 선언형 | ⭐⭐ 명령형 | ⭐⭐ 명령형 |

**Recharts 선정 핵심 이유**: 에디터에서 차트를 동적으로 추가/삭제/수정할 때 선언형 JSX 방식이 템플릿 시스템과 자연스럽게 연결됨

```tsx
// Recharts: 설정 객체 → 컴포넌트 매핑이 직관적
const chartConfig = { type: 'bar', dataKey: 'sales' };

<BarChart data={data}>
  <XAxis dataKey={chartConfig.xAxis} />
  <Bar dataKey={chartConfig.dataKey} />
  <Tooltip />  {/* 호버 시 툴팁 자동 */}
</BarChart>
```

---

## 4. 데이터베이스 설계

### 4.1 ERD 개요

```
┌─────────────────┐       ┌─────────────────┐
│ report_templates │       │  data_sources   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ layout (JSON)   │       │ table_name      │
│ charts (JSON)   │       │ description     │
│ created_at      │       └─────────────────┘
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│generated_reports│
├─────────────────┤
│ id (PK)         │
│ template_id (FK)│
│ report_date     │
│ generated_at    │
│ status          │
└─────────────────┘
```

### 4.2 테이블 정의

```sql
-- 템플릿 저장
CREATE TABLE report_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    layout JSON NOT NULL,      -- react-grid-layout 정보
    charts JSON NOT NULL,      -- 차트 설정들
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- 데이터 소스 테이블 정의
CREATE TABLE data_sources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,           -- "일일매출", "생산현황" 등
    table_name VARCHAR(100) NOT NULL,     -- 실제 참조할 테이블명
    description TEXT
);

-- 생성된 리포트 기록
CREATE TABLE generated_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT,
    report_date DATE NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    FOREIGN KEY (template_id) REFERENCES report_templates(id)
);
```

### 4.3 템플릿 JSON 구조

```typescript
interface ChartTemplate {
  id: string;
  name: string;
  layout: LayoutItem[];  // 각 차트의 위치/크기
  charts: ChartConfig[];
}

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  dataBinding: {
    xAxis: string;      // 컬럼명 (예: "date")
    yAxis: string[];    // 컬럼명들 (예: ["sales", "profit"])
    dataSource: string; // 테이블명
  };
  style: {
    colors: string[];
  };
}
```

---

## 5. 개발 로드맵

### Phase 1: 기반 구축 (1~2주)

| 순서 | 작업 | 상세 내용 | 산출물 |
|------|------|-----------|--------|
| 1-1 | 정적 리포트 페이지 | 하드코딩된 차트 3개로 `/report/yyyymmdd` 라우트 구현 | React 페이지 |
| 1-2 | Recharts 학습 | Bar, Line, Pie 차트 기본 사용법 습득 | 샘플 컴포넌트 |
| 1-3 | 데이터 연동 | Django API → 날짜별 데이터 조회 → 차트 바인딩 | REST API |
| 1-4 | iframe 실환경 테스트 | 실제 이메일에 삽입하여 동작 확인 | 테스트 결과 |

### Phase 2: 에디터 개발 (2~3주)

| 순서 | 작업 | 상세 내용 | 산출물 |
|------|------|-----------|--------|
| 2-1 | 그리드 레이아웃 에디터 | react-grid-layout으로 드래그앤드롭 구현 | 에디터 UI |
| 2-2 | 차트 추가/삭제 기능 | 사이드바에서 차트 선택 → 캔버스에 추가 | 차트 팔레트 |
| 2-3 | 차트 설정 패널 | 차트 타입, 데이터 컬럼 바인딩 UI | 설정 패널 |
| 2-4 | 템플릿 저장/불러오기 | JSON 직렬화 → DB 저장/조회 | CRUD API |

### Phase 3: 자동화 (1주)

| 순서 | 작업 | 상세 내용 | 산출물 |
|------|------|-----------|--------|
| 3-1 | Cron 스케줄러 설정 | django-crontab으로 매일 오전 자동 실행 | Cron 설정 |
| 3-2 | 리포트 생성 로직 | 템플릿 + 당일 데이터 → 리포트 레코드 생성 | 생성 스크립트 |
| 3-3 | 이메일 발송 연동 (선택) | 생성된 리포트 URL을 이메일 본문에 삽입하여 자동 발송 | 발송 스크립트 |

---

## 6. 리포트 생성 및 배포 흐름

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   템플릿    │     │  Cron Job   │     │  리포트     │     │   이메일    │
│  (레이아웃) │     │ (매일 09:00)│     │  URL 생성   │     │   발송      │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │                   ▼                   │                   │
       │           ┌─────────────┐             │                   │
       └──────────▶│ 오늘 날짜   │─────────────┘                   │
                   │ 데이터 조회 │                                 │
                   └──────┬──────┘                                 │
                          │                                        │
                          ▼                                        │
                   ┌─────────────┐                                 │
                   │/report/     │                                 │
                   │ 20250117    │─────────────────────────────────┘
                   └─────────────┘
```

---

## 7. 기대 효과

| 항목 | 기존 | 개선 후 |
|------|------|---------|
| 데이터 탐색 | 정적 이미지, 확인 불가 | 호버/클릭으로 상세 데이터 확인 |
| 리포트 형식 변경 | 매번 수작업 | 에디터에서 템플릿 수정 후 자동 적용 |
| 일일 리포트 발행 | 수동 작성 및 발송 | Cron으로 자동 생성 및 발송 |
| 과거 리포트 조회 | 이메일 검색 | URL로 직접 접근 (`/report/yyyymmdd`) |

---

## 8. 향후 확장 가능성

- 주간/월간 리포트 템플릿 추가
- 사용자별 맞춤 대시보드 제공
- 리포트 PDF 다운로드 기능
- 실시간 데이터 연동 (WebSocket)
- 알림 조건 설정 (임계값 초과 시 강조 표시)

---

## 9. 결론

사내 이메일 클라이언트의 iframe 지원이 검증되었으므로, 제안된 시스템 구축은 기술적으로 실현 가능합니다. 기존 JFpage 인프라(React, Django, Docker)를 활용하여 약 4~6주 내 MVP 개발이 가능하며, 이를 통해 데일리 리포트의 상호작용성과 자동화를 확보할 수 있습니다.
