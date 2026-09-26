import { BRAND } from "@/lib/brand";

export function getSiteUrl() {
  const raw =
    process.env.SITE_URL ||
    process.env.AUTH_URL ||
    `https://${BRAND.domain}.com`;
  return raw.replace(/\/$/, "");
}
