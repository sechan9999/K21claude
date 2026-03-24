import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MapPin, TrendingUp, Users, Activity, Download, BarChart3, ChevronDown, Award, Vote, Building2 } from 'lucide-react';
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
