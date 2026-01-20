import { useState, useEffect, useRef, useCallback } from "react";
import { Save, Check, HelpCircle, SkipForward, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface QuestionLessonProps {
  lesson: {
    id: string;
    content: string | null;
    character_limit?: number | null;
  };
  savedResponse: string | null;
  skipped: boolean;
  lastSavedAt: Date | null;
  onSaveResponse: (response: string) => void;
  onSkip: () => void;
  onSaveAndContinue: () => void;
  isSaving: boolean;
  isCompleted: boolean;
}

const RECOMMENDED_WORDS = 50;
const DEBOUNCE_DELAY = 2000; // 2 seconds

const QuestionLesson = ({ 
  lesson, 
  savedResponse, 
  skipped,
  lastSavedAt,
  onSaveResponse, 
  onSkip,
  onSaveAndContinue,
  isSaving,
  isCompleted 
}: QuestionLessonProps) => {
  const [response, setResponse] = useState(savedResponse || "");
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<Date | null>(lastSavedAt);

  // Update lastSavedRef when prop changes
  useEffect(() => {
    lastSavedRef.current = lastSavedAt;
  }, [lastSavedAt]);

  // Reset state when lesson changes
  useEffect(() => {
    setResponse(savedResponse || "");
    setHasChanges(false);
    setAutoSaveStatus('idle');
  }, [savedResponse, lesson.id]);

  // Auto-save with debounce
  const debouncedSave = useCallback((value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (value.trim() && value !== (savedResponse || "")) {
      debounceRef.current = setTimeout(() => {
        setAutoSaveStatus('saving');
        onSaveResponse(value);
        setTimeout(() => {
          setAutoSaveStatus('saved');
          lastSavedRef.current = new Date();
        }, 500);
      }, DEBOUNCE_DELAY);
    }
  }, [savedResponse, onSaveResponse]);

  const handleChange = (value: string) => {
    // Respect character limit if set
    if (lesson.character_limit && value.length > lesson.character_limit) {
      return;
    }
    setResponse(value);
    setHasChanges(value !== (savedResponse || ""));
    setAutoSaveStatus('idle');
    debouncedSave(value);
  };

  const handleSaveAndContinue = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (response.trim()) {
      onSaveResponse(response);
    }
    onSaveAndContinue();
  };

  const handleSkip = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onSkip();
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0;
  const characterCount = response.length;
  const characterLimit = lesson.character_limit;

  const getAutoSaveText = () => {
    if (autoSaveStatus === 'saving' || isSaving) {
      return 'Saving...';
    }
    if (autoSaveStatus === 'saved' || lastSavedRef.current) {
      const savedTime = lastSavedRef.current || new Date();
      return `Auto-saved ${formatDistanceToNow(savedTime, { addSuffix: true })}`;
    }
    return null;
  };

  const autoSaveText = getAutoSaveText();

  return (
    <div className="space-y-6">
      {/* Prompt */}
      {lesson.content && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Question</p>
              <div 
                className="prose prose-slate dark:prose-invert max-w-none prose-p:text-indigo-900 dark:prose-p:text-indigo-100"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Already Skipped Notice */}
      {skipped && !response && (
        <div className="bg-muted/50 border border-dashed rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            You previously skipped this question. You can still provide an answer below.
          </p>
        </div>
      )}

      {/* Response Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Your Answer (private)</label>
          {autoSaveText && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {(autoSaveStatus === 'saving' || isSaving) ? (
                <Clock className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3 text-green-500" />
              )}
              {autoSaveText}
            </span>
          )}
        </div>
        
        <Textarea
          value={response}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Take a moment to think and write your answer..."
          className={cn(
            "min-h-[120px] resize-y transition-all",
            "focus:min-h-[180px]",
            isCompleted && !hasChanges && "bg-muted/30"
          )}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            <span className={cn(
              wordCount < RECOMMENDED_WORDS && "text-amber-600 dark:text-amber-400"
            )}>
              {wordCount} / {RECOMMENDED_WORDS} words (recommended)
            </span>
            {characterLimit && (
              <span className={cn(
                "ml-3",
                characterCount > characterLimit * 0.9 && "text-amber-600",
                characterCount >= characterLimit && "text-destructive"
              )}>
                {characterCount} / {characterLimit} characters
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          onClick={handleSaveAndContinue}
          disabled={!response.trim() || isSaving}
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save & Continue
            </>
          )}
        </Button>

        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Skip This Question
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      {/* Privacy Note */}
      <p className="text-xs text-muted-foreground text-center">
        Your answer is private and only visible to you and course administrators.
      </p>
    </div>
  );
};

export default QuestionLesson;
