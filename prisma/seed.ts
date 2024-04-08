import { prisma } from "../src/lib/prisma";

async function seed() {
  await prisma.event.create({
    data: {
      id: "90f1b6d4-d19e-4f15-a850-af212d10223d",
      title: "Unite Summit",
      slug: "unite-summit",
      details: "A conference for developers",
      maximumAttendees: 120,
    },
  });
}

seed().then(() => {
  console.log("Database seeded");
  prisma.$disconnect();
});
