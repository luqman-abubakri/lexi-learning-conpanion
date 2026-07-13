import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-8 py-10 md:px-10 lg:px-14 lg:py-12">

      {/* Decorative Blobs */}
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-green-200/20 blur-3xl" />

      <div className="relative z-10 flex flex-col-reverse items-center gap-12 lg:flex-row lg:justify-between">

        {/* Left */}
        <div className="max-w-xl">
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            ✨ AI Learning Companion
          </span>

          <h2 className="mt-5 text-4xl font-bold leading-tight text-neutral-900 lg:text-5xl">
            Build your next
            <span className="block text-emerald-600">
              learning companion
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-neutral-600">
            Design AI companions that teach, answer questions, generate
            quizzes, and deliver engaging voice-powered learning experiences.
          </p>

          <Link
            href="/companions/new"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-black px-6 py-4 font-semibold text-white transition hover:-translate-y-1 hover:bg-neutral-900"
          >
            <Plus size={20} />
            Build Companion
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Right */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur">
            <Image
              src="/chat-quote.svg"
              alt="AI Companion"
              width={220}
              height={220}
              className="animate-float"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default CTA;