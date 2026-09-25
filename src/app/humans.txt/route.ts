import { BRAND } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";

export async function GET() {
  const base = getSiteUrl();
  const body = `/* TEAM */
Company: ${BRAND.name}
Site: ${base}

/* SITE */
Standards: HTML, CSS, JavaScript
Software: Next.js

/* THANKS */
Built for outdoor advertising clients across Pakistan.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
