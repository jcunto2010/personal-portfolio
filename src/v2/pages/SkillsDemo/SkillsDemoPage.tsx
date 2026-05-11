import { IntegrationHero } from '../../../components/ui/integration-hero'

export default function SkillsDemoPage() {
  return (
    <div className="min-h-screen bg-[#070B1A]">
      <IntegrationHero
        title="Technologies I Use"
        description="Modern stack for building high-impact digital products with performance and scalability in mind."
      />

      {/* Comparison note */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-[#B8C0D9] text-sm">
          This is the IntegrationHero skills block used on the classic-mode page.
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <a
            href="/classic-mode"
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Back to Classic Mode
          </a>
        </div>
      </div>
    </div>
  )
}
