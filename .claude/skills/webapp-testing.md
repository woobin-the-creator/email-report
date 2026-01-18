---
name: webapp-testing
description: 로컬 웹 애플리케이션을 Playwright를 통해 테스트하는 자동화 도구. E2E 테스트, iframe 동작 확인, 차트 상호작용 검증에 활용.
recommended_agents:
  - test-automator
---

# Web Application Testing Skill

로컬 웹 애플리케이션을 Playwright 자동화 스크립트(Python)로 테스트합니다.

## 핵심 원칙

1. **스크립트 실행 전 항상 `--help` 옵션으로 사용법 확인**
2. **동적 앱은 네트워크 완료 대기 필수**: `page.wait_for_load_state('networkidle')`

## 워크플로우

### 1. 콘텐츠 유형 판단
- 정적 HTML → 직접 검사
- 동적 앱 → 스크린샷/DOM 검사 후 자동화 실행

### 2. 서버 상태 확인
- 서버가 이미 실행 중인지 확인
- `with_server.py`로 서버 라이프사이클 관리

### 3. 자동화 패턴

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    # 테스트 로직
    browser.close()
```

## 주요 테스트 시나리오

- **페이지 테스트**: 다양한 뷰포트에서 렌더링 확인
- **폼 검증**: 입력, 제출, 에러 핸들링
- **차트 상호작용**: 호버, 클릭 이벤트 (Recharts)
- **iframe 동작**: 이메일 클라이언트 내 렌더링 확인
- **반응형 디자인**: 모바일/태블릿/데스크톱 레이아웃

## 프로젝트 적용

이 프로젝트의 E2E 테스트 전략(CLAUDE.md 참조):
- iframe 삽입 동작 확인
- 차트 상호작용 (호버, 클릭) 검증
- 날짜별 리포트 페이지 렌더링 테스트

## 주의사항

- CRITICAL: JS 실행 완료 대기 필수
- 스크린샷은 `/tmp/` 디렉토리에 저장
- 에러 발생 시 콘솔 로그 캡처
