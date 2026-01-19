import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface VideoLessonProps {
  lesson: {
    video_url: string | null;
    video_transcript?: string | null;
    key_takeaways?: string[] | null;
    content?: string | null;
  };
  getVideoEmbedUrl: (url: string) => string;
}

const VideoLesson = ({ lesson, getVideoEmbedUrl }: VideoLessonProps) => {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  if (!lesson.video_url) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No video available for this lesson.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Player - Full Width */}
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={getVideoEmbedUrl(lesson.video_url)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Video Transcript */}
      {lesson.video_transcript && (
        <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Video Transcript
              </span>
              {transcriptOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 p-4 bg-muted/50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
              {lesson.video_transcript}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Key Takeaways */}
      {lesson.key_takeaways && lesson.key_takeaways.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
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

export default VideoLesson;
