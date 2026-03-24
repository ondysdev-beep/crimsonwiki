'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { MenuBar } from './MenuBar';
import type { JSONContent } from '@tiptap/react';

interface TiptapEditorProps {
  content?: JSONContent;
  onChange: (json: JSONContent, text: string) => void;
  editable?: boolean;
}

export function TiptapEditor({ content, onChange, editable = true }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: 'Start writing your article here...',
      }),
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();
      onChange(json, text);
    },
    editorProps: {
      attributes: {
        class: 'wiki-content focus:outline-none min-h-[400px]',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-dark-700 rounded-xl overflow-hidden bg-dark-800/50">
      {editable && <MenuBar editor={editor} />}
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
