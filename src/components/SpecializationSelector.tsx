import { Specialization } from '../types';

interface Props {
  stageName: string;
  specializations: Specialization[];
  onSelect: (specId: string) => void;
  onBack: () => void;
  eyebrowExtra?: string;
}

const specIcons: Record<string, string> = {
  'تكنولوجيا المعلومات': '💻',
  'إدارة الأعمال':        '📊',
  'التجميل':              '💄',
  'الهندسة':              '🔧',
  'الكهرباء':             '⚡',
  'الميكانيك':            '⚙️',
  'تكنولوجيا السيارات':   '🚗',
};

function getSpecStats(spec: Specialization): { subjects: number; hours: number } {
  if (spec.subSpecs && spec.subSpecs.length > 0) {
    const subjects = spec.subSpecs.reduce((t, s) => t + s.subjects.length, 0);
    const hours    = spec.subSpecs.reduce((t, s) => t + s.subjects.reduce((h, m) => h + m.hours, 0), 0);
    return { subjects, hours };
  }
  return {
    subjects: spec.subjects.length,
    hours:    spec.subjects.reduce((t, m) => t + m.hours, 0),
  };
}

export default function SpecializationSelector({
  stageName,
  specializations,
  onSelect,
  onBack,
  eyebrowExtra,
}: Props) {
  return (
    <div className="page-enter">
      <div className="section-header">
        <span className="section-eyebrow">
          {stageName}{eyebrowExtra ? ` — ${eyebrowExtra}` : ''}
        </span>
        <h2 className="section-title">
          اختر <span>التخصص</span>
        </h2>
        <p className="section-subtitle">
          اختر تخصصك لعرض المواد الدراسية الخاصة به
        </p>
      </div>

      <div className="spec-grid">
        {specializations.map(spec => {
          const stats = getSpecStats(spec);
          const hasSubSpecs = !!(spec.subSpecs && spec.subSpecs.length > 0);

          return (
            <button
              key={spec.id}
              className="spec-card"
              onClick={() => onSelect(spec.id)}
            >
              <span className="spec-icon">{specIcons[spec.name] || '📚'}</span>
              <div className="spec-name">{spec.name}</div>
              {hasSubSpecs ? (
                <div className="spec-count">
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                    {spec.subSpecs!.length} تخصصات فرعية
                  </span>
                  <br />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {stats.subjects} مواد · {stats.hours} ساعة إجمالاً
                  </span>
                </div>
              ) : (
                <div className="spec-count">
                  {stats.subjects} مواد · {stats.hours} ساعة
                </div>
              )}
              {hasSubSpecs && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: 'var(--gold)',
                    background: 'var(--gold-dim)',
                    padding: '2px 10px',
                    borderRadius: 'var(--r-full)',
                    border: '1px solid var(--gold-border)',
                  }}
                >
                  اختر التخصص الفرعي ←
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button className="btn-back" onClick={onBack} style={{ minWidth: 160 }}>
          ← العودة
        </button>
      </div>
    </div>
  );
}
