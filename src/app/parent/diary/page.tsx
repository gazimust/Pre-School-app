import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getParentChildren } from "@/lib/parent";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Select, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const MOOD_LABEL: Record<string, string> = {
  HAPPY: "😊 Happy",
  CONTENT: "🙂 Content",
  UNSETTLED: "😟 Unsettled",
  TIRED: "😴 Tired",
  UNWELL: "🤒 Unwell",
};

const AMOUNT_LABEL: Record<string, string> = { NONE: "None", SOME: "Some", MOST: "Most", ALL: "All" };
const MEAL_LABEL: Record<string, string> = {
  BREAKFAST: "Breakfast",
  SNACK_AM: "Morning snack",
  LUNCH: "Lunch",
  SNACK_PM: "Afternoon snack",
  DINNER: "Dinner",
};
const NAPPY_LABEL: Record<string, string> = { WET: "Wet", DIRTY: "Dirty", BOTH: "Wet & dirty", DRY: "Dry / checked" };

export default async function ParentDiaryPage({ searchParams }: { searchParams: { childId?: string; date?: string } }) {
  const session = await getSession();
  const children = await getParentChildren(session!.user.id);
  const childId = searchParams.childId || children[0]?.id;
  const date = searchParams.date || todayIso();

  const entry = childId
    ? await prisma.diaryEntry.findUnique({
        where: { childId_date: { childId, date: new Date(`${date}T00:00:00`) } },
        include: { meals: true, naps: true, nappyChanges: true, staff: true },
      })
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Daily Diary</h1>
        <p className="text-sm text-gray-500">See how your child&rsquo;s day is going</p>
      </div>

      {children.length === 0 ? (
        <EmptyState title="No children linked to your account yet" />
      ) : (
        <>
          <Card>
            <CardBody>
              <form method="get" className="flex flex-wrap items-end gap-3">
                <div className="min-w-[12rem] flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Child</label>
                  <Select name="childId" defaultValue={childId}>
                    {children.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                  <Input type="date" name="date" defaultValue={date} max={todayIso()} />
                </div>
                <Button type="submit" variant="secondary">
                  View
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={formatDate(date, "EEEE d MMMM yyyy")} />
            <CardBody>
              {!entry ? (
                <EmptyState title="No diary entry recorded for this day" />
              ) : (
                <div className="space-y-5">
                  {entry.mood && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Mood</p>
                      <p className="text-sm text-gray-800">{MOOD_LABEL[entry.mood]}</p>
                    </div>
                  )}

                  {entry.meals.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Meals</p>
                      <ul className="mt-1 space-y-1">
                        {entry.meals.map((m) => (
                          <li key={m.id} className="flex items-center gap-2 text-sm text-gray-800">
                            <Badge color="leaf">{MEAL_LABEL[m.type]}</Badge>
                            {AMOUNT_LABEL[m.amountEaten]}
                            {m.notes && <span className="text-gray-500">— {m.notes}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.naps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Naps</p>
                      <ul className="mt-1 space-y-1 text-sm text-gray-800">
                        {entry.naps.map((n) => (
                          <li key={n.id}>
                            {n.startTime.toISOString().slice(11, 16)} –{" "}
                            {n.endTime ? n.endTime.toISOString().slice(11, 16) : "ongoing"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.nappyChanges.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Nappy / toileting</p>
                      <ul className="mt-1 space-y-1 text-sm text-gray-800">
                        {entry.nappyChanges.map((n) => (
                          <li key={n.id}>
                            {n.time.toISOString().slice(11, 16)} — {NAPPY_LABEL[n.type]}
                            {n.notes && <span className="text-gray-500"> ({n.notes})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.activities && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Activities</p>
                      <p className="text-sm text-gray-800">{entry.activities}</p>
                    </div>
                  )}

                  {entry.notes && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Notes from the team</p>
                      <p className="text-sm text-gray-800">{entry.notes}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">Recorded by {entry.staff.name}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
