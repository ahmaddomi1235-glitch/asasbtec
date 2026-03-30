import { SubSpecialization } from '../types';

interface Props {
  subSpecs: SubSpecialization[];
  onSelect: (subSpecId: string) => void;
  onBack: () => void;
  contextLabel?: string;
}

const subSpecIcons: Record<string, string> = {
  'الكهرباء':          '⚡',
  'الميكانيك':         '⚙️',
  'تكنولوجيا السيارات': '🚗',
};

export default function EngineeringSubSelector({
  subSpecs,
  onSelect,
  onBack,
  contextLabel = 'التوجيهي — الهندسة',
}: Props) {
  return (
    <div className="page-enter">
      <div className="section-header">
        <span className="section-eyebrow">{contextLabel}</span>
        <h2 className="section-title">
          اختر <span>تخصص الهندسة</span>
        </h2>
        <p className="section-subtitle">
          حدد التخصص الهندسي الخاص بك
        </p>
      </div>

      <div className="spec-grid" style={{ maxWidth: 640, margin: '0 auto' }}>
        {subSpecs.map(sub => {
          const totalHours = sub.subjects.reduce((s, m) => s + m.hours, 0);
          return (
            <button
              key={sub.id}
              className="spec-card"
              onClick={() => onSelect(sub.id)}
            >
              <span className="spec-icon">{subSpecIcons[sub.name] || '🔧'}</span>
              <div className="spec-name">{sub.name}</div>
              <div className="spec-count">
                {sub.subjects.length} مواد · {totalHours} ساعة
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button className="btn-back" onClick={onBack}>
          ← العودة لاختيار التخصص
        </button>
      </div>
    </div>
  );
}
