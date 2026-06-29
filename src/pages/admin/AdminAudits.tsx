import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Download,
  ClipboardCheck,
  Users,
  Target,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = ["fluency", "strategy", "action", "governance", "capacity"] as const;
type Category = (typeof CATEGORIES)[number];

interface AuditAttemptRow {
  attempt_id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  district_name: string | null;
  started_at: string;
  completed_at: string | null;
  attempt_number: number;
  response_count: number;
  fluency_avg: number | null;
  strategy_avg: number | null;
  action_avg: number | null;
  governance_avg: number | null;
  capacity_avg: number | null;
  lowest_category: Category | null;
  recommended_course: string | null;
}

interface AuditResponseRow {
  response_id: string;
  category: Category;
  item_key: string;
  score: number;
  created_at: string;
}

function fmtAvg(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return Number(n).toFixed(2);
}

function scoreCellClass(n: number | null | undefined): string {
  if (n === null || n === undefined) return "text-slate-500";
  if (n < 2) return "text-red-400 font-semibold";
  if (n < 2.75) return "text-amber-400 font-semibold";
  if (n < 3.5) return "text-emerald-400 font-semibold";
  return "text-emerald-300 font-semibold";
}

function exportToCsv(rows: AuditAttemptRow[]) {
  const headers = [
    "Name", "Email", "Role", "District", "Started", "Completed",
    "Attempt #", "Responses",
    "Fluency", "Strategy", "Action", "Governance", "Capacity",
    "Lowest Category", "Recommended Course",
  ];
  const data = rows.map((r) => [
    r.full_name || "",
    r.email || "",
    r.role || "",
    r.district_name || "",
    format(new Date(r.started_at), "yyyy-MM-dd HH:mm"),
    r.completed_at ? format(new Date(r.completed_at), "yyyy-MM-dd HH:mm") : "",
    String(r.attempt_number),
    String(r.response_count),
    fmtAvg(r.fluency_avg),
    fmtAvg(r.strategy_avg),
    fmtAvg(r.action_avg),
    fmtAvg(r.governance_avg),
    fmtAvg(r.capacity_avg),
    r.lowest_category || "",
    r.recommended_course || "",
  ]);
  const csv = [headers, ...data]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-attempts-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminAudits() {
  const [search, setSearch] = useState("");
  const [completedOnly, setCompletedOnly] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [selected, setSelected] = useState<AuditAttemptRow | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-audit-attempts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_audit_attempts_admin");
      if (error) throw error;
      return (data || []) as AuditAttemptRow[];
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-audit-detail", selected?.attempt_id],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_audit_attempt_detail_admin", {
        _attempt_id: selected!.attempt_id,
      });
      if (error) throw error;
      return (data || []) as AuditResponseRow[];
    },
  });

  const allRoles = useMemo(
    () => Array.from(new Set((rows || []).map((r) => r.role).filter(Boolean) as string[])).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    return (rows || []).filter((r) => {
      if (completedOnly && !r.completed_at) return false;
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${r.full_name || ""} ${r.email || ""} ${r.district_name || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, roleFilter, completedOnly]);

  // Stats
  const completedRows = (rows || []).filter((r) => !!r.completed_at);
  const totalAttempts = (rows || []).length;
  const totalCompleted = completedRows.length;
  const uniqueUsers = new Set((rows || []).map((r) => r.user_id)).size;

  const catAverages = useMemo(() => {
    const result: Record<Category, { sum: number; n: number }> = {
      fluency: { sum: 0, n: 0 },
      strategy: { sum: 0, n: 0 },
      action: { sum: 0, n: 0 },
      governance: { sum: 0, n: 0 },
      capacity: { sum: 0, n: 0 },
    };
    completedRows.forEach((r) => {
      CATEGORIES.forEach((cat) => {
        const v = r[`${cat}_avg` as keyof AuditAttemptRow] as number | null;
        if (typeof v === "number" && !isNaN(v)) {
          result[cat].sum += Number(v);
          result[cat].n += 1;
        }
      });
    });
    return CATEGORIES.map((cat) => ({
      category: cat,
      avg: result[cat].n > 0 ? result[cat].sum / result[cat].n : null,
    }));
  }, [completedRows]);

  const lowestCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    completedRows.forEach((r) => {
      if (r.lowest_category) counts[r.lowest_category] = (counts[r.lowest_category] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { counts, top };
  }, [completedRows]);

  const maxBar = Math.max(4, ...catAverages.map((c) => c.avg || 0));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">AI Equity Audit</h1>
            <p className="text-slate-400 font-body mt-1">
              See who has taken the audit, their scores, and the cohort-wide gaps.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-slate-700 gap-2"
            onClick={() => filtered.length > 0 && exportToCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<ClipboardCheck className="h-4 w-4" />}
            label="Total Attempts"
            value={isLoading ? "…" : `${totalAttempts}`}
            sub={isLoading ? "" : `${totalCompleted} completed`}
          />
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Unique Learners"
            value={isLoading ? "…" : `${uniqueUsers}`}
          />
          <StatCard
            icon={<Target className="h-4 w-4" />}
            label="Most Common Gap"
            value={
              isLoading
                ? "…"
                : lowestCounts.top
                ? `${capitalize(lowestCounts.top[0])} (${lowestCounts.top[1]})`
                : "—"
            }
          />
          <StatCard
            icon={<TrendingDown className="h-4 w-4" />}
            label="Lowest Avg Category"
            value={
              isLoading
                ? "…"
                : (() => {
                    const valid = catAverages.filter((c) => c.avg !== null) as {
                      category: Category;
                      avg: number;
                    }[];
                    if (valid.length === 0) return "—";
                    const low = valid.reduce((a, b) => (a.avg < b.avg ? a : b));
                    return `${capitalize(low.category)} (${low.avg.toFixed(2)})`;
                  })()
            }
          />
        </div>

        {/* Category bar chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
          <h2 className="text-lg font-display font-semibold text-white mb-4">
            Cohort averages by category
          </h2>
          <div className="space-y-3">
            {catAverages.map((c) => {
              const pct = c.avg ? (c.avg / 4) * 100 : 0;
              return (
                <div key={c.category} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-slate-300 capitalize font-body">
                    {c.category}
                  </div>
                  <div className="flex-1 h-6 bg-slate-900 rounded overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-primary/70 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className={`w-16 text-right text-sm tabular-nums ${scoreCellClass(c.avg)}`}>
                    {fmtAvg(c.avg)}
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-slate-500 pt-1">Score range: 1 (lowest) to 4 (highest).</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or district…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-md px-3 h-10">
              <Switch
                id="completed-only"
                checked={completedOnly}
                onCheckedChange={setCompletedOnly}
              />
              <Label htmlFor="completed-only" className="text-slate-300 text-sm cursor-pointer">
                Completed only
              </Label>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {allRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {formatRoleLabel(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800">
                <TableHead className="text-slate-300">Learner</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">District</TableHead>
                <TableHead className="text-slate-300">Completed</TableHead>
                <TableHead className="text-slate-300 text-center">Flu</TableHead>
                <TableHead className="text-slate-300 text-center">Str</TableHead>
                <TableHead className="text-slate-300 text-center">Act</TableHead>
                <TableHead className="text-slate-300 text-center">Gov</TableHead>
                <TableHead className="text-slate-300 text-center">Cap</TableHead>
                <TableHead className="text-slate-300">Next Step</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-700">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow className="border-slate-700">
                  <TableCell colSpan={10} className="text-center py-10 text-slate-400">
                    No audit attempts match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow
                    key={r.attempt_id}
                    className="border-slate-700 hover:bg-slate-750 cursor-pointer"
                    onClick={() => setSelected(r)}
                  >
                    <TableCell>
                      <div className="font-medium text-white">{r.full_name || "—"}</div>
                      <div className="text-xs text-slate-400">{r.email}</div>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {formatRoleLabel(r.role)}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {r.district_name || "—"}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {r.completed_at
                        ? format(new Date(r.completed_at), "MMM d, yyyy")
                        : <Badge variant="outline" className="border-amber-500/40 text-amber-300">In progress</Badge>}
                    </TableCell>
                    <TableCell className={`text-center text-sm tabular-nums ${scoreCellClass(r.fluency_avg)}`}>{fmtAvg(r.fluency_avg)}</TableCell>
                    <TableCell className={`text-center text-sm tabular-nums ${scoreCellClass(r.strategy_avg)}`}>{fmtAvg(r.strategy_avg)}</TableCell>
                    <TableCell className={`text-center text-sm tabular-nums ${scoreCellClass(r.action_avg)}`}>{fmtAvg(r.action_avg)}</TableCell>
                    <TableCell className={`text-center text-sm tabular-nums ${scoreCellClass(r.governance_avg)}`}>{fmtAvg(r.governance_avg)}</TableCell>
                    <TableCell className={`text-center text-sm tabular-nums ${scoreCellClass(r.capacity_avg)}`}>{fmtAvg(r.capacity_avg)}</TableCell>
                    <TableCell>
                      {r.recommended_course ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30 capitalize">
                          {r.recommended_course}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="bg-slate-900 border-slate-700 text-white overflow-y-auto w-full sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white font-display">
                  {selected.full_name || "Unnamed learner"}
                </SheetTitle>
                <SheetDescription className="text-slate-400">
                  {selected.email} · {formatRoleLabel(selected.role)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Info label="District" value={selected.district_name || "—"} />
                  <Info label="Attempt" value={`#${selected.attempt_number}`} />
                  <Info
                    label="Started"
                    value={format(new Date(selected.started_at), "MMM d, yyyy")}
                  />
                  <Info
                    label="Completed"
                    value={
                      selected.completed_at
                        ? format(new Date(selected.completed_at), "MMM d, yyyy")
                        : "In progress"
                    }
                  />
                  <Info
                    label="Lowest Category"
                    value={selected.lowest_category ? capitalize(selected.lowest_category) : "—"}
                  />
                  <Info label="Recommended" value={selected.recommended_course || "—"} />
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Category averages</p>
                  <div className="grid grid-cols-5 gap-2">
                    {CATEGORIES.map((cat) => {
                      const v = selected[`${cat}_avg` as keyof AuditAttemptRow] as number | null;
                      return (
                        <div
                          key={cat}
                          className="bg-slate-800 border border-slate-700 rounded p-2 text-center"
                        >
                          <div className="text-[10px] uppercase tracking-wide text-slate-400">
                            {cat.slice(0, 3)}
                          </div>
                          <div className={`text-sm tabular-nums ${scoreCellClass(v)}`}>
                            {fmtAvg(v)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">
                    Individual responses ({detail?.length || 0})
                  </p>
                  {detailLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : detail && detail.length > 0 ? (
                    <div className="border border-slate-700 rounded overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700 hover:bg-slate-800">
                            <TableHead className="text-slate-400 text-xs h-8">Category</TableHead>
                            <TableHead className="text-slate-400 text-xs h-8">Item</TableHead>
                            <TableHead className="text-slate-400 text-xs h-8 text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detail.map((d) => (
                            <TableRow key={d.response_id} className="border-slate-700">
                              <TableCell className="capitalize text-slate-300 text-sm py-1.5">
                                {d.category}
                              </TableCell>
                              <TableCell className="text-slate-400 text-xs font-mono py-1.5">
                                {d.item_key}
                              </TableCell>
                              <TableCell
                                className={`text-right tabular-nums py-1.5 ${scoreCellClass(d.score)}`}
                              >
                                {d.score}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No responses recorded.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-sm font-body">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded p-2">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm text-white font-body">{value}</div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatRoleLabel(role: string | null): string {
  if (!role) return "—";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
