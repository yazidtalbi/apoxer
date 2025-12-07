import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 mt-20">
      {/* Upper Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Column 1: Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/60 hover:text-white text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-white/60 hover:text-white text-sm transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/for-the-record" className="text-white/60 hover:text-white text-sm transition-colors">
                  For the Record
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Communities */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Communities
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/communities" className="text-white/60 hover:text-white text-sm transition-colors">
                  For Gamers
                </Link>
              </li>
              <li>
                <Link href="/developers" className="text-white/60 hover:text-white text-sm transition-colors">
                  Developers
                </Link>
              </li>
              <li>
                <Link href="/advertising" className="text-white/60 hover:text-white text-sm transition-colors">
                  Advertising
                </Link>
              </li>
              <li>
                <Link href="/investors" className="text-white/60 hover:text-white text-sm transition-colors">
                  Investors
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="text-white/60 hover:text-white text-sm transition-colors">
                  Vendors
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Useful Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Useful Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/support" className="text-white/60 hover:text-white text-sm transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/mobile" className="text-white/60 hover:text-white text-sm transition-colors">
                  Mobile App
                </Link>
              </li>
              <li>
                <Link href="/popular-by-country" className="text-white/60 hover:text-white text-sm transition-colors">
                  Popular by Country
                </Link>
              </li>
              <li>
                <Link href="/import-games" className="text-white/60 hover:text-white text-sm transition-colors">
                  Import Your Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Subscriptions/Plans */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Plans
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/premium" className="text-white/60 hover:text-white text-sm transition-colors">
                  Premium Individual
                </Link>
              </li>
              <li>
                <Link href="/premium-duo" className="text-white/60 hover:text-white text-sm transition-colors">
                  Premium Duo
                </Link>
              </li>
              <li>
                <Link href="/premium-family" className="text-white/60 hover:text-white text-sm transition-colors">
                  Premium Family
                </Link>
              </li>
              <li>
                <Link href="/premium-student" className="text-white/60 hover:text-white text-sm transition-colors">
                  Premium Student
                </Link>
              </li>
              <li>
                <Link href="/free" className="text-white/60 hover:text-white text-sm transition-colors">
                  Free
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Social Media */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex gap-4 mb-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10"></div>

      {/* Lower Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/legal" className="text-white/60 hover:text-white transition-colors">
              Legal
            </Link>
            <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
              Privacy Center
            </Link>
            <Link href="/privacy-policy" className="text-white/60 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="text-white/60 hover:text-white transition-colors">
              Cookies
            </Link>
            <Link href="/about-ads" className="text-white/60 hover:text-white transition-colors">
              About Ads
            </Link>
            <Link href="/accessibility" className="text-white/60 hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-white/60 text-sm">
            © {currentYear} Game Directory
          </div>
        </div>
      </div>
    </footer>
  );
}

