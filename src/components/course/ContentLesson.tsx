import { Lightbulb, CheckCircle2 } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

interface ContentLessonProps {
  lesson: {
    content: string | null;
    learning_objective?: string | null;
    key_takeaways?: string[] | null;
    video_url?: string | null;
  };
  getVideoEmbedUrl: (url: string) => string;
}

const ContentLesson = ({ lesson, getVideoEmbedUrl }: ContentLessonProps) => {
  return (
    <div className="space-y-6">
      {/* Learning Objective */}
      {lesson.learning_objective && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">Learning Objective</p>
              <p className="text-foreground">{lesson.learning_objective}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {lesson.video_url && (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={getVideoEmbedUrl(lesson.video_url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Main Content */}
      {lesson.content && (
        <div 
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
        />
      )}

      {/* Key Takeaways */}
      {lesson.key_takeaways && lesson.key_takeaways.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 mt-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Key Takeaways
          </h4>
          <ul className="space-y-2">
            {lesson.key_takeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ContentLesson;
