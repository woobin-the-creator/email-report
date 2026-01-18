---
name: verification-before-completion
description: 작업 완료 전 필수 검증 프로토콜. 실제 명령 실행 후 증거 기반 완료 선언.
---

# Verification Before Completion Skill

작업 완료 주장 전에 반드시 검증을 수행하는 프로토콜입니다.

## 핵심 원칙

> **"주장 전에 증거, 항상"**

실제 명령 실행으로부터 얻은 신선한 검증 증거 없이는 완료 주장 금지.

## 게이트 함수

완료 주장 전 반드시:

1. **검증 명령 식별**: 주장을 증명하는 명령은?
2. **전체 명령 실행**: 신선하게, 완전하게
3. **출력 전체 확인**: 종료 코드 포함
4. **출력이 주장을 확인하는지 검증**
5. **증거와 함께 주장**

## 올바른 예시 vs 잘못된 예시

### 테스트 검증

```bash
# ✅ 올바름: 실제 실행 후 결과 보고
$ npm run test
✓ 34/34 tests passed
→ "모든 34개 테스트가 통과했습니다"

# ❌ 잘못됨: 추측
→ "이제 통과할 것 같습니다"
→ "아마 괜찮을 거예요"
```

### 린트 검증

```bash
# ✅ 올바름: 실제 실행 후 결과 보고
$ npm run lint
No errors found
→ "린트 오류 0개입니다"

# ❌ 잘못됨: 추측
→ "올바르게 보입니다"
→ "에러가 없어야 합니다"
```

### 빌드 검증

```bash
# ✅ 올바름: 실제 실행 후 결과 보고
$ npm run build
Build completed successfully
→ "빌드가 성공적으로 완료되었습니다"

# ❌ 잘못됨: 추측
→ "빌드될 것입니다"
→ "문제없어 보입니다"
```

## 위험 신호 언어

다음 표현 사용 금지:
- "~할 것 같습니다" (should)
- "아마도" (probably)
- "~인 것 같습니다" (seems to)
- 검증 전 만족 표현

## 검증이 중요한 이유

24건의 실패 기록에서 검증되지 않은 주장이 초래한 결과:
- 깨진 신뢰
- 정의되지 않은 함수 배포
- 거짓 완료에 낭비된 시간

## 프로젝트 적용

### 작업 완료 체크리스트

```bash
# 1. 린트 검증
npm run lint
# 출력 확인: "0 errors, 0 warnings"

# 2. 타입 체크 검증
npm run type-check
# 출력 확인: 에러 없음

# 3. 빌드 검증
npm run build
# 출력 확인: "Build completed"

# 4. 테스트 검증 (Backend)
python manage.py test
# 출력 확인: "OK"

# 5. 시스템 체크
python manage.py check
# 출력 확인: "System check identified no issues"
```

### 보고 형식

```markdown
## 검증 결과

| 항목 | 명령 | 결과 |
|------|------|------|
| Lint | `npm run lint` | ✅ 0 errors |
| TypeCheck | `npm run type-check` | ✅ No errors |
| Build | `npm run build` | ✅ Success |
| Django Test | `python manage.py test` | ✅ 15 tests OK |
| Django Check | `python manage.py check` | ✅ No issues |

**결론**: 모든 검증 통과, 작업 완료
```

## 규칙

검증 명령 실행 → 실제 출력 확인 → 결과 보고

**예외 없음.**
