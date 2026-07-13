"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { Navlink } from "../libs/type";

type MobileMenuProps = {
  links: Navlink[];
};

const MobileMenu = ({ links }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg p-2 transition hover:bg-emerald-50"
        aria-label="Toggle menu"
      >
        {open ? (
          <X className="h-6 w-6 text-gray-800" />
        ) : (
          <Menu className="h-6 w-6 text-gray-800" />
        )}
      </button>

      <div
        className={`absolute left-0 top-20 w-full overflow-hidden border-t border-emerald-100 bg-white shadow-lg transition-all duration-300 ${
          open
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col px-6 py-5">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-gray-600 transition hover:bg-emerald-50 hover:text-emerald-600"
            >
              {link.name}
            </Link>
          ))}

          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-xl border border-emerald-200 px-4 py-3 text-center font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  onClick={() => setOpen(false)}
                  className="mt-3 rounded-xl bg-emerald-600 px-4 py-3 text-center font-medium text-white transition hover:bg-emerald-700"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </>
          ) : (
            <div className="mt-4 flex justify-start">
              <UserButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;