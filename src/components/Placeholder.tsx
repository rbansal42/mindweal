interface PlaceholderProps {
  text?: string;
  className?: string;
}

export function Placeholder({ text = "MindWeal", className = "" }: PlaceholderProps) {
  return (
    <div
      className={`w-full h-full bg-gradient-to-br from-[var(--primary-teal)]/20 to-[var(--secondary-green)]/20 flex items-center justify-center ${className}`}
    >
      <span className="text-4xl font-bold text-[var(--primary-teal)]/40">
        {text.charAt(0)}
      </span>
    </div>
  );
}
