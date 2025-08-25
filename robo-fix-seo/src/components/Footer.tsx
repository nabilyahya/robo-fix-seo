import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: "#home", label: "Ana Sayfa" },
    { href: "#services", label: "Hizmetler" },
    { href: "#about", label: "Hakkımızda" },
    // { href: "#contact", label: "İletişim" },
    { href: "/privacy", label: "Gizlilik Politikası" },
    { href: "/terms", label: "Hizmet Şartları" },
    { href: "/blog", label: "blog" },
  ];

  const socialLinks = [
    {
      href: "https://www.facebook.com/profile.php?id=61579740275799 ",
      icon: <Facebook className="h-6 w-6" />,
      label: "Facebook",
      ariaLabel: "Bizi Facebook'ta takip edin",
    },
    {
      href: "https://www.instagram.com/robonarim/?utm_source=ig_web_button_share_sheet",
      icon: <Instagram className="h-6 w-6" />,
      label: "Instagram",
      ariaLabel: "Bizi Instagram'da takip edin",
    },
  ];

  return (
    <footer className="flex justify-center bg-background" role="contentinfo">
      <div className="flex max-w-[960px] flex-1 flex-col">
        <div className="flex flex-col gap-4 sm:gap-6 px-4 sm:px-5 py-6 sm:py-8 lg:py-10 text-center @container">
          {/* Navigation */}
          <nav
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 flex-col sm:flex-row"
            aria-label="Alt menü"
          >
            {footerLinks.map((link, index) => (
              <a
                key={index}
                className="text-muted-foreground text-sm sm:text-base font-normal leading-normal hover:text-primary transition-colors px-2 py-1"
                href={link.href}
                aria-label={link.label}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social icons */}
          <div
            className="flex flex-wrap justify-center gap-3 sm:gap-4"
            role="list"
            aria-label="Sosyal medya"
          >
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                aria-label={social.ariaLabel}
                role="listitem"
              >
                <div aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6">
                  {social.icon}
                </div>
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base font-normal leading-normal">
            © {currentYear} Robonarim. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
