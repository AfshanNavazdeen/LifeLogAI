import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Plus, User, Calendar, Phone, Mail, FileText, Clock, CheckCircle2, AlertCircle, Bell, BellOff,
  Users, Heart, Pill, Stethoscope, Activity, Brain, Sparkles, X, Check, Edit2, Trash2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { 
  MedicalContact, MedicalReferral, FollowUpTask, FamilyMember, Condition, Medication, AiIntake, AiParsedItem 
} from "@shared/schema";
import { format } from "date-fns";

// ============================================
// FAMILY MEMBER COMPONENTS
// ============================================
function FamilyMemberForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const createMember = useMutation({
    mutationFn: (data: Partial<FamilyMember>) => apiRequest("/api/medical/family", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/family"] });
      toast({ title: "Family member added" });
      setOpen(false);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMember.mutate({
      name: formData.get("name") as string,
      relationship: formData.get("relationship") as string,
      dateOfBirth: formData.get("dateOfBirth") ? new Date(formData.get("dateOfBirth") as string) : undefined,
      notes: formData.get("notes") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2" data-testid="button-add-family-member">
          <Plus className="h-4 w-4" /> Add Family Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>Add a family member to track their health records.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" placeholder="John" required data-testid="input-family-name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select name="relationship" required defaultValue="self">
              <SelectTrigger data-testid="select-family-relationship">
                <SelectValue placeholder="Select relationship..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Self</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" data-testid="input-family-dob" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Additional notes..." data-testid="input-family-notes" />
          </div>
          <Button type="submit" className="w-full" disabled={createMember.isPending} data-testid="button-save-family-member">
            {createMember.isPending ? "Saving..." : "Add Family Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FamilyMemberSelector({ 
  selectedId, 
  onSelect, 
  familyMembers 
}: { 
  selectedId?: string; 
  onSelect: (id: string | undefined) => void;
  familyMembers: FamilyMember[];
}) {
  return (
    <Select value={selectedId || "all"} onValueChange={(v) => onSelect(v === "all" ? undefined : v)}>
      <SelectTrigger className="w-[200px]" data-testid="select-family-filter">
        <Users className="h-4 w-4 mr-2" />
        <SelectValue placeholder="All family members" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Family Members</SelectItem>
        {familyMembers.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name} ({member.relationship})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ============================================
// CONDITION COMPONENTS
// ============================================
function ConditionForm({ familyMembers, onSuccess }: { familyMembers: FamilyMember[]; onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const createCondition = useMutation({
    mutationFn: (data: Partial<Condition>) => apiRequest("/api/medical/conditions", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/conditions"] });
      toast({ title: "Condition added" });
      setOpen(false);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCondition.mutate({
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      status: formData.get("status") as string,
      familyMemberId: formData.get("familyMemberId") as string || undefined,
      severity: formData.get("severity") as string || undefined,
      diagnosisDate: formData.get("diagnosisDate") ? new Date(formData.get("diagnosisDate") as string) : undefined,
      notes: formData.get("notes") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" data-testid="button-add-condition">
          <Plus className="h-4 w-4" /> Add Condition
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Health Condition</DialogTitle>
          <DialogDescription>Track a chronic condition, diagnosis, or preventive health measure.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Condition Name *</Label>
            <Input id="name" name="name" placeholder="e.g., Asthma, Flu, Vaccination" required data-testid="input-condition-name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select name="type" required defaultValue="episodic">
                <SelectTrigger data-testid="select-condition-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chronic">Chronic</SelectItem>
                  <SelectItem value="episodic">Episodic</SelectItem>
                  <SelectItem value="diagnosis">Diagnosis</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger data-testid="select-condition-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="familyMemberId">Family Member</Label>
              <Select name="familyMemberId">
                <SelectTrigger data-testid="select-condition-family">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select name="severity">
                <SelectTrigger data-testid="select-condition-severity">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="diagnosisDate">Diagnosis Date</Label>
            <Input id="diagnosisDate" name="diagnosisDate" type="date" data-testid="input-condition-date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Additional notes..." data-testid="input-condition-notes" />
          </div>
          <Button type="submit" className="w-full" disabled={createCondition.isPending} data-testid="button-save-condition">
            {createCondition.isPending ? "Saving..." : "Add Condition"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ConditionCard({ condition, familyMembers }: { condition: Condition; familyMembers: FamilyMember[] }) {
  const member = familyMembers.find((m) => m.id === condition.familyMemberId);
  
  const typeIcons: Record<string, any> = {
    chronic: Heart,
    episodic: Activity,
    diagnosis: Stethoscope,
    preventive: Pill,
  };
  
  const typeColors: Record<string, string> = {
    chronic: "bg-red-500/10 text-red-700 dark:text-red-400",
    episodic: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    diagnosis: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    preventive: "bg-green-500/10 text-green-700 dark:text-green-400",
  };
  
  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-700",
    monitoring: "bg-yellow-500/10 text-yellow-700",
    resolved: "bg-slate-500/10 text-slate-600",
  };

  const Icon = typeIcons[condition.type] || Activity;

  return (
    <Card className="hover-elevate" data-testid={`card-condition-${condition.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${typeColors[condition.type]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{condition.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize">{condition.type}</Badge>
                {member && <Badge variant="secondary" className="text-xs">{member.name}</Badge>}
              </div>
              {condition.diagnosisDate && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(condition.diagnosisDate), "d MMM yyyy")}
                </p>
              )}
            </div>
          </div>
          <Badge className={statusColors[condition.status]}>{condition.status}</Badge>
        </div>
        {condition.notes && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{condition.notes}</p>}
      </CardContent>
    </Card>
  );
}

// ============================================
// MEDICATION COMPONENTS
// ============================================
function MedicationForm({ familyMembers, conditions, contacts, onSuccess }: { 
  familyMembers: FamilyMember[]; 
  conditions: Condition[];
  contacts: MedicalContact[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const createMedication = useMutation({
    mutationFn: (data: Partial<Medication>) => apiRequest("/api/medical/medications", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/medications"] });
      toast({ title: "Medication added" });
      setOpen(false);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMedication.mutate({
      name: formData.get("name") as string,
      dosage: formData.get("dosage") as string,
      frequency: formData.get("frequency") as string,
      route: formData.get("route") as string,
      familyMemberId: formData.get("familyMemberId") as string || undefined,
      conditionId: formData.get("conditionId") as string || undefined,
      prescribedBy: formData.get("prescribedBy") as string || undefined,
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : undefined,
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" data-testid="button-add-medication">
          <Plus className="h-4 w-4" /> Add Medication
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
          <DialogDescription>Track current or past medications.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medication Name *</Label>
            <Input id="name" name="name" placeholder="e.g., Ibuprofen" required data-testid="input-medication-name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" name="dosage" placeholder="e.g., 400mg" data-testid="input-medication-dosage" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select name="frequency">
                <SelectTrigger data-testid="select-medication-frequency">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once_daily">Once daily</SelectItem>
                  <SelectItem value="twice_daily">Twice daily</SelectItem>
                  <SelectItem value="three_times_daily">Three times daily</SelectItem>
                  <SelectItem value="as_needed">As needed</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Select name="route">
                <SelectTrigger data-testid="select-medication-route">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oral">Oral</SelectItem>
                  <SelectItem value="topical">Topical</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="inhalation">Inhalation</SelectItem>
                  <SelectItem value="drops">Drops</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger data-testid="select-medication-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="familyMemberId">For</Label>
              <Select name="familyMemberId">
                <SelectTrigger data-testid="select-medication-family">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conditionId">For Condition</Label>
              <Select name="conditionId">
                <SelectTrigger data-testid="select-medication-condition">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.id} value={condition.id}>
                      {condition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prescribedBy">Prescribed By</Label>
              <Select name="prescribedBy">
                <SelectTrigger data-testid="select-medication-doctor">
                  <SelectValue placeholder="Select..." />
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
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" data-testid="input-medication-start" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Side effects, instructions..." data-testid="input-medication-notes" />
          </div>
          <Button type="submit" className="w-full" disabled={createMedication.isPending} data-testid="button-save-medication">
            {createMedication.isPending ? "Saving..." : "Add Medication"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MedicationCard({ medication, familyMembers, conditions }: { 
  medication: Medication; 
  familyMembers: FamilyMember[];
  conditions: Condition[];
}) {
  const member = familyMembers.find((m) => m.id === medication.familyMemberId);
  const condition = conditions.find((c) => c.id === medication.conditionId);
  
  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-700",
    completed: "bg-blue-500/10 text-blue-700",
    discontinued: "bg-red-500/10 text-red-700",
  };

  return (
    <Card className="hover-elevate" data-testid={`card-medication-${medication.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Pill className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold">{medication.name}</p>
              {medication.dosage && <p className="text-sm text-muted-foreground">{medication.dosage}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {medication.frequency && <Badge variant="outline" className="text-xs">{medication.frequency.replace(/_/g, ' ')}</Badge>}
                {member && <Badge variant="secondary" className="text-xs">{member.name}</Badge>}
                {condition && <Badge variant="secondary" className="text-xs">{condition.name}</Badge>}
              </div>
            </div>
          </div>
          <Badge className={statusColors[medication.status]}>{medication.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// CONTACT COMPONENTS
// ============================================
function ContactForm({ familyMembers, onSuccess }: { familyMembers: FamilyMember[]; onSuccess: () => void }) {
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
      specialty: formData.get("specialty") as string,
      clinic: formData.get("clinic") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      familyMemberId: formData.get("familyMemberId") as string || undefined,
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
              <Input id="role" name="role" placeholder="GP, Nurse..." data-testid="input-contact-role" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input id="specialty" name="specialty" placeholder="Cardiology..." data-testid="input-contact-specialty" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic">Clinic / Hospital</Label>
            <Input id="clinic" name="clinic" placeholder="City Medical Center" data-testid="input-contact-clinic" />
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
            <Label htmlFor="familyMemberId">Primary for</Label>
            <Select name="familyMemberId">
              <SelectTrigger data-testid="select-contact-family">
                <SelectValue placeholder="Select family member..." />
              </SelectTrigger>
              <SelectContent>
                {familyMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

function ContactCard({ contact, familyMembers }: { contact: MedicalContact; familyMembers: FamilyMember[] }) {
  const member = familyMembers.find((m) => m.id === contact.familyMemberId);
  
  return (
    <Card className="hover-elevate" data-testid={`card-contact-${contact.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{contact.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {contact.role && <span>{contact.role}</span>}
              {contact.specialty && <span className="text-primary">• {contact.specialty}</span>}
            </div>
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
              {member && (
                <Badge variant="secondary" className="text-xs">
                  {member.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// REFERRAL COMPONENTS
// ============================================
function ReferralForm({ familyMembers, conditions, contacts, onSuccess }: { 
  familyMembers: FamilyMember[];
  conditions: Condition[];
  contacts: MedicalContact[]; 
  onSuccess: () => void;
}) {
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
      referredTo: formData.get("referredTo") as string,
      dateSent: formData.get("dateSent") ? new Date(formData.get("dateSent") as string) : undefined,
      senderContactId: formData.get("senderContactId") as string || undefined,
      familyMemberId: formData.get("familyMemberId") as string || undefined,
      conditionId: formData.get("conditionId") as string || undefined,
      urgency: formData.get("urgency") as string,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Referral Type *</Label>
              <Select name="type" required defaultValue="specialist">
                <SelectTrigger data-testid="select-referral-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="lab">Lab Tests</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referredTo">Referred To</Label>
              <Input id="referredTo" name="referredTo" placeholder="Hospital, Clinic..." data-testid="input-referral-to" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateSent">Date Sent</Label>
              <Input id="dateSent" name="dateSent" type="date" data-testid="input-referral-date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select name="urgency" defaultValue="routine">
                <SelectTrigger data-testid="select-referral-urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="familyMemberId">For</Label>
              <Select name="familyMemberId">
                <SelectTrigger data-testid="select-referral-family">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conditionId">For Condition</Label>
              <Select name="conditionId">
                <SelectTrigger data-testid="select-referral-condition">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.id} value={condition.id}>
                      {condition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderContactId">Referring Doctor</Label>
              <Select name="senderContactId">
                <SelectTrigger data-testid="select-referral-doctor">
                  <SelectValue placeholder="Select..." />
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
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="pending">
                <SelectTrigger data-testid="select-referral-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

function ReferralCard({ referral, contacts, familyMembers, conditions }: { 
  referral: MedicalReferral; 
  contacts: MedicalContact[];
  familyMembers: FamilyMember[];
  conditions: Condition[];
}) {
  const sender = contacts.find((c) => c.id === referral.senderContactId);
  const member = familyMembers.find((m) => m.id === referral.familyMemberId);
  const condition = conditions.find((c) => c.id === referral.conditionId);
  
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    received: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    scheduled: "bg-green-500/10 text-green-700 dark:text-green-400",
    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
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
              <p className="font-semibold capitalize">{referral.type} Referral</p>
              {referral.referredTo && <p className="text-sm text-muted-foreground">To: {referral.referredTo}</p>}
              {sender && <p className="text-sm text-muted-foreground">From: {sender.name}</p>}
              <div className="flex flex-wrap gap-1 mt-1">
                {member && <Badge variant="secondary" className="text-xs">{member.name}</Badge>}
                {condition && <Badge variant="outline" className="text-xs">{condition.name}</Badge>}
              </div>
              {referral.dateSent && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
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

// ============================================
// FOLLOW-UP COMPONENTS
// ============================================
function FollowUpForm({ familyMembers, conditions, contacts, referrals, onSuccess }: { 
  familyMembers: FamilyMember[];
  conditions: Condition[];
  contacts: MedicalContact[]; 
  referrals: MedicalReferral[]; 
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const createFollowUp = useMutation({
    mutationFn: (data: Partial<FollowUpTask>) => apiRequest("/api/medical/follow-ups", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/follow-ups"] });
      toast({ title: "Follow-up scheduled" });
      setOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save follow-up", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createFollowUp.mutate({
      purpose: formData.get("purpose") as string,
      description: formData.get("description") as string,
      triggerDate: new Date(formData.get("triggerDate") as string),
      triggerTime: formData.get("triggerTime") as string || undefined,
      familyMemberId: formData.get("familyMemberId") as string || undefined,
      conditionId: formData.get("conditionId") as string || undefined,
      contactId: formData.get("contactId") as string || undefined,
      referralId: formData.get("referralId") as string || undefined,
      priority: formData.get("priority") as string,
      notificationsEnabled: notificationsEnabled ? "true" : "false",
      status: "pending",
    });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast({ title: "Notifications enabled" });
      } else {
        toast({ title: "Notifications blocked", variant: "destructive" });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" data-testid="button-add-followup">
          <Plus className="h-4 w-4" /> Schedule Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
          <DialogDescription>Set a reminder to follow up on your medical care.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Input id="purpose" name="purpose" placeholder="Call hospital, Check referral..." required data-testid="input-followup-purpose" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="More details..." data-testid="input-followup-description" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="triggerDate">Date *</Label>
              <Input id="triggerDate" name="triggerDate" type="date" required data-testid="input-followup-date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="triggerTime">Time</Label>
              <Input id="triggerTime" name="triggerTime" type="time" data-testid="input-followup-time" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="normal">
                <SelectTrigger data-testid="select-followup-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="familyMemberId">For</Label>
              <Select name="familyMemberId">
                <SelectTrigger data-testid="select-followup-family">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conditionId">Related Condition</Label>
              <Select name="conditionId">
                <SelectTrigger data-testid="select-followup-condition">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.id} value={condition.id}>
                      {condition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactId">Contact</Label>
              <Select name="contactId">
                <SelectTrigger data-testid="select-followup-contact">
                  <SelectValue placeholder="Select..." />
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
              <Label htmlFor="referralId">Related Referral</Label>
              <Select name="referralId">
                <SelectTrigger data-testid="select-followup-referral">
                  <SelectValue placeholder="Select..." />
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
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">Enable Reminder</p>
                <p className="text-xs text-muted-foreground">Get notified on this date</p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={(checked) => {
                if (checked && "Notification" in window && Notification.permission !== "granted") {
                  requestNotificationPermission();
                } else {
                  setNotificationsEnabled(checked);
                }
              }}
              data-testid="switch-notifications"
            />
          </div>
          <Button type="submit" className="w-full" disabled={createFollowUp.isPending} data-testid="button-save-followup">
            {createFollowUp.isPending ? "Saving..." : "Schedule Follow-up"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FollowUpCard({ task, contacts, familyMembers, conditions }: { 
  task: FollowUpTask; 
  contacts: MedicalContact[];
  familyMembers: FamilyMember[];
  conditions: Condition[];
}) {
  const contact = contacts.find((c) => c.id === task.contactId);
  const member = familyMembers.find((m) => m.id === task.familyMemberId);
  const condition = conditions.find((c) => c.id === task.conditionId);
  const isOverdue = new Date(task.triggerDate) < new Date() && task.status !== "completed";
  const isCompleted = task.status === "completed";
  const hasNotifications = task.notificationsEnabled === "true";

  const updateFollowUp = useMutation({
    mutationFn: (data: Partial<FollowUpTask>) => apiRequest(`/api/medical/follow-ups/${task.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/medical/follow-ups"] }),
  });

  const priorityColors: Record<string, string> = {
    low: "text-slate-500",
    normal: "text-blue-500",
    high: "text-orange-500",
    urgent: "text-red-500",
  };

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
                <Clock className={`h-5 w-5 ${priorityColors[task.priority || 'normal']}`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{task.purpose}</p>
                {hasNotifications && <Bell className="h-3 w-3 text-primary" />}
              </div>
              {task.description && <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>}
              <div className="flex flex-wrap gap-1 mt-1">
                {member && <Badge variant="secondary" className="text-xs">{member.name}</Badge>}
                {condition && <Badge variant="outline" className="text-xs">{condition.name}</Badge>}
                {contact && <Badge variant="outline" className="text-xs">{contact.name}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.triggerDate), "d MMM yyyy")}
                {task.triggerTime && (
                  <span className="ml-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.triggerTime}
                  </span>
                )}
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

// ============================================
// AI TEXT ENTRY COMPONENT
// ============================================
function AiTextEntry({ familyMembers, onSuccess }: { familyMembers: FamilyMember[]; onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [parsedItems, setParsedItems] = useState<AiParsedItem[]>([]);
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const parseText = useMutation({
    mutationFn: (text: string) => apiRequest("/api/medical/ai/parse", { method: "POST", body: JSON.stringify({ text }) }),
    onSuccess: (data: any) => {
      setParsedItems(data.items || []);
      setIntakeId(data.intake?.id);
      setShowConfirmation(true);
    },
    onError: () => {
      toast({ title: "Failed to parse text", variant: "destructive" });
    },
  });

  const confirmItems = useMutation({
    mutationFn: (selectedItems: AiParsedItem[]) => 
      apiRequest(`/api/medical/ai/intakes/${intakeId}/confirm`, { 
        method: "POST", 
        body: JSON.stringify({ selectedItems }) 
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical"] });
      const counts = data.created;
      const parts = [];
      if (counts.contacts?.length) parts.push(`${counts.contacts.length} contact(s)`);
      if (counts.referrals?.length) parts.push(`${counts.referrals.length} referral(s)`);
      if (counts.followUps?.length) parts.push(`${counts.followUps.length} follow-up(s)`);
      if (counts.conditions?.length) parts.push(`${counts.conditions.length} condition(s)`);
      if (counts.medications?.length) parts.push(`${counts.medications.length} medication(s)`);
      toast({ title: "Created", description: parts.join(", ") || "No items created" });
      setOpen(false);
      setShowConfirmation(false);
      setText("");
      setParsedItems([]);
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to save items", variant: "destructive" });
    },
  });

  const handleParse = () => {
    if (text.trim()) {
      parseText.mutate(text);
    }
  };

  const handleConfirm = () => {
    confirmItems.mutate(parsedItems);
  };

  const removeItem = (index: number) => {
    setParsedItems(items => items.filter((_, i) => i !== index));
  };

  const typeLabels: Record<string, string> = {
    contact: "Contact",
    referral: "Referral",
    followUp: "Follow-up",
    condition: "Condition",
    medication: "Medication",
  };

  const typeIcons: Record<string, any> = {
    contact: User,
    referral: FileText,
    followUp: Clock,
    condition: Heart,
    medication: Pill,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-ai-entry">
          <Sparkles className="h-4 w-4" /> Quick Text Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Medical Entry
          </DialogTitle>
          <DialogDescription>
            Paste or type your medical notes and the AI will extract contacts, referrals, follow-ups, and more.
          </DialogDescription>
        </DialogHeader>
        
        {!showConfirmation ? (
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: 'Cath Hagan, a nurse from the First-Fit Clinic, called on 25th November. Her phone number is 07385384089. She mentioned an EEG referral to John Radcliff Hospital. Remind me to call them in a week to check if they received it.'"
              className="min-h-[200px]"
              data-testid="textarea-ai-input"
            />
            <Button 
              onClick={handleParse} 
              disabled={parseText.isPending || !text.trim()} 
              className="w-full gap-2"
              data-testid="button-parse-text"
            >
              {parseText.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Extract Medical Data
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <p className="text-sm text-muted-foreground mb-4">
              Review the extracted items below. You can remove items you don't want to save.
            </p>
            <ScrollArea className="flex-1 max-h-[400px] pr-4">
              <div className="space-y-3">
                {parsedItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No items extracted from the text.</p>
                ) : (
                  parsedItems.map((item, index) => {
                    const Icon = typeIcons[item.type] || FileText;
                    return (
                      <Card key={index} className="relative" data-testid={`card-parsed-item-${index}`}>
                        <CardContent className="p-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => removeItem(index)}
                            data-testid={`button-remove-item-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{typeLabels[item.type]}</Badge>
                                {item.familyMemberName && (
                                  <Badge variant="secondary" className="text-xs">{item.familyMemberName}</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(item.confidence * 100)}% confidence
                                </span>
                              </div>
                              <div className="mt-2 text-sm">
                                {Object.entries(item.data).map(([key, value]) => (
                                  value && (
                                    <p key={key} className="text-muted-foreground">
                                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
                                      {String(value)}
                                    </p>
                                  )
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" onClick={() => setShowConfirmation(false)} data-testid="button-back">
                Back
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={confirmItems.isPending || parsedItems.length === 0}
                className="gap-2"
                data-testid="button-confirm-items"
              >
                {confirmItems.isPending ? "Saving..." : (
                  <>
                    <Check className="h-4 w-4" /> Confirm & Save ({parsedItems.length})
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN MEDICAL PAGE
// ============================================
export default function Medical() {
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string | undefined>();

  const { data: familyMembers = [], isLoading: loadingFamily } = useQuery<FamilyMember[]>({
    queryKey: ["/api/medical/family"],
  });

  const { data: conditions = [], isLoading: loadingConditions } = useQuery<Condition[]>({
    queryKey: ["/api/medical/conditions"],
  });

  const { data: medications = [], isLoading: loadingMedications } = useQuery<Medication[]>({
    queryKey: ["/api/medical/medications"],
  });

  const { data: contacts = [], isLoading: loadingContacts } = useQuery<MedicalContact[]>({
    queryKey: ["/api/medical/contacts"],
  });

  const { data: referrals = [], isLoading: loadingReferrals } = useQuery<MedicalReferral[]>({
    queryKey: ["/api/medical/referrals"],
  });

  const { data: followUps = [], isLoading: loadingFollowUps } = useQuery<FollowUpTask[]>({
    queryKey: ["/api/medical/follow-ups"],
  });

  const filterByFamily = <T extends { familyMemberId?: string | null }>(items: T[]) => {
    if (!selectedFamilyMemberId) return items;
    return items.filter(item => item.familyMemberId === selectedFamilyMemberId);
  };

  const filteredConditions = filterByFamily(conditions);
  const filteredMedications = filterByFamily(medications);
  const filteredContacts = filterByFamily(contacts);
  const filteredReferrals = filterByFamily(referrals);
  const filteredFollowUps = filterByFamily(followUps);

  const upcomingFollowUps = filteredFollowUps
    .filter((t) => t.status !== "completed")
    .sort((a, b) => new Date(a.triggerDate).getTime() - new Date(b.triggerDate).getTime());
  const overdueCount = upcomingFollowUps.filter((t) => new Date(t.triggerDate) < new Date()).length;

  const activeConditions = filteredConditions.filter(c => c.status === "active");
  const activeMedications = filteredMedications.filter(m => m.status === "active");

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Medical Tracking</h1>
            <p className="text-muted-foreground">Manage health records for you and your family</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {overdueCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {overdueCount} overdue
              </Badge>
            )}
            <AiTextEntry familyMembers={familyMembers} onSuccess={() => {}} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <FamilyMemberSelector 
            selectedId={selectedFamilyMemberId} 
            onSelect={setSelectedFamilyMemberId}
            familyMembers={familyMembers}
          />
          <FamilyMemberForm onSuccess={() => {}} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover-elevate" data-testid="stat-conditions">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeConditions.length}</p>
                <p className="text-sm text-muted-foreground">Active Conditions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate" data-testid="stat-medications">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Pill className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeMedications.length}</p>
                <p className="text-sm text-muted-foreground">Active Medications</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate" data-testid="stat-followups">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingFollowUps.length}</p>
                <p className="text-sm text-muted-foreground">Pending Follow-ups</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate" data-testid="stat-contacts">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <User className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredContacts.length}</p>
                <p className="text-sm text-muted-foreground">Medical Contacts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="conditions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="conditions" data-testid="tab-conditions">
              Conditions
            </TabsTrigger>
            <TabsTrigger value="appointments" data-testid="tab-appointments">
              Appointments
            </TabsTrigger>
            <TabsTrigger value="medications" data-testid="tab-medications">
              Medications
            </TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">
              Contacts
            </TabsTrigger>
            <TabsTrigger value="family" data-testid="tab-family">
              Family
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conditions" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Track chronic conditions, diagnoses, and preventive health</p>
              <ConditionForm familyMembers={familyMembers} onSuccess={() => {}} />
            </div>
            {loadingConditions ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
            ) : filteredConditions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No conditions tracked yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredConditions.map((condition) => (
                  <ConditionCard key={condition.id} condition={condition} familyMembers={familyMembers} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">Follow-ups</h3>
                  <p className="text-sm text-muted-foreground">Reminders and tasks</p>
                </div>
                <FollowUpForm 
                  familyMembers={familyMembers} 
                  conditions={conditions}
                  contacts={contacts} 
                  referrals={referrals} 
                  onSuccess={() => {}} 
                />
              </div>
              {loadingFollowUps ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : upcomingFollowUps.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No upcoming follow-ups</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingFollowUps.map((task) => (
                    <FollowUpCard key={task.id} task={task} contacts={contacts} familyMembers={familyMembers} conditions={conditions} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">Referrals</h3>
                  <p className="text-sm text-muted-foreground">Track specialist referrals</p>
                </div>
                <ReferralForm 
                  familyMembers={familyMembers}
                  conditions={conditions}
                  contacts={contacts} 
                  onSuccess={() => {}} 
                />
              </div>
              {loadingReferrals ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : filteredReferrals.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No referrals tracked</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredReferrals.map((referral) => (
                    <ReferralCard key={referral.id} referral={referral} contacts={contacts} familyMembers={familyMembers} conditions={conditions} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Track current and past medications</p>
              <MedicationForm 
                familyMembers={familyMembers} 
                conditions={conditions}
                contacts={contacts}
                onSuccess={() => {}} 
              />
            </div>
            {loadingMedications ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : filteredMedications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No medications tracked yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredMedications.map((medication) => (
                  <MedicationCard key={medication.id} medication={medication} familyMembers={familyMembers} conditions={conditions} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Doctors, specialists, and healthcare providers</p>
              <ContactForm familyMembers={familyMembers} onSuccess={() => {}} />
            </div>
            {loadingContacts ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
            ) : filteredContacts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No contacts added yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredContacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} familyMembers={familyMembers} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="family" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Family members whose health you track</p>
              <FamilyMemberForm onSuccess={() => {}} />
            </div>
            {loadingFamily ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : familyMembers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No family members added yet</p>
                  <p className="text-sm text-muted-foreground">Add family members to organize health records</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {familyMembers.map((member) => (
                  <Card key={member.id} className="hover-elevate" data-testid={`card-family-${member.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <Badge variant="outline" className="text-xs capitalize mt-1">{member.relationship}</Badge>
                          {member.dateOfBirth && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Born: {format(new Date(member.dateOfBirth), "d MMM yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
