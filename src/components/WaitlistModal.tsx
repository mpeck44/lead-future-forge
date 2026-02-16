import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2, Mail, User } from "lucide-react";

const formSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  role: z.string().min(1, "Please select your role"),
});

const ROLE_OPTIONS = [
  { value: "superintendent", label: "Superintendent" },
  { value: "principal", label: "Principal" },
  { value: "assistant_principal", label: "Assistant Principal" },
  { value: "curriculum_director", label: "Curriculum Director" },
  { value: "technology_director", label: "Technology Director" },
  { value: "teacher_leader", label: "Teacher Leader" },
  { value: "other", label: "Other" },
];

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
  courseSlug?: string;
  courseTitle?: string;
}

const WaitlistModal = ({
  open,
  onOpenChange,
  source = "hero",
  courseSlug,
  courseTitle,
}: WaitlistModalProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resultStatus, setResultStatus] = useState<"created" | "updated">("created");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse({ full_name: fullName, email, role });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const { data, error: rpcError } = await supabase.rpc("upsert_waitlist_lead", {
      _email: result.data.email,
      _full_name: result.data.full_name,
      _role: result.data.role,
      _source: source,
      _course_slug: courseSlug || undefined,
    });

    setIsSubmitting(false);

    if (rpcError) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    const status = (data as { status: string })?.status;
    setResultStatus(status === "updated" ? "updated" : "created");
    setIsSuccess(true);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setFullName("");
        setEmail("");
        setRole("");
        setErrors({});
        setIsSuccess(false);
      }, 200);
    }
    onOpenChange(open);
  };

  const title = courseTitle
    ? `Join the Waitlist for ${courseTitle}`
    : "Join the Leadership Waitlist";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {resultStatus === "updated" ? "Interest added!" : "You're on the list!"}
              </h3>
              <p className="font-body text-muted-foreground text-sm max-w-xs mx-auto">
                {resultStatus === "updated"
                  ? `We've added ${courseTitle || "this course"} to your interests. We'll keep you posted!`
                  : "We'll let you know when The Leadership Forge opens enrollment. Check your inbox soon."}
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Got it
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{title}</DialogTitle>
              <DialogDescription className="font-body">
                Get launch updates, timeline details, and deliverables previews. No spam.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Full Name */}
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: "" }));
                    }}
                    className="pl-10"
                    autoFocus
                  />
                </div>
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1.5 font-body">{errors.full_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@district.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1.5 font-body">{errors.email}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <Select
                  value={role}
                  onValueChange={(v) => {
                    setRole(v);
                    if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive mt-1.5 font-body">{errors.role}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-body font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join the Leadership Waitlist"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center font-body">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
