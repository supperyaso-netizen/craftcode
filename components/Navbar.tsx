"use client";

import Image from 'next/image';
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isLogoShaking, setIsLogoShaking] = useState(false);

  // Logo shake effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLogoShaking(true);
      setTimeout(() => setIsLogoShaking(false), 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const logoShakeVariants = {
    idle: { x: 0, rotate: 0 },
    shake: {
      x: [0, -4, 4, -3, 3, -2, 2, 0],
      rotate: [0, -3, 3, -2, 2, -1, 1, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 w-full z-50"
    >
      <div
        className="
          max-w-7xl mx-
          px-4 sm:px-6 lg:px-4
          py-3 sm:py-4
          flex items-center justify-between
        "
      >
        {/* Logo Wrapper - proper left breathing space */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <motion.div
            animate={isLogoShaking ? "shake" : "idle"}
            variants={logoShakeVariants}
            className="relative"
          >
            <Image
              src="/craft-code.png"
              alt="CraftCode"
              width={56}
              height={40}
              priority
              className="w-12 h-auto sm:w-[70px] transition-all duration-300 group-hover:scale-105"
              style={{
                filter:
                  "brightness(1.15) drop-shadow(0 0 12px rgba(37,99,235,.5))",
              }}
            />
          </motion.div>

          <span className="font-bold text-base sm:text-xl text-white tracking-tight hidden sm:block">
            <span className="text-[#2563EB]"></span>
          </span>
        </Link>
      </div>
    </motion.nav>
  );
}





