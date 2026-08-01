import {
  PrismaClient,
  Role,
  InvoiceStatus,
  AnnouncementPriority,
  Mood,
  MealType,
  MealAmount,
  NappyType,
  EYFSAgeBand,
  DevelopmentLevel,
  ReportType,
} from "@prisma/client";
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
  await prisma.nursery.deleteMany();

  // --- EYFS areas (shared reference data, not nursery-scoped) -----------------
  const areas = await Promise.all(
    EYFS_AREA_SEED.map((a) =>
      prisma.eYFSArea.create({
        data: { name: a.name, type: a.type, sortOrder: a.sortOrder, description: a.description },
      })
    )
  );
  const areaByName = Object.fromEntries(areas.map((a) => [a.name, a]));

  // --- Platform admin (the website owner, not scoped to any nursery) ---------
  await prisma.user.create({
    data: {
      email: "owner@platform.test",
      name: "Platform Owner",
      role: Role.PLATFORM_ADMIN,
      passwordHash,
    },
  });

  // ---------------------------------------------------------------------------
  // Helpers to seed one nursery's worth of demo data
  // ---------------------------------------------------------------------------

  async function makeInvoice(
    nurseryId: string,
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
        nurseryId,
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

  async function makeDiary(nurseryId: string, childId: string, date: Date, staffId: string) {
    return prisma.diaryEntry.create({
      data: {
        nurseryId,
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

  async function makeObservation(
    nurseryId: string,
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
        nurseryId,
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

  async function makeReport(
    nurseryId: string,
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
        nurseryId,
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

  // ---------------------------------------------------------------------------
  // Nursery 1: Little Sprouts Nursery
  // ---------------------------------------------------------------------------

  const littleSprouts = await prisma.nursery.create({
    data: {
      name: "Little Sprouts Nursery",
      slug: "little-sprouts",
      address: "12 Meadow Lane, Bristol, BS1 4AA",
      phone: "0117 555 0192",
      email: "office@littlesprouts.test",
      invoicePrefix: "LSN",
    },
  });

  const lsAdmin = await prisma.user.create({
    data: { email: "admin@littlesprouts.test", name: "Amara Osei", role: Role.ADMIN, passwordHash, phone: "07700 900001", nurseryId: littleSprouts.id },
  });
  const lsStaff1 = await prisma.user.create({
    data: { email: "staff@littlesprouts.test", name: "Priya Kaur", role: Role.STAFF, passwordHash, phone: "07700 900002", nurseryId: littleSprouts.id },
  });
  const lsStaff2 = await prisma.user.create({
    data: { email: "james@littlesprouts.test", name: "James Whitfield", role: Role.STAFF, passwordHash, phone: "07700 900003", nurseryId: littleSprouts.id },
  });
  const lsParent1 = await prisma.user.create({
    data: { email: "parent@littlesprouts.test", name: "Sarah Chen", role: Role.PARENT, passwordHash, phone: "07700 900010", nurseryId: littleSprouts.id },
  });
  const lsParent2 = await prisma.user.create({
    data: { email: "david.okafor@example.test", name: "David Okafor", role: Role.PARENT, passwordHash, phone: "07700 900011", nurseryId: littleSprouts.id },
  });
  const lsParent3 = await prisma.user.create({
    data: { email: "maria.garcia@example.test", name: "Maria Garcia", role: Role.PARENT, passwordHash, phone: "07700 900012", nurseryId: littleSprouts.id },
  });

  const lsChild1 = await prisma.child.create({
    data: { nurseryId: littleSprouts.id, firstName: "Oliver", lastName: "Chen", dateOfBirth: monthsAgo(8), gender: "Male", room: "Baby Room", startDate: monthsAgo(3), allergies: "None known", medicalNotes: "None", active: true },
  });
  const lsChild2 = await prisma.child.create({
    data: { nurseryId: littleSprouts.id, firstName: "Ava", lastName: "Chen", dateOfBirth: monthsAgo(30), gender: "Female", room: "Toddler Room", startDate: monthsAgo(14), allergies: "Peanuts (EpiPen held on site)", active: true },
  });
  const lsChild3 = await prisma.child.create({
    data: { nurseryId: littleSprouts.id, firstName: "Ethan", lastName: "Okafor", dateOfBirth: monthsAgo(44), gender: "Male", room: "Preschool Room", startDate: monthsAgo(20), allergies: "None known", active: true },
  });
  const lsChild4 = await prisma.child.create({
    data: { nurseryId: littleSprouts.id, firstName: "Sofia", lastName: "Garcia", dateOfBirth: monthsAgo(20), gender: "Female", room: "Toddler Room", startDate: monthsAgo(6), allergies: "Dairy intolerance", active: true },
  });

  await prisma.parentChild.createMany({
    data: [
      { parentId: lsParent1.id, childId: lsChild1.id, relationship: "Mother", isPrimaryContact: true },
      { parentId: lsParent1.id, childId: lsChild2.id, relationship: "Mother", isPrimaryContact: true },
      { parentId: lsParent2.id, childId: lsChild3.id, relationship: "Father", isPrimaryContact: true },
      { parentId: lsParent3.id, childId: lsChild4.id, relationship: "Mother", isPrimaryContact: true },
    ],
  });

  await makeInvoice(littleSprouts.id, "LSN-1001", lsChild1.id, lsParent1.id, InvoiceStatus.PAID, daysAgo(35), daysAgo(21), [{ description: "Baby Room fees — full time (4 weeks)", quantity: 1, unitPrice: 920 }], daysAgo(25));
  await makeInvoice(littleSprouts.id, "LSN-1002", lsChild2.id, lsParent1.id, InvoiceStatus.SENT, daysAgo(5), daysFromNow(9), [{ description: "Toddler Room fees — 3 days/week (4 weeks)", quantity: 1, unitPrice: 640 }, { description: "Nappies & wipes supply", quantity: 1, unitPrice: 15 }]);
  await makeInvoice(littleSprouts.id, "LSN-1003", lsChild3.id, lsParent2.id, InvoiceStatus.OVERDUE, daysAgo(20), daysAgo(6), [{ description: "Preschool Room fees — 5 days/week (4 weeks)", quantity: 1, unitPrice: 780 }]);
  await makeInvoice(littleSprouts.id, "LSN-1004", lsChild4.id, lsParent3.id, InvoiceStatus.DRAFT, daysAgo(1), daysFromNow(13), [{ description: "Toddler Room fees — 5 days/week (4 weeks)", quantity: 1, unitPrice: 980 }]);

  await prisma.newsletter.create({ data: { nurseryId: littleSprouts.id, title: "Summer Term Newsletter", body: "Welcome back to a new term! This term our topic across all rooms is 'Growing and Changing'. We'll be planting sunflowers in the garden, exploring minibeasts, and celebrating Father's Day with a special craft session on Friday. Please remember sun hats and named water bottles from Monday.", authorId: lsAdmin.id, publishedAt: daysAgo(4) } });
  await prisma.newsletter.create({ data: { nurseryId: littleSprouts.id, title: "Preschool Room — School Readiness Update", body: "As our older preschoolers prepare for their move to school in September, we're focusing on independence: putting on coats, using cutlery, and recognising their own name. Look out for your child's individual transition report coming home this term.", authorId: lsStaff2.id, publishedAt: daysAgo(10) } });
  await prisma.newsletter.create({ data: { nurseryId: littleSprouts.id, title: "Draft: Autumn Open Day", body: "Planning notes for the autumn open day — not yet ready to publish.", authorId: lsAdmin.id, publishedAt: null } });

  await prisma.announcement.create({ data: { nurseryId: littleSprouts.id, title: "Nursery closed — Bank Holiday Monday", body: "A reminder that the nursery will be closed on Monday for the bank holiday. We reopen as normal on Tuesday at 7:30am.", priority: AnnouncementPriority.HIGH, authorId: lsAdmin.id, publishedAt: daysAgo(2), expiresAt: daysFromNow(5) } });
  await prisma.announcement.create({ data: { nurseryId: littleSprouts.id, title: "Head lice reported in Toddler Room", body: "We've had a reported case of head lice in the Toddler Room. Please check your child's hair this evening and treat if necessary.", priority: AnnouncementPriority.URGENT, authorId: lsStaff1.id, publishedAt: daysAgo(1), expiresAt: daysFromNow(6) } });
  await prisma.announcement.create({ data: { nurseryId: littleSprouts.id, title: "New menu starting next week", body: "Our kitchen is introducing a refreshed seasonal menu from Monday. Copies are available at the front desk.", priority: AnnouncementPriority.NORMAL, authorId: lsAdmin.id, publishedAt: daysAgo(6) } });

  await makeDiary(littleSprouts.id, lsChild1.id, daysAgo(0), lsStaff1.id);
  await makeDiary(littleSprouts.id, lsChild1.id, daysAgo(1), lsStaff1.id);
  await makeDiary(littleSprouts.id, lsChild2.id, daysAgo(0), lsStaff1.id);
  await makeDiary(littleSprouts.id, lsChild3.id, daysAgo(0), lsStaff2.id);
  await makeDiary(littleSprouts.id, lsChild4.id, daysAgo(0), lsStaff1.id);

  await makeObservation(littleSprouts.id, lsChild1.id, lsStaff1.id, daysAgo(3), "Reaching for the treasure basket", "Oliver pulled himself up to sitting and reached confidently for objects in the treasure basket, exploring textures with both hands and bringing a wooden ring to his mouth to explore.", "BIRTH_TO_THREE", ["Physical Development", "Understanding the World"], "Continue to offer a range of textured objects; introduce simple cause-and-effect toys.");
  await makeObservation(littleSprouts.id, lsChild2.id, lsStaff1.id, daysAgo(2), "Two-word phrases at snack time", "Ava used two-word phrases ('more milk', 'all done') independently during snack time and pointed to the correct cup when asked 'where is your cup?'.", "BIRTH_TO_THREE", ["Communication and Language", "Personal, Social and Emotional Development"], "Model simple sentences during play; introduce picture books with repetitive phrases.");
  await makeObservation(littleSprouts.id, lsChild3.id, lsStaff2.id, daysAgo(1), "Counting acorns in the garden", "Ethan counted a group of six acorns accurately, touching each one as he counted, and confidently recognised the numeral 6 on a nearby number line.", "THREE_TO_FOUR", ["Mathematics", "Understanding the World"], "Introduce simple addition through practical counting games; extend to counting beyond 10.");
  await makeObservation(littleSprouts.id, lsChild4.id, lsStaff1.id, daysAgo(4), "Building a tower with friends", "Sofia worked alongside two peers to build a tower of blocks, taking turns and using words like 'my turn' and 'your turn' appropriately.", "BIRTH_TO_THREE", ["Personal, Social and Emotional Development", "Expressive Arts and Design"], "Encourage turn-taking games in small groups; introduce simple building challenges.");

  await makeReport(littleSprouts.id, lsChild2.id, lsStaff1.id, ReportType.TWO_YEAR_CHECK, "2-Year-Old Progress Check", "BIRTH_TO_THREE", "Ava is a sociable, curious toddler who is making good progress across the prime areas of learning. She communicates confidently with familiar adults and is beginning to form friendships with her peers.", "Continue to extend vocabulary through shared reading; encourage independent dressing skills.", [
    { area: "Communication and Language", level: DevelopmentLevel.EXPECTED, comment: "Uses short phrases confidently; understands simple instructions." },
    { area: "Physical Development", level: DevelopmentLevel.EXPECTED, comment: "Walks, runs and climbs confidently; developing pincer grip." },
    { area: "Personal, Social and Emotional Development", level: DevelopmentLevel.EMERGING, comment: "Beginning to share and take turns with support." },
  ]);
  await makeReport(littleSprouts.id, lsChild3.id, lsStaff2.id, ReportType.TERMLY_SUMMARY, "Summer Term 2026", "THREE_TO_FOUR", "Ethan has had a wonderful term. He is a confident communicator, enjoys mathematical challenges, and has shown real enthusiasm for outdoor learning and understanding the natural world.", "Continue to build on early writing skills ahead of the transition to school in September.", [
    { area: "Communication and Language", level: DevelopmentLevel.EXCEEDING, comment: "Speaks in full, well-structured sentences and asks thoughtful questions." },
    { area: "Physical Development", level: DevelopmentLevel.EXPECTED, comment: "Good pencil grip; confident on climbing equipment." },
    { area: "Personal, Social and Emotional Development", level: DevelopmentLevel.EXPECTED, comment: "Plays cooperatively and manages his feelings well." },
    { area: "Literacy", level: DevelopmentLevel.EXPECTED, comment: "Recognises his name and several familiar words." },
    { area: "Mathematics", level: DevelopmentLevel.EXCEEDING, comment: "Counts confidently to 20 and beyond; compares quantities." },
    { area: "Understanding the World", level: DevelopmentLevel.EXCEEDING, comment: "Shows great curiosity about the natural world and asks how things work." },
    { area: "Expressive Arts and Design", level: DevelopmentLevel.EXPECTED, comment: "Enjoys imaginative role play and mark-making." },
  ]);
  await makeReport(littleSprouts.id, lsChild4.id, lsStaff1.id, ReportType.TERMLY_SUMMARY, "Summer Term 2026", "BIRTH_TO_THREE", "Sofia has settled in beautifully this term. She is developing strong friendships and is becoming more independent at mealtimes and during self-care routines.", "Support further language development through songs and rhymes; encourage independent toileting.", [
    { area: "Communication and Language", level: DevelopmentLevel.EMERGING, comment: "Understands simple instructions; vocabulary is growing steadily." },
    { area: "Physical Development", level: DevelopmentLevel.EXPECTED, comment: "Confident walker and climber; enjoys mark-making with chunky crayons." },
    { area: "Personal, Social and Emotional Development", level: DevelopmentLevel.EXPECTED, comment: "Forming close bonds with key person and peers." },
  ]);

  // ---------------------------------------------------------------------------
  // Nursery 2: Sunflower Fields Nursery — a second, fully isolated tenant
  // ---------------------------------------------------------------------------

  const sunflower = await prisma.nursery.create({
    data: {
      name: "Sunflower Fields Nursery",
      slug: "sunflower-fields",
      address: "48 Orchard Road, Leeds, LS6 2QW",
      phone: "0113 555 0421",
      email: "hello@sunflowerfields.test",
      invoicePrefix: "SFN",
    },
  });

  const sfAdmin = await prisma.user.create({
    data: { email: "admin@sunflowerfields.test", name: "Rebecca Hughes", role: Role.ADMIN, passwordHash, phone: "07700 900101", nurseryId: sunflower.id },
  });
  const sfStaff1 = await prisma.user.create({
    data: { email: "staff@sunflowerfields.test", name: "Tomasz Nowak", role: Role.STAFF, passwordHash, phone: "07700 900102", nurseryId: sunflower.id },
  });
  const sfParent1 = await prisma.user.create({
    data: { email: "parent@sunflowerfields.test", name: "Aisha Bello", role: Role.PARENT, passwordHash, phone: "07700 900110", nurseryId: sunflower.id },
  });
  const sfParent2 = await prisma.user.create({
    data: { email: "liam.walsh@example.test", name: "Liam Walsh", role: Role.PARENT, passwordHash, phone: "07700 900111", nurseryId: sunflower.id },
  });

  const sfChild1 = await prisma.child.create({
    data: { nurseryId: sunflower.id, firstName: "Noah", lastName: "Bello", dateOfBirth: monthsAgo(11), gender: "Male", room: "Nursery Room", startDate: monthsAgo(4), allergies: "None known", active: true },
  });
  const sfChild2 = await prisma.child.create({
    data: { nurseryId: sunflower.id, firstName: "Freya", lastName: "Walsh", dateOfBirth: monthsAgo(38), gender: "Female", room: "Pre-School Room", startDate: monthsAgo(18), allergies: "Sesame allergy (EpiPen held on site)", active: true },
  });

  await prisma.parentChild.createMany({
    data: [
      { parentId: sfParent1.id, childId: sfChild1.id, relationship: "Mother", isPrimaryContact: true },
      { parentId: sfParent2.id, childId: sfChild2.id, relationship: "Father", isPrimaryContact: true },
    ],
  });

  await makeInvoice(sunflower.id, "SFN-1001", sfChild1.id, sfParent1.id, InvoiceStatus.SENT, daysAgo(3), daysFromNow(11), [{ description: "Nursery Room fees — 4 days/week (4 weeks)", quantity: 1, unitPrice: 860 }]);
  await makeInvoice(sunflower.id, "SFN-1002", sfChild2.id, sfParent2.id, InvoiceStatus.PAID, daysAgo(30), daysAgo(16), [{ description: "Pre-School Room fees — full time (4 weeks)", quantity: 1, unitPrice: 990 }], daysAgo(18));

  await prisma.newsletter.create({ data: { nurseryId: sunflower.id, title: "Sunflower Fields Summer Newsletter", body: "It's been a sunny start to term! Children have been growing their own sunflowers in the garden and we're looking forward to our summer fete next month.", authorId: sfAdmin.id, publishedAt: daysAgo(3) } });

  await prisma.announcement.create({ data: { nurseryId: sunflower.id, title: "Sports day — save the date", body: "Our annual sports day will take place in three weeks. More details to follow.", priority: AnnouncementPriority.NORMAL, authorId: sfAdmin.id, publishedAt: daysAgo(1) } });

  await makeDiary(sunflower.id, sfChild1.id, daysAgo(0), sfStaff1.id);
  await makeDiary(sunflower.id, sfChild2.id, daysAgo(0), sfStaff1.id);

  await makeObservation(sunflower.id, sfChild1.id, sfStaff1.id, daysAgo(2), "Exploring the sensory garden", "Noah crawled towards the sensory garden bed and explored the herbs by touching and smelling them, showing curiosity about their different textures.", "BIRTH_TO_THREE", ["Physical Development", "Understanding the World"], "Continue sensory exploration outdoors; introduce simple herb-naming games.");
  await makeObservation(sunflower.id, sfChild2.id, sfAdmin.id, daysAgo(1), "Retelling a story with props", "Freya retold 'The Very Hungry Caterpillar' using felt props, sequencing the events correctly and using expressive language.", "THREE_TO_FOUR", ["Communication and Language", "Literacy"], "Introduce story-mapping activities; encourage her to invent her own stories.");

  await makeReport(sunflower.id, sfChild2.id, sfAdmin.id, ReportType.TERMLY_SUMMARY, "Summer Term 2026", "THREE_TO_FOUR", "Freya continues to thrive at Sunflower Fields. She is a confident storyteller and enjoys leading imaginative play with her friends.", "Continue to build early number recognition through games.", [
    { area: "Communication and Language", level: DevelopmentLevel.EXCEEDING, comment: "Retells stories with excellent detail and sequencing." },
    { area: "Literacy", level: DevelopmentLevel.EXPECTED, comment: "Enjoys books and recognises some familiar words." },
    { area: "Mathematics", level: DevelopmentLevel.EMERGING, comment: "Beginning to recognise numerals 1-5." },
  ]);

  console.log("Seed complete.");
  console.log("Demo accounts (password: password123):");
  console.log("  owner@platform.test (PLATFORM_ADMIN)");
  console.log("  --- Little Sprouts Nursery ---");
  console.log("  admin@littlesprouts.test (ADMIN)");
  console.log("  staff@littlesprouts.test (STAFF)");
  console.log("  parent@littlesprouts.test (PARENT — Sarah Chen, parent of Oliver & Ava)");
  console.log("  --- Sunflower Fields Nursery ---");
  console.log("  admin@sunflowerfields.test (ADMIN)");
  console.log("  staff@sunflowerfields.test (STAFF)");
  console.log("  parent@sunflowerfields.test (PARENT — Aisha Bello, parent of Noah)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
