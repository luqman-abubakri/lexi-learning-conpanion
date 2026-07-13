import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Navlink } from "../libs/type";
import MobileMenu from "./MobileMenu";

const Navbar = async () => {
  const { userId } = await auth();
  const links: Navlink[] = [
    { name: "Home", href: "/" },
    { name: "Companions", href: "/companions" },
    { name: "My journey", href: "/my-journey" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-emerald-100/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Lexi logo"
            width={42}
            height={42}
            className="rounded-xl"
          />

          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Lexi
            </h1>
            <p className="-mt-1 text-xs text-emerald-600">
              AI Study Companion
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative text-sm font-medium text-gray-600 transition duration-200 hover:text-emerald-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {!userId ? (
            <>
              <SignInButton mode="modal">
                <button className="rounded-xl border border-emerald-200 px-5 py-2.5 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          ) : (
            <UserButton />
          )}
        </div>

        <MobileMenu links={links} />
      </div>
    </nav>
  );
};

export default Navbar;