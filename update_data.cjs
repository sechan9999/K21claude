const XLSX = require('xlsx');
const fs = require('fs');
const wb = XLSX.readFile('K21_대선_개표결과_상세.xlsx');
const ws = wb.Sheets['지역별 상세'];
const rows = XLSX.utils.sheet_to_json(ws, {header:1});

const regions = [];
for(let i=3; i<rows.length-1; i++) {
  const r = rows[i];
  if(!r[0] || r[0] === '전국 합계') continue;
  const leeC=r[1], leeR=r[2];
  const kimC=r[4], kimR=r[5];
  const junC=r[7], junR=r[8];
  const kwonC=r[10], kwonR=r[11];
  const songC=r[13], songR=r[14];
  const tC = leeC+kimC+junC+kwonC+songC;
  const tR = leeR+kimR+junR+kwonR+songR;
  const R1 = kimC/tC;
  const R2 = kimR/tR;
  const K  = (kimR/leeR)/(kimC/leeC);
  regions.push({
    name: r[0],
    lee_class: leeC, lee_recheck: leeR,
    kim_class: kimC, kim_recheck: kimR,
    jun_class: junC, jun_recheck: junR,
    R1: parseFloat((R1*100).toFixed(2)),
    R2: parseFloat((R2*100).toFixed(2)),
    K:  parseFloat(K.toFixed(3))
  });
}

const data = JSON.parse(fs.readFileSync('src/data.json','utf8'));
data.recheck = {
  national: {
    lee:  { class: 16876697, recheck: 410816,  total: 17287513 },
    kim:  { class: 12118200, recheck: 2277439, total: 14395639 },
    jun:  { class: 2157295,  recheck: 760228,  total: 2917523  },
    kwon: { class: 127035,   recheck: 217115,  total: 344150   },
    song: { class: 7734,     recheck: 28057,   total: 35791    },
  },
  regions: regions,
  prev_elections: [
    { label: '18대', a: 0.012, b: 1.52, r2: 0.96 },
    { label: '19대', a: 0.012, b: 1.64, r2: 0.98 },
    { label: '20대', a: -0.139, b: 1.47, r2: 0.93 },
    { label: '21대', a: 0.393, b: -0.001, r2: 0.00 },
  ]
};
fs.writeFileSync('src/data.json', JSON.stringify(data, null, 2));
console.log('data.json updated with recheck data');
console.log('regions:', regions.length);
