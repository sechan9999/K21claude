import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter, ReferenceLine } from 'recharts';
import { MapPin, TrendingUp, Users, Activity, Download, BarChart3, ChevronDown, Award, Vote, Building2, AlertTriangle } from 'lucide-react';
import rawData from './data.json';

// 공식 데이터 (중앙선거관리위원회)
const COLORS = {
  '더불어민주당': '#0066CC',
  '국민의힘': '#E61E2B',
  '개혁신당': '#FF9800',
  '민주노동당': '#FFEB3B',
  '무소속': '#9E9E9E',
};

const electionData = {
  candidates: rawData.candidates.map(c => ({ ...c, color: COLORS[c.party] })),
  regions: rawData.regions,
  national: rawData.national,
  seoul: rawData.seoul,
};

function fmt(n) { return n.toLocaleString('ko-KR'); }

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-5 border border-slate-700 hover:border-slate-500 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}><Icon size={18} className="text-white" /></div>
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
        {isWinner ? <Award size={20} className="text-yellow-400" /> : <span className="text-slate-500 text-sm font-bold">{rank + 1}</span>}
      </div>
      <div className="w-24 flex-shrink-0">
        <div className="font-bold text-white text-lg">{candidate.name}</div>
        <div className="text-xs" style={{ color: candidate.color }}>{candidate.party}</div>
      </div>
      <div className="flex-1">
        <div className="flex-1 bg-slate-700/50 rounded-full h-8 overflow-hidden">
          <div className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-1000"
            style={{ width: `${width}%`, backgroundColor: candidate.color }}>
            <span className="text-white text-xs font-bold drop-shadow">{candidate.percentage}%</span>
          </div>
        </div>
      </div>
      <div className="w-32 text-right">
        <div className="text-white font-mono font-bold">{fmt(candidate.votes)}</div>
        <div className="text-slate-500 text-xs">표</div>
      </div>
    </div>
  );
}

function SortableTable({ data, columns, defaultSort }) {
  const [sortKey, setSortKey] = useState(defaultSort);
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const col = columns.find(c => c.key === sortKey);
      if (!col) return 0;
      return col.sort(a, b);
    });
  }, [data, sortKey, columns]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map(col => (
              <th key={col.key} onClick={() => setSortKey(col.key)}
                className={`py-3 px-3 text-left cursor-pointer hover:text-blue-400 transition ${sortKey === col.key ? 'text-blue-400' : 'text-slate-400'}`}>
                {col.label} {sortKey === col.key && <ChevronDown size={12} className="inline" />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className={`border-b border-slate-800 hover:bg-slate-800/40 transition ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
              {columns.map(col => (
                <td key={col.key} className="py-3 px-3">{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const maxVotes = Math.max(...electionData.candidates.map(c => c.votes));
  const nat = electionData.national;
  const marginVotes = electionData.candidates[0].votes - electionData.candidates[1].votes;
  const marginPct = (electionData.candidates[0].percentage - electionData.candidates[1].percentage).toFixed(2);

  const barChartData = useMemo(() =>
    electionData.regions.map(r => ({ name: r.name, 이재명: r.lee, 김문수: r.kim, 이준석: r.jun })), []);

  const pieData = useMemo(() =>
    electionData.candidates.map(c => ({ name: c.name, value: c.votes, color: c.color })), []);

  const turnoutData = useMemo(() =>
    [...electionData.regions].sort((a, b) => b.turnout - a.turnout).map(r => ({ name: r.name, turnout: r.turnout })), []);

  // Metro analysis
  const metroNames = ['서울', '경기', '인천'];
  const metro = useMemo(() => {
    const m = electionData.regions.filter(r => metroNames.includes(r.name));
    const nm = electionData.regions.filter(r => !metroNames.includes(r.name));
    const sum = (arr, k) => arr.reduce((s, r) => s + r[k], 0);
    return {
      metro: { lee: sum(m, 'lee'), kim: sum(m, 'kim') },
      nonMetro: { lee: sum(nm, 'lee'), kim: sum(nm, 'kim') },
    };
  }, []);

  const regionColumns = [
    { key: 'name', label: '시도', sort: (a, b) => a.fullName.localeCompare(b.fullName, 'ko'), render: r => <span className="text-white font-medium">{r.name}</span> },
    { key: 'lee', label: '이재명', sort: (a, b) => b.lee - a.lee, render: r => <span className={r.lee > r.kim ? 'text-blue-400 font-bold' : 'text-slate-300'}>{fmt(r.lee)}</span> },
    { key: 'kim', label: '김문수', sort: (a, b) => b.kim - a.kim, render: r => <span className={r.kim > r.lee ? 'text-red-400 font-bold' : 'text-slate-300'}>{fmt(r.kim)}</span> },
    { key: 'jun', label: '이준석', sort: (a, b) => b.jun - a.jun, render: r => <span className="text-orange-300">{fmt(r.jun)}</span> },
    { key: 'margin', label: '격차', sort: (a, b) => (b.lee - b.kim) - (a.lee - a.kim), render: r => {
      const m = r.lee - r.kim;
      return <span className={`font-bold ${m > 0 ? 'text-blue-400' : 'text-red-400'}`}>{m > 0 ? '+' : ''}{fmt(m)}</span>;
    }},
    { key: 'turnout', label: '투표율', sort: (a, b) => b.turnout - a.turnout, render: r => (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-slate-700 rounded-full h-2"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${r.turnout}%` }} /></div>
        <span className="text-emerald-400 text-xs font-mono">{r.turnout}%</span>
      </div>
    )},
  ];

  const seoulColumns = [
    { key: 'name', label: '구', sort: (a, b) => a.name.localeCompare(b.name, 'ko'), render: r => <span className="text-white font-medium">{r.name}</span> },
    { key: 'lee', label: '이재명', sort: (a, b) => b.lee - a.lee, render: r => <span className={r.margin > 0 ? 'text-blue-400 font-bold' : 'text-slate-300'}>{fmt(r.lee)}</span> },
    { key: 'kim', label: '김문수', sort: (a, b) => b.kim - a.kim, render: r => <span className={r.margin < 0 ? 'text-red-400 font-bold' : 'text-slate-300'}>{fmt(r.kim)}</span> },
    { key: 'margin', label: '격차', sort: (a, b) => b.margin - a.margin, render: r => <span className={`font-bold ${r.margin > 0 ? 'text-blue-400' : 'text-red-400'}`}>{r.margin > 0 ? '+' : ''}{fmt(r.margin)}</span> },
    { key: 'pct', label: '이재명%', sort: (a, b) => (b.lee / b.total) - (a.lee / a.total), render: r => {
      const pct = ((r.lee / r.total) * 100).toFixed(1);
      return (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-700 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 50 ? '#0066CC' : '#E61E2B' }} />
          </div>
          <span className={`text-xs font-mono font-bold ${pct >= 50 ? 'text-blue-400' : 'text-red-400'}`}>{pct}%</span>
        </div>
      );
    }},
  ];

  const downloadCSV = () => {
    const header = '시도,이재명,김문수,이준석,권영국,송진호,선거인수,투표수,무효,투표율\n';
    const rows = electionData.regions.map(r =>
      `${r.fullName},${r.lee},${r.kim},${r.jun},${r.kwon},${r.song},${r.voters},${r.voted},${r.invalid},${r.turnout}`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'K21_선거결과_공식.csv'; a.click();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'K21_선거결과_공식.json'; a.click();
  };

  const tabs = [
    { id: 'overview', label: '개표 현황', icon: Activity },
    { id: 'regions', label: '시도별 분석', icon: MapPin },
    { id: 'seoul', label: '서울 25개구', icon: Building2 },
    { id: 'charts', label: '비교 차트', icon: BarChart3 },
    { id: 'insights', label: '통계 인사이트', icon: TrendingUp },
    { id: 'recheck', label: '재확인표 검증', icon: AlertTriangle },
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
              <p className="text-slate-500 text-sm mt-1">2025년 6월 3일 | 개표율 100% | 중앙선거관리위원회 공식 데이터 (169,749건)</p>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"><Download size={14} /> CSV</button>
              <button onClick={downloadJSON} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"><Download size={14} /> JSON</button>
            </div>
          </div>
          <div className="flex gap-1 mt-4 -mb-px overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Vote} label="총 투표수" value={fmt(nat.voted)} sub={`유효 ${fmt(nat.total)} / 무효 ${fmt(nat.invalid)}`} color="bg-blue-600" />
          <StatCard icon={Users} label="선거인수" value={fmt(nat.voters)} sub="17개 시도" color="bg-purple-600" />
          <StatCard icon={Activity} label="투표율" value={`${nat.turnout}%`} sub="전국" color="bg-emerald-600" />
          <StatCard icon={TrendingUp} label="당선인 격차" value={fmt(marginVotes)} sub={`${marginPct}%p`} color="bg-amber-600" />
          <StatCard icon={Building2} label="서울 이재명 우세" value="22 / 25구" sub="강남·서초·송파 외" color="bg-cyan-600" />
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Award size={20} className="text-yellow-400" /> 후보별 득표 현황</h2>
              <div className="space-y-2">
                {electionData.candidates.map((c, i) => <CandidateBar key={i} candidate={c} maxVotes={maxVotes} rank={i} />)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">득표율 분포</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} innerRadius={60} dataKey="value" stroke="#0f172a" strokeWidth={3}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={v => fmt(v) + '표'} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                    <Legend formatter={v => <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">수도권 vs 비수도권</h3>
                <div className="space-y-6 mt-4">
                  {[{ label: '수도권 (서울·경기·인천)', data: metro.metro }, { label: '비수도권', data: metro.nonMetro }].map(({ label, data }) => (
                    <div key={label}>
                      <div className="text-slate-400 text-sm mb-2">{label}</div>
                      <div className="flex h-10 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-center text-xs font-bold text-white"
                          style={{ width: `${(data.lee / (data.lee + data.kim)) * 100}%`, backgroundColor: '#0066CC' }}>
                          이재명 {((data.lee / (data.lee + data.kim)) * 100).toFixed(1)}%
                        </div>
                        <div className="flex items-center justify-center text-xs font-bold text-white"
                          style={{ width: `${(data.kim / (data.lee + data.kim)) * 100}%`, backgroundColor: '#E61E2B' }}>
                          김문수 {((data.kim / (data.lee + data.kim)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div className="text-center">
                      <div className="text-blue-400 font-bold text-lg">+{fmt(metro.metro.lee - metro.metro.kim)}</div>
                      <div className="text-slate-500 text-xs">수도권 격차</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold text-lg">+{fmt(metro.nonMetro.lee - metro.nonMetro.kim)}</div>
                      <div className="text-slate-500 text-xs">비수도권 격차</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regions */}
        {activeTab === 'regions' && (
          <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><MapPin size={20} className="text-emerald-400" /> 시도별 상세 결과 (공식 데이터)</h2>
            <SortableTable data={electionData.regions} columns={regionColumns} defaultSort="margin" />
          </div>
        )}

        {/* Seoul 25 gu */}
        {activeTab === 'seoul' && (
          <div className="space-y-6">
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Building2 size={20} className="text-cyan-400" /> 서울 25개구 상세 분석</h2>
              <SortableTable data={electionData.seoul} columns={seoulColumns} defaultSort="margin" />
            </div>

            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">서울 25개구 격차 시각화</h3>
              <ResponsiveContainer width="100%" height={600}>
                <BarChart data={[...electionData.seoul].sort((a, b) => b.margin - a.margin)} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => (v / 10000).toFixed(0) + '만'} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={55} />
                  <Tooltip formatter={v => fmt(v) + '표'} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Bar dataKey="margin" radius={[0, 4, 4, 0]}>
                    {[...electionData.seoul].sort((a, b) => b.margin - a.margin).map((entry, i) => (
                      <Cell key={i} fill={entry.margin >= 0 ? '#0066CC' : '#E61E2B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Charts */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">시도별 주요 후보 득표수</h3>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={barChartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => (v / 10000).toFixed(0) + '만'} />
                  <Tooltip formatter={v => fmt(v) + '표'} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Legend formatter={v => <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{v}</span>} />
                  <Bar dataKey="이재명" fill="#0066CC" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="김문수" fill="#E61E2B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="이준석" fill="#FF9800" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">시도별 투표율 (높은 순)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={turnoutData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[70, 85]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v + '%'} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={45} />
                  <Tooltip formatter={v => v + '%'} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Bar dataKey="turnout" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Insights */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lee strongholds */}
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-blue-400 mb-4">이재명 강세 지역 TOP 5</h3>
                {[...electionData.regions].sort((a, b) => {
                  const at = a.lee + a.kim + a.jun + a.kwon + a.song;
                  const bt = b.lee + b.kim + b.jun + b.kwon + b.song;
                  return (b.lee / bt) - (a.lee / at);
                }).slice(0, 5).map((r, i) => {
                  const t = r.lee + r.kim + r.jun + r.kwon + r.song;
                  const pct = ((r.lee / t) * 100).toFixed(1);
                  return (
                    <div key={r.name} className="flex items-center justify-between py-3 border-b border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-400 font-bold w-6">{i + 1}</span>
                        <span className="text-white font-medium">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-700 rounded-full h-2"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} /></div>
                        <span className="text-blue-400 font-mono text-sm font-bold w-14 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Kim strongholds */}
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-red-400 mb-4">김문수 강세 지역 TOP 5</h3>
                {[...electionData.regions].sort((a, b) => {
                  const at = a.lee + a.kim + a.jun + a.kwon + a.song;
                  const bt = b.lee + b.kim + b.jun + b.kwon + b.song;
                  return (b.kim / bt) - (a.kim / at);
                }).slice(0, 5).map((r, i) => {
                  const t = r.lee + r.kim + r.jun + r.kwon + r.song;
                  const pct = ((r.kim / t) * 100).toFixed(1);
                  return (
                    <div key={r.name} className="flex items-center justify-between py-3 border-b border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <span className="text-red-400 font-bold w-6">{i + 1}</span>
                        <span className="text-white font-medium">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-700 rounded-full h-2"><div className="h-2 rounded-full bg-red-500" style={{ width: `${pct}%` }} /></div>
                        <span className="text-red-400 font-mono text-sm font-bold w-14 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Turnout insights */}
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-emerald-400 mb-4">투표율 인사이트</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(() => {
                  const s = [...electionData.regions].sort((a, b) => b.turnout - a.turnout);
                  return <>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <div className="text-emerald-400 text-2xl font-bold">{s[0].turnout}%</div>
                      <div className="text-white font-medium mt-1">{s[0].name}</div>
                      <div className="text-slate-500 text-xs mt-1">최고 투표율</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <div className="text-amber-400 text-2xl font-bold">{s[s.length - 1].turnout}%</div>
                      <div className="text-white font-medium mt-1">{s[s.length - 1].name}</div>
                      <div className="text-slate-500 text-xs mt-1">최저 투표율</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <div className="text-purple-400 text-2xl font-bold">{(s[0].turnout - s[s.length - 1].turnout).toFixed(1)}%p</div>
                      <div className="text-white font-medium mt-1">최대 편차</div>
                      <div className="text-slate-500 text-xs mt-1">{s[0].name} - {s[s.length - 1].name}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <div className="text-cyan-400 text-2xl font-bold">{nat.turnout}%</div>
                      <div className="text-white font-medium mt-1">전국 평균</div>
                      <div className="text-slate-500 text-xs mt-1">선거인수 {fmt(nat.voters)}</div>
                    </div>
                  </>;
                })()}
              </div>
            </div>

            {/* Battlegrounds */}
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-amber-400 mb-4">접전 지역 (격차 10%p 이내)</h3>
              <div className="space-y-3">
                {[...electionData.regions].map(r => {
                  const t = r.lee + r.kim + r.jun + r.kwon + r.song;
                  return { ...r, leePct: (r.lee / t) * 100, kimPct: (r.kim / t) * 100, gap: Math.abs(((r.lee - r.kim) / t) * 100) };
                }).filter(r => r.gap < 10).sort((a, b) => a.gap - b.gap).map(r => (
                  <div key={r.name} className="flex items-center gap-4 p-3 bg-slate-900/40 rounded-lg">
                    <span className="text-white font-bold w-16">{r.name}</span>
                    <div className="flex-1 flex h-6 rounded overflow-hidden">
                      <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${r.leePct}%`, backgroundColor: '#0066CC' }}>{r.leePct.toFixed(1)}%</div>
                      <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${r.kimPct}%`, backgroundColor: '#E61E2B' }}>{r.kimPct.toFixed(1)}%</div>
                    </div>
                    <span className="text-amber-400 font-mono text-xs font-bold w-16 text-right">{r.gap.toFixed(1)}%p</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 이준석 analysis */}
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-orange-400 mb-4">이준석 득표율 분석</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-slate-400 mb-3">높은 순</h4>
                  {[...electionData.regions].sort((a, b) => {
                    const at = a.lee + a.kim + a.jun + a.kwon + a.song;
                    const bt = b.lee + b.kim + b.jun + b.kwon + b.song;
                    return (b.jun / bt) - (a.jun / at);
                  }).slice(0, 5).map((r, i) => {
                    const t = r.lee + r.kim + r.jun + r.kwon + r.song;
                    return (
                      <div key={r.name} className="flex justify-between py-2 border-b border-slate-700/30">
                        <span className="text-white">{r.name}</span>
                        <span className="text-orange-400 font-mono font-bold">{((r.jun / t) * 100).toFixed(2)}% ({fmt(r.jun)}표)</span>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <h4 className="text-sm text-slate-400 mb-3">절대 득표수 순</h4>
                  {[...electionData.regions].sort((a, b) => b.jun - a.jun).slice(0, 5).map((r) => {
                    const t = r.lee + r.kim + r.jun + r.kwon + r.song;
                    return (
                      <div key={r.name} className="flex justify-between py-2 border-b border-slate-700/30">
                        <span className="text-white">{r.name}</span>
                        <span className="text-orange-400 font-mono font-bold">{fmt(r.jun)}표 ({((r.jun / t) * 100).toFixed(2)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

        {/* Recheck Analysis */}
        {activeTab === 'recheck' && (() => {
          const rc = rawData.recheck;
          const nat = rc.national;
          const cq = rc.candidate_quality;
          const pdfEv = rc.pdf_evidence;
          const cr = rc.corrected_regions || [];
          const cn = rc.corrected_national || {};
          const creg = rc.corrected_regression || {};

          const statusColor = { ok:'text-emerald-400', partial:'text-amber-400', bad:'text-orange-400', critical:'text-red-400' };
          const statusBg = { ok:'bg-emerald-900/30 border-emerald-600/40', partial:'bg-amber-900/30 border-amber-600/40', bad:'bg-orange-900/30 border-orange-600/40', critical:'bg-red-900/30 border-red-600/40' };
          const statusIcon = { ok:'✓', partial:'⚠', bad:'✗', critical:'✗' };

          const allRates = rc.regions.map(r => {
            const leeRPct = parseFloat((r.lee_recheck/(r.lee_class+r.lee_recheck)*100).toFixed(1));
            const kimRPct = parseFloat((r.kim_recheck/(r.kim_class+r.kim_recheck)*100).toFixed(1));
            const junRPct = r.jun_total ? parseFloat((r.jun_recheck/r.jun_total*100).toFixed(1)) : null;
            const kwonRPct = r.kwon_total ? parseFloat((r.kwon_recheck/r.kwon_total*100).toFixed(1)) : null;
            const songRPct = r.song_total ? parseFloat((r.song_recheck/r.song_total*100).toFixed(1)) : null;
            const kimOk = kimRPct <= 10;
            const junOk = junRPct !== null && junRPct <= 15;
            const kwonOk = kwonRPct !== null && kwonRPct <= 15;
            const songOk = songRPct !== null && songRPct <= 15;
            return { name: r.name, leeRPct, kimRPct, junRPct, kwonRPct, songRPct, kimOk, junOk, kwonOk, songOk };
          });

          const corrKData = [...cr].sort((a,b)=>b.K-a.K).map(r=>({ name:r.name, K:r.K, color: r.K>3?'#ef4444':r.K>1.5?'#f97316':'#22c55e' }));
          const corrScatter = cr.map(r=>({ name:r.name, x:r.R1, y:r.R2 }));

          const corrCandRates = [
            { name:'이재명', raw:(nat.lee.recheck/nat.lee.total*100).toFixed(1), corr:((cn.lee||{}).recheck/nat.lee.total*100||2.4).toFixed(1), color:'#0066CC' },
            { name:'김문수', raw:(nat.kim.recheck/nat.kim.total*100).toFixed(1), corr:((cn.kim||{}).recheck/(nat.kim.total)*100||4.2).toFixed(1), color:'#E61E2B' },
            { name:'이준석', raw:(nat.jun.recheck/nat.jun.total*100).toFixed(1), corr:((cn.jun||{}).recheck/(nat.jun.total)*100||6.0).toFixed(1), color:'#FF9800' },
            { name:'권영국', raw:(nat.kwon.recheck/nat.kwon.total*100).toFixed(1), corr:((cn.kwon||{}).recheck/(nat.kwon.total)*100||3.2).toFixed(1), color:'#FFEB3B' },
            { name:'송진호', raw:(nat.song.recheck/nat.song.total*100).toFixed(1), corr:((cn.song||{}).recheck/(nat.song.total)*100||7.5).toFixed(1), color:'#9E9E9E' },
          ];

          return (
            <div className="space-y-6">
              {/* Error Banner */}
              <div className="bg-red-950/50 border border-red-600/60 rounded-2xl p-5 flex items-start gap-3">
                <AlertTriangle size={22} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-red-300 font-bold text-lg mb-1">OCR 데이터 오류 발견 — PDF 직접 검증 결과</div>
                  <div className="text-red-200/70 text-sm leading-relaxed">
                    AI OCR로 생성된 재확인표 데이터에서 <strong>심각한 오류</strong>가 발견됐습니다.
                    6개 지역 투표함을 원본 PDF에서 직접 판독한 결과, 이재명을 제외한 후보들의 재확인표 수치가 대부분 크게 부풀려졌습니다.
                    <strong> 선거 결과(최종 득표수)는 공식 데이터로 정확</strong>하며, 이 오류는 OCR 파싱 과정의 문제입니다.
                  </div>
                </div>
              </div>

              {/* Candidate Quality Cards */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">후보별 재확인표 데이터 신뢰도</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { key:'lee', name:'이재명', color:'#0066CC' },
                    { key:'kim', name:'김문수', color:'#E61E2B' },
                    { key:'jun', name:'이준석', color:'#FF9800' },
                    { key:'kwon', name:'권영국', color:'#FFEB3B' },
                    { key:'song', name:'송진호', color:'#9E9E9E' },
                  ].map(({key,name,color}) => {
                    const q = cq[key];
                    return (
                      <div key={key} className={`rounded-xl p-4 border ${statusBg[q.status]}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor:color}}/>
                          <span className="text-white font-bold">{name}</span>
                        </div>
                        <div className={`text-xl font-bold font-mono ${statusColor[q.status]}`}>{statusIcon[q.status]} {q.label}</div>
                        <div className="text-slate-400 text-xs mt-2">xlsx 재확인율: <span className="text-white font-mono">{q.xlsx_rate}%</span></div>
                        <div className="text-slate-400 text-xs">실제 예상: <span className="text-emerald-400 font-mono">{q.expected}</span></div>
                        {q.bad_count > 0 && <div className="text-slate-500 text-xs mt-1">오류 지역: {q.bad_count}개 시도</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PDF Direct Evidence */}
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-1">PDF 직접 판독 증거</h3>
                <p className="text-slate-500 text-xs mb-4">원본 개표상황표 PDF를 직접 렌더링하여 투표함별 재확인표 수를 판독. 모든 후보의 실제 재확인율은 0~10% 범위.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="py-2 px-3 text-left">지역</th>
                        <th className="py-2 px-3 text-left">투표함</th>
                        <th className="py-2 px-3 text-right text-blue-400">이재명</th>
                        <th className="py-2 px-3 text-right text-red-400">김문수</th>
                        <th className="py-2 px-3 text-right text-orange-400">이준석</th>
                        <th className="py-2 px-3 text-right text-yellow-400">권영국</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pdfEv.map((e,i) => (
                        <tr key={i} className={`border-b border-slate-800 hover:bg-slate-800/40 ${i%2===0?'':'bg-slate-900/20'}`}>
                          <td className="py-2 px-3 text-white font-medium">{e.region}</td>
                          <td className="py-2 px-3 text-slate-400 text-xs">{e.location}</td>
                          <td className="py-2 px-3 text-right text-emerald-400 font-mono">{e.lee}%</td>
                          <td className="py-2 px-3 text-right text-emerald-400 font-mono">{e.kim}%</td>
                          <td className="py-2 px-3 text-right text-emerald-400 font-mono">{e.jun}%</td>
                          <td className="py-2 px-3 text-right text-emerald-400 font-mono">{e.kwon}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-slate-500">비교: xlsx 주장 — 경기 김문수 47.4%, 대구 권영국 99.2%, 전북 송진호 99.7% (물리적으로 불가능)</div>
              </div>

              {/* Regional Data Quality Table */}
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-1">지역별 재확인율 — 오류 진단</h3>
                <p className="text-slate-500 text-xs mb-4">빨간 배경: 15% 초과(이상값) | 녹색: 정상(0~10%) | 이재명은 전 지역 정상</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="py-2 px-2 text-left">지역</th>
                        <th className="py-2 px-2 text-right text-blue-400">이재명</th>
                        <th className="py-2 px-2 text-right text-red-400">김문수</th>
                        <th className="py-2 px-2 text-right text-orange-400">이준석</th>
                        <th className="py-2 px-2 text-right text-yellow-300">권영국</th>
                        <th className="py-2 px-2 text-right text-slate-400">송진호</th>
                        <th className="py-2 px-2 text-right">판정</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allRates.map((r,i) => {
                        const allOk = r.kimOk && r.junOk && r.kwonOk && r.songOk;
                        return (
                          <tr key={r.name} className={`border-b border-slate-800 hover:bg-slate-800/40 ${i%2===0?'':'bg-slate-900/20'}`}>
                            <td className="py-2 px-2 text-white font-medium">{r.name}</td>
                            <td className="py-2 px-2 text-right text-emerald-400 font-mono">{r.leeRPct}%</td>
                            <td className={`py-2 px-2 text-right font-mono font-bold ${r.kimOk?'text-emerald-400':'text-red-400'}`}>{r.kimRPct}%</td>
                            <td className={`py-2 px-2 text-right font-mono font-bold ${r.junOk?'text-emerald-400':'text-red-400'}`}>{r.junRPct !== null ? r.junRPct+'%' : '-'}</td>
                            <td className={`py-2 px-2 text-right font-mono font-bold ${r.kwonOk?'text-emerald-400':'text-red-400'}`}>{r.kwonRPct !== null ? r.kwonRPct+'%' : '-'}</td>
                            <td className={`py-2 px-2 text-right font-mono font-bold ${r.songOk?'text-emerald-400':'text-red-400'}`}>{r.songRPct !== null ? r.songRPct+'%' : '-'}</td>
                            <td className="py-2 px-2 text-right">
                              <span className={`font-bold ${allOk?'text-emerald-400':'text-red-400'}`}>{allOk?'✓':'✗'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Corrected National Stats */}
              <div>
                <h3 className="text-lg font-bold text-white mb-1">전국 보정 재확인율 비교</h3>
                <p className="text-slate-500 text-xs mb-3">OCR 오류 보정 후 추정값 (이재명 실측 기준, 제주도 후보간 비율 적용)</p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {corrCandRates.map(c=>(
                    <div key={c.name} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor:c.color}}/>
                        <span className="text-white font-bold text-sm">{c.name}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">xlsx(오염)</span>
                          <span className="text-red-400 font-mono line-through">{c.raw}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">보정 추정</span>
                          <span className="text-emerald-400 font-mono font-bold">{c.corr}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 17개 시도 보정 데이터 테이블 */}
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-1">17개 시도 보정 데이터 — R1 / R2 / K값</h3>
                <p className="text-slate-500 text-xs mb-4">
                  보정 방법: 이재명 재확인율(실측) 기준, 제주도 후보간 비율로 이상값 추정 교체.
                  <span className="text-amber-400 ml-1">주황* = 보정된 추정값</span>
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="py-2 px-2 text-left">지역</th>
                        <th className="py-2 px-2 text-right text-blue-400">이재명%</th>
                        <th className="py-2 px-2 text-right text-red-400">김문수%</th>
                        <th className="py-2 px-2 text-right text-orange-400">이준석%</th>
                        <th className="py-2 px-2 text-right text-yellow-300">권영국%</th>
                        <th className="py-2 px-2 text-right text-slate-400">송진호%</th>
                        <th className="py-2 px-2 text-right">R1</th>
                        <th className="py-2 px-2 text-right">R2</th>
                        <th className="py-2 px-2 text-right">K값</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...cr].sort((a,b)=>b.K-a.K).map((r,i)=>(
                        <tr key={r.name} className={`border-b border-slate-800 hover:bg-slate-800/40 ${i%2===0?'':'bg-slate-900/20'}`}>
                          <td className="py-2 px-2 text-white font-medium">{r.name}</td>
                          <td className="py-2 px-2 text-right text-emerald-400 font-mono">{r.lee_rcPct}%</td>
                          <td className="py-2 px-2 text-right font-mono">
                            <span className={r.kim_corrected?'text-amber-400':'text-emerald-400'}>{r.kim_rcPct}%{r.kim_corrected?'*':''}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            <span className={r.jun_corrected?'text-amber-400':'text-emerald-400'}>{r.jun_rcPct}%{r.jun_corrected?'*':''}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            <span className={r.kwon_corrected?'text-amber-400':'text-emerald-400'}>{r.kwon_rcPct}%{r.kwon_corrected?'*':''}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            <span className={r.song_corrected?'text-amber-400':'text-emerald-400'}>{r.song_rcPct}%{r.song_corrected?'*':''}</span>
                          </td>
                          <td className="py-2 px-2 text-right text-slate-300 font-mono">{r.R1}%</td>
                          <td className="py-2 px-2 text-right text-slate-300 font-mono">{r.R2}%</td>
                          <td className="py-2 px-2 text-right">
                            <span className={`font-bold font-mono ${r.K>3?'text-orange-400':r.K>1.5?'text-yellow-400':'text-emerald-400'}`}>{r.K.toFixed(3)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Corrected K값 chart + Scatter */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-1">지역별 K값 (보정)</h3>
                  <p className="text-slate-500 text-xs mb-4">K = (김문수재확인/이재명재확인) ÷ (김문수분류/이재명분류) · K=1 정상 · 역대 K≈1.4~1.6</p>
                  <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={corrKData} layout="vertical" margin={{top:5,right:50,left:40,bottom:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                      <XAxis type="number" tick={{fill:'#94a3b8',fontSize:11}}/>
                      <YAxis type="category" dataKey="name" tick={{fill:'#94a3b8',fontSize:11}} width={40}/>
                      <Tooltip formatter={v=>v.toFixed(3)} contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:'8px',color:'#e2e8f0'}}/>
                      <ReferenceLine x={1} stroke="#4ade80" strokeDasharray="4 4" label={{value:'K=1',fill:'#4ade80',fontSize:10}}/>
                      <ReferenceLine x={1.6} stroke="#facc15" strokeDasharray="3 3" label={{value:'역대최고',fill:'#facc15',fontSize:9,position:'top'}}/>
                      <Bar dataKey="K" radius={[0,4,4,0]}>
                        {corrKData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-1">R1 vs R2 산점도 (보정)</h3>
                  <p className="text-slate-500 text-xs mb-4">
                    보정 R² = <span className="text-white font-bold">{creg.r2}</span> · 기울기 b = {creg.b} · 절편 a = {creg.a}
                  </p>
                  <ResponsiveContainer width="100%" height={380}>
                    <ScatterChart margin={{top:10,right:20,left:10,bottom:20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                      <XAxis dataKey="x" name="R1" type="number" tick={{fill:'#94a3b8',fontSize:11}} label={{value:'R1 김문수분류%',position:'insideBottom',offset:-10,fill:'#94a3b8',fontSize:11}} tickFormatter={v=>v+'%'}/>
                      <YAxis dataKey="y" name="R2" type="number" tick={{fill:'#94a3b8',fontSize:11}} label={{value:'R2 재확인%',angle:-90,position:'insideLeft',fill:'#94a3b8',fontSize:11}} tickFormatter={v=>v+'%'}/>
                      <Tooltip cursor={{strokeDasharray:'3 3'}} content={({payload})=>{
                        if(!payload||!payload[0]) return null;
                        const d=payload[0].payload;
                        return <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:'8px',padding:'8px 12px',color:'#e2e8f0',fontSize:12}}>
                          <div className="font-bold">{d.name}</div>
                          <div>R1: {d.x}% | R2: {d.y}%</div>
                        </div>;
                      }}/>
                      <Scatter data={corrScatter} fill="#60a5fa"/>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Historical Regression Comparison — all 5 elections */}
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">역대 대선 회귀분석 비교 (21대 보정 포함)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {rc.prev_elections.map(e=>{
                    const isCorr = e.label==='21대(보정)';
                    const isRaw  = e.label==='21대';
                    return (
                      <div key={e.label} className={`rounded-xl p-4 border ${isRaw?'border-red-500/60 bg-red-950/20':isCorr?'border-blue-500/60 bg-blue-950/20':'border-slate-600 bg-slate-900/40'}`}>
                        <div className={`text-xl font-bold ${isRaw?'text-red-400':isCorr?'text-blue-400':'text-emerald-400'}`}>{e.label}</div>
                        {isCorr && <div className="text-blue-300 text-xs mt-0.5">OCR 보정 추정</div>}
                        {isRaw  && <div className="text-red-300 text-xs mt-0.5">OCR 오류 원본</div>}
                        <div className="text-white font-mono text-sm mt-2">R² = <span className={`font-bold ${e.r2>=0.9?'text-emerald-400':e.r2>=0.5?'text-amber-400':'text-red-400'}`}>{e.r2.toFixed(2)}</span></div>
                        <div className="text-slate-400 text-xs mt-1">기울기 b = {e.b}</div>
                        <div className="text-slate-500 text-xs">절편 a = {e.a}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-xs text-slate-500 border-t border-slate-700 pt-3">
                  ※ 21대(보정)의 R²=0.65는 역대 0.93~0.98보다 낮음 — 세종·충북 등 일부 지역에서 여전히 이상값 잔류 가능성 있음. 원본 PDF 전수 검증 필요.
                </div>
              </div>

              {/* OCR 오류 요약 */}
              <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-red-800/40">
                <h3 className="text-lg font-bold text-red-400 mb-3">OCR 오류 규모 요약</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                  {[
                    { label:'xlsx K값', val:'7.72', corr:'1.80', good:false },
                    { label:'보정 K값', val:'1.80', corr:'역대 1.47~1.64', good:true },
                    { label:'xlsx R²', val:'0.00', corr:'보정 후 0.65', good:false },
                    { label:'보정 R²', val:'0.65', corr:'vs 역대 0.93~0.98', good:true },
                  ].map(s=>(
                    <div key={s.label} className={`rounded-xl p-3 border ${s.good?'border-emerald-800/40 bg-emerald-950/20':'border-red-800/40 bg-red-950/20'}`}>
                      <div className={`text-xl font-bold font-mono ${s.good?'text-emerald-400':'text-red-400'}`}>{s.val}</div>
                      <div className="text-slate-400 text-xs mt-1">{s.label}</div>
                      <div className="text-slate-500 text-xs">{s.corr}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500">
                  선거 결과(득표수)는 공식 데이터로 정확. 재확인표 이상은 OCR 파싱 오류. 부정선거 증거 없음.
                </div>
              </div>
            </div>
          );
        })()}

      <footer className="border-t border-slate-800 mt-12 py-6 text-center text-slate-600 text-xs">
        <p>데이터 출처: 중앙선거관리위원회 선거통계시스템 | 제21대 대통령선거 2025.06.03 | 원본 169,749건 집계</p>
        <p className="mt-1">
          <a href="https://github.com/sechan9999/K21claude" className="text-slate-500 hover:text-blue-400 transition" target="_blank" rel="noopener">GitHub: sechan9999/K21claude</a>
          {' · '}MIT License
        </p>
      </footer>
    </div>
  );
}
