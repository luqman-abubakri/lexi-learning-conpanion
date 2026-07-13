import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";

const icons = [
  "/calculator.svg",
  "/chat-quote.svg",
  "/flask-fill.svg",
  "/journals.svg",
];

const CTA = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-6 py-10 md:px-10 md:py-12 lg:px-14">
      {/* Background Glow */}
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-green-200/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}
        <div className="max-w-xl flex-1">
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
            ✨ AI Learning Companion
          </span>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-neutral-900 lg:text-5xl">
            Build your next
            <span className="block text-emerald-600">
              learning companion
            </span>
          </h2>

          <p className="mt-5 text-lg leading-8 text-neutral-600">
            Create AI companions that teach, answer questions,
            generate quizzes, and provide engaging voice-based
            learning experiences.
          </p>

          <Link
            href="/companions/new"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-black px-6 py-4 font-semibold text-white transition hover:scale-105 hover:bg-neutral-900"
          >
            <Plus size={20} />
            Build Companion
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Right */}
        <div className="flex flex-1 justify-center">
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {icons.map((icon, index) => (
              <div
                key={index}
                className="group flex aspect-square w-24 items-center justify-center rounded-3xl border border-white/60 bg-white/70 shadow-xl backdrop-blur transition duration-300 hover:-translate-y-2 hover:rotate-3 hover:shadow-2xl sm:w-28 md:w-32"
              >
                <Image
                  src={icon}
                  alt=""
                  width={60}
                  height={60}
                  className="w-10 transition duration-300 group-hover:scale-110 sm:w-12 md:w-14"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CTA;