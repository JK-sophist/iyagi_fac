# Evaluation

평가 항목:
- character consistency score
- relationship drift score
- decision clarity score
- repetition score
- checkpoint integrity score
- branch divergence clarity

계산 방식(데모):
- consistency/repetition risk를 0~1로 보고 역변환하여 0~100 점수 산출
- 관계 drift는 tension 평균값 기반 감점
- stop reason이 `user_decision_required`이면 decision clarity 가산
- restore/branch 성공 여부로 integrity/divergence 점수 결정
