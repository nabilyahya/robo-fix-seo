"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Instagram as IgIcon, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const MAPS_URL = "https://maps.google.com/?q=Your+Address";
const INSTAGRAM_URL = "https://instagram.com/your_account";
const WHATSAPP_PHONE_E164 = "905511663824";

export default function FloatingActions() {
  const [open, setOpen] = useState(false);

  const items = [
    {
      key: "email",
      href: "mailto:nabeelhero12@gmail.com",
      label: "E-posta",
      icon: <Mail className="h-5 w-5" />,
      bg: "bg-blue-500 text-white hover:bg-blue-600",
    },
    {
      key: "maps",
      href: MAPS_URL,
      label: "Google Maps",
      icon: <MapPin className="h-5 w-5" />,
      bg: "bg-red-500 text-white hover:bg-red-600",
      newTab: true,
    },
    {
      key: "instagram",
      href: INSTAGRAM_URL,
      label: "Instagram",
      icon: <IgIcon className="h-5 w-5" />,
      bg: "bg-pink-500 text-white hover:bg-pink-600",
      newTab: true,
    },
    {
      key: "whatsapp",
      href: `https://wa.me/${WHATSAPP_PHONE_E164}`,
      label: "WhatsApp",
      icon: <FaWhatsapp className="h-5 w-5" />,
      bg: "bg-green-500 text-white hover:bg-green-600",
      newTab: true,
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* الأزرار الفرعية */}
      <AnimatePresence>
        {open && (
          <motion.ul
            key="fab-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="mb-2 flex flex-col items-end gap-2"
            role="menu"
            aria-label="روابط سريعة"
          >
            {items.map((item, i) => (
              <motion.li
                key={item.key}
                role="none"
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
                className="w-full"
              >
                <a
                  role="menuitem"
                  href={item.href}
                  target={item.newTab ? "_blank" : undefined}
                  rel={item.newTab ? "noopener noreferrer" : undefined}
                  className={`group inline-flex items-center gap-2 rounded-full px-3 py-2 shadow-lg border border-black/5 hover:shadow-xl transition ${item.bg}`}
                  aria-label={item.label}
                >
                  {item.icon}
                  <span className="text-xs font-semibold">{item.label}</span>
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* الزر الرئيسي */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "إخفاء الروابط" : "إظهار الروابط"}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white shadow-xl hover:shadow-2xl transition"
      >
        <motion.span
          initial={false}
          animate={{ scale: open ? 0.9 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <MessageSquare className="h-6 w-6" />
        </motion.span>
        {!open && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full animate-ping bg-purple-400/40"
          />
        )}
      </button>
    </div>
  );
}
