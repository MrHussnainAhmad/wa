type Props = {
  siteUrl: string;
  qrDataUrl: string;
};

export function SiteQrCard({ siteUrl, qrDataUrl }: Props) {
  return (
    <section className="max-w-xl space-y-3 border border-stone-800 bg-stone-900/40 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
        Website QR code
      </h2>
      <p className="text-sm text-stone-400">
        Print or share this code. Scanning it opens your public homepage.
      </p>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code for ${siteUrl}`}
          width={180}
          height={180}
          className="border border-stone-700 bg-white p-2"
        />
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Opens
            </p>
            <a
              href={siteUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-amber-400 hover:underline"
            >
              {siteUrl}
            </a>
          </div>
          <a
            href={qrDataUrl}
            download="waqas-advertisers-homepage-qr.png"
            className="inline-flex items-center justify-center border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
          >
            Download PNG
          </a>
        </div>
      </div>
    </section>
  );
}
