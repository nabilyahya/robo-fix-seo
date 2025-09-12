// src/components/Header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wrench, Menu, X } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import logo from "../../public/logo2.png";
import Image from "next/image";
import { reportAdsConversionThenNavigate } from "@/lib/ads";
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const GADS_WHATSAPP =
    process.env.NEXT_PUBLIC_GADS_WHATSAPP ||
    "AW-17534185067/NLoeCOO285cbEOvc-ahB";
  const WHATSAPP_URL = "https://wa.me/+905515222067";
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border px-4 sm:px-6 lg:px-10 py-3 bg-background relative">
      {/* Logo */}
      <Link href="/" aria-label="Robonarim - Ana Sayfa">
        <div className="flex items-center gap-3 sm:gap-4 text-foreground">
          <Image
            src={logo}
            alt="Robonarim logo"
            width={100}
            height={40}
            priority
          />
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex flex-1 justify-end gap-8">
        <nav
          className="flex items-center gap-6 xl:gap-9"
          role="navigation"
          aria-label="Ana menü"
        >
          <Link
            className="text-foreground text-sm font-medium hover:text-primary transition-colors"
            href="/"
          >
            Ana Sayfa
          </Link>
          <Link
            className="text-foreground text-sm font-medium hover:text-primary transition-colors"
            href="/#services"
          >
            Hizmetler
          </Link>
          {/* قسم على نفس الصفحة: مسموح إما Link مع هاش أو <a href="#about"> */}
          <a
            className="text-foreground text-sm font-medium hover:text-primary transition-colors"
            href="#about"
          >
            Hakkımızda
          </a>
          <Link
            className="text-foreground text-sm font-medium hover:text-primary transition-colors"
            href="/blog"
          >
            Blog
          </Link>
        </nav>

        {/* WhatsApp Button */}
        <Button
          asChild
          variant="hero"
          size="default"
          className="min-w-[110px] max-w-[480px] text-xs sm:text-sm bg-green-500 hover:bg-green-600"
        >
          <a
            href="https://wa.me/+905515222067"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp ile iletişime geç"
            onClick={(e) => {
              e.preventDefault(); // نضمن إرسال الحدث أولاً
              reportAdsConversionThenNavigate(GADS_WHATSAPP, WHATSAPP_URL);
            }}
            className="flex items-center gap-2"
          >
            <FaWhatsapp className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center gap-2">
        <Button
          asChild
          variant="hero"
          size="sm"
          className="text-xs px-3 bg-green-500 hover:bg-green-600"
        >
          <a
            href="https://wa.me/+905515222067"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              reportAdsConversionThenNavigate(GADS_WHATSAPP, WHATSAPP_URL);
            }}
            className="flex items-center gap-1"
          >
            <FaWhatsapp className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>

        <button
          onClick={toggleMobileMenu}
          className="p-2 text-foreground hover:text-primary transition-colors"
          aria-label={isMobileMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav"
          className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50 lg:hidden"
        >
          <nav
            className="flex flex-col py-4 px-4"
            role="navigation"
            aria-label="Mobil menü"
          >
            <Link
              className="text-foreground text-sm font-medium hover:text-primary transition-colors py-3 border-b border-border/50"
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link
              className="text-foreground text-sm font-medium hover:text-primary transition-colors py-3 border-b border-border/50"
              href="/#services"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hizmetler
            </Link>
            <a
              className="text-foreground text-sm font-medium hover:text-primary transition-colors py-3 border-b border-border/50"
              href="#about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hakkımızda
            </a>
            <Link
              className="text-foreground text-sm font-medium hover:text-primary transition-colors py-3"
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            {/* 
            <Link
              className="text-foreground text-sm font-medium hover:text-primary transition-colors py-3"
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              İletişim
            </Link> 
            */}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
