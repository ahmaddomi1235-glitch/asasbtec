import { FinalResults, Grade } from '../types';
import { getPercentageLabel } from '../utils/calculations';
import { SHARED_SUBJECTS } from '../data/curriculum';

interface Props {
  results: FinalResults;
  onRestart: () => void;
  onAddShared: () => void;
}

const GRADE_VALUES: Record<Grade, number> = { U: 0, P: 60, M: 80, D: 100 };

function GradeChip({ grade }: { grade: Grade }) {
  return (
    <span className={`grade-chip grade-chip-${grade.toLowerCase()}`}>{grade}</span>
  );
}

export default function ResultsDisplay({ results, onRestart, onAddShared }: Props) {
  const { specialty, shared, finalGrade, finalPercentage, hasShared, allowAddShared, stageName, specName } = results;
  const maxGrade = hasShared ? 65 : 35;
  const { label: statusLabel, color: statusColor } = getPercentageLabel(finalPercentage);

  return (
    <div className="page-enter results-wrap">

      {/* ── Main result card ──────────────────────────── */}
      <div className="result-summary-card">
        <div className="result-badge">النتيجة النهائية · {stageName} · {specName}</div>
        <div className="result-main-score">{finalGrade.toFixed(2)}</div>
        <div className="result-max">من {maxGrade} درجة</div>
        <div
          className="result-status-pill"
          style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}55` }}
        >
          {statusLabel}
        </div>
        <div className="result-percentage" style={{ marginTop: 16 }}>
          النسبة المئوية النهائية:
          <strong style={{ color: 'var(--gold)', marginRight: 8, fontSize: 18 }}>
            {finalPercentage.toFixed(2)}%
          </strong>
        </div>
      </div>

      {/* ── Score grid ───────────────────────────────── */}
      <div className="result-grid">
        <div className="result-mini-card">
          <div className="result-mini-label">إجمالي نقاط التخصص</div>
          <div className="result-mini-value">{specialty.totalPoints.toLocaleString()}</div>
          <div className="result-mini-sub">من {(specialty.totalHours * 100).toLocaleString()} نقطة</div>
        </div>
        <div className="result-mini-card">
          <div className="result-mini-label">معدل التخصص من 100</div>
          <div className="result-mini-value">{specialty.average100.toFixed(2)}</div>
          <div className="result-mini-sub">%</div>
        </div>
        <div className="result-mini-card">
          <div className="result-mini-label">معدل التخصص من 35</div>
          <div className="result-mini-value" style={{ color: 'var(--gold-light)' }}>
            {specialty.average35.toFixed(2)}
          </div>
          <div className="result-mini-sub">من 35 درجة</div>
        </div>
        {hasShared && shared && (
          <div className="result-mini-card">
            <div className="result-mini-label">معدل المواد المشتركة</div>
            <div className="result-mini-value" style={{ color: 'var(--success)' }}>
              {shared.total30.toFixed(2)}
            </div>
            <div className="result-mini-sub">من 30 درجة</div>
          </div>
        )}
      </div>

      {/* ── Subject breakdown ────────────────────────── */}
      <div className="breakdown-card">
        <div className="breakdown-header">📋 تفصيل مواد التخصص</div>
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
            {specialty.subjectBreakdown.map(item => (
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
              <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--gold)' }}>{specialty.totalHours}</td>
              <td /><td />
              <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--gold)' }}>
                {specialty.totalPoints.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Shared breakdown ─────────────────────────── */}
      {hasShared && shared && (
        <div className="shared-result-card">
          <div className="breakdown-header">📚 تفصيل المواد المشتركة</div>
          {[
            { name: SHARED_SUBJECTS[0].name, score: shared.arabicWeighted,  max: 10 },
            { name: SHARED_SUBJECTS[1].name, score: shared.englishWeighted, max: 10 },
            { name: SHARED_SUBJECTS[2].name, score: shared.islamicWeighted, max: 6  },
            { name: SHARED_SUBJECTS[3].name, score: shared.historyWeighted, max: 4  },
          ].map(item => (
            <div key={item.name} className="shared-result-row">
              <span className="shared-result-name">{item.name}</span>
              <span className="shared-result-score">{item.score.toFixed(3)} / {item.max}</span>
            </div>
          ))}
          <div className="shared-result-row">
            <span style={{ fontWeight: 800, color: 'var(--gold)' }}>إجمالي المشترك</span>
            <span className="shared-result-score" style={{ fontSize: 18 }}>
              {shared.total30.toFixed(3)} / 30
            </span>
          </div>
        </div>
      )}

      {/* ── Formula ──────────────────────────────────── */}
      <div className="formula-box">
        <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: 8 }}>📐 المعادلة المستخدمة</strong>
        معدل التخصص/100 = إجمالي النقاط ÷ إجمالي الساعات<br />
        معدل التخصص/35 = (معدل/100 ÷ 100) × 35
        {hasShared && (
          <><br />المعدل النهائي = معدل التخصص/35 + معدل المشترك/30<br />
          النسبة المئوية = (المعدل النهائي ÷ 65) × 100</>
        )}
        {!hasShared && (
          <><br />النسبة المئوية = (معدل التخصص/35 ÷ 35) × 100</>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────── */}
      <div className="result-actions">
        <button className="btn-restart" onClick={onRestart}>↺ حساب جديد</button>
        {allowAddShared && !hasShared && (
          <button className="btn-back" onClick={onAddShared}>+ إضافة المواد المشتركة</button>
        )}
        <button className="btn-back" onClick={() => window.print()}>🖨️ طباعة النتائج</button>
      </div>
    </div>
  );
}
