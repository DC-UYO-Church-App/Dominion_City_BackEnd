import { TypewriterText } from "@/components/typewriter-text"

export default function Home() {
  return (
    <section
      className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/dark.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex h-full w-full flex-col">
        <header className="flex w-full items-center justify-between px-4 py-4 text-white sm:px-10 sm:py-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Dominion City" className="h-10 w-auto sm:h-12" />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.25em] sm:inline">
              Dominion City
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
            <a
              href="/welcome"
              className="rounded-full border border-white/60 px-4 py-2 text-white/90 transition hover:border-white hover:text-white sm:px-5"
            >
              Login
            </a>
            <a
              href="/register"
              className="rounded-full bg-white px-4 py-2 text-black transition hover:bg-white/90 sm:px-5"
            >
              Register
            </a>
          </div>
        </header>
        <div className="flex h-full w-full items-center justify-center px-6">
          <div className="max-w-2xl text-center text-white">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">
              Dominion City
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              <TypewriterText text="One story. One space. One horizon." />
            </h1>
            <p className="mt-4 text-sm text-white/80 sm:text-base">
              A single, immersive section built to fill the entire viewport.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
