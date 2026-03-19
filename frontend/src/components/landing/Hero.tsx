import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="text-center items-center justify-center py-16 px-4 flex flex-col w-full h-screen">
      <h1 className="font-cinzel font-black tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight">
        Scholar<span className="text-gray-800 font-light">Sync</span>
      </h1>

      <p className="mt-4 text-sm sm:text-base md:text-lg font-cinzel text-gray-800">
        <span className="font-bold">Smarter</span> Search | <span className="font-bold">Simpler</span> Applications
      </p>

      <div className="mt-6">
        <Link href="/auth/register">
          <Button className="text-sm sm:text-base px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white shadow-md">
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  )
}