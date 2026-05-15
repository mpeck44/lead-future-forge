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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { 
  FileText, 
  Video, 
  Pencil, 
  MessageSquare, 
  HelpCircle, 
  ClipboardCheck,
  Zap,
  Target,
  Youtube
} from "lucide-react";
import { cn } from "@/lib/utils";
import RichTextEditor from "./RichTextEditor";
import KeyTakeawaysEditor from "./KeyTakeawaysEditor";
import { sanitizeHtml } from "@/lib/sanitize";

const lessonFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  lesson_type: z.enum(["content", "video", "activity", "reflection", "question", "quiz"]),
  content: z.string().optional(),
  estimated_minutes: z.number().min(0, "Must be 0 or greater").optional(),
  video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  template_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_published: z.boolean(),
  // New fields
  learning_objective: z.string().max(200, "Must be less than 200 characters").optional(),
  key_takeaways: z.array(z.string()).optional(),
  resource_type: z.enum(["google_doc", "pdf", "guide", "link"]).optional(),
  resource_name: z.string().max(100, "Must be less than 100 characters").optional(),
  download_button_text: z.string().max(50, "Must be less than 50 characters").optional(),
  completion_type: z.enum(["manual", "on_download", "on_save", "auto"]).optional(),
  is_quick_start: z.boolean().optional(),
  is_first_deliverable: z.boolean().optional(),
  auto_advance: z.boolean().optional(),
  require_completion: z.boolean().optional(),
  video_transcript: z.string().optional(),
  character_limit: z.number().min(0).optional(),
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
  learning_objective?: string | null;
  key_takeaways?: string[] | null;
  resource_type?: string | null;
  resource_name?: string | null;
  download_button_text?: string | null;
  completion_type?: string | null;
  is_quick_start?: boolean | null;
  is_first_deliverable?: boolean | null;
  auto_advance?: boolean | null;
  require_completion?: boolean | null;
  video_transcript?: string | null;
  character_limit?: number | null;
}

// Export the form values type for use in parent components
export type LessonFormData = LessonFormValues;

interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LessonFormData) => void;
  lesson?: Lesson | null;
  isLoading?: boolean;
}

const lessonTypes = [
  { value: "content", label: "Content", icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10", description: "Teaching material" },
  { value: "video", label: "Video", icon: Video, color: "text-red-500", bgColor: "bg-red-500/10", description: "Standalone video" },
  { value: "activity", label: "Activity", icon: Pencil, color: "text-orange-500", bgColor: "bg-orange-500/10", description: "Worksheet/template" },
  { value: "reflection", label: "Reflection", icon: MessageSquare, color: "text-purple-500", bgColor: "bg-purple-500/10", description: "Journal prompt" },
  { value: "question", label: "Question", icon: HelpCircle, color: "text-indigo-500", bgColor: "bg-indigo-500/10", description: "Discussion prompt" },
  { value: "quiz", label: "Quiz", icon: ClipboardCheck, color: "text-green-500", bgColor: "bg-green-500/10", description: "Assessment" },
] as const;

// Helper to detect video platform
const detectVideoPlatform = (url: string): string | null => {
  if (!url) return null;
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("vimeo.com")) return "vimeo";
  return "other";
};

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
      lesson_type: "content",
      content: "",
      estimated_minutes: undefined,
      video_url: "",
      template_url: "",
      is_published: false,
      learning_objective: "",
      key_takeaways: [],
      resource_type: "link",
      resource_name: "",
      download_button_text: "Download Template",
      completion_type: "manual",
      is_quick_start: false,
      is_first_deliverable: false,
      auto_advance: false,
      require_completion: false,
      video_transcript: "",
      character_limit: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (lesson) {
        // Map 'material' to 'content' for backward compatibility
        const mappedType = lesson.lesson_type === "material" ? "content" : lesson.lesson_type;
        
        form.reset({
          title: lesson.title,
          lesson_type: (mappedType as LessonFormValues["lesson_type"]) ?? "content",
          content: lesson.content ?? "",
          estimated_minutes: lesson.estimated_minutes ?? undefined,
          video_url: lesson.video_url ?? "",
          template_url: lesson.template_url ?? "",
          is_published: lesson.is_published ?? false,
          learning_objective: lesson.learning_objective ?? "",
          key_takeaways: lesson.key_takeaways ?? [],
          resource_type: (lesson.resource_type as LessonFormValues["resource_type"]) ?? "link",
          resource_name: lesson.resource_name ?? "",
          download_button_text: lesson.download_button_text ?? "Download Template",
          completion_type: (lesson.completion_type as LessonFormValues["completion_type"]) ?? "manual",
          is_quick_start: lesson.is_quick_start ?? false,
          is_first_deliverable: lesson.is_first_deliverable ?? false,
          auto_advance: lesson.auto_advance ?? false,
          require_completion: lesson.require_completion ?? false,
          video_transcript: lesson.video_transcript ?? "",
          character_limit: lesson.character_limit ?? undefined,
        });
      } else {
        form.reset({
          title: "",
          lesson_type: "content",
          content: "",
          estimated_minutes: undefined,
          video_url: "",
          template_url: "",
          is_published: false,
          learning_objective: "",
          key_takeaways: [],
          resource_type: "link",
          resource_name: "",
          download_button_text: "Download Template",
          completion_type: "manual",
          is_quick_start: false,
          is_first_deliverable: false,
          auto_advance: false,
          require_completion: false,
          video_transcript: "",
          character_limit: undefined,
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
  const videoUrl = form.watch("video_url");
  const videoPlatform = detectVideoPlatform(videoUrl || "");

  const selectedTypeConfig = lessonTypes.find((t) => t.value === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Lesson" : "Create Lesson"}
            {selectedTypeConfig && (
              <Badge variant="secondary" className={cn("ml-2", selectedTypeConfig.bgColor, selectedTypeConfig.color)}>
                <selectedTypeConfig.icon className="h-3 w-3 mr-1" />
                {selectedTypeConfig.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Lesson Type Selector */}
            <FormField
              control={form.control}
              name="lesson_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {lessonTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = field.value === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => field.onChange(type.value)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-center",
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-input hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            <div className={cn("p-2 rounded-full", type.bgColor)}>
                              <Icon className={cn("h-4 w-4", type.color)} />
                            </div>
                            <span className="text-xs font-medium">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Main Content */}
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

                {/* Content Type: Learning Objective */}
                {selectedType === "content" && (
                  <FormField
                    control={form.control}
                    name="learning_objective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Objective</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="After this lesson, learners will be able to..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          One sentence describing what learners will achieve
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Content/Instructions Editor - For content, activity, reflection, question types */}
                {["content", "activity", "reflection", "question"].includes(selectedType) && (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {selectedType === "activity" ? "Instructions" : 
                           selectedType === "reflection" ? "Reflection Prompt" :
                           selectedType === "question" ? "Question Prompt" : "Content"}
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
                                  selectedType === "activity" ? "Enter activity instructions..." :
                                  selectedType === "reflection" ? "Enter reflection prompt..." :
                                  selectedType === "question" ? "Enter your question..." :
                                  "Enter lesson content..."
                                }
                              />
                            </FormControl>
                          </TabsContent>
                          <TabsContent value="preview" className="mt-0">
                            <div
                              className="min-h-[200px] p-3 border border-input rounded-md prose prose-sm max-w-none bg-muted/30 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentValue || "<p class='text-muted-foreground'>No content yet</p>") }}
                            />
                          </TabsContent>
                        </Tabs>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Key Takeaways - For content and video types */}
                {["content", "video"].includes(selectedType) && (
                  <FormField
                    control={form.control}
                    name="key_takeaways"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Takeaways</FormLabel>
                        <FormControl>
                          <KeyTakeawaysEditor
                            value={field.value || []}
                            onChange={field.onChange}
                            maxItems={5}
                            placeholder="Enter a key takeaway..."
                          />
                        </FormControl>
                        <FormDescription>
                          Bullet points shown at the end of the lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Video Transcript - For video type */}
                {selectedType === "video" && (
                  <FormField
                    control={form.control}
                    name="video_transcript"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video Transcript</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste video transcript here (optional)..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Shown as expandable section below the video
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Quiz placeholder */}
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

                {/* Video URL - For content and video types */}
                {["content", "video"].includes(selectedType) && (
                  <FormField
                    control={form.control}
                    name="video_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              {...field}
                            />
                            {videoPlatform && (
                              <Badge 
                                variant="secondary" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                              >
                                {videoPlatform === "youtube" && <Youtube className="h-3 w-3 mr-1" />}
                                {videoPlatform}
                              </Badge>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          YouTube or Vimeo link
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Activity-specific fields */}
                {selectedType === "activity" && (
                  <>
                    <FormField
                      control={form.control}
                      name="resource_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="google_doc">Google Doc</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="guide">Guide</SelectItem>
                              <SelectItem value="link">External Link</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resource_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Personal AI Statement Template"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="template_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="download_button_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Download Button Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Download Template" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="completion_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Completion Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="manual">Manual Confirmation</SelectItem>
                              <SelectItem value="on_download">On Download</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            When to mark this activity complete
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Reflection-specific fields */}
                {selectedType === "reflection" && (
                  <FormField
                    control={form.control}
                    name="character_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Character Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="No limit"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Optional max characters for response
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Template URL - For content type */}
                {selectedType === "content" && (
                  <FormField
                    control={form.control}
                    name="template_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional downloadable resource
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Badges section for activity type */}
                {selectedType === "activity" && (
                  <>
                    <div className="h-px bg-border my-4" />
                    <h4 className="text-sm font-medium mb-3">Badges</h4>
                    
                    <FormField
                      control={form.control}
                      name="is_quick_start"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-amber-500" />
                              Quick Start
                            </FormLabel>
                            <FormDescription className="text-xs">
                              15-minute quick version available
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

                    <FormField
                      control={form.control}
                      name="is_first_deliverable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-green-500" />
                              First Deliverable
                            </FormLabel>
                            <FormDescription className="text-xs">
                              "Use it tomorrow" badge
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
                  </>
                )}

                <div className="h-px bg-border my-4" />

                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Published</FormLabel>
                        <FormDescription className="text-xs">
                          Visible to students
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
