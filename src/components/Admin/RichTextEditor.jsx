"use client";

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Code, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import { PromptModal } from '@/components/Modal/Modal';

export default function RichTextEditor({ content, onChange }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
    immediatelyRender: false
  });

  if (!editor) {
    return null;
  }

  const handleAddImage = (url) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleAddLink = (url) => {
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const ToolbarButton = ({ onClick, active, disabled, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1" />

        {/* Media */}
        <ToolbarButton onClick={() => setShowLinkModal(true)} title="Add Link">
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowImageModal(true)} title="Add Image">
          <ImageIcon size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={18} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Modals */}
      <PromptModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSubmit={handleAddImage}
        title="Insert Image"
        message="Enter the image URL:"
        placeholder="https://example.com/image.jpg"
        inputType="url"
      />

      <PromptModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSubmit={handleAddLink}
        title="Insert Link"
        message="Enter the URL:"
        placeholder="https://example.com"
        inputType="url"
      />
    </div>
  );
}
