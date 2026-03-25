'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  RemoveFormatting,
  Code,
  CodeSquare,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  ImagePlus,
  ImageUp,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  ChevronDown,
} from 'lucide-react';

interface MenuBarProps {
  editor: Editor;
  onImageUpload?: (file: File) => Promise<string | null>;
}

function MenuButton({
  onClick,
  active = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-colors ${active
        ? 'bg-crimson-600/20 text-crimson-400'
        : 'text-dark-300 hover:text-dark-100 hover:bg-dark-700'
        } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-dark-600 mx-1" />;
}

function DropdownMenu({
  trigger,
  children,
  title,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={title}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-colors"
      >
        {trigger}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 bg-dark-800 border border-dark-600 rounded-lg shadow-xl py-1 min-w-[140px]"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const FONT_SIZES = [
  { label: 'Small', value: '14px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'Huge', value: '28px' },
];

const TEXT_COLORS = [
  '#e2d9c8', '#ffffff', '#dc2626', '#ea580c', '#ca8a04',
  '#16a34a', '#2563eb', '#9333ea', '#db2777', '#64748b',
];

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Orange', value: '#fed7aa' },
  { label: 'Purple', value: '#e9d5ff' },
];

export function MenuBar({ editor, onImageUpload }: MenuBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImageByUrl = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    const url = await onImageUpload(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [editor, onImageUpload]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const iconSize = 16;

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-dark-700 bg-dark-800">
      {/* Group 1 - History */}
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={iconSize} />
      </MenuButton>

      <Divider />

      {/* Group 2 - Format */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <Bold size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <Italic size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline"
      >
        <Underline size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear Formatting"
      >
        <RemoveFormatting size={iconSize} />
      </MenuButton>

      <Divider />

      {/* Group 3 - Font Size */}
      <DropdownMenu trigger={<span className="text-xs">Size</span>} title="Font Size">
        {FONT_SIZES.map((fs) => (
          <button
            key={fs.value}
            type="button"
            onClick={() => {
              if (fs.value === '16px') {
                editor.chain().focus().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
              } else {
                editor.chain().focus().setMark('textStyle', { fontSize: fs.value }).run();
              }
            }}
            className="block w-full text-left px-3 py-1.5 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            {fs.label}
          </button>
        ))}
      </DropdownMenu>

      <Divider />

      {/* Group 4 - Color */}
      <DropdownMenu
        trigger={<Palette size={iconSize} className="text-dark-300" />}
        title="Text Color"
      >
        <div className="grid grid-cols-5 gap-1 p-2">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => editor.chain().focus().setColor(color).run()}
              className="w-6 h-6 rounded border border-dark-600 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="block w-full text-left px-3 py-1.5 text-xs text-dark-400 hover:bg-dark-700 transition-colors border-t border-dark-700"
        >
          Reset color
        </button>
      </DropdownMenu>
      <DropdownMenu
        trigger={<Highlighter size={iconSize} className="text-dark-300" />}
        title="Highlight Color"
      >
        <div className="grid grid-cols-3 gap-1 p-2">
          {HIGHLIGHT_COLORS.map((hl) => (
            <button
              key={hl.value}
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight({ color: hl.value }).run()}
              className="px-2 py-1 rounded text-xs text-dark-900 hover:scale-105 transition-transform"
              style={{ backgroundColor: hl.value }}
              title={hl.label}
            >
              {hl.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          className="block w-full text-left px-3 py-1.5 text-xs text-dark-400 hover:bg-dark-700 transition-colors border-t border-dark-700"
        >
          Remove highlight
        </button>
      </DropdownMenu>

      <Divider />

      {/* Group 5 - Headings */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        active={editor.isActive('paragraph')}
        title="Paragraph"
      >
        <Pilcrow size={iconSize} />
      </MenuButton>

      <Divider />

      {/* Group 6 - Align */}
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        active={editor.isActive({ textAlign: 'justify' })}
        title="Justify"
      >
        <AlignJustify size={iconSize} />
      </MenuButton>

      <Divider />

      {/* Group 7 - Lists */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive('taskList')}
        title="Task List"
      >
        <ListChecks size={iconSize} />
      </MenuButton>

      <Divider />

      {/* Group 8 - Insert */}
      <MenuButton onClick={setLink} active={editor.isActive('link')} title="Insert Link">
        <LinkIcon size={iconSize} />
      </MenuButton>
      {onImageUpload && (
        <MenuButton onClick={() => fileInputRef.current?.click()} title="Upload Image">
          <ImageUp size={iconSize} />
        </MenuButton>
      )}
      <MenuButton onClick={addImageByUrl} title="Image by URL">
        <ImagePlus size={iconSize} />
      </MenuButton>
      <MenuButton onClick={addTable} title="Insert Table">
        <TableIcon size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Inline Code"
      >
        <Code size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <CodeSquare size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote size={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={iconSize} />
      </MenuButton>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
