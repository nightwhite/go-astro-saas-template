import { Button } from "./button";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (nextPage: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function move(delta: number) {
    if (!onPageChange) {
      return;
    }
    const next = page + delta;
    if (next < 1 || next > totalPages) {
      return;
    }
    onPageChange(next);
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground md:text-sm">
        第 {page} / {totalPages} 页 · 共 {total} 条
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => move(-1)} disabled={!canPrev || !onPageChange}>
          上一页
        </Button>
        <Button size="sm" variant="secondary" onClick={() => move(1)} disabled={!canNext || !onPageChange}>
          下一页
        </Button>
      </div>
    </div>
  );
}
