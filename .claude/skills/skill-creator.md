---
name: skill-creator
description: Claude 기능 확장을 위한 커스텀 스킬 개발 가이드. 스킬 구조, 설계 원칙, 작성 방법.
---

# Skill Creator Guide

Claude의 기능을 확장하는 모듈식 패키지(스킬)를 개발하는 가이드입니다.

## 스킬 구조

### 필수 파일
- **SKILL.md**: YAML 프론트매터(`name`, `description`) + 마크다운 지침

### 선택 파일
- `scripts/`: 자동화 스크립트
- `references/`: 참조 문서
- `assets/`: 리소스 파일

```
my-skill/
├── SKILL.md           # 필수: 메인 진입점
├── scripts/
│   └── run.js         # 선택: 실행 스크립트
├── references/
│   └── api-docs.md    # 선택: 상세 문서
└── assets/
    └── template.json  # 선택: 템플릿
```

## 설계 원칙

### 1. 간결성 우선

> "컨텍스트 윈도우는 공공재입니다."

Claude가 정말 필요한 정보만 포함하세요. 각 요소의 토큰 비용을 고려하세요.

### 2. 특수성과 유연성 균형

| 상황 | 접근 방식 |
|------|-----------|
| 유연한 작업 | 텍스트 지침 (높은 자유도) |
| 오류 민감 작업 | 스크립트 (낮은 자유도, 일관성) |

### 3. 점진적 공개 (Progressive Disclosure)

| 레벨 | 로딩 시점 | 크기 |
|------|-----------|------|
| 메타데이터 | 항상 | ~100 단어 |
| SKILL.md 본문 | 트리거 시 | <5,000 단어 |
| 참조 문서 | 필요 시 | 가변 |

## 구현 단계

### 1. 이해 (Understand)
구체적인 사용 예시로 요구사항 파악

### 2. 계획 (Plan)
재사용 가능한 컨텐츠 식별:
- 스크립트: 자동화 필요 작업
- 참조: 도메인별 문서
- 에셋: 템플릿, 설정

### 3. 초기화 (Initialize)
```bash
# 템플릿 사용
python init_skill.py --name my-skill
```

### 4. 편집 (Edit)
검증된 패턴으로 스킬 작성

### 5. 패키징 (Package)
```bash
python package_skill.py --skill my-skill
```

### 6. 반복 (Iterate)
실제 사용 기반 개선

## 작성 가이드라인

### SKILL.md 프론트매터
```yaml
---
name: my-skill
description: 이 스킬이 무엇을 하는지 포괄적으로 설명. 트리거 조건 결정에 사용됨.
---
```

### 본문 작성
- **500줄 미만** 유지
- 필요 시 참조 문서로 분리
- **명령형 언어** 사용
- 필수 파일만 포함

## 프로젝트 적용

### 차트 에디터 전용 스킬 예시

```yaml
---
name: chart-editor
description: Recharts와 react-grid-layout을 활용한 차트 에디터 개발. 드래그앤드롭 레이아웃, 동적 데이터 바인딩 지원.
---
```

```markdown
# Chart Editor Skill

## 컴포넌트 생성
- BarChart, LineChart, PieChart 컴포넌트
- ResponsiveContainer 필수 사용

## 레이아웃 에디터
- react-grid-layout 드래그앤드롭
- 레이아웃 상태 JSON 저장

## 데이터 바인딩
- X/Y축 컬럼 매핑
- dataSource 테이블 선택
```
