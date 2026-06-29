import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Plus, Search, MoreHorizontal, Pencil, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Category = "governance" | "strategy" | "classroom" | "leadership";

interface Row {
  id: string;
  slug: string;
  title: string;
  category: Category;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
}

const CATEGORY_LABELS: Record<Category, string> = {
  governance: "Governance",
  strategy: "Strategy",
  classroom: "Classroom",
  leadership: "Leadership",
};

export default function AdminResources() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Row | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("id, slug, title, category, status, published_at, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Row[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resource deleted");
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const draftSlug = `untitled-${Date.now().toString(36)}`;
      const { data, error } = await supabase
        .from("resources")
        .insert({ slug: draftSlug, title: "Untitled draft", status: "draft" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      window.location.href = `/admin/resources/${id}`;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows || []).filter((r) => !q || r.title.toLowerCase().includes(q) || r.slug.includes(q));
  }, [rows, search]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Resources</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Articles published at <code className="text-xs">/resources</code>.
            </p>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" /> New post
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No resources yet. Create your first post.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link to={`/admin/resources/${r.id}`} className="font-medium hover:text-primary">
                        {r.title}
                      </Link>
                      <div className="text-xs text-muted-foreground font-mono">/{r.slug}</div>
                    </TableCell>
                    <TableCell>{CATEGORY_LABELS[r.category]}</TableCell>
                    <TableCell>
                      {r.status === "published" ? (
                        <Badge>Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/resources/${r.id}`}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          {r.status === "published" && (
                            <DropdownMenuItem asChild>
                              <a href={`/resources/${r.slug}`} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" /> View live
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleting(r)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete resource?"
        description={`"${deleting?.title}" will be permanently deleted.`}
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
