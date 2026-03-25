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
      style={{
        padding: 8,
        borderRadius: 4,
        border: 'none',
        background: active ? 'rgba(155,32,32,0.2)' : 'transparent',
        color: active ? 'var(--crimson-bright, #c42c2c)' : 'var(--text-muted, #7a7088)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        transition: 'background 0.15s, color 0.15s',
        lineHeight: 0,
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => { if (!active && !disabled) { (e.currentTarget).style.background = 'var(--card-hover, #1a1724)'; (e.currentTarget).style.color = 'var(--text-primary, #e2d9c8)'; } }}
      onMouseLeave={(e) => { if (!active) { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--text-muted, #7a7088)'; } }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 24, background: 'var(--border, #2a2035)', margin: '0 4px' }} />;
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
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={title}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '6px 8px', borderRadius: 4, fontSize: 13,
          color: 'var(--text-muted, #7a7088)', background: 'transparent',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card-hover, #1a1724)'; e.currentTarget.style.color = 'var(--text-primary, #e2d9c8)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted, #7a7088)'; }}
      >
        {trigger}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
            background: 'var(--surface, #0f0d13)', border: '1px solid var(--border, #2a2035)',
            borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: '4px 0',
            minWidth: 140,
          }}
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
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, padding: 8, borderBottom: '1px solid var(--border, #2a2035)', background: 'var(--surface, #0f0d13)' }}>
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
      <DropdownMenu trigger={<span style={{ fontSize: 12 }}>Size</span>} title="Font Size">
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
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', fontSize: 13, color: 'var(--text-primary, #e2d9c8)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card-hover, #1a1724)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {fs.label}
          </button>
        ))}
      </DropdownMenu>

      <Divider />

      {/* Group 4 - Color */}
      <DropdownMenu
        trigger={<Palette size={iconSize} style={{ color: 'var(--text-muted, #7a7088)' }} />}
        title="Text Color"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: 8 }}>
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => editor.chain().focus().setColor(color).run()}
              style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--border, #2a2035)', backgroundColor: color, cursor: 'pointer', transition: 'transform 0.1s' }}
              title={color}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetColor().run()}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', fontSize: 11, color: 'var(--text-dim, #4a4258)', background: 'transparent', border: 'none', borderTop: '1px solid var(--border, #2a2035)', cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card-hover, #1a1724)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          Reset color
        </button>
      </DropdownMenu>
      <DropdownMenu
        trigger={<Highlighter size={iconSize} style={{ color: 'var(--text-muted, #7a7088)' }} />}
        title="Highlight Color"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 8 }}>
          {HIGHLIGHT_COLORS.map((hl) => (
            <button
              key={hl.value}
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight({ color: hl.value }).run()}
              style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, color: '#111', backgroundColor: hl.value, border: 'none', cursor: 'pointer', transition: 'transform 0.1s', fontFamily: 'inherit' }}
              title={hl.label}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {hl.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', fontSize: 11, color: 'var(--text-dim, #4a4258)', background: 'transparent', border: 'none', borderTop: '1px solid var(--border, #2a2035)', cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card-hover, #1a1724)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
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
        style={{ display: 'none' }}
      />
    </div>
  );
}
