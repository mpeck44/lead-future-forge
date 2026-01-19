import { useState, useEffect } from "react";
import { Save, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

interface ReflectionLessonProps {
  lesson: {
    id: string;
    content: string | null;
    character_limit?: number | null;
  };
  savedResponse: string | null;
  onSaveResponse: (response: string) => void;
  isSaving: boolean;
  isCompleted: boolean;
}

const ReflectionLesson = ({ 
  lesson, 
  savedResponse, 
  onSaveResponse, 
  isSaving,
  isCompleted 
}: ReflectionLessonProps) => {
  const [response, setResponse] = useState(savedResponse || "");
  const [hasChanges, setHasChanges] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setResponse(savedResponse || "");
    setHasChanges(false);
  }, [savedResponse, lesson.id]);

  const handleChange = (value: string) => {
    // Respect character limit if set
    if (lesson.character_limit && value.length > lesson.character_limit) {
      return;
    }
    setResponse(value);
    setHasChanges(value !== (savedResponse || ""));
  };

  const handleSave = () => {
    if (response.trim()) {
      onSaveResponse(response);
      setHasChanges(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const characterCount = response.length;
  const characterLimit = lesson.character_limit;

  return (
    <div className="space-y-6">
      {/* Prompt */}
      {lesson.content && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary mb-2">Reflection Prompt</p>
              <div 
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Response Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Your Response</label>
          {justSaved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Saved
            </span>
          )}
        </div>
        
        <Textarea
          value={response}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Take a moment to reflect and write your thoughts..."
          className={cn(
            "min-h-[200px] resize-y",
            isCompleted && !hasChanges && "bg-muted/30"
          )}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {characterLimit ? (
              <span className={cn(
                characterCount > characterLimit * 0.9 && "text-amber-600",
                characterCount >= characterLimit && "text-destructive"
              )}>
                {characterCount} / {characterLimit} characters
              </span>
            ) : (
              <span>{characterCount} characters</span>
            )}
          </div>
          
          <Button
            onClick={handleSave}
            disabled={!response.trim() || isSaving || !hasChanges}
            size="sm"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Response
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Privacy Note */}
      <p className="text-xs text-muted-foreground text-center">
        Your reflection is private and only visible to you and course administrators.
      </p>
    </div>
  );
};

export default ReflectionLesson;
