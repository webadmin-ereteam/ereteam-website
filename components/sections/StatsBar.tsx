const stats = [
  ["2001", "Founded"],
  ["80+", "Professionals"],
  ["100+", "Enterprise clients"],
  ["17", "Countries served"],
];

export default function StatsBar() {
  return (
    <section className="border-b border-[#071A2A]/15 bg-[#f3f0e8]">
      <div className="site-container grid grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="col-span-2 flex items-center border-b border-[#071A2A]/15 py-7 lg:col-span-1 lg:border-b-0 lg:border-r lg:pr-8">
          <p className="text-xs font-semibold uppercase leading-6 tracking-[.13em] text-brand-dark">A quarter century of<br />enterprise delivery</p>
        </div>
        {stats.map(([value, label]) => (
          <div key={label} className="border-b border-r border-[#071A2A]/15 px-4 py-7 last:border-r-0 lg:border-b-0 lg:px-7">
            <strong className="site-display block text-3xl text-brand-dark sm:text-4xl">{value}</strong>
            <span className="mt-2 block text-[10px] font-bold uppercase tracking-[.12em] text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
