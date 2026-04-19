import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(num: number) {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

export function timeAgo(date: Date) {
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



export function renderTextWithMentions(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9_]{3,20})/g);
  return parts.map((part, i) => {
    if (/^@[a-zA-Z0-9_]{3,20}$/.test(part)) {
      const username = part.slice(1).toLowerCase();
      return React.createElement(
        Link,
        {
          key: i,
          href: `/profile/${username}`,
          className: "text-blue-400 hover:underline font-medium",
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
        part,
      );
    }
    return part;
  });
}
