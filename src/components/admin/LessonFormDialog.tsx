import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { FileText, HelpCircle, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import RichTextEditor from "./RichTextEditor";
import { sanitizeHtml } from "@/lib/sanitize";

const lessonFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  lesson_type: z.enum(["material", "question", "quiz"]),
  content: z.string().optional(),
  estimated_minutes: z.number().min(0, "Must be 0 or greater").optional(),
  video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  template_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_published: z.boolean(),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

interface Lesson {
  id: string;
  title: string;
  lesson_type: string | null;
  content: string | null;
  estimated_minutes: number | null;
  video_url: string | null;
  template_url: string | null;
  is_published: boolean | null;
}

interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LessonFormValues) => void;
  lesson?: Lesson | null;
  isLoading?: boolean;
}

const lessonTypes = [
  { value: "material", label: "Material", icon: FileText, color: "text-blue-500" },
  { value: "question", label: "Question", icon: HelpCircle, color: "text-purple-500" },
  { value: "quiz", label: "Quiz", icon: ClipboardCheck, color: "text-green-500" },
] as const;

const LessonFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  lesson,
  isLoading = false,
}: LessonFormDialogProps) => {
  const isEditing = !!lesson;
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      lesson_type: "material",
      content: "",
      estimated_minutes: undefined,
      video_url: "",
      template_url: "",
      is_published: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (lesson) {
        form.reset({
          title: lesson.title,
          lesson_type: (lesson.lesson_type as "material" | "question" | "quiz") ?? "material",
          content: lesson.content ?? "",
          estimated_minutes: lesson.estimated_minutes ?? undefined,
          video_url: lesson.video_url ?? "",
          template_url: lesson.template_url ?? "",
          is_published: lesson.is_published ?? false,
        });
      } else {
        form.reset({
          title: "",
          lesson_type: "material",
          content: "",
          estimated_minutes: undefined,
          video_url: "",
          template_url: "",
          is_published: false,
        });
      }
      setPreviewMode(false);
    }
  }, [open, lesson, form]);

  const handleSubmit = (data: LessonFormValues) => {
    onSubmit(data);
  };

  const selectedType = form.watch("lesson_type");
  const contentValue = form.watch("content");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Lesson" : "Create Lesson"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Content */}
              <div className="lg:col-span-2 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Lesson title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lesson_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          {lessonTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => field.onChange(type.value)}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2 rounded-md border transition-colors",
                                  field.value === type.value
                                    ? "border-primary bg-primary/10"
                                    : "border-input hover:border-primary/50"
                                )}
                              >
                                <Icon className={cn("h-4 w-4", type.color)} />
                                <span className="text-sm font-medium">{type.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedType === "question" ? "Question Prompt" : "Content"}
                      </FormLabel>
                      <Tabs value={previewMode ? "preview" : "edit"} onValueChange={(v) => setPreviewMode(v === "preview")}>
                        <TabsList className="mb-2">
                          <TabsTrigger value="edit">Edit</TabsTrigger>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit" className="mt-0">
                          <FormControl>
                            <RichTextEditor
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              placeholder={
                                selectedType === "question"
                                  ? "Enter your reflection question..."
                                  : "Enter lesson content..."
                              }
                            />
                          </FormControl>
                        </TabsContent>
                        <TabsContent value="preview" className="mt-0">
                          <div
                            className="min-h-[200px] p-3 border border-input rounded-md prose prose-sm max-w-none bg-muted/30"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentValue || "<p class='text-muted-foreground'>No content yet</p>") }}
                          />
                        </TabsContent>
                      </Tabs>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedType === "quiz" && (
                  <div className="p-4 border border-dashed border-muted-foreground/30 rounded-md bg-muted/30">
                    <p className="text-sm text-muted-foreground text-center">
                      Quiz builder coming soon. For now, you can describe the quiz in the content area.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Panel - Settings */}
              <div className="space-y-4 lg:border-l lg:pl-6">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Settings
                </h3>

                <FormField
                  control={form.control}
                  name="estimated_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Minutes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="15"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        YouTube or Vimeo link
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="template_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template/Resource URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Link to downloadable resource
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Published</FormLabel>
                        <FormDescription>
                          Make this lesson visible to students
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Lesson"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonFormDialog;
