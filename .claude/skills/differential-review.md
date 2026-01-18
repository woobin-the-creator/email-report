---
name: differential-review
description: 보안 중심 코드 변경 검토. git 히스토리 분석, 코드베이스 크기별 적응형 분석 깊이.
recommended_agents:
  - code-reviewer
  - architect-reviewer
---

# Differential Security Review Skill

코드 변경(PR, 커밋, diff)에 대한 보안 중심 검토를 수행합니다.

## 핵심 원칙

- **증거 기반**: 구체적인 라인 번호와 커밋 포함
- **커버리지 한계 명시**: 검토하지 못한 영역 인정
- **적응형 깊이**: 코드베이스 크기에 따른 분석 수준 조절

## 리스크 분류

### HIGH (즉시 검토)
- 인증/인가 로직
- 암호화 관련 코드
- 외부 API 호출
- 금전/가치 이전
- 검증 로직 제거

### MEDIUM (주의 필요)
- 비즈니스 로직 변경
- 상태 변경
- 새로운 public API

### LOW (일반 검토)
- 주석, 문서
- 테스트 코드
- UI 변경
- 로깅

## 코드베이스 크기별 접근

| 크기 | 파일 수 | 분석 깊이 |
|------|---------|-----------|
| Small | <20 | 모든 의존성 심층 분석 |
| Medium | 20-200 | 1-hop 의존성 집중 검토 |
| Large | 200+ | 크리티컬 경로만 정밀 검토 |

## 6단계 워크플로우

### 1. Triage
- 변경 범위 파악
- 리스크 레벨 초기 분류

### 2. Code Analysis
- 라인별 검토
- 보안 패턴 확인

### 3. Test Coverage
- 테스트 충분성 평가
- 누락된 테스트 케이스 식별

### 4. Blast Radius
- 영향 범위 계산
- 의존성 영향 분석

### 5. Contextual Analysis
- git 히스토리 확인
- 관련 이슈/PR 참조

### 6. Adversarial Modeling
- 공격자 관점 분석
- 악용 시나리오 검토

## 리포트 형식

```markdown
# Security Review: [PR/Commit Title]

## Summary
- 검토 범위: X files, Y lines
- 리스크 레벨: HIGH/MEDIUM/LOW
- 주요 발견 사항 수: N

## Findings

### [F1] 이슈 제목
- **파일**: `path/to/file.py:45`
- **심각도**: HIGH
- **설명**: ...
- **권장 조치**: ...

## Coverage Limitations
- 검토하지 못한 영역 명시

## Recommendations
- 권장 사항 목록
```

## 흔한 실수

❌ git 히스토리 분석 생략
❌ 작은 변경 = 낮은 리스크 가정
❌ 테스트 코드 보안 검토 생략
❌ 컨텍스트 없이 코드만 검토

## 프로젝트 적용

```bash
# 변경 사항 검토 시작
git diff main...HEAD

# 보안 관련 파일 식별
git diff --name-only main...HEAD | grep -E "(auth|api|model)"
```
