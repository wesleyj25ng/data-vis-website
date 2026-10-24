export function SectionHeader({ index, title, kicker }: { index: string; title: string; kicker: string }) {
  return <div className="mb-8 flex gap-5 md:mb-12"><span className="display text-4xl text-[#137cbe]">{index}</span><div><p className="eyebrow mb-2 text-[#137cbe]">{kicker}</p><h2 className="display max-w-3xl text-4xl leading-[.96] md:text-6xl">{title}</h2></div></div>;
}
