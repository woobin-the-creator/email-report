---
name: frontend-design
description: 독창적이고 프로덕션 수준의 프론트엔드 인터페이스 설계. 제네릭한 AI 스타일을 거부하고 의도적인 디자인 방향 추구.
recommended_agents:
  - ui-designer
  - frontend-developer
---

# Frontend Design Skill

**독창적이고 프로덕션 수준의 프론트엔드 인터페이스**를 만드는 스킬입니다.

## 핵심 철학

> "명확한 개념적 방향을 선택하고 정밀하게 실행하세요. 대담한 맥시멀리즘과 정제된 미니멀리즘 모두 가능합니다. 핵심은 의도성입니다."

## 디자인 사고 프로세스

1. **목적 이해**: 이 인터페이스가 해결하는 문제는?
2. **톤 설정**: 브루탈리스트, 럭셔리, 플레이풀, 레트로 등
3. **제약 조건 파악**: 기술적 한계, 브랜드 가이드라인
4. **차별화 포인트**: 이 디자인을 기억에 남게 만드는 것은?

## 미학적 요소

### 타이포그래피
- 제네릭 폰트(Inter, Roboto, Arial) 대신 개성 있는 폰트 선택
- 계층 구조와 리듬감 있는 텍스트 배치

### 컬러 & 테마
- 지배색과 날카로운 액센트 색상의 조합
- 보라색 그라데이션 같은 클리셰 회피
- 응집력 있는 팔레트 구성

### 모션 & 애니메이션
- 고영향 애니메이션
- 스크롤 트리거
- 호버 상태의 미세한 변화

```css
/* 의도적인 호버 효과 */
.chart-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

### 공간 구성
- 비대칭 레이아웃
- 요소 간 오버랩
- 예상치 못한 배치

### 시각적 디테일
- 그라데이션, 텍스처
- 맥락적 효과
- 분위기 있는 배경

## 피해야 할 안티패턴

❌ **제네릭 AI 미학**:
- 과도하게 사용된 폰트 패밀리 (Inter, Roboto, Arial)
- 클리셰적인 컬러 스킴 (특히 보라색 그라데이션)
- 예측 가능한 레이아웃
- 쿠키커터 디자인

## 구현 원칙

디자인 비전에 맞는 코드 복잡도:
- 맥시멀리스트 디자인 → 정교한 애니메이션 필요
- 정제된 디자인 → 간격과 타이포그래피의 정밀함 필요

## 프로젝트 적용 (차트 에디터)

```typescript
// 차트 카드 디자인 예시
const ChartCard = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    border-color: rgba(74, 144, 226, 0.5);
  }
`;

// 에디터 툴바
const EditorToolbar = styled.div`
  display: flex;
  gap: 8px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.05);
`;
```

**가이드 원칙**: 독창적인 비전을 완벽하게 실행하세요.
