import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const required = ["index.html", "styles.css", "script.js", "assets/rayan-testimonial.mp4", "assets/apptics-logo-dark.svg"];
required.push("assets/check-circle-fill.svg", "assets/PHOSPHOR-LICENSE.txt");
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

// Keep CTAs working after removing the inline calendar.
const auditLinks = [...html.matchAll(/<a\b[^>]*class="primary-cta\b[^\"]*"[^>]*href="([^"]+)"/g)];
if (auditLinks.length !== 3 || auditLinks.some(([, href]) => href !== "https://cal.com/theinfostudio/apptics-sales-call")) {
  throw new Error("All three audit buttons must link directly to the booking page");
}
if (/<iframe\b|class="(?:booking|calendar-shell)"/.test(html)) {
  throw new Error("The inline calendar section must not be rendered");
}

const heroChecks = [...html.matchAll(/<img\b[^>]*class="check"[^>]*>/g)];
if (heroChecks.length !== 3 || heroChecks.some(([tag]) => !tag.includes('src="./assets/check-circle-fill.svg"') || !tag.includes('alt=""'))) {
  throw new Error("Hero checkmarks must use decorative Phosphor SVG images");
}

for (const [, id] of html.matchAll(/href="#([^\"]+)"/g)) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Broken section link: #${id}`);
}

console.log("Static checks passed");
