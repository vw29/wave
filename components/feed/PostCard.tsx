"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { likePost } from "@/actions/post/likePost";
import { deletePost } from "@/actions/post/deletePost";
import { getComments } from "@/actions/post/getComments";
import { createComment } from "@/actions/post/createComment";
import { deleteComment } from "@/actions/post/deleteComment";
import { likeComment } from "@/actions/post/likeComment";
import { bookmarkPost } from "@/actions/post/bookmarkPost";
import { editComment } from "@/actions/post/editComment";
import { pinComment } from "@/actions/post/pinComment";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreVertical,
  Trash2,
  Link2,
  X,
  Send,
  Loader2,
  Pin,
} from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AvatarDisplay from "@/components/ui/avatar-display";
import EmojiPickerButton from "@/components/ui/emoji-picker-button";
import { formatCount, timeAgo, renderTextWithMentions } from "@/lib/utils";

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  isPinned: boolean;
  author: {
    id: string;
    username: string;
    name: string | null;
    profileImage: string | null;
  };
  likeCount: number;
  likedByMe: boolean;
  replies: Comment[];
}

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image: string | null;
    createdAt: Date;
    author: {
      id: string;
      username: string;
      name: string | null;
      profileImage: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
  };
  currentUserId: string | null;
  currentUserName?: string | null;
  currentUserImage?: string | null;
  initialLiked: boolean;
  initialBookmarked?: boolean;
}

function insertAtCursor(
  inputRef: React.RefObject<HTMLInputElement | null>,
  currentValue: string,
  setValue: (v: string) => void,
  emoji: string,
) {
  const input = inputRef.current;
  if (input) {
    const start = input.selectionStart ?? currentValue.length;
    const end = input.selectionEnd ?? currentValue.length;
    const next = currentValue.slice(0, start) + emoji + currentValue.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      const pos = start + emoji.length;
      input.setSelectionRange(pos, pos);
      input.focus();
    });
  } else {
    setValue(currentValue + emoji);
  }
}

export default function PostCard({
  post,
  currentUserId,
  currentUserName,
  currentUserImage,
  initialLiked,
  initialBookmarked = false,
}: PostCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const replyInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [showEditEmoji, setShowEditEmoji] = useState(false);

  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserId === post.author.id;
  const displayName = post.author.name || post.author.username;

  const mapCommentsDeep = (
    list: Comment[],
    id: string,
    updater: (c: Comment) => Comment,
  ): Comment[] =>
    list.map((c) =>
      c.id === id
        ? updater(c)
        : { ...c, replies: mapCommentsDeep(c.replies, id, updater) },
    );

  const filterCommentsDeep = (list: Comment[], id: string): Comment[] =>
    list
      .filter((c) => c.id !== id)
      .map((c) => ({ ...c, replies: filterCommentsDeep(c.replies, id) }));

  const toggleLike = (c: Comment) => ({
    ...c,
    likedByMe: !c.likedByMe,
    likeCount: c.likedByMe ? c.likeCount - 1 : c.likeCount + 1,
  });

  useEffect(() => {
    if (!showMenu) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showMenu]);

  const handleLike = () => {
    if (!currentUserId) return;
    const was = liked;
    setLiked(!was);
    setLikeCount((p) => (was ? p - 1 : p + 1));
    startTransition(async () => {
      const r = await likePost(post.id);
      if (r.error) {
        setLiked(was);
        setLikeCount((p) => (was ? p + 1 : p - 1));
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const r = await deletePost(post.id);
      if (r.error) toast.error(r.error);
      else setIsDeleted(true);
    });
  };

  const handleToggleComments = async () => {
    const opening = !showComments;
    setShowComments(opening);
    if (opening && !commentsLoaded) {
      setLoadingComments(true);
      try {
        const data = await getComments(post.id);
        setComments(data);
        setCommentsLoaded(true);
      } catch {
        toast.error("Failed to load comments");
      } finally {
        setLoadingComments(false);
      }
    }
    if (opening) setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim() || !currentUserId) return;
    const text = commentText;
    setCommentText("");
    startTransition(async () => {
      const r = await createComment(post.id, text);
      if (r.error) {
        toast.error(r.error);
        setCommentText(text);
      } else if (r.comment) {
        setComments((prev) => [...prev, r.comment!]);
        setCommentCount((p) => p + 1);
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => filterCommentsDeep(prev, commentId));
    setCommentCount((p) => p - 1);
    startTransition(async () => {
      const r = await deleteComment(commentId);
      if (r.error) {
        toast.error(r.error);
        const data = await getComments(post.id);
        setComments(data);
        setCommentCount(data.length);
      }
    });
  };

  const handleStartEdit = (id: string, text: string) => {
    setEditingCommentId(id);
    setEditingCommentText(text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
    setShowEditEmoji(false);
  };

  const handleSaveEdit = () => {
    if (!editingCommentId || !editingCommentText.trim()) return;
    const id = editingCommentId;
    const newText = editingCommentText.trim();
    setComments((prev) => mapCommentsDeep(prev, id, (c) => ({ ...c, text: newText })));
    setEditingCommentId(null);
    setEditingCommentText("");
    setShowEditEmoji(false);
    startTransition(async () => {
      const r = await editComment(id, newText);
      if (r.error) {
        toast.error(r.error);
        const data = await getComments(post.id);
        setComments(data);
      }
    });
  };

  const handleSubmitReply = () => {
    if (!replyText.trim() || !replyingToId) return;
    const parentId = replyingToId;
    const text = replyText;
    setReplyText("");
    setReplyingToId(null);
    startTransition(async () => {
      const r = await createComment(post.id, text, parentId);
      if (r.error) toast.error(r.error);
      else if (r.comment) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replies: [...c.replies, r.comment!] } : c,
          ),
        );
        setCommentCount((p) => p + 1);
      }
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success("Link copied to clipboard");
    setShowMenu(false);
  };

  const handleBookmark = () => {
    const was = bookmarked;
    setBookmarked(!was);
    toast.success(was ? "Removed from bookmarks" : "Saved to bookmarks");
    setShowMenu(false);
    startTransition(async () => {
      const r = await bookmarkPost(post.id);
      if ("error" in r) {
        setBookmarked(was);
        toast.error(r.error!);
      }
    });
  };

  const handleCommentLike = (commentId: string) => {
    if (!currentUserId) return;
    setComments((prev) => mapCommentsDeep(prev, commentId, toggleLike));
    startTransition(async () => {
      const r = await likeComment(commentId);
      if (r.error) setComments((prev) => mapCommentsDeep(prev, commentId, toggleLike));
    });
  };

  const handlePinComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => ({ ...c, isPinned: c.id === commentId ? !c.isPinned : false })),
    );
    startTransition(async () => {
      const r = await pinComment(commentId);
      if ("error" in r) {
        toast.error(r.error!);
        const data = await getComments(post.id);
        setComments(data);
      }
    });
  };

  const renderComment = (c: Comment, isReply: boolean) => {
    const cName = c.author.name || c.author.username;
    const isCommentOwner = currentUserId === c.author.id;
    const isPostOwner = currentUserId === post.author.id;
    const isEdited = new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime() > 1000;

    return (
      <div key={c.id} className={isReply ? "ml-8 mt-2" : ""}>
        {c.isPinned && (
          <div className="flex items-center gap-1.5 mb-1 ml-10 text-[10px] font-medium text-amber-400">
            <Pin size={10} />
            Pinned
          </div>
        )}
        <div className="flex gap-2.5 group/comment">
          <Link href={`/profile/${c.author.username}`}>
            <AvatarDisplay name={cName} image={c.author.profileImage} size="xs" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="bg-muted rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Link href={`/profile/${c.author.username}`} className="text-xs font-semibold text-foreground hover:underline">
                  {cName}
                </Link>
                <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                {isEdited && <span className="text-[10px] italic text-muted-foreground/60">(edited)</span>}
              </div>
              {editingCommentId === c.id ? (
                <div className="mt-1 flex gap-2 items-center">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    maxLength={300}
                    autoFocus
                    className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <EmojiPickerButton
                    iconSize={14}
                    onEmojiSelect={(emoji) => insertAtCursor(editInputRef, editingCommentText, setEditingCommentText, emoji)}
                  />
                  <button onClick={handleSaveEdit} disabled={!editingCommentText.trim()} className="text-[11px] font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50">Save</button>
                  <button onClick={handleCancelEdit} className="text-[11px] font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                </div>
              ) : (
                <p className="text-sm text-foreground/80 mt-0.5 break-words">{renderTextWithMentions(c.text)}</p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 ml-3">
              {currentUserId ? (
                <button
                  onClick={() => handleCommentLike(c.id)}
                  className={`flex items-center gap-1 text-[11px] transition-colors ${c.likedByMe ? "text-pink-400" : "text-muted-foreground hover:text-pink-400"}`}
                >
                  <Heart size={14} fill={c.likedByMe ? "currentColor" : "none"} />
                  {c.likeCount > 0 && <span>{formatCount(c.likeCount)}</span>}
                </button>
              ) : (
                c.likeCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Heart size={14} />
                    {formatCount(c.likeCount)}
                  </span>
                )
              )}
              {currentUserId && !isReply && (
                <button
                  onClick={() => { setReplyingToId(replyingToId === c.id ? null : c.id); setReplyText(""); }}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reply
                </button>
              )}
              {isPostOwner && !isReply && (
                <button
                  onClick={() => handlePinComment(c.id)}
                  className={`text-[11px] transition-colors opacity-0 group-hover/comment:opacity-100 ${c.isPinned ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"}`}
                >
                  {c.isPinned ? "Unpin" : "Pin"}
                </button>
              )}
              {isCommentOwner && editingCommentId !== c.id && (
                <button onClick={() => handleStartEdit(c.id, c.text)} className="text-[11px] text-muted-foreground hover:text-blue-400 opacity-0 group-hover/comment:opacity-100 transition-opacity">Edit</button>
              )}
              {isCommentOwner && (
                <button onClick={() => setDeleteCommentId(c.id)} className="text-[11px] text-muted-foreground hover:text-red-400 opacity-0 group-hover/comment:opacity-100 transition-opacity">Delete</button>
              )}
            </div>
          </div>
        </div>

        {c.replies?.length > 0 && (
          <div className="space-y-2">
            {c.replies.map((r) => renderComment(r, true))}
          </div>
        )}

        {replyingToId === c.id && currentUserId && (
          <div className="flex gap-2 ml-8 mt-2">
            <AvatarDisplay name={currentUserName || "U"} image={currentUserImage || null} size="xs" />
            <div className="flex-1 flex gap-2 items-center">
              <input
                ref={replyInputRef}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitReply(); }
                  if (e.key === "Escape") { setReplyingToId(null); setReplyText(""); }
                }}
                placeholder={`Reply to ${cName}...`}
                maxLength={300}
                autoFocus
                className="flex-1 bg-muted border border-border rounded-xl px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <EmojiPickerButton
                iconSize={14}
                onEmojiSelect={(emoji) => insertAtCursor(replyInputRef, replyText, setReplyText, emoji)}
              />
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || isPending}
                className="px-2.5 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground text-xs font-medium rounded-lg transition-all"
              >
                Reply
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isDeleted) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:border-muted-foreground/20 transition-colors duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <AvatarDisplay name={displayName} image={post.author.profileImage} />
          </Link>
          <div>
            <Link href={`/profile/${post.author.username}`} className="font-semibold text-foreground text-sm hover:underline">
              {displayName}
            </Link>
            <p className="text-muted-foreground text-xs">
              @{post.author.username} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="p-2 text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              {showDeleteConfirm && (
                <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-xl shadow-black/30 p-3 z-10 w-48">
                  <p className="text-xs text-foreground/80 mb-2">Delete this post?</p>
                  <div className="flex gap-2">
                    <button onClick={handleDelete} disabled={isPending} className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">Delete</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-1.5 bg-muted hover:bg-accent text-muted-foreground text-xs font-medium rounded-lg transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-xl shadow-black/30 py-1 z-20 w-52">
                <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors">
                  <Link2 size={16} className="text-muted-foreground" />
                  Copy link
                </button>
                <button onClick={handleBookmark} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors">
                  <Bookmark size={16} className="text-muted-foreground" fill={bookmarked ? "currentColor" : "none"} />
                  {bookmarked ? "Remove bookmark" : "Save post"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-foreground/90 text-sm leading-relaxed mt-3">
        {renderTextWithMentions(post.content)}
      </p>

      {post.image && (
        <>
          <div className="mt-3 rounded-xl overflow-hidden border border-border cursor-pointer" onClick={() => setShowImageModal(true)}>
            <Image src={post.image} alt="" width={800} height={600} className="w-full max-h-96 object-contain bg-black/20" />
          </div>
          {showImageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <button onClick={() => setShowImageModal(false)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors">
                <X size={20} />
              </button>
              <Image src={post.image} alt="" width={1920} height={1080} className="relative z-10 max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            </div>
          )}
        </>
      )}

      <div className="flex items-center gap-8 mt-4 pt-3 border-t border-border/60">
        {currentUserId ? (
          <button onClick={handleLike} disabled={isPending} className={`flex items-center gap-2 transition-colors group/action ${liked ? "text-pink-400" : "text-muted-foreground hover:text-pink-400"}`}>
            <Heart size={20} fill={liked ? "currentColor" : "none"} className="group-hover/action:scale-110 transition-transform" />
            <span className="text-sm">{formatCount(likeCount)}</span>
          </button>
        ) : (
          <Link href="/login" className="flex items-center gap-2 text-muted-foreground hover:text-pink-400 transition-colors group/action">
            <Heart size={20} className="group-hover/action:scale-110 transition-transform" />
            <span className="text-sm">{formatCount(likeCount)}</span>
          </Link>
        )}

        <button onClick={handleToggleComments} className={`flex items-center gap-2 transition-colors group/action ${showComments ? "text-blue-400" : "text-muted-foreground hover:text-blue-400"}`}>
          <MessageCircle size={20} className="group-hover/action:scale-110 transition-transform" />
          <span className="text-sm">{formatCount(commentCount)}</span>
        </button>

        {currentUserId && (
          <button onClick={handleBookmark} className={`ml-auto transition-colors ${bookmarked ? "text-blue-400" : "text-muted-foreground/50 hover:text-blue-400"}`}>
            <Bookmark size={20} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-border/60">
          {loadingComments && (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="text-muted-foreground animate-spin" />
            </div>
          )}

          {!loadingComments && comments.length === 0 && (
            <p className="text-muted-foreground text-xs text-center py-3">No comments yet. Be the first!</p>
          )}

          {!loadingComments && comments.length > 0 && (
            <div className={`space-y-3 pr-1 ${showEditEmoji ? "overflow-visible" : "max-h-80 overflow-y-auto"}`}>
              {comments.map((c) => renderComment(c, false))}
            </div>
          )}

          {currentUserId ? (
            <div className="flex gap-2.5 mt-3">
              <AvatarDisplay name={currentUserName || "U"} image={currentUserImage || null} size="xs" />
              <div className="flex-1 flex gap-2 items-center">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); }
                  }}
                  placeholder="Write a comment..."
                  maxLength={300}
                  className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <EmojiPickerButton
                  onEmojiSelect={(emoji) => insertAtCursor(commentInputRef, commentText, setCommentText, emoji)}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isPending}
                  className="px-3 py-2 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground text-sm font-medium rounded-xl transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-3 py-2">
              Sign in to comment
            </Link>
          )}
        </div>
      )}

      <DeleteConfirmModal
        open={deleteCommentId !== null}
        onCancel={() => setDeleteCommentId(null)}
        onConfirm={() => {
          if (deleteCommentId) {
            handleDeleteComment(deleteCommentId);
            setDeleteCommentId(null);
          }
        }}
      />
    </div>
  );
}
