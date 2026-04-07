// FIXED: Replaced useEditor with generateHTML for server-side rendering, removed 'use client' directive
import { RawHtmlRenderer } from './RawHtmlRenderer';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { Image as ImageExt } from '@tiptap/extension-image';
import { Link as LinkExt } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Underline as UnderlineExt } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Extension } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [{
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
    }];
  },
});

function sanitizeContent(raw: unknown): JSONContent {
  if (!raw || typeof raw !== 'object') return { type: 'doc', content: [{ type: 'paragraph' }] };
  const c = raw as JSONContent;
  if (c.type !== 'doc') return { type: 'doc', content: [{ type: 'paragraph' }] };
  return c;
}

const lowlight = createLowlight(common);

export function ArticleContentRenderer({ content }: { content: unknown }) {
  if (content && typeof content === 'object' && (content as Record<string, unknown>).type === 'rawHtml') {
    const html = (content as { type: string; html: string }).html ?? '';
    return <RawHtmlRenderer html={html} />;
  }

  const safeContent = sanitizeContent(content);
  try {
    const html = generateHTML(safeContent, [
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
      FontSize,
    ]);
    return (
      <div
        className="wiki-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <div className="wiki-content" />;
  }
}
