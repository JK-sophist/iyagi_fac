# apps/frontend

Next.js(App Router) 기반 데스크톱 우선 프론트엔드입니다.

## 실행

```bash
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api npm run dev
```

## 구현 화면

- 랜딩
- 프로젝트 목록/생성/상세
- 캐릭터 편집
- 관계도 편집
- 세션 시작/진행
- 장면 상세
- 체크포인트/분기

## 특징

- 실 API 호출 기반 (mock fallback 없음)
- 후보 제안과 선택 실행 분리
- 상태 변화 우선 패널
- 다크 테마 대시보드 스타일
