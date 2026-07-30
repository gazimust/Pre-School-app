import { PrismaClient, Role, InvoiceStatus, AnnouncementPriority, Mood, MealType, MealAmount, NappyType, EYFSAgeBand, DevelopmentLevel, ReportType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { EYFS_AREA_SEED } from "../src/lib/eyfs";

const prisma = new PrismaClient();

const PASSWORD = "password123";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

async function main() {
  console.log("Seeding database…");

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // --- Setting -------------------------------------------------------------
  await prisma.setting.deleteMany();
  await prisma.setting.create({
    data: {
      nurseryName: "Little Sprouts Nursery",
      address: "12 Meadow Lane, Bristol, BS1 4AA",
      phone: "0117 555 0192",
      email: "office@littlesprouts.test",
      invoicePrefix: "LSN",
    },
  });

  // --- Clean slate -----------------------------------------------------------
  await prisma.reportEntry.deleteMany();
  await prisma.report.deleteMany();
  await prisma.observationArea.deleteMany();
  await prisma.observation.deleteMany();
  await prisma.nappyChange.deleteMany();
  await prisma.nap.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.diaryEntry.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.parentChild.deleteMany();
  await prisma.child.deleteMany();
  await prisma.eYFSArea.deleteMany();
  await prisma.user.deleteMany();

  // --- EYFS areas ------------------------------------------------------------
  const areas = await Promise.all(
    EYFS_AREA_SEED.map((a) =>
      prisma.eYFSArea.create({
        data: { name: a.name, type: a.type, sortOrder: a.sortOrder, description: a.description },
      })
    )
  );
  const areaByName = Object.fromEntries(areas.map((a) => [a.name, a]));

  // --- Users -------------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      email: "admin@littlesprouts.test",
      name: "Amara Osei",
      role: Role.ADMIN,
      passwordHash,
      phone: "07700 900001",
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: "staff@littlesprouts.test",
      name: "Priya Kaur",
      role: Role.STAFF,
      passwordHash,
      phone: "07700 900002",
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: "james@littlesprouts.test",
      name: "James Whitfield",
      role: Role.STAFF,
      passwordHash,
      phone: "07700 900003",
    },
  });

  const parent1 = await prisma.user.create({
    data: {
      email: "parent@littlesprouts.test",
      name: "Sarah Chen",
      role: Role.PARENT,
      passwordHash,
      phone: "07700 900010",
    },
  });

  const parent2 = await prisma.user.create({
    data: {
      email: "david.okafor@example.test",
      name: "David Okafor",
      role: Role.PARENT,
      passwordHash,
      phone: "07700 900011",
    },
  });

  const parent3 = await prisma.user.create({
    data: {
      email: "maria.garcia@example.test",
      name: "Maria Garcia",
      role: Role.PARENT,
      passwordHash,
      phone: "07700 900012",
    },
  });

  // --- Children ------------------------------------------------------------
  const child1 = await prisma.child.create({
    data: {
      firstName: "Oliver",
      lastName: "Chen",
      dateOfBirth: monthsAgo(8),
      gender: "Male",
      room: "Baby Room",
      startDate: monthsAgo(3),
      allergies: "None known",
      medicalNotes: "None",
      active: true,
    },
  });

  const child2 = await prisma.child.create({
    data: {
      firstName: "Ava",
      lastName: "Chen",
      dateOfBirth: monthsAgo(30),
      gender: "Female",
      room: "Toddler Room",
      startDate: monthsAgo(14),
      allergies: "Peanuts (EpiPen held on site)",
      active: true,
    },
  });

  const child3 = await prisma.child.create({
    data: {
      firstName: "Ethan",
      lastName: "Okafor",
      dateOfBirth: monthsAgo(44),
      gender: "Male",
      room: "Preschool Room",
      startDate: monthsAgo(20),
      allergies: "None known",
      active: true,
    },
  });

  const child4 = await prisma.child.create({
    data: {
      firstName: "Sofia",
      lastName: "Garcia",
      dateOfBirth: monthsAgo(20),
      gender: "Female",
      room: "Toddler Room",
      startDate: monthsAgo(6),
      allergies: "Dairy intolerance",
      active: true,
    },
  });

  // --- Parent <-> Child links --------------------------------------------
  await prisma.parentChild.createMany({
    data: [
      { parentId: parent1.id, childId: child1.id, relationship: "Mother", isPrimaryContact: true },
      { parentId: parent1.id, childId: child2.id, relationship: "Mother", isPrimaryContact: true },
      { parentId: parent2.id, childId: child3.id, relationship: "Father", isPrimaryContact: true },
      { parentId: parent3.id, childId: child4.id, relationship: "Mother", isPrimaryContact: true },
    ],
  });

  // --- Invoices ------------------------------------------------------------
  async function makeInvoice(
    num: string,
    childId: string,
    parentId: string,
    status: InvoiceStatus,
    issue: Date,
    due: Date,
    items: { description: string; quantity: number; unitPrice: number }[],
    paidAt?: Date
  ) {
    return prisma.invoice.create({
      data: {
        invoiceNumber: num,
        childId,
        parentId,
        status,
        issueDate: issue,
        dueDate: due,
        paidAt,
        lineItems: { create: items },
      },
    });
  }

  await makeInvoice(
    "LSN-1001",
    child1.id,
    parent1.id,
    InvoiceStatus.PAID,
    daysAgo(35),
    daysAgo(21),
    [{ description: "Baby Room fees — full time (4 weeks)", quantity: 1, unitPrice: 920 }],
    daysAgo(25)
  );
  await makeInvoice(
    "LSN-1002",
    child2.id,
    parent1.id,
    InvoiceStatus.SENT,
    daysAgo(5),
    daysFromNow(9),
    [
      { description: "Toddler Room fees — 3 days/week (4 weeks)", quantity: 1, unitPrice: 640 },
      { description: "Nappies & wipes supply", quantity: 1, unitPrice: 15 },
    ]
  );
  await makeInvoice(
    "LSN-1003",
    child3.id,
    parent2.id,
    InvoiceStatus.OVERDUE,
    daysAgo(20),
    daysAgo(6),
    [{ description: "Preschool Room fees — 5 days/week (4 weeks)", quantity: 1, unitPrice: 780 }]
  );
  await makeInvoice(
    "LSN-1004",
    child4.id,
    parent3.id,
    InvoiceStatus.DRAFT,
    daysAgo(1),
    daysFromNow(13),
    [{ description: "Toddler Room fees — 5 days/week (4 weeks)", quantity: 1, unitPrice: 980 }]
  );

  // --- Newsletters -----------------------------------------------------------
  await prisma.newsletter.create({
    data: {
      title: "Summer Term Newsletter",
      body:
        "Welcome back to a new term! This term our topic across all rooms is 'Growing and Changing'. " +
        "We'll be planting sunflowers in the garden, exploring minibeasts, and celebrating Father's Day " +
        "with a special craft session on Friday. Please remember sun hats and named water bottles from Monday.",
      authorId: admin.id,
      publishedAt: daysAgo(4),
    },
  });
  await prisma.newsletter.create({
    data: {
      title: "Preschool Room — School Readiness Update",
      body:
        "As our older preschoolers prepare for their move to school in September, we're focusing on " +
        "independence: putting on coats, using cutlery, and recognising their own name. Look out for your " +
        "child's individual transition report coming home this term.",
      authorId: staff2.id,
      publishedAt: daysAgo(10),
    },
  });
  await prisma.newsletter.create({
    data: {
      title: "Draft: Autumn Open Day",
      body: "Planning notes for the autumn open day — not yet ready to publish.",
      authorId: admin.id,
      publishedAt: null,
    },
  });

  // --- Announcements -----------------------------------------------------------
  await prisma.announcement.create({
    data: {
      title: "Nursery closed — Bank Holiday Monday",
      body: "A reminder that the nursery will be closed on Monday for the bank holiday. We reopen as normal on Tuesday at 7:30am.",
      priority: AnnouncementPriority.HIGH,
      authorId: admin.id,
      publishedAt: daysAgo(2),
      expiresAt: daysFromNow(5),
    },
  });
  await prisma.announcement.create({
    data: {
      title: "Head lice reported in Toddler Room",
      body: "We've had a reported case of head lice in the Toddler Room. Please check your child's hair this evening and treat if necessary.",
      priority: AnnouncementPriority.URGENT,
      authorId: staff1.id,
      publishedAt: daysAgo(1),
      expiresAt: daysFromNow(6),
    },
  });
  await prisma.announcement.create({
    data: {
      title: "New menu starting next week",
      body: "Our kitchen is introducing a refreshed seasonal menu from Monday. Copies are available at the front desk.",
      priority: AnnouncementPriority.NORMAL,
      authorId: admin.id,
      publishedAt: daysAgo(6),
    },
  });

  // --- Daily diary -----------------------------------------------------------
  async function makeDiary(childId: string, date: Date, staffId: string) {
    return prisma.diaryEntry.create({
      data: {
        childId,
        staffId,
        date,
        mood: Mood.HAPPY,
        activities: "Sensory play with water beads, story time, outdoor garden exploration.",
        notes: "Settled well after drop-off, played nicely with friends.",
        meals: {
          create: [
            { type: MealType.BREAKFAST, amountEaten: MealAmount.MOST, notes: "Porridge and banana" },
            { type: MealType.LUNCH, amountEaten: MealAmount.ALL, notes: "Pasta bolognese" },
            { type: MealType.SNACK_PM, amountEaten: MealAmount.SOME, notes: "Breadsticks and hummus" },
          ],
        },
        naps: {
          create: [{ startTime: new Date(date.setHours(12, 30)), endTime: new Date(new Date(date).setHours(13, 45)) }],
        },
        nappyChanges: {
          create: [
            { time: new Date(new Date(date).setHours(10, 0)), type: NappyType.WET },
            { time: new Date(new Date(date).setHours(14, 30)), type: NappyType.BOTH, notes: "Cream applied" },
          ],
        },
      },
    });
  }

  await makeDiary(child1.id, daysAgo(0), staff1.id);
  await makeDiary(child1.id, daysAgo(1), staff1.id);
  await makeDiary(child2.id, daysAgo(0), staff1.id);
  await makeDiary(child3.id, daysAgo(0), staff2.id);
  await makeDiary(child4.id, daysAgo(0), staff1.id);

  // --- Observations (EYFS) -----------------------------------------------------------
  async function makeObservation(
    childId: string,
    staffId: string,
    date: Date,
    title: string,
    narrative: string,
    ageBand: EYFSAgeBand,
    areaNames: string[],
    nextSteps: string
  ) {
    return prisma.observation.create({
      data: {
        childId,
        staffId,
        date,
        title,
        narrative,
        ageBand,
        nextSteps,
        areas: { create: areaNames.map((n) => ({ eyfsAreaId: areaByName[n].id })) },
      },
    });
  }

  await makeObservation(
    child1.id,
    staff1.id,
    daysAgo(3),
    "Reaching for the treasure basket",
    "Oliver pulled himself up to sitting and reached confidently for objects in the treasure basket, exploring textures with both hands and bringing a wooden ring to his mouth to explore.",
    "BIRTH_TO_THREE",
    ["Physical Development", "Understanding the World"],
    "Continue to offer a range of textured objects; introduce simple cause-and-effect toys."
  );

  await makeObservation(
    child2.id,
    staff1.id,
    daysAgo(2),
    "Two-word phrases at snack time",
    "Ava used two-word phrases ('more milk', 'all done') independently during snack time and pointed to the correct cup when asked 'where is your cup?'.",
    "BIRTH_TO_THREE",
    ["Communication and Language", "Personal, Social and Emotional Development"],
    "Model simple sentences during play; introduce picture books with repetitive phrases."
  );

  await makeObservation(
    child3.id,
    staff2.id,
    daysAgo(1),
    "Counting acorns in the garden",
    "Ethan counted a group of six acorns accurately, touching each one as he counted, and confidently recognised the numeral 6 on a nearby number line.",
    "THREE_TO_FOUR",
    ["Mathematics", "Understanding the World"],
    "Introduce simple addition through practical counting games; extend to counting beyond 10."
  );

  await makeObservation(
    child4.id,
    staff1.id,
    daysAgo(4),
    "Building a tower with friends",
    "Sofia worked alongside two peers to build a tower of blocks, taking turns and using words like 'my turn' and 'your turn' appropriately.",
    "BIRTH_TO_THREE",
    ["Personal, Social and Emotional Development", "Expressive Arts and Design"],
    "Encourage turn-taking games in small groups; introduce simple building challenges."
  );

  // --- Reports -----------------------------------------------------------
  async function makeReport(
    childId: string,
    staffId: string,
    type: ReportType,
    periodLabel: string,
    ageBand: EYFSAgeBand,
    summary: string,
    nextSteps: string,
    entries: { area: string; level: DevelopmentLevel; comment: string }[],
    shared = true
  ) {
    return prisma.report.create({
      data: {
        childId,
        staffId,
        type,
        periodLabel,
        ageBand,
        summary,
        nextSteps,
        sharedWithParentAt: shared ? daysAgo(2) : null,
        entries: {
          create: entries.map((e) => ({ eyfsAreaId: areaByName[e.area].id, level: e.level, comment: e.comment })),
        },
      },
    });
  }

  await makeReport(
    child2.id,
    staff1.id,
    ReportType.TWO_YEAR_CHECK,
    "2-Year-Old Progress Check",
    "BIRTH_TO_THREE",
    "Ava is a sociable, curious toddler who is making good progress across the prime areas of learning. She communicates confidently with familiar adults and is beginning to form friendships with her peers.",
    "Continue to extend vocabulary through shared reading; encourage independent dressing skills.",
    [
      { area: "Communication and Language", level: DevelopmentLevel.EXPECTED, comment: "Uses short phrases confidently; understands simple instructions." },
      { area: "Physical Development", level: DevelopmentLevel.EXPECTED, comment: "Walks, runs and climbs confidently; developing pincer grip." },
      { area: "Personal, Social and Emotional Development", level: DevelopmentLevel.EMERGING, comment: "Beginning to share and take turns with support." },
    ]
  );

  await makeReport(
    child3.id,
    staff2.id,
    ReportType.TERMLY_SUMMARY,
    "Summer Term 2026",
    "THREE_TO_FOUR",
    "Ethan has had a wonderful term. He is a confident communicator, enjoys mathematical challenges, and has shown real enthusiasm for outdoor learning and understanding the natural world.",
    "Continue to build on early writing skills ahead of the transition to school in September.",
    [
      { area: "Communication and Language", level: DevelopmentLevel.EXCEEDING, comment: "Speaks in full, well-structured sentences and asks thoughtful questions." },
      { area: "Physical Development", level: DevelopmentLevel.EXPECTED, comment: "Good pencil grip; confident on climbing equipment." },
      { area: "Personal, Social and Emotional Development", level: DevelopmentLevel.EXPECTED, comment: "Plays cooperatively and manages his feelings well." },
      { area: "Literacy", level: DevelopmentLevel.EXPECTED, comment: "Recognises his name and several familiar words." },
      { area: "Mathematics", level: DevelopmentLevel.EXCEEDING, comment: "Counts confidently to 20 and beyond; compares quantities." },
      { area: "Understanding the World", level: DevelopmentLevel.EXCEEDING, comment: "Shows great curiosity about the natural world and asks how things work." },
      { area: "Expressive Arts and Design", level: DevelopmentLevel.EXPECTED, comment: "Enjoys imaginative role play and mark-making." },
    ]
  );

  await makeReport(
    child4.id,
    staff1.id,
    ReportType.TERMLY_SUMMARY,
    "Summer Term 2026",
    "BIRTH_TO_THREE",
    "Sofia has settled in beautifully this term. She is developing strong friendships and is becoming more independent at mealtimes and during self-care routines.",
    "Support further language development through songs and rhymes; encourage independent toileting.",
    [
      { area: "Communication and Language", level: DevelopmentLevel.EMERGING, comment: "Understands simple instructions; vocabulary is growing steadily." },
      { area: "Physical Development", level: DevelopmentLevel.EXPECTED, comment: "Confident walker and climber; enjoys mark-making with chunky crayons." },
      { area: "Personal, Social and Emotional Development", level: DevelopmentLevel.EXPECTED, comment: "Forming close bonds with key person and peers." },
    ]
  );

  console.log("Seed complete.");
  console.log("Demo accounts (password: password123):");
  console.log("  admin@littlesprouts.test (ADMIN)");
  console.log("  staff@littlesprouts.test (STAFF)");
  console.log("  parent@littlesprouts.test (PARENT — Sarah Chen, parent of Oliver & Ava)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
