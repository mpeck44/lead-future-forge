import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface UnenrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  courseName: string;
  onSuccess: () => void;
}

export function UnenrollDialog({
  open,
  onOpenChange,
  enrollmentId,
  courseName,
  onSuccess,
}: UnenrollDialogProps) {
  const [action, setAction] = useState<'refund' | 'remove'>('refund');
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      if (action === 'remove') {
        // Permanently delete the enrollment
        const { error } = await supabase
          .from('enrollments')
          .delete()
          .eq('id', enrollmentId);
        if (error) throw error;
      } else {
        // Mark as refunded
        const { error } = await supabase
          .from('enrollments')
          .update({ status: 'refunded' })
          .eq('id', enrollmentId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: action === 'remove' ? 'Enrollment removed' : 'Enrollment refunded',
        description: action === 'remove'
          ? `The enrollment has been permanently removed.`
          : `The enrollment has been marked as refunded.`,
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Remove Enrollment
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Choose how to handle the enrollment for "{courseName}".
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <RadioGroup value={action} onValueChange={(v) => setAction(v as 'refund' | 'remove')}>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800 border border-slate-700 mb-2">
              <RadioGroupItem value="refund" id="refund" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="refund" className="text-white font-medium cursor-pointer">
                  Mark as Refunded
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Keep the enrollment record but mark it as refunded. 
                  The user will lose access to the course.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
              <RadioGroupItem value="remove" id="remove" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="remove" className="text-white font-medium cursor-pointer">
                  Remove Permanently
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Permanently delete the enrollment record. 
                  This cannot be undone and progress data may be lost.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-700">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className={action === 'remove' ? 'bg-red-600 hover:bg-red-700' : ''}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? 'Processing...'
              : action === 'remove'
              ? 'Remove Enrollment'
              : 'Mark as Refunded'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
