"use client";

import { useState } from "react";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage("You're on the list — welcome aboard.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="py-16 px-6 bg-ocean-deep">
      <div className="max-w-xl mx-auto text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-turquoise mb-3">
          Collector Access
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-light text-pearl mb-3">
          Be the First to See New Work
        </h2>
        <p className="font-body text-pearl/70 mb-6">
          New paintings, spoken for before they hit the wall. No spam, just the good stuff.
        </p>
        {status === "success" ? (
          <p className="text-turquoise font-body">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="px-4 py-3 bg-pearl text-ocean-deep font-body text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-turquoise"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-turquoise text-ocean-deep font-body text-sm uppercase tracking-wider hover:bg-turquoise-deep transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Joining..." : "Join the List"}
            </button>
          </form>
        )}
        {status === "error" && <p className="text-coral text-sm mt-3">{message}</p>}
      </div>
    </section>
  );
}

