# Phase 1: 기반 구축 - Todo 계획

## 1. 프로젝트 초기 설정

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 1 | Docker 환경 구성 | `docker-compose.yml`, Dockerfile 작성 (Nginx, Django, MySQL, React) | ✅ |

---

## 2. Backend (Django + DRF)

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 2 | Django 프로젝트 생성 | DRF 설정, CORS 설정, 기본 구조 | ⬜ |
| 3 | DB 모델 생성 | `report_templates`, `data_sources`, `generated_reports` 테이블 | ⬜ |
| 4 | REST API 구현 | `/api/data/`, `/api/templates/` 엔드포인트 | ⬜ |

---

## 3. Frontend (React + TypeScript + Vite)

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 5 | React 프로젝트 생성 | Vite + TypeScript 기반 | ⬜ |
| 6 | 라우트 구현 | React Router로 `/report/:date` 경로 설정 | ⬜ |

---

## 4. Recharts 차트 구현

| No | 작업 | 기능 | 상태 |
|----|------|------|------|
| 7 | **Bar 차트** | Tooltip, Data Label, Threshold/Target Line | ⬜ |
| 8 | **Line 차트** | Tooltip, Data Label, Threshold/Target Line | ⬜ |
| 9 | **Pie 차트** | Tooltip, Data Label | ⬜ |
| 10 | **Combination 차트** | Bar+Line 결합, Dual Y-Axis (좌: Bar, 우: Line), Tooltip, Data Label, Threshold/Target Line | ⬜ |
| 11 | ReportPage 완성 | 하드코딩된 샘플 데이터로 차트들 배치 | ⬜ |

### 차트 공통 기능 명세

| 기능 | Bar | Line | Pie | Combination |
|------|:---:|:----:|:---:|:-----------:|
| Tooltip (호버) | ✓ | ✓ | ✓ | ✓ |
| Data Label | ✓ | ✓ | ✓ | ✓ |
| Threshold/Target Line | ✓ | ✓ | - | ✓ |
| Dual Y-Axis | - | - | - | ✓ (좌:Bar, 우:Line) |

---

## 5. 데이터 연동 및 테스트

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 12 | API 연동 | Frontend에서 Django API 호출 및 차트 데이터 바인딩 | ⬜ |
| 13 | Nginx 설정 | 프록시 설정 및 Docker 통합 테스트 | ⬜ |
| 14 | iframe 테스트 | 테스트용 HTML 페이지에서 iframe 삽입 확인 | ⬜ |

---

## 상태 범례

- ⬜ 대기
- 🔄 진행 중
- ✅ 완료
