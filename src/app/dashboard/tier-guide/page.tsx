import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PROGRAM_TIERS } from '@/lib/codeseoul/tier-program';
import { zhTW, t } from '@/messages/kol/zh-TW';

export default function TierGuidePage() {
  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        {zhTW.backToList}
      </Link>
      <h1 className="text-2xl font-bold mb-2 font-mono tracking-wider">
        {zhTW.tierGuide}
      </h1>
      <p className="text-white/60 text-sm mb-8 font-mono">
        {zhTW.tierGuideDesc}
      </p>

      <div className="space-y-8 max-w-2xl">
        <section className="rounded border border-white/10 bg-white/5 p-6">
          <h2 className="font-mono font-bold text-white mb-4">{zhTW.tierOverview}</h2>
          <p className="text-white/90 text-sm font-mono leading-relaxed">
            {zhTW.tierOverviewText}
          </p>
        </section>

        <section className="rounded border border-white/10 bg-white/5 p-6">
          <h2 className="font-mono font-bold text-white mb-4">{zhTW.tierStructure}</h2>
          <p className="text-white/70 text-sm font-mono mb-4">
            {zhTW.tierStructureText}
          </p>
          <div className="space-y-2">
            {PROGRAM_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center justify-between rounded border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm"
              >
                <span className="font-bold text-[#FF0000]">{tier.id}</span>
                <span className="text-white/70">
                  {t('tierPeople', { n: tier.min.toLocaleString() })}
                  {tier.max === Infinity ? zhTW.tierAndAbove : ` ~ ${t('tierPeople', { n: tier.max.toLocaleString() })}`}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded border border-white/10 bg-white/5 p-6">
          <h2 className="font-mono font-bold text-white mb-4">{zhTW.tierUpgradeMethod}</h2>
          <ol className="list-decimal list-inside space-y-2 text-white/90 text-sm font-mono">
            <li>{zhTW.tierUpgradeStep1}</li>
            <li>{zhTW.tierUpgradeStep2}</li>
            <li>{zhTW.tierUpgradeStep3}</li>
            <li>{zhTW.tierUpgradeStep4}</li>
          </ol>
        </section>

        <section className="rounded border border-white/10 bg-white/5 p-6">
          <h2 className="font-mono font-bold text-white mb-4">{zhTW.tierNotes}</h2>
          <ul className="space-y-2 text-white/70 text-sm font-mono list-disc list-inside">
            <li>{zhTW.tierNote1}</li>
            <li>{zhTW.tierNote2}</li>
            <li>{zhTW.tierNote3}</li>
          </ul>
        </section>

        <div className="pt-4">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-[#FF0000] hover:underline font-mono text-sm"
          >
            {zhTW.goToProfileForUpgrade}
          </Link>
        </div>
      </div>
    </div>
  );
}
