import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16">
        <Features />
      </div>
    </main>
  )
}