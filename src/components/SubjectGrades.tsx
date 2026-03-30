import { Grade, Subject } from '../types';

interface Props {
  specName: string;
  stageName: string;
  subjects: Subject[];
  grades: Record<string, Grade | null>;
  onGradeChange: (subjectName: string, grade: Grade) => void;
  onCalculate: () => void;
  onBack: () => void;
  calcButtonLabel?: string;
}

const GRADE_OPTIONS: { value: Grade; label: string; desc: string }[] = [
  { value: 'U', label: 'U', desc: 'غير ناجح' },
  { value: 'P', label: 'P', desc: 'مقبول' },
  { value: 'M', label: 'M', desc: 'جيد' },
  { value: 'D', label: 'D', desc: 'مميز' },
];

export default function SubjectGrades({
  specName,
  stageName,
  subjects,
  grades,
  onGradeChange,
  onCalculate,
  onBack,
  calcButtonLabel,
}: Props) {
  const filledCount = subjects.filter(s => grades[s.name] !== null && grades[s.name] !== undefined).length;
  const allFilled = filledCount === subjects.length;
  const totalHours = subjects.reduce((s, m) => s + m.hours, 0);

  return (
    <div className="page-enter">
      <div className="section-header">
        <span className="section-eyebrow">{stageName} — {specName}</span>
        <h2 className="section-title">
          أدخل <span>التقديرات</span>
        </h2>
        <p className="section-subtitle">
          اختر تقدير كل مادة — يُعرض عدد الساعات بجانب كل مادة للمرجع
        </p>
      </div>

      {/* Grade Legend */}
      <div className="grade-legend">
        {GRADE_OPTIONS.map(g => (
          <div key={g.value} className="legend-item">
            <div
              className="legend-dot"
              style={{
                background:
                  g.value === 'U' ? 'var(--grade-u)' :
                  g.value === 'P' ? 'var(--grade-p)' :
                  g.value === 'M' ? 'var(--grade-m)' :
                  'var(--grade-d)',
              }}
            />
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{g.value}</span>
            <span>= {g.desc}</span>
            <span style={{ color: 'var(--gold)', fontSize: 11 }}>
              ({g.value === 'U' ? '0' : g.value === 'P' ? '60' : g.value === 'M' ? '80' : '100'})
            </span>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="subjects-header">
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
          مواد {specName}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginRight: 8 }}>
            ({totalHours} ساعة إجمالاً)
          </span>
        </div>
        <div className="subjects-progress">
          <span className="progress-text">
            {filledCount}/{subjects.length} مادة
          </span>
          <div className="progress-dots">
            {subjects.map((_, i) => (
              <div
                key={i}
                className={`progress-dot ${i < filledCount ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="subject-list">
        {subjects.map((subject, idx) => {
          const selectedGrade = grades[subject.name];
          const isGraded = !!selectedGrade;

          return (
            <div
              key={subject.name}
              className={`subject-row ${isGraded ? 'graded' : ''}`}
              style={{
                animationDelay: `${idx * 0.05}s`,
                animation: 'pageEnter 0.3s ease both',
              }}
            >
              {/* Subject info */}
              <div className="subject-info">
                <div className="subject-name">{subject.name}</div>
                <div className="subject-hours">
                  <span className="hours-badge">{subject.hours} ساعة</span>
                </div>
              </div>

              {/* Grade buttons */}
              <div className="grade-buttons">
                {GRADE_OPTIONS.map(g => (
                  <button
                    key={g.value}
                    className={`grade-btn grade-btn-${g.value.toLowerCase()} ${
                      selectedGrade === g.value ? 'active' : ''
                    }`}
                    onClick={() => onGradeChange(subject.name, g.value)}
                    title={g.desc}
                    aria-label={`${g.desc} للمادة ${subject.name}`}
                  >
                    {g.value}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint if not all filled */}
      {!allFilled && (
        <p
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
            marginTop: 12,
          }}
        >
          يرجى إدخال تقدير لجميع المواد ({subjects.length - filledCount} متبقية)
        </p>
      )}

      {/* Calculate button */}
      <button
        className="calculate-btn"
        onClick={onCalculate}
        disabled={!allFilled}
      >
        {allFilled
        ? (calcButtonLabel ?? '✓ احسب معدل التخصص')
        : `أدخل تقديرات ${subjects.length - filledCount} مادة متبقية`}
      </button>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <button className="btn-back" onClick={onBack}>
          ← العودة لاختيار التخصص
        </button>
      </div>
    </div>
  );
}
