'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExt from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
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

interface TiptapEditorProps {
  content?: JSONContent;
  onChange: (json: JSONContent, text: string) => void;
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
  const autosaveInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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
    content: content || '',
    editable,
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      const text = ed.getText();
      onChange(json, text);
    },
    editorProps: {
      attributes: {
        class: 'wiki-content focus:outline-none min-h-[400px]',
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

  useEffect(() => {
    if (!editor || !autosaveKey || !editable) return;
    autosaveInterval.current = setInterval(() => {
      const json = editor.getJSON();
      try {
        localStorage.setItem(autosaveKey, JSON.stringify(json));
      } catch {
        // localStorage full or unavailable
      }
    }, 30000);
    return () => {
      if (autosaveInterval.current) clearInterval(autosaveInterval.current);
    };
  }, [editor, autosaveKey, editable]);

  useEffect(() => {
    if (!editor || !autosaveKey || content) return;
    try {
      const saved = localStorage.getItem(autosaveKey);
      if (saved) {
        const parsed = JSON.parse(saved) as JSONContent;
        if (parsed && typeof parsed === 'object') {
          editor.commands.setContent(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [editor, autosaveKey, content]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters() ?? 0;
  const wordCount = editor.storage.characterCount?.words() ?? 0;

  return (
    <div className="border border-dark-700 rounded-xl overflow-hidden bg-dark-800/50">
      {editable && (
        <MenuBar
          editor={editor}
          onImageUpload={onImageUpload ? handleImageUpload : undefined}
        />
      )}
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
      {editable && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-dark-700 text-xs text-dark-500">
          <span>{charCount.toLocaleString()} characters / {wordCount.toLocaleString()} words</span>
          {autosaveKey && <span>Autosave every 30s</span>}
        </div>
      )}
    </div>
  );
}
