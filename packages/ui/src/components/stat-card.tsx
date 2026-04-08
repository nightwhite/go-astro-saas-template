interface StatCardProps {
  label: string;
  value: string;
  tone?: "brand" | "success" | "warning";
}

const toneClassMap = {
  brand: "bg-accent text-accent-foreground",
  success: "bg-secondary text-secondary-foreground",
  warning: "bg-muted text-foreground",
};

export function StatCard({ label, value, tone = "brand" }: StatCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClassMap[tone]}`}>
        {label}
      </span>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-card-foreground">{value}</p>
    </article>
  );
}
