"use client";

import { useState } from "react";
import { Field, Label, Input, Select, Textarea } from "@/components/ui/Form";
import { Button, LinkButton } from "@/components/ui/Button";
import { REPORT_TYPE_LABEL, REPORT_TYPE_DESCRIPTION } from "@/lib/eyfs";

type ChildOption = { id: string; firstName: string; lastName: string };
type AreaOption = { id: string; name: string; type: "PRIME" | "SPECIFIC" };

const REPORT_TYPES = ["TERMLY_SUMMARY", "TWO_YEAR_CHECK", "TRANSITION", "SCHOOL_READINESS"] as const;

export function ReportForm({
  action,
  childOptions,
  areas,
  defaultChildId,
}: {
  action: (formData: FormData) => void;
  childOptions: ChildOption[];
  areas: AreaOption[];
  defaultChildId?: string;
}) {
  const [type, setType] = useState<(typeof REPORT_TYPES)[number]>("TERMLY_SUMMARY");

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="childId">Child</Label>
          <Select id="childId" name="childId" required defaultValue={defaultChildId ?? childOptions[0]?.id}>
            {childOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor="type">Report type</Label>
          <Select id="type" name="type" required value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>
                {REPORT_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor="periodLabel">Period label</Label>
          <Input id="periodLabel" name="periodLabel" required placeholder="e.g. Summer Term 2026" />
        </Field>
        <Field>
          <Label htmlFor="ageBand">EYFS age band</Label>
          <Select id="ageBand" name="ageBand" required defaultValue="BIRTH_TO_THREE">
            <option value="BIRTH_TO_THREE">Birth to Three</option>
            <option value="THREE_TO_FOUR">Three and Four-Year-Olds</option>
          </Select>
        </Field>
      </div>

      <p className="rounded-lg bg-brand-50 p-3 text-xs text-brand-800">{REPORT_TYPE_DESCRIPTION[type]}</p>

      <Field>
        <Label htmlFor="summary">Overall summary</Label>
        <Textarea id="summary" name="summary" rows={4} required />
      </Field>

      <div>
        <Label>Progress by EYFS area</Label>
        <div className="mt-2 space-y-3">
          {areas.map((area) => (
            <div key={area.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-800">{area.name}</p>
                <select name={`level_${area.id}`} defaultValue="" className="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
                  <option value="">Not assessed</option>
                  <option value="EMERGING">Emerging</option>
                  <option value="EXPECTED">Expected</option>
                  <option value="EXCEEDING">Exceeding</option>
                </select>
              </div>
              <input
                name={`comment_${area.id}`}
                placeholder="Comment (optional)"
                className="mt-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <Field>
        <Label htmlFor="nextSteps">Next steps</Label>
        <Textarea id="nextSteps" name="nextSteps" rows={3} />
      </Field>

      <div className="flex gap-3">
        <Button type="submit">Generate report</Button>
        <LinkButton href="/admin/reports" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
