import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { useToast } from '@/hooks/use-toast';
import { UserX, AlertTriangle } from 'lucide-react';

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentStatus: string;
  onSuccess: () => void;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentStatus,
  onSuccess,
}: StatusChangeDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: `${userName}'s status has been changed to ${selectedStatus}.`,
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (selectedStatus !== currentStatus) {
      mutation.mutate(selectedStatus);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <UserX className="h-5 w-5 text-primary" />
            Change User Status
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Update the account status for <span className="text-white font-medium">{userName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Select Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedStatus === 'suspended' && currentStatus !== 'suspended' && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">
                <p className="font-medium">Suspension warning</p>
                <p className="text-red-300/80 mt-1">
                  Suspended users will not be able to access the platform or their courses.
                  They can be reactivated at any time.
                </p>
              </div>
            </div>
          )}

          {selectedStatus === 'inactive' && currentStatus !== 'inactive' && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium">Deactivation notice</p>
                <p className="text-yellow-300/80 mt-1">
                  Inactive users may have limited access to the platform.
                  Consider reaching out before deactivating their account.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-700">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={mutation.isPending}
            variant={selectedStatus === 'suspended' ? 'destructive' : 'default'}
          >
            {mutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
