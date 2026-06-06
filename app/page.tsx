import { Navbar }             from '@/components/landing/Navbar'
import { HeroSection }        from '@/components/landing/HeroSection'
import { ProblemSection }     from '@/components/landing/ProblemSection'
import { SolutionSection }    from '@/components/landing/SolutionSection'
import { HowItWorksSection }  from '@/components/landing/HowItWorksSection'
import { DemoSection }        from '@/components/landing/DemoSection'
import { FeaturesSection }    from '@/components/landing/FeaturesSection'
import { ImpactSection }      from '@/components/landing/ImpactSection'
import { ComparisonSection }  from '@/components/landing/ComparisonSection'
import { FutureVisionSection }from '@/components/landing/FutureVisionSection'
import { CtaBanner }          from '@/components/landing/CtaBanner'
import { Footer }             from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif', color: '#0f172a', background: '#fff' }}>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <DemoSection />
      <FeaturesSection />
      <ImpactSection />
      <ComparisonSection />
      <FutureVisionSection />
      <CtaBanner />
      <Footer />
    </div>
  )
}
