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

---

## 1. Phase 2-1: 기초 인프라

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 1 | 타입 정의 | `types/editor.ts` 생성: EditorState, EditorAction, ChartPaletteItem 등 | ⬜ |
| 2 | API 클라이언트 확장 | `api/client.ts`에 템플릿/데이터소스 API 함수 추가 | ⬜ |
| 3 | EditorContext 구현 | Context + useReducer 기반 상태 관리 | ⬜ |
| 4 | useEditorState 훅 | 편의 액션 함수 (addChart, removeChart, saveTemplate 등) | ⬜ |

---

## 2. Phase 2-2: 핵심 UI 컴포넌트

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 5 | EditorCanvas | react-grid-layout 래핑, 레이아웃 변경 처리 | ⬜ |
| 6 | ChartWrapper | 개별 차트 컨테이너, 선택 상태 표시, 삭제 버튼 | ⬜ |
| 7 | ChartPalette | 차트 타입별 추가 버튼 (bar, line, pie, combination) | ⬜ |
| 8 | Editor 페이지 통합 | `pages/Editor.tsx` 전면 리팩토링 | ⬜ |

---

## 3. Phase 2-3: 설정 패널

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 9 | ChartConfigPanel 기본 | 선택된 차트 설정 편집 패널 | ⬜ |
| 10 | DataBindingSection | 데이터 소스/컬럼 매핑 UI (X축, Y축) | ⬜ |
| 11 | StyleSection | 색상, 임계선 등 스타일 설정 | ⬜ |
| 12 | 차트 미리보기 통합 | ChartWrapper에 실시간 미리보기 연동 | ⬜ |

---

## 4. Phase 2-4: 저장/불러오기

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 13 | EditorHeader | 템플릿 이름, 저장/불러오기 버튼 | ⬜ |
| 14 | 템플릿 저장 로직 | POST/PUT API 호출 및 상태 관리 | ⬜ |
| 15 | 템플릿 불러오기 로직 | GET API 호출 및 에디터 상태 로드 | ⬜ |
| 16 | URL 파라미터 연동 | `/editor/:templateId?` 라우팅 지원 | ⬜ |

---

## 5. Phase 2-5: 검증 및 개선

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 17 | 유효성 검증 | 에러 처리, 알림 시스템 | ⬜ |
| 18 | UX 개선 | 로딩 상태, 키보드 단축키 (Delete, Esc) | ⬜ |
| 19 | 통합 테스트 | 수동 테스트 시나리오 검증 | ⬜ |

---

## 컴포넌트 구조

```
Editor (페이지)
├── EditorHeader
│   ├── TemplateName (인라인 편집)
│   ├── SaveButton
│   ├── LoadTemplateDropdown
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
│   │   └── GridLayout (react-grid-layout)
│   │       └── ChartWrapper[] (각 차트)
│   │           ├── ChartHeader (제목, 삭제 버튼)
│   │           └── ChartPreview (미니 차트)
│   │
│   └── ChartConfigPanel (사이드바 오른쪽)
│       ├── ChartTypeSelector
│       ├── ChartTitleInput
│       ├── DataBindingSection
│       │   ├── DataSourceSelect
│       │   ├── XAxisColumnSelect
│       │   └── YAxisColumnsSelect (다중 선택)
│       ├── StyleSection
│       │   ├── ColorPicker[]
│       │   ├── ThresholdToggle
│       │   └── ThresholdValueInput
│       └── PreviewSection
│
└── EditorFooter (선택적)
    └── StatusBar (저장 상태, 마지막 수정 시간)
```

---

## 상태 관리 구조

### EditorState

```typescript
interface EditorState {
  // 템플릿 기본 정보
  templateId: number | null;        // null = 새 템플릿
  templateName: string;
  description: string;

  // 레이아웃 상태
  layout: LayoutItem[];             // react-grid-layout 배열
  charts: Map<string, ChartConfig>; // chartId -> config 맵

  // UI 상태
  selectedChartId: string | null;   // 현재 선택된 차트
  isDirty: boolean;                 // 수정 여부
  isSaving: boolean;                // 저장 중

  // 데이터 소스 캐시
  dataSources: DataSource[];        // 사용 가능한 데이터 소스 목록
  columnCache: Map<string, string[]>; // tableName -> columns 캐시
}
```

### EditorAction (Reducer Actions)

```typescript
type EditorAction =
  | { type: 'LOAD_TEMPLATE'; payload: ReportTemplate }
  | { type: 'SET_TEMPLATE_NAME'; payload: string }
  | { type: 'UPDATE_LAYOUT'; payload: LayoutItem[] }
  | { type: 'ADD_CHART'; payload: { id: string; config: ChartConfig; layoutItem: LayoutItem } }
  | { type: 'REMOVE_CHART'; payload: string }
  | { type: 'UPDATE_CHART'; payload: { id: string; config: Partial<ChartConfig> } }
  | { type: 'SELECT_CHART'; payload: string | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: { id: number } }
  | { type: 'SAVE_ERROR' }
  | { type: 'SET_DATA_SOURCES'; payload: DataSource[] }
  | { type: 'CACHE_COLUMNS'; payload: { tableName: string; columns: string[] } };
```

---

## react-grid-layout 설정

```typescript
const GRID_CONFIG = {
  cols: 12,                    // 12컬럼 그리드
  rowHeight: 60,               // 행 높이 (픽셀)
  margin: [10, 10],            // 차트 간 간격
  containerPadding: [10, 10],
  compactType: 'vertical',     // 수직 방향 자동 압축
  preventCollision: false,     // 충돌 시 자동 밀어내기
  isResizable: true,
  isDraggable: true,
};

// 차트 타입별 기본 크기
const DEFAULT_SIZES = {
  bar: { w: 6, h: 4 },        // 반쪽 너비, 높이 240px
  line: { w: 6, h: 4 },
  pie: { w: 4, h: 5 },        // 1/3 너비, 정사각형에 가까운 비율
  area: { w: 6, h: 4 },
  combination: { w: 8, h: 5 }, // 넓은 영역 권장
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
| `/api/data-sources/` | GET | 데이터 소스 목록 |
| `/api/data-sources/{id}/columns/` | GET | 테이블 컬럼 목록 |
| `/api/data-sources/query/` | POST | 데이터 조회 (미리보기용) |

---

## 디렉토리 구조

```
frontend/src/
├── api/
│   └── client.ts              # 확장: 템플릿, 데이터소스 API 추가
├── components/
│   ├── charts/                # 기존 유지
│   └── editor/                # 신규
│       ├── EditorCanvas.tsx
│       ├── EditorHeader.tsx
│       ├── ChartPalette.tsx
│       ├── ChartWrapper.tsx
│       ├── ChartConfigPanel.tsx
│       ├── DataBindingSection.tsx
│       ├── StyleSection.tsx
│       └── index.ts
├── contexts/                  # 신규
│   └── EditorContext.tsx
├── hooks/                     # 신규
│   └── useEditorState.ts
├── pages/
│   └── Editor.tsx             # 전면 리팩토링
└── types/
    ├── api.ts                 # 확장
    └── editor.ts              # 신규
```

---

## 고려사항

### 에지 케이스

| 케이스 | 대응 방안 |
|--------|-----------|
| 저장되지 않은 변경사항 + 페이지 이탈 | `beforeunload` 이벤트로 경고 |
| 데이터 소스가 없는 차트 미리보기 | 샘플 데이터 또는 "데이터 없음" 표시 |
| 동일 이름 템플릿 생성 시도 | API 에러 핸들링 + 사용자 알림 |
| react-grid-layout 충돌 | RGL 기본 충돌 방지 옵션 활성화 |

### 성능 고려사항

| 항목 | 전략 |
|------|------|
| 차트 미리보기 렌더링 | 디바운스 적용 (설정 변경 후 300ms) |
| 컬럼 목록 API 호출 | columnCache로 중복 호출 방지 |
| 대용량 데이터 미리보기 | limit=10으로 제한 |
| react-grid-layout 리렌더링 | React.memo, useMemo 적극 활용 |

### UX 개선점 (향후)

- 자동 저장 (변경 후 30초)
- 실행 취소/다시 실행 (Ctrl+Z / Ctrl+Y)
- 드래그 미리보기 (유령 이미지)
- 키보드 단축키 (Delete, Esc)

---

## 상태 범례

- ⬜ 대기
- 🔄 진행 중
- ✅ 완료
