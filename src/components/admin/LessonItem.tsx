import { FileText, HelpCircle, ClipboardCheck, MoreVertical, ArrowUp, ArrowDown, Pencil, Trash2, Eye } from "lucide-react";
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

const lessonTypeConfig = {
  material: { icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Material" },
  question: { icon: HelpCircle, color: "text-purple-500", bgColor: "bg-purple-500/10", label: "Question" },
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
  const type = (lesson.lesson_type as keyof typeof lessonTypeConfig) ?? "material";
  const config = lessonTypeConfig[type] || lessonTypeConfig.material;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group">
      {/* Type Icon */}
      <div className={cn("p-2 rounded-full", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{lesson.title}</span>
          {!lesson.is_published && (
            <Badge variant="outline" className="text-xs">
              Draft
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
          <span>{config.label}</span>
          {lesson.estimated_minutes && (
            <span>• {lesson.estimated_minutes} min</span>
          )}
          {lesson.video_url && (
            <span>• Has video</span>
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
