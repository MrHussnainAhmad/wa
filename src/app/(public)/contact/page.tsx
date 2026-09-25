import { ContactForm } from "@/components/public/ContactForm";
import { getSettings } from "@/lib/settings";
import { BRAND } from "@/lib/brand";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Contact",
  description: `Contact ${BRAND.name} about outdoor advertising boards.`,
};

export default async function ContactPage() {
  let whatsapp = "923001234567";
  try {
    const settings = await getSettings();
    whatsapp = settings.whatsappNumber;
  } catch {
    /* db may be empty on first boot */
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white sm:text-6xl">
        Contact
      </h1>
      <p className="mt-2 text-stone-400">
        Tell us the city and we&apos;ll follow up. Or message us on{" "}
        <a
          className="text-amber-400 hover:underline"
          href={whatsappLink(whatsapp)}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
        .
      </p>
      <div className="mt-10">
        <ContactForm companyWhatsapp={whatsapp} />
      </div>
    </div>
  );
}
