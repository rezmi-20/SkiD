import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const allowedServerAuthImports = new Set([
  path.normalize("app/api/auth/[...path]/route.ts"),
  path.normalize("lib/auth/index.ts"),
]);

const ignoredDirs = new Set([
  ".git",
  ".next",
  "node_modules",
  "scratch",
]);
const ignoredFiles = new Set([
  path.normalize("scripts/check-auth-consistency.mjs"),
]);

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const violations = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);
    const normalizedRelativePath = path.normalize(relativePath);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        await walk(fullPath);
      }
      continue;
    }

    if (!sourceExtensions.has(path.extname(entry.name))) continue;
    if (ignoredFiles.has(normalizedRelativePath)) continue;

    const source = await readFile(fullPath, "utf8");
    const importsRawServerAuth =
      source.includes("@/lib/auth/server") ||
      source.includes("./server") && normalizedRelativePath === path.normalize("lib/auth/index.ts");

    if (
      importsRawServerAuth &&
      !allowedServerAuthImports.has(normalizedRelativePath)
    ) {
      violations.push(relativePath);
    }
  }
}

await walk(root);

if (violations.length > 0) {
  console.error("Raw Neon Auth server imports are not allowed outside the auth boundary.");
  console.error("Use `import { auth } from \"@/lib/auth\"` instead.");
  for (const file of violations) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("Auth consistency check passed.");
