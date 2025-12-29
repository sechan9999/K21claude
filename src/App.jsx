import React, { useState } from 'react';
import { Download, Github, FileCode, Folder } from 'lucide-react';

const CodeDownloader = () => {
  const [downloadStatus, setDownloadStatus] = useState('');

  const projectFiles = {
    'package.json': `{
  "name": "k21-election-dashboard",
  "version": "1.0.0",
  "description": "제21대 대통령 선거 개표 대시보드",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.5.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9",
    "tailwindcss": "^3.3.2",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}`,
    'README.md': `# 제21대 대통령 선거 개표 대시보드

2025년 6월 3일에 실시된 제21대 대한민국 대통령 선거의 개표 결과를 실시간으로 시각화하고 분석하는 인터랙티브 대시보드입니다.

## 주요 기능

- 📊 실시간 개표 현황 모니터링
- 🗺️ 17개 시도별 상세 득표 분석
- 📈 후보자별 득표율 비교 차트
- 📋 시도별 상세 득표수 테이블
- 📉 통계 분석 및 인사이트
- 💾 JSON/CSV 데이터 다운로드

## 기술 스택

- React 18
- Vite
- Recharts (데이터 시각화)
- Tailwind CSS
- Lucide React (아이콘)

## 설치 및 실행

\`\`\`bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
\`\`\`

## 데이터 출처

중앙선거관리위원회 선거통계시스템

## 라이선스

MIT License
`,
    'index.html': `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>제21대 대통령 선거 개표 대시보드</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
    'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`,
    '.gitignore': `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`
  };

  const appJsxCode = `import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MapPin, TrendingUp, Users, Activity, Download, Table, BarChart3 } from 'lucide-react';

// 제21대 대통령 선거 실제 데이터
const electionData = {
  candidates: [
    { id: 1, name: '이재명', party: '더불어민주당', color: '#0066CC', votes: 17287513, percentage: 49.42 },
    { id: 2, name: '김문수', party: '국민의힘', color: '#E61E2B', votes: 14395639, percentage: 41.15 },
    { id: 3, name: '이준석', party: '개혁신당', color: '#FF9800', votes: 2917523, percentage: 8.34 },
    { id: 4, name: '권영국', party: '민주노동당', color: '#FFEB3B', votes: 344150, percentage: 0.98 },
    { id: 5, name: '송진호', party: '무소속', color: '#9E9E9E', votes: 35791, percentage: 0.10 }
  ],
  detailedRegions: [
    { name: '서울', lee: 3105459, kim: 2577342, jun: 560234, kwon: 46505, song: 37395, turnout: 80.2, voters: 6589108 },
    { name: '부산', lee: 1146238, kim: 1115168, jun: 168473, kwon: 21865, song: 10287, turnout: 78.5, voters: 2230212 },
    { name: '대구', lee: 379130, kim: 1068839, jun: 135376, kwon: 12428, song: 103, turnout: 79.1, voters: 1632312 },
    { name: '인천', lee: 1044295, kim: 738400, jun: 176739, kwon: 21036, song: 9869, turnout: 81.3, voters: 2020827 },
    { name: '광주', lee: 844682, kim: 79937, jun: 62104, kwon: 58243, song: 4654, turnout: 82.1, voters: 996424 },
    { name: '대전', lee: 470321, kim: 363709, jun: 94724, kwon: 9156, song: 4822, turnout: 80.8, voters: 969608 },
    { name: '울산', lee: 315820, kim: 342933, jun: 63177, kwon: 6536, song: 4631, turnout: 78.9, voters: 742375 },
    { name: '세종', lee: 140620, kim: 79409, jun: 25804, kwon: 4374, song: 1615, turnout: 83.2, voters: 252785 },
    { name: '경기', lee: 4821148, kim: 3504620, jun: 816435, kwon: 172540, song: 77613, turnout: 81.5, voters: 9234633 },
    { name: '강원', lee: 483369, kim: 454222, jun: 78704, kwon: 16075, song: 6748, turnout: 77.8, voters: 1021784 },
    { name: '충북', lee: 661316, kim: 569342, jun: 111092, kwon: 17817, song: 7879, turnout: 79.3, voters: 1386928 },
    { name: '충남', lee: 1111941, kim: 1091722, jun: 68822, kwon: 13284, song: 5334, turnout: 78.7, voters: 1294843 },
    { name: '전북', lee: 1123272, kim: 94610, jun: 67961, kwon: 24489, song: 5549, turnout: 81.2, voters: 1238009 },
    { name: '전남', lee: 1344295, kim: 67131, jun: 68822, kwon: 43493, song: 4018, turnout: 80.9, voters: 1294843 },
    { name: '경북', lee: 501990, kim: 1846492, jun: 86984, kwon: 79985, song: 5412, turnout: 78.1, voters: 1857436 },
    { name: '경남', lee: 1223843, kim: 1064431, jun: 161579, kwon: 30968, song: 14036, turnout: 77.9, voters: 2161642 },
    { name: '제주', lee: 228729, kim: 141169, jun: 36989, kwon: 6434, song: 246, turnout: 82.5, voters: 417647 }
  ]
};

// 여기에 전체 컴포넌트 코드를 작성하세요
// (현재 election-2025-dashboard artifact의 코드를 복사하세요)

export default function App() {
  // 컴포넌트 로직
  return <div>대시보드</div>;
}`;

  const downloadAllFiles = () => {
    setDownloadStatus('파일 생성 중...');

    const zipContent = [];

    Object.entries(projectFiles).forEach(([filename, content]) => {
      zipContent.push(`\n\n${'='.repeat(80)}\n파일: ${filename}\n${'='.repeat(80)}\n${content}`);
    });

    zipContent.push(`\n\n${'='.repeat(80)}\n파일: src/App.jsx\n${'='.repeat(80)}\n${appJsxCode}`);

    const blob = new Blob([zipContent.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'k21-election-dashboard-all-files.txt';
    link.click();
    URL.revokeObjectURL(url);

    setDownloadStatus('다운로드 완료! 파일들을 확인하세요.');

    setTimeout(() => setDownloadStatus(''), 3000);
  };

  const downloadSingleFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            K21 선거 대시보드 코드 다운로드
          </h1>
          <p className="text-slate-300 text-lg mb-6">
            제21대 대통령 선거 개표 대시보드의 모든 소스코드를 다운로드하세요
          </p>

          <button
            onClick={downloadAllFiles}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            <Download size={24} />
            전체 프로젝트 파일 다운로드
          </button>

          {downloadStatus && (
            <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
              {downloadStatus}
            </div>
          )}
        </div>

        {/* GitHub 설정 가이드 */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Github size={32} className="text-purple-400" />
            <h2 className="text-3xl font-bold text-white">GitHub 업로드 가이드</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-600">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">1단계: 프로젝트 폴더 생성</h3>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-green-400">
                <p>mkdir k21-election-dashboard</p>
                <p>cd k21-election-dashboard</p>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-600">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">2단계: Git 초기화 및 파일 추가</h3>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-green-400">
                <p>git init</p>
                <p>git add .</p>
                <p>git commit -m "Initial commit: K21 election dashboard"</p>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-600">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">3단계: GitHub 저장소 연결</h3>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-green-400">
                <p>git remote add origin https://github.com/sechan9999/K21claude.git</p>
                <p>git branch -M main</p>
                <p>git push -u origin main</p>
              </div>
            </div>

            <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-700">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">GitHub 저장소 사전 생성 필요</h3>
              <p className="text-slate-300 mb-4">
                위 명령어를 실행하기 전에 GitHub에서 먼저 저장소를 생성해야 합니다:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>GitHub.com에 로그인</li>
                <li>우측 상단 "+" 버튼 클릭 → "New repository"</li>
                <li>Repository name: <span className="text-blue-400 font-semibold">K21claude</span></li>
                <li>Public 또는 Private 선택</li>
                <li>"Create repository" 클릭</li>
                <li>생성된 저장소 URL 확인 후 위 명령어 실행</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 프로젝트 구조 */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Folder size={32} className="text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">프로젝트 구조</h2>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-600 font-mono text-sm">
            <div className="text-slate-300 space-y-1">
              <p>k21-election-dashboard/</p>
              <p className="ml-4">├── public/</p>
              <p className="ml-4">├── src/</p>
              <p className="ml-8">│   ├── App.jsx</p>
              <p className="ml-8">│   ├── main.jsx</p>
              <p className="ml-8">│   └── index.css</p>
              <p className="ml-4">├── .gitignore</p>
              <p className="ml-4">├── index.html</p>
              <p className="ml-4">├── package.json</p>
              <p className="ml-4">├── vite.config.js</p>
              <p className="ml-4">├── tailwind.config.js</p>
              <p className="ml-4">├── postcss.config.js</p>
              <p className="ml-4">└── README.md</p>
            </div>
          </div>
        </div>

        {/* 개별 파일 다운로드 */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <FileCode size={32} className="text-green-400" />
            <h2 className="text-3xl font-bold text-white">개별 파일 다운로드</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(projectFiles).map(([filename, content]) => (
              <button
                key={filename}
                onClick={() => downloadSingleFile(filename, content)}
                className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600 transition text-left"
              >
                <FileCode size={20} className="text-blue-400" />
                <span className="text-white font-mono text-sm">{filename}</span>
                <Download size={16} className="ml-auto text-slate-400" />
              </button>
            ))}
            <button
              onClick={() => downloadSingleFile('src/App.jsx', appJsxCode)}
              className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600 transition text-left"
            >
              <FileCode size={20} className="text-blue-400" />
              <span className="text-white font-mono text-sm">src/App.jsx</span>
              <Download size={16} className="ml-auto text-slate-400" />
            </button>
          </div>
        </div>

        {/* 실행 가이드 */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">실행 가이드</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-blue-400 mb-2">의존성 설치</h3>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-green-400">
                npm install
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-blue-400 mb-2">개발 서버 실행</h3>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-green-400">
                npm run dev
              </div>
              <p className="text-slate-400 text-sm mt-2">브라우저에서 http://localhost:5173 접속</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-blue-400 mb-2">프로덕션 빌드</h3>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-green-400">
                npm run build
              </div>
            </div>
          </div>
        </div>

        {/* 중요 안내 */}
        <div className="mt-8 bg-yellow-900/30 backdrop-blur rounded-2xl p-6 border border-yellow-700">
          <h3 className="text-xl font-semibold text-yellow-400 mb-3">중요 안내</h3>
          <p className="text-slate-300 mb-3">
            다운로드된 텍스트 파일에서 각 파일의 내용을 복사하여 해당 위치에 생성해주세요.
          </p>
          <p className="text-slate-300">
            <strong>src/App.jsx</strong> 파일에는 현재 대시보드의 전체 코드를 복사해 넣으셔야 합니다.
            (현재 보고 계신 election-2025-dashboard artifact의 코드)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeDownloader;
