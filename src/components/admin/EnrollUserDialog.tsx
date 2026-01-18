import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, BookOpen } from 'lucide-react';

interface EnrollUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  existingEnrollments: string[];
  onSuccess: () => void;
}

export function EnrollUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  existingEnrollments,
  onSuccess,
}: EnrollUserDialogProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('0');
  const { toast } = useToast();

  // Fetch available courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses-for-enrollment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, price')
        .order('title');
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Filter out already enrolled courses
  const availableCourses = courses?.filter(c => !existingEnrollments.includes(c.id)) || [];

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: selectedCourse,
          amount_paid: Math.round(parseFloat(amountPaid) * 100), // Convert to cents
          status: 'active',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      const courseName = availableCourses.find(c => c.id === selectedCourse)?.title;
      toast({
        title: 'Enrollment successful',
        description: `${userName} has been enrolled in "${courseName}".`,
      });
      setSelectedCourse('');
      setAmountPaid('0');
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Enrollment failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedCourse) {
      toast({
        title: 'Select a course',
        description: 'Please select a course to enroll the user in.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <UserPlus className="h-5 w-5 text-primary" />
            Enroll User in Course
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Manually enroll <span className="text-white font-medium">{userName}</span> in a course
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Select Course</Label>
            {isLoading ? (
              <div className="h-10 bg-slate-800 rounded-md animate-pulse" />
            ) : availableCourses.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg text-slate-400">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">
                  {courses?.length === 0
                    ? 'No courses available'
                    : 'User is already enrolled in all courses'}
                </span>
              </div>
            ) : (
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Choose a course..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{course.title}</span>
                        {course.price != null && course.price > 0 && (
                          <span className="text-slate-400 ml-2">
                            ${(course.price / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Amount Paid ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="bg-slate-800 border-slate-700"
            />
            <p className="text-xs text-slate-500">
              Enter 0 for free/manual enrollments, or the actual amount if payment was received.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-700">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={mutation.isPending || !selectedCourse}
          >
            {mutation.isPending ? 'Enrolling...' : 'Enroll User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
