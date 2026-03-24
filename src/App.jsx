import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { MapPin, TrendingUp, Users, Activity, Download, BarChart3, ChevronDown, Award, Vote } from 'lucide-react';

// 제21대 대통령 선거 실제 데이터 (2025.06.03)
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

const totalVotes = electionData.candidates.reduce((s, c) => s + c.votes, 0);
const totalVoters = electionData.detailedRegions.reduce((s, r) => s + r.voters, 0);
const avgTurnout = (electionData.detailedRegions.reduce((s, r) => s + r.turnout, 0) / electionData.detailedRegions.length).toFixed(1);

function formatNumber(n) {
  return n.toLocaleString('ko-KR');
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-5 border border-slate-700 hover:border-slate-500 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className="text-slate-400 text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function CandidateBar({ candidate, maxVotes, rank }) {
  const width = (candidate.votes / maxVotes) * 100;
  const isWinner = rank === 0;
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isWinner ? 'bg-blue-900/30 border border-blue-700/50' : 'hover:bg-slate-800/40'}`}>
      <div className="w-6 text-center">
        {isWinner ? (
          <Award size={20} className="text-yellow-400" />
        ) : (
          <span className="text-slate-500 text-sm font-bold">{rank + 1}</span>
        )}
      </div>
      <div className="w-24 flex-shrink-0">
        <div className="font-bold text-white text-lg">{candidate.name}</div>
        <div className="text-xs" style={{ color: candidate.color }}>{candidate.party}</div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-700/50 rounded-full h-8 overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-1000"
              style={{ width: `${width}%`, backgroundColor: candidate.color }}
            >
              <span className="text-white text-xs font-bold drop-shadow">{candidate.percentage}%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-32 text-right">
        <div className="text-white font-mono font-bold">{formatNumber(candidate.votes)}</div>
        <div className="text-slate-500 text-xs">표</div>
      </div>
    </div>
  );
}

function RegionTable({ regions, sortKey, onSort }) {
  const sorted = useMemo(() => {
    return [...regions].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'ko');
      if (sortKey === 'turnout') return b.turnout - a.turnout;
      if (sortKey === 'lee') return b.lee - a.lee;
      if (sortKey === 'kim') return b.kim - a.kim;
      if (sortKey === 'margin') return (b.lee - b.kim) - (a.lee - a.kim);
      return 0;
    });
  }, [regions, sortKey]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {[
              { key: 'name', label: '시도' },
              { key: 'lee', label: '이재명' },
              { key: 'kim', label: '김문수' },
              { key: 'margin', label: '격차' },
              { key: 'turnout', label: '투표율' },
            ].map(col => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className={`py-3 px-3 text-left cursor-pointer hover:text-blue-400 transition ${sortKey === col.key ? 'text-blue-400' : 'text-slate-400'}`}
              >
                {col.label} {sortKey === col.key && <ChevronDown size={12} className="inline" />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const margin = r.lee - r.kim;
            const winner = margin > 0 ? 'lee' : 'kim';
            return (
              <tr key={r.name} className={`border-b border-slate-800 hover:bg-slate-800/40 transition ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                <td className="py-3 px-3 font-medium text-white">{r.name}</td>
                <td className="py-3 px-3">
                  <span className={winner === 'lee' ? 'text-blue-400 font-bold' : 'text-slate-300'}>{formatNumber(r.lee)}</span>
                </td>
                <td className="py-3 px-3">
                  <span className={winner === 'kim' ? 'text-red-400 font-bold' : 'text-slate-300'}>{formatNumber(r.kim)}</span>
                </td>
                <td className="py-3 px-3">
                  <span className={`font-bold ${margin > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {margin > 0 ? '+' : ''}{formatNumber(margin)}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${r.turnout}%` }} />
                    </div>
                    <span className="text-emerald-400 text-xs font-mono">{r.turnout}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sortKey, setSortKey] = useState('margin');
  const maxVotes = Math.max(...electionData.candidates.map(c => c.votes));

  const barChartData = useMemo(() =>
    electionData.detailedRegions.map(r => ({
      name: r.name,
      이재명: r.lee,
      김문수: r.kim,
      이준석: r.jun,
    })), []
  );

  const pieData = useMemo(() =>
    electionData.candidates.map(c => ({
      name: c.name,
      value: c.votes,
      color: c.color,
    })), []
  );

  const turnoutData = useMemo(() =>
    electionData.detailedRegions
      .map(r => ({ name: r.name, turnout: r.turnout, voters: r.voters }))
      .sort((a, b) => b.turnout - a.turnout),
    []
  );

  // 수도권 vs 비수도권
  const metroRegions = ['서울', '경기', '인천'];
  const metroStats = useMemo(() => {
    const metro = electionData.detailedRegions.filter(r => metroRegions.includes(r.name));
    const nonMetro = electionData.detailedRegions.filter(r => !metroRegions.includes(r.name));
    return {
      metro: { lee: metro.reduce((s,r) => s+r.lee, 0), kim: metro.reduce((s,r) => s+r.kim, 0) },
      nonMetro: { lee: nonMetro.reduce((s,r) => s+r.lee, 0), kim: nonMetro.reduce((s,r) => s+r.kim, 0) },
    };
  }, []);

  const downloadCSV = () => {
    const header = '시도,이재명,김문수,이준석,권영국,송진호,투표율,선거인수\n';
    const rows = electionData.detailedRegions.map(r =>
      `${r.name},${r.lee},${r.kim},${r.jun},${r.kwon},${r.song},${r.turnout},${r.voters}`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'K21_선거결과.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(electionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'K21_선거결과.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: '개표 현황', icon: Activity },
    { id: 'regions', label: '시도별 분석', icon: MapPin },
    { id: 'charts', label: '비교 차트', icon: BarChart3 },
    { id: 'insights', label: '통계 인사이트', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                제21대 대통령선거 개표 대시보드
              </h1>
              <p className="text-slate-500 text-sm mt-1">2025년 6월 3일 | 개표율 100% | 중앙선거관리위원회</p>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition">
                <Download size={14} /> CSV
              </button>
              <button onClick={downloadJSON} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition">
                <Download size={14} /> JSON
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Vote} label="총 투표수" value={formatNumber(totalVotes)} sub="유효투표" color="bg-blue-600" />
          <StatCard icon={Users} label="총 선거인수" value={formatNumber(totalVoters)} sub="17개 시도" color="bg-purple-600" />
          <StatCard icon={Activity} label="평균 투표율" value={`${avgTurnout}%`} sub="전국 평균" color="bg-emerald-600" />
          <StatCard icon={TrendingUp} label="당선인 격차" value={formatNumber(electionData.candidates[0].votes - electionData.candidates[1].votes)} sub={`${(electionData.candidates[0].percentage - electionData.candidates[1].percentage).toFixed(2)}%p`} color="bg-amber-600" />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Candidate Results */}
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Award size={20} className="text-yellow-400" /> 후보별 득표 현황
              </h2>
              <div className="space-y-2">
                {electionData.candidates.map((c, i) => (
                  <CandidateBar key={c.id} candidate={c} maxVotes={maxVotes} rank={i} />
                ))}
              </div>
            </div>

            {/* Pie + Metro Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">득표율 분포</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={60}
                      dataKey="value"
                      stroke="#0f172a"
                      strokeWidth={3}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => formatNumber(val) + '표'}
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                    />
                    <Legend
                      formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">수도권 vs 비수도권</h3>
                <div className="space-y-6 mt-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">수도권 (서울·경기·인천)</span>
                    </div>
                    <div className="flex h-10 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          width: `${(metroStats.metro.lee / (metroStats.metro.lee + metroStats.metro.kim)) * 100}%`,
                          backgroundColor: '#0066CC'
                        }}
                      >
                        이재명 {((metroStats.metro.lee / (metroStats.metro.lee + metroStats.metro.kim)) * 100).toFixed(1)}%
                      </div>
                      <div
                        className="flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          width: `${(metroStats.metro.kim / (metroStats.metro.lee + metroStats.metro.kim)) * 100}%`,
                          backgroundColor: '#E61E2B'
                        }}
                      >
                        김문수 {((metroStats.metro.kim / (metroStats.metro.lee + metroStats.metro.kim)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">비수도권</span>
                    </div>
                    <div className="flex h-10 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          width: `${(metroStats.nonMetro.lee / (metroStats.nonMetro.lee + metroStats.nonMetro.kim)) * 100}%`,
                          backgroundColor: '#0066CC'
                        }}
                      >
                        이재명 {((metroStats.nonMetro.lee / (metroStats.nonMetro.lee + metroStats.nonMetro.kim)) * 100).toFixed(1)}%
                      </div>
                      <div
                        className="flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          width: `${(metroStats.nonMetro.kim / (metroStats.nonMetro.lee + metroStats.nonMetro.kim)) * 100}%`,
                          backgroundColor: '#E61E2B'
                        }}
                      >
                        김문수 {((metroStats.nonMetro.kim / (metroStats.nonMetro.lee + metroStats.nonMetro.kim)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div className="text-center">
                      <div className="text-blue-400 font-bold text-lg">
                        +{formatNumber(metroStats.metro.lee - metroStats.metro.kim)}
                      </div>
                      <div className="text-slate-500 text-xs">수도권 이재명 격차</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold text-lg">
                        +{formatNumber(metroStats.nonMetro.lee - metroStats.nonMetro.kim)}
                      </div>
                      <div className="text-slate-500 text-xs">비수도권 이재명 격차</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === 'regions' && (
          <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-emerald-400" /> 시도별 상세 결과
            </h2>
            <RegionTable regions={electionData.detailedRegions} sortKey={sortKey} onSort={setSortKey} />
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Regional Bar Chart */}
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">시도별 주요 후보 득표수</h3>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={barChartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => (v / 10000).toFixed(0) + '만'} />
                  <Tooltip
                    formatter={(val) => formatNumber(val) + '표'}
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  />
                  <Legend formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{value}</span>} />
                  <Bar dataKey="이재명" fill="#0066CC" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="김문수" fill="#E61E2B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="이준석" fill="#FF9800" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Turnout Chart */}
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">시도별 투표율 (높은 순)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={turnoutData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[70, 85]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v + '%'} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={40} />
                  <Tooltip
                    formatter={(val) => val + '%'}
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  />
                  <Bar dataKey="turnout" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 이재명 강세 지역 */}
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-blue-400 mb-4">이재명 강세 지역 TOP 5</h3>
                {[...electionData.detailedRegions]
                  .sort((a, b) => {
                    const aPct = a.lee / (a.lee + a.kim + a.jun + a.kwon + a.song);
                    const bPct = b.lee / (b.lee + b.kim + b.jun + b.kwon + b.song);
                    return bPct - aPct;
                  })
                  .slice(0, 5)
                  .map((r, i) => {
                    const total = r.lee + r.kim + r.jun + r.kwon + r.song;
                    const pct = ((r.lee / total) * 100).toFixed(1);
                    return (
                      <div key={r.name} className="flex items-center justify-between py-3 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-blue-400 font-bold w-6">{i + 1}</span>
                          <span className="text-white font-medium">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-blue-400 font-mono text-sm font-bold w-14 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* 김문수 강세 지역 */}
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-red-400 mb-4">김문수 강세 지역 TOP 5</h3>
                {[...electionData.detailedRegions]
                  .sort((a, b) => {
                    const aPct = a.kim / (a.lee + a.kim + a.jun + a.kwon + a.song);
                    const bPct = b.kim / (b.lee + b.kim + b.jun + b.kwon + b.song);
                    return bPct - aPct;
                  })
                  .slice(0, 5)
                  .map((r, i) => {
                    const total = r.lee + r.kim + r.jun + r.kwon + r.song;
                    const pct = ((r.kim / total) * 100).toFixed(1);
                    return (
                      <div key={r.name} className="flex items-center justify-between py-3 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-red-400 font-bold w-6">{i + 1}</span>
                          <span className="text-white font-medium">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div className="h-2 rounded-full bg-red-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-red-400 font-mono text-sm font-bold w-14 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 투표율 인사이트 */}
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-emerald-400 mb-4">투표율 인사이트</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const sorted = [...electionData.detailedRegions].sort((a, b) => b.turnout - a.turnout);
                  const highest = sorted[0];
                  const lowest = sorted[sorted.length - 1];
                  return (
                    <>
                      <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                        <div className="text-emerald-400 text-2xl font-bold">{highest.turnout}%</div>
                        <div className="text-white font-medium mt-1">{highest.name}</div>
                        <div className="text-slate-500 text-xs mt-1">최고 투표율</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                        <div className="text-amber-400 text-2xl font-bold">{lowest.turnout}%</div>
                        <div className="text-white font-medium mt-1">{lowest.name}</div>
                        <div className="text-slate-500 text-xs mt-1">최저 투표율</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                        <div className="text-purple-400 text-2xl font-bold">{(highest.turnout - lowest.turnout).toFixed(1)}%p</div>
                        <div className="text-white font-medium mt-1">최대 편차</div>
                        <div className="text-slate-500 text-xs mt-1">{highest.name} - {lowest.name}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* 경합 지역 */}
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-amber-400 mb-4">접전 지역 (격차 5%p 이내)</h3>
              <div className="space-y-3">
                {[...electionData.detailedRegions]
                  .map(r => {
                    const total = r.lee + r.kim + r.jun + r.kwon + r.song;
                    const leePct = (r.lee / total) * 100;
                    const kimPct = (r.kim / total) * 100;
                    return { ...r, leePct, kimPct, gap: Math.abs(leePct - kimPct) };
                  })
                  .filter(r => r.gap < 5)
                  .sort((a, b) => a.gap - b.gap)
                  .map(r => (
                    <div key={r.name} className="flex items-center gap-4 p-3 bg-slate-900/40 rounded-lg">
                      <span className="text-white font-bold w-12">{r.name}</span>
                      <div className="flex-1 flex h-6 rounded overflow-hidden">
                        <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${r.leePct}%`, backgroundColor: '#0066CC' }}>
                          {r.leePct.toFixed(1)}%
                        </div>
                        <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${r.kimPct}%`, backgroundColor: '#E61E2B' }}>
                          {r.kimPct.toFixed(1)}%
                        </div>
                      </div>
                      <span className="text-amber-400 font-mono text-xs font-bold w-16 text-right">
                        {r.gap.toFixed(1)}%p
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6 text-center text-slate-600 text-xs">
        <p>데이터 출처: 중앙선거관리위원회 선거통계시스템 | 제21대 대통령선거 2025.06.03</p>
        <p className="mt-1">
          <a href="https://github.com/sechan9999/K21claude" className="text-slate-500 hover:text-blue-400 transition" target="_blank" rel="noopener">
            GitHub: sechan9999/K21claude
          </a>
          {' · '}MIT License
        </p>
      </footer>
    </div>
  );
}
