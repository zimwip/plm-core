import React from 'react';

export default function ErrorDetailModal({ detail, onClose }) {
  const isTech = detail.category === 'TECHNICAL';
  const stack  = isTech && Array.isArray(detail.stackTrace) ? detail.stackTrace.join('\n') : null;
  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Error detail">
      <div className={`card ${isTech ? 'err-card-tech' : 'err-card-func'}`}
           onClick={e => e.stopPropagation()}>
        <div className="card-hd">
          <span className="card-title" style={{ color: isTech ? 'var(--danger)' : 'var(--warn)' }}>
            {isTech ? '✗ Unexpected error' : '⚠ Error'}
          </span>
          <button className="btn btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={`card-body ${isTech ? 'err-body' : ''}`}>
          <div className="err-message">{detail.error}</div>
          {detail.violations?.length > 0 && (
            <ul className="violations-list">
              {detail.violations.map((v, i) => (
                <li key={i} className="violation-item">
                  {typeof v === 'string' ? v : v.message}
                </li>
              ))}
            </ul>
          )}
          {isTech && detail.type && <div className="err-meta">{detail.type}</div>}
          {detail.path && <div className="err-meta">{detail.path}</div>}
          {stack && <pre className="stack-trace">{stack}</pre>}
        </div>
      </div>
    </div>
  );
}
