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
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
        <p className="text-dark-400">No text differences found between this revision and the current version.</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
          {changes.map((part, i) => {
            if (part.added) {
              return (
                <div
                  key={i}
                  className="bg-green-500/10 border-l-2 border-green-500 px-4 py-0.5"
                >
                  {part.value.split('\n').filter(Boolean).map((line, j) => (
                    <div key={j} className="text-green-300">
                      <span className="select-none text-green-600 mr-3">+</span>
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
                  className="bg-red-500/10 border-l-2 border-red-500 px-4 py-0.5"
                >
                  {part.value.split('\n').filter(Boolean).map((line, j) => (
                    <div key={j} className="text-red-300">
                      <span className="select-none text-red-600 mr-3">-</span>
                      {line}
                    </div>
                  ))}
                </div>
              );
            }
            const lines = part.value.split('\n').filter(Boolean);
            if (lines.length <= 6) {
              return (
                <div key={i} className="px-4 py-0.5">
                  {lines.map((line, j) => (
                    <div key={j} className="text-dark-400">
                      <span className="select-none text-dark-600 mr-3">&nbsp;</span>
                      {line}
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <div key={i}>
                <div className="px-4 py-0.5">
                  {lines.slice(0, 3).map((line, j) => (
                    <div key={j} className="text-dark-400">
                      <span className="select-none text-dark-600 mr-3">&nbsp;</span>
                      {line}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-1 bg-dark-700/30 text-dark-500 text-xs text-center">
                  ··· {lines.length - 6} unchanged lines ···
                </div>
                <div className="px-4 py-0.5">
                  {lines.slice(-3).map((line, j) => (
                    <div key={j} className="text-dark-400">
                      <span className="select-none text-dark-600 mr-3">&nbsp;</span>
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
