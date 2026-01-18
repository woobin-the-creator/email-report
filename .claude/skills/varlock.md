---
name: varlock
description: 환경 변수 보안 관리. 시크릿이 터미널, 로그, Claude 컨텍스트에 노출되지 않도록 보호.
recommended_agents:
  - devops-engineer
---

# Varlock Security Skill

Claude Code 세션에서 환경 변수를 안전하게 관리하는 스킬입니다.

## 핵심 원칙

> **시크릿은 절대로 터미널 출력, Claude 입출력 컨텍스트, 로그 파일, git 커밋에 노출되면 안 됩니다.**

## 보안 규칙

### 절대 금지 사항

1. **시크릿 echo 금지**
   ```bash
   # ❌ 절대 금지
   echo $DATABASE_URL
   echo $API_KEY

   # ✅ 대신 사용
   varlock load --quiet
   ```

2. **.env 파일 직접 읽기 금지**
   ```bash
   # ❌ 절대 금지
   cat .env
   less .env

   # ✅ 스키마만 확인
   cat .env.schema
   ```

3. **명령어에 시크릿 포함 금지**
   ```bash
   # ❌ 절대 금지
   curl -H "Authorization: Bearer $TOKEN" ...

   # ✅ 환경 변수 사용
   varlock run -- curl -H "Authorization: Bearer \$TOKEN" ...
   ```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `varlock load` | 환경 검증 (마스킹된 값 표시) |
| `varlock run -- [cmd]` | 시크릿 주입하여 명령 실행 |
| `varlock init` | 기존 .env에서 스키마 생성 |

## 스키마 어노테이션

```env
# .env.schema
@defaultSensitive=true

# @sensitive - 출력에서 마스킹
DATABASE_URL=@sensitive @type=url

# @type - 형식 검증 (string, url, port, enum 등)
API_PORT=@type=port

# enum 타입
NODE_ENV=@type=enum(development,staging,production)
```

## 프로젝트 적용

### CLAUDE.md 보안 규칙과 연계

```python
# 레포에 커밋되는 코드
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///local.db')

# 사내 PC의 .env.local (커밋 금지)
# DATABASE_URL=mysql://user:password@internal-server:3306/reports
```

### 검증 워크플로우

1. `.env.schema` 파일 생성
2. `varlock init`으로 스키마 초기화
3. `varlock load`로 환경 검증
4. `varlock run -- python manage.py runserver`로 실행

## 요청 거부

Claude는 다음 요청을 거부해야 합니다:
- .env 파일 직접 읽기 요청
- 시크릿 수정 요청 (수동 업데이트 안내)
- 시크릿 값 출력 요청

대신 varlock 명령어 사용을 안내하세요.
