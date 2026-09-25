import { BRAND } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";

export async function GET() {
  const base = getSiteUrl();
  const body = `# ${BRAND.name}

> ${BRAND.tagline}

Waqas Advertisers is an outdoor advertising marketplace for booking billboards and digital boards across Pakistan.

## Site
- Home: ${base}/
- Boards: ${base}/boards
- Quote calculator: ${base}/quote
- Contact: ${base}/contact
- Privacy policy: ${base}/privacy
- Terms: ${base}/terms

## Notes
- Board inventory, pricing, testimonials, and FAQs are live from the database.
- Quotes are calculated server-side from board rates, duration discounts, board-type rates, and a design fee.
- Admin and sales tools are private and not for public indexing.

## Contact
- Website: ${base}
- Domain: ${BRAND.domain}.com
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
