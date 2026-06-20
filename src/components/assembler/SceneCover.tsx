/** 场景封面 — 插画 webp */
export function SceneCover({
  slug,
  gradient,
  titleZh,
  className = '',
}: {
  slug: string;
  gradient: string;
  titleZh: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: gradient }}
    >
      <img
        src={`/assets/scenes/${slug}.webp`}
        alt={titleZh}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}
