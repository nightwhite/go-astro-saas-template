import type { ReactNode } from "react";

interface DataTableColumn<T> {
  key: string;
  title: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  items: T[];
}

export function DataTable<T>({ columns, items }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="min-w-full divide-y divide-border text-left">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-xs font-medium text-muted-foreground md:px-5">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/90">
          {items.map((item, rowIndex) => (
            <tr key={rowIndex} className="align-top transition-colors hover:bg-muted/50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-4 text-sm text-foreground md:px-5">
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
