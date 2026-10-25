
import React from "react";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: (
      <>
        <p>
          Webcraft Solution may collect information that you provide when
          contacting us, requesting a service, submitting a form, or using our
          website.
        </p>
        <ul>
          <li>Personal information such as your name and email address.</li>
          <li>Contact details such as your phone number, if provided.</li>
          <li>
            Project details, messages, and other information you voluntarily
            submit to us.
          </li>
          <li>
            Technical information such as browser type, device information,
            and website usage data, where applicable.
          </li>
        </ul>
        <p>
          We collect only the information reasonably necessary for the
          purposes described in this policy.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>Information collected may be used to:</p>
        <ul>
          <li>Respond to inquiries and service requests.</li>
          <li>Provide, maintain, and improve our services.</li>
          <li>Communicate about projects, updates, or support.</li>
          <li>Protect our website against fraud, abuse, and security threats.</li>
          <li>Meet applicable legal and regulatory obligations.</li>
        </ul>
        <p>
          We do not claim to use every type of information for every purpose.
          Our actual use depends on the services and features you access.
        </p>
      </>
    ),
  },
  {
    id: "sharing-information",
    title: "3. Sharing of Information",
    content: (
      <>
        <p>
          We do not sell your personal information. We may share information
          when reasonably necessary in the following circumstances:
        </p>
        <ul>
          <li>
            <strong>Service providers:</strong> With trusted providers that
            help us host, maintain, secure, or operate our website and services.
          </li>
          <li>
            <strong>Legal requirements:</strong> When disclosure is required
            by applicable law or a valid legal process.
          </li>
          <li>
            <strong>Business protection:</strong> When necessary to protect
            our rights, users, property, or website security.
          </li>
          <li>
            <strong>With your direction:</strong> When you request or authorize
            a particular disclosure.
          </li>
        </ul>
        <p>
          Any sharing is subject to applicable legal requirements and
          appropriate safeguards.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies and Similar Technologies",
    content: (
      <>
        <p>
          Our website may use cookies or similar technologies to support
          essential functionality, remember preferences, understand website
          usage, or improve performance.
        </p>
        <p>
          You can manage cookies through your browser settings. Disabling
          certain cookies may affect website functionality. Where required,
          we will request consent before using non-essential cookies.
        </p>
        <p>
          The cookies actually used by our website depend on its configuration
          and the third-party tools installed.
        </p>
      </>
    ),
  },
  {
    id: "third-party-services",
    title: "5. Third-Party Services and Links",
    content: (
      <>
        <p>
          Our website may link to third-party websites or use external
          services, such as hosting, analytics, communication, or embedded
          content providers.
        </p>
        <p>
          These third parties may process information according to their own
          privacy policies. We encourage you to review their policies before
          providing personal information. We are not responsible for the
          privacy practices of independently operated third-party websites.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "6. Data Security",
    content: (
      <>
        <p>
          We take reasonable technical and organizational measures designed
          to protect personal information against unauthorized access,
          alteration, disclosure, or destruction.
        </p>
        <p>
          However, no method of transmitting or storing information is
          completely secure. We cannot guarantee absolute security.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "7. Data Retention",
    content: (
      <p>
        We retain personal information only for as long as reasonably
        necessary for the purposes for which it was collected, including
        providing services, resolving disputes, maintaining records, and
        complying with applicable legal obligations. Retention periods may
        vary depending on the type of information and the circumstances.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "8. Your Privacy Rights",
    content: (
      <>
        <p>
          Depending on applicable law, you may have the right to:
        </p>
        <ul>
          <li>Request access to personal information we hold about you.</li>
          <li>Request correction of inaccurate or incomplete information.</li>
          <li>Request deletion of personal information, where applicable.</li>
          <li>
            Withdraw consent where processing is based on your consent.
          </li>
          <li>
            Raise a concern or submit a privacy-related complaint.
          </li>
        </ul>
        <p>
          To exercise an applicable right, contact us using the details below.
          We may need to verify your identity before responding.
        </p>
      </>
    ),
  },
  {
    id: "children-privacy",
    title: "9. Children's Privacy",
    content: (
      <p>
        Our website is not intended to collect personal information from
        children in violation of applicable law. If you believe a child has
        provided personal information inappropriately, contact us so we can
        review the situation and take appropriate action.
      </p>
    ),
  },
  {
    id: "policy-changes",
    title: "10. Changes to This Privacy Policy",
    content: (
      <p>
        We may update this Privacy Policy when our practices, services, or
        legal obligations change. The updated version will be published on
        this page with a revised effective date. We encourage you to review
        this page periodically.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white sm:py-24">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3 5 6v5c0 4.5 2.8 7.7 7 10 4.2-2.3 7-5.5 7-10V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Your privacy matters
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Privacy <span className="text-blue-400">Policy</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            At Webcraft Solution, we respect your privacy and are committed
            to handling personal information responsibly. This policy
            explains what information we may collect, how it may be used,
            and the choices available to you.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="rounded-lg bg-white/10 px-3 py-2">
              Effective date: October 25, 2026
            </span>
            <span className="rounded-lg bg-white/10 px-3 py-2">
              Webcraft Solution
            </span>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Table of contents */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-8">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
              On this page
            </h2>

            <nav aria-label="Privacy policy sections">
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#contact"
                    className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <div className="min-w-0 space-y-6">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">
                Our commitment
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                We aim to be transparent about our data practices and to
                collect and use personal information only for legitimate
                purposes. Please read this policy carefully to understand
                how it applies when you use our website or contact us.
              </p>
            </div>

            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-base [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
                  {section.content}
                </div>
              </section>
            ))}

            {/* Contact */}
            <section
              id="contact"
              className="scroll-mt-8 rounded-2xl bg-slate-950 p-6 text-white sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">11. Contact Us</h2>
                  <p className="mt-3 leading-7 text-slate-300">
                    If you have questions about this Privacy Policy, your
                    personal information, or a privacy-related request,
                    please contact Webcraft Solution.
                  </p>

                  <div className="mt-6 space-y-3 text-sm">
                    <p>
                      <span className="text-slate-400">Company:</span>{" "}
                      Webcraft Solution
                    </p>
                    <p>
                      <span className="text-slate-400">Email:</span>{" "}
                      <a
                        href="mailto:office56630@gmail.com"
                        className="break-all font-medium text-blue-300 transition hover:text-blue-200"
                      >
                        office56630@gmail.com
                      </a>
                    </p>
                    <p className="text-xs leading-6 text-slate-400">
                      Replace the placeholder email with your official
                      business contact address before publishing.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <p className="px-2 pb-6 text-center text-xs leading-6 text-slate-500">
              © {new Date().getFullYear()} Webcraft Solution. All rights
              reserved.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
