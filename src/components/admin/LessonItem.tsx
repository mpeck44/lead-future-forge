import { 
  FileText, 
  Video, 
  Pencil, 
  MessageSquare,
  HelpCircle, 
  ClipboardCheck, 
  MoreVertical, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Eye,
  Zap,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
  is_quick_start?: boolean | null;
  is_first_deliverable?: boolean | null;
}

interface LessonItemProps {
  lesson: Lesson;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onMoveUp: (lesson: Lesson) => void;
  onMoveDown: (lesson: Lesson) => void;
  onPreview: (lesson: Lesson) => void;
}

const lessonTypeConfig: Record<string, { icon: typeof FileText; color: string; bgColor: string; label: string }> = {
  content: { icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Content" },
  material: { icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Content" }, // Backward compatibility
  video: { icon: Video, color: "text-red-500", bgColor: "bg-red-500/10", label: "Video" },
  activity: { icon: Pencil, color: "text-orange-500", bgColor: "bg-orange-500/10", label: "Activity" },
  reflection: { icon: MessageSquare, color: "text-purple-500", bgColor: "bg-purple-500/10", label: "Reflection" },
  question: { icon: HelpCircle, color: "text-indigo-500", bgColor: "bg-indigo-500/10", label: "Question" },
  quiz: { icon: ClipboardCheck, color: "text-green-500", bgColor: "bg-green-500/10", label: "Quiz" },
};

const LessonItem = ({
  lesson,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onPreview,
}: LessonItemProps) => {
  const type = (lesson.lesson_type as keyof typeof lessonTypeConfig) ?? "content";
  const config = lessonTypeConfig[type] || lessonTypeConfig.content;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group">
      {/* Type Icon */}
      <div className={cn("p-2 rounded-full", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{lesson.title}</span>
          {!lesson.is_published && (
            <Badge variant="outline" className="text-xs">
              Draft
            </Badge>
          )}
          {lesson.is_quick_start && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Zap className="h-3 w-3 mr-1" />
              Quick Start
            </Badge>
          )}
          {lesson.is_first_deliverable && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Target className="h-3 w-3 mr-1" />
              First Deliverable
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
          <span>{config.label}</span>
          {lesson.estimated_minutes && (
            <span>• {lesson.estimated_minutes} min</span>
          )}
          {lesson.video_url && type !== "video" && (
            <span>• Has video</span>
          )}
          {lesson.template_url && (
            <span>• Has resource</span>
          )}
        </div>
      </div>

      {/* Move Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isFirst}
          onClick={() => onMoveUp(lesson)}
          title="Move up"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isLast}
          onClick={() => onMoveDown(lesson)}
          title="Move down"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(lesson)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPreview(lesson)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(lesson)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LessonItem;
