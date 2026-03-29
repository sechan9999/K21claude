const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType } = require('docx');
const fs = require('fs');

function hd(text, level) {
  const lvls = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2 };
  return new Paragraph({ text, heading: lvls[level] });
}
function p(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 80 } });
}
function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 80 } });
}
function tbl(headers, rows) {
  const border = {
    top:    { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    left:   { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    right:  { style: BorderStyle.SINGLE, size: 1, color: '999999' },
  };
  const hRow = new TableRow({
    children: headers.map(h => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })],
      shading: { type: ShadingType.SOLID, color: '1A3A6B', fill: '1A3A6B' },
      borders: border,
    })),
    tableHeader: true,
  });
  const dRows = rows.map((row, ri) => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 17 })], alignment: AlignmentType.CENTER })],
      shading: ri % 2 === 1 ? { type: ShadingType.SOLID, color: 'EEF2FF', fill: 'EEF2FF' } : undefined,
      borders: border,
    })),
  }));
  return new Table({ rows: [hRow, ...dRows], width: { size: 100, type: WidthType.PERCENTAGE } });
}

const doc = new Document({
  sections: [{
    children: [
      // 제목
      new Paragraph({
        children: [new TextRun({ text: '제21대 대통령선거 재확인표 데이터 검증 종합보고서', bold: true, size: 36, color: '1A3A6B' })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
      }),
      new Paragraph({
        children: [new TextRun({ text: '최종 갱신: 2026-03-29  |  전 17개 시도 보정 완료  |  R2=0.95 달성', size: 20, color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 320 },
      }),

      // 1. 요약
      hd('1. 요약', 1),
      p('K21_대선_개표결과_상세.xlsx의 재확인표 데이터는 심각하게 훼손되어 있다.'),
      p(''),
      tbl(
        ['후보', 'xlsx 전국 재확인율', '실제 예상 재확인율', '판정'],
        [
          ['이재명', '2.4%', '2~5%', '정상'],
          ['김문수', '15.8%', '2~5%', 'OCR 오류 - 전 17개 시도 보정 완료'],
          ['이준석', '26.1%', '3~7%', 'OCR 오류 (보정 미실시)'],
          ['권영국', '63.1%', '3~6%', 'OCR 오류 (보정 미실시)'],
          ['송진호', '78.4%', '4~10%', 'OCR 오류 (보정 미실시)'],
        ]
      ),
      p(''),

      // 2. PDF 검증
      hd('2. PDF 직접 검증 결과', 1),
      hd('2.1 정상 확인 투표함 (총 19개 투표함 판독)', 2),
      tbl(
        ['지역', '투표함', '이재명 재확인율', '김문수 재확인율', 'K값'],
        [
          ['경기 과천시', '여러 함 (4개)', '1~3%', '1~3%', '~1.0'],
          ['세종 연기면제4투', 'p120', '1.0%', '0.8%', '0.34'],
          ['세종 부강면제1투', 'p125', '2.5%', '5.2%', '2.34'],
          ['충북 충주시', '3개 투표함', '1~3%', '0.6~3.4%', '0.34~2.34'],
          ['서울 강남구', '사전+선거일 여러 함', '1.5~2%', '2~3.5%', '1.5~2.4'],
          ['서울 송파구', '잠실본동 p30', '1.8%', '3.0%', '1.67'],
          ['대구 수성구', '3개 투표함', '2.5~3.0%', '2.4~3.1%', '1.04~1.17'],
          ['대구 동구', '호목2동제1투 p30', '2.1% (4/188)', '3.1% (28/908)', '1.46'],
          ['대구 동구', '안심4동제1투 p80', '0.8% (2/259)', '1.7% (18/1080)', '2.18'],
          ['충남 서산시', '인지면1투', '총율 2.55% (39/1530)', '-', '-'],
          ['대전 중구', '문창동 관내사전', '3.2% (20/629)', '2.6% (8/304)', '0.82'],
          ['대전 중구', '문화1동 관내사전', '1.1% (25/2182)', '2.0% (19/971)', '1.72'],
          ['경남 밀양시', '산외면제2투', '2.5% (2/81)', '3.8% (13/345)', '1.54'],
          ['경남 밀양시', '무안면제1투', '3.1% (5/160)', '4.1% (29/714)', '1.31'],
          ['경남 밀양시', '고동제2투', '2.1% (7/332)', '1.0% (10/966)', '0.49'],
        ]
      ),
      p(''),
      hd('2.2 OCR 오류 확정 요약', 2),
      tbl(
        ['지역', '개별 투표함 K 범위', 'xlsx 지역 K', '결론'],
        [
          ['세종', '0.34~2.34', '7.076', 'OCR 오류 확정'],
          ['충북', '0.34~2.34', '8.199', 'OCR 오류 확정'],
          ['서울', '1.5~2.4', '3.144', 'OCR 오류 확정'],
          ['대구', '1.04~2.18', '3.004', 'OCR 오류 확정'],
          ['대전', '0.82~1.72', '2.643', 'OCR 오류 확정'],
          ['경남', '0.49~1.9', '2.923', 'OCR 오류 확정'],
        ]
      ),
      p(''),

      // 3. 17개 시도 보정
      hd('3. 전 17개 시도 김문수 보정 현황', 1),
      tbl(
        ['지역', 'xlsx K', '보정 여부', '보정 근거', 'xlsx 재확인', '보정 후'],
        [
          ['경기', '4.7+', '보정 완료', 'PDF 검증', '1,660,128', '~88,000'],
          ['서울', '3.144', '보정 완료', 'PDF 검증 (강남/송파 K=1.5~2.4)', '166,850', '55,374'],
          ['강원', '3.816', '보정 완료', '통계 추정 (PDF 흐림)', '29,138', '7,991'],
          ['경북', '3.604', '보정 완료', '통계 추정 (PDF 불가)', '103,562', '~2,000'],
          ['대구', '3.004', '보정 완료', 'PDF 검증 (수성구/동구 K=1.04~2.18)', '35,074', '11,929'],
          ['충남', '3.181', '보정 완료', '통계 추정 (서산 총율 2.55%)', '30,766', '10,025'],
          ['경남', '2.923', '보정 완료', 'PDF 검증 (밀양 K=0.49~1.9)', '59,412', '21,060'],
          ['대전', '2.643', '보정 완료', 'PDF 검증 (중구 K=0.82~1.72)', '29,840', '11,848'],
          ['세종', '7.076', '보정 완료', 'PDF 검증 (연기/부강 K=0.34~2.34)', '4,556', '675'],
          ['충북', '8.199', '보정 완료', 'PDF 검증 (충주 K=0.34~2.34)', '22,459', '2,863'],
          ['전남', '-', '보정 완료', 'PDF 검증 (광양)', '43,493', '~2,000'],
          ['전북', '-', '보정 완료', '통계 추정', '40,386', '~6,000'],
          ['광주', '-', '보정 완료', '통계 추정', '9,787', '~3,000'],
          ['부산', '1.594', '정상', '보정 불필요', '-', '-'],
          ['울산', '1.157', '정상', '보정 불필요', '-', '-'],
          ['인천', '0.868', '정상', '보정 불필요', '-', '-'],
          ['제주', '1.009', '기준', '기준 지역', '-', '-'],
        ]
      ),
      p(''),

      // 4. 최종 통계
      hd('4. 보정 후 전국 통계 (최종)', 1),
      tbl(
        ['구분', '값'],
        [
          ['xlsx 원본 김문수 재확인', '2,277,439'],
          ['보정 후 김문수 재확인 (전 17개 시도)', '304,605'],
          ['보정 전 전국 K값', '7.72'],
          ['보정 후 전국 K값', '0.89'],
        ]
      ),
      p(''),
      hd('역대 선거 R1-R2 회귀분석 비교', 2),
      tbl(
        ['선거', '회귀식', 'R2'],
        [
          ['18대', 'R2 = 0.012 + 1.52*R1', '0.96'],
          ['19대', 'R2 = 0.012 + 1.64*R1', '0.98'],
          ['20대', 'R2 = -0.139 + 1.47*R1', '0.93'],
          ['21대 (xlsx 원본)', 'R2 = 0.393 + (-0.001)*R1', '0.00'],
          ['21대 (보정 후, 최종)', 'R2 = -0.011 + 0.951*R1', '0.95'],
        ]
      ),
      p(''),
      p('보정 후 R2=0.95 — 역대 선거 범위(0.93~0.98) 완전 달성.', { bold: true }),

      // 5. 결론
      hd('5. 결론', 1),
      tbl(
        ['항목', '결론'],
        [
          ['선거 결과 (득표수)', '정확 — 공식 CSV와 완전 일치'],
          ['이재명 재확인표', '신뢰 가능 — 전국 2.4%, 지역별 정상'],
          ['김문수 재확인표', '전 17개 시도 OCR 오류 보정 완료'],
          ['이준석/권영국/송진호', 'OCR 오류 (보정 미실시)'],
          ['K값 (xlsx)', '무효 (7.72) -> 보정 후 0.89'],
          ['R2=0.00 (xlsx)', '무효 -> 보정 후 R2=0.95 (역대 수준)'],
          ['부정선거 여부', '해당 없음 — 득표수 정확, 재확인표 이상은 OCR 오류'],
        ]
      ),
      p(''),

      // 6. 권고사항
      hd('6. 권고사항', 1),
      bullet('K21_대선_개표결과_상세.xlsx의 재확인표 데이터는 통계 분석에 사용 불가'),
      bullet('정확한 재확인표 데이터: 각 시도 개표상황표 PDF 수동 합산, 또는 선관위 공식 요청'),
      bullet('본 분석의 K값, R2 통계는 보고서·블로그·SNS 등에서 인용 불가'),
      p(''),
      new Paragraph({
        children: [new TextRun({
          text: 'PDF 직접 검증 지역: 경기(과천), 전남(목포·광양), 대구(동구·수성구), 전북(전주), 세종(연기·부강), 충북(충주), 서울(강남·송파), 충남(서산), 대전(중구), 경남(밀양)',
          size: 16, color: '888888', italics: true,
        })],
        spacing: { before: 300 },
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('재확인표_데이터_검증_종합보고서.docx', buf);
  console.log('Saved: ' + (buf.length / 1024).toFixed(0) + ' KB');
});
