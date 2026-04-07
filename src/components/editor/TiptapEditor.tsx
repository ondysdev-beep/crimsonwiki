'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image as ImageExt } from '@tiptap/extension-image';
import { Link as LinkExt } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline as UnderlineExt } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { CharacterCount } from '@tiptap/extension-character-count';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { MenuBar } from './MenuBar';
import type { JSONContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: Record<string, string | null>) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

const lowlight = createLowlight(common);

export type RawHtmlContent = { type: 'rawHtml'; html: string };
export type AnyContent = JSONContent | RawHtmlContent;

function isRawHtml(c: unknown): c is RawHtmlContent {
  return !!c && typeof c === 'object' && (c as Record<string, unknown>).type === 'rawHtml';
}

interface TiptapEditorProps {
  content?: AnyContent;
  onChange: (content: AnyContent, text: string) => void;
  editable?: boolean;
  autosaveKey?: string;
  onImageUpload?: (file: File) => Promise<string | null>;
}

export function TiptapEditor({
  content,
  onChange,
  editable = true,
  autosaveKey,
  onImageUpload,
}: TiptapEditorProps) {
  const rawHtmlRef = useRef<string>(isRawHtml(content) ? content.html : '');
  const [isHtmlMode, setIsHtmlMode] = useState<boolean>(() => isRawHtml(content));
  const [rawHtml, setRawHtml] = useState<string>(() => isRawHtml(content) ? content.html : '');

  const initialTiptapContent = isRawHtml(content) ? content.html : (content || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
      }),
      ImageExt.configure({ inline: false, allowBase64: true }),
      LinkExt.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: 'Start writing your article here...',
      }),
      UnderlineExt,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialTiptapContent,
    editable,
    onUpdate: ({ editor: ed }) => {
      if (isHtmlMode) return;
      const json = ed.getJSON();
      const text = ed.getText();
      onChange(json, text);
    },
    editorProps: {
      attributes: {
        class: 'wiki-content',
        style: 'outline: none; min-height: 400px;',
      },
    },
  });

  const handleImageUpload = useCallback(
    async (file: File): Promise<string | null> => {
      if (onImageUpload) return onImageUpload(file);
      return null;
    },
    [onImageUpload]
  );

  const switchToHtml = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    rawHtmlRef.current = html;
    setRawHtml(html);
    setIsHtmlMode(true);
    onChange({ type: 'rawHtml', html }, html);
  }, [editor, onChange]);

  const switchToVisual = useCallback(() => {
    if (!editor) return;
    editor.commands.setContent(rawHtmlRef.current);
    setIsHtmlMode(false);
    const json = editor.getJSON();
    const text = editor.getText();
    onChange(json, text);
  }, [editor, onChange]);

  const handleHtmlChange = useCallback((value: string) => {
    rawHtmlRef.current = value;
    setRawHtml(value);
    onChange({ type: 'rawHtml', html: value }, value);
  }, [onChange]);

  // Autosave — handles both modes
  useEffect(() => {
    if (!autosaveKey || !editable) return;
    const interval = setInterval(() => {
      try {
        if (isHtmlMode) {
          localStorage.setItem(autosaveKey, JSON.stringify({ type: 'rawHtml', html: rawHtmlRef.current }));
        } else if (editor) {
          localStorage.setItem(autosaveKey, JSON.stringify(editor.getJSON()));
        }
      } catch {
        // localStorage full or unavailable
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [editor, autosaveKey, editable, isHtmlMode]);

  // Load autosave on mount (only if no content provided)
  useEffect(() => {
    if (!autosaveKey || content) return;
    try {
      const saved = localStorage.getItem(autosaveKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as AnyContent;
      if (!parsed || typeof parsed !== 'object') return;
      if (isRawHtml(parsed)) {
        rawHtmlRef.current = parsed.html;
        setRawHtml(parsed.html);
        setIsHtmlMode(true);
        onChange(parsed, parsed.html);
      } else if (editor) {
        editor.commands.setContent(parsed as JSONContent);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, autosaveKey]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters() ?? 0;
  const wordCount = editor.storage.characterCount?.words() ?? 0;

  const modeToggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid var(--border)',
    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
      {editable && (
        <>
          {/* Mode toggle bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={switchToVisual}
                style={{
                  ...modeToggleStyle,
                  background: !isHtmlMode ? 'rgba(155,32,32,0.18)' : 'transparent',
                  color: !isHtmlMode ? 'var(--crimson-bright, #c42c2c)' : 'var(--text-muted)',
                  borderColor: !isHtmlMode ? 'rgba(155,32,32,0.4)' : 'var(--border)',
                }}
              >
                Visual
              </button>
              <button
                type="button"
                onClick={switchToHtml}
                style={{
                  ...modeToggleStyle,
                  background: isHtmlMode ? 'rgba(155,32,32,0.18)' : 'transparent',
                  color: isHtmlMode ? 'var(--crimson-bright, #c42c2c)' : 'var(--text-muted)',
                  borderColor: isHtmlMode ? 'rgba(155,32,32,0.4)' : 'var(--border)',
                }}
              >
                {'</>'}  HTML
              </button>
            </div>
            {isHtmlMode && (
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                Raw HTML — CSS &amp; scripts supported
              </span>
            )}
          </div>

          {/* MenuBar — only in visual mode */}
          {!isHtmlMode && (
            <MenuBar
              editor={editor}
              onImageUpload={onImageUpload ? handleImageUpload : undefined}
            />
          )}
        </>
      )}

      {isHtmlMode ? (
        <textarea
          value={rawHtml}
          onChange={(e) => handleHtmlChange(e.target.value)}
          readOnly={!editable}
          spellCheck={false}
          placeholder="Paste or write your HTML here..."
          style={{
            display: 'block',
            width: '100%',
            minHeight: 480,
            padding: 20,
            background: '#0e0c0b',
            color: '#c8e0a0',
            fontFamily: 'var(--ff-mono, "Fira Code", "Cascadia Code", monospace)',
            fontSize: 13,
            lineHeight: 1.65,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <div style={{ padding: 24 }}>
          <EditorContent editor={editor} />
        </div>
      )}

      {editable && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-dim)' }}>
          {isHtmlMode ? (
            <span>{rawHtml.length.toLocaleString()} characters</span>
          ) : (
            <span>{charCount.toLocaleString()} characters / {wordCount.toLocaleString()} words</span>
          )}
          {autosaveKey && <span>Autosave every 30s</span>}
        </div>
      )}
    </div>
  );
}
