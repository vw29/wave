"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { likePost } from "@/actions/post/likePost";
import { deletePost } from "@/actions/post/deletePost";
import { getComments } from "@/actions/post/getComments";
import { createComment } from "@/actions/post/createComment";
import { deleteComment } from "@/actions/post/deleteComment";
import { likeComment } from "@/actions/post/likeComment";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

// ── Types ──

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    name: string | null;
    profileImage: string | null;
  };
  likeCount: number;
  likedByMe: boolean;
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
}

// ── Helpers ──

const GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-red-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-purple-600",
];

function getAvatarGradient(name: string) {
  const index =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length;
  return GRADIENTS[index];
}

function formatCount(num: number) {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function Avatar({
  name,
  image,
  size = "sm",
}: {
  name: string;
  image: string | null;
  size?: "sm" | "xs";
}) {
  const dim = size === "sm" ? "w-10 h-10" : "w-7 h-7";
  const text = size === "sm" ? "text-sm" : "text-[10px]";
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${dim} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br ${getAvatarGradient(name)} flex items-center justify-center ${text} font-bold text-white flex-shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Component ──

export default function PostCard({
  post,
  currentUserId,
  currentUserName,
  currentUserImage,
  initialLiked,
}: PostCardProps) {
  // Like state
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(post._count.likes);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Image modal
  const [showImageModal, setShowImageModal] = useState(false);

  // Three-dot menu
  const [showMenu, setShowMenu] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserId === post.author.id;
  const displayName = post.author.name || post.author.username;
  const avatarGradient = getAvatarGradient(displayName);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showMenu]);

  // ── Handlers ──

  const handleLike = () => {
    if (!currentUserId) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    startTransition(async () => {
      const result = await likePost(post.id);
      if (result.error) {
        setLiked(wasLiked);
        setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setIsDeleted(true);
      }
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
    if (opening) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  const handleSubmitComment = () => {
    if (!commentText.trim() || !currentUserId) return;
    const text = commentText;
    setCommentText("");
    startTransition(async () => {
      const result = await createComment(post.id, text);
      if (result.error) {
        toast.error(result.error);
        setCommentText(text);
      } else if (result.comment) {
        setComments((prev) => [...prev, result.comment!]);
        setCommentCount((prev) => prev + 1);
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((prev) => prev - 1);
    startTransition(async () => {
      const result = await deleteComment(commentId);
      if (result.error) {
        toast.error(result.error);
        // Re-fetch to restore
        const data = await getComments(post.id);
        setComments(data);
        setCommentCount(data.length);
      }
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success("Link copied to clipboard");
    setShowMenu(false);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
    setShowMenu(false);
  };

  const handleCommentLike = (commentId: string) => {
    if (!currentUserId) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likedByMe: !c.likedByMe,
              likeCount: c.likedByMe ? c.likeCount - 1 : c.likeCount + 1,
            }
          : c,
      ),
    );
    startTransition(async () => {
      const result = await likeComment(commentId);
      if (result.error) {
        // Revert on error
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likedByMe: !c.likedByMe,
                  likeCount: c.likedByMe ? c.likeCount - 1 : c.likeCount + 1,
                }
              : c,
          ),
        );
      }
    });
  };

  if (isDeleted) return null;

  // ── Render ──

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:border-muted-foreground/20 transition-colors duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {post.author.profileImage ? (
            <Image
              src={post.author.profileImage}
              alt={displayName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-sm hover:underline cursor-pointer">
                {displayName}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              @{post.author.username} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Delete button (owner only) */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="p-2 text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Delete post"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              {showDeleteConfirm && (
                <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-xl shadow-black/30 p-3 z-10 w-48">
                  <p className="text-xs text-foreground/80 mb-2">
                    Delete this post?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isPending}
                      className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-1.5 bg-muted hover:bg-accent text-muted-foreground text-xs font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Three-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-xl shadow-black/30 py-1 z-20 w-52">
                {/* Copy link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Copy link
                </button>

                {/* Bookmark */}
                <button
                  onClick={handleBookmark}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill={bookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {bookmarked ? "Remove bookmark" : "Save post"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-foreground/90 text-sm leading-relaxed mt-3">
        {post.content}
      </p>

      {/* Image */}
      {post.image && (
        <>
          <div
            className="mt-3 rounded-xl overflow-hidden border border-border cursor-pointer"
            onClick={() => setShowImageModal(true)}
          >
            <Image
              src={post.image}
              alt=""
              width={800}
              height={600}
              className="w-full max-h-96 object-contain bg-black/20"
            />
          </div>

          {showImageModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowImageModal(false)}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <Image
                src={post.image}
                alt=""
                width={1920}
                height={1080}
                className="relative z-10 max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-8 mt-4 pt-3 border-t border-border/60">
        {/* Like */}
        {currentUserId ? (
          <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-2 transition-colors group/action ${
              liked
                ? "text-pink-400"
                : "text-muted-foreground hover:text-pink-400"
            }`}
          >
            <svg
              className="w-5 h-5 group-hover/action:scale-110 transition-transform"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm">{formatCount(likeCount)}</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 text-muted-foreground hover:text-pink-400 transition-colors group/action"
          >
            <svg
              className="w-5 h-5 group-hover/action:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm">{formatCount(likeCount)}</span>
          </Link>
        )}

        {/* Comments toggle */}
        <button
          onClick={handleToggleComments}
          className={`flex items-center gap-2 transition-colors group/action ${
            showComments
              ? "text-blue-400"
              : "text-muted-foreground hover:text-blue-400"
          }`}
        >
          <svg
            className="w-5 h-5 group-hover/action:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm">{formatCount(commentCount)}</span>
        </button>

        {/* Bookmark (logged in only) */}
        {currentUserId && (
          <button
            onClick={handleBookmark}
            className={`ml-auto transition-colors ${
              bookmarked
                ? "text-blue-400"
                : "text-muted-foreground/50 hover:text-blue-400"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={bookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ── Inline Comments Section ── */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border/60">
          {/* Loading */}
          {loadingComments && (
            <div className="flex justify-center py-4">
              <svg
                className="w-5 h-5 text-muted-foreground animate-spin"
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
            </div>
          )}

          {/* Comment list */}
          {!loadingComments && comments.length === 0 && (
            <p className="text-muted-foreground text-xs text-center py-3">
              No comments yet. Be the first!
            </p>
          )}

          {!loadingComments && comments.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {comments.map((c) => {
                const cName = c.author.name || c.author.username;
                const isCommentOwner = currentUserId === c.author.id;
                return (
                  <div key={c.id} className="flex gap-2.5 group/comment">
                    <Avatar
                      name={cName}
                      image={c.author.profileImage}
                      size="xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            {cName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {timeAgo(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 mt-0.5 break-words">
                          {c.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 ml-3">
                        {/* Comment like */}
                        {currentUserId ? (
                          <button
                            onClick={() => handleCommentLike(c.id)}
                            className={`flex items-center gap-1 text-[11px] transition-colors ${
                              c.likedByMe
                                ? "text-pink-400"
                                : "text-muted-foreground hover:text-pink-400"
                            }`}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill={c.likedByMe ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            {c.likeCount > 0 && (
                              <span>{formatCount(c.likeCount)}</span>
                            )}
                          </button>
                        ) : (
                          c.likeCount > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              {formatCount(c.likeCount)}
                            </span>
                          )
                        )}
                        {/* Delete */}
                        {isCommentOwner && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-[11px] text-muted-foreground hover:text-red-400 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment input */}
          {currentUserId ? (
            <div className="flex gap-2.5 mt-3">
              <Avatar
                name={currentUserName || "U"}
                image={currentUserImage || null}
                size="xs"
              />
              <div className="flex-1 flex gap-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                  placeholder="Write a comment..."
                  maxLength={300}
                  className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isPending}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all"
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-3 py-2"
            >
              Sign in to comment
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
