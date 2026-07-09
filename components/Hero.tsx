


"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// ============================================================
// 1. BACKGROUND COMPONENT (shared across all sections)
// ============================================================
interface BackgroundProps {
  variant?: 'hero' | 'about' | 'services' | 'projects' | 'process' | 'testimonials' | 'contact' | 'footer';
  children?: React.ReactNode;
  className?: string;
}

function SectionBackground({ variant = 'hero', children, className = '' }: BackgroundProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Different panel configurations per section
  const getPanels = () => {
    const basePanels = {
      hero: [
        {
          top: '-20%',
          left: '-10%',
          width: '60%',
          height: '80%',
          rotation: 12,
          opacity: isMobile ? 0.02 : 0.04,
        },
        {
          bottom: '-20%',
          right: '-10%',
          width: '50%',
          height: '70%',
          rotation: -8,
          opacity: isMobile ? 0.015 : 0.035,
        },
      ],
      about: [
        {
          top: '-15%',
          right: '-5%',
          width: '55%',
          height: '75%',
          rotation: -10,
          opacity: isMobile ? 0.02 : 0.04,
        },
        {
          bottom: '-25%',
          left: '-8%',
          width: '45%',
          height: '65%',
          rotation: 15,
          opacity: isMobile ? 0.015 : 0.03,
        },
        {
          top: '40%',
          left: '-15%',
          width: '40%',
          height: '50%',
          rotation: 5,
          opacity: isMobile ? 0.01 : 0.025,
        },
      ],
      services: [
        {
          top: '-10%',
          left: '-15%',
          width: '50%',
          height: '70%',
          rotation: 8,
          opacity: isMobile ? 0.02 : 0.04,
        },
        {
          bottom: '-15%',
          right: '-10%',
          width: '55%',
          height: '60%',
          rotation: -12,
          opacity: isMobile ? 0.015 : 0.035,
        },
        {
          top: '50%',
          right: '-20%',
          width: '35%',
          height: '45%',
          rotation: 5,
          opacity: isMobile ? 0.01 : 0.025,
        },
      ],
      projects: [
        {
          top: '-20%',
          right: '-5%',
          width: '45%',
          height: '80%',
          rotation: -15,
          opacity: isMobile ? 0.02 : 0.04,
        },
        {
          bottom: '-10%',
          left: '-12%',
          width: '50%',
          height: '70%',
          rotation: 10,
          opacity: isMobile ? 0.015 : 0.035,
        },
        {
          top: '30%',
          right: '-25%',
          width: '40%',
          height: '50%',
          rotation: 8,
          opacity: isMobile ? 0.01 : 0.025,
        },
      ],
      process: [
        {
          top: '-15%',
          left: '-8%',
          width: '55%',
          height: '75%',
          rotation: -10,
          opacity: isMobile ? 0.02 : 0.04,
        },
        {
          bottom: '-20%',
          right: '-5%',
          width: '45%',
          height: '65%',
          rotation: 12,
          opacity: isMobile ? 0.015 : 0.03,
        },
        {
          top: '45%',
          left: '-20%',
          width: '35%',
          height: '45%',
          rotation: -5,
          opacity: isMobile ? 0.01 : 0.025,
        },
      ],
      testimonials: [
        {
          top: '-10%',
          right: '-12%',
          width: '50%',
          height: '70%',
          rotation: 8,
          opacity: isMobile ? 0.02 : 0.04,
        },
        {
          bottom: '-15%',
          left: '-10%',
          width: '55%',
          height: '60%',
          rotation: -10,
          opacity: isMobile ? 0.015 : 0.035,
        },
        {
          top: '55%',
          right: '-15%',
          width: '30%',
          height: '40%',
          rotation: -5,
          opacity: isMobile ? 0.01 : 0.025,
        },
      ],
      contact: [
        {
          top: '-15%',
          left: '-10%',
          width: '50%',
          height: '75%',
          rotation: 15,
          opacity: isMobile ? 0.02 : 0.04,
        },
        {
          bottom: '-10%',
          right: '-8%',
          width: '45%',
          height: '70%',
          rotation: -10,
          opacity: isMobile ? 0.015 : 0.03,
        },
        {
          top: '40%',
          right: '-20%',
          width: '35%',
          height: '50%',
          rotation: 8,
          opacity: isMobile ? 0.01 : 0.025,
        },
      ],
      footer: [
        {
          top: '-10%',
          left: '-5%',
          width: '40%',
          height: '60%',
          rotation: -8,
          opacity: isMobile ? 0.015 : 0.03,
        },
        {
          bottom: '-10%',
          right: '-8%',
          width: '35%',
          height: '55%',
          rotation: 12,
          opacity: isMobile ? 0.01 : 0.025,
        },
      ],
    };

    return basePanels[variant] || basePanels.hero;
  };

  const panels = getPanels();

  return (
    <div className={`relative overflow-hidden bg-[#050505] ${className}`}>
      {/* Matte base with subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0a0a14] to-[#050505] pointer-events-none" />

      {/* Very subtle radial blue ambient light in the center */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#2563EB]/5 rounded-full blur-[120px]" />
      </div>

      {/* Large diagonal panels - MOBILE FIX: static (no animate loop) on mobile to save CPU/GPU */}
      {panels.map((panel, index) =>
        isMobile ? (
          <div
            key={index}
            className="absolute pointer-events-none"
            style={{
              top: panel.top,
              left: panel.left,
              right: panel.right,
              bottom: panel.bottom,
              width: panel.width,
              height: panel.height,
              opacity: panel.opacity,
              transform: `rotate(${panel.rotation}deg)`,
            }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0d0d1a] to-[#1a1a2e]" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-transparent" />
              <div className="absolute inset-0 border border-[#2563EB]/15" />
            </div>
          </div>
        ) : (
          <motion.div
            key={index}
            className="absolute pointer-events-none"
            style={{
              top: panel.top,
              left: panel.left,
              right: panel.right,
              bottom: panel.bottom,
              width: panel.width,
              height: panel.height,
              opacity: panel.opacity,
              transform: `rotate(${panel.rotation}deg)`,
            }}
            animate={{
              y: [0, 15, 0, -15, 0],
            }}
            transition={{
              duration: 30 + index * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 3,
            }}
          >
            <div className="relative w-full h-full">
              {/* Matte dark surface */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0d0d1a] to-[#1a1a2e]" />

              {/* Very subtle white highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-transparent" />

              {/* Thin blue edge highlight */}
              <div className="absolute inset-0 border border-[#2563EB]/15" />
            </div>
          </motion.div>
        )
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// ============================================================
// 2. PREMIUM HERO BACKGROUND - Floating Brand Orbs
// MOBILE FIX: fewer particles, smaller blur radius, lighter animation
// ============================================================
function PremiumHeroBackground({ isMobile }: { isMobile: boolean }) {
  // MOBILE FIX: drastically reduce particle count on mobile (50 -> 10 total)
  const orbitingParticleCount = isMobile ? 6 : 20;
  const microParticleCount = isMobile ? 6 : 30;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Deep matte black base */}
      <div className="absolute inset-0 bg-[#05060B]" />

      {/* Subtle gradient depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#05060B] via-[#0A0F1E] to-[#05060B]" />

      {/* Floating Orbs - Primary large orb (Blue) - MOBILE FIX: smaller blur radius */}
      <motion.div
        className={`absolute rounded-full ${isMobile ? 'blur-[50px]' : 'blur-[150px]'}`}
        style={{
          top: '10%',
          right: '15%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.02) 60%, transparent 100%)',
        }}
        animate={
          isMobile
            ? { opacity: [0.4, 0.65, 0.4] }
            : {
                y: [0, -40, 0, 40, 0],
                x: [0, 20, 0, -20, 0],
                scale: [1, 1.1, 1, 0.9, 1],
                opacity: [0.4, 0.7, 0.4],
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Orbs - Secondary orb (Indigo - bottom left) */}
      <motion.div
        className={`absolute rounded-full ${isMobile ? 'blur-[45px]' : 'blur-[130px]'}`}
        style={{
          bottom: '15%',
          left: '10%',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, rgba(79,70,229,0.01) 60%, transparent 100%)',
        }}
        animate={
          isMobile
            ? { opacity: [0.3, 0.55, 0.3] }
            : {
                y: [0, 30, 0, -30, 0],
                x: [0, -20, 0, 20, 0],
                scale: [1, 0.9, 1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Floating Orbs - Small accent orb (Cyan - center-right) */}
      {!isMobile && (
        <motion.div
          className="absolute rounded-full blur-[100px]"
          style={{
            top: '50%',
            right: '5%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, rgba(34,211,238,0.01) 60%, transparent 100%)',
          }}
          animate={{
            y: [0, 25, 0, -25, 0],
            x: [0, -15, 0, 15, 0],
            scale: [1, 1.2, 1, 0.8, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      )}

      {/* Floating Orbs - Tiny orb (Purple - bottom-right) */}
      {!isMobile && (
        <motion.div
          className="absolute rounded-full blur-[80px]"
          style={{
            bottom: '25%',
            right: '20%',
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, rgba(139,92,246,0.01) 60%, transparent 100%)',
          }}
          animate={{
            y: [0, -20, 0, 20, 0],
            x: [0, 15, 0, -15, 0],
            scale: [1, 1.3, 1, 0.7, 1],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
        />
      )}

      {/* Central subtle glow - MOBILE FIX: smaller blur radius */}
      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/4 rounded-full ${
          isMobile ? 'w-[220px] h-[220px] blur-[60px]' : 'w-[400px] h-[400px] blur-[180px]'
        }`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles - tiny dots orbiting - MOBILE FIX: 20 -> 6 on mobile */}
      {[...Array(orbitingParticleCount)].map((_, i) => {
        const angle = (i / orbitingParticleCount) * Math.PI * 2;
        const radius = 200 + Math.random() * 150;
        const duration = 20 + Math.random() * 15;
        const delay = Math.random() * 10;

        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              marginLeft: '-2px',
              marginTop: '-2px',
            }}
            animate={{
              x: [0, Math.cos(angle) * radius, 0, Math.cos(angle + 0.5) * radius * 0.8, 0],
              y: [0, Math.sin(angle) * radius, 0, Math.sin(angle + 0.5) * radius * 0.8, 0],
              opacity: [0, 0.6, 0, 0.4, 0],
              scale: [0, 1.5, 0, 1, 0],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            }}
          />
        );
      })}

      {/* Additional floating micro-particles - MOBILE FIX: 30 -> 6 on mobile */}
      {[...Array(microParticleCount)].map((_, i) => (
        <motion.div
          key={`micro-${i}`}
          className="absolute w-[2px] h-[2px] bg-blue-500/20 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50 - Math.random() * 50, 0, 50 + Math.random() * 50, 0],
            x: [0, 30 - Math.random() * 60, 0, -30 + Math.random() * 60, 0],
            opacity: [0, 0.4, 0, 0.3, 0],
            scale: [0, 2, 0, 1.5, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}

      {/* Very subtle connecting lines between orbs - desktop only, negligible cost anyway */}
      {!isMobile && (
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <line x1="25%" y1="85%" x2="85%" y2="10%" stroke="#2563EB" strokeWidth="0.5" />
          <line x1="85%" y1="10%" x2="95%" y2="50%" stroke="#22D3EE" strokeWidth="0.5" />
          <line x1="95%" y1="50%" x2="80%" y2="75%" stroke="#8B92F6" strokeWidth="0.5" />
        </svg>
      )}
    </div>
  );
}

// ============================================================
// 3. HERO SECTION
// ============================================================
export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const arrowVariants = {
    idle: { x: 0 },
    hover: {
      x: 8,
      transition: { duration: 0.3, repeat: Infinity, repeatType: "reverse" as const },
    },
    mobile: {
      x: 8,
      transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" as const },
    },
  };

  const glowVariants = {
    idle: { opacity: 0, scale: 0.8 },
    hover: {
      opacity: 0.3,
      scale: 1.5,
      transition: { duration: 0.4 },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  return (
    <>
      {/* Hero Section with Premium Background */}
      <div className="relative min-h-screen">
        {/* Premium Floating Brand Orbs Background */}
        <PremiumHeroBackground isMobile={isMobile} />

        {/* Hero Content */}
        <section className="relative min-h-screen flex items-center justify-center px-6 sm:px-12 lg:px-24">
          <motion.div
            className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col items-center text-center px-4 sm:px-0"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              {/* FIX: "CRAFT CODE" now on a single line on all screen sizes.
                  Font sizes reduced on smaller breakpoints so it doesn't overflow. */}
              <h1 className="font-black leading-[0.9]">
                <span className="block whitespace-nowrap text-[3rem] sm:text-[3.75rem] md:text-[5.5rem] lg:text-[7.5rem] xl:text-[9rem] text-white tracking-[-0.00em] sm:tracking-[0.01em]">
                  CRAFT CODE
                </span>
              </h1>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="mt-6 sm:mt-8"
            >
              <p className="hidden sm:block text-[#2563EB] uppercase tracking-[0.3em] text-xs sm:text-sm font-semibold">
                FULL STACK SYSTEMS • BRAND SYSTEMS • AI EXPERIENCES
              </p>
              <div className="block sm:hidden flex flex-col items-center">
                <p className="text-[#2563EB] uppercase tracking-[0.3em] text-[10px] font-semibold">
                  FULL STACK SYSTEMS • BRAND SYSTEMS
                </p>
                <p className="text-[#2563EB] uppercase tracking-[0.3em] text-[10px] font-semibold mt-0.5">
                  • AI EXPERIENCES
                </p>
              </div>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
              className="mt-6 sm:mt-8 max-w-3xl text-gray-300 text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed font-light"
            >
              Crafting brands people remember
            </motion.p>

            {/* ========== BUTTONS ========== */}
            <motion.div
              variants={fadeInUp}
              transition={{ delay: 0.6 }}
              className="mt-10 sm:mt-16 flex flex-col sm:flex-row gap-6 sm:gap-6 w-full sm:w-auto justify-center"
            >
              {/* Begin a Project Button */}
              <Link href="/book-project" className="w-full sm:w-auto cursor-pointer">
                <button className="group relative w-full sm:w-auto overflow-hidden px-6 sm:px-8 py-3 sm:py-4 bg-[#2563EB] text-white rounded-full font-medium transition-all duration-300 hover:bg-[#1D4ED8] hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20 cursor-pointer text-sm sm:text-base touch-manipulation">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Begin a Project
                  </span>
                  <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
                </button>
              </Link>

              {/* View Work Button */}
              <motion.div
                className="relative w-full sm:w-auto"
                whileHover={!isMobile ? "hover" : undefined}
              >
                {!isMobile && (
                  <motion.div
                    variants={glowVariants}
                    initial="idle"
                    whileHover="hover"
                    className="absolute inset-0 rounded-full bg-[#2563EB] blur-xl pointer-events-none"
                  />
                )}
                <Link href="/work" className="w-full sm:w-auto cursor-pointer block">
                  <button className="relative w-full sm:w-auto rounded-full border border-[#2563EB] px-6 sm:px-8 py-3 sm:py-4 text-[#2563EB] transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer bg-transparent hover:bg-[#2563EB] hover:text-white font-medium text-sm sm:text-base touch-manipulation">
                    <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                      View Work
                      <motion.span
                        variants={arrowVariants}
                        initial="idle"
                        animate={isMobile ? "mobile" : undefined}
                        whileHover={!isMobile ? "hover" : undefined}
                        className="inline-block"
                      >
                        →
                      </motion.span>
                    </span>
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </div>

      {/* Infinite Premium Text Ticker */}
      <div className="relative py-4 sm:py-6 bg-[#050505] border-y border-neutral-900 overflow-hidden select-none flex whitespace-nowrap">
        <motion.div
          className="flex text-[10px] sm:text-xs md:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase text-neutral-500 font-medium space-x-8 sm:space-x-16 pr-8 sm:pr-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
        >
          <span>• GRAPHIC DESIGN</span>
          <span>• CREATIVE TECHNOLOGY</span>
          <span>• BRAND EXPERIENCES</span>
          <span>• VISUAL STORYTELLING</span>
          <span>• CREATIVE DIRECTION</span>
          <span>• PREMIUM DIGITAL EXPERIENCES</span>
          <span>• MODERN INTERFACES</span>
          <span>• NEXT GENERATION WEB APPS</span>
          <span>• GRAPHIC DESIGN</span>
          <span>• CREATIVE TECHNOLOGY</span>
          <span>• BRAND EXPERIENCES</span>
          <span>• VISUAL STORYTELLING</span>
          <span>• CREATIVE DIRECTION</span>
          <span>• PREMIUM DIGITAL EXPERIENCES</span>
          <span>• MODERN INTERFACES</span>
          <span>• NEXT GENERATION WEB APPS</span>
        </motion.div>
      </div>

      {/* ============================================================
          CRAFTCODE Studio Info Section (using SectionBackground)
          ============================================================ */}
      <SectionBackground variant="services">
        <section className="relative py-16 sm:py-24 lg:py-36 px-4 sm:px-6 lg:px-24">
          <div className="max-w-[1600px] mx-auto">

            <motion.div
              className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 sm:mb-20 gap-6 sm:gap-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="w-full">
                <h2 className="text-4xl ml-3 tracking-[0.00em] sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white/90 text-center sm:text-left tracking-[-0.06em]">
                  CRAFT<span className="text-[#2563EB] tracking-[0.01em]"> CODE</span>
                </h2>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-gray-400 text-base sm:text-lg md:text-x lg:text-2xl max-w-xl font-light tracking-wide leading-relaxed text-center sm:text-left "
              >
                We craft striking architectural codebases and breathtaking user aesthetics for digital products that stand out.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-28"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  }
                }
              }}
            >
              {[
                {
                  title: "Digital Innovation",
                  desc: "Transforming ideas into modern digital solutions through creativity, technology, and innovation."
                },
                {
                  title: "Brand Identity",
                  desc: "Crafting logos, packaging, and visual identities that make brands recognizable and memorable."
                },
                {
                  title: "Web Development",
                  desc: "Crafting modern websites that blend performance, functionality, and exceptional user experiences."
                },
                {
                  title: "Business Growth",
                  desc: "Building solutions that support visibility, engagement, and sustainable growth."
                }
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6 }
                    },
                    hover: {
                      y: -8,
                      transition: { duration: 0.3 }
                    }
                  }}
                  whileHover="hover"
                  className="group relative p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-[#0a0a12] border border-neutral-900 hover:border-blue-600/40 transition-all duration-500 flex flex-col h-auto min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] overflow-hidden cursor-pointer"
                >
                  <div className="absolute -inset-px bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-blue-600/30 transition-all duration-500" />

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-1 h-6 sm:h-8 bg-[#2563EB] rounded-full group-hover:scale-y-110 transition-transform duration-300" />
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#2563EB] tracking-tight">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed group-hover:text-neutral-300 transition-colors duration-300 flex-1">
                      {service.desc}
                    </p>
                  </div>
                  <div className="w-full h-0.5 bg-neutral-800 group-hover:bg-blue-600 transition-colors duration-500 mt-3 sm:mt-4" />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="border-t border-neutral-900 pt-10 sm:pt-16 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6"
            >
              <p className="text-neutral-500 text-xs sm:text-sm tracking-[0.2em] uppercase font-light text-center sm:text-left">
                Build to be remembered, not just noticed.
              </p>
              <Link href="/work">
                <span className="text-white hover:text-[#2563EB] text-xs sm:text-sm tracking-widest uppercase transition-colors duration-300 flex items-center gap-2 cursor-pointer">
                  Explore Showcase <span>↗</span>
                </span>
              </Link>
            </motion.div>

            <footer className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-neutral-900/50 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="flex gap-6 sm:gap-8">
                <Link href="https://www.instagram.com/craftcode.dev/" target="_blank">
                  <span className="text-neutral-400 hover:text-white transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer">
                    Instagram
                  </span>
                </Link>
                <Link href="mailto:hello@craftcode.com">
                  <span className="text-neutral-400 hover:text-white transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer">
                    Email
                  </span>
                </Link>
              </div>
              <p className="text-neutral-600 text-[10px] sm:text-xs tracking-wider text-center sm:text-left">
                © {new Date().getFullYear()} CRAFTCODE. ALL RIGHTS RESERVED.
              </p>
            </footer>

          </div>
        </section>
      </SectionBackground>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </>
  );
}