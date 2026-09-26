import { Metadata } from 'next';
import {
  LegalPage,
  LegalSection,
  SUPPORTED_PLATFORMS,
} from '@gitroom/frontend/components/legal/legal.page';

export const metadata: Metadata = {
  title: 'Terms of Service — Alisamadi LLC',
  description: 'Terms of Service for the Alisamadi LLC social scheduling app.',
};

const COMPANY = 'Alisamadi LLC';
const CONTACT = 'alisamadi8305@gmail.com';
const UPDATED = 'September 26, 2026';

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={UPDATED}>
      <LegalSection>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
        social media scheduling application (the &quot;Service&quot;) operated by {COMPANY}
        (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By creating an account or using the Service you
        agree to these Terms.
      </LegalSection>

      <LegalSection title="1. The Service">
        The Service lets you connect your own social media and messaging accounts
        (including {SUPPORTED_PLATFORMS}) to schedule, publish, and review content
        across those platforms from a single dashboard.
      </LegalSection>

      <LegalSection title="2. Accounts you connect">
        You may only connect social accounts that you own or are authorized to
        manage. You are responsible for all content you schedule or publish through
        the Service and for complying with the terms and community guidelines of
        each connected platform. Access to connected platforms is granted by you
        through their official OAuth flows and can be revoked at any time from your
        account settings or from the platform itself.
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        You agree not to use the Service to publish content that is unlawful,
        infringing, deceptive, or that violates the policies of any connected
        platform. We may suspend or terminate access that we reasonably believe
        breaches these Terms or the rules of a connected platform.
      </LegalSection>

      <LegalSection title="4. Third-party platforms">
        The Service relies on APIs provided by third-party platforms. Those
        platforms may change, limit, or discontinue their APIs at any time, which
        may affect the Service. We are not responsible for the availability,
        accuracy, or behavior of any third-party platform.
      </LegalSection>

      <LegalSection title="5. Disclaimer and liability">
        The Service is provided &quot;as is&quot; without warranties of any kind. To the
        maximum extent permitted by law, {COMPANY} is not liable for any indirect,
        incidental, or consequential damages arising from your use of the Service,
        including failed, delayed, or removed posts on connected platforms.
      </LegalSection>

      <LegalSection title="6. Changes to these Terms">
        We may update these Terms from time to time. Material changes will be
        reflected by updating the date at the top of this page. Continued use of
        the Service after changes take effect constitutes acceptance of the revised
        Terms.
      </LegalSection>

      <LegalSection title="7. Contact">
        Questions about these Terms can be sent to{' '}
        <a className="text-primary underline" href={`mailto:${CONTACT}`}>
          {CONTACT}
        </a>
        .
      </LegalSection>
    </LegalPage>
  );
}
