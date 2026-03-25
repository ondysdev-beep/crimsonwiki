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
import UnderlineExt from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import type { JSONContent } from '@tiptap/react';

const lowlight = createLowlight(common);

export function ArticleContentRenderer({ content }: { content: unknown }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false }),
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
      UnderlineExt,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
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
