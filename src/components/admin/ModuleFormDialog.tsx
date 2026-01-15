import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const moduleFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  estimated_minutes: z.number().min(0, "Must be 0 or greater").optional(),
});

type ModuleFormValues = z.infer<typeof moduleFormSchema>;

interface Module {
  id: string;
  title: string;
  estimated_minutes: number | null;
}

interface ModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ModuleFormValues & { saveAndAddAnother?: boolean }) => void;
  module?: Module | null;
  isLoading?: boolean;
}

const ModuleFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  module,
  isLoading = false,
}: ModuleFormDialogProps) => {
  const isEditing = !!module;

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: "",
      description: "",
      estimated_minutes: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (module) {
        form.reset({
          title: module.title,
          description: "",
          estimated_minutes: module.estimated_minutes ?? undefined,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          estimated_minutes: undefined,
        });
      }
    }
  }, [open, module, form]);

  const handleSubmit = (data: ModuleFormValues) => {
    onSubmit(data);
  };

  const handleSaveAndAddAnother = () => {
    const data = form.getValues();
    const result = moduleFormSchema.safeParse(data);
    if (result.success) {
      onSubmit({ ...result.data, saveAndAddAnother: true });
      form.reset({
        title: "",
        description: "",
        estimated_minutes: undefined,
      });
    } else {
      form.trigger();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Module" : "Create Module"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Module title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this module"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="30"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              {!isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveAndAddAnother}
                  disabled={isLoading}
                >
                  Save & Add Another
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleFormDialog;
