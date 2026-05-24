import React, { useRef, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, List, ListOrdered, Link, RemoveFormatting, Youtube, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { cleanPastedHtml } from "@/lib/cleanPastedHtml";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const parseYouTubeUrl = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

const RichTextEditor = ({ value, onChange, placeholder = "Start typing...", className }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalChange = useRef(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Only update the editor content when value changes externally (not from typing)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      // Only set content if it's different from current content
      const sanitizedValue = sanitizeHtml(value);
      if (editorRef.current.innerHTML !== sanitizedValue) {
        editorRef.current.innerHTML = sanitizedValue;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const execCommand = useCallback((command: string, cmdValue?: string) => {
    // Focus editor BEFORE executing command — execCommand requires the
    // contenteditable to have focus/selection, otherwise list commands silently no-op.
    editorRef.current?.focus();

    // If there's no selection inside the editor (e.g. user just clicked the toolbar
    // button without placing the cursor), place the caret at the end so commands like
    // insertUnorderedList have a valid range to operate on.
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (editor && (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode))) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    document.execCommand(command, false, cmdValue);

    // Trigger onChange after command
    if (editor) {
      isInternalChange.current = true;
      onChange(editor.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  }, [execCommand]);

  const handleYouTubeEmbed = useCallback(() => {
    const url = prompt("Enter YouTube URL:");
    if (url) {
      const videoId = parseYouTubeUrl(url);
      if (videoId) {
        const embedHtml = `<div class="video-embed" contenteditable="false" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:16px 0;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:8px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
        document.execCommand("insertHTML", false, embedHtml);
        if (editorRef.current) {
          isInternalChange.current = true;
          onChange(editorRef.current.innerHTML);
        }
      } else {
        alert("Invalid YouTube URL. Please use a valid YouTube link.");
      }
    }
  }, [onChange]);

  const insertImageHtml = useCallback((url: string, alt = "") => {
    const safeAlt = alt.replace(/"/g, "&quot;");
    const html = `<img src="${url}" alt="${safeAlt}" loading="lazy" class="rounded-lg my-4 max-w-full h-auto" /><p><br></p>`;
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const uploadAndInsertImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Not an image", description: "Please choose an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Maximum size is 5 MB.", variant: "destructive" });
      return;
    }
    setIsUploadingImage(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("lesson-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("lesson-images").getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("Could not resolve public URL.");
      insertImageHtml(data.publicUrl, file.name.replace(/\.[^.]+$/, ""));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      toast({ title: "Image upload failed", description: message, variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  }, [insertImageHtml]);

  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAndInsertImage(file);
    e.target.value = "";
  }, [uploadAndInsertImage]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const nativeEvent = e.nativeEvent as ClipboardEvent & { shiftKey?: boolean };
    const forcePlain = nativeEvent.shiftKey === true;

    // Pasted image file (screenshot, copied image) — upload before inserting
    if (!forcePlain) {
      const files = Array.from(e.clipboardData.files || []);
      const imageFile = files.find((f) => f.type.startsWith("image/"));
      if (imageFile) {
        e.preventDefault();
        uploadAndInsertImage(imageFile);
        return;
      }
    }

    e.preventDefault();
    const html = forcePlain ? "" : e.clipboardData.getData("text/html");

    if (html) {
      const cleaned = sanitizeHtml(cleanPastedHtml(html));
      if (cleaned) {
        document.execCommand("insertHTML", false, cleaned);
        if (editorRef.current) {
          isInternalChange.current = true;
          onChange(editorRef.current.innerHTML);
        }
        return;
      }
    }

    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, [onChange, uploadAndInsertImage]);

  return (
    <div className={cn("border border-input rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-input bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          size="sm"
          onClick={() => execCommand("bold")}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          size="sm"
          onClick={() => execCommand("italic")}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          size="sm"
          onClick={() => execCommand("underline")}
          className="h-8 w-8 p-0"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          size="sm"
          onClick={handleLink}
          className="h-8 w-8 p-0"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          size="sm"
          onClick={() => execCommand("removeFormat")}
          className="h-8 w-8 p-0"
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          size="sm"
          onClick={handleYouTubeEmbed}
          className="h-8 w-8 p-0"
          title="Embed YouTube Video"
        >
          <Youtube className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          size="sm"
          onClick={handleImageButtonClick}
          disabled={isUploadingImage}
          className="h-8 w-8 p-0"
          title="Insert Image (or paste an image)"
        >
          {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-3 focus:outline-none prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{
          minHeight: "200px",
        }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
