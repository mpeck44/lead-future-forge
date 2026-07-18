import { Fragment, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";

type ErrorRow = {
  id: string;
  created_at: string;
  user_id: string | null;
  message: string;
  stack: string | null;
  source: string | null;
  url: string | null;
  user_agent: string | null;
  kind: string;
  context: Record<string, unknown> | null;
};

const PAGE_SIZE = 50;

export default function AdminErrors() {
  const [rows, setRows] = useState<ErrorRow[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<string>("all");
  const [range, setRange] = useState<string>("7d");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("client_error_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (kind !== "all") q = q.eq("kind", kind);
    if (range !== "all") {
      const days = range === "24h" ? 1 : range === "7d" ? 7 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      q = q.gte("created_at", since);
    }
    if (search.trim()) q = q.ilike("message", `%${search.trim()}%`);

    const { data, count, error } = await q;
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    const list = (data ?? []) as ErrorRow[];
    setRows(list);
    setTotal(count ?? 0);

    // Fetch emails for user_ids we don't have yet
    const missing = Array.from(
      new Set(list.map((r) => r.user_id).filter((v): v is string => !!v && !emails[v]))
    );
    if (missing.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,email")
        .in("id", missing);
      if (profs) {
        const next = { ...emails };
        for (const p of profs) next[p.id] = p.email ?? "";
        setEmails(next);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, range, page]);

  const toggle = (id: string) => {
    const n = new Set(expanded);
    n.has(id) ? n.delete(id) : n.add(id);
    setExpanded(n);
  };

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Client Errors</h1>
            <p className="text-slate-400 text-sm">
              JavaScript errors captured from browsers ({total} total)
            </p>
          </div>
          <Button
            onClick={() => {
              setPage(0);
              void load();
            }}
            variant="outline"
            className="border-slate-700 text-slate-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Select value={kind} onValueChange={(v) => { setPage(0); setKind(v); }}>
            <SelectTrigger className="w-48 bg-slate-900 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kinds</SelectItem>
              <SelectItem value="error">error</SelectItem>
              <SelectItem value="unhandledrejection">unhandledrejection</SelectItem>
              <SelectItem value="manual">manual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={(v) => { setPage(0); setRange(v); }}>
            <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(0);
              void load();
            }}
            className="flex-1 min-w-[200px]"
          >
            <Input
              placeholder="Search message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border-slate-700 text-slate-200"
            />
          </form>
        </div>

        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400 text-left">
              <tr>
                <th className="p-3 w-8"></th>
                <th className="p-3 w-40">When</th>
                <th className="p-3 w-40">Kind</th>
                <th className="p-3">Message</th>
                <th className="p-3 w-56">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No errors in this range. 🎉
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr
                    key={r.id}
                    className="bg-slate-950 hover:bg-slate-900 cursor-pointer"
                    onClick={() => toggle(r.id)}
                  >
                    <td className="p-3 text-slate-500">
                      {expanded.has(r.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                        {r.kind}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200 truncate max-w-[500px]">
                      {r.message}
                    </td>
                    <td className="p-3 text-slate-400 truncate">
                      {r.user_id ? emails[r.user_id] ?? r.user_id.slice(0, 8) : "—"}
                    </td>
                  </tr>
                  {expanded.has(r.id) && (
                    <tr key={r.id + "-details"} className="bg-slate-900/50">
                      <td colSpan={5} className="p-4 space-y-3">
                        {r.url && (
                          <div>
                            <div className="text-xs uppercase text-slate-500 mb-1">URL</div>
                            <div className="text-slate-300 text-sm break-all">{r.url}</div>
                          </div>
                        )}
                        {r.source && (
                          <div>
                            <div className="text-xs uppercase text-slate-500 mb-1">Source</div>
                            <div className="text-slate-300 text-sm font-mono">{r.source}</div>
                          </div>
                        )}
                        {r.stack && (
                          <div>
                            <div className="text-xs uppercase text-slate-500 mb-1">Stack</div>
                            <pre className="text-slate-300 text-xs font-mono bg-slate-950 border border-slate-800 rounded p-3 overflow-auto whitespace-pre-wrap">
                              {r.stack}
                            </pre>
                          </div>
                        )}
                        {r.user_agent && (
                          <div>
                            <div className="text-xs uppercase text-slate-500 mb-1">User agent</div>
                            <div className="text-slate-400 text-xs">{r.user_agent}</div>
                          </div>
                        )}
                        {r.context && (
                          <div>
                            <div className="text-xs uppercase text-slate-500 mb-1">Context</div>
                            <pre className="text-slate-300 text-xs font-mono bg-slate-950 border border-slate-800 rounded p-3 overflow-auto">
                              {JSON.stringify(r.context, null, 2)}
                            </pre>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div>
              Page {page + 1} of {maxPage + 1}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="border-slate-700 text-slate-200"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= maxPage}
                onClick={() => setPage(page + 1)}
                className="border-slate-700 text-slate-200"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
