import { Field, Label, Input, Select, Textarea } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";

const ROOMS = ["Baby Room", "Toddler Room", "Preschool Room"];

export function ChildForm({
  action,
  defaults,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  defaults?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string | null;
    room?: string;
    startDate?: string;
    allergies?: string | null;
    medicalNotes?: string | null;
  };
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required defaultValue={defaults?.firstName} />
        </Field>
        <Field>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" required defaultValue={defaults?.lastName} />
        </Field>
        <Field>
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            defaultValue={defaults?.dateOfBirth}
          />
        </Field>
        <Field>
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" name="gender" defaultValue={defaults?.gender ?? ""}>
            <option value="">Prefer not to say</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </Select>
        </Field>
        <Field>
          <Label htmlFor="room">Room</Label>
          <Select id="room" name="room" required defaultValue={defaults?.room ?? ROOMS[0]}>
            {ROOMS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" name="startDate" type="date" required defaultValue={defaults?.startDate} />
        </Field>
      </div>
      <Field>
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea id="allergies" name="allergies" rows={2} defaultValue={defaults?.allergies ?? ""} placeholder="e.g. None known" />
      </Field>
      <Field>
        <Label htmlFor="medicalNotes">Medical notes</Label>
        <Textarea id="medicalNotes" name="medicalNotes" rows={2} defaultValue={defaults?.medicalNotes ?? ""} />
      </Field>
      <div className="flex gap-3">
        <Button type="submit">Save</Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
