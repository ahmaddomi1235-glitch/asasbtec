import { useEffect, useState } from 'react';

interface Props {
  onDone: () => void;
}

const DURATION = 5000; // 5 seconds

export default function SplashScreen({ onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (DURATION / 50));
        if (next >= 100) {
          clearInterval(interval);
          setExiting(true);
          setTimeout(onDone, 500);
          return 100;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onDone]);

  const remaining = Math.ceil(((100 - progress) / 100) * (DURATION / 1000));

  return (
    <div
      className="splash"
      style={{
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      <div className="splash-content">
        {/* Logo */}
        <div className="splash-logo-wrap">
          <div className="splash-logo-ring" />
          {!logoError ? (
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="شعار منصة أساس التعليمية"
              className="splash-logo"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="splash-logo-fallback">🎓</div>
          )}
        </div>

        {/* Titles */}
        <div>
          <h1 className="splash-title">أهلاً بك في منصة أساس التعليمية</h1>
          <p
            className="splash-subtitle"
            style={{ marginTop: '8px' }}
          >
            حاسبة معدل BTEC الاحترافية
          </p>
        </div>

        {/* Developer */}
        <div className="splash-developer">
          ✦ تم التطوير بواسطة الأستاذ أحمد دومي ✦
        </div>

        {/* Progress */}
        <div className="splash-progress-wrap">
          <div className="splash-progress-bar">
            <div
              className="splash-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="splash-countdown">
            {remaining > 0
              ? `جارٍ التحميل... ${remaining} ث`
              : 'جاهز!'}
          </span>
        </div>
      </div>

      {/* Skip button */}
      <div className="splash-exit">
        <button
          onClick={() => { setExiting(true); setTimeout(onDone, 300); }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(201,162,39,0.3)',
            color: 'var(--text-muted)',
            padding: '8px 20px',
            borderRadius: '999px',
            fontFamily: 'inherit',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'var(--t-normal)',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gold)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,162,39,0.3)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          تخطي الشاشة ←
        </button>
      </div>
    </div>
  );
}
