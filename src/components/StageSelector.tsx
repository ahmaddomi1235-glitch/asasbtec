import { StageData } from '../types';

interface Props {
  stages: StageData[];
  onSelect: (stageId: string) => void;
}

const stageColors: Record<string, string> = {
  first: 'var(--info)',
  tawjihi: 'var(--gold)',
};

export default function StageSelector({ stages, onSelect }: Props) {
  return (
    <div className="page-enter">
      <div className="section-header">
        <span className="section-eyebrow">الخطوة الأولى</span>
        <h2 className="section-title">
          اختر <span>المرحلة الدراسية</span>
        </h2>
        <p className="section-subtitle">
          حدد مرحلتك الدراسية لعرض التخصصات المتاحة
        </p>
      </div>

      <div className="stage-grid">
        {stages.map(stage => (
          <button
            key={stage.id}
            className="stage-card"
            onClick={() => onSelect(stage.id)}
            style={{ cursor: 'pointer', background: 'var(--bg-card)' }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${stageColors[stage.id] || 'var(--gold)'}22, transparent)`,
                border: `2px solid ${stageColors[stage.id] || 'var(--gold)'}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                marginBottom: '8px',
              }}
            >
              {stage.icon}
            </div>
            <div className="stage-name">{stage.name}</div>
            <div className="stage-desc">{stage.description}</div>
            <div
              style={{
                marginTop: '4px',
                fontSize: '12px',
                color: stageColors[stage.id] || 'var(--gold)',
                fontWeight: 600,
              }}
            >
              {stage.specializations.length} تخصصات متاحة
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
