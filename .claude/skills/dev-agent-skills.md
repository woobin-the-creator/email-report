---
name: dev-agent-skills
description: Git 및 GitHub 워크플로우 자동화. 커밋, PR 생성, PR 리뷰 처리를 위한 통합 스킬.
recommended_agents:
  - git-workflow-manager
---

# Development Agent Skills

Git과 GitHub 워크플로우를 자동화하는 통합 스킬입니다.

## 포함된 스킬

1. **git-commit**: Conventional Commits 형식의 커밋 생성
2. **github-pr-creation**: PR 생성 자동화
3. **github-pr-review**: PR 리뷰 피드백 처리

---

## 1. Git Commit

### Conventional Commits 형식
```
type(scope): subject
```

### 커밋 타입

| 타입 | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 |
| `perf` | 성능 개선 |
| `test` | 테스트 코드 |
| `ci` | CI/CD 설정 |
| `docs` | 문서 수정 |
| `chore` | 빌드, 설정 변경 |
| `style` | 코드 포맷팅 |
| `security` | 보안 관련 |

### 규칙
- **프로젝트 컨벤션 먼저 확인** (CLAUDE.md)
- scope는 kebab-case 사용
- subject는 콜론 뒤 50자 제한
- 현재형 명령형 사용

### 프로젝트 규칙 (CLAUDE.md)
- **한국어로 작성**
- Semantic Commit 형식 준수

```bash
# 예시
git commit -m "feat(chart): 막대 차트 호버 툴팁 추가"
git commit -m "fix(api): 날짜 형식 변환 오류 수정"
```

---

## 2. GitHub PR Creation

### 워크플로우

1. **환경 확인**: GitHub CLI 설치 확인
2. **브랜치 확인**: 타겟 브랜치 사용자 확인 (필수)
3. **정보 수집**: 커밋 분석, 변경 사항 확인
4. **테스트 실행**: 테스트 통과 필수
5. **PR 생성**: 사용자 승인 후 생성

### 필수 규칙
- ✅ 항상 타겟 브랜치 사용자 확인
- ✅ PR 생성 전 테스트 실행
- ✅ 사용자 승인 없이 PR 생성 금지

### PR 형식
```markdown
## Summary
<1-3 bullet points>

## Test plan
- [ ] 테스트 항목 1
- [ ] 테스트 항목 2
```

---

## 3. GitHub PR Review

### 워크플로우

1. **프로젝트 컨벤션 확인**
2. **PR 정보 가져오기**
3. **코멘트 심각도 분류**: CRITICAL > HIGH > MEDIUM > LOW
4. **각 코멘트 처리**:
   - 컨텍스트 표시
   - 수정 제안
   - 사용자 확인
   - 변경 적용
5. **커밋**: 코멘트 ID 참조
6. **스레드 답글**: 해결 내용 설명
7. **테스트 실행**: 푸시 전 필수
8. **리뷰 제출**

### 필수 규칙
- ✅ 파일 수정 전 확인
- ✅ 다중 이슈 코멘트 전부 해결
- ✅ 푸시 전 테스트 실행
- ✅ HIGH/CRITICAL 코멘트 건너뛰기 금지
- ✅ 기능 수정은 개별 커밋, 코스메틱 수정은 배치 커밋

---

## 통합 사용 예시

```bash
# 1. 작업 완료 후 커밋
git add src/components/Chart.tsx
git commit -m "feat(chart): 반응형 컨테이너 적용"

# 2. PR 생성
gh pr create --title "feat(chart): 반응형 컨테이너 적용" --body "..."

# 3. 리뷰 피드백 처리
# (코멘트 처리 → 커밋 → 답글 → 테스트 → 푸시)
```
