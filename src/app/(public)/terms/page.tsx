import { BRAND } from "@/lib/brand";
import { LegalPage, LegalSection } from "@/components/public/LegalPage";

export const metadata = {
  title: "Terms & Conditions",
  description: `Terms governing use of the ${BRAND.name} website and outdoor advertising services.`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="26 March 2026">
      <p>
        By using the {BRAND.name} website and services, you agree to these
        Terms &amp; Conditions. If you do not agree, please do not use the
        site.
      </p>

      <LegalSection title="1. Who we are">
        <p>
          {BRAND.name} provides outdoor advertising marketplace services,
          including billboard and digital board listings, quote estimates, and
          related sales support in Pakistan.
        </p>
      </LegalSection>

      <LegalSection title="2. Website use">
        <p>
          You may browse board listings, request quotes, and contact our team
          for legitimate business purposes. You must not misuse the site,
          attempt unauthorized access, scrape data aggressively, submit spam,
          or interfere with site operations.
        </p>
      </LegalSection>

      <LegalSection title="3. Listings and availability">
        <p>
          Board details (including traffic estimates, pricing, photos, and
          availability) are provided for information and sales purposes.
          Availability can change when bookings are confirmed. We aim to keep
          information accurate but do not guarantee uninterrupted availability
          of every listing.
        </p>
      </LegalSection>

      <LegalSection title="4. Quotes">
        <p>
          Online quotes are estimates calculated from published board rates,
          selected duration, board type adjustments, and design fees set in
          our system. Final commercial terms are confirmed in a booking
          agreement / contract with {BRAND.name}.
        </p>
      </LegalSection>

      <LegalSection title="5. Bookings and payments">
        <p>
          A booking becomes binding only when confirmed by our team under an
          agreed contract. Deposits, payment schedules, creative deadlines,
          and installation timelines are governed by that contract. Website
          deposit status fields are for internal tracking unless otherwise
          stated in writing.
        </p>
      </LegalSection>

      <LegalSection title="6. Creative and compliance">
        <p>
          Clients are responsible for ensuring advertised content complies with
          applicable laws, brand rights, and local outdoor advertising rules.
          We may refuse creative that is unlawful, misleading, or unsuitable
          for public display.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          Site design, branding, text, and software are owned by {BRAND.name}{" "}
          or its licensors. Board photos and third-party marks remain the
          property of their respective owners.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          To the maximum extent permitted by law, {BRAND.name} is not liable
          for indirect, incidental, or consequential damages arising from use
          of the website or reliance on listing estimates. Our liability for
          confirmed bookings is limited as set out in the applicable contract.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          We may update these Terms from time to time. Continued use of the
          site after changes means you accept the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these Terms can be sent through the Contact page on
          this website.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
