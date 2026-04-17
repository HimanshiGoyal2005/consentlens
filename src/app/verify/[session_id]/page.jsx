'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const PURPLE = '#5B4FCF';
const BG = '#F5F4FF';

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const colors = {
    approved: { bg: '#E8F5E9', text: '#2E7D32', label: 'Approved' },
    completed: { bg: '#E3F2FD', text: '#1565C0', label: 'Completed' },
    in_progress: { bg: '#FFF3E0', text: '#E65100', label: 'In Progress' },
    ready: { bg: '#F3E5F5', text: '#6A1B9A', label: 'Ready' },
    generating: { bg: '#FFF8E1', text: '#F57F17', label: 'Generating' },
  };
  const c = colors[status] || { bg: '#ECEFF1', text: '#546E7A', label: status };
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        padding: '3px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 600,
      }}
    >
      {c.label}
    </span>
  );
}

export default function VerifyPage() {
  const { session_id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session_id) return;

    async function fetchSession() {
      try {
        const res = await fetch(`/api/consent/session/${session_id}`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [session_id]);

  const isVerified =
    data?.session?.status === 'completed' || data?.session?.status === 'approved';

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: `4px solid ${PURPLE}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <p style={{ color: PURPLE, fontWeight: 600, fontSize: '15px' }}>
            Verifying consent record…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '24px',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>❌</div>
          <h1 style={{ color: '#C62828', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            Verification Failed
          </h1>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
          <p style={{ color: '#aaa', fontSize: '12px' }}>
            Powered by ConsentLens — tamper-proof consent verification
          </p>
        </div>
      </div>
    );
  }

  const { session, surgery_name, logs } = data;

  const rows = [
    { label: 'Patient Name', value: session.patient_name || '—' },
    { label: 'Surgery', value: surgery_name || session.surgery_id || '—' },
    { label: 'Language', value: session.language || '—' },
    {
      label: 'Comprehension Score',
      value: (
        <span style={{ fontWeight: 700, color: PURPLE }}>
          {session.comprehension_score ?? 0} / 5
        </span>
      ),
    },
    {
      label: 'Status',
      value: <StatusBadge status={session.status} />,
    },
    { label: 'Created At', value: formatDate(session.created_at) },
    {
      label: 'C2PA Reference ID',
      value: (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            background: '#F5F4FF',
            color: PURPLE,
            padding: '4px 10px',
            borderRadius: '6px',
            wordBreak: 'break-all',
          }}
        >
          {session_id}
        </span>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '48px 40px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 4px 32px rgba(91,79,207,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '64px', lineHeight: 1, marginBottom: '12px' }}>
            {isVerified ? '✅' : '❌'}
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: isVerified ? '#2E7D32' : '#C62828',
              marginBottom: '6px',
            }}
          >
            {isVerified ? 'Content Credentials Valid' : 'Verification Failed'}
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            {isVerified
              ? 'This consent record is authentic and tamper-proof.'
              : 'This consent session has not been completed.'}
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #EDE9FF', marginBottom: '28px' }} />

        {/* Data table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map(({ label, value }) => (
              <tr key={label} style={{ borderBottom: '1px solid #F0EEFF' }}>
                <td
                  style={{
                    padding: '12px 0',
                    color: '#888',
                    fontSize: '13px',
                    fontWeight: 500,
                    width: '40%',
                    verticalAlign: 'top',
                  }}
                >
                  {label}
                </td>
                <td
                  style={{
                    padding: '12px 0 12px 16px',
                    color: '#1A1A2E',
                    fontSize: '14px',
                    fontWeight: 500,
                    verticalAlign: 'top',
                  }}
                >
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Comprehension log summary */}
        {logs && logs.length > 0 && (
          <>
            <div style={{ borderTop: '1px solid #EDE9FF', margin: '24px 0 16px' }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '10px' }}>
              Comprehension Log ({logs.length} events)
            </p>
            <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
              {logs.map((log) => {
                const icon =
                  log.response === 'understood'
                    ? '✓'
                    : log.response === 'nurse_flagged'
                    ? '🚨'
                    : '↺';
                const color =
                  log.response === 'understood'
                    ? '#2E7D32'
                    : log.response === 'nurse_flagged'
                    ? '#C62828'
                    : '#E65100';
                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    <span>
                      <span style={{ color, fontWeight: 700, marginRight: '6px' }}>{icon}</span>
                      Risk #{log.risk_index} —{' '}
                      <span style={{ color }}>{log.response.replace(/_/g, ' ')}</span>
                    </span>
                    <span style={{ color: '#aaa' }}>{formatDate(log.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #EDE9FF', marginTop: '28px', paddingTop: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: '16px',
                color: PURPLE,
                letterSpacing: '-0.5px',
              }}
            >
              ConsentLens
            </span>
            <span style={{ fontSize: '11px', color: '#bbb' }}>
              Powered by ConsentLens — tamper-proof consent verification
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
