'use client';

import { diffLines } from 'diff';

interface DiffViewerProps {
  oldText: string;
  newText: string;
}

export function DiffViewer({ oldText, newText }: DiffViewerProps) {
  const changes = diffLines(oldText, newText);

  if (oldText === newText) {
    return (
      <div style={{ border: '1px solid var(--border)', padding: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>No text differences found between this revision and the current version.</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <pre style={{ fontSize: '12px', fontFamily: 'var(--ff-mono)', lineHeight: '1.6', margin: 0 }}>
          {changes.map((part, i) => {
            if (part.added) {
              return (
                <div
                  key={i}
                  style={{ background: 'rgba(51,160,96,0.1)', borderLeft: '3px solid #33cc77', padding: '2px 12px' }}
                >
                  {part.value.split('\n').filter(Boolean).map((line, j) => (
                    <div key={j} style={{ color: '#4aaa70' }}>
                      <span style={{ userSelect: 'none', color: '#33cc77', marginRight: '10px' }}>+</span>
                      {line}
                    </div>
                  ))}
                </div>
              );
            }
            if (part.removed) {
              return (
                <div
                  key={i}
                  style={{ background: 'rgba(192,64,64,0.1)', borderLeft: '3px solid var(--red-bright)', padding: '2px 12px' }}
                >
                  {part.value.split('\n').filter(Boolean).map((line, j) => (
                    <div key={j} style={{ color: '#c07070' }}>
                      <span style={{ userSelect: 'none', color: 'var(--red-bright)', marginRight: '10px' }}>-</span>
                      {line}
                    </div>
                  ))}
                </div>
              );
            }
            const lines = part.value.split('\n').filter(Boolean);
            if (lines.length <= 6) {
              return (
                <div key={i} style={{ padding: '2px 12px' }}>
                  {lines.map((line, j) => (
                    <div key={j} style={{ color: 'var(--text-2)' }}>
                      <span style={{ userSelect: 'none', color: 'var(--text-3)', marginRight: '10px' }}>&nbsp;</span>
                      {line}
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <div key={i}>
                <div style={{ padding: '2px 12px' }}>
                  {lines.slice(0, 3).map((line, j) => (
                    <div key={j} style={{ color: 'var(--text-2)' }}>
                      <span style={{ userSelect: 'none', color: 'var(--text-3)', marginRight: '10px' }}>&nbsp;</span>
                      {line}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '4px 12px', background: 'var(--bg-2)', color: 'var(--text-2)', fontSize: '11px', textAlign: 'center' }}>
                  ··· {lines.length - 6} unchanged lines ···
                </div>
                <div style={{ padding: '2px 12px' }}>
                  {lines.slice(-3).map((line, j) => (
                    <div key={j} style={{ color: 'var(--text-2)' }}>
                      <span style={{ userSelect: 'none', color: 'var(--text-3)', marginRight: '10px' }}>&nbsp;</span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
