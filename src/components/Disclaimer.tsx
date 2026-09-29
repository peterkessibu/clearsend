export function Disclaimer() {
  return (
    <section id="disclaimer" className="scroll-mt-20 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Important notice
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
            <li>
              • Quotes are <strong>estimated all-in amounts</strong> from the
              ClearSend quote model until a live FX feed is connected. They are
              not a binding offer or investment advice.
            </li>
            <li>
              • ClearSend does <strong>not</strong> claim live PAPSS
              connectivity. Product narratives are PAPSS-aligned only.
            </li>
            <li>
              • ClearSend does <strong>not hold funds</strong>. MoMo payouts use
              the configured provider (sandbox mock until production keys and{" "}
              <code className="rounded bg-slate-200 px-1 text-xs">
                MOMO_TARGET_ENV=production
              </code>
              ).
            </li>
            <li>
              • Corridors shown (NGN, GHS, CFA/XOF) support West Africa MoMo
              receive flows.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
