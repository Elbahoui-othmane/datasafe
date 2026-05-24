import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/averonix/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAssessmentMode } from "@/config/dataSource";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vendors/all")({
  head: () => ({ meta: [{ title: "All Vendors · Averonix" }] }),
  component: AllVendorsPage,
});

function AddVendorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [owner, setOwner] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add vendor</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-xs font-medium">Vendor name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" /></div>
          <div><label className="text-xs font-medium">Category</label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Cloud, SaaS, Infrastructure" /></div>
          <div><label className="text-xs font-medium">Owner</label><Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. jane@example.com" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => { onOpenChange(false); toast.success("Vendor added"); }}>Add vendor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] mb-4">
          <Building2 className="h-8 w-8 text-[var(--primary-dark)]" />
        </div>
        <h2 className="text-xl font-semibold">No vendors added yet</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Vendor inventory is not available yet. Add vendors manually or connect integrations later.
        </p>
        <Button className="mt-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={onOpen}>
          <Plus className="h-4 w-4 mr-1" />Add vendor
        </Button>
      </CardContent>
    </Card>
  );
}

function AllVendorsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <PageHeader title="All vendors" subtitle="Complete vendor inventory"
        breadcrumbs={[{ label: "Vendors", to: "/vendors" }, { label: "All vendors" }]}
        actions={<Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Add vendor</Button>}
      />
      <div className="p-8">
        {isAssessmentMode() ? <EmptyState onOpen={() => setDialogOpen(true)} /> : null}
      </div>
      <AddVendorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
