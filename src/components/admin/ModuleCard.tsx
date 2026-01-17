import { useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical, ArrowUp, ArrowDown, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import LessonItem from "./LessonItem";

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

interface Module {
  id: string;
  title: string;
  estimated_minutes: number | null;
  sequence_order: number;
  lessons: Lesson[];
}

interface ModuleCardProps {
  module: Module;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (module: Module) => void;
  onDelete: (module: Module) => void;
  onMoveUp: (module: Module) => void;
  onMoveDown: (module: Module) => void;
  onAddLesson: (moduleId: string) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
  onMoveLessonUp: (lesson: Lesson) => void;
  onMoveLessonDown: (lesson: Lesson) => void;
  onPreviewLesson: (lesson: Lesson) => void;
}

const ModuleCard = ({
  module,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLessonUp,
  onMoveLessonDown,
  onPreviewLesson,
}: ModuleCardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const sortedLessons = [...module.lessons].sort((a, b) => a.sequence_order - b.sequence_order);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg bg-card overflow-hidden">
        {/* Module Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 group">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Module {module.sequence_order}:</span>
              <span className="font-medium truncate">{module.title}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              <span>{sortedLessons.length} lesson{sortedLessons.length !== 1 ? "s" : ""}</span>
              {module.estimated_minutes && (
                <span>• {module.estimated_minutes} min</span>
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
              onClick={() => onMoveUp(module)}
              title="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={isLast}
              onClick={() => onMoveDown(module)}
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
              <DropdownMenuItem onClick={() => onAddLesson(module.id)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lesson
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(module)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Module
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(module)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Module
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Lessons */}
        <CollapsibleContent>
          <div className="border-t">
            {sortedLessons.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="mb-2">No lessons yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddLesson(module.id)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Lesson
                </Button>
              </div>
            ) : (
              <>
                {sortedLessons.map((lesson, index) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isFirst={index === 0}
                    isLast={index === sortedLessons.length - 1}
                    onEdit={onEditLesson}
                    onDelete={onDeleteLesson}
                    onMoveUp={onMoveLessonUp}
                    onMoveDown={onMoveLessonDown}
                    onPreview={onPreviewLesson}
                  />
                ))}
                <div className="px-4 py-2 border-t bg-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddLesson(module.id)}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ModuleCard;
