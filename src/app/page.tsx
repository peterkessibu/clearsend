import { Disclaimer } from "@/components/Disclaimer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ProblemSolution } from "@/components/ProblemSolution";
import { QuotePanel } from "@/components/QuotePanel";

export default function Home() {
  return (
    <div id="top" className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <QuotePanel />
        <HowItWorks />
        <Disclaimer />
      </main>
      <Footer />
    </div>
  );
}
