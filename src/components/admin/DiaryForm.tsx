"use client";

import { useState } from "react";
import { Field, Label, Select, Input, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";

const MEAL_TYPES = [
  { key: "BREAKFAST", label: "Breakfast" },
  { key: "SNACK_AM", label: "Morning snack" },
  { key: "LUNCH", label: "Lunch" },
  { key: "SNACK_PM", label: "Afternoon snack" },
  { key: "DINNER", label: "Dinner" },
] as const;

const AMOUNTS = ["", "NONE", "SOME", "MOST", "ALL"];

type ExistingMeal = { type: string; amountEaten: string; notes: string | null };
type ExistingNap = { startTime: string; endTime: string | null };
type ExistingNappy = { time: string; type: string; notes: string | null };

function toTimeInput(iso: string) {
  return iso.slice(11, 16);
}

export function DiaryForm({
  action,
  existingMeals,
  existingNaps,
  existingNappyChanges,
  existingMood,
  existingActivities,
  existingNotes,
}: {
  action: (formData: FormData) => void;
  existingMeals: ExistingMeal[];
  existingNaps: ExistingNap[];
  existingNappyChanges: ExistingNappy[];
  existingMood: string | null;
  existingActivities: string | null;
  existingNotes: string | null;
}) {
  const [naps, setNaps] = useState<{ start: string; end: string }[]>(
    existingNaps.length
      ? existingNaps.map((n) => ({ start: toTimeInput(n.startTime), end: n.endTime ? toTimeInput(n.endTime) : "" }))
      : [{ start: "", end: "" }]
  );
  const [nappies, setNappies] = useState<{ time: string; type: string; notes: string }[]>(
    existingNappyChanges.length
      ? existingNappyChanges.map((n) => ({ time: toTimeInput(n.time), type: n.type, notes: n.notes ?? "" }))
      : [{ time: "", type: "WET", notes: "" }]
  );

  function mealDefault(type: string, field: "amountEaten" | "notes") {
    return existingMeals.find((m) => m.type === type)?.[field] ?? "";
  }

  return (
    <form action={action} className="space-y-6">
      <Field>
        <Label htmlFor="mood">Mood today</Label>
        <Select id="mood" name="mood" defaultValue={existingMood ?? ""}>
          <option value="">Not recorded</option>
          <option value="HAPPY">😊 Happy</option>
          <option value="CONTENT">🙂 Content</option>
          <option value="UNSETTLED">😟 Unsettled</option>
          <option value="TIRED">😴 Tired</option>
          <option value="UNWELL">🤒 Unwell</option>
        </Select>
      </Field>

      <div>
        <Label>Meals</Label>
        <div className="mt-2 space-y-2">
          {MEAL_TYPES.map((meal) => (
            <div key={meal.key} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-2">
              <span className="w-32 text-sm text-gray-600">{meal.label}</span>
              <select
                name={`meal_${meal.key}_amount`}
                defaultValue={mealDefault(meal.key, "amountEaten")}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              >
                {AMOUNTS.map((a) => (
                  <option key={a} value={a}>
                    {a === "" ? "Not offered" : a}
                  </option>
                ))}
              </select>
              <input
                name={`meal_${meal.key}_notes`}
                defaultValue={mealDefault(meal.key, "notes") ?? ""}
                placeholder="Notes"
                className="min-w-[8rem] flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Naps</Label>
        <div className="mt-2 space-y-2">
          {naps.map((nap, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-2">
              <span className="text-xs text-gray-500">Start</span>
              <input
                type="time"
                name="nap_start"
                value={nap.start}
                onChange={(e) => setNaps((prev) => prev.map((n, idx) => (idx === i ? { ...n, start: e.target.value } : n)))}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <span className="text-xs text-gray-500">End</span>
              <input
                type="time"
                name="nap_end"
                value={nap.end}
                onChange={(e) => setNaps((prev) => prev.map((n, idx) => (idx === i ? { ...n, end: e.target.value } : n)))}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setNaps((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-sm text-red-500 hover:underline"
                disabled={naps.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setNaps((prev) => [...prev, { start: "", end: "" }])}
          className="mt-2 text-sm font-medium text-brand-600 hover:underline"
        >
          + Add nap
        </button>
      </div>

      <div>
        <Label>Nappy / toileting changes</Label>
        <div className="mt-2 space-y-2">
          {nappies.map((n, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-2">
              <input
                type="time"
                name="nappy_time"
                value={n.time}
                onChange={(e) => setNappies((prev) => prev.map((row, idx) => (idx === i ? { ...row, time: e.target.value } : row)))}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <select
                name="nappy_type"
                value={n.type}
                onChange={(e) => setNappies((prev) => prev.map((row, idx) => (idx === i ? { ...row, type: e.target.value } : row)))}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="WET">Wet</option>
                <option value="DIRTY">Dirty</option>
                <option value="BOTH">Wet &amp; dirty</option>
                <option value="DRY">Dry / checked</option>
              </select>
              <input
                name="nappy_notes"
                value={n.notes}
                onChange={(e) => setNappies((prev) => prev.map((row, idx) => (idx === i ? { ...row, notes: e.target.value } : row)))}
                placeholder="Notes"
                className="min-w-[8rem] flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setNappies((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-sm text-red-500 hover:underline"
                disabled={nappies.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setNappies((prev) => [...prev, { time: "", type: "WET", notes: "" }])}
          className="mt-2 text-sm font-medium text-brand-600 hover:underline"
        >
          + Add change
        </button>
      </div>

      <Field>
        <Label htmlFor="activities">Activities</Label>
        <Textarea id="activities" name="activities" rows={2} defaultValue={existingActivities ?? ""} />
      </Field>
      <Field>
        <Label htmlFor="notes">General notes for parents</Label>
        <Textarea id="notes" name="notes" rows={2} defaultValue={existingNotes ?? ""} />
      </Field>

      <Button type="submit">Save diary entry</Button>
    </form>
  );
}
