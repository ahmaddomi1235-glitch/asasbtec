import { Component, ErrorInfo, ReactNode } from 'react';
import { reportClientError } from '../utils/errorReporting';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message ?? 'خطأ غير معروف',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError(error, 'ErrorBoundary', {
      componentStack: info.componentStack ?? undefined,
    });

    // Remove the full-screen loader so our error UI is visible
    if (typeof window.__removeLoader === 'function') {
      window.__removeLoader();
    }
    // Cancel the load-failure timer
    if (typeof window.__cancelLoadTimer === 'function') {
      window.__cancelLoadTimer();
    }
  }

  handleReload() {
    try {
      window.localStorage.clear();
    } catch { /* ignore */ }
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#EEF3F7',
          fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif",
          direction: 'rtl',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px 24px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            border: '1px solid rgba(47,86,115,0.15)',
            boxSizing: 'border-box',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#1A2D3E',
              margin: '0 0 10px',
            }}>
              حدث خطأ في التطبيق
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#4A6170',
              margin: '0 0 8px',
              lineHeight: 1.7,
            }}>
              نأسف على ذلك. يمكنك تحديث الصفحة أو فتحها في نافذة خاصة.
            </p>
            <p style={{
              fontSize: '12px',
              color: '#7A95A6',
              margin: '0 0 24px',
              lineHeight: 1.6,
            }}>
              سيتم مسح البيانات المؤقتة تلقائيًا عند إعادة التحميل.
            </p>

            {/* Error detail — visible to user so they can share it */}
            {this.state.errorMessage && (
              <div style={{
                background: '#f5f7f9',
                border: '1px solid rgba(47,86,115,0.12)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '20px',
                textAlign: 'left',
                direction: 'ltr',
                fontSize: '11px',
                color: '#4A6170',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
              }}>
                {this.state.errorMessage}
              </div>
            )}

            <button
              onClick={() => this.handleReload()}
              style={{
                background: '#2F5673',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer',
                width: '100%',
                marginBottom: '12px',
              }}
            >
              إعادة تحميل التطبيق
            </button>

            <p style={{ fontSize: '11px', color: '#7A95A6', margin: 0 }}>
              إذا استمرت المشكلة، جرّب فتح الصفحة في نافذة خاصة (Incognito).
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
