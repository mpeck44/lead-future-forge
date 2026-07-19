import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { User, Save, Trash2, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  district_name: z.string().min(2, "District name must be at least 2 characters"),
  role: z.string().min(1, "Please select your role"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const roleOptions = [
  { value: "superintendent", label: "Superintendent" },
  { value: "principal", label: "Principal" },
  { value: "assistant_principal", label: "Assistant Principal" },
  { value: "curriculum_director", label: "Curriculum Director" },
  { value: "technology_director", label: "Technology Director" },
  { value: "teacher_leader", label: "Teacher Leader" },
  { value: "other", label: "Other" },
];

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: "",
      district_name: "",
      role: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            full_name: data.full_name || "",
            email: data.email || user.email || "",
            district_name: data.district_name || "",
            role: data.role || "",
          });
          setCreatedAt(data.created_at);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, form, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      // Update profile fields (excluding email — email is the auth credential)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          district_name: data.district_name,
          role: data.role,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // If email changed, trigger Supabase auth email-change flow
      const currentEmail = (user.email || "").toLowerCase();
      const nextEmail = data.email.trim().toLowerCase();
      const emailChanged = nextEmail && nextEmail !== currentEmail;

      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser(
          { email: nextEmail },
          { emailRedirectTo: `${window.location.origin}/dashboard` }
        );

        if (emailError) {
          const msg = emailError.message?.toLowerCase() || "";
          let friendly = emailError.message;
          if (msg.includes("already") || msg.includes("registered") || msg.includes("in use")) {
            friendly = "That email is already in use by another account.";
          } else if (msg.includes("rate") || msg.includes("limit")) {
            friendly = "Too many attempts. Please try again in a few minutes.";
          }
          toast({
            title: "Email change failed",
            description: friendly,
            variant: "destructive",
          });
          // Revert the input to the current login email
          form.setValue("email", user.email || "");
        } else {
          toast({
            title: "Check your new email",
            description: `We sent a confirmation link to ${nextEmail}. Your login email won't change until you confirm.`,
          });
        }
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;

    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: user?.id },
      });

      if (error) throw error;

      await signOut();
      navigate("/");
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteConfirmText("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="font-body text-muted-foreground mt-2">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription className="font-body">
                Update your personal details and professional information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the email associated with your account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your district name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roleOptions.map((option) => (
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

                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Account Management Card */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Account Management
              </CardTitle>
              <CardDescription className="font-body">
                Manage your account settings and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {createdAt && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Account created:</span>{" "}
                  {format(new Date(createdAt), "MMMM d, yyyy")}
                </div>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers, including:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your profile information</li>
                        <li>Course progress and enrollments</li>
                        <li>All associated data</li>
                      </ul>
                      <p className="font-medium">
                        Type <span className="font-mono text-destructive">DELETE</span> to confirm:
                      </p>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="mt-2"
                      />
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || deleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {deleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
