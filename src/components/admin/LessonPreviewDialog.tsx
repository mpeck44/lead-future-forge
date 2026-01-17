import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, HelpCircle, ClipboardCheck, Clock, Video, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  lesson_type: string | null;
  content: string | null;
  estimated_minutes: number | null;
  video_url: string | null;
  template_url: string | null;
  is_published: boolean | null;
  sequence_order: number;
  module_id: string;
}

interface LessonPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson | null;
}

const lessonTypeConfig = {
  material: { icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Material" },
  question: { icon: HelpCircle, color: "text-purple-500", bgColor: "bg-purple-500/10", label: "Question" },
  quiz: { icon: ClipboardCheck, color: "text-green-500", bgColor: "bg-green-500/10", label: "Quiz" },
};

const parseYouTubeUrl = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

const LessonPreviewDialog = ({ open, onOpenChange, lesson }: LessonPreviewDialogProps) => {
  if (!lesson) return null;

  const type = (lesson.lesson_type as keyof typeof lessonTypeConfig) ?? "material";
  const config = lessonTypeConfig[type] || lessonTypeConfig.material;
  const Icon = config.icon;

  const videoId = lesson.video_url ? parseYouTubeUrl(lesson.video_url) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{lesson.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {config.label}
                </Badge>
                {!lesson.is_published && (
                  <Badge variant="outline" className="text-xs">
                    Draft
                  </Badge>
                )}
                {lesson.estimated_minutes && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lesson.estimated_minutes} min
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Video Section */}
          {videoId && (
            <div className="rounded-lg overflow-hidden border">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
            </div>
          )}

          {/* Content Section */}
          {lesson.content && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div 
                dangerouslySetInnerHTML={{ __html: lesson.content }}
                className="[&_.video-embed]:my-4 [&_.video-embed_iframe]:rounded-lg"
              />
            </div>
          )}

          {!lesson.content && !videoId && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No content available for this lesson.</p>
            </div>
          )}

          {/* Template/Resource Section */}
          {lesson.template_url && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Resource / Template</p>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {lesson.template_url}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={lesson.template_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonPreviewDialog;
