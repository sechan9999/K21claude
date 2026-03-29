const XLSX = require('xlsx');
const wb = XLSX.readFile('K21_대선_개표결과_상세.xlsx');
const ws = wb.Sheets['지역별 상세'];
const rows = XLSX.utils.sheet_to_json(ws, {header:1});

// Parse regional data
const regions = [];
for(let i=3; i<rows.length-1; i++) {
  const r = rows[i];
  if(!r[0] || r[0]==='전국 합계') continue;
  regions.push({
    name: r[0],
    lee:  { class: r[1],  recheck: r[2],  total: r[3]  },
    kim:  { class: r[4],  recheck: r[5],  total: r[6]  },
    jun:  { class: r[7],  recheck: r[8],  total: r[9]  },
    kwon: { class: r[10], recheck: r[11], total: r[12] },
    song: { class: r[13], recheck: r[14], total: r[15] },
  });
}

// National totals
const nat = {
  lee:  { class: 16876697, recheck: 410816,  total: 17287513 },
  kim:  { class: 12118200, recheck: 2277439, total: 14395639 },
  jun:  { class: 2157295,  recheck: 760228,  total: 2917523  },
  kwon: { class: 127035,   recheck: 217115,  total: 344150   },
  song: { class: 7734,     recheck: 28057,   total: 35791    },
};
const natTotalClass   = Object.values(nat).reduce((s,c)=>s+c.class,0);
const natTotalRecheck = Object.values(nat).reduce((s,c)=>s+c.recheck,0);

console.log('=== 제21대 대선: 분류표 vs 재확인표(미분류표) 분석 ===\n');
console.log('전국 합계:');
console.log('  총 분류표:    ' + natTotalClass.toLocaleString());
console.log('  총 재확인표:  ' + natTotalRecheck.toLocaleString());
console.log('  재확인표 비율: ' + (natTotalRecheck/(natTotalClass+natTotalRecheck)*100).toFixed(2) + '%');
console.log('');
console.log('후보별 재확인표 비율:');
['lee','kim','jun','kwon','song'].forEach(k => {
  const names = {lee:'이재명', kim:'김문수', jun:'이준석', kwon:'권영국', song:'송진호'};
  const c = nat[k];
  console.log('  ' + names[k] + ': 분류표 ' + c.class.toLocaleString() + ' | 재확인표 ' + c.recheck.toLocaleString() + ' (' + (c.recheck/c.total*100).toFixed(1) + '%)');
});

// R1, R2, K per region
console.log('\n=== 지역별 R1, R2, K 분석 ===');
console.log('지역\t\tR1(김문수분류%)\tR2(김문수재확인%)\tK값\t이재명재확인%\t김문수재확인%');
regions.forEach(r => {
  const totalClass   = r.lee.class   + r.kim.class   + r.jun.class   + r.kwon.class   + r.song.class;
  const totalRecheck = r.lee.recheck + r.kim.recheck + r.jun.recheck + r.kwon.recheck + r.song.recheck;

  const R1 = r.kim.class   / totalClass;
  const R2 = r.kim.recheck / totalRecheck;
  const K  = (r.kim.recheck / r.lee.recheck) / (r.kim.class / r.lee.class);
  const leeRPct = (r.lee.recheck / r.lee.total * 100).toFixed(1);
  const kimRPct = (r.kim.recheck / r.kim.total * 100).toFixed(1);

  console.log(r.name + '\t' + (R1*100).toFixed(2) + '%\t\t' + (R2*100).toFixed(2) + '%\t\t\t' + K.toFixed(3) + '\t' + leeRPct + '%\t\t' + kimRPct + '%');
  r.R1 = R1; r.R2 = R2; r.K = K;
});

// Linear regression R2 = a + b*R1
const n = regions.length;
const sumX  = regions.reduce((s,r)=>s+r.R1,0);
const sumY  = regions.reduce((s,r)=>s+r.R2,0);
const sumXY = regions.reduce((s,r)=>s+r.R1*r.R2,0);
const sumX2 = regions.reduce((s,r)=>s+r.R1*r.R1,0);
const slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
const intercept = (sumY - slope*sumX) / n;

const yMean = sumY/n;
const ssTot = regions.reduce((s,r)=>s+Math.pow(r.R2-yMean,2),0);
const ssRes = regions.reduce((s,r)=>s+Math.pow(r.R2-(intercept+slope*r.R1),2),0);
const Rsq = 1 - ssRes/ssTot;

console.log('\n=== 선형 회귀 결과 ===');
console.log('R2 = ' + intercept.toFixed(4) + ' + ' + slope.toFixed(3) + ' * R1');
console.log('R² = ' + Rsq.toFixed(4));

console.log('\n=== 역대 대선 비교 ===');
console.log('18대: R2 =  0.012 + 1.52*R1  (R²=0.96)');
console.log('19대: R2 =  0.012 + 1.64*R1  (R²=0.98)');
console.log('20대: R2 = -0.139 + 1.47*R1  (R²=0.93)');
console.log('21대: R2 = ' + intercept.toFixed(3) + ' + ' + slope.toFixed(2) + '*R1  (R²=' + Rsq.toFixed(2) + ')');

// Highlight anomalous regions
console.log('\n=== 이상 지역 (K > 2.0) ===');
regions.filter(r=>r.K>2.0).forEach(r=>{
  console.log(r.name + ': K=' + r.K.toFixed(3) + ' | R1=' + (r.R1*100).toFixed(1) + '% | R2=' + (r.R2*100).toFixed(1) + '%');
});

// National K
const natK = (nat.kim.recheck/nat.lee.recheck) / (nat.kim.class/nat.lee.class);
console.log('\n전국 K값: ' + natK.toFixed(3));

// What if recheck was proportional?
const kimRecheckIfProp = natTotalRecheck * (nat.kim.class / natTotalClass);
const diff = nat.kim.recheck - kimRecheckIfProp;
console.log('\n=== 재확인표 비례 시나리오 ===');
console.log('분류표 비율대로라면 김문수 재확인표: ' + Math.round(kimRecheckIfProp).toLocaleString());
console.log('실제 김문수 재확인표:                 ' + nat.kim.recheck.toLocaleString());
console.log('초과 재확인표:                         +' + Math.round(diff).toLocaleString());
const leeRecheckIfProp = natTotalRecheck * (nat.lee.class / natTotalClass);
const leeDiff = nat.lee.recheck - leeRecheckIfProp;
console.log('분류표 비율대로라면 이재명 재확인표: ' + Math.round(leeRecheckIfProp).toLocaleString());
console.log('실제 이재명 재확인표:                 ' + nat.lee.recheck.toLocaleString());
console.log('차이:                                  ' + Math.round(leeDiff).toLocaleString());
