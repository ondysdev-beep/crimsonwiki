'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import type { JSONContent } from '@tiptap/react';

export function ArticleContentRenderer({ content }: { content: unknown }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3, 4] }).extend({
        renderHTML({ node, HTMLAttributes }) {
          const level = node.attrs.level as number;
          const text = node.textContent;
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          return [`h${level}`, { ...HTMLAttributes, id }, 0];
        },
      }),
      ImageExt.configure({ inline: false }),
      LinkExt.configure({ openOnClick: true }),
      Table,
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: content as JSONContent,
    editable: false,
    editorProps: {
      attributes: {
        class: 'wiki-content focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
