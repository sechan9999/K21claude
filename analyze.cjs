const fs = require('fs');
const path = require('path');
const csv = fs.readFileSync(path.join(__dirname, 'election_raw.csv'), 'utf-8');
const lines = csv.split('\n').slice(1).filter(l => l.trim());

// 1. Aggregate by 시도
const byRegion = {};
for (const line of lines) {
  const cols = line.split(',');
  const sido = cols[0];
  const category = cols[4];
  const value = parseInt(cols[5]) || 0;
  if (!sido) continue;
  if (!byRegion[sido]) byRegion[sido] = {};
  if (!byRegion[sido][category]) byRegion[sido][category] = 0;
  byRegion[sido][category] += value;
}

console.log('========================================');
console.log('  중앙선거관리위원회 공식 데이터 분석');
console.log('  제21대 대통령선거 (2025.06.03)');
console.log('========================================\n');

// 2. National totals
let natLee=0, natKim=0, natJun=0, natKwon=0, natSong=0, natVoters=0, natVoted=0, natInvalid=0;
const regionRows = [];

for (const [region, data] of Object.entries(byRegion)) {
  const lee = data['더불어민주당 이재명'] || 0;
  const kim = data['국민의힘 김문수'] || 0;
  const jun = data['개혁신당 이준석'] || 0;
  const kwon = data['민주노동당 권영국'] || 0;
  const song = data['무소속 송진호'] || 0;
  const voters = data['선거인수'] || 0;
  const voted = data['투표수'] || 0;
  const invalid = data['무효 투표수'] || 0;
  const turnout = voters > 0 ? ((voted / voters) * 100) : 0;
  const total = lee + kim + jun + kwon + song;
  const margin = lee - kim;

  natLee += lee; natKim += kim; natJun += jun; natKwon += kwon; natSong += song;
  natVoters += voters; natVoted += voted; natInvalid += invalid;

  regionRows.push({ region, lee, kim, jun, kwon, song, voters, voted, invalid, turnout, total, margin });
}

const natTotal = natLee + natKim + natJun + natKwon + natSong;

console.log('━━━ 1. 전국 총괄 ━━━');
console.log(`선거인수: ${natVoters.toLocaleString()}`);
console.log(`투표수:   ${natVoted.toLocaleString()}`);
console.log(`투표율:   ${((natVoted/natVoters)*100).toFixed(2)}%`);
console.log(`유효투표: ${natTotal.toLocaleString()}`);
console.log(`무효투표: ${natInvalid.toLocaleString()}`);
console.log();

console.log('━━━ 2. 후보별 득표 ━━━');
const candidates = [
  { name: '이재명 (더불어민주당)', votes: natLee },
  { name: '김문수 (국민의힘)',     votes: natKim },
  { name: '이준석 (개혁신당)',     votes: natJun },
  { name: '권영국 (민주노동당)',   votes: natKwon },
  { name: '송진호 (무소속)',       votes: natSong },
];
candidates.sort((a,b) => b.votes - a.votes);
for (const c of candidates) {
  const pct = ((c.votes / natTotal) * 100).toFixed(2);
  const bar = '█'.repeat(Math.round(pct / 2));
  console.log(`  ${c.name.padEnd(22)} ${c.votes.toLocaleString().padStart(12)}표  (${pct}%)  ${bar}`);
}
console.log(`\n  당선인 격차: ${(natLee - natKim).toLocaleString()}표 (${(((natLee-natKim)/natTotal)*100).toFixed(2)}%p)`);
console.log();

console.log('━━━ 3. 시도별 상세 ━━━');
console.log('시도'.padEnd(10) + '이재명'.padStart(12) + '김문수'.padStart(12) + '격차'.padStart(12) + '투표율'.padStart(8));
console.log('-'.repeat(56));
regionRows.sort((a,b) => b.margin - a.margin);
for (const r of regionRows) {
  const sign = r.margin >= 0 ? '+' : '';
  console.log(
    r.region.padEnd(10) +
    r.lee.toLocaleString().padStart(12) +
    r.kim.toLocaleString().padStart(12) +
    (sign + r.margin.toLocaleString()).padStart(12) +
    (r.turnout.toFixed(1) + '%').padStart(8)
  );
}
console.log();

// 4. Metro vs non-metro
const metro = ['서울특별시', '경기도', '인천광역시'];
const metroData = regionRows.filter(r => metro.includes(r.region));
const nonMetroData = regionRows.filter(r => !metro.includes(r.region));
const mLee = metroData.reduce((s,r) => s+r.lee, 0);
const mKim = metroData.reduce((s,r) => s+r.kim, 0);
const nmLee = nonMetroData.reduce((s,r) => s+r.lee, 0);
const nmKim = nonMetroData.reduce((s,r) => s+r.kim, 0);

console.log('━━━ 4. 수도권 vs 비수도권 ━━━');
console.log(`수도권:   이재명 ${mLee.toLocaleString()} (${((mLee/(mLee+mKim))*100).toFixed(1)}%) vs 김문수 ${mKim.toLocaleString()} (${((mKim/(mLee+mKim))*100).toFixed(1)}%) → 격차 +${(mLee-mKim).toLocaleString()}`);
console.log(`비수도권: 이재명 ${nmLee.toLocaleString()} (${((nmLee/(nmLee+nmKim))*100).toFixed(1)}%) vs 김문수 ${nmKim.toLocaleString()} (${((nmKim/(nmLee+nmKim))*100).toFixed(1)}%) → 격차 +${(nmLee-nmKim).toLocaleString()}`);
console.log();

// 5. Closest races
console.log('━━━ 5. 접전 지역 (격차 좁은 순) ━━━');
const byGap = [...regionRows].sort((a,b) => Math.abs(a.margin/a.total) - Math.abs(b.margin/b.total));
for (const r of byGap.slice(0, 5)) {
  const gapPct = ((Math.abs(r.margin) / r.total) * 100).toFixed(2);
  const winner = r.margin >= 0 ? '이재명' : '김문수';
  console.log(`  ${r.region.padEnd(10)} ${winner} +${Math.abs(r.margin).toLocaleString()} (${gapPct}%p)`);
}
console.log();

// 6. Turnout analysis
console.log('━━━ 6. 투표율 분석 ━━━');
const byTurnout = [...regionRows].sort((a,b) => b.turnout - a.turnout);
console.log(`최고: ${byTurnout[0].region} (${byTurnout[0].turnout.toFixed(2)}%)`);
console.log(`최저: ${byTurnout[byTurnout.length-1].region} (${byTurnout[byTurnout.length-1].turnout.toFixed(2)}%)`);
console.log(`편차: ${(byTurnout[0].turnout - byTurnout[byTurnout.length-1].turnout).toFixed(2)}%p`);
console.log();

// 7. 이준석 influence
console.log('━━━ 7. 이준석 득표율 분석 ━━━');
const byJun = [...regionRows].sort((a,b) => (b.jun/b.total) - (a.jun/a.total));
for (const r of byJun.slice(0, 5)) {
  console.log(`  ${r.region.padEnd(10)} ${((r.jun/r.total)*100).toFixed(2)}% (${r.jun.toLocaleString()}표)`);
}
console.log();

// 8. 구시군 level breakdown for key battlegrounds
console.log('━━━ 8. 구시군별 분석 (서울 25개구) ━━━');
const seoulGu = {};
for (const line of lines) {
  const cols = line.split(',');
  if (cols[0] !== '서울특별시') continue;
  const gu = cols[1];
  const cat = cols[4];
  const val = parseInt(cols[5]) || 0;
  if (!gu) continue;
  if (!seoulGu[gu]) seoulGu[gu] = {};
  if (!seoulGu[gu][cat]) seoulGu[gu][cat] = 0;
  seoulGu[gu][cat] += val;
}

const seoulRows = [];
for (const [gu, data] of Object.entries(seoulGu)) {
  const lee = data['더불어민주당 이재명'] || 0;
  const kim = data['국민의힘 김문수'] || 0;
  const total = lee + kim + (data['개혁신당 이준석']||0) + (data['민주노동당 권영국']||0) + (data['무소속 송진호']||0);
  seoulRows.push({ gu, lee, kim, margin: lee - kim, total });
}
seoulRows.sort((a,b) => b.margin - a.margin);
console.log('구'.padEnd(12) + '이재명'.padStart(10) + '김문수'.padStart(10) + '격차'.padStart(10) + '이재명%'.padStart(8));
console.log('-'.repeat(52));
for (const r of seoulRows) {
  console.log(
    r.gu.padEnd(12) +
    r.lee.toLocaleString().padStart(10) +
    r.kim.toLocaleString().padStart(10) +
    ((r.margin >= 0 ? '+' : '') + r.margin.toLocaleString()).padStart(10) +
    ((r.lee/r.total*100).toFixed(1) + '%').padStart(8)
  );
}
console.log();

// Output JSON for dashboard update
const dashboardData = {
  candidates: candidates.map(c => ({
    name: c.name.split(' (')[0],
    party: c.name.match(/\((.+)\)/)[1],
    votes: c.votes,
    percentage: parseFloat(((c.votes / natTotal) * 100).toFixed(2))
  })),
  regions: regionRows.map(r => ({
    name: r.region.replace('특별시','').replace('광역시','').replace('특별자치시','').replace('특별자치도','').replace('도',''),
    fullName: r.region,
    lee: r.lee, kim: r.kim, jun: r.jun, kwon: r.kwon, song: r.song,
    voters: r.voters, voted: r.voted, invalid: r.invalid,
    turnout: parseFloat(r.turnout.toFixed(2))
  })),
  national: { voters: natVoters, voted: natVoted, total: natTotal, invalid: natInvalid, turnout: parseFloat(((natVoted/natVoters)*100).toFixed(2)) },
  seoul: seoulRows.map(r => ({ name: r.gu, lee: r.lee, kim: r.kim, margin: r.margin, total: r.total }))
};

fs.writeFileSync(path.join(__dirname, 'src', 'data.json'), JSON.stringify(dashboardData, null, 2));
console.log('✅ src/data.json 생성 완료 (대시보드 데이터)');
