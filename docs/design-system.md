# Design System

## 디자인 목표

- 기능 위주의 밋밋함을 줄이고, 작가용 B2B 생산성 SaaS 밀도를 확보
- 정보 계층(중요도/행동 우선순위)을 시각적으로 명확화
- 게임 UI 느낌 배제, 과장된 장식 배제

## Typography Scale

- Page title: `text-3xl font-semibold`
- Section heading: `text-xl font-medium`
- Card title: `text-sm font-semibold`
- Body: `text-sm leading-6`
- Meta: `text-xs leading-5`

## Spacing Scale

- 페이지 기본 간격: `space-y-5` ~ `space-y-6`
- 카드 패딩: `p-5`
- 컴포넌트 간격: `gap-4` ~ `gap-6`

## Card Hierarchy

- `card-strong`: 상태 바/핵심 행동(체크포인트 저장 등)
- `card-shell`: 일반 정보 카드
- empty는 `border-dashed` + 설명 텍스트로 행동 유도

## Badge & Status Colors

- danger: red (risk/collapse)
- warning: amber (important shift/limit)
- stable: slate
- positive: emerald
- checkpoint/branch: indigo

## Button Priority

- Primary: `btn-primary` (핵심 행동: 후보 불러오기, 저장)
- Secondary: `btn-secondary` (보조 탐색/복원)
- Branch 특화: indigo 톤 버튼

## 상태 UX

- loading: skeleton을 블록 단위로 확장
- error: alert + retry
- empty: 명시적 next action 포함

## 접근성

- aria-label 유지
- focus ring 유지
- 대비가 낮은 텍스트 최소화
