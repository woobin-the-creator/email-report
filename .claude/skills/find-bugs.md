---
name: find-bugs
description: 보안 및 품질 이슈에 집중한 코드 리뷰 방법론. 5단계 프로세스로 체계적인 버그 탐지.
---

# Find Bugs Skill

보안 및 품질 이슈에 초점을 맞춘 구조화된 코드 리뷰 방법론입니다.

## 5단계 프로세스

### 1. Diff 수집
기본 브랜치부터 HEAD까지의 전체 diff 수집. 변경 사항 누락 방지.

```bash
git diff $(git merge-base HEAD main)..HEAD
```

### 2. 공격 표면 매핑

수정된 파일에서 식별:
- 사용자 입력 처리
- 데이터베이스 쿼리
- 인증/인가 체크
- 외부 API 호출

### 3. 보안 체크리스트

| 카테고리 | 확인 항목 |
|----------|-----------|
| Injection | SQL, Command, LDAP, XPath |
| XSS | Reflected, Stored, DOM-based |
| 인증 | 세션 관리, 토큰 검증 |
| 인가 | 접근 제어, 권한 상승 |
| CSRF | 토큰 검증 |
| Race Condition | 동시성 이슈 |
| 암호화 | 약한 알고리즘, 키 관리 |
| 정보 노출 | 에러 메시지, 디버그 정보 |
| DoS | 리소스 소진, 무한 루프 |
| 비즈니스 로직 | 흐름 우회, 검증 누락 |

### 4. 검증 및 감사

파인딩 확정 전:
- [ ] 검토한 모든 파일 목록 작성
- [ ] 체크리스트 모든 항목 완료 확인
- [ ] 검증 불가 영역 명시

### 5. 리포트 작성

우선순위:
1. 보안 취약점
2. 버그
3. 코드 품질 (스타일 이슈는 생략)

## 파인딩 형식

```markdown
## [SEVERITY] 이슈 제목

**파일**: `src/api/reports.py:45`
**심각도**: HIGH / MEDIUM / LOW
**문제**: 구체적인 문제 설명
**증거**: 해당 코드가 취약한 이유
**수정 방안**: 구체적인 해결책
**참고**: 관련 보안 표준 또는 RFC
```

## 핵심 원칙

- 증거 기반 파인딩만 보고
- 이미 처리되었거나 테스트된 이슈는 제외
- 가상의 문제 생성 금지

## 프로젝트 적용 예시

### Django - SQL Injection 체크
```python
# ❌ 취약한 코드
def get_report(request, date):
    query = f"SELECT * FROM reports WHERE date = '{date}'"
    return Report.objects.raw(query)

# ✅ 안전한 코드
def get_report(request, date):
    return Report.objects.filter(date=date)
```

### React - XSS 체크
```typescript
// ❌ 취약한 코드
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 안전한 코드
<div>{sanitizedContent}</div>
```
