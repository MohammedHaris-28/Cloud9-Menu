
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  LockKeyhole,
  Database,
  Cookie,
  ShoppingBag,
  Gift,
  CreditCard,
  Phone,
  MapPin,
  Mail,
  ChevronDown,
  CheckCircle2,
  UtensilsCrossed,
  ExternalLink,
} from "lucide-react";

import logo from "@/assets/cloud 9.webp";

const sections = [
  { id: "overview", label: "Overview", number: "01" },
  { id: "privacy", label: "Privacy policy", number: "02" },
  { id: "data", label: "Information we collect", number: "03" },
  { id: "usage", label: "How we use information", number: "04" },
  { id: "sharing", label: "Sharing & security", number: "05" },
  { id: "cookies", label: "Cookies & technology", number: "06" },
  { id: "loyalty", label: "Loyalty rewards", number: "07" },
  { id: "terms", label: "Terms of service", number: "08" },
  { id: "orders", label: "Orders & payments", number: "09" },
  { id: "cancellations", label: "Cancellations & refunds", number: "10" },
  { id: "responsibility", label: "Customer responsibilities", number: "11" },
  { id: "rights", label: "Your privacy rights", number: "12" },
  { id: "contact", label: "Contact us", number: "13" },
];

const lastUpdated = "23 October 2026";

function SectionHeading({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-black text-blue-700">
        {number}
      </span>
      <div className="min-w-0">
        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function PolicySection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-b border-slate-100 py-8 last:border-b-0 sm:py-10"
    >
      {children}
    </section>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <div className="mt-2 text-sm leading-7 text-slate-600">{children}</div>
    </div>
  );
}

export default function PrivacyTerms() {
  const [activeSection, setActiveSection] = useState("overview");
  const [showContents, setShowContents] = useState(false);

  const goToSection = (id: string) => {
    setActiveSection(id);
    setShowContents(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-800">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-3"
            aria-label="Back to restaurant home"
          >
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
              <img
                src={logo}
                alt="Cloud 9 logo"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-[230px] truncate text-sm font-black text-slate-900">
                Mayya's Residency
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Cloud 9 Family Restaurant
              </span>
            </span>
          </Link>

         
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* HERO */}
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white px-6 py-9 shadow-sm sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 -z-10 h-64 w-64 rounded-full bg-pink-100/70 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-800">
              <ShieldCheck className="h-4 w-4" />
              Your privacy matters
            </div>

            <h1 className="text-4xl font-black leading-[1.08] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
              Privacy Policy
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                & Terms of Service
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Clear information about how we handle your information, how
              QR-code ordering works, and the terms that apply when you use
              our restaurant's digital services.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Privacy & terms
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Last updated: {lastUpdated}
              </span>
            </div>

            <p className="mt-5 max-w-2xl text-xs leading-6 text-slate-500">
              Please read these terms carefully. This page is a general
              customer-facing policy template and should be reviewed against
              our actual data practices and applicable law before publication.
            </p>
          </div>
        </div>

        {/* QUICK SUMMARY */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard icon={LockKeyhole} title="Privacy first">
            We aim to use customer information only for legitimate restaurant
            and service purposes.
          </InfoCard>
          <InfoCard icon={ShoppingBag} title="QR ordering">
            Your table and order details help us send the correct order to our
            team.
          </InfoCard>
          <InfoCard icon={Gift} title="Optional rewards">
            Joining loyalty rewards is optional and requires a separate
            affirmative action.
          </InfoCard>
          <InfoCard icon={ShieldCheck} title="Your choices">
            You can ask us about your information, marketing preferences, or
            loyalty membership.
          </InfoCard>
        </div>

        {/* PAGE CONTENT */}
        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
          {/* TABLE OF CONTENTS */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setShowContents((value) => !value)}
                className="flex w-full items-center justify-between p-4 text-left lg:cursor-default"
                aria-expanded={showContents}
              >
                <span className="text-sm font-black text-slate-900">
                  On this page
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition lg:hidden ${
                    showContents ? "rotate-180" : ""
                  }`}
                />
              </button>

              <nav
                className={`border-t border-slate-100 p-2 ${
                  showContents ? "block" : "hidden lg:block"
                }`}
                aria-label="Policy sections"
              >
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => goToSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-800"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`w-5 shrink-0 text-[10px] font-black ${
                        activeSection === section.id
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    >
                      {section.number}
                    </span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <ShieldCheck className="h-5 w-5 text-blue-700" />
              <p className="mt-3 text-sm font-bold text-slate-900">
                Have a question?
              </p>
              <p className="mt-1 text-xs leading-6 text-slate-600">
                Contact our team if you need clarification about these policies
                or want to make a privacy request.
              </p>
              <a
                href="tel:8088402173"
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                <Phone className="h-3.5 w-3.5" />
                80884 02173
              </a>
            </div>
          </aside>

          {/* POLICY BODY */}
          <article className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white px-5 py-2 shadow-sm sm:px-8 lg:px-10">
            <PolicySection id="overview">
              <SectionHeading
                number="01"
                title="Overview"
                subtitle="Who we are and when this policy applies"
              />
              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  This policy applies to the digital menu, QR-code ordering,
                  customer forms, and loyalty features operated for
                  <strong className="text-slate-900">
                    {" "}Mayya's Residency / Cloud 9 Family Restaurant
                  </strong>
                  , located in Shivamogga, Karnataka, India ("Restaurant",
                  "we", "us", or "our").
                </p>
                <p>
                  By browsing our digital menu, you can view available
                  offerings. Placing an order means you are requesting the
                  selected items subject to availability and confirmation.
                  Joining our loyalty program is optional.
                </p>
                <p>
                  This policy describes our intended practices. Details about
                  actual data collection, storage, service providers, retention
                  periods, and legal rights must reflect how the deployed
                  website and restaurant systems really operate.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="privacy">
              <SectionHeading
                number="02"
                title="Privacy Policy"
                subtitle="How we approach your personal information"
              />
              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  We aim to collect only information that is reasonably
                  necessary to operate our digital ordering and customer
                  services. We use it for clearly described purposes, take
                  reasonable steps to protect it, and limit access to people
                  and service providers who need it.
                </p>
                <p>
                  We do not intend to sell customer personal information.
                  Information may be processed by service providers needed to
                  operate the website, database, communications, or payment
                  services, subject to the arrangements that apply to those
                  providers.
                </p>
                <p>
                  Please do not enter payment-card details, government ID
                  numbers, passwords, or other highly sensitive information
                  into general customer or feedback fields.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="data">
              <SectionHeading
                number="03"
                title="Information We Collect"
                subtitle="Information may vary depending on the feature you use"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard icon={ShoppingBag} title="Order information">
                  Selected menu items, quantities, item prices, order totals,
                  order status, table reference, and order timestamps.
                </InfoCard>
                <InfoCard icon={Phone} title="Contact information">
                  Name and phone number when you choose to provide them for
                  loyalty registration or another stated customer-service
                  purpose.
                </InfoCard>
                <InfoCard icon={Gift} title="Loyalty information">
                  Membership details, points, eligible purchase totals, and
                  reward-related activity where the loyalty feature records
                  those details.
                </InfoCard>
                <InfoCard icon={Database} title="Technical information">
                  Limited technical information may be processed by the
                  website, hosting provider, database, or security tools to
                  maintain reliability and help diagnose problems.
                </InfoCard>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                We do not claim to collect every category listed above in every
                visit. The information actually processed depends on your
                actions and the technical configuration of the website and its
                service providers.
              </p>
            </PolicySection>

            <PolicySection id="usage">
              <SectionHeading
                number="04"
                title="How We Use Information"
                subtitle="Purpose-limited use of customer data"
              />

              <ul className="space-y-3 text-sm leading-7 text-slate-600">
                {[
                  "Display the digital menu and associate an order with the correct restaurant and table.",
                  "Receive, prepare, manage, and fulfil orders, including communicating with you about an order when necessary.",
                  "Maintain order records, investigate reported problems, and respond to customer-service requests.",
                  "Administer loyalty membership and calculate points or rewards where applicable.",
                  "Maintain website security, prevent abuse, and troubleshoot technical issues.",
                  "Meet applicable legal, accounting, tax, and regulatory obligations.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50/60 p-4 text-sm leading-7 text-slate-700">
                <strong className="text-slate-900">
                  Marketing is different from service messages.
                </strong>{" "}
                Order-related communications may be necessary to fulfil your
                request. Promotional messages should be sent only where a
                valid legal basis and any required consent or preference
                requirements are satisfied.
              </div>
            </PolicySection>

            <PolicySection id="sharing">
              <SectionHeading
                number="05"
                title="Sharing & Security"
                subtitle="When information may be disclosed"
              />

              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  Information may be accessible to authorised restaurant staff
                  who need it to manage orders and provide customer service. It
                  may also be processed by technical providers supporting
                  hosting, database operations, security, or communications.
                </p>
                <p>
                  We may disclose information when reasonably necessary to
                  comply with law, respond to lawful requests, protect people
                  and property, investigate fraud, or enforce applicable
                  terms.
                </p>
                <p>
                  We aim to use reasonable technical and organisational
                  safeguards. However, no website, network, or storage system
                  can be guaranteed completely secure. Access controls, database
                  permissions, and retention settings should be configured
                  appropriately for the deployed system.
                </p>
                <p>
                  We do not publish your phone number or name as public
                  restaurant-menu information. Do not assume that every field
                  in a QR-ordering system is private unless the underlying
                  database policies and access controls have been correctly
                  configured.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="cookies">
              <SectionHeading
                number="06"
                title="Cookies & Similar Technologies"
                subtitle="Website functionality and technical storage"
              />
              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  Our website and its service providers may use browser storage,
                  cookies, or similar technologies where needed for
                  functionality, security, session handling, preferences, or
                  performance.
                </p>
                <p>
                  The technologies used depend on the current implementation.
                  We do not represent that analytics or advertising cookies
                  are used unless they are actually enabled. If optional
                  tracking technologies are introduced, appropriate notices
                  and choices should be provided where required.
                </p>
                <p>
                  Disabling certain browser features may affect the operation
                  of the digital menu or ordering flow.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="loyalty">
              <SectionHeading
                number="07"
                title="Loyalty Rewards"
                subtitle="Voluntary membership and reward conditions"
              />
              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  Loyalty membership is optional. You may place an order
                  without joining the loyalty program. If you choose to join,
                  we may ask for your name and phone number to identify your
                  membership and administer rewards.
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong className="text-slate-900">Membership:</strong>{" "}
                    You must provide accurate information and use a phone
                    number you are authorised to use.
                  </li>
                  <li>
                    <strong className="text-slate-900">Points:</strong>{" "}
                    Earning, expiry, redemption, exclusions, and eligible
                    purchases are governed by the reward rules communicated by
                    the Restaurant. Do not assume a specific conversion rate
                  unless it has been expressly published.
                  </li>
                  <li>
                    <strong className="text-slate-900">Offers:</strong>{" "}
                    Rewards may be subject to availability, eligibility,
                    expiry, and stated offer conditions.
                  </li>
                  <li>
                    <strong className="text-slate-900">No guaranteed value:</strong>{" "}
                    Points are not cash and cannot be exchanged for money
                    unless a specific published reward says otherwise.
                  </li>
                  <li>
                    <strong className="text-slate-900">Changes:</strong>{" "}
                    We may update a loyalty program's rules where necessary,
                    subject to applicable law and any rights already accrued.
                  </li>
                </ul>
                <p>
                  Consent to loyalty registration should not automatically be
                  treated as consent to unrelated promotional messaging.
                  Where required, marketing permission should be requested
                  separately and can be withdrawn.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="terms">
              <SectionHeading
                number="08"
                title="Terms of Service"
                subtitle="Rules for using our digital services"
              />

              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  By using our digital menu and ordering features, you agree to
                  use them lawfully and not to interfere with the service,
                  attempt unauthorised access, submit fraudulent orders, or
                  misuse another person's information.
                </p>
                <p>
                  Menu descriptions, photographs, prices, availability, and
                  promotional offers may change. Images are illustrative where
                  applicable. We aim to keep information accurate, but a
                  listing may occasionally be outdated or unavailable.
                </p>
                <p>
                  Submitting an order is a request to purchase the selected
                  items. The Restaurant may need to verify availability,
                  clarify an order, or contact you about an issue. Any
                  applicable acceptance or confirmation is subject to the
                  actual ordering process and law.
                </p>
                <p>
                  We may temporarily suspend digital ordering for maintenance,
                  operational reasons, security, or circumstances outside our
                  reasonable control.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="orders">
              <SectionHeading
                number="09"
                title="Orders, Prices & Payments"
                subtitle="What to know before submitting an order"
              />

              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  Review your cart, quantities, applicable charges, and total
                  before placing an order. The order confirmation shown by the
                  system should be checked for accuracy.
                </p>
                <p>
                  Prices and applicable taxes or fees should be displayed or
                  communicated as required. Where a tax amount is shown, its
                  calculation and whether it is included in the displayed
                  total depend on the actual billing configuration.
                </p>
                <p>
                  Payment methods, payment processing, receipts, and
                  settlement depend on the options made available by the
                  Restaurant. If an external payment provider is used, its
                  terms and privacy practices may also apply.
                </p>
                <p>
                  Never send card PINs, one-time passwords, passwords, or
                  banking credentials to restaurant staff through the menu,
                  phone, or messaging channels.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="cancellations">
              <SectionHeading
                number="10"
                title="Cancellations, Refunds & Complaints"
                subtitle="How to raise an order issue"
              />

              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  If you need to correct or cancel an order, contact the
                  Restaurant promptly. Once preparation has begun, changes or
                  cancellation may not always be possible.
                </p>
                <p>
                  Refund eligibility depends on the circumstances, the payment
                  method, the status of the order, and applicable law. If an
                  order is incorrect, incomplete, duplicated, or charged
                  incorrectly, please contact us with the order details so we
                  can investigate.
                </p>
                <p>
                  This page does not create a blanket no-refund rule or
                  override any rights available to you under applicable law.
                  Specific cancellation windows, refund timelines, and
                  escalation procedures should be published once confirmed by
                  the Restaurant.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="responsibility">
              <SectionHeading
                number="11"
                title="Customer Responsibilities"
                subtitle="Help us serve you correctly"
              />

              <ul className="space-y-3 text-sm leading-7 text-slate-600">
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  Check the table identified by the QR code before submitting
                  your order.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  Review quantities, item selections, and totals before
                  confirming.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  Provide accurate contact details if you choose to share
                  them.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  Do not attempt to access, alter, or interfere with another
                  customer's order or account.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  Inform restaurant staff about relevant food allergies or
                  dietary requirements before ordering. Do not rely solely on
                  online descriptions for allergen safety.
                </li>
              </ul>
            </PolicySection>

            <PolicySection id="rights">
              <SectionHeading
                number="12"
                title="Your Privacy Choices & Rights"
                subtitle="Requests about your personal information"
              />

              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  Depending on applicable law, you may have rights to request
                  access to, correction of, or deletion of certain personal
                  information, withdraw consent where processing is based on
                  consent, or raise a concern about how your information is
                  handled.
                </p>
                <p>
                  You may ask us to stop optional promotional communications.
                  If you are a loyalty member, you may also request help with
                  your membership or ask about the information associated with
                  it.
                </p>
                <p>
                  We may need to verify your identity before acting on a
                  request. Some information may need to be retained to fulfil
                  orders, resolve disputes, meet legal obligations, or
                  establish or defend legal claims.
                </p>
                <p>
                  We aim to respond within the period required by applicable
                  law. Contact details for any formally designated privacy
                  contact or grievance officer should be added here if one is
                  appointed or required.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="contact">
              <SectionHeading
                number="13"
                title="Contact Us"
                subtitle="Questions, privacy requests, and order concerns"
              />

              <p className="mb-5 text-sm leading-7 text-slate-600">
                For questions about these terms, a loyalty membership, or an
                order, contact the Restaurant using the details below.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-slate-900">
                    Restaurant address
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Mayya's Residency / Cloud 9 Family Restaurant
                    <br />
                    NH 169, NT Rd, near Water Works
                    <br />
                    Mandli, Harakere, Veera Pura
                    <br />
                    Shivamogga, Karnataka 577202, India
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-slate-900">
                    Phone support
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Contact us for order questions, corrections, privacy
                    requests, or loyalty membership support.
                  </p>
                  <a
                    href="tel:8088402173"
                    className="mt-3 inline-flex items-center gap-2 font-bold text-blue-700 hover:text-blue-900"
                  >
                    80884 02173
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                An official privacy email address has not been provided for
                this page, so none has been invented. Add a monitored business
                email if you want customers to submit written privacy requests.
              </p>
            </PolicySection>

            {/* LEGAL NOTICE */}
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <h3 className="font-bold text-amber-950">
                    Before publishing this page
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-amber-900/90">
                    This template is not a legal opinion. Verify that it
                    matches your actual database, Supabase access policies,
                    order RPCs, hosting, analytics, payment providers, loyalty
                    rules, retention practices, and complaint process. Have
                    an appropriate legal professional review it for the laws
                    applicable to your business, including India's data
                    protection requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <footer className="border-t border-slate-100 py-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Mayya's Residency · Cloud 9
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Privacy, trust, and a better dining experience.
                  </p>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 sm:self-auto"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  Return to menu
                </Link>
              </div>

              <p className="mt-5 text-[11px] leading-5 text-slate-400">
                © {new Date().getFullYear()} Mayya's Residency / Cloud 9
                Family Restaurant. All rights reserved.
              </p>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
}
