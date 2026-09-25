import { SiteFooter, SiteHeader } from "@/components/public/SiteChrome";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let whatsapp = "";
  try {
    const settings = await getSettings();
    whatsapp = settings.whatsappNumber;
  } catch {
    whatsapp = "";
  }

  return (
    <div className="flex min-h-full flex-col bg-stone-950 text-stone-100">
      <SiteHeader whatsapp={whatsapp} />
      <main className="flex-1">{children}</main>
      <SiteFooter whatsapp={whatsapp} />
    </div>
  );
}
