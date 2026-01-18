---
name: finishing-a-development-branch
description: 개발 브랜치 완료 프로세스. 테스트 검증 후 4가지 옵션 제시, 선택된 작업 실행.
recommended_agents:
  - git-workflow-manager
---

# Finishing a Development Branch Skill

개발 작업 완료 시 체계적인 마무리 프로세스를 안내합니다.

## 핵심 원칙

> **테스트 검증 → 옵션 제시 → 선택 실행 → 정리**

## 워크플로우

### 1. 테스트 검증

진행 전 반드시 테스트 통과 확인:

```bash
# Frontend
npm run lint
npm run type-check
npm run test
npm run build

# Backend
python manage.py test
python manage.py check
```

### 2. 베이스 브랜치 확인

```bash
git branch -vv  # 현재 브랜치 트래킹 정보
git log --oneline main..HEAD  # 베이스 이후 커밋 확인
```

### 3. 4가지 옵션 제시 (정확히 4개)

| 옵션 | 설명 |
|------|------|
| **1. 로컬 머지** | 베이스 브랜치로 머지 (로컬) |
| **2. PR 생성** | 푸시 후 Pull Request 생성 |
| **3. 브랜치 유지** | 현재 상태로 나중에 작업 |
| **4. 작업 폐기** | 변경 사항 삭제 |

### 4. 선택 실행

#### 옵션 1: 로컬 머지
```bash
git checkout main
git merge feature-branch
git branch -d feature-branch
```

#### 옵션 2: PR 생성
```bash
git push -u origin feature-branch
gh pr create --title "제목" --body "설명"
```

#### 옵션 3: 브랜치 유지
- 변경 없이 현재 상태 유지
- 나중에 이어서 작업 가능

#### 옵션 4: 작업 폐기
```bash
# 확인 필수!
git checkout main
git branch -D feature-branch
```

### 5. 정리

- worktree 사용 시 적절히 정리
- 원격 브랜치 정리 (필요 시)

## 흔한 실수

❌ 테스트 검증 생략
❌ 열린 질문 ("어떻게 할까요?") 대신 구조화된 옵션 제시
❌ 확인 없이 작업 삭제

## 통합 시점

이 스킬은 다음 이후에 호출됩니다:
- subagent-driven-development 완료
- executing-plans 완료
- 일반적인 기능 개발 완료

## 프로젝트 적용 예시

```markdown
## 개발 완료 체크리스트

1. ✅ `npm run lint` 통과
2. ✅ `npm run type-check` 통과
3. ✅ `npm run build` 성공
4. ✅ `python manage.py test` 통과

## 옵션 선택

현재 브랜치: `claude/add-chart-component`
베이스 브랜치: `main`

어떤 옵션을 선택하시겠습니까?

1. **로컬 머지** - main 브랜치로 직접 머지
2. **PR 생성** - 코드 리뷰를 위한 PR 생성
3. **브랜치 유지** - 나중에 추가 작업 예정
4. **작업 폐기** - 이 변경 사항 삭제
```
