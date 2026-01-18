---
name: react-best-practices
description: React 및 Next.js 성능 최적화 가이드라인. 컴포넌트 작성, 데이터 페칭, 번들 크기 최적화에 활용.
---

# React Best Practices Skill

React와 Next.js 애플리케이션을 위한 종합 성능 최적화 가이드입니다.

## 우선순위별 카테고리 (8개, 45개 규칙)

### CRITICAL - 워터폴 제거
- `async-parallel`: 비동기 작업 병렬 처리
- 순차적 API 호출 대신 `Promise.all()` 사용
- 데이터 의존성 그래프 분석 후 최적화

### CRITICAL - 번들 크기 최적화
- `bundle-barrel-imports`: 배럴 파일에서 개별 import
- 트리 쉐이킹 가능한 import 패턴 사용
- 동적 import로 코드 스플리팅

```typescript
// ❌ Bad
import { Button, Input, Modal } from '@/components';

// ✅ Good
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
```

### HIGH - 서버 사이드 성능
- 캐싱 전략 적용
- 서버 컴포넌트 활용
- 데이터 프리페칭

### HIGH - 클라이언트 페칭
- 요청 중복 제거
- SWR/React Query 캐싱 활용
- 옵티미스틱 업데이트

### MEDIUM - 리렌더링 최적화
- `useMemo`, `useCallback` 적절한 사용
- 상태 끌어올리기 vs 컴포지션
- Context 분리로 불필요한 리렌더 방지

```typescript
// ❌ 매 렌더마다 새 객체 생성
<Chart options={{ responsive: true }} />

// ✅ 메모이제이션
const options = useMemo(() => ({ responsive: true }), []);
<Chart options={options} />
```

### MEDIUM - 렌더링 성능
- 가상화 (react-window, react-virtualized)
- CSS 최적화
- 이미지 최적화 (next/image)

### LOW - JavaScript 성능
- 불변성 유지
- 메모리 누수 방지
- Web Worker 활용

### LOW - 고급 패턴
- Ref 기반 접근법
- 상태 머신
- Compound Components

## 프로젝트 적용 (Recharts + react-grid-layout)

```typescript
// 차트 컴포넌트 최적화 예시
const ChartComponent = memo(({ data, config }: ChartProps) => {
  const chartData = useMemo(() => processData(data), [data]);

  return (
    <ResponsiveContainer>
      <BarChart data={chartData}>
        {/* ... */}
      </BarChart>
    </ResponsiveContainer>
  );
});
```

## 적용 시점

- 새로운 React 컴포넌트 작성 시
- 기존 React/Next.js 코드 리팩토링 시
- 성능 검토 수행 시
- 번들 크기 최적화 필요 시
