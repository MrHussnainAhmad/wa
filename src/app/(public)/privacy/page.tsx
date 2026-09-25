import { BRAND } from "@/lib/brand";
import { LegalPage, LegalSection } from "@/components/public/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${BRAND.name} collects, uses, and protects your information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="26 March 2026">
      <p>
        This Privacy Policy explains how {BRAND.name} (&quot;we&quot;,
        &quot;us&quot;, &quot;our&quot;) collects and uses information when you
        use our website and outdoor advertising services.
      </p>

      <LegalSection title="1. Information we collect">
        <p>
          When you request a quote or contact us, we may collect your name,
          phone number, city of interest, optional board preference, message
          notes, and any quote details generated from your request.
        </p>
        <p>
          We also collect basic technical data such as browser type, device,
          and approximate usage logs needed to operate and secure the site
          (including rate limiting against spam).
        </p>
      </LegalSection>

      <LegalSection title="2. How we use information">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Respond to quote and contact requests</li>
          <li>Prepare proposals and bookings for outdoor boards</li>
          <li>Improve our inventory, pricing tools, and site experience</li>
          <li>Send service-related notices related to your inquiry</li>
          <li>Protect against fraud, abuse, and spam</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Sharing">
        <p>
          We do not sell your personal information. We may share limited data
          with trusted service providers who help us host the site, send email
          notifications, store uploaded files, or process operations — only as
          needed to provide our services.
        </p>
        <p>
          We may disclose information if required by law or to protect the
          rights, safety, and property of {BRAND.name}, our clients, or the
          public.
        </p>
      </LegalSection>

      <LegalSection title="4. Data retention">
        <p>
          Lead and inquiry records are kept as long as needed for sales
          follow-up, accounting, dispute resolution, and legal obligations.
          You may ask us to update or delete inquiry details where we are not
          required to retain them.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies and similar technologies">
        <p>
          We may use essential cookies or session storage for security and
          authenticated staff access. Public browsing does not require an
          account.
        </p>
      </LegalSection>

      <LegalSection title="6. Security">
        <p>
          We take reasonable administrative and technical measures to protect
          information. No method of transmission or storage is 100% secure.
        </p>
      </LegalSection>

      <LegalSection title="7. Your choices">
        <p>
          You can contact us to request access, correction, or deletion of
          personal information we hold about your inquiry, subject to legal
          exceptions.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          For privacy questions, contact {BRAND.name} through the Contact page
          on this website or via the WhatsApp number published on the site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
