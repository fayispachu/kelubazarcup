export function LiveBadge({ active = true }: { active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
        active
          ? "bg-red-600 text-white"
          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-zinc-500"}`}
      />
      {active ? "Live" : "Off Air"}
    </span>
  );
}
