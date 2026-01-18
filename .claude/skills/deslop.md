---
name: deslop
description: 부실한 코드(slop) 정리 및 리팩토링. 코드 품질 개선, 불필요한 복잡성 제거, 가독성 향상.
recommended_agents:
  - refactoring-specialist
---

# Deslop Skill

코드베이스에서 "슬롭(slop)" - 부실하고, 불필요하게 복잡하며, 가독성이 낮은 코드를 식별하고 정리합니다.

## 슬롭의 정의

슬롭은 다음과 같은 코드입니다:
- 불필요하게 복잡함
- 가독성이 낮음
- 중복이 있음
- 목적이 불명확함
- 유지보수가 어려움

## 슬롭 유형

### 1. 불필요한 복잡성

```typescript
// ❌ 슬롭: 과도한 추상화
const getUser = (id: string) => {
  return createUserFetcher(
    buildUserQuery(
      configureUserOptions(
        initializeUserContext(id)
      )
    )
  ).execute();
};

// ✅ 정리: 직접적인 구현
const getUser = (id: string) => {
  return fetch(`/api/users/${id}`).then(r => r.json());
};
```

### 2. 중복 코드

```typescript
// ❌ 슬롭: 복붙된 로직
const formatDate1 = (d: Date) => `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
const formatDate2 = (d: Date) => `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;

// ✅ 정리: 단일 유틸리티
const formatDate = (d: Date) =>
  d.toISOString().split('T')[0];
```

### 3. 죽은 코드

```typescript
// ❌ 슬롭: 사용되지 않는 코드
// TODO: 나중에 사용할 수도 있음
// const oldFunction = () => { ... };

// ✅ 정리: 삭제
// (죽은 코드는 git 히스토리에 있으니 삭제)
```

### 4. 불명확한 네이밍

```typescript
// ❌ 슬롭: 의미 없는 이름
const d = getData();
const x = d.filter(i => i.a > 0);

// ✅ 정리: 명확한 이름
const reports = getReports();
const activeReports = reports.filter(report => report.status > 0);
```

### 5. 과도한 주석

```typescript
// ❌ 슬롭: 코드를 설명하는 주석
// 사용자 ID를 가져온다
const userId = user.id;
// 사용자 이름을 가져온다
const userName = user.name;

// ✅ 정리: 자기 설명적 코드
const { id: userId, name: userName } = user;
```

## 정리 프로세스

### 1. 식별
```bash
# 복잡도 높은 파일 찾기
npx eslint --format json . | jq '.[] | select(.errorCount > 5)'

# 중복 코드 탐지
npx jscpd src/
```

### 2. 분류
- **즉시 수정**: 버그 위험, 보안 이슈
- **계획 수정**: 기술 부채, 리팩토링 대상
- **관찰**: 개선 여지 있으나 급하지 않음

### 3. 정리
- 한 번에 하나의 변경
- 각 변경 후 테스트 실행
- 작은 커밋으로 분리

### 4. 검증
```bash
npm run lint
npm run type-check
npm run test
```

## 주의사항

- 동작하는 코드를 먼저 이해한 후 정리
- 테스트 없이 리팩토링 금지
- "나중에 필요할 수도"는 삭제 이유
- 점진적 개선, 빅뱅 리팩토링 금지

## 프로젝트 적용

### 차트 컴포넌트 정리 예시

```typescript
// ❌ 슬롭: 반복되는 차트 설정
const BarChartComponent = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
);

const LineChartComponent = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line dataKey="value" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
);

// ✅ 정리: 공통 래퍼 추출
const ChartWrapper = ({ children, data }) => (
  <ResponsiveContainer width="100%" height={300}>
    {React.cloneElement(children, { data })}
  </ResponsiveContainer>
);
```
