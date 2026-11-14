import type { Company } from "@/api/types";

const PALETTE = [
  { color: "#0aa99b", bg: "#e6f8f3" },
  { color: "#e69a46", bg: "#fff3df" },
  { color: "#5085e6", bg: "#e9efff" },
  { color: "#9969ce", bg: "#f1eafe" },
];

/** لون وشارة الشركة مشتقّان من معرّفها (الـ API لا يوفّر شعارًا). */
export function companyVisual(company: Pick<Company, "id">) {
  return PALETTE[Math.abs(company.id - 1) % PALETTE.length];
}

export function companyInitial(name: string): string {
  const trimmed = name.trim();
  // نتجاهل بادئة "ال" الشائعة لأسماء الشركات العربية.
  return trimmed.replace(/^ال/, "").charAt(0) || "س";
}

export function companyLabel(company: { name: string }): string {
  return company.name.replace(/\s*\(تجريبي\)\s*/g, "");
}
