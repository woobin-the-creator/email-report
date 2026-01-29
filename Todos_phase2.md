# Phase 2: 차트 에디터 개발 - Todo 계획

## 현재 상태 (Phase 1 완료 기반)

| 영역 | 구현 상태 |
|------|-----------|
| **차트 컴포넌트** | BarChart, LineChart, PieChart, CombinationChart (4종) |
| **TypeScript 타입** | ChartConfig, LayoutItem, DataBinding, ChartStyle 정의됨 |
| **Django 모델** | ReportTemplate (layout JSON, charts JSON), GeneratedReport |
| **API** | 템플릿 CRUD, 데이터 소스 CRUD, 동적 데이터 조회 |
| **의존성** | react-grid-layout ^1.4.4 (이미 설치됨) |
| **Editor 페이지** | 플레이스홀더만 존재 (빈 상태) |

### 타입 일관성 이슈 (해결 필요)

| 문제 | 현재 상태 | 해결 |
|------|-----------|------|
| `combination` 타입 누락 | `types/index.ts`에 없음 | 타입 통합 필요 |
| `DataSource` 타입 미정의 | EditorState에서 사용하나 정의 없음 | `types/editor.ts`에 추가 |

---

## 1. Phase 2-1: 기초 인프라

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 1 | 타입 통합 및 확장 | `types/editor.ts` 생성: ChartType 통합, DataSource, ColumnInfo, EditorState, EditorAction | ⬜ |
| 2 | 차트 렌더링 팩토리 | ChartConfig → React Component 변환 함수 (`utils/chartFactory.ts`) | ⬜ |
| 3 | EditorContext 구현 | Context + useReducer 기반 상태 관리 (Record 사용) | ⬜ |
| 4 | useEditorState 훅 | 편의 액션 함수 + 유효성 검증 로직 | ⬜ |
| 5 | API 클라이언트 확장 | `api/client.ts`에 템플릿/데이터소스 API 함수 추가 | ⬜ |

---

## 2. Phase 2-2: 핵심 UI 컴포넌트

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 6 | EditorCanvas | react-grid-layout 래핑, 레이아웃 변경 처리 | ⬜ |
| 7 | ChartWrapper | 개별 차트 컨테이너, 선택 상태 표시, 삭제 버튼 | ⬜ |
| 8 | ChartPalette | 차트 타입별 추가 버튼 (bar, line, pie, combination) | ⬜ |
| 9 | EmptyState | 차트 없을 때 "차트를 추가하세요" 안내 UI | ⬜ |
| 10 | Editor 페이지 통합 | `pages/Editor.tsx` 전면 리팩토링 | ⬜ |

---

## 3. Phase 2-3: 설정 패널

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 11 | ChartConfigPanel 기본 | 선택된 차트 설정 편집 패널 | ⬜ |
| 12 | DataBindingSection | 데이터 소스/컬럼 매핑 UI (X축, Y축) | ⬜ |
| 13 | StyleSection | 색상, 임계선 등 스타일 설정 | ⬜ |
| 14 | 차트 설정 유효성 검증 | 필수 필드 체크, 에러 메시지 표시 | ⬜ |
| 15 | 차트 미리보기 통합 | ChartWrapper에 실시간 미리보기 연동 | ⬜ |

---

## 4. Phase 2-4: 저장/불러오기

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 16 | EditorHeader | 템플릿 이름, 저장/불러오기/삭제 버튼 | ⬜ |
| 17 | 템플릿 저장 로직 | POST/PUT API 호출 및 상태 관리 | ⬜ |
| 18 | 템플릿 불러오기 로직 | GET API 호출 및 에디터 상태 로드 | ⬜ |
| 19 | 템플릿 삭제 로직 | DELETE API 호출 + 확인 다이얼로그 | ⬜ |
| 20 | URL 파라미터 연동 | `/editor/:templateId?` 라우팅 지원 | ⬜ |

---

## 5. Phase 2-5: 검증 및 개선

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 21 | 에러 바운더리 | 차트 렌더링 실패 시 전체 크래시 방지 | ⬜ |
| 22 | Toast 알림 시스템 | 저장 성공/실패, 에러 알림 표시 | ⬜ |
| 23 | UX 개선 | 로딩 상태, 키보드 단축키 (Delete, Esc, Ctrl+S) | ⬜ |
| 24 | 통합 테스트 | 수동 테스트 시나리오 검증 | ⬜ |

---

## 컴포넌트 구조

```
Editor (페이지)
├── EditorHeader
│   ├── TemplateName (인라인 편집)
│   ├── SaveButton
│   ├── LoadTemplateDropdown
│   ├── DeleteButton
│   └── PreviewButton
│
├── EditorMain (flex container)
│   ├── ChartPalette (사이드바 왼쪽)
│   │   ├── ChartTypeButton (bar)
│   │   ├── ChartTypeButton (line)
│   │   ├── ChartTypeButton (pie)
│   │   └── ChartTypeButton (combination)
│   │
│   ├── EditorCanvas (중앙 영역)
│   │   ├── EmptyState (차트 없을 때)
│   │   └── GridLayout (react-grid-layout)
│   │       └── ErrorBoundary
│   │           └── ChartWrapper[] (각 차트)
│   │               ├── ChartHeader (제목, 삭제 버튼)
│   │               └── ChartPreview (미니 차트)
│   │
│   └── ChartConfigPanel (사이드바 오른쪽)
│       ├── ChartTypeSelector
│       ├── ChartTitleInput
│       ├── DataBindingSection
│       │   ├── DataSourceSelect
│       │   ├── XAxisColumnSelect
│       │   ├── YAxisColumnsSelect (다중 선택)
│       │   └── ValidationMessage
│       ├── StyleSection
│       │   ├── ColorPicker[]
│       │   ├── ThresholdToggle
│       │   └── ThresholdValueInput
│       └── PreviewSection
│
├── Toast (알림)
│
└── EditorFooter (선택적)
    └── StatusBar (저장 상태, 마지막 수정 시간)
```

---

## 상태 관리 구조

### EditorState (개선됨)

```typescript
interface EditorState {
  // 템플릿 기본 정보
  templateId: number | null;        // null = 새 템플릿
  templateName: string;
  description: string;

  // 레이아웃 상태 (Record 사용 - JSON 직렬화 용이)
  layout: LayoutItem[];
  charts: Record<string, ChartConfig>;  // Map → Record 변경

  // UI 상태
  selectedChartId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;

  // 데이터 소스 캐시 (Record 사용)
  dataSources: DataSource[];
  columnCache: Record<string, ColumnInfo[]>;  // Map → Record 변경
}
```

### 신규 타입 정의

```typescript
/** 차트 타입 (통합) */
type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'combination';

/** 데이터 소스 */
interface DataSource {
  id: number;
  name: string;
  table_name: string;
  description?: string;
}

/** 컬럼 정보 */
interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date';  // 타입 힌트 제공
}

/** 유효성 검증 결과 */
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

/** 차트 팔레트 아이템 */
interface ChartPaletteItem {
  type: ChartType;
  label: string;
  icon: React.ReactNode;
  defaultConfig: Partial<ChartConfig>;
  defaultSize: { w: number; h: number };
}
```

### EditorAction (확장됨)

```typescript
type EditorAction =
  | { type: 'LOAD_TEMPLATE'; payload: ReportTemplate }
  | { type: 'SET_TEMPLATE_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'UPDATE_LAYOUT'; payload: LayoutItem[] }
  | { type: 'ADD_CHART'; payload: { id: string; config: ChartConfig; layoutItem: LayoutItem } }
  | { type: 'REMOVE_CHART'; payload: string }
  | { type: 'DUPLICATE_CHART'; payload: string }
  | { type: 'UPDATE_CHART'; payload: { id: string; config: Partial<ChartConfig> } }
  | { type: 'SELECT_CHART'; payload: string | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'RESET_EDITOR' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: { id: number } }
  | { type: 'SAVE_ERROR'; payload: string }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'SET_DATA_SOURCES'; payload: DataSource[] }
  | { type: 'CACHE_COLUMNS'; payload: { tableName: string; columns: ColumnInfo[] } };
```

---

## 차트 렌더링 팩토리

```typescript
// utils/chartFactory.ts

import { BarChart, LineChart, PieChart, CombinationChart } from '@/components/charts';

const CHART_COMPONENTS: Record<ChartType, React.ComponentType<ChartProps>> = {
  bar: BarChart,
  line: LineChart,
  pie: PieChart,
  area: AreaChart,       // LineChart 변형 또는 별도 구현
  combination: CombinationChart,
};

export function renderChart(config: ChartConfig, data: any[]): React.ReactNode {
  const Component = CHART_COMPONENTS[config.type];
  if (!Component) {
    return <div>지원하지 않는 차트 타입: {config.type}</div>;
  }
  return <Component config={config} data={data} />;
}
```

---

## 유효성 검증 로직

```typescript
// utils/validation.ts

export function validateChartConfig(
  config: ChartConfig,
  dataSources: DataSource[]
): ValidationResult {
  const errors: ValidationError[] = [];

  // 제목 검증
  if (!config.title?.trim()) {
    errors.push({ field: 'title', message: '차트 제목을 입력해주세요' });
  }

  // 데이터소스 존재 확인
  const ds = dataSources.find(d => d.table_name === config.dataBinding?.dataSource);
  if (!config.dataBinding?.dataSource) {
    errors.push({ field: 'dataSource', message: '데이터 소스를 선택해주세요' });
  } else if (!ds) {
    errors.push({ field: 'dataSource', message: '존재하지 않는 데이터 소스입니다' });
  }

  // X축 필수 (Pie 차트 제외)
  if (config.type !== 'pie' && !config.dataBinding?.xAxis) {
    errors.push({ field: 'xAxis', message: 'X축 컬럼을 선택해주세요' });
  }

  // Y축 최소 1개
  if (!config.dataBinding?.yAxis?.length) {
    errors.push({ field: 'yAxis', message: 'Y축 컬럼을 최소 1개 선택해주세요' });
  }

  return { isValid: errors.length === 0, errors };
}
```

---

## react-grid-layout 설정

```typescript
const GRID_CONFIG = {
  cols: 12,
  rowHeight: 60,
  margin: [10, 10],
  containerPadding: [10, 10],
  compactType: 'vertical',
  preventCollision: false,
  isResizable: true,
  isDraggable: true,
};

// 차트 타입별 기본 크기 및 제약
const CHART_SIZE_CONFIG: Record<ChartType, {
  default: { w: number; h: number };
  min: { w: number; h: number };
}> = {
  bar:         { default: { w: 6, h: 4 }, min: { w: 3, h: 3 } },
  line:        { default: { w: 6, h: 4 }, min: { w: 3, h: 3 } },
  pie:         { default: { w: 4, h: 5 }, min: { w: 3, h: 4 } },
  area:        { default: { w: 6, h: 4 }, min: { w: 3, h: 3 } },
  combination: { default: { w: 8, h: 5 }, min: { w: 4, h: 4 } },
};

// 차트 타입별 미리보기 데이터 제한
const PREVIEW_LIMITS: Record<ChartType, number> = {
  bar: 15,
  line: 20,
  pie: 8,
  area: 20,
  combination: 15,
};
```

---

## API 엔드포인트

| 엔드포인트 | 메서드 | 용도 |
|------------|--------|------|
| `/api/templates/` | GET | 템플릿 목록 조회 |
| `/api/templates/` | POST | 새 템플릿 생성 |
| `/api/templates/{id}/` | GET | 템플릿 상세 조회 |
| `/api/templates/{id}/` | PUT/PATCH | 템플릿 수정 |
| `/api/templates/{id}/` | DELETE | 템플릿 삭제 |
| `/api/data-sources/` | GET | 데이터 소스 목록 |
| `/api/data-sources/{id}/columns/` | GET | 테이블 컬럼 목록 |
| `/api/data-sources/query/` | POST | 데이터 조회 (미리보기용) |

### API 클라이언트 함수

```typescript
// api/client.ts

// 템플릿 API
export async function fetchTemplates(): Promise<ReportTemplate[]>;
export async function fetchTemplate(id: number): Promise<ReportTemplate>;
export async function createTemplate(data: CreateTemplateRequest): Promise<ReportTemplate>;
export async function updateTemplate(id: number, data: UpdateTemplateRequest): Promise<ReportTemplate>;
export async function deleteTemplate(id: number): Promise<void>;

// 데이터 소스 API
export async function fetchDataSources(): Promise<DataSource[]>;
export async function fetchColumns(dataSourceId: number): Promise<ColumnInfo[]>;
```

---

## 디렉토리 구조

```
frontend/src/
├── api/
│   └── client.ts              # 확장: 템플릿, 데이터소스 API 추가
├── components/
│   ├── charts/                # 기존 유지
│   ├── editor/                # 신규
│   │   ├── EditorCanvas.tsx
│   │   ├── EditorHeader.tsx
│   │   ├── ChartPalette.tsx
│   │   ├── ChartWrapper.tsx
│   │   ├── ChartConfigPanel.tsx
│   │   ├── DataBindingSection.tsx
│   │   ├── StyleSection.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── index.ts
│   └── common/                # 신규
│       ├── Toast.tsx
│       └── ConfirmDialog.tsx
├── contexts/                  # 신규
│   └── EditorContext.tsx
├── hooks/                     # 신규
│   └── useEditorState.ts
├── pages/
│   └── Editor.tsx             # 전면 리팩토링
├── types/
│   ├── api.ts                 # 확장
│   ├── editor.ts              # 신규
│   └── index.ts               # ChartType 통합
└── utils/                     # 신규
    ├── chartFactory.tsx
    └── validation.ts
```

---

## 고려사항

### 에지 케이스

| 케이스 | 대응 방안 | 우선순위 |
|--------|-----------|----------|
| 저장되지 않은 변경사항 + 페이지 이탈 | `beforeunload` 이벤트로 경고 | 높음 |
| 데이터 소스가 없는 차트 미리보기 | 샘플 데이터 또는 "데이터 없음" 표시 | 높음 |
| DataSource 삭제 후 해당 차트 | 차트에 경고 표시 + 데이터소스 재선택 유도 | 높음 |
| 동일 이름 템플릿 생성 시도 | API 에러 핸들링 + 사용자 알림 | 중간 |
| 브라우저 새로고침 | localStorage에 임시 저장 + 복구 옵션 | 중간 |
| 차트 ID 충돌 | `crypto.randomUUID()` 사용으로 방지 | 높음 |
| react-grid-layout 충돌 | RGL 기본 충돌 방지 옵션 활성화 | 낮음 |
| 컬럼 타입 불일치 | 숫자 컬럼을 X축에 사용 시 경고 | 낮음 |

### 성능 고려사항

| 항목 | 전략 |
|------|------|
| 차트 미리보기 렌더링 | 디바운스 적용 (설정 변경 후 300ms) |
| 컬럼 목록 API 호출 | columnCache로 중복 호출 방지 (TTL: 5분) |
| 대용량 데이터 미리보기 | 차트 타입별 limit 적용 (Pie: 8, Bar/Line: 15~20) |
| react-grid-layout 리렌더링 | React.memo, useMemo 적극 활용 |
| layout 객체 메모이제이션 | useMemo로 불필요한 리렌더링 방지 |

### 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| `Delete` | 선택된 차트 삭제 |
| `Escape` | 선택 해제 |
| `Ctrl+S` | 템플릿 저장 |
| `Ctrl+D` | 선택된 차트 복제 |

### UX 개선점 (향후)

- 자동 저장 (변경 후 30초)
- 실행 취소/다시 실행 (Ctrl+Z / Ctrl+Y) - Undo/Redo 히스토리 구조 필요
- 드래그 미리보기 (유령 이미지)
- 반응형 레이아웃 (에디터 화면 크기 변화 대응)

---

## 상태 범례

- ⬜ 대기
- 🔄 진행 중
- ✅ 완료
