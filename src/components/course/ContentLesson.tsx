import { Target, CheckCircle2, ExternalLink } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import ExperienceBlock from "./ExperienceBlock";
import { getExperienceBlocksForLesson } from "@/data/experienceBlocks";

interface ContentLessonProps {
  lesson: {
    title?: string;
    content: string | null;
    learning_objective?: string | null;
    key_takeaways?: string[] | null;
    video_url?: string | null;
  };
  getVideoEmbedUrl: (url: string) => string;
}

const ContentLesson = ({ lesson, getVideoEmbedUrl }: ContentLessonProps) => {
  // Get experience blocks for this lesson
  const experienceBlocks = lesson.title 
    ? getExperienceBlocksForLesson(lesson.title) 
    : [];

  return (
    <div className="space-y-6">
      {/* What You'll Build - Replaces Learning Objective */}
      {lesson.learning_objective && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-accent mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-accent uppercase tracking-wide mb-2">
                WHAT YOU'LL BUILD
              </p>
              <p className="text-foreground font-medium leading-relaxed">
                {lesson.learning_objective}
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                Time: 10 minutes to draft, lifetime to refine.
              </p>
              <button className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1">
                See an example from another principal
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experience Blocks - From Mike */}
      {experienceBlocks.length > 0 && (
        <div className="space-y-4">
          {experienceBlocks.map((block, index) => (
            <ExperienceBlock 
              key={index}
              content={block.content}
              variant={block.variant}
            />
          ))}
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
