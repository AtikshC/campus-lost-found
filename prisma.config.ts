import "dotenv/config";
import { defineConfig } from "prisma/config";

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Classic datasource config (Prisma reads DB URL from here)
  datasource: {
    url: must("DATABASE_URL"),
  },
});
