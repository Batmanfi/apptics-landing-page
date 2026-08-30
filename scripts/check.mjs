import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const required = ["index.html", "styles.css", "script.js", "assets/rayan-testimonial.mp4", "assets/apptics-logo-dark.svg"];
const missing = required.filter((path) => !existsSync(resolve(root, path)));
if (missing.length) throw new Error(`Missing required files: ${missing.join(", ")}`);

const html = readFileSync(resolve(root, "index.html"), "utf8");
const css = readFileSync(resolve(root, "styles.css"), "utf8");
const js = readFileSync(resolve(root, "script.js"), "utf8");
const combined = `${html}\n${css}\n${js}`;

for (const value of [
  "https://cal.com/theinfostudio/apptics-sales-call",
  "./assets/rayan-testimonial.mp4",
  "https://t.me/Apptics",
  "https://www.apptics.ai/privacy-policy"
]) {
  if (!combined.includes(value)) throw new Error(`Expected integration not found: ${value}`);
}

if (/\bTODO\b|placeholder/i.test(combined)) throw new Error("Unfinished placeholder content found");

for (const match of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g)) {
  const localPath = match[1].replace(/^\.\//, "");
  if (!existsSync(resolve(root, localPath))) throw new Error(`Broken local reference: ${match[1]}`);
}

console.log("Static checks passed");
