import { PrismaClient } from "@prisma/client";
import { dataSpaces } from "./seed.data";

const prisma = new PrismaClient();

async function main() {
    await prisma.dataSpace.createMany({
        data: dataSpaces,
        skipDuplicates: true,
    });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Initializing data failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });