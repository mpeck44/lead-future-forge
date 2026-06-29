import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Category = "governance" | "strategy" | "classroom" | "leadership";

interface Resource {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body_html: string;
  cover_image_url: string | null;
  category: Category;
  status: "draft" | "published";
  published_at: string | null;
  read_time_min: number | null;
  author_name: string;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "governance", label: "Governance" },
  { value: "strategy", label: "Strategy" },
  { value: "classroom", label: "Classroom" },
  { value: "leadership", label: "Leadership" },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

const computeReadTime = (html: string): number => {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
};

export default function AdminResourceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Resource | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-resource", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Resource;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const update = <K extends keyof Resource>(key: K, value: Resource[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const saveMutation = useMutation({
    mutationFn: async (publish?: boolean) => {
      if (!form) return;
      setSaving(true);
      const nextStatus = publish === true ? "published" : publish === false ? "draft" : form.status;
      const nextPublishedAt =
        nextStatus === "published" && !form.published_at ? new Date().toISOString() : form.published_at;
      const payload = {
        slug: form.slug,
        title: form.title,
        dek: form.dek,
        body_html: form.body_html,
        cover_image_url: form.cover_image_url,
        category: form.category,
        status: nextStatus,
        published_at: nextPublishedAt,
        read_time_min: computeReadTime(form.body_html),
        author_name: form.author_name,
      };
      const { error } = await supabase.from("resources").update(payload).eq("id", form.id);
      if (error) throw error;
      return nextStatus;
    },
    onSuccess: (nextStatus) => {
      toast.success(nextStatus === "published" ? "Published" : "Saved");
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      qc.invalidateQueries({ queryKey: ["admin-resource", id] });
      setSaving(false);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setSaving(false);
    },
  });

  if (isLoading || !form) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4 max-w-3xl">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </AdminLayout>
    );
  }

  const slugConflict = !form.slug || /\s/.test(form.slug);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link to="/admin/resources" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to resources
          </Link>
          <div className="flex items-center gap-2">
            {form.status === "published" && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/resources/${form.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" /> View live
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => saveMutation.mutate(undefined)}
            >
              <Save className="h-4 w-4 mr-1" /> Save draft
            </Button>
            {form.status === "published" ? (
              <Button size="sm" variant="secondary" disabled={saving} onClick={() => saveMutation.mutate(false)}>
                Unpublish
              </Button>
            ) : (
              <Button size="sm" disabled={saving || slugConflict} onClick={() => saveMutation.mutate(true)}>
                Publish
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  update("title", e.target.value);
                  if (form.status === "draft" && (!form.slug || form.slug.startsWith("untitled-"))) {
                    update("slug", slugify(e.target.value) || form.slug);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => update("slug", slugify(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">URL: /resources/{form.slug}</p>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v as Category)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dek">Dek / excerpt</Label>
              <Textarea
                id="dek"
                value={form.dek}
                onChange={(e) => update("dek", e.target.value)}
                placeholder="One- or two-sentence summary. Used in cards, meta description, and previews."
                rows={2}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-1">{form.dek.length} / 300</p>
            </div>

            <div>
              <Label htmlFor="cover">Cover image URL</Label>
              <Input
                id="cover"
                value={form.cover_image_url || ""}
                onChange={(e) => update("cover_image_url", e.target.value || null)}
                placeholder="https://... (upload via the body editor, then paste URL here)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={form.author_name}
                  onChange={(e) => update("author_name", e.target.value)}
                />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Switch
                      checked={form.status === "published"}
                      onCheckedChange={(checked) => saveMutation.mutate(checked)}
                      disabled={saving || slugConflict}
                    />
                    <span className="text-sm">{form.status === "published" ? "Published" : "Draft"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <Label>Body</Label>
            <p className="text-xs text-muted-foreground">
              Paste from Google Docs or LinkedIn — formatting, headings, and lists are cleaned up automatically. Use the image button to upload images.
            </p>
            <RichTextEditor
              value={form.body_html}
              onChange={(v) => update("body_html", v)}
              placeholder="Write or paste your article here..."
            />
            <p className="text-xs text-muted-foreground">
              Estimated read time: {computeReadTime(form.body_html)} min
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
