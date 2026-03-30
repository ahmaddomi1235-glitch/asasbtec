import { TawjihiCalcMode } from '../types';

interface Props {
  onSelect: (mode: TawjihiCalcMode) => void;
  onBack: () => void;
}

const modes: Array<{
  id: TawjihiCalcMode;
  icon: string;
  title: string;
  desc: string;
  color: string;
}> = [
  {
    id: 'spec-only',
    icon: '🎯',
    title: 'حساب معدل التوجيهي — تخصص فقط',
    desc: 'يختار الطالب تخصصه ويدخل تقديرات المواد، والنتيجة من 35 فقط',
    color: '#6366f1',
  },
  {
    id: 'shared-only',
    icon: '📚',
    title: 'حساب معدل المواد المشتركة فقط',
    desc: 'يدخل الطالب علامات العربي والإنجليزي والدين والتاريخ، والنتيجة من 30',
    color: '#22c55e',
  },
  {
    id: 'full-calc',
    icon: '🏆',
    title: 'حساب المعدل الكامل',
    desc: 'الأول ثانوي (35) + التوجيهي (35) + المشترك (30) = المعدل النهائي من 100',
    color: '#c9a227',
  },
];

export default function TawjihiModeSelector({ onSelect, onBack }: Props) {
  return (
    <div className="page-enter">
      <div className="section-header">
        <span className="section-eyebrow">التوجيهي — اختر نوع الحساب</span>
        <h2 className="section-title">
          ماذا تريد <span>أن تحسب؟</span>
        </h2>
        <p className="section-subtitle">
          اختر المسار المناسب لاحتياجك
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              background: 'var(--bg-card)',
              border: `2px solid ${mode.color}33`,
              borderRadius: 'var(--r-xl)',
              padding: '24px 28px',
              cursor: 'pointer',
              textAlign: 'right',
              transition: 'var(--t-normal)',
              width: '100%',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = mode.color;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${mode.color}33`;
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${mode.color}33`;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: `${mode.color}18`,
                border: `2px solid ${mode.color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                flexShrink: 0,
              }}
            >
              {mode.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}
              >
                {mode.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {mode.desc}
              </div>
            </div>
            <div style={{ color: mode.color, fontSize: 22, flexShrink: 0 }}>←</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button className="btn-back" onClick={onBack} style={{ minWidth: 160 }}>
          ← العودة لاختيار المرحلة
        </button>
      </div>
    </div>
  );
}
