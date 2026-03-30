import { SharedGrades } from '../types';
import { SHARED_SUBJECTS } from '../data/curriculum';

interface Props {
  grades: SharedGrades;
  onChange: (field: keyof SharedGrades, value: string) => void;
  onCalculate: () => void;
  onBack: () => void;
  submitLabel?: string;
}

const fieldKeys: Array<keyof SharedGrades> = ['arabic', 'english', 'islamic', 'history'];

function isValidGrade(value: string, max: number): boolean {
  const n = parseFloat(value);
  return !isNaN(n) && n >= 0 && n <= max;
}

export default function SharedSubjectsForm({ grades, onChange, onCalculate, onBack, submitLabel }: Props) {
  const allValid = SHARED_SUBJECTS.every((s, i) => {
    const val = grades[fieldKeys[i]];
    return val !== '' && isValidGrade(val, s.maxMark);
  });

  return (
    <div className="page-enter">
      <div className="section-header">
        <span className="section-eyebrow">المواد المشتركة</span>
        <h2 className="section-title">
          أدخل <span>العلامات الرقمية</span>
        </h2>
        <p className="section-subtitle">
          أدخل العلامة الفعلية لكل مادة مشتركة
        </p>
      </div>

      <div className="shared-form">
        {SHARED_SUBJECTS.map((subject, idx) => {
          const key = fieldKeys[idx];
          const val = grades[key];
          const valid = val !== '' && isValidGrade(val, subject.maxMark);
          const invalid = val !== '' && !isValidGrade(val, subject.maxMark);

          return (
            <div key={subject.id} className="shared-subject-row">
              <div className="shared-subject-info">
                <div className="shared-subject-name">{subject.name}</div>
                <div className="shared-subject-meta">
                  <span className="meta-badge">من {subject.maxMark}</span>
                  <span className="meta-badge">يُحسب من {subject.weight}</span>
                </div>
              </div>

              <div className="shared-input-wrap">
                <input
                  type="number"
                  className={`shared-input ${valid ? 'valid' : ''} ${invalid ? 'invalid' : ''}`}
                  placeholder="0"
                  min={0}
                  max={subject.maxMark}
                  value={val}
                  onChange={e => onChange(key, e.target.value)}
                />
                <span className="shared-input-max">/ {subject.maxMark}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!allValid && (
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          يرجى إدخال جميع العلامات بشكل صحيح
        </p>
      )}

      <button
        className="calculate-btn"
        onClick={onCalculate}
        disabled={!allValid}
        style={{ marginTop: 20 }}
      >
        {allValid ? (submitLabel ?? '✓ احسب المعدل النهائي') : 'أدخل جميع العلامات'}
      </button>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <button className="btn-back" onClick={onBack}>
          ← العودة
        </button>
      </div>
    </div>
  );
}
