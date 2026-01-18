---
name: code-review
description: 보안, 성능, 테스트, 설계를 포괄하는 코드 리뷰 수행. PR 검토 및 품질 피드백 제공.
recommended_agents:
  - code-reviewer
---

# Code Review Skill

Sentry 엔지니어링 관행을 따르는 코드 리뷰를 수행합니다.

## 리뷰 체크리스트

### 1. 문제 식별
- **런타임 에러**: Null 참조, 타입 에러, 예외 처리 누락
- **성능 이슈**: N+1 쿼리, 불필요한 리렌더링, 메모리 누수
- **사이드 이펙트**: 예상치 못한 상태 변경
- **하위 호환성**: 기존 API 변경 영향
- **ORM 최적화**: Django select_related, prefetch_related
- **보안 취약점**: Injection, XSS, 접근 제어 결함, 시크릿 노출

### 2. 설계 평가
- 컴포넌트 간 상호작용 로직
- 아키텍처 정합성
- 요구사항 충돌 여부

### 3. 테스트 커버리지
- 기능, 통합, E2E 테스트 필요성 확인
- 테스트가 실제 요구사항과 엣지 케이스를 커버하는지 검증

### 4. 장기적 영향 플래그
- 데이터베이스 스키마 변경
- API 수정
- 프레임워크 도입
- 성능 크리티컬 경로
- 보안 민감 코드

## 피드백 가이드라인

- 정중하고 공감하는 톤 유지
- 실행 가능한 제안 제공
- 사소한 이슈만 남았을 때 승인

## 코드 예시

### Python/Django - N+1 쿼리 방지

```python
# ❌ Bad: N+1 쿼리
for report in Report.objects.all():
    print(report.template.name)

# ✅ Good: select_related 사용
for report in Report.objects.select_related('template').all():
    print(report.template.name)
```

### TypeScript/React - useEffect 의존성

```typescript
// ❌ Bad: 의존성 누락
useEffect(() => {
  fetchData(userId);
}, []);

// ✅ Good: 의존성 명시
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 보안 - SQL Injection 방지

```python
# ❌ Bad: raw query
cursor.execute(f"SELECT * FROM reports WHERE date = '{date}'")

# ✅ Good: 파라미터화된 쿼리
cursor.execute("SELECT * FROM reports WHERE date = %s", [date])
```

## 프로젝트 적용

- Django ORM 사용 권장 (CLAUDE.md 참조)
- 사용자 입력값 검증 필수
- API 키, DB 비밀번호 하드코딩 금지
