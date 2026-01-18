---
name: test-driven-development
description: TDD(Test-Driven Development) 방법론. 테스트 먼저 작성, 실패 확인 후 최소한의 코드로 통과시키는 개발 사이클.
---

# Test-Driven Development (TDD) Skill

**핵심 원칙**: 테스트를 먼저 작성하고, 실패를 확인한 후, 통과시키는 최소한의 코드를 작성합니다.

> "테스트 실패를 보지 않았다면, 올바른 것을 테스트하는지 알 수 없습니다."

## 3단계 사이클

### 1. RED - 실패하는 테스트 작성
```typescript
// 원하는 동작을 테스트로 먼저 정의
describe('ChartComponent', () => {
  it('should render bar chart with given data', () => {
    const data = [{ name: 'A', value: 100 }];
    render(<BarChart data={data} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
```

### 2. GREEN - 최소한의 코드로 통과
```typescript
// 테스트를 통과시키는 가장 간단한 구현
const BarChart = ({ data }) => (
  <ResponsiveContainer>
    <RechartsBarChart data={data}>
      <Bar dataKey="value" />
    </RechartsBarChart>
  </ResponsiveContainer>
);
```

### 3. REFACTOR - 리팩토링
- 중복 제거
- 가독성 개선
- 테스트가 여전히 통과하는지 확인

## 절대 규칙

**실패하는 테스트 없이는 프로덕션 코드 작성 금지**

테스트 전에 작성된 코드는 삭제하고 TDD 방법론으로 다시 작성해야 합니다.

## 흔한 반론에 대한 대응

| 반론 | 대응 |
|------|------|
| "테스트 나중에 해도 같은 결과" | 나중에 작성한 테스트는 즉시 통과 → 아무것도 증명 안 함 |
| "수동 테스트 했어요" | 수동 테스트는 일회성, 재현 불가 |
| "참고용으로 남겨둬요" | 적응도 테스트-후 작성임, 완전 삭제 필요 |

## 검증 체크리스트

작업 완료 전 확인:
- [ ] 모든 함수에 테스트가 있는가?
- [ ] 각 테스트가 구현 전에 실패했는가?
- [ ] 코드 변경이 최소한인가?
- [ ] 모든 테스트가 통과하는가?

## 프로젝트 적용

### Frontend (Vitest)
```typescript
// 차트 컴포넌트 테스트 먼저 작성
describe('ReportChart', () => {
  it('should display tooltip on hover', async () => {
    // RED: 이 테스트가 먼저 실패해야 함
    render(<ReportChart data={mockData} />);
    await userEvent.hover(screen.getByTestId('chart-bar'));
    expect(screen.getByRole('tooltip')).toBeVisible();
  });
});
```

### Backend (Django TestCase)
```python
# API 테스트 먼저 작성
class ReportAPITest(TestCase):
    def test_get_report_by_date(self):
        # RED: 이 테스트가 먼저 실패해야 함
        response = self.client.get('/api/reports/20240115/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('charts', response.json())
```

## TDD가 실용적인 이유

배포 후가 아닌 배포 전에 버그를 발견합니다.
