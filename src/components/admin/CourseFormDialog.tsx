import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ROLE_OPTIONS,
  AUDIT_CATEGORY_OPTIONS,
  type AuditCategoryValue,
} from '@/lib/roleOptions';

const NONE = '__none__';

const courseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater').optional(),
  path_type: z.string().optional(),
  estimated_hours: z.coerce.number().min(0, 'Estimated hours must be 0 or greater').optional(),
  is_published: z.boolean().default(false),
  featured: z.boolean().default(false),
  audit_category: z
    .enum(['fluency', 'strategy', 'action', 'governance', 'capacity'])
    .nullable()
    .default(null),
  role_fit: z.array(z.string()).default([]),
  requires_foundations: z.boolean().default(true),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CourseFormValues) => Promise<void>;
  defaultValues?: Partial<CourseFormValues>;
  isEditing?: boolean;
  isLoading?: boolean;
}

const pathTypeOptions = [
  { value: 'accelerator_path_1', label: 'Leadership Path 1' },
  { value: 'accelerator_path_2', label: 'Leadership Path 2' },
  { value: 'accelerator_path_3', label: 'Leadership Path 3' },
  { value: 'standalone', label: 'Standalone' },
  { value: 'bundle', label: 'Bundle' },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const FORM_DEFAULTS: CourseFormValues = {
  title: '',
  slug: '',
  description: '',
  price: 0,
  path_type: '',
  estimated_hours: 0,
  is_published: false,
  featured: false,
  audit_category: null,
  role_fit: [],
  requires_foundations: true,
};

export function CourseFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
  isLoading = false,
}: CourseFormDialogProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: { ...FORM_DEFAULTS, ...defaultValues },
  });

  // Reset form when dialog opens with new default values
  useEffect(() => {
    if (open) {
      form.reset({ ...FORM_DEFAULTS, ...defaultValues });
    }
  }, [open, defaultValues, form]);

  // Auto-generate slug from title (only when creating new course)
  const watchTitle = form.watch('title');
  useEffect(() => {
    if (!isEditing && watchTitle) {
      const newSlug = generateSlug(watchTitle);
      form.setValue('slug', newSlug, { shouldValidate: true });
    }
  }, [watchTitle, isEditing, form]);

  // When audit_category is cleared, the course is foundational — no prerequisite makes sense.
  const watchCategory = form.watch('audit_category');
  useEffect(() => {
    if (watchCategory === null) {
      form.setValue('requires_foundations', false);
    }
  }, [watchCategory, form]);

  const handleSubmit = async (values: CourseFormValues) => {
    await onSubmit(values);
  };

  const slugValue = form.watch('slug');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="The Leadership Forge" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input placeholder="the-leadership-forge" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL: /courses/{slugValue || 'your-slug'}
                  </FormDescription>
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
                      placeholder="A comprehensive course on AI leadership..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="75" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.5" placeholder="6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="path_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Path Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a path type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pathTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="audit_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audit Category</FormLabel>
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v === NONE ? null : (v as AuditCategoryValue))
                    }
                    value={field.value ?? NONE}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>None — foundational course</SelectItem>
                      {AUDIT_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The single audit gap this course closes. Drives recommendations from the AI Equity Audit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role_fit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Fit</FormLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                    {ROLE_OPTIONS.map((option) => {
                      const checked = field.value.includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) => {
                              if (c) {
                                field.onChange([...field.value, option.value]);
                              } else {
                                field.onChange(field.value.filter((v) => v !== option.value));
                              }
                            }}
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                  <FormDescription>
                    Which roles this course is built for. Leave empty if it fits everyone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requires_foundations"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Requires Foundations</FormLabel>
                    <FormDescription>
                      Learners should complete The Launchpad before this course.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={watchCategory === null}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-8">
              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Published</FormLabel>
                      <FormDescription>
                        Make this course visible to students
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        Show on homepage
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
