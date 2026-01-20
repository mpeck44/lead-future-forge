import { FolderOpen, CheckCircle2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Deliverable {
  moduleId: string;
  name: string;
  moduleTitle: string;
}

interface CompletedItem {
  id: string;
  title: string;
  completed_at: string | null;
}

interface PortfolioTrackerProps {
  deliverables: Deliverable[];
  completedItems: CompletedItem[];
  courseName?: string;
}

const PortfolioTracker = ({ 
  deliverables, 
  completedItems,
  courseName = "AI Leadership"
}: PortfolioTrackerProps) => {
  if (deliverables.length === 0) return null;

  const completedCount = deliverables.filter(d => 
    completedItems.some(item => 
      item.title.toLowerCase().includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(item.title.toLowerCase())
    )
  ).length;

  return (
    <div className="border-t p-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <FolderOpen className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Your {courseName} Portfolio</span>
      </div>
      
      <div className="space-y-2 mb-3">
        {deliverables.map(d => {
          const isComplete = completedItems.some(item => 
            item.title.toLowerCase().includes(d.name.toLowerCase()) ||
            d.name.toLowerCase().includes(item.title.toLowerCase())
          );
          
          return (
            <div 
              key={d.moduleId} 
              className={cn(
                "flex items-center gap-2 text-sm",
                isComplete ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <Square className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="line-clamp-1">{d.name}</span>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {completedCount} of {deliverables.length} deliverables complete
      </p>
    </div>
  );
};

export default PortfolioTracker;
