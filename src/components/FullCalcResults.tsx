import { FullCalcResults as FullCalcResultsType, Grade } from '../types';
import { getPercentageLabel } from '../utils/calculations';
import { SHARED_SUBJECTS } from '../data/curriculum';

interface Props {
  results: FullCalcResultsType;
  onRestart: () => void;
}

const GRADE_VALUES: Record<Grade, number> = { U: 0, P: 60, M: 80, D: 100 };

function GradeChip({ grade }: { grade: Grade }) {
  return (
    <span className={`grade-chip grade-chip-${grade.toLowerCase()}`}>{grade}</span>
  );
}

function SpecBreakdownTable({
  breakdown,
  totalHours,
  totalPoints,
}: {
  breakdown: FullCalcResultsType['firstYear']['subjectBreakdown'];
  totalHours: number;
  totalPoints: number;
}) {
  return (
    <table className="breakdown-table">
      <thead>
        <tr>
          <th>المادة</th>
          <th style={{ textAlign: 'center' }}>الساعات</th>
          <th style={{ textAlign: 'center' }}>التقدير</th>
          <th style={{ textAlign: 'center' }}>القيمة</th>
          <th style={{ textAlign: 'center' }}>النقاط</th>
        </tr>
      </thead>
      <tbody>
        {breakdown.map(item => (
          <tr key={item.name}>
            <td>{item.name}</td>
            <td style={{ textAlign: 'center' }}>{item.hours}</td>
            <td style={{ textAlign: 'center' }}><GradeChip grade={item.grade} /></td>
            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{GRADE_VALUES[item.grade]}</td>
            <td style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 700 }}>
              {item.points.toLocaleString()}
            </td>
          </tr>
        ))}
        <tr style={{ background: 'var(--gold-dim)' }}>
          <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>الإجمالي</td>
          <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--gold)' }}>{totalHours}</td>
          <td /><td />
          <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--gold)' }}>
            {totalPoints.toLocaleString()}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function SectionCard({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${color}33`,
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
      }}
    >
      <div
        className="breakdown-header"
        style={{ background: `${color}18`, color, borderColor: `${color}33` }}
      >
        {icon} {title}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

export default function FullCalcResults({ results, onRestart }: Props) {
  const { firstYear, firstYearSpecName, tawjihi, tawjihiSpecName, shared, finalGrade } = results;
  const percentage = (finalGrade / 100) * 100;
  const { label: statusLabel, color: statusColor } = getPercentageLabel(percentage);

  const sharedRows = [
    { name: SHARED_SUBJECTS[0].name, score: shared.arabicWeighted,  max: 10 },
    { name: SHARED_SUBJECTS[1].name, score: shared.englishWeighted, max: 10 },
    { name: SHARED_SUBJECTS[2].name, score: shared.islamicWeighted, max: 6  },
    { name: SHARED_SUBJECTS[3].name, score: shared.historyWeighted, max: 4  },
  ];

  return (
    <div className="page-enter results-wrap">

      {/* ── Grand total card ────────────────────────────── */}
      <div className="result-summary-card">
        <div className="result-badge">المعدل النهائي الكامل</div>
        <div className="result-main-score">{finalGrade.toFixed(3)}</div>
        <div className="result-max">من 100 درجة</div>
        <div
          className="result-status-pill"
          style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}55` }}
        >
          {statusLabel}
        </div>
        <div className="result-percentage" style={{ marginTop: 16 }}>
          النسبة المئوية:
          <strong style={{ color: 'var(--gold)', marginRight: 8, fontSize: 18 }}>
            {percentage.toFixed(2)}%
          </strong>
        </div>
      </div>

      {/* ── Summary grid ───────────────────────────────── */}
      <div className="result-grid">
        <div className="result-mini-card">
          <div className="result-mini-label">الأول ثانوي / 35</div>
          <div className="result-mini-value" style={{ color: 'var(--info)' }}>
            {firstYear.average35.toFixed(2)}
          </div>
          <div className="result-mini-sub">{firstYearSpecName}</div>
        </div>
        <div className="result-mini-card">
          <div className="result-mini-label">التوجيهي / 35</div>
          <div className="result-mini-value" style={{ color: 'var(--gold-light)' }}>
            {tawjihi.average35.toFixed(2)}
          </div>
          <div className="result-mini-sub">{tawjihiSpecName}</div>
        </div>
        <div className="result-mini-card">
          <div className="result-mini-label">المواد المشتركة / 30</div>
          <div className="result-mini-value" style={{ color: 'var(--success)' }}>
            {shared.total30.toFixed(3)}
          </div>
          <div className="result-mini-sub">عربي + إنجليزي + دين + تاريخ</div>
        </div>
        <div className="result-mini-card">
          <div className="result-mini-label">المجموع الكلي / 100</div>
          <div className="result-mini-value">{finalGrade.toFixed(3)}</div>
          <div className="result-mini-sub">{percentage.toFixed(2)}%</div>
        </div>
      </div>

      {/* ── First year breakdown ────────────────────────── */}
      <SectionCard title={`تفصيل الأول ثانوي — ${firstYearSpecName}`} icon="🎓" color="var(--info)">
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            إجمالي النقاط: <strong style={{ color: 'var(--gold)' }}>{firstYear.totalPoints.toLocaleString()}</strong>
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            المعدل/100: <strong style={{ color: 'var(--gold)' }}>{firstYear.average100.toFixed(2)}</strong>
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            المعدل/35: <strong style={{ color: 'var(--gold)' }}>{firstYear.average35.toFixed(2)}</strong>
          </span>
        </div>
        <div className="breakdown-card" style={{ border: 'none', borderRadius: 'var(--r-md)' }}>
          <SpecBreakdownTable
            breakdown={firstYear.subjectBreakdown}
            totalHours={firstYear.totalHours}
            totalPoints={firstYear.totalPoints}
          />
        </div>
      </SectionCard>

      {/* ── Tawjihi breakdown ───────────────────────────── */}
      <SectionCard title={`تفصيل التوجيهي — ${tawjihiSpecName}`} icon="🏆" color="var(--gold)">
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            إجمالي النقاط: <strong style={{ color: 'var(--gold)' }}>{tawjihi.totalPoints.toLocaleString()}</strong>
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            المعدل/100: <strong style={{ color: 'var(--gold)' }}>{tawjihi.average100.toFixed(2)}</strong>
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            المعدل/35: <strong style={{ color: 'var(--gold)' }}>{tawjihi.average35.toFixed(2)}</strong>
          </span>
        </div>
        <div className="breakdown-card" style={{ border: 'none', borderRadius: 'var(--r-md)' }}>
          <SpecBreakdownTable
            breakdown={tawjihi.subjectBreakdown}
            totalHours={tawjihi.totalHours}
            totalPoints={tawjihi.totalPoints}
          />
        </div>
      </SectionCard>

      {/* ── Shared breakdown ────────────────────────────── */}
      <SectionCard title="تفصيل المواد المشتركة" icon="📚" color="var(--success)">
        {sharedRows.map(row => (
          <div key={row.name} className="shared-result-row">
            <span className="shared-result-name">{row.name}</span>
            <span className="shared-result-score">{row.score.toFixed(3)} / {row.max}</span>
          </div>
        ))}
        <div className="shared-result-row">
          <span style={{ fontWeight: 800, color: 'var(--gold)' }}>إجمالي المشترك</span>
          <span className="shared-result-score" style={{ fontSize: 18 }}>
            {shared.total30.toFixed(3)} / 30
          </span>
        </div>
      </SectionCard>

      {/* ── Formula ─────────────────────────────────────── */}
      <div className="formula-box">
        <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: 8 }}>📐 المعادلة المستخدمة</strong>
        الأول ثانوي/35 = (مجموع النقاط ÷ إجمالي الساعات ÷ 100) × 35<br />
        التوجيهي/35 = (مجموع النقاط ÷ إجمالي الساعات ÷ 100) × 35<br />
        المشترك/30 = عربي(10) + إنجليزي(10) + دين(6) + تاريخ(4)<br />
        <strong style={{ color: 'var(--gold-light)' }}>
          المعدل النهائي = الأول ثانوي(35) + التوجيهي(35) + المشترك(30) = من 100
        </strong>
      </div>

      <div className="result-actions">
        <button className="btn-restart" onClick={onRestart}>↺ حساب جديد</button>
        <button className="btn-back" onClick={() => window.print()}>🖨️ طباعة النتائج</button>
      </div>
    </div>
  );
}
