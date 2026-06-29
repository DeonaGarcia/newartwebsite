import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Deona Hawaii for commissions, prints, or inquiries.",
};

export default function ContactPage() {
  return (
    <section className="py-28 px-6 bg-sand-light">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-ocean mb-3">
            Get in Touch
          </p>
          <h1 className="font-heading text-5xl font-light text-ocean-deep mb-4">
            Contact
          </h1>
          <p className="font-body text-driftwood leading-relaxed">
            For commissions, print inquiries, or collaborations.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block font-body text-xs font-semibold uppercase tracking-wider text-driftwood mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 bg-pearl border border-border font-body text-sm text-slate focus:border-ocean focus:ring-1 focus:ring-ocean outline-none transition-colors duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block font-body text-xs font-semibold uppercase tracking-wider text-driftwood mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 bg-pearl border border-border font-body text-sm text-slate focus:border-ocean focus:ring-1 focus:ring-ocean outline-none transition-colors duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block font-body text-xs font-semibold uppercase tracking-wider text-driftwood mb-2"
            >
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              className="w-full px-4 py-3 bg-pearl border border-border font-body text-sm text-slate focus:border-ocean focus:ring-1 focus:ring-ocean outline-none transition-colors duration-200 cursor-pointer"
            >
              <option>Commission Inquiry</option>
              <option>Print Purchase</option>
              <option>Collaboration</option>
              <option>General Question</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block font-body text-xs font-semibold uppercase tracking-wider text-driftwood mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              required
              className="w-full px-4 py-3 bg-pearl border border-border font-body text-sm text-slate focus:border-ocean focus:ring-1 focus:ring-ocean outline-none transition-colors duration-200 resize-vertical"
            />
          </div>

          <button
            type="submit"
            className="w-full font-body text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 bg-ocean-deep text-pearl hover:bg-turquoise-deep transition-colors duration-200 cursor-pointer"
          >
            Send Message
          </button>
        </form>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="font-body text-xs text-driftwood-light uppercase tracking-wider mb-2">
            Or reach out directly
          </p>
          <a
            href="mailto:deonagarcia@yahoo.com"
            className="font-body text-sm text-ocean hover:text-ocean-deep transition-colors duration-200 cursor-pointer"
          >
            deonagarcia@yahoo.com
          </a>
        </div>
      </div>
    </section>
  );
}
