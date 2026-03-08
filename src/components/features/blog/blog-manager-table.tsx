"use client";

import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useBlogManager } from "./blog-manager-context";

// ─── Sortable column header ────────────────────────────────────────────────────
export function SortHeader({
  label,
  isSorted,
  toggle,
}: {
  label: string;
  isSorted: false | "asc" | "desc";
  toggle: ((e: unknown) => void) | undefined;
}) {
  return (
    <button
      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors group"
      onClick={toggle}
    >
      {label}
      {isSorted === "asc" ? (
        <ArrowUp className="h-3 w-3 text-foreground" />
      ) : isSorted === "desc" ? (
        <ArrowDown className="h-3 w-3 text-foreground" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
      )}
    </button>
  );
}

// ─── Simple shadcn/ui DataTable ────────────────────────────────────────────────
export function BlogManagerTable() {
  const {
    state: { table, sorting },
    actions: { setSorting },
  } = useBlogManager();

  const rows = table.getRowModel().rows;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="bg-muted/50 dark:bg-muted/30 hover:bg-muted/50 dark:hover:bg-muted/30"
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 px-4 first:pl-5 last:pr-5 bg-muted/50 dark:bg-muted/30"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border/50 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3.5 first:pl-5 last:pr-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-muted/20 text-[11px] text-muted-foreground font-medium">
        <span>
          <span className="text-foreground font-semibold">{rows.length}</span>{" "}
          row{rows.length !== 1 ? "s" : ""}
        </span>
        {sorting.length > 0 && (
          <button
            onClick={() => setSorting([])}
            className="hover:text-foreground transition-colors"
          >
            Clear sort
          </button>
        )}
      </div>
    </div>
  );
}
