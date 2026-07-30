import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Field, Label, Input, Textarea, Select } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";
import { createAnnouncement } from "@/lib/actions/announcements";

export default function NewAnnouncementPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">New announcement</h1>
      <Card>
        <CardHeader title="Announcement" description="Published immediately to all parents." />
        <CardBody>
          <form action={createAnnouncement} className="space-y-4">
            <Field>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </Field>
            <Field>
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" name="body" rows={5} required />
            </Field>
            <Field>
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" name="priority" defaultValue="NORMAL">
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="expiresAt">Expires on (optional)</Label>
              <Input id="expiresAt" name="expiresAt" type="date" />
            </Field>
            <div className="flex gap-3">
              <Button type="submit">Publish</Button>
              <LinkButton href="/admin/announcements" variant="secondary">
                Cancel
              </LinkButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
