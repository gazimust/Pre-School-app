import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Select, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { DiaryForm } from "@/components/admin/DiaryForm";
import { saveDiaryEntry } from "@/lib/actions/diary";
import { formatDate } from "@/lib/utils";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminDiaryPage({
  searchParams,
}: {
  searchParams: { childId?: string; date?: string };
}) {
  const children = await prisma.child.findMany({ where: { active: true }, orderBy: { firstName: "asc" } });
  const childId = searchParams.childId || children[0]?.id;
  const date = searchParams.date || todayIso();

  const entry = childId
    ? await prisma.diaryEntry.findUnique({
        where: { childId_date: { childId, date: new Date(`${date}T00:00:00`) } },
        include: { meals: true, naps: true, nappyChanges: true },
      })
    : null;

  const action = childId ? saveDiaryEntry.bind(null, childId, date) : undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Daily Diary</h1>
        <p className="text-sm text-gray-500">Record meals, naps, nappy changes and activities</p>
      </div>

      <Card>
        <CardBody>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">Child</label>
              <Select name="childId" defaultValue={childId}>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} · {c.room}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
              <Input type="date" name="date" defaultValue={date} />
            </div>
            <Button type="submit" variant="secondary">
              View / edit
            </Button>
          </form>
        </CardBody>
      </Card>

      {children.length === 0 ? (
        <Card>
          <CardBody>Add a child first before recording a diary entry.</CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Diary for ${formatDate(date)}`} description={entry ? "Editing existing entry" : "No entry yet — create one below"} />
          <CardBody>
            {action && (
              <DiaryForm
                action={action}
                existingMeals={entry?.meals.map((m) => ({ type: m.type, amountEaten: m.amountEaten, notes: m.notes })) ?? []}
                existingNaps={entry?.naps.map((n) => ({ startTime: n.startTime.toISOString(), endTime: n.endTime?.toISOString() ?? null })) ?? []}
                existingNappyChanges={entry?.nappyChanges.map((n) => ({ time: n.time.toISOString(), type: n.type, notes: n.notes })) ?? []}
                existingMood={entry?.mood ?? null}
                existingActivities={entry?.activities ?? null}
                existingNotes={entry?.notes ?? null}
              />
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
