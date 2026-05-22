import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Upload,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  BookOpen,
} from "lucide-react";
import {
  parseCourseContent,
  type ParseResult,
  type ParsedModule,
} from "@/lib/parseCourseContent";
import { cn } from "@/lib/utils";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  existingModuleCount: number;
}

type Step = "input" | "preview" | "importing" | "done";

const LESSON_TYPE_COLORS: Record<string, string> = {
  content: "bg-blue-500/10 text-blue-600",
  video: "bg-red-500/10 text-red-600",
  activity: "bg-orange-500/10 text-orange-600",
  reflection: "bg-purple-500/10 text-purple-600",
  question: "bg-indigo-500/10 text-indigo-600",
  quiz: "bg-green-500/10 text-green-600",
};

const FORMAT_EXAMPLE = `=== MODULE: Understanding AI in Education ===
description: A foundational module on AI concepts
deliverable: AI Landscape Summary
path_type: foundation

--- LESSON: What is AI? ---
type: content
objective: Understand the basic concepts of AI
estimated_minutes: 15
content: # What is AI?

Artificial intelligence refers to systems that perform tasks once thought to require human intelligence.

## Three flavors you'll meet in schools

- **Narrow AI** — chatbots, grading helpers, spell-check
- **Generative AI** — ChatGPT, image generators
- **Agentic AI** — tools that take actions on your behalf

> Tip: Start with one narrow use case before piloting anything generative.

See the [district AI policy template](https://example.com/policy) for a starting point.
takeaways: AI is a tool | Focus on practical uses | Start small
resource_url: https://docs.google.com/...

--- LESSON: Watch: AI in Schools ---
type: video
estimated_minutes: 10
video_url: https://youtube.com/watch?v=...

--- LESSON: Reflect on Your District ---
type: reflection
estimated_minutes: 5
content: Where could AI have the biggest impact in the next 90 days?`;

export function BulkImportDialog({
  open,
  onOpenChange,
  courseId,
  existingModuleCount,
}: BulkImportDialogProps) {
  const [step, setStep] = useState<Step>("input");
  const [rawText, setRawText] = useState("");
  const [formatMarkdown, setFormatMarkdown] = useState(true);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importSummary, setImportSummary] = useState({ modules: 0, lessons: 0 });
  const [formatOpen, setFormatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const resetState = () => {
    setStep("input");
    setRawText("");
    setFormatMarkdown(true);
    setParseResult(null);
    setImportProgress({ current: 0, total: 0 });
    setImportSummary({ modules: 0, lessons: 0 });
    setFormatOpen(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setRawText(text);
      }
    };
    reader.readAsText(file);

    // Reset the file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleParse = () => {
    const result = parseCourseContent(rawText, { formatMarkdown });
    setParseResult(result);
    if (result.modules.length === 0) {
      toast.error("No modules found. Check your text format.");
      return;
    }
    setStep("preview");
  };

  const importMutation = useMutation({
    mutationFn: async (modules: ParsedModule[]) => {
      let totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
      setImportProgress({ current: 0, total: modules.length + totalLessons });

      let modulesCreated = 0;
      let lessonsCreated = 0;
      let progressCount = 0;

      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const sequenceOrder = existingModuleCount + i + 1;

        // Insert module
        const { data: newModule, error: modError } = await supabase
          .from("modules")
          .insert({
            course_id: courseId,
            title: mod.title,
            description: mod.description || null,
            deliverable_name: mod.deliverable_name || null,
            path_type: mod.path_type || null,
            sequence_order: sequenceOrder,
          })
          .select("id")
          .single();

        if (modError) throw new Error(`Failed to create module "${mod.title}": ${modError.message}`);
        modulesCreated++;
        progressCount++;
        setImportProgress({ current: progressCount, total: modules.length + totalLessons });

        // Insert lessons for this module
        if (mod.lessons.length > 0) {
          const lessonRows = mod.lessons.map((lesson, idx) => ({
            module_id: newModule.id,
            title: lesson.title,
            lesson_type: lesson.lesson_type,
            content: lesson.content || null,
            learning_objective: lesson.learning_objective || null,
            estimated_minutes: lesson.estimated_minutes ?? null,
            key_takeaways: lesson.key_takeaways || null,
            video_url: lesson.video_url || null,
            template_url: lesson.template_url || null,
            resource_name: lesson.resource_name || null,
            resource_type: lesson.resource_type || null,
            download_button_text: lesson.download_button_text || null,
            video_transcript: lesson.video_transcript || null,
            is_published: false,
            sequence_order: idx + 1,
          }));

          const { error: lessonsError } = await supabase
            .from("lessons")
            .insert(lessonRows);

          if (lessonsError) throw new Error(`Failed to create lessons for "${mod.title}": ${lessonsError.message}`);
          lessonsCreated += mod.lessons.length;
          progressCount += mod.lessons.length;
          setImportProgress({ current: progressCount, total: modules.length + totalLessons });
        }
      }

      return { modulesCreated, lessonsCreated };
    },
    onSuccess: (data) => {
      setImportSummary({ modules: data.modulesCreated, lessons: data.lessonsCreated });
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
    },
    onError: (error) => {
      toast.error(error.message);
      setStep("preview");
    },
  });

  const handleImport = () => {
    if (!parseResult) return;
    setStep("importing");
    importMutation.mutate(parseResult.modules);
  };

  const totalLessons = parseResult?.modules.reduce((sum, m) => sum + m.lessons.length, 0) ?? 0;
  const progressPercent =
    importProgress.total > 0
      ? Math.round((importProgress.current / importProgress.total) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            {step === "input" && "Import Course Content"}
            {step === "preview" && "Review Import"}
            {step === "importing" && "Importing..."}
            {step === "done" && "Import Complete"}
          </DialogTitle>
          <DialogDescription>
            {step === "input" && "Upload a text file or paste structured content to bulk-create modules and lessons."}
            {step === "preview" && "Review the parsed content below before importing."}
            {step === "importing" && "Creating modules and lessons in the database..."}
            {step === "done" && "All content has been imported successfully."}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: Input */}
        {step === "input" && (
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* File upload */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.text"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Upload Text File
              </Button>
              {rawText && (
                <Badge variant="secondary" className="self-center">
                  {rawText.split("\n").length} lines loaded
                </Badge>
              )}
            </div>

            {/* Text area */}
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your structured content here, or upload a file above..."
              className="min-h-[250px] font-mono text-sm"
            />

            {/* Formatting options */}
            <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formatMarkdown}
                onChange={(e) => setFormatMarkdown(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              />
              <span>
                <span className="font-medium">Auto-format lesson content from Markdown</span>
                <span className="block text-xs text-muted-foreground">
                  Converts <code className="text-[11px]">#</code> headings, <code className="text-[11px]">-</code> bullets, <code className="text-[11px]">**bold**</code>, links, and blockquotes into proper formatting so you don't have to style each lesson by hand.
                </span>
              </span>
            </label>



            {/* Format reference */}
            <Collapsible open={formatOpen} onOpenChange={setFormatOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  {formatOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  Format Reference
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                  {FORMAT_EXAMPLE}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* STEP 2: Preview */}
        {step === "preview" && parseResult && (
          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="space-y-4 pr-4">
              {/* Summary bar */}
              <div className="flex gap-4 p-3 bg-muted rounded-lg text-sm">
                <span className="font-medium">{parseResult.modules.length} module{parseResult.modules.length !== 1 ? "s" : ""}</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium">{totalLessons} lesson{totalLessons !== 1 ? "s" : ""}</span>
                {parseResult.warnings.length > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {parseResult.warnings.length} warning{parseResult.warnings.length !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="space-y-1 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">Warnings:</p>
                  {parseResult.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-600 dark:text-amber-500">
                      Line {w.line}: {w.message}
                    </p>
                  ))}
                </div>
              )}

              {/* Module preview cards */}
              {parseResult.modules.map((mod, mi) => (
                <div key={mi} className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-muted/50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Module {existingModuleCount + mi + 1}:</span>
                      <span className="font-medium">{mod.title}</span>
                      {mod.path_type && (
                        <Badge variant="secondary" className="text-xs">{mod.path_type}</Badge>
                      )}
                    </div>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
                    )}
                    {mod.deliverable_name && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Deliverable: {mod.deliverable_name}
                      </p>
                    )}
                  </div>
                  {mod.lessons.length > 0 && (
                    <div className="divide-y">
                      {mod.lessons.map((lesson, li) => (
                        <div key={li} className="px-4 py-2 flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-6 text-right shrink-0">{li + 1}.</span>
                          <span className="truncate flex-1">{lesson.title}</span>
                          <Badge
                            variant="secondary"
                            className={cn("text-xs shrink-0", LESSON_TYPE_COLORS[lesson.lesson_type] || "")}
                          >
                            {lesson.lesson_type}
                          </Badge>
                          {lesson.estimated_minutes && (
                            <span className="text-xs text-muted-foreground shrink-0">{lesson.estimated_minutes}m</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {mod.lessons.length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground italic">No lessons in this module</p>
                  )}
                </div>
              ))}

              <p className="text-xs text-muted-foreground">
                All lessons will be imported as <strong>drafts</strong> (unpublished). You can review and publish them individually.
              </p>
            </div>
          </ScrollArea>
        )}

        {/* STEP 3: Importing */}
        {step === "importing" && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Importing... {importProgress.current} / {importProgress.total}
            </p>
            <div className="w-full max-w-xs bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Done */}
        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div className="text-center">
              <p className="text-lg font-semibold">Import Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Created {importSummary.modules} module{importSummary.modules !== 1 ? "s" : ""} and{" "}
                {importSummary.lessons} lesson{importSummary.lessons !== 1 ? "s" : ""} as drafts.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="gap-2">
          {step === "input" && (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button onClick={handleParse} disabled={!rawText.trim()}>
                Parse & Preview
              </Button>
            </>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("input")}>Back</Button>
              <Button onClick={handleImport} disabled={!parseResult || parseResult.modules.length === 0}>
                Import {parseResult?.modules.length} Module{(parseResult?.modules.length ?? 0) !== 1 ? "s" : ""} &{" "}
                {totalLessons} Lesson{totalLessons !== 1 ? "s" : ""}
              </Button>
            </>
          )}
          {step === "done" && (
            <Button onClick={() => handleClose(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
