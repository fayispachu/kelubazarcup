import Image from "next/image";

export function TeamLogo({
  src,
  name,
  size = 56,
}: {
  src?: string;
  name?: string;
  size?: number;
}) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "KC";

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 text-sm font-bold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={`${name ?? "Team"} logo`} fill className="object-contain p-1" />
      ) : (
        initials
      )}
    </div>
  );
}
