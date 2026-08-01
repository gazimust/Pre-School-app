"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Mood, MealType, MealAmount, NappyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff, nurseryIdOrThrow } from "@/lib/session";

const MEAL_TYPES: MealType[] = [MealType.BREAKFAST, MealType.SNACK_AM, MealType.LUNCH, MealType.SNACK_PM, MealType.DINNER];

export async function saveDiaryEntry(childId: string, date: string, formData: FormData) {
  const session = await requireStaff();
  const nurseryId = nurseryIdOrThrow(session);

  const child = await prisma.child.findFirst({ where: { id: childId, nurseryId } });
  if (!child) throw new Error("Child not found.");

  const mood = (formData.get("mood") as Mood) || null;
  const activities = String(formData.get("activities") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  const meals = MEAL_TYPES.filter((type) => {
    const amount = formData.get(`meal_${type}_amount`);
    return amount && amount !== "";
  }).map((type) => ({
    type,
    amountEaten: formData.get(`meal_${type}_amount`) as MealAmount,
    notes: String(formData.get(`meal_${type}_notes`) || "") || null,
  }));

  const napStarts = formData.getAll("nap_start");
  const napEnds = formData.getAll("nap_end");
  const naps = napStarts
    .map((start, i) => ({ start: String(start), end: String(napEnds[i] || "") }))
    .filter((n) => n.start)
    .map((n) => ({
      startTime: new Date(`${date}T${n.start}:00`),
      endTime: n.end ? new Date(`${date}T${n.end}:00`) : null,
    }));

  const nappyTimes = formData.getAll("nappy_time");
  const nappyTypes = formData.getAll("nappy_type");
  const nappyNotes = formData.getAll("nappy_notes");
  const nappyChanges = nappyTimes
    .map((t, i) => ({ time: String(t), type: nappyTypes[i] as NappyType, notes: String(nappyNotes[i] || "") }))
    .filter((n) => n.time)
    .map((n) => ({
      time: new Date(`${date}T${n.time}:00`),
      type: n.type,
      notes: n.notes || null,
    }));

  const dateObj = new Date(`${date}T00:00:00`);

  const existing = await prisma.diaryEntry.findUnique({ where: { childId_date: { childId, date: dateObj } } });

  if (existing) {
    await prisma.$transaction([
      prisma.meal.deleteMany({ where: { diaryEntryId: existing.id } }),
      prisma.nap.deleteMany({ where: { diaryEntryId: existing.id } }),
      prisma.nappyChange.deleteMany({ where: { diaryEntryId: existing.id } }),
      prisma.diaryEntry.update({
        where: { id: existing.id },
        data: {
          mood: mood || null,
          activities,
          notes,
          staffId: session.user.id,
          meals: { create: meals },
          naps: { create: naps },
          nappyChanges: { create: nappyChanges },
        },
      }),
    ]);
  } else {
    await prisma.diaryEntry.create({
      data: {
        nurseryId,
        childId,
        date: dateObj,
        staffId: session.user.id,
        mood: mood || null,
        activities,
        notes,
        meals: { create: meals },
        naps: { create: naps },
        nappyChanges: { create: nappyChanges },
      },
    });
  }

  revalidatePath("/admin/diary");
  revalidatePath("/parent/diary");
  redirect(`/admin/diary?childId=${childId}&date=${date}`);
}
