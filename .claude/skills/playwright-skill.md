---
name: playwright-skill
description: Playwright를 이용한 브라우저 자동화. 개발 서버 자동 감지, 테스트 스크립트 작성, 폼/로그인/반응형 테스트.
---

# Playwright Browser Automation Skill

Playwright를 활용한 완전한 브라우저 자동화 스킬입니다.

## 핵심 기능

- **개발 서버 자동 감지**: `detectDevServers()` 함수로 localhost 자동 탐지
- **가시적 브라우저 모드**: 기본값 `headless: false`
- **파라미터화된 URL**: 유연한 테스트 구성
- **환경 변수 지원**: 커스텀 HTTP 헤더

## 워크플로우

### 1. 서버 감지
```javascript
const servers = await detectDevServers();
const baseUrl = servers[0] || 'http://localhost:3000';
```

### 2. 스크립트 작성
스크립트는 항상 `/tmp/playwright-test-*.js`에 저장 (skill 디렉토리에 저장 금지)

### 3. 실행
```bash
cd $SKILL_DIR && node run.js /tmp/playwright-test-*.js
```

## 테스트 패턴

### 다중 뷰포트 테스트
```javascript
const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1920, height: 1080, name: 'desktop' }
];

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.screenshot({ path: `/tmp/screenshot-${vp.name}.png` });
}
```

### 로그인 플로우 검증
```javascript
await page.fill('#email', 'test@example.com');
await page.fill('#password', 'password123');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard');
```

### 폼 제출
```javascript
await page.fill('input[name="title"]', '테스트 리포트');
await page.selectOption('select[name="type"]', 'bar');
await page.click('button[type="submit"]');
await expect(page.locator('.success-message')).toBeVisible();
```

### 차트 상호작용 테스트
```javascript
// Recharts 차트 호버 테스트
const chartBar = page.locator('.recharts-bar-rectangle').first();
await chartBar.hover();
await expect(page.locator('.recharts-tooltip-wrapper')).toBeVisible();
```

### 링크 검증
```javascript
const links = await page.locator('a[href]').all();
for (const link of links) {
  const href = await link.getAttribute('href');
  const response = await page.request.get(href);
  expect(response.ok()).toBeTruthy();
}
```

## 설정

초기 설정:
```bash
npm run setup  # Playwright 및 Chromium 설치
```

## 프로젝트 적용

- iframe 내 리포트 렌더링 확인
- `/report/yyyymmdd` 페이지 E2E 테스트
- Recharts 차트 상호작용 검증
- react-grid-layout 드래그앤드롭 테스트
