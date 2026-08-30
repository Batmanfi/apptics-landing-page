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

// Each revised card uses a real list, not text bullets or manual line breaks.
const copyCards = [...html.matchAll(/<article class="(problem-card|solution-card)">([\s\S]*?)<\/article>/g)];
const expectedPointCounts = [3, 3, 3, 3, 3, 2, 2, 2, 3, 3];
if (copyCards.length !== expectedPointCounts.length) throw new Error("Expected four problem cards and six solution cards");
for (const [index, [, className, markup]] of copyCards.entries()) {
  const expectedClass = index < 4 ? "problem-card" : "solution-card";
  const lists = [...markup.matchAll(/<ul class="card-points">([\s\S]*?)<\/ul>/g)];
  if (className !== expectedClass || lists.length !== 1) throw new Error(`Missing semantic bullet list in card ${index + 1}`);
  const points = [...lists[0][1].matchAll(/<li>([^<]+)<\/li>/g)];
  if (points.length !== expectedPointCounts[index] || points.some(([, text]) => !text.trim())) {
    throw new Error(`Unexpected or empty bullet points in card ${index + 1}`);
  }
  if (/[•·]|<br\b|<p\b/.test(markup)) throw new Error(`Card ${index + 1} must use list items instead of manual bullets or paragraphs`);
}

console.log("Static checks passed");
