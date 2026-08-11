import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
declare const prisma: PrismaClient<{
    adapter: PrismaPg;
    errorFormat: "pretty";
}, never, import("@prisma/client/runtime/client").DefaultArgs>;
export default prisma;
//# sourceMappingURL=prisma.d.ts.map