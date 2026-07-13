import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-8 md:p-10 lg:p-12 min-h-[340px]">
      {/* Background Decorations */}
      <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-green-200/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col justify-between lg:flex-row lg:items-center gap-10">
        {/* Left Content */}
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
            ✨ AI Learning Companion
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight text-neutral-900 md:text-5xl">
            Build your next
            <span className="block text-emerald-600">
              learning companion
            </span>
          </h2>

          <p className="mt-5 max-w-lg text-lg leading-8 text-neutral-600">
            Create personalized companions that guide students through
            lessons, answer questions, generate quizzes, and make learning
            interactive.
          </p>

          <div className="mt-8">
            <Link
              href="/companions/new"
              className="inline-flex items-center gap-3 rounded-2xl bg-black px-7 py-4 text-base font-semibold text-white transition-all hover:scale-[1.02] hover:bg-neutral-800"
            >
              <Plus className="h-5 w-5" />
              Build New Companion
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="grid grid-cols-2 gap-5 relative z-10">
          {[
            "/calculator.svg",
            "/chat-quote.svg",
            "/flask-fill.svg",
            "/journals.svg",
          ].map((icon, index) => (
            <div
              key={index}
              className="group flex h-28 w-28 m items-center justify-center rounded-3xl border border-white/60 bg-white/70 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:rotate-3 hover:shadow-2xl"
            >
              <Image
                src={icon}
                alt=""
                width={52}
                height={52}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTA;