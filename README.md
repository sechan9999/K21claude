# 제21대 대통령 선거 개표 대시보드

2025년 6월 3일에 실시된 제21대 대한민국 대통령 선거의 개표 결과를 실시간으로 시각화하고 분석하는 인터랙티브 대시보드입니다.

## 주요 기능

- 실시간 개표 현황 모니터링
- 17개 시도별 상세 득표 분석
- 후보자별 득표율 비교 차트
- 시도별 상세 득표수 테이블
- 통계 분석 및 인사이트
- JSON/CSV 데이터 다운로드

## 기술 스택

- React 18
- Vite
- Recharts (데이터 시각화)
- Tailwind CSS
- Lucide React (아이콘)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
k21-election-dashboard/
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 데이터 출처

중앙선거관리위원회 선거통계시스템

## 라이선스

MIT License
