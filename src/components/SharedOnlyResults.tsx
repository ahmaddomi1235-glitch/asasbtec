import { SharedResults } from '../types';
import { getPercentageLabel } from '../utils/calculations';
import { SHARED_SUBJECTS } from '../data/curriculum';

interface Props {
  results: SharedResults;
  onRestart: () => void;
}

export default function SharedOnlyResults({ results, onRestart }: Props) {
  const percentage = (results.total30 / 30) * 100;
  const { label: statusLabel, color: statusColor } = getPercentageLabel(percentage);

  const rows = [
    { name: SHARED_SUBJECTS[0].name, weighted: results.arabicWeighted,  max: 10 },
    { name: SHARED_SUBJECTS[1].name, weighted: results.englishWeighted, max: 10 },
    { name: SHARED_SUBJECTS[2].name, weighted: results.islamicWeighted, max: 6  },
    { name: SHARED_SUBJECTS[3].name, weighted: results.historyWeighted, max: 4  },
  ];

  return (
    <div className="page-enter results-wrap">
      {/* Summary card */}
      <div className="result-summary-card">
        <div className="result-badge">نتيجة المواد المشتركة</div>
        <div className="result-main-score">{results.total30.toFixed(3)}</div>
        <div className="result-max">من 30 درجة</div>
        <div
          className="result-status-pill"
          style={{
            background: `${statusColor}22`,
            color: statusColor,
            border: `1px solid ${statusColor}55`,
          }}
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

      {/* Breakdown */}
      <div className="shared-result-card">
        <div className="breakdown-header">📚 تفصيل المواد المشتركة</div>
        {rows.map(row => (
          <div key={row.name} className="shared-result-row">
            <span className="shared-result-name">{row.name}</span>
            <span className="shared-result-score">
              {row.weighted.toFixed(3)} / {row.max}
            </span>
          </div>
        ))}
        <div className="shared-result-row">
          <span style={{ fontWeight: 800, color: 'var(--gold)' }}>إجمالي المشترك</span>
          <span className="shared-result-score" style={{ fontSize: 18 }}>
            {results.total30.toFixed(3)} / 30
          </span>
        </div>
      </div>

      {/* Formula */}
      <div className="formula-box">
        <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: 8 }}>
          📐 المعادلة المستخدمة
        </strong>
        العربي = (العلامة ÷ 100) × 10<br />
        الإنجليزي = (العلامة ÷ 100) × 10<br />
        الدين = (العلامة ÷ 60) × 6<br />
        التاريخ = (العلامة ÷ 40) × 4<br />
        المجموع من 30
      </div>

      <div className="result-actions">
        <button className="btn-restart" onClick={onRestart}>↺ حساب جديد</button>
        <button className="btn-back" onClick={() => window.print()}>🖨️ طباعة</button>
      </div>
    </div>
  );
}
