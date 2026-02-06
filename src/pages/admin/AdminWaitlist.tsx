import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Search,
  ClipboardList,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  CalendarDays,
  Save,
  Loader2,
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { toast } from "sonner";

interface WaitlistLead {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  source: string | null;
  interested_courses: string[] | null;
  notes: string | null;
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: "superintendent", label: "Superintendent" },
  { value: "principal", label: "Principal" },
  { value: "assistant_principal", label: "Assistant Principal" },
  { value: "curriculum_director", label: "Curriculum Director" },
  { value: "technology_director", label: "Technology Director" },
  { value: "teacher_leader", label: "Teacher Leader" },
  { value: "other", label: "Other" },
];

const ITEMS_PER_PAGE = 10;

function formatRole(role: string | null): string {
  if (!role) return "N/A";
  const match = ROLE_OPTIONS.find((r) => r.value === role);
  return match ? match.label : role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatSource(source: string | null): string {
  if (!source) return "—";
  if (source === "hero") return "Homepage";
  if (source.startsWith("featured-")) return `Course: ${source.replace("featured-", "")}`;
  return source;
}

function exportToCsv(leads: WaitlistLead[]) {
  const headers = ["Name", "Email", "Role", "Interested Courses", "Source", "Date", "Notes"];
  const rows = leads.map((l) => [
    l.full_name || "",
    l.email,
    formatRole(l.role),
    (l.interested_courses || []).join("; "),
    formatSource(l.source),
    format(new Date(l.created_at), "yyyy-MM-dd"),
    (l.notes || "").replace(/"/g, '""'),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `waitlist-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminWaitlist() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<WaitlistLead | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WaitlistLead[];
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from("waitlist_leads")
        .update({ notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notes saved");
      queryClient.invalidateQueries({ queryKey: ["admin-waitlist"] });
      if (selectedLead) {
        setSelectedLead({ ...selectedLead, notes: editNotes });
      }
    },
    onError: () => toast.error("Failed to save notes"),
  });

  // Derived data
  const allCourseSlugs = Array.from(
    new Set((leads || []).flatMap((l) => l.interested_courses || []))
  ).sort();

  const filtered = (leads || []).filter((lead) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        lead.full_name?.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.role?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (roleFilter !== "all" && lead.role !== roleFilter) return false;
    if (courseFilter !== "all" && !(lead.interested_courses || []).includes(courseFilter))
      return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const totalLeads = leads?.length || 0;
  const weekAgo = subDays(new Date(), 7);
  const leadsThisWeek = (leads || []).filter((l) =>
    isAfter(new Date(l.created_at), weekAgo)
  ).length;

  const courseInterestCounts: Record<string, number> = {};
  (leads || []).forEach((l) => {
    (l.interested_courses || []).forEach((slug) => {
      courseInterestCounts[slug] = (courseInterestCounts[slug] || 0) + 1;
    });
  });
  const topCourse = Object.entries(courseInterestCounts).sort((a, b) => b[1] - a[1])[0];

  const openDetail = (lead: WaitlistLead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || "");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Waitlist</h1>
            <p className="text-slate-400 font-body mt-1">
              Track and manage prospective leads
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <ClipboardList className="h-4 w-4" />
              <span className="text-sm font-body">Total Leads</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">{totalLeads}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm font-body">This Week</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">{leadsThisWeek}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-body">Top Course Interest</span>
            </div>
            <p className="text-2xl font-display font-bold text-white capitalize">
              {topCourse ? `${topCourse[0]} (${topCourse[1]})` : "—"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={courseFilter}
              onValueChange={(v) => {
                setCourseFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {allCourseSlugs.map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800">
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Email</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">Interested Courses</TableHead>
                <TableHead className="text-slate-300">Source</TableHead>
                <TableHead className="text-slate-300">Signed Up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-700">
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow className="border-slate-700">
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    No leads found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="border-slate-700 hover:bg-slate-750 cursor-pointer"
                    onClick={() => openDetail(lead)}
                  >
                    <TableCell className="font-medium text-white">
                      {lead.full_name || "No name"}
                    </TableCell>
                    <TableCell className="text-slate-300">{lead.email}</TableCell>
                    <TableCell className="text-slate-300">{formatRole(lead.role)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(lead.interested_courses || []).length > 0
                          ? (lead.interested_courses || []).map((slug) => (
                              <Badge
                                key={slug}
                                className="bg-primary/20 text-primary border-primary/30 capitalize text-xs"
                              >
                                {slug}
                              </Badge>
                            ))
                          : <span className="text-slate-500 text-sm">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {formatSource(lead.source)}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {format(new Date(lead.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} leads
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail Drawer */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="bg-slate-900 border-slate-700 text-white overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white font-display">
                  {selectedLead.full_name || "No name"}
                </SheetTitle>
                <SheetDescription className="text-slate-400">
                  {selectedLead.email}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Details */}
                <div className="space-y-3">
                  <DetailRow label="Role" value={formatRole(selectedLead.role)} />
                  <DetailRow label="Source" value={formatSource(selectedLead.source)} />
                  <DetailRow
                    label="Signed Up"
                    value={format(new Date(selectedLead.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  />
                </div>

                {/* Interested Courses */}
                <div>
                  <p className="text-sm text-slate-400 mb-2">Interested Courses</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedLead.interested_courses || []).length > 0 ? (
                      (selectedLead.interested_courses || []).map((slug) => (
                        <Badge
                          key={slug}
                          className="bg-primary/20 text-primary border-primary/30 capitalize"
                        >
                          {slug}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">No specific courses selected</span>
                    )}
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <p className="text-sm text-slate-400 mb-2">Admin Notes</p>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                  <Button
                    size="sm"
                    className="mt-2 gap-2"
                    onClick={() =>
                      updateNotesMutation.mutate({
                        id: selectedLead.id,
                        notes: editNotes,
                      })
                    }
                    disabled={updateNotesMutation.isPending}
                  >
                    {updateNotesMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}
