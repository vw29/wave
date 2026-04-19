"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPost } from "@/actions/post/createPost";
import { useUploadThing } from "@/lib/uploadthing";
import EmojiPicker, { Theme } from "emoji-picker-react";
import toast from "react-hot-toast";

interface PostComposerProps {
  userName: string;
  profileImage: string | null;
}

export default function PostComposer({
  userName,
  profileImage,
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const { startUpload } = useUploadThing("postImage", {
    onClientUploadComplete: (res) => {
      const url = res[0]?.url;
      if (url) {
        setImageUrl(url);
      }
      setIsUploading(false);
    },
    onUploadError: (error) => {
      toast.error(error.message);
      setIsUploading(false);
    },
  });

  const handlePost = () => {
    if (!content.trim() && !imageUrl) return;
    startTransition(async () => {
      const result = await createPost(content, imageUrl ?? undefined);
      if (result.error) {
        toast.error(result.error);
      } else {
        setContent("");
        setImageUrl(null);
        setIsFocused(false);
        setShowEmojiPicker(false);
      }
    });
  };

  const handleImageSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsUploading(true);
      await startUpload([file]);
    };
    input.click();
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.slice(0, start) + emojiData.emoji + content.slice(end);
      setContent(newContent);
      // Restore cursor position after emoji insertion
      requestAnimationFrame(() => {
        const newPos = start + emojiData.emoji.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      });
    } else {
      setContent((prev) => prev + emojiData.emoji);
    }
  };

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div
      ref={containerRef}
      onBlur={(e) => {
        if (
          !content &&
          !imageUrl &&
          !showEmojiPicker &&
          !containerRef.current?.contains(e.relatedTarget)
        ) {
          setIsFocused(false);
        }
      }}
      className={`bg-card rounded-2xl border transition-colors duration-200 p-5 ${
        isFocused ? "border-primary/50" : "border-border"
      }`}
    >
      <div className="flex gap-3">
        {profileImage ? (
          <img
            src={profileImage}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold text-foreground flex-shrink-0">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="What's on your mind?"
            rows={isFocused ? 3 : 1}
            maxLength={500}
            className="w-full bg-transparent text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none leading-relaxed"
          />

          {/* Image Preview */}
          {(imageUrl || isUploading) && (
            <div className="mt-2 relative">
              {isUploading ? (
                <div className="w-full h-48 rounded-xl border border-primary/30 bg-muted flex flex-col items-center justify-center gap-3 overflow-hidden relative">
                  {/* Animated progress bar at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20">
                    <div className="h-full bg-primary animate-[indeterminate_1.5s_ease-in-out_infinite] w-1/3 rounded-full" />
                  </div>
                  <svg
                    className="w-8 h-8 text-blue-400 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-muted-foreground font-medium">
                    Uploading image...
                  </span>
                </div>
              ) : imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Post image"
                    className="w-full max-h-96 rounded-xl border border-border object-contain bg-black/20"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>
          )}

          <div
            className={`flex items-center justify-between pt-3 border-t border-border transition-all duration-200 ${
              isFocused
                ? "opacity-100 mt-2"
                : "opacity-0 h-0 overflow-hidden mt-0 pt-0 border-t-0"
            }`}
          >
            <div className="flex gap-1">
              {/* Image Upload Button */}
              <button
                type="button"
                onClick={handleImageSelect}
                disabled={isUploading || !!imageUrl}
                className={`p-2 rounded-lg transition-all disabled:cursor-not-allowed ${
                  isUploading
                    ? "text-blue-400 bg-blue-500/10 animate-pulse"
                    : imageUrl
                      ? "text-blue-400 bg-blue-500/10 opacity-40"
                      : "text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10"
                }`}
                title={
                  isUploading
                    ? "Uploading..."
                    : imageUrl
                      ? "Image already added"
                      : "Add image"
                }
              >
                {isUploading ? (
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>

              {/* Emoji Picker Button */}
              <div className="relative" ref={emojiRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-lg transition-all ${
                    showEmojiPicker
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10"
                  }`}
                  title="Add emoji"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>

                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 z-50">
                    <EmojiPicker
                      theme={Theme.DARK}
                      onEmojiClick={handleEmojiClick}
                      width={320}
                      height={400}
                      searchPlaceholder="Search emoji..."
                      lazyLoadEmojis
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span
                  className={`text-xs ${
                    content.length > 450
                      ? "text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {content.length}/500
                </span>
              )}
              <button
                onClick={handlePost}
                disabled={(!content.trim() && !imageUrl) || isPending || isUploading}
                className="bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold px-6 py-2 rounded-xl text-sm transition-all duration-200"
              >
                {isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
