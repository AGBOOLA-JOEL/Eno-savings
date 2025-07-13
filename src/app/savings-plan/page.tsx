"use client";
import RotatingText from "@/components/general/rotating-text";
import { PiggyBank, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";

export default function SavingsPlanPage() {
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
              className="text-lg font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition cursor-pointer rounded-lg h-12 flex items-center px-4 bg-[hsl(var(--primary))]/10"
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
                    className="text-lg font-medium text-[hsl(var(--primary))] py-3 px-2 rounded hover:bg-[hsl(var(--primary))]/10 bg-[hsl(var(--primary))]/10"
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

      {/* Hero Section */}
      <div className="flex flex-1 flex-col-reverse lg:flex-row items-center justify-between px-8 lg:px-16 py-8 gap-8 lg:gap-0">
        {/* Info Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6">
          <div className="flex justify-center lg:justify-start">
            <p className="text-[hsl(var(--primary))] text-base font-semibold bg-[hsl(var(--card))]/70 rounded-lg shadow px-4 py-2 mt-4 mb-2 text-center w-fit">
              Plan Your Savings Journey
            </p>
          </div>
          <div className="text-left lg:text-left">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-2">
              Build Your{" "}
              <RotatingText
                texts={["Savings Plan", "Financial Future", "Goals", "Dreams"]}
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
              with Eno
            </h1>
          </div>
          <div className="mt-2 mb-2">
            <p className="text-[hsl(var(--foreground))] text-base md:text-lg max-w-xl">
              Create, track, and achieve your savings goals with personalized
              plans and smart tools. Start your journey to financial freedom
              today.
            </p>
          </div>
        </div>
        {/* Illustration */}
        <div className="sm:hidden w-full lg:w-1/2 hidden lg:flex items-center justify-center relative h-64 md:h-80 lg:h-[420px]">
          <div className="relative w-full h-full max-w-md flex items-center justify-center">
            <PiggyBank className="w-40 h-40 text-[hsl(var(--primary))] opacity-80" />
          </div>
        </div>
      </div>

      {/* Savings Plan List Section (placeholder) */}
      <div className="w-full bg-[hsl(var(--card))]/70 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col gap-6 px-4">
          {/* Example Plan Item */}
          <div className="bg-[hsl(var(--background))] rounded-lg shadow p-6 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-[hsl(var(--primary))]">
              Starter Savings Plan
            </h2>
            <p className="text-[hsl(var(--foreground))]">
              Kickstart your savings with our easy-to-follow starter plan. Set
              your goal, choose your frequency, and watch your savings grow!
            </p>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              Updated April 2024
            </span>
          </div>
          <div className="bg-[hsl(var(--background))] rounded-lg shadow p-6 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-[hsl(var(--primary))]">
              Advanced Growth Plan
            </h2>
            <p className="text-[hsl(var(--foreground))]">
              For those ready to take their savings to the next level. Unlock
              advanced features and personalized recommendations.
            </p>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              Updated March 2024
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
