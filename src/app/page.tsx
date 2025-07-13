"use client";
import RotatingText from "@/components/general/rotating-text";
import {
  Crown,
  PiggyBank,
  Sprout,
  Search,
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="w-full min-h-screen flex flex-col bg-[hsl(var(--background))]">
      {/* Navbar */}
      <nav className="w-full h-20 flex items-center justify-between px-6 md:px-10 bg-[hsl(var(--card))]/80 shadow-sm z-10">
        {/* Left: Logo and Links */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <div className="grid place-items-center text-lg font-semibold bg-[hsl(var(--foreground))] text-[hsl(var(--primary))] h-10 w-14 rounded mr-2">
            ENO
          </div>
          {/* Links (hidden on mobile) */}
          <div className="hidden md:flex gap-5">
            <Link
              href="/"
              className="text-lg font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition cursor-pointer rounded-lg h-12 flex items-center px-4"
            >
              Home
            </Link>
            <Link
              href="/news"
              className="text-lg font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition cursor-pointer rounded-lg h-12 flex items-center px-4"
            >
              News
            </Link>
            <Link
              href="/savings-plan"
              className="text-lg font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition cursor-pointer rounded-lg h-12 flex items-center px-4"
            >
              Savings plan
            </Link>
            <Link
              href="/about"
              className="text-lg font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition cursor-pointer rounded-lg h-12 flex items-center px-4"
            >
              About
            </Link>
            <Link
              href="/contact-us"
              className="text-lg font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition cursor-pointer rounded-lg h-12 flex items-center px-4"
            >
              Contact us
            </Link>
          </div>
        </div>
        {/* Auth and Hamburger */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-4">
            <Link
              href="/login"
              className="font-medium text-[hsl(var(--primary))] text-lg h-12 w-28 rounded bg-transparent border-none transition cursor-pointer hover:bg-[hsl(var(--card))] hover:text-[hsl(var(--primary-foreground))] flex items-center justify-center"
            >
              Login
            </Link>
          </div>
          {/* Hamburger (visible on mobile) */}
          <div className="md:hidden flex items-center">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button aria-label="Open menu">
                  <Menu className="w-8 h-8 text-[hsl(var(--primary))]" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-[hsl(var(--card))]">
                <VisuallyHidden asChild>
                  <SheetTitle>Main navigation</SheetTitle>
                </VisuallyHidden>
                <nav className="flex flex-col gap-2 p-6">
                  <Link
                    href="/"
                    onClick={() => setSidebarOpen(false)}
                    className="text-lg font-medium text-[hsl(var(--primary))] py-3 px-2 rounded hover:bg-[hsl(var(--primary))]/10"
                  >
                    Home
                  </Link>
                  <Link
                    href="/news"
                    onClick={() => setSidebarOpen(false)}
                    className="text-lg font-medium text-[hsl(var(--primary))] py-3 px-2 rounded hover:bg-[hsl(var(--primary))]/10"
                  >
                    News
                  </Link>
                  <Link
                    href="/savings-plan"
                    onClick={() => setSidebarOpen(false)}
                    className="text-lg font-medium text-[hsl(var(--primary))] py-3 px-2 rounded hover:bg-[hsl(var(--primary))]/10"
                  >
                    Savings plan
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setSidebarOpen(false)}
                    className="text-lg font-medium text-[hsl(var(--primary))] py-3 px-2 rounded hover:bg-[hsl(var(--primary))]/10"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact-us"
                    onClick={() => setSidebarOpen(false)}
                    className="text-lg font-medium text-[hsl(var(--primary))] py-3 px-2 rounded hover:bg-[hsl(var(--primary))]/10"
                  >
                    Contact us
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="text-lg font-medium text-[hsl(var(--primary))] py-3 px-2 rounded hover:bg-[hsl(var(--primary))]/10"
                  >
                    Login
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Top Section */}
      <div className="flex flex-1 flex-col-reverse lg:flex-row items-center justify-between px-8 lg:px-16 py-8 gap-8 lg:gap-0">
        {/* Info Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6">
          {/* Reward Banner */}
          <div className="flex justify-center lg:justify-start">
            <p className="text-[hsl(var(--primary))] text-base font-semibold bg-[hsl(var(--card))]/70 rounded-lg shadow px-4 py-2 mt-4 mb-2 text-center w-fit">
              Reward available for new users
            </p>
          </div>
          {/* Animated Text */}

          <div className="text-left lg:text-left">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-2">
              Harness the Power of
              <RotatingText
                texts={[
                  "Saving & Investing",
                  "Thrift & Growth",
                  "Storing",
                  "Developing",
                  "Saving & Investing",
                ]}
                mainClassName=" text-[hsl(var(--primary))] overflow-hidden py-0.5 sm:py-1 md:py-2 rounded-lg"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
              for a Brighter Future!
            </h1>
          </div>
          {/* Details */}
          <div className="mt-2 mb-2">
            <p className="text-[hsl(var(--foreground))] text-base md:text-lg max-w-xl">
              Unlock Your Financial Potential: Where Every Penny Counts! Welcome
              to Eno, Your Ultimate Destination for Smart Saving Solutions.
            </p>
          </div>
          {/* CTA Buttons */}
          <div className="flex gap-4 mt-4">
            <button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-lg px-8 py-3 rounded-md shadow hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))] transition">
              Get started
            </button>
            <button className="bg-[hsl(var(--card))] text-[hsl(var(--primary))] border border-[hsl(var(--primary))] font-semibold text-lg px-8 py-3 rounded-md shadow hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition">
              Learn More
            </button>
          </div>
        </div>
        {/* Carousel/Illustration */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative h-64 md:h-80 lg:h-[420px]">
          <div className="relative w-full h-full max-w-md">
            <Image
              src="/homelock.png"
              alt="Saving illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom Perks Section */}
      <div className="w-full bg-[hsl(var(--card))]/70 py-8 flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 w-full max-w-5xl">
          {/* Perk 1 */}
          <div className="flex items-center gap-4 px-6 py-4">
            <span className="bg-[hsl(var(--secondary))] rounded-lg p-3 flex items-center justify-center">
              <Crown className="text-[hsl(var(--primary))] w-8 h-8" />
            </span>
            <p className="text-lg font-medium text-[hsl(var(--foreground))]">
              Easily Take Control Over Your Money
            </p>
          </div>
          {/* Divider */}
          <span className="hidden md:block h-12 border-l border-[hsl(var(--border))] mx-4"></span>
          {/* Perk 2 */}
          <div className="flex items-center gap-4 px-6 py-4">
            <span className="bg-[hsl(var(--secondary))] rounded-lg p-3 flex items-center justify-center">
              <PiggyBank className="text-[hsl(var(--primary))] w-8 h-8" />
            </span>
            <p className="text-lg font-medium text-[hsl(var(--foreground))]">
              Save effortlessly with our intuitive platform.
            </p>
          </div>
          {/* Divider */}
          <span className="hidden md:block h-12 border-l border-[hsl(var(--border))] mx-4"></span>
          {/* Perk 3 */}
          <div className="flex items-center gap-4 px-6 py-4">
            <span className="bg-[hsl(var(--secondary))] rounded-lg p-3 flex items-center justify-center">
              <Sprout className="text-[hsl(var(--primary))] w-8 h-8" />
            </span>
            <p className="text-lg font-medium text-[hsl(var(--foreground))]">
              Stay motivated with clear savings goal tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
