const steps = [
  {
    n: "01",
    title: "Choose corridor & amount",
    body: "Select NGN→GHS, GHS→XOF, XOF→GHS, or NGN→XOF and enter what you want to send.",
  },
  {
    n: "02",
    title: "See ranked all-in paths",
    body: "ClearSend scores amount out, fee, FX vs mid, and speed — then marks a recommended path.",
  },
  {
    n: "03",
    title: "Soft handoff to MoMo",
    body: "MoMo-compatible paths offer a receive CTA. ClearSend does not hold or settle funds.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Quote clarity, then MoMo receive
          </h2>
          <p className="mt-3 text-slate-600">
            Built for a MoMo Fintech Labs narrative: transparency first,
            PAPSS-aligned clearing intent, and a soft handoff — never custody.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="text-xs font-bold tracking-widest text-teal-600">
                {s.n}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50/70 p-5 sm:p-6">
          <h3 className="font-semibold text-teal-950">PAPSS-aligned — not live PAPSS</h3>
          <p className="mt-2 text-sm leading-relaxed text-teal-900/80">
            ClearSend&apos;s product story aligns with regional settlement
            (PAPSS-style) and MoMo receive rails. Quotes use an estimated fee
            and FX model until a live market feed is connected. ClearSend does{" "}
            <strong>not</strong> claim live PAPSS connectivity and never holds
            customer funds. MoMo payouts follow the configured provider.
          </p>
        </div>
      </div>
    </section>
  );
}
