import { Component, ErrorInfo, ReactNode } from 'react';

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
    return { hasError: true, errorMessage: error.message || 'خطأ غير معروف' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload() {
    try {
      window.localStorage.clear();
    } catch (_) { /* ignore */ }
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
          fontFamily: "'Cairo', 'Segoe UI', sans-serif",
          direction: 'rtl',
          textAlign: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px 24px',
            maxWidth: '380px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            border: '1px solid rgba(47,86,115,0.15)',
          }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#1A2D3E',
              marginBottom: '10px',
            }}>
              حدث خطأ في التطبيق
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#4A6170',
              marginBottom: '24px',
              lineHeight: 1.7,
            }}>
              نأسف على هذا الخطأ. سيتم مسح البيانات المؤقتة وإعادة تحميل الصفحة.
            </p>
            <button
              onClick={() => this.handleReload()}
              style={{
                background: '#2F5673',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '12px 32px',
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              إعادة تحميل التطبيق
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
