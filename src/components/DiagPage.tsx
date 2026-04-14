/**
 * DiagPage — Network & Environment Diagnostic Screen
 *
 * Accessible at: <origin>/diag  (works on any domain — custom or vercel.app)
 * The SPA rewrite forwards /diag → index.html → React detects the path
 * and renders this component instead of the normal app.
 *
 * Designed to help identify WHY the app fails on a specific network:
 *  - DNS/network block (ISP filtering of the deployment domain)
 *  - Google Fonts blocking (was render-blocking before fix)
 *  - Asset loading failures
 *  - localStorage unavailability (Private Browsing quirks)
 *  - Same-origin API reachability
 */

import { useEffect, useRef, useState } from 'react';

type Status = 'pending' | 'ok' | 'warn' | 'fail';

interface CheckResult {
  label: string;
  status: Status;
  detail: string;
  ms?: number;
}

const S: Record<Status, { icon: string; color: string }> = {
  pending: { icon: '⏳', color: '#7A95A6' },
  ok:      { icon: '✅', color: '#10b981' },
  warn:    { icon: '⚠️',  color: '#f59e0b' },
  fail:    { icon: '❌', color: '#ef4444' },
};

async function timeIt<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const t0 = performance.now();
  const result = await fn();
  return { result, ms: Math.round(performance.now() - t0) };
}

export default function DiagPage() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const ran = useRef(false);

  function push(c: CheckResult) {
    setChecks(prev => {
      const idx = prev.findIndex(x => x.label === c.label);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = c;
        return next;
      }
      return [...prev, c];
    });
  }

  async function runChecks() {
    setRunning(true);
    setDone(false);

    // ── 1. Environment ──────────────────────────────────────────────────────
    push({
      label: 'المتصفح / الجهاز',
      status: 'ok',
      detail: navigator.userAgent.slice(0, 120),
    });

    push({
      label: 'العنوان الحالي',
      status: 'ok',
      detail: window.location.href,
    });

    push({
      label: 'البروتوكول',
      status: window.location.protocol === 'https:' ? 'ok' : 'warn',
      detail: window.location.protocol === 'https:'
        ? 'HTTPS ✓'
        : 'HTTP (غير آمن — قد يمنع بعض المتصفحات من تنفيذ scripts)',
    });

    // ── 2. localStorage ─────────────────────────────────────────────────────
    try {
      const k = '__diag_test__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      push({ label: 'localStorage', status: 'ok', detail: 'يعمل بشكل طبيعي' });
    } catch (e) {
      push({
        label: 'localStorage',
        status: 'warn',
        detail: `غير متاح: ${e instanceof Error ? e.message : String(e)} — قد يكون النافذة الخاصة أو الكوتا ممتلئة`,
      });
    }

    // ── 3. Same-origin API (/api/health) ────────────────────────────────────
    push({ label: '/api/health (نفس الخادم)', status: 'pending', detail: 'جارٍ الاختبار...' });
    try {
      const { result: resp, ms } = await timeIt(() =>
        fetch('/api/health', { cache: 'no-store' })
      );
      if (resp.ok) {
        const data = await resp.json() as { ok: boolean; region?: string };
        push({
          label: '/api/health (نفس الخادم)',
          status: 'ok',
          detail: `HTTP ${resp.status} — منطقة Vercel: ${data.region ?? '?'}`,
          ms,
        });
      } else {
        push({
          label: '/api/health (نفس الخادم)',
          status: 'warn',
          detail: `HTTP ${resp.status} — الخادم يستجيب لكن بخطأ`,
          ms,
        });
      }
    } catch (e) {
      push({
        label: '/api/health (نفس الخادم)',
        status: 'fail',
        detail: `فشل الاتصال: ${e instanceof Error ? e.message : String(e)} — محتمل حجب الشبكة لهذا الدومين من مزود الإنترنت`,
      });
    }

    // ── 4. Google Fonts reachability ────────────────────────────────────────
    push({ label: 'Google Fonts (fonts.googleapis.com)', status: 'pending', detail: 'جارٍ الاختبار...' });
    try {
      const { result: resp, ms } = await timeIt(() =>
        fetch(
          'https://fonts.googleapis.com/css2?family=Cairo:wght@400&display=swap',
          { cache: 'no-store', mode: 'no-cors' }
        )
      );
      // no-cors always returns type=opaque with status 0 if it succeeded
      push({
        label: 'Google Fonts (fonts.googleapis.com)',
        status: ms > 3000 ? 'warn' : 'ok',
        detail: ms > 3000
          ? `بطيء جداً (${ms}ms) — هذا يسبب تأخير في تحميل الصفحة على هذه الشبكة`
          : `يستجيب خلال ${ms}ms — لا مشكلة`,
        ms,
      });
      void resp;
    } catch (e) {
      push({
        label: 'Google Fonts (fonts.googleapis.com)',
        status: 'fail',
        detail: `محجوب أو غير متاح: ${e instanceof Error ? e.message : String(e)} — الخط سيكون خط النظام (Cairo لن يظهر، لكن التطبيق يعمل)`,
      });
    }

    // ── 5. Main JS asset ────────────────────────────────────────────────────
    push({ label: 'ملف JavaScript الرئيسي', status: 'pending', detail: 'جارٍ التحقق...' });
    try {
      // Find the main script src from the document
      const mainScript = document.querySelector('script[type="module"][src*="/assets/index-"]') as HTMLScriptElement | null;
      if (mainScript?.src) {
        const { result: resp, ms } = await timeIt(() =>
          fetch(mainScript.src, { method: 'HEAD', cache: 'no-store' })
        );
        push({
          label: 'ملف JavaScript الرئيسي',
          status: resp.ok ? 'ok' : 'fail',
          detail: resp.ok
            ? `HTTP ${resp.status} — يُحمَّل بشكل طبيعي (${ms}ms)`
            : `HTTP ${resp.status} — فشل تحميل الأصول!`,
          ms,
        });
      } else {
        // Script already loaded (we're running), just confirm
        push({
          label: 'ملف JavaScript الرئيسي',
          status: 'ok',
          detail: 'محمّل بالفعل (التطبيق يعمل)',
        });
      }
    } catch (e) {
      push({
        label: 'ملف JavaScript الرئيسي',
        status: 'fail',
        detail: `${e instanceof Error ? e.message : String(e)}`,
      });
    }

    // ── 6. CSS asset ────────────────────────────────────────────────────────
    const cssLink = document.querySelector('link[rel="stylesheet"][href*="/assets/"]') as HTMLLinkElement | null;
    if (cssLink?.sheet) {
      push({ label: 'ملف CSS الرئيسي', status: 'ok', detail: 'محمّل ومطبّق بالفعل' });
    } else {
      push({ label: 'ملف CSS الرئيسي', status: 'warn', detail: 'لم يُرصد stylesheet — قد يكون محجوباً' });
    }

    // ── 7. Online status ────────────────────────────────────────────────────
    push({
      label: 'حالة الاتصال (navigator.onLine)',
      status: navigator.onLine ? 'ok' : 'fail',
      detail: navigator.onLine
        ? 'متصل بالإنترنت'
        : 'غير متصل — المتصفح يُبلّغ عن انقطاع الإنترنت',
    });

    // ── 8. IPv6 probe ────────────────────────────────────────────────────────
    push({ label: 'اختبار IPv6', status: 'pending', detail: 'جارٍ الاختبار...' });
    try {
      // ipv6.google.com only resolves over IPv6; failure means no IPv6 path
      const { result: r, ms } = await timeIt(() =>
        fetch('https://ipv6.google.com', { mode: 'no-cors', cache: 'no-store' })
      );
      push({
        label: 'اختبار IPv6',
        status: 'ok',
        detail: `IPv6 يعمل (${ms}ms)`,
        ms,
      });
      void r;
    } catch {
      push({
        label: 'اختبار IPv6',
        status: 'warn',
        detail: 'IPv6 غير متاح أو محجوب — هذا طبيعي على كثير من الشبكات وليس مشكلة',
      });
    }

    setRunning(false);
    setDone(true);
  }

  useEffect(() => {
    if (!ran.current) {
      ran.current = true;
      void runChecks();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const failed  = checks.filter(c => c.status === 'fail').length;
  const warned  = checks.filter(c => c.status === 'warn').length;

  const diagText = checks
    .filter(c => c.status !== 'pending')
    .map(c => `[${c.status.toUpperCase()}] ${c.label}: ${c.detail}${c.ms != null ? ` (${c.ms}ms)` : ''}`)
    .join('\n');

  function copyDiag() {
    const full = `=== أساس مهني — تشخيص شبكة ===\n${new Date().toISOString()}\n\n${diagText}`;
    navigator.clipboard?.writeText(full).catch(() => {
      prompt('انسخ النص التالي وأرسله للدعم الفني:', full);
    });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#EEF3F7',
      fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif",
      direction: 'rtl',
      padding: '20px 16px 40px',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '20px 20px 16px',
          marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          border: '1px solid rgba(47,86,115,0.12)',
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A2D3E', margin: '0 0 6px' }}>
            🔍 صفحة تشخيص الشبكة
          </h1>
          <p style={{ fontSize: 13, color: '#4A6170', margin: 0, lineHeight: 1.6 }}>
            إذا كان الموقع لا يعمل معك، هذه الصفحة تكشف السبب بدقة.
            انسخ النتائج وأرسلها للدعم الفني.
          </p>
        </div>

        {/* Summary banner */}
        {done && (
          <div style={{
            background: failed > 0 ? 'rgba(239,68,68,0.08)' : warned > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
            border: `1px solid ${failed > 0 ? '#fca5a5' : warned > 0 ? '#fcd34d' : '#6ee7b7'}`,
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 14,
            fontSize: 13,
            color: '#1A2D3E',
            fontWeight: 600,
          }}>
            {failed > 0
              ? `❌ ${failed} مشكلة حرجة — المشكلة الأرجح: حجب الشبكة أو ISP filtering`
              : warned > 0
              ? `⚠️ ${warned} تحذير — الاتصال يعمل لكن بعض الخدمات بطيئة أو محدودة`
              : '✅ كل الفحوصات نجحت — المشكلة ليست في الشبكة الحالية'}
          </div>
        )}

        {/* Checks list */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          border: '1px solid rgba(47,86,115,0.12)',
          marginBottom: 14,
        }}>
          {checks.length === 0 && (
            <div style={{ padding: 20, color: '#7A95A6', fontSize: 13, textAlign: 'center' }}>
              جارٍ تشغيل الفحوصات...
            </div>
          )}
          {checks.map((c, i) => (
            <div key={c.label} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 16px',
              borderBottom: i < checks.length - 1 ? '1px solid rgba(47,86,115,0.07)' : 'none',
            }}>
              <span style={{ fontSize: 16, lineHeight: 1.5, flexShrink: 0 }}>
                {S[c.status].icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2D3E', marginBottom: 2 }}>
                  {c.label}
                  {c.ms != null && (
                    <span style={{ fontWeight: 400, color: '#7A95A6', fontSize: 11, marginRight: 6 }}>
                      {c.ms}ms
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: S[c.status].color, lineHeight: 1.5, wordBreak: 'break-word', direction: 'ltr', textAlign: 'left' }}>
                  {c.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setChecks([]); ran.current = false; void runChecks(); }}
            disabled={running}
            style={{
              flex: 1,
              minWidth: 120,
              background: '#2F5673',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '11px 20px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: running ? 'not-allowed' : 'pointer',
              opacity: running ? 0.6 : 1,
            }}
          >
            {running ? 'جارٍ الفحص...' : '🔄 إعادة الفحص'}
          </button>

          {done && (
            <button
              onClick={copyDiag}
              style={{
                flex: 1,
                minWidth: 120,
                background: 'transparent',
                color: '#2F5673',
                border: '1px solid #2F5673',
                borderRadius: 999,
                padding: '11px 20px',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              📋 نسخ النتائج
            </button>
          )}

          <a
            href="/"
            style={{
              flex: 1,
              minWidth: 120,
              background: 'transparent',
              color: '#7A95A6',
              border: '1px solid rgba(47,86,115,0.2)',
              borderRadius: 999,
              padding: '11px 20px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'inline-block',
              boxSizing: 'border-box',
            }}
          >
            ← العودة للتطبيق
          </a>
        </div>

        {/* Footer note — uses window.location.origin so it works on any domain */}
        <p style={{ fontSize: 11, color: '#7A95A6', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          أرسل رابط هذه الصفحة للطالب الذي يعاني من مشكلة:<br />
          <span
            style={{ direction: 'ltr', display: 'inline-block', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              const url = `${window.location.origin}/diag`;
              navigator.clipboard?.writeText(url).catch(() => {});
            }}
            title="انقر للنسخ"
          >
            {typeof window !== 'undefined' ? `${window.location.origin}/diag` : '/diag'}
          </span>
        </p>

      </div>
    </div>
  );
}
