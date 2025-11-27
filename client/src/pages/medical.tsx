import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, User, Calendar, Phone, Mail, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { MedicalContact, MedicalReferral, FollowUpTask } from "@shared/schema";
import { format } from "date-fns";

function ContactForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const createContact = useMutation({
    mutationFn: (data: Partial<MedicalContact>) => apiRequest("/api/medical/contacts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/contacts"] });
      toast({ title: "Contact added" });
      setOpen(false);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createContact.mutate({
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      clinic: formData.get("clinic") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      notes: formData.get("notes") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" data-testid="button-add-contact">
          <Plus className="h-4 w-4" /> Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medical Contact</DialogTitle>
          <DialogDescription>Add a doctor, specialist, or healthcare provider.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" placeholder="Dr. Smith" required data-testid="input-contact-name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="GP, Specialist..." data-testid="input-contact-role" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic">Clinic</Label>
              <Input id="clinic" name="clinic" placeholder="City Medical Center" data-testid="input-contact-clinic" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="020 7123 4567" data-testid="input-contact-phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="doctor@clinic.nhs.uk" data-testid="input-contact-email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Additional notes..." data-testid="input-contact-notes" />
          </div>
          <Button type="submit" className="w-full" disabled={createContact.isPending} data-testid="button-save-contact">
            {createContact.isPending ? "Saving..." : "Save Contact"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReferralForm({ contacts, onSuccess }: { contacts: MedicalContact[]; onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const createReferral = useMutation({
    mutationFn: (data: Partial<MedicalReferral>) => apiRequest("/api/medical/referrals", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/referrals"] });
      toast({ title: "Referral tracked" });
      setOpen(false);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createReferral.mutate({
      type: formData.get("type") as string,
      dateSent: formData.get("dateSent") ? new Date(formData.get("dateSent") as string) : undefined,
      senderContactId: formData.get("senderContactId") as string || undefined,
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" data-testid="button-add-referral">
          <Plus className="h-4 w-4" /> Track Referral
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track Referral</DialogTitle>
          <DialogDescription>Keep track of medical referrals and their status.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Referral Type *</Label>
            <Input id="type" name="type" placeholder="Cardiology, Imaging, Blood Test..." required data-testid="input-referral-type" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateSent">Date Sent</Label>
              <Input id="dateSent" name="dateSent" type="date" data-testid="input-referral-date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="pending">
                <SelectTrigger data-testid="select-referral-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="senderContactId">Referring Doctor</Label>
            <Select name="senderContactId">
              <SelectTrigger data-testid="select-referral-doctor">
                <SelectValue placeholder="Select contact..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name} {contact.role && `(${contact.role})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Additional details..." data-testid="input-referral-notes" />
          </div>
          <Button type="submit" className="w-full" disabled={createReferral.isPending} data-testid="button-save-referral">
            {createReferral.isPending ? "Saving..." : "Save Referral"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FollowUpForm({ contacts, referrals, onSuccess }: { contacts: MedicalContact[]; referrals: MedicalReferral[]; onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const createFollowUp = useMutation({
    mutationFn: (data: Partial<FollowUpTask>) => apiRequest("/api/medical/follow-ups", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/follow-ups"] });
      toast({ title: "Follow-up scheduled" });
      setOpen(false);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createFollowUp.mutate({
      purpose: formData.get("purpose") as string,
      triggerDate: new Date(formData.get("triggerDate") as string),
      contactId: formData.get("contactId") as string || undefined,
      referralId: formData.get("referralId") as string || undefined,
      status: "pending",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" data-testid="button-add-followup">
          <Plus className="h-4 w-4" /> Schedule Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
          <DialogDescription>Set a reminder to follow up on your medical care.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Input id="purpose" name="purpose" placeholder="Check referral status, Book appointment..." required data-testid="input-followup-purpose" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="triggerDate">Follow-up Date *</Label>
            <Input id="triggerDate" name="triggerDate" type="date" required data-testid="input-followup-date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactId">Contact (optional)</Label>
            <Select name="contactId">
              <SelectTrigger data-testid="select-followup-contact">
                <SelectValue placeholder="Select contact..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralId">Related Referral (optional)</Label>
            <Select name="referralId">
              <SelectTrigger data-testid="select-followup-referral">
                <SelectValue placeholder="Select referral..." />
              </SelectTrigger>
              <SelectContent>
                {referrals.map((referral) => (
                  <SelectItem key={referral.id} value={referral.id}>
                    {referral.type} - {referral.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={createFollowUp.isPending} data-testid="button-save-followup">
            {createFollowUp.isPending ? "Saving..." : "Schedule Follow-up"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ContactCard({ contact }: { contact: MedicalContact }) {
  return (
    <Card className="hover-elevate" data-testid={`card-contact-${contact.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{contact.name}</p>
            {contact.role && <p className="text-sm text-muted-foreground">{contact.role}</p>}
            {contact.clinic && <p className="text-sm text-muted-foreground">{contact.clinic}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {contact.phone && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Phone className="h-3 w-3" /> {contact.phone}
                </Badge>
              )}
              {contact.email && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Mail className="h-3 w-3" /> {contact.email}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralCard({ referral, contacts }: { referral: MedicalReferral; contacts: MedicalContact[] }) {
  const sender = contacts.find((c) => c.id === referral.senderContactId);
  
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    sent: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    received: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    scheduled: "bg-green-500/10 text-green-700 dark:text-green-400",
    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  };

  return (
    <Card className="hover-elevate" data-testid={`card-referral-${referral.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">{referral.type}</p>
              {sender && <p className="text-sm text-muted-foreground">From: {sender.name}</p>}
              {referral.dateSent && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(referral.dateSent), "d MMM yyyy")}
                </p>
              )}
            </div>
          </div>
          <Badge className={statusColors[referral.status] || ""}>{referral.status}</Badge>
        </div>
        {referral.notes && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{referral.notes}</p>}
      </CardContent>
    </Card>
  );
}

function FollowUpCard({ task, contacts }: { task: FollowUpTask; contacts: MedicalContact[] }) {
  const contact = contacts.find((c) => c.id === task.contactId);
  const isOverdue = new Date(task.triggerDate) < new Date() && task.status !== "completed";
  const isCompleted = task.status === "completed";

  const updateFollowUp = useMutation({
    mutationFn: (data: Partial<FollowUpTask>) => apiRequest(`/api/medical/follow-ups/${task.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/medical/follow-ups"] }),
  });

  return (
    <Card className={`hover-elevate ${isOverdue ? "border-destructive/50" : ""} ${isCompleted ? "opacity-60" : ""}`} data-testid={`card-followup-${task.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isOverdue ? "bg-destructive/10" : "bg-primary/10"}`}>
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : isOverdue ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Clock className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold">{task.purpose}</p>
              {contact && <p className="text-sm text-muted-foreground">Contact: {contact.name}</p>}
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.triggerDate), "d MMM yyyy")}
              </p>
            </div>
          </div>
          {!isCompleted && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateFollowUp.mutate({ status: "completed", completedAt: new Date() })}
              disabled={updateFollowUp.isPending}
              data-testid={`button-complete-followup-${task.id}`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Medical() {
  const { data: contacts = [], isLoading: loadingContacts } = useQuery<MedicalContact[]>({
    queryKey: ["/api/medical/contacts"],
  });

  const { data: referrals = [], isLoading: loadingReferrals } = useQuery<MedicalReferral[]>({
    queryKey: ["/api/medical/referrals"],
  });

  const { data: followUps = [], isLoading: loadingFollowUps } = useQuery<FollowUpTask[]>({
    queryKey: ["/api/medical/follow-ups"],
  });

  const upcomingFollowUps = followUps.filter((t) => t.status !== "completed").sort((a, b) => new Date(a.triggerDate).getTime() - new Date(b.triggerDate).getTime());
  const overdueCount = upcomingFollowUps.filter((t) => new Date(t.triggerDate) < new Date()).length;

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Medical Tracking</h1>
            <p className="text-muted-foreground">Manage your healthcare contacts, referrals, and follow-ups</p>
          </div>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {overdueCount} overdue follow-up{overdueCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <Tabs defaultValue="followups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="followups" data-testid="tab-followups">
              Follow-ups {upcomingFollowUps.length > 0 && `(${upcomingFollowUps.length})`}
            </TabsTrigger>
            <TabsTrigger value="referrals" data-testid="tab-referrals">
              Referrals {referrals.length > 0 && `(${referrals.length})`}
            </TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">
              Contacts {contacts.length > 0 && `(${contacts.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followups" className="space-y-4">
            <div className="flex justify-end">
              <FollowUpForm contacts={contacts} referrals={referrals} onSuccess={() => {}} />
            </div>
            {loadingFollowUps ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : upcomingFollowUps.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No upcoming follow-ups</p>
                  <p className="text-sm text-muted-foreground">Schedule reminders to stay on top of your healthcare</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingFollowUps.map((task) => (
                  <FollowUpCard key={task.id} task={task} contacts={contacts} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <div className="flex justify-end">
              <ReferralForm contacts={contacts} onSuccess={() => {}} />
            </div>
            {loadingReferrals ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : referrals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No referrals tracked yet</p>
                  <p className="text-sm text-muted-foreground">Keep track of medical referrals and their status</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {referrals.map((referral) => (
                  <ReferralCard key={referral.id} referral={referral} contacts={contacts} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-end">
              <ContactForm onSuccess={() => {}} />
            </div>
            {loadingContacts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No contacts added yet</p>
                  <p className="text-sm text-muted-foreground">Add your doctors and healthcare providers</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
