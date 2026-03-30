import { useState } from 'react';
import { AppStep } from '../types';

interface Props {
  currentStep: AppStep;
  onReset: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function getStepLabel(step: AppStep): string {
  const map: Partial<Record<AppStep, string>> = {
    stage:                    'المرحلة',
    'tawjihi-mode':           'نوع الحساب',
    specialization:           'التخصص',
    'engineering-sub':        'تخصص الهندسة',
    grades:                   'التقديرات',
    'shared-question':        'المشترك؟',
    shared:                   'المواد المشتركة',
    results:                  'النتائج',
    'tawjihi-shared-only':    'المواد المشتركة',
    'tawjihi-shared-results': 'النتائج',
    'full-first-spec':        'الأول ثانوي / التخصص',
    'full-first-grades':      'الأول ثانوي / التقديرات',
    'full-tawjihi-spec':      'التوجيهي / التخصص',
    'full-tawjihi-sub':       'التوجيهي / الهندسة',
    'full-tawjihi-grades':    'التوجيهي / التقديرات',
    'full-shared':            'المواد المشتركة',
    'full-results':           'النتائج',
  };
  return map[step] ?? '';
}

const FIRST_YEAR_STEPS: AppStep[]   = ['stage', 'specialization', 'grades', 'results'];
const TAWJIHI_MODE1_STEPS: AppStep[] = ['stage', 'tawjihi-mode', 'specialization', 'grades', 'results'];
const TAWJIHI_MODE2_STEPS: AppStep[] = ['stage', 'tawjihi-mode', 'tawjihi-shared-only', 'tawjihi-shared-results'];
const TAWJIHI_MODE3_STEPS: AppStep[] = [
  'stage', 'tawjihi-mode',
  'full-first-spec', 'full-first-grades',
  'full-tawjihi-spec', 'full-tawjihi-grades',
  'full-shared', 'full-results',
];

function getFlowSteps(step: AppStep): AppStep[] {
  if (['full-first-spec','full-first-grades','full-tawjihi-spec','full-tawjihi-sub',
       'full-tawjihi-grades','full-shared','full-results'].includes(step)) return TAWJIHI_MODE3_STEPS;
  if (['tawjihi-shared-only','tawjihi-shared-results'].includes(step)) return TAWJIHI_MODE2_STEPS;
  if (step === 'tawjihi-mode') return TAWJIHI_MODE1_STEPS;
  if (['specialization','engineering-sub','grades','shared-question','shared','results'].includes(step))
    return FIRST_YEAR_STEPS;
  return [];
}

const LOGO_URL = `${import.meta.env.BASE_URL}logo.png`;

export default function Header({ currentStep, onReset, theme, onToggleTheme }: Props) {
  const [logoError, setLogoError] = useState(false);

  const flowSteps  = getFlowSteps(currentStep);
  const currentIdx = flowSteps.indexOf(currentStep);

  return (
    <header className="header">
      <div className="header-inner">

        {/* ── Brand ─────────────────────────────────────── */}
        <div className="header-brand">
          {!logoError ? (
            <img
              src={LOGO_URL}
              alt="أساس مهني"
              className="header-logo"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="header-logo-fallback">🎓</div>
          )}
          <div className="header-text">
            <h1>أساس مهني</h1>
            <p>حاسبة معدل BTEC</p>
          </div>
        </div>

        {/* ── Breadcrumb ────────────────────────────────── */}
        {flowSteps.length > 0 && (
          <div className="breadcrumb" style={{ margin: 0 }}>
            {flowSteps.map((s, i) => {
              const idx     = flowSteps.indexOf(s);
              const isDone  = idx < currentIdx;
              const isActive = s === currentStep ||
                (currentStep === 'engineering-sub'  && s === 'specialization') ||
                (currentStep === 'shared-question'  && s === 'grades') ||
                (currentStep === 'shared'           && s === 'grades') ||
                (currentStep === 'full-tawjihi-sub' && s === 'full-tawjihi-spec');
              return (
                <span key={`${s}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>◀</span>}
                  <span
                    className={`breadcrumb-item ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                  >
                    {isDone ? '✓' : ''} {getStepLabel(s)}
                  </span>
                </span>
              );
            })}
          </div>
        )}

        {/* ── Actions ───────────────────────────────────── */}
        <div className="header-actions">

          {/* Instagram */}
          <a
            href="https://www.instagram.com/ahmaddomiedu?igsh=bDlmaDh5a3F0em1h"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 13px',
              background: 'rgba(225,48,108,0.08)',
              border: '1px solid rgba(225,48,108,0.25)',
              color: '#e1306c',
              borderRadius: 'var(--r-full)',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'var(--t-normal)',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(225,48,108,0.18)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(225,48,108,0.55)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(225,48,108,0.08)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(225,48,108,0.25)';
            }}
          >
            📷 تواصل
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/962799331334"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 13px',
              background: 'rgba(37,211,102,0.08)',
              border: '1px solid rgba(37,211,102,0.25)',
              color: '#25d366',
              borderRadius: 'var(--r-full)',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'var(--t-normal)',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(37,211,102,0.18)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(37,211,102,0.55)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(37,211,102,0.08)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(37,211,102,0.25)';
            }}
          >
            💬 طلب البطاقة
          </a>

          {/* Theme toggle */}
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'تبديل للوضع الفاتح' : 'تبديل للوضع الداكن'}
            title={theme === 'dark' ? 'وضع فاتح' : 'وضع داكن'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Reset */}
          {currentStep !== 'stage' && (
            <button className="header-reset-btn" onClick={onReset}>
              ↺ بدء جديد
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
