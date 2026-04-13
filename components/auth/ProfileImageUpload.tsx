"use client";

import { useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { FORM_TEXT } from "@/lib/constants";
import toast from "react-hot-toast";
import Image from "next/image";

interface ProfileImageUploadProps {
  value?: string;
  onUploadComplete: (url: string) => void;
  onRemove: () => void;
}

export function ProfileImageUpload({
  value,
  onUploadComplete,
  onRemove,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("profileImage", {
    onClientUploadComplete: (res) => {
      const url = res[0]?.url;
      if (url) {
        onUploadComplete(url);
      }
      setIsUploading(false);
    },
    onUploadError: (error) => {
      toast.error(error.message);
      setIsUploading(false);
    },
  });

  function handleFileSelect() {
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
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium">{FORM_TEXT.profileImage.label}</p>
      <div className="relative">
        <button
          type="button"
          onClick={handleFileSelect}
          disabled={isUploading}
          className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted disabled:pointer-events-none disabled:opacity-50 overflow-hidden"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : value ? (
            <Image
              src={value}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" />
          )}
        </button>
        {value && !isUploading && (
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            className="absolute -top-1 -right-1 rounded-full"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {isUploading ? "Uploading..." : "Click to upload"}
      </p>
    </div>
  );
}
