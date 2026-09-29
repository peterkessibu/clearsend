export function Disclaimer() {
  return (
    <section id="disclaimer" className="scroll-mt-20 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              DEMO
            </span>
            <h2 className="text-xl font-bold text-amber-950">
              Disclaimer & demo limits
            </h2>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-amber-950/90">
            <li>
              • Quotes are <strong>illustrative DEMO data</strong>, clearly
              timestamped. They are not live FX, not a binding offer, and not
              investment or payment advice.
            </li>
            <li>
              • ClearSend does <strong>not</strong> claim live PAPSS
              connectivity in this build. Narratives are PAPSS-aligned only.
            </li>
            <li>
              • ClearSend does <strong>not hold funds</strong>. MoMo CTAs are a
              soft handoff simulation for pitch / product demo purposes.
            </li>
            <li>
              • Corridors shown (NGN, GHS, CFA/XOF) are for West Africa product
              exploration with MoMo Fintech Labs stakeholders.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
