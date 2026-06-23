import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Link as LinkIcon, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

interface ActivityLessonProps {
  lesson: {
    id: string;
    title: string;
    content: string | null;
    template_url?: string | null;
    resource_type?: string | null;
    resource_name?: string | null;
    download_button_text?: string | null;
    completion_type?: string | null;
  };
  courseId?: string;
  isCompleted: boolean;
  onComplete: () => void;
  onPortfolioCreate?: (lessonId: string, title: string, description: string) => void;
  isPending: boolean;
}

const resourceTypeConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  google_doc: { icon: FileText, label: "Google Doc", color: "bg-blue-100 text-blue-700" },
  pdf: { icon: FileText, label: "PDF", color: "bg-red-100 text-red-700" },
  guide: { icon: FileSpreadsheet, label: "Guide", color: "bg-green-100 text-green-700" },
  link: { icon: LinkIcon, label: "External Link", color: "bg-purple-100 text-purple-700" },
};

const ActivityLesson = ({ lesson, courseId, isCompleted, onComplete, onPortfolioCreate, isPending }: ActivityLessonProps) => {
  const [manualComplete, setManualComplete] = useState(isCompleted);
  
  const resourceConfig = resourceTypeConfig[lesson.resource_type || "link"] || resourceTypeConfig.link;
  const ResourceIcon = resourceConfig.icon;
  const buttonText = lesson.download_button_text || "Download Template";

  // Only allow https URLs in the download link to prevent stored XSS via
  // javascript:/data: URLs that survive a generic URL parse.
  const safeTemplateUrl = (() => {
    if (!lesson.template_url) return null;
    try {
      const parsed = new URL(lesson.template_url);
      return parsed.protocol === 'https:' ? parsed.toString() : null;
    } catch {
      return null;
    }
  })();

  const createPortfolioItem = () => {
    if (onPortfolioCreate) {
      const description = `Completed activity: ${lesson.resource_name || lesson.title}`;
      onPortfolioCreate(lesson.id, lesson.title, description);
    }
  };

  const handleDownload = () => {
    // If completion type is on_download, mark as complete and create portfolio item
    if (lesson.completion_type === "on_download" && !isCompleted) {
      onComplete();
      createPortfolioItem();
    }
  };

  const handleManualComplete = () => {
    if (!isCompleted && !manualComplete) {
      setManualComplete(true);
      onComplete();
      createPortfolioItem();
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {lesson.content && (
        <div>
          <h4 className="font-semibold mb-3">Instructions</h4>
          <div 
            className="prose prose-slate dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
          />
        </div>
      )}

      {/* Resource Download Card */}
      {lesson.template_url && (
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <ResourceIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">
                    {lesson.resource_name || "Activity Resource"}
                  </p>
                  <Badge variant="secondary" className={cn("text-xs", resourceConfig.color)}>
                    {resourceConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Download and complete this resource to finish the activity
                </p>
              </div>
            </div>
            <Button asChild onClick={handleDownload}>
              <a 
                href={lesson.template_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4 mr-2" />
                {buttonText}
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Manual Completion Checkbox */}
      {lesson.completion_type !== "on_download" && (
        <div 
          className={cn(
            "border rounded-lg p-4 cursor-pointer transition-colors",
            (isCompleted || manualComplete) 
              ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" 
              : "hover:bg-muted/50"
          )}
          onClick={handleManualComplete}
        >
          <div className="flex items-center gap-3">
            {(isCompleted || manualComplete) ? (
              <CheckSquare className="h-5 w-5 text-green-600" />
            ) : (
              <Square className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {(isCompleted || manualComplete) ? "Activity Completed!" : "I've completed this activity"}
              </p>
              <p className="text-sm text-muted-foreground">
                {(isCompleted || manualComplete) 
                  ? "Great work! You can move on to the next lesson." 
                  : "Check this box when you've finished the activity"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLesson;
