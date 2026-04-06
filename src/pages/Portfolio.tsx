import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Folder, 
  Plus, 
  FileText, 
  Download, 
  Trash2, 
  Edit2, 
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  Upload,
  Rocket,
  CircleDot
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  course_id: string | null;
  lesson_id: string | null;
  used_in_district: boolean | null;
  used_at: string | null;
  course?: {
    title: string;
  } | null;
  lesson?: {
    title: string;
  } | null;
}

const Portfolio = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [file, setFile] = useState<File | null>(null);

  const fetchItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('portfolio_items')
      .select(`
        *,
        course:courses(title),
        lesson:lessons(title)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolio items:', error);
      toast.error('Failed to load portfolio items');
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('portfolio')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    const { data: urlData, error: urlError } = await supabase.storage
      .from('portfolio')
      .createSignedUrl(fileName, 3600);

    if (urlError || !urlData?.signedUrl) {
      console.error('Error creating signed URL:', urlError);
      throw new Error('Failed to generate file URL');
    }

    return urlData.signedUrl;
  };

  const handleCreate = async () => {
    if (!user || !title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);
    try {
      let fileUrl = null;
      let fileType = null;

      if (file) {
        fileUrl = await uploadFile(file);
        fileType = file.type;
      }

      const { error } = await supabase
        .from('portfolio_items')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          file_url: fileUrl,
          file_type: fileType,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        });

      if (error) throw error;

      toast.success('Portfolio item created');
      setIsCreateOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create portfolio item');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!user || !editingItem || !title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);
    try {
      let fileUrl = editingItem.file_url;
      let fileType = editingItem.file_type;

      if (file) {
        fileUrl = await uploadFile(file);
        fileType = file.type;
      }

      const { error } = await supabase
        .from('portfolio_items')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          file_url: fileUrl,
          file_type: fileType,
          status,
          completed_at: status === 'completed' && !editingItem.completed_at 
            ? new Date().toISOString() 
            : editingItem.completed_at
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      toast.success('Portfolio item updated');
      setIsEditOpen(false);
      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update portfolio item');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete item');
    } else {
      toast.success('Item deleted');
      fetchItems();
    }
  };

  const openEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setStatus(item.status);
    setFile(null);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('draft');
    setFile(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
      case 'shared':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Shared</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-5 w-5" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('image')) return <FileText className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5" />;
  };

  const handleMarkAsUsed = async (id: string, checked: boolean) => {
    const { error } = await supabase
      .from('portfolio_items')
      .update({
        used_in_district: checked,
        used_at: checked ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update item');
    } else {
      // Update local state
      setItems(items.map(item => 
        item.id === id 
          ? { ...item, used_in_district: checked, used_at: checked ? new Date().toISOString() : null }
          : item
      ));
    }
  };

  const stats = {
    total: items.length,
    completed: items.filter(i => i.status === 'completed').length,
    drafts: items.filter(i => i.status === 'draft').length,
    usedInDistrict: items.filter(i => i.used_in_district).length
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
                My Portfolio
              </h1>
              <p className="font-body text-muted-foreground">
                Work products you can use tomorrow.
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="font-body" onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="font-display">Add Portfolio Item</DialogTitle>
                  <DialogDescription className="font-body">
                    Create a new deliverable or achievement for your portfolio.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-body">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., AI Implementation Plan"
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-body">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your deliverable..."
                      className="font-body resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-body">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="font-body">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft" className="font-body">Draft</SelectItem>
                        <SelectItem value="completed" className="font-body">Completed</SelectItem>
                        <SelectItem value="shared" className="font-body">Shared</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file" className="font-body">Attachment (optional)</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="font-body"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="font-body">
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={uploading} className="font-body">
                    {uploading ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                  Built
                </CardTitle>
                <Folder className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                  Ready to use
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">{stats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                  Still drafting
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">{stats.drafts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                  Used in district
                </CardTitle>
                <Rocket className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">{stats.usedInDistrict}</div>
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="font-display text-2xl font-semibold mb-3">
                  Start Building Your Portfolio
                </h2>
                <p className="font-body text-muted-foreground mb-6 max-w-md mx-auto">
                  Create deliverables as you complete course lessons. Your portfolio showcases your leadership growth and practical applications.
                </p>
                <Button onClick={() => setIsCreateOpen(true)} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Items Grid */}
          {!loading && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getFileIcon(item.file_type)}
                        <CardTitle className="font-display text-lg leading-tight">
                          {item.title}
                        </CardTitle>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    {item.course && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <BookOpen className="h-3 w-3" />
                        <span className="font-body">{item.course.title}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {item.description && (
                      <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                        <Calendar className="h-3 w-3" />
                        <span className="font-body">Created {formatDate(item.created_at)}</span>
                      </div>
                      
                      {/* Used in District Checkbox */}
                      <div className="flex items-center gap-2 pb-4 mb-4 border-b">
                        <Checkbox 
                          id={`used-${item.id}`}
                          checked={item.used_in_district || false}
                          onCheckedChange={(checked) => handleMarkAsUsed(item.id, checked as boolean)}
                        />
                        <label 
                          htmlFor={`used-${item.id}`}
                          className="text-sm font-body text-muted-foreground cursor-pointer"
                        >
                          Used in my district
                        </label>
                        {item.used_in_district && (
                          <Rocket className="h-3 w-3 text-accent ml-auto" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display">Delete Item?</AlertDialogTitle>
                              <AlertDialogDescription className="font-body">
                                This will permanently delete "{item.title}" from your portfolio. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(item.id)}
                                className="bg-destructive hover:bg-destructive/90 font-body"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display">Edit Portfolio Item</DialogTitle>
                <DialogDescription className="font-body">
                  Update your portfolio item details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="font-body">Title</Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="font-body"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="font-body">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="font-body resize-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="font-body">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="font-body">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft" className="font-body">Draft</SelectItem>
                      <SelectItem value="completed" className="font-body">Completed</SelectItem>
                      <SelectItem value="shared" className="font-body">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-file" className="font-body">Replace Attachment (optional)</Label>
                  <Input
                    id="edit-file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="font-body"
                  />
                  {editingItem?.file_url && !file && (
                    <p className="text-xs text-muted-foreground font-body">
                      Current file will be kept unless you upload a new one.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)} className="font-body">
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={uploading} className="font-body">
                  {uploading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Portfolio;
