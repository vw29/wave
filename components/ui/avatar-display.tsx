import { getAvatarGradient } from "@/lib/utils";

interface AvatarDisplayProps {
  name: string;
  image: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  xs: { dim: "w-7 h-7", text: "text-[10px]" },
  sm: { dim: "w-10 h-10", text: "text-sm" },
  md: { dim: "w-16 h-16", text: "text-xl" },
  lg: { dim: "w-20 h-20", text: "text-2xl" },
};

export default function AvatarDisplay({
  name,
  image,
  size = "sm",
  className = "",
}: AvatarDisplayProps) {
  const { dim, text } = sizes[size];
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${dim} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br ${getAvatarGradient(name)} flex items-center justify-center ${text} font-bold text-white flex-shrink-0 ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
