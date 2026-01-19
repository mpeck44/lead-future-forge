import { Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface KeyTakeawaysEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxItems?: number;
  placeholder?: string;
  className?: string;
}

const KeyTakeawaysEditor = ({
  value = [],
  onChange,
  maxItems = 5,
  placeholder = "Add a key takeaway...",
  className,
}: KeyTakeawaysEditorProps) => {
  const addItem = () => {
    if (value.length < maxItems) {
      onChange([...value, ""]);
    }
  };

  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateItem = (index: number, text: string) => {
    const newValue = [...value];
    newValue[index] = text;
    onChange(newValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2 group">
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 cursor-grab" />
          <Input
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      {value.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Takeaway ({value.length}/{maxItems})
        </Button>
      )}
      
      {value.length >= maxItems && (
        <p className="text-xs text-muted-foreground text-center">
          Maximum {maxItems} takeaways reached
        </p>
      )}
    </div>
  );
};

export default KeyTakeawaysEditor;
