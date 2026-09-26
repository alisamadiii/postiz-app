import { Metadata } from 'next';
import {
  LegalPage,
  LegalSection,
  SUPPORTED_PLATFORMS,
} from '@gitroom/frontend/components/legal/legal.page';

export const metadata: Metadata = {
  title: 'Privacy Policy — Alisamadi LLC',
  description: 'Privacy Policy for the Alisamadi LLC social scheduling app.',
};

const COMPANY = 'Alisamadi LLC';
const CONTACT = 'alisamadi8305@gmail.com';
const UPDATED = 'September 26, 2026';

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={UPDATED}>
      <LegalSection>
        This Privacy Policy explains how {COMPANY} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
        collects, uses, and protects information when you use our social media
        scheduling application (the &quot;Service&quot;).
      </LegalSection>

      <LegalSection title="1. Information we collect">
        We collect the information needed to operate the Service: your account
        details (such as email address), the content you create or schedule, and
        the access tokens and basic profile information returned when you connect a
        social account (including {SUPPORTED_PLATFORMS}) through their official
        OAuth flows. We may also collect basic usage and analytics data about how
        the Service is used.
      </LegalSection>

      <LegalSection title="2. How we use information">
        We use this information to authenticate you, to publish and schedule the
        content you request on your connected accounts, to display analytics for
        those accounts, and to operate, maintain, and improve the Service. We do
        not sell your personal information.
      </LegalSection>

      <LegalSection title="3. Data from connected platforms">
        When you connect a platform, we access only the data permitted by the scopes
        you approve — for example, publishing content, listing your posts, and
        reading basic profile and engagement statistics. This data is used solely
        to provide the Service to you and is not shared with third parties except
        as required to deliver the Service or to comply with law.
      </LegalSection>

      <LegalSection title="4. Data retention and deletion">
        We retain your information for as long as your account is active. You can
        remove your data at any time using any of the following methods:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Disconnect a specific platform from within the app, which deletes the
            stored access tokens and profile data for that platform.
          </li>
          <li>
            Revoke access directly from the connected platform&apos;s own app or
            security settings (for example, in your TikTok, Instagram, Facebook,
            Threads, or Pinterest account settings).
          </li>
          <li>
            Request full deletion of your account and all associated data by
            emailing{' '}
            <a className="text-primary underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>{' '}
            with the subject &quot;Data deletion request&quot;. We will process the
            request and confirm removal within 30 days.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Security">
        We take reasonable technical and organizational measures to protect your
        information, including encrypted transport and restricted access to stored
        credentials. No method of transmission or storage is completely secure, and
        we cannot guarantee absolute security.
      </LegalSection>

      <LegalSection title="6. Changes to this policy">
        We may update this Privacy Policy from time to time. Material changes will
        be reflected by updating the date at the top of this page.
      </LegalSection>

      <LegalSection title="7. Contact">
        For privacy questions or data deletion requests, contact{' '}
        <a className="text-primary underline" href={`mailto:${CONTACT}`}>
          {CONTACT}
        </a>
        .
      </LegalSection>
    </LegalPage>
  );
}
