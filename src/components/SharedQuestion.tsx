interface Props {
  specialtyAvg35: number;
  onAnswer: (wants: boolean) => void;
}

export default function SharedQuestion({ specialtyAvg35, onAnswer }: Props) {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
      <div className="section-header">
        <span className="section-eyebrow">الخطوة التالية</span>
        <h2 className="section-title">
          معدل التخصص: <span>{specialtyAvg35.toFixed(2)}</span> / 35
        </h2>
      </div>

      <div className="shared-question-card">
        <div className="shared-q-icon">📚</div>
        <h3 className="shared-q-title">المواد المشتركة</h3>
        <p className="shared-q-subtitle">
          هل ترغب في إضافة علامات المواد المشتركة؟
          <br />
          <strong style={{ color: 'var(--gold)' }}>
            (العربي + الإنجليزي + الدين + التاريخ)
          </strong>
          <br />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            لحساب المعدل النهائي الكلي من 65
          </span>
        </p>

        <div className="shared-q-btns">
          <button className="btn-yes" onClick={() => onAnswer(true)}>
            ✓ نعم، أضف المواد
          </button>
          <button className="btn-no" onClick={() => onAnswer(false)}>
            تخطي — اعرض من 35
          </button>
        </div>
      </div>
    </div>
  );
}
