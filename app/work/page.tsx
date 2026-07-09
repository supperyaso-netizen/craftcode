"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Navbar from "@/components/Navbar";
import { projectDB } from "@/lib/db";

interface ApiProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  tags: string[];
  githubLink?: string;
  liveLink?: string;
  status: string;
  featured: boolean;
  icon?: string;
  thumbnail?: string;
  images: any[];
  order: number;
  views: number;
}

export default function WorkPage() {
  const router = useRouter();
  const [gdProjects, setGdProjects] = useState<ApiProject[]>([]);
  const [fsdProjects, setFsdProjects] = useState<ApiProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentProjectImages, setCurrentProjectImages] = useState<any[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringBack, setIsHoveringBack] = useState(false);
  const [isHoveringBegin, setIsHoveringBegin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const fsdRef = useRef<HTMLDivElement>(null);
  const gdRef = useRef<HTMLDivElement>(null);

  const brandColor = "#2563EB";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ── Load projects from IndexedDB ──
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const allProjects = await projectDB.getAll();
        
        const gd = allProjects.filter(
          (p: any) =>
            p.category === "Graphic Design" ||
            p.category === "UI/UX Design" ||
            p.category === "Branding"
        );

        const fsd = allProjects.filter(
          (p: any) =>
            p.category === "Web Development" ||
            p.category === "Full Stack" ||
            p.category === "App Development"
        );

        setGdProjects(gd);
        setFsdProjects(fsd);
      } catch (error) {
        console.error("Error loading projects:", error);
        setLoadError("Failed to load projects. Please try again later.");
        setGdProjects([]);
        setFsdProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const displayGdProjects = gdProjects;
  const displayFsdProjects = fsdProjects;

  // Open single image full screen
  const openFullScreen = (image: string, index: number, images: any[]) => {
    setCurrentProjectImages(images);
    setCurrentImageIndex(index);
    setFullScreenImage(image);
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
    setCurrentProjectImages([]);
  };

  const nextImage = () => {
    if (currentProjectImages.length > 0) {
      const nextIndex = (currentImageIndex + 1) % currentProjectImages.length;
      setCurrentImageIndex(nextIndex);
      setFullScreenImage(getImageSrc(currentProjectImages[nextIndex]));
    }
  };

  const prevImage = () => {
    if (currentProjectImages.length > 0) {
      const prevIndex =
        (currentImageIndex - 1 + currentProjectImages.length) % currentProjectImages.length;
      setCurrentImageIndex(prevIndex);
      setFullScreenImage(getImageSrc(currentProjectImages[prevIndex]));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextImage();
    if (distance < -50) prevImage();
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullScreenImage) {
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "Escape") closeFullScreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullScreenImage, currentImageIndex, currentProjectImages]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    hover: {
      y: -12,
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const categoryCardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleChatClick = () => {
    router.push("/book-project");
  };

  const getMouseGlowStyle = () => {
    if (typeof window === "undefined") {
      return {
        width: "500px",
        height: "500px",
        x: 0,
        y: 0,
      };
    }
    return {
      width: "500px",
      height: "500px",
      x: mousePosition.x * 60 + window.innerWidth / 2 - 250,
      y: mousePosition.y * 60 + window.innerHeight / 2 - 250,
    };
  };

  const getImageSrc = (image: any): string | null => {
    if (!image) return null;
    if (typeof image === "string") return image;
    if (image.url) return image.url;
    if (image.imageData) return image.imageData;
    return null;
  };

  const getProjectImages = (project: ApiProject) => {
    if (project.images && Array.isArray(project.images) && project.images.length > 0) {
      return project.images;
    }
    if (project.thumbnail) return [project.thumbnail];
    return [];
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Floating Action Buttons */}
      <div
        className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[9999] pointer-events-auto"
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 9999,
          pointerEvents: "auto",
          isolation: "isolate",
          transform: "none",
          filter: "none",
          perspective: "none",
        }}
      >
        <div className="flex flex-wrap gap-2 sm:gap-3 max-w-[90vw] sm:max-w-none pointer-events-auto">
          <motion.button
            initial={{ opacity: 0, x: 30, rotate: -10 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
            whileHover={{ scale: 1.08, rotate: -3, boxShadow: "0 0 40px rgba(37,99,235,0.25)" }}
            whileTap={{ scale: 0.92 }}
            onHoverStart={() => setIsHoveringBack(true)}
            onHoverEnd={() => setIsHoveringBack(false)}
            onClick={handleHomeClick}
            className="group relative px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#2563EB]/50 text-white font-medium text-[10px] sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 overflow-hidden touch-manipulation active:scale-95 pointer-events-auto cursor-pointer"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/0 via-[#2563EB]/15 to-[#2563EB]/0"
              initial={{ x: "-100%" }}
              animate={{ x: isHoveringBack ? "100%" : "-100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
            <motion.svg
              className="w-3 sm:w-4 h-3 sm:h-4 relative z-30"
              animate={{ x: isHoveringBack ? -4 : 0, rotate: isHoveringBack ? -10 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </motion.svg>
            <motion.span
              className="relative z-10 whitespace-nowrap"
              animate={{ x: isHoveringBack ? -2 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="hidden xs:inline">Back to</span> Home
            </motion.span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 30, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 0 60px rgba(37,99,235,0.5), 0 0 120px rgba(37,99,235,0.2)" }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHoveringBegin(true)}
            onHoverEnd={() => setIsHoveringBegin(false)}
            onClick={handleChatClick}
            className="group relative px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#1D4ED8] text-white font-medium text-[10px] sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 overflow-hidden shadow-lg shadow-[#2563EB]/30 touch-manipulation active:scale-95 pointer-events-auto cursor-pointer"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: isHoveringBegin ? "200%" : "-200%" }}
              transition={{ duration: 0.8, ease: "easeInOut", repeat: isHoveringBegin ? Infinity : 0, repeatDelay: 0.5 }}
            />
            <motion.div
              className="relative z-10 flex items-center gap-1.5 sm:gap-2"
              animate={{ scale: isHoveringBegin ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5, repeat: isHoveringBegin ? Infinity : 0, ease: "easeInOut" }}
            >
              <svg className="w-3 sm:w-4 h-5 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <motion.span className="whitespace-nowrap">
                <span className="hidden xs:inline">Begin </span>Chat
              </motion.span>
            </motion.div>
            <motion.svg
              className="w-3 sm:w-4 h-3 sm:h-4 relative z-10"
              animate={{ x: isHoveringBegin ? 4 : 0, rotate: isHoveringBegin ? 5 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </motion.svg>
          </motion.button>
        </div>
      </div>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full bg-[#2563EB]/8 blur-[180px] rounded-full" />
        </motion.div>
        <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#2563EB]/10 blur-[150px] rounded-full" />
        <div className="absolute top-[-150px] right-[-100px] w-[400px] h-[400px] bg-[#1D4ED8]/6 blur-[120px] rounded-full" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.015] hidden sm:block">
          <pattern id="brandGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2563EB" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1" fill="#2563EB" opacity="0.3" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#brandGrid)" />
        </svg>
        <div className="absolute top-0 left-0 right-0 h-[8vh] bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[8vh] bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 bg-radial-vignette from-transparent via-transparent to-black/70" />
      </div>

      {/* Mouse Glow */}
      {isMounted && (
        <motion.div
          className="fixed pointer-events-none z-0 hidden lg:block"
          style={getMouseGlowStyle()}
          transition={{ type: "spring", stiffness: 20, damping: 25 }}
        >
          <div className="w-full h-full bg-gradient-radial from-[#2563EB]/8 via-[#2563EB]/3 to-transparent rounded-full blur-3xl" />
        </motion.div>
      )}

      <Navbar />

      {/* Hero - Added proper padding */}
      <div className="relative z-10 pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 text-center px-4 sm:px-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="relative max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white">
            WORKS
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-2 mt-4 font-light tracking-wide">
            Exploring the intersection of design and development
          </p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-6 h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-[#2563EB]/40 to-transparent"
          />
        </motion.div>
      </div>

      {/* Error State */}
      {loadError && !isLoading && (
        <div className="relative z-10 max-w-3xl mx-auto px-4 pb-8 text-center">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {loadError}
          </div>
        </div>
      )}

      {/* Category Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={categoryCardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onClick={() => scrollToSection(fsdRef)}
            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/5 hover:border-[#2563EB]/30 cursor-pointer transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB]/15 flex items-center justify-center group-hover:bg-[#2563EB]/25 transition-colors duration-300">
                <svg className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500 font-light">{displayFsdProjects.length} projects</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-[#2563EB] transition-colors duration-300">
              Full Stack Development
            </h2>
            <p className="text-gray-400 text-sm font-light mt-3 max-w-md">
              End-to-end web applications with modern technologies and clean architecture.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[#2563EB] font-medium text-sm group-hover:gap-3 transition-all duration-300">
              Explore Projects
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </motion.div>

          <motion.div
            variants={categoryCardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            whileHover="hover"
            onClick={() => scrollToSection(gdRef)}
            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/5 hover:border-[#2563EB]/30 cursor-pointer transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB]/15 flex items-center justify-center group-hover:bg-[#2563EB]/25 transition-colors duration-300">
                <svg className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500 font-light">{displayGdProjects.length} projects</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-[#2563EB] transition-colors duration-300">
              Graphic Design
            </h2>
            <p className="text-gray-400 text-sm font-light mt-3 max-w-md">
              Visual identities, UI/UX design, and creative branding solutions.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[#2563EB] font-medium text-sm group-hover:gap-3 transition-all duration-300">
              Explore Projects
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Full Stack Section */}
      <div ref={fsdRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-[#2563EB] rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Full Stack</h2>
              <p className="text-gray-500 text-sm font-light">{displayFsdProjects.length} projects</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-20">
            <div
              className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${brandColor} transparent ${brandColor} transparent` }}
            />
          </div>
        ) : displayFsdProjects.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-light">No projects published yet.</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayFsdProjects.map((project, index) => {
              const images = getProjectImages(project);
              const mainImage = images.length > 0 ? getImageSrc(images[0]) : null;
              const imageCount = images.length;

              return (
                <motion.div
                  key={project.id || index}
                  variants={cardVariants}
                  whileHover="hover"
                  className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 hover:border-[#2563EB]/30 transition-all duration-500"
                >
                  <div className="absolute top-4 right-4 z-10 text-3xl font-black text-white/5 group-hover:text-[#2563EB]/10 transition-colors duration-500">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="relative h-48 overflow-hidden" style={{ backgroundColor: brandColor + "08" }}>
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                        onClick={() => {
                          if (images.length > 0) {
                            openFullScreen(getImageSrc(images[0]) || '', 0, images);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <svg className="w-10 h-10 text-[#2563EB]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs mt-2 text-center px-4 text-gray-500">{project.title}</span>
                      </div>
                    )}
                    {imageCount > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {imageCount}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-5">
                    <span className="text-xs font-medium text-[#2563EB] tracking-[0.1em] uppercase">{project.category}</span>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-[#2563EB] transition-colors duration-300 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2 font-light">{project.description}</p>

                    {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.technologies.slice(0, 3).map((tech: string) => (
                          <span key={tech} className="text-[9px] px-2 py-0.5 rounded-full bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => {
                          if (images.length > 0) {
                            openFullScreen(getImageSrc(images[0]) || '', 0, images);
                          } else if (project.liveLink) {
                            window.open(project.liveLink, "_blank");
                          }
                        }}
                        className="text-xs font-medium text-[#2563EB] group-hover:text-[#3B82F6] transition-colors duration-300 flex items-center gap-1"
                      >
                        View {imageCount > 0 ? `(${imageCount} images)` : ""}
                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Graphic Design Section */}
      <div ref={gdRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-24 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-[#2563EB] rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Graphic Design</h2>
              <p className="text-gray-500 text-sm font-light">{displayGdProjects.length} projects</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-20">
            <div
              className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${brandColor} transparent ${brandColor} transparent` }}
            />
          </div>
        ) : displayGdProjects.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-light">No projects published yet.</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayGdProjects.map((project, index) => {
              const images = getProjectImages(project);
              const mainImage = images.length > 0 ? getImageSrc(images[0]) : null;
              const imageCount = images.length;

              return (
                <motion.div
                  key={project.id || index}
                  variants={cardVariants}
                  whileHover="hover"
                  className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 hover:border-[#2563EB]/30 transition-all duration-500 cursor-pointer"
                  onClick={() => {
                    if (images.length > 0) {
                      openFullScreen(getImageSrc(images[0]) || '', 0, images);
                    } else if (project.liveLink) {
                      window.open(project.liveLink, "_blank");
                    }
                  }}
                >
                  <div className="absolute top-4 right-4 z-10 text-3xl font-black text-white/5 group-hover:text-[#2563EB]/10 transition-colors duration-500">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="relative h-48 overflow-hidden" style={{ backgroundColor: brandColor + "08" }}>
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <svg className="w-10 h-10 text-[#2563EB]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs mt-2 text-center px-4 text-gray-500">{project.title}</span>
                      </div>
                    )}
                    {imageCount > 1 && (
                      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {imageCount}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-5">
                    <span className="text-xs font-medium text-[#2563EB] tracking-[0.1em] uppercase">{project.category}</span>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-[#2563EB] transition-colors duration-300 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2 font-light">{project.description}</p>

                    {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.technologies.slice(0, 2).map((tech: string) => (
                          <span key={tech} className="text-[9px] px-2 py-0.5 rounded-full bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 2 && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
                            +{project.technologies.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                      <span className="text-xs font-medium text-[#2563EB] group-hover:text-[#3B82F6] transition-colors duration-300 flex items-center gap-1">
                        View {imageCount > 0 ? `(${imageCount} images)` : ""}
                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ========== CLEAN FULL SCREEN VIEWER - ONLY ONE IMAGE ========== */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
            onClick={closeFullScreen}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Pure black background */}
            <div className="absolute inset-0 bg-black" />
            
            {/* Close Button */}
            <button
              onClick={closeFullScreen}
              className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 z-30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation - Previous */}
            {currentProjectImages.length > 1 && (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  prevImage(); 
                }}
                className="absolute left-4 md:left-8 text-white/40 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-300 z-30"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Navigation - Next */}
            {currentProjectImages.length > 1 && (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  nextImage(); 
                }}
                className="absolute right-4 md:right-8 text-white/40 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-300 z-30"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Image Counter - Minimal */}
            {currentProjectImages.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white/30 bg-black/20 px-3 py-1 rounded-full text-xs font-light z-30">
                {currentImageIndex + 1} / {currentProjectImages.length}
              </div>
            )}

            {/* Main Image - Clean, No Distractions */}
            <motion.div
              key={fullScreenImage}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-20 flex items-center justify-center w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullScreenImage}
                alt="Full screen view"
                className="max-w-[95vw] max-h-[85vh] md:max-w-[90vw] md:max-h-[90vh] object-contain"
                draggable={false}
              />
            </motion.div>

            {/* Project Title - Bottom Center */}
            {selectedProject && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/25 text-xs font-light z-20">
                {selectedProject.title}
              </div>
            )}

            {/* Keyboard hint */}
            {currentProjectImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/10 text-[10px] font-light z-20 hidden md:block">
                ← → arrow keys to navigate
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 text-white w-11 h-11 rounded-full shadow-2xl transition-all flex items-center justify-center z-40 text-base bg-[#2563EB] hover:bg-[#1D4ED8] hover:shadow-[0_0_50px_rgba(37,99,235,0.4)]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-500 text-xs sm:text-sm border-t border-white/5 bg-black/30 backdrop-blur-sm">
        <p className="tracking-wider">
          © 2026 <span className="text-[#2563EB] font-semibold">CraftCode</span>. All rights reserved.
        </p>
      </footer>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bg-radial-vignette {
          background: radial-gradient(ellipse at center, transparent 50%, black 100%);
        }
        .bg-gradient-radial {
          background: radial-gradient(var(--tw-gradient-stops));
        }
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        @media (min-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
        @media (max-width: 479px) {
          .xs\\:inline {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}






// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence, Variants } from "framer-motion";
// import Navbar from "@/components/Navbar";

// interface ApiProject {
//   id: string;
//   title: string;
//   slug: string;
//   category: string;
//   description: string;
//   longDescription?: string;
//   technologies: string[];
//   tags: string[];
//   githubLink?: string;
//   liveLink?: string;
//   status: string;
//   featured: boolean;
//   icon?: string;
//   thumbnail?: string;
//   images: any[];
//   order: number;
//   views: number;
// }

// export default function WorkPage() {
//   const router = useRouter();
//   const [gdProjects, setGdProjects] = useState<ApiProject[]>([]);
//   const [fsdProjects, setFsdProjects] = useState<ApiProject[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [loadError, setLoadError] = useState<string | null>(null);
//   const [selectedProject, setSelectedProject] = useState<any>(null);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentProjectImages, setCurrentProjectImages] = useState<any[]>([]);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [isHoveringBack, setIsHoveringBack] = useState(false);
//   const [isHoveringBegin, setIsHoveringBegin] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);

//   const fsdRef = useRef<HTMLDivElement>(null);
//   const gdRef = useRef<HTMLDivElement>(null);

//   const brandColor = "#2563EB";

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({
//         x: (e.clientX / window.innerWidth - 0.5) * 2,
//         y: (e.clientY / window.innerHeight - 0.5) * 2,
//       });
//     };
//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   // ── Load projects from localStorage (admin panel saves here) ──
//   useEffect(() => {
//     const loadProjects = () => {
//       try {
//         setIsLoading(true);
//         setLoadError(null);

//         // Get projects from localStorage
//         const storedProjects = localStorage.getItem('projects');
//         let allProjects: ApiProject[] = [];

//         if (storedProjects) {
//           const parsed = JSON.parse(storedProjects);
//           if (Array.isArray(parsed) && parsed.length > 0) {
//             allProjects = parsed;
//           }
//         }

//         // Filter projects by category
//         const gd = allProjects.filter(
//           (p) =>
//             p.category === "Graphic Design" ||
//             p.category === "UI/UX Design" ||
//             p.category === "Branding"
//         );

//         const fsd = allProjects.filter(
//           (p) =>
//             p.category === "Web Development" ||
//             p.category === "Full Stack" ||
//             p.category === "App Development"
//         );

//         setGdProjects(gd);
//         setFsdProjects(fsd);
//       } catch (error) {
//         console.error("Error loading projects:", error);
//         setLoadError("Failed to load projects. Please try again later.");
//         setGdProjects([]);
//         setFsdProjects([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadProjects();

//     // Listen for storage changes (when admin adds/updates projects)
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'projects') {
//         loadProjects();
//       }
//     };
//     window.addEventListener('storage', handleStorageChange);

//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []);

//   const displayGdProjects = gdProjects;
//   const displayFsdProjects = fsdProjects;

//   const openImageModal = (project: any) => {
//     setSelectedProject(project);
//     // Ensure images is an array
//     const images = Array.isArray(project.images) ? project.images : [];
//     setCurrentProjectImages(images);
//     setShowImageModal(true);
//   };

//   const openFullScreen = (image: string, index: number) => {
//     setFullScreenImage(image);
//     setCurrentImageIndex(index);
//   };

//   const closeFullScreen = () => {
//     setFullScreenImage(null);
//   };

//   const nextImage = () => {
//     if (currentProjectImages.length > 0) {
//       const nextIndex = (currentImageIndex + 1) % currentProjectImages.length;
//       setCurrentImageIndex(nextIndex);
//       setFullScreenImage(getImageSrc(currentProjectImages[nextIndex]));
//     }
//   };

//   const prevImage = () => {
//     if (currentProjectImages.length > 0) {
//       const prevIndex =
//         (currentImageIndex - 1 + currentProjectImages.length) % currentProjectImages.length;
//       setCurrentImageIndex(prevIndex);
//       setFullScreenImage(getImageSrc(currentProjectImages[prevIndex]));
//     }
//   };

//   const handleTouchStart = (e: React.TouchEvent) => {
//     setTouchStart(e.targetTouches[0].clientX);
//   };

//   const handleTouchMove = (e: React.TouchEvent) => {
//     setTouchEnd(e.targetTouches[0].clientX);
//   };

//   const handleTouchEnd = () => {
//     if (!touchStart || !touchEnd) return;
//     const distance = touchStart - touchEnd;
//     if (distance > 50) nextImage();
//     if (distance < -50) prevImage();
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (fullScreenImage) {
//         if (e.key === "ArrowRight") nextImage();
//         if (e.key === "ArrowLeft") prevImage();
//         if (e.key === "Escape") closeFullScreen();
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [fullScreenImage, currentImageIndex, currentProjectImages]);

//   const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
//     if (ref.current) {
//       ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   };

//   const fadeInUp: Variants = {
//     hidden: { opacity: 0, y: 40 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
//     },
//   };

//   const cardVariants: Variants = {
//     hidden: { opacity: 0, y: 50, scale: 0.95 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
//     },
//     hover: {
//       y: -12,
//       scale: 1.02,
//       transition: { duration: 0.3, ease: "easeOut" },
//     },
//   };

//   const categoryCardVariants: Variants = {
//     hidden: { opacity: 0, y: 30, scale: 0.98 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
//     },
//     hover: {
//       y: -8,
//       scale: 1.02,
//       transition: { duration: 0.3, ease: "easeOut" },
//     },
//   };

//   const containerVariants: Variants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const handleHomeClick = () => {
//     router.push("/");
//   };

//   const handleChatClick = () => {
//     router.push("/book-project");
//   };

//   const getMouseGlowStyle = () => {
//     if (typeof window === "undefined") {
//       return {
//         width: "500px",
//         height: "500px",
//         x: 0,
//         y: 0,
//       };
//     }
//     return {
//       width: "500px",
//       height: "500px",
//       x: mousePosition.x * 60 + window.innerWidth / 2 - 250,
//       y: mousePosition.y * 60 + window.innerHeight / 2 - 250,
//     };
//   };

//   // Handles thumbnail (string) OR images array items, in string/{url}/{imageData} shapes
//   const getImageSrc = (image: any): string | null => {
//     if (!image) return null;
//     if (typeof image === "string") return image;
//     if (image.imageData) return image.imageData;
//     if (image.url) return image.url;
//     return null;
//   };

//   // Prefer explicit images array, fall back to the project's thumbnail field
//   const getProjectImages = (project: ApiProject) => {
//     if (project.images && Array.isArray(project.images) && project.images.length > 0) {
//       return project.images;
//     }
//     if (project.thumbnail) return [project.thumbnail];
//     return [];
//   };

//   return (
//     <div className="min-h-screen bg-black overflow-x-hidden">

//       {/* ========== ENHANCED FLOATING ACTION BUTTONS ========== */}
//       <div
//         className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[9999] pointer-events-auto"
//         style={{
//           position: "fixed",
//           top: "16px",
//           right: "16px",
//           zIndex: 9999,
//           pointerEvents: "auto",
//           isolation: "isolate",
//           transform: "none",
//           filter: "none",
//           perspective: "none",
//         }}
//       >
//         <div className="flex flex-wrap gap-2 sm:gap-3 max-w-[90vw] sm:max-w-none pointer-events-auto">

//           {/* Home Button */}
//           <motion.button
//             initial={{ opacity: 0, x: 30, rotate: -10 }}
//             animate={{ opacity: 1, x: 0, rotate: 0 }}
//             transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
//             whileHover={{ scale: 1.08, rotate: -3, boxShadow: "0 0 40px rgba(37,99,235,0.25)" }}
//             whileTap={{ scale: 0.92 }}
//             onHoverStart={() => setIsHoveringBack(true)}
//             onHoverEnd={() => setIsHoveringBack(false)}
//             onClick={handleHomeClick}
//             className="group relative px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#2563EB]/50 text-white font-medium text-[10px] sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 overflow-hidden touch-manipulation active:scale-95 pointer-events-auto cursor-pointer"
//           >
//             <motion.div
//               className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/0 via-[#2563EB]/15 to-[#2563EB]/0"
//               initial={{ x: "-100%" }}
//               animate={{ x: isHoveringBack ? "100%" : "-100%" }}
//               transition={{ duration: 0.8, ease: "easeInOut" }}
//             />
//             <motion.svg
//               className="w-3 sm:w-4 h-3 sm:h-4 relative z-30"
//               animate={{ x: isHoveringBack ? -4 : 0, rotate: isHoveringBack ? -10 : 0 }}
//               transition={{ type: "spring", stiffness: 400, damping: 10 }}
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//             </motion.svg>
//             <motion.span
//               className="relative z-10 whitespace-nowrap"
//               animate={{ x: isHoveringBack ? -2 : 0 }}
//               transition={{ type: "spring", stiffness: 400, damping: 10 }}
//             >
//               <span className="hidden xs:inline">Back to</span> Home
//             </motion.span>
//           </motion.button>

//           {/* Chat Button */}
//           <motion.button
//             initial={{ opacity: 0, x: 30, y: -10 }}
//             animate={{ opacity: 1, x: 0, y: 0 }}
//             transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
//             whileHover={{ scale: 1.05, y: -2, boxShadow: "0 0 60px rgba(37,99,235,0.5), 0 0 120px rgba(37,99,235,0.2)" }}
//             whileTap={{ scale: 0.95 }}
//             onHoverStart={() => setIsHoveringBegin(true)}
//             onHoverEnd={() => setIsHoveringBegin(false)}
//             onClick={handleChatClick}
//             className="group relative px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#1D4ED8] text-white font-medium text-[10px] sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 overflow-hidden shadow-lg shadow-[#2563EB]/30 touch-manipulation active:scale-95 pointer-events-auto cursor-pointer"
//           >
//             <motion.div
//               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
//               animate={{ x: isHoveringBegin ? "200%" : "-200%" }}
//               transition={{ duration: 0.8, ease: "easeInOut", repeat: isHoveringBegin ? Infinity : 0, repeatDelay: 0.5 }}
//             />
//             <motion.div
//               className="relative z-10 flex items-center gap-1.5 sm:gap-2"
//               animate={{ scale: isHoveringBegin ? [1, 1.1, 1] : 1 }}
//               transition={{ duration: 0.5, repeat: isHoveringBegin ? Infinity : 0, ease: "easeInOut" }}
//             >
//               <svg className="w-3 sm:w-4 h-5 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//               </svg>
//               <motion.span className="whitespace-nowrap">
//                 <span className="hidden xs:inline">Begin </span>Chat
//               </motion.span>
//             </motion.div>
//             <motion.svg
//               className="w-3 sm:w-4 h-3 sm:h-4 relative z-10"
//               animate={{ x: isHoveringBegin ? 4 : 0, rotate: isHoveringBegin ? 5 : 0 }}
//               transition={{ type: "spring", stiffness: 400, damping: 10 }}
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//             </motion.svg>
//           </motion.button>
//         </div>
//       </div>

//       {/* ========== PREMIUM BACKGROUND ========== */}
//       <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
//         <motion.div
//           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
//           animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         >
//           <div className="w-full h-full bg-[#2563EB]/8 blur-[180px] rounded-full" />
//         </motion.div>

//         <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#2563EB]/10 blur-[150px] rounded-full" />
//         <div className="absolute top-[-150px] right-[-100px] w-[400px] h-[400px] bg-[#1D4ED8]/6 blur-[120px] rounded-full" />

//         <svg className="absolute inset-0 w-full h-full opacity-[0.015] hidden sm:block">
//           <pattern id="brandGrid" width="60" height="60" patternUnits="userSpaceOnUse">
//             <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2563EB" strokeWidth="0.5" />
//             <circle cx="0" cy="0" r="1" fill="#2563EB" opacity="0.3" />
//           </pattern>
//           <rect width="100%" height="100%" fill="url(#brandGrid)" />
//         </svg>

//         <div className="absolute top-0 left-0 right-0 h-[8vh] bg-gradient-to-b from-black/60 to-transparent" />
//         <div className="absolute bottom-0 left-0 right-0 h-[8vh] bg-gradient-to-t from-black/60 to-transparent" />
//         <div className="absolute inset-0 bg-radial-vignette from-transparent via-transparent to-black/70" />
//       </div>

//       {/* ========== MOUSE GLOW ========== */}
//       {isMounted && (
//         <motion.div
//           className="fixed pointer-events-none z-0 hidden lg:block"
//           style={getMouseGlowStyle()}
//           transition={{ type: "spring", stiffness: 20, damping: 25 }}
//         >
//           <div className="w-full h-full bg-gradient-radial from-[#2563EB]/8 via-[#2563EB]/3 to-transparent rounded-full blur-3xl" />
//         </motion.div>
//       )}

//       <Navbar />

//       {/* ========== HERO ========== */}
//       <div className="relative z-10 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 text-center px-4">
//         <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="relative">
//           <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white">
//             <span className=" from-white via-white ">WORKS</span>
//           </h1>
//           <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-2 mt-4 font-light tracking-wide">
//             Exploring the intersection of design and development
//           </p>
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ delay: 0.6, duration: 0.8 }}
//             className="mt-6 h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-[#2563EB]/40 to-transparent"
//           />
//         </motion.div>
//       </div>

//       {/* ========== ERROR STATE ========== */}
//       {loadError && !isLoading && (
//         <div className="relative z-10 max-w-3xl mx-auto px-4 pb-8 text-center">
//           <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
//             {loadError}
//           </div>
//         </div>
//       )}

//       {/* ========== CATEGORY CARDS ========== */}
//       <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16 sm:pb-20">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Full Stack */}
//           <motion.div
//             variants={categoryCardVariants}
//             initial="hidden"
//             animate="visible"
//             whileHover="hover"
//             onClick={() => scrollToSection(fsdRef)}
//             className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/5 hover:border-[#2563EB]/30 cursor-pointer transition-all duration-500 overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
//             <div className="flex items-center gap-4 mb-4">
//               <div className="w-12 h-12 rounded-xl bg-[#2563EB]/15 flex items-center justify-center group-hover:bg-[#2563EB]/25 transition-colors duration-300">
//                 <svg className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                 </svg>
//               </div>
//               <span className="text-sm text-gray-500 font-light">{displayFsdProjects.length} projects</span>
//             </div>
//             <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-[#2563EB] transition-colors duration-300">
//               Full Stack Development
//             </h2>
//             <p className="text-gray-400 text-sm font-light mt-3 max-w-md">
//               End-to-end web applications with modern technologies and clean architecture.
//             </p>
//             <div className="mt-6 flex items-center gap-2 text-[#2563EB] font-medium text-sm group-hover:gap-3 transition-all duration-300">
//               Explore Projects
//               <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//               </svg>
//             </div>
//           </motion.div>

//           {/* Graphic Design */}
//           <motion.div
//             variants={categoryCardVariants}
//             initial="hidden"
//             animate="visible"
//             transition={{ delay: 0.1 }}
//             whileHover="hover"
//             onClick={() => scrollToSection(gdRef)}
//             className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/5 hover:border-[#2563EB]/30 cursor-pointer transition-all duration-500 overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
//             <div className="flex items-center gap-4 mb-4">
//               <div className="w-12 h-12 rounded-xl bg-[#2563EB]/15 flex items-center justify-center group-hover:bg-[#2563EB]/25 transition-colors duration-300">
//                 <svg className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </div>
//               <span className="text-sm text-gray-500 font-light">{displayGdProjects.length} projects</span>
//             </div>
//             <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-[#2563EB] transition-colors duration-300">
//               Graphic Design
//             </h2>
//             <p className="text-gray-400 text-sm font-light mt-3 max-w-md">
//               Visual identities, UI/UX design, and creative branding solutions.
//             </p>
//             <div className="mt-6 flex items-center gap-2 text-[#2563EB] font-medium text-sm group-hover:gap-3 transition-all duration-300">
//               Explore Projects
//               <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//               </svg>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* ========== FULL STACK SECTION ========== */}
//       <div ref={fsdRef} className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:py-16">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//           className="mb-10"
//         >
//           <div className="flex items-center gap-4">
//             <div className="w-1 h-8 bg-[#2563EB] rounded-full" />
//             <div>
//               <h2 className="text-2xl font-bold text-white tracking-tight">Full Stack</h2>
//               <p className="text-gray-500 text-sm font-light">{displayFsdProjects.length} projects</p>
//             </div>
//           </div>
//         </motion.div>

//         {isLoading ? (
//           <div className="text-center py-20">
//             <div
//               className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
//               style={{ borderColor: `${brandColor} transparent ${brandColor} transparent` }}
//             />
//           </div>
//         ) : displayFsdProjects.length === 0 ? (
//           <div className="text-center py-16 text-gray-500 font-light">No projects published yet.</div>
//         ) : (
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//           >
//             {displayFsdProjects.map((project, index) => {
//               const images = getProjectImages(project);
//               const mainImage = images.length > 0 ? getImageSrc(images[0]) : null;
//               const imageCount = images.length;

//               return (
//                 <motion.div
//                   key={project.id || index}
//                   variants={cardVariants}
//                   whileHover="hover"
//                   className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 hover:border-[#2563EB]/30 transition-all duration-500"
//                 >
//                   <div className="absolute top-4 right-4 z-10 text-3xl font-black text-white/5 group-hover:text-[#2563EB]/10 transition-colors duration-500">
//                     {String(index + 1).padStart(2, "0")}
//                   </div>

//                   <div className="relative h-48 overflow-hidden" style={{ backgroundColor: brandColor + "08" }}>
//                     {mainImage ? (
//                       <>
//                         <img
//                           src={mainImage}
//                           alt={project.title}
//                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                         />
//                         {imageCount > 1 && (
//                           <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
//                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                             </svg>
//                             {imageCount}
//                           </div>
//                         )}
//                       </>
//                     ) : (
//                       <div className="w-full h-full flex flex-col items-center justify-center">
//                         <svg className="w-10 h-10 text-[#2563EB]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                         </svg>
//                         <span className="text-xs mt-2 text-center px-4 text-gray-500">{project.title}</span>
//                       </div>
//                     )}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//                   </div>

//                   <div className="p-5">
//                     <span className="text-xs font-medium text-[#2563EB] tracking-[0.1em] uppercase">{project.category}</span>
//                     <h3 className="text-base font-bold text-white mt-1 group-hover:text-[#2563EB] transition-colors duration-300 line-clamp-1">
//                       {project.title}
//                     </h3>
//                     <p className="text-gray-400 text-sm mt-1 line-clamp-2 font-light">{project.description}</p>

//                     {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
//                       <div className="flex flex-wrap gap-1.5 mt-3">
//                         {project.technologies.slice(0, 3).map((tech: string) => (
//                           <span key={tech} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
//                             {tech}
//                           </span>
//                         ))}
//                         {project.technologies.length > 3 && (
//                           <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
//                             +{project.technologies.length - 3}
//                           </span>
//                         )}
//                       </div>
//                     )}

//                     <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           if (images.length > 0) {
//                             openImageModal({ ...project, images });
//                           } else if (project.liveLink) {
//                             window.open(project.liveLink, "_blank");
//                           }
//                         }}
//                         className="text-xs font-medium text-[#2563EB] group-hover:text-[#3B82F6] transition-colors duration-300 flex items-center gap-1"
//                       >
//                         View {imageCount > 0 ? `(${imageCount} images)` : ""}
//                         <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         )}
//       </div>

//       {/* ========== GRAPHIC DESIGN SECTION ========== */}
//       <div ref={gdRef} className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:py-16 pb-24 sm:pb-32">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//           className="mb-10"
//         >
//           <div className="flex items-center gap-4">
//             <div className="w-1 h-8 bg-[#2563EB] rounded-full" />
//             <div>
//               <h2 className="text-2xl font-bold text-white tracking-tight">Graphic Design</h2>
//               <p className="text-gray-500 text-sm font-light">{displayGdProjects.length} projects</p>
//             </div>
//           </div>
//         </motion.div>

//         {isLoading ? (
//           <div className="text-center py-20">
//             <div
//               className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
//               style={{ borderColor: `${brandColor} transparent ${brandColor} transparent` }}
//             />
//           </div>
//         ) : displayGdProjects.length === 0 ? (
//           <div className="text-center py-16 text-gray-500 font-light">No projects published yet.</div>
//         ) : (
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
//           >
//             {displayGdProjects.map((project, index) => {
//               const images = getProjectImages(project);
//               const mainImage = images.length > 0 ? getImageSrc(images[0]) : null;
//               const imageCount = images.length;

//               return (
//                 <motion.div
//                   key={project.id || index}
//                   variants={cardVariants}
//                   whileHover="hover"
//                   className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 hover:border-[#2563EB]/30 transition-all duration-500 cursor-pointer"
//                   onClick={() => {
//                     if (images.length > 0) {
//                       openImageModal({ ...project, images });
//                     } else if (project.liveLink) {
//                       window.open(project.liveLink, "_blank");
//                     }
//                   }}
//                 >
//                   <div className="absolute top-4 right-4 z-10 text-3xl font-black text-white/5 group-hover:text-[#2563EB]/10 transition-colors duration-500">
//                     {String(index + 1).padStart(2, "0")}
//                   </div>

//                   <div className="relative h-48 overflow-hidden" style={{ backgroundColor: brandColor + "08" }}>
//                     {mainImage ? (
//                       <>
//                         <img
//                           src={mainImage}
//                           alt={project.title}
//                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                         />
//                         {imageCount > 1 && (
//                           <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
//                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                             </svg>
//                             {imageCount}
//                           </div>
//                         )}
//                       </>
//                     ) : (
//                       <div className="w-full h-full flex flex-col items-center justify-center">
//                         <svg className="w-10 h-10 text-[#2563EB]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                         <span className="text-xs mt-2 text-center px-4 text-gray-500">{project.title}</span>
//                       </div>
//                     )}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//                   </div>

//                   <div className="p-5">
//                     <span className="text-xs font-medium text-[#2563EB] tracking-[0.1em] uppercase">{project.category}</span>
//                     <h3 className="text-base font-bold text-white mt-1 group-hover:text-[#2563EB] transition-colors duration-300 line-clamp-1">
//                       {project.title}
//                     </h3>
//                     <p className="text-gray-400 text-sm mt-1 line-clamp-2 font-light">{project.description}</p>

//                     <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
//                       <span className="text-xs font-medium text-[#2563EB] group-hover:text-[#3B82F6] transition-colors duration-300 flex items-center gap-1">
//                         View {imageCount > 0 ? `(${imageCount} images)` : ""}
//                         <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                         </svg>
//                       </span>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         )}
//       </div>

//       {/* ========== IMAGE MODAL ========== */}
//       <AnimatePresence>
//         {showImageModal && selectedProject && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
//             onClick={() => setShowImageModal(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               className="relative max-w-6xl w-full bg-[#0d0d0d] rounded-2xl overflow-hidden mx-2 sm:mx-0 border border-white/10 shadow-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex justify-between items-center p-4 border-b border-white/5">
//                 <div className="flex-1 min-w-0">
//                   <h2 className="text-base font-bold text-white truncate">{selectedProject.title}</h2>
//                   <p className="text-xs text-gray-400 truncate">
//                     {selectedProject.category} • {selectedProject.images?.length || 0} images
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setShowImageModal(false)}
//                   className="text-gray-400 hover:text-white text-2xl ml-2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="p-3 sm:p-4 max-h-[65vh] sm:max-h-[75vh] overflow-y-auto">
//                 {selectedProject.images && Array.isArray(selectedProject.images) && selectedProject.images.length > 0 ? (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                     {selectedProject.images.map((img: any, idx: number) => {
//                       const src = getImageSrc(img);
//                       return (
//                         <motion.div
//                           key={idx}
//                           className="relative group cursor-pointer rounded-xl overflow-hidden bg-[#1a1a1a] aspect-square"
//                           onClick={() => src && openFullScreen(src, idx)}
//                           whileHover={{ scale: 1.05 }}
//                           transition={{ duration: 0.2 }}
//                         >
//                           {src && (
//                             <img
//                               src={src}
//                               alt={`${selectedProject.title} - ${idx + 1}`}
//                               className="w-full h-full object-cover"
//                             />
//                           )}
//                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
//                             <span className="text-white text-xs font-medium flex flex-col items-center gap-1">
//                               <span className="text-2xl">🔍</span>
//                               <span>View #{idx + 1}</span>
//                             </span>
//                           </div>
//                           {idx === 0 && (
//                             <div className="absolute top-2 left-2 bg-[#2563EB] text-white text-[9px] px-2 py-0.5 rounded-full font-medium">
//                               MAIN
//                             </div>
//                           )}
//                           <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full">
//                             #{idx + 1}
//                           </div>
//                         </motion.div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <div className="text-center py-12 text-gray-400 font-light">No images available</div>
//                 )}
//               </div>

//               <div className="p-3 sm:p-4 border-t border-white/5 flex justify-between items-center">
//                 <div className="text-xs text-gray-500">Click on any image to view full size</div>
//                 <button
//                   onClick={() => setShowImageModal(false)}
//                   className="px-5 py-1.5 text-white rounded-xl text-sm font-medium transition-all bg-[#2563EB] hover:bg-[#1D4ED8] hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]"
//                 >
//                   Close Gallery
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ========== FULL SCREEN VIEWER ========== */}
//       <AnimatePresence>
//         {fullScreenImage && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/98 z-[60] flex items-center justify-center"
//             onClick={closeFullScreen}
//             onTouchStart={handleTouchStart}
//             onTouchMove={handleTouchMove}
//             onTouchEnd={handleTouchEnd}
//           >
//             <button
//               onClick={closeFullScreen}
//               className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition text-xl z-10"
//             >
//               ✕
//             </button>

//             {currentProjectImages.length > 1 && (
//               <>
//                 <button
//                   onClick={(e) => { e.stopPropagation(); prevImage(); }}
//                   className="absolute left-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-12 h-12 flex items-center justify-center transition text-2xl z-10"
//                 >
//                   ◀
//                 </button>
//                 <button
//                   onClick={(e) => { e.stopPropagation(); nextImage(); }}
//                   className="absolute right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-12 h-12 flex items-center justify-center transition text-2xl z-10"
//                 >
//                   ▶
//                 </button>
//               </>
//             )}

//             {currentProjectImages.length > 1 && (
//               <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/60 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-light z-10">
//                 {currentImageIndex + 1} / {currentProjectImages.length}
//               </div>
//             )}

//             <motion.img
//               src={fullScreenImage}
//               alt="Full screen view"
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="max-w-[95vw] max-h-[85vh] sm:max-w-[90vw] sm:max-h-[90vh] object-contain cursor-pointer"
//               onClick={(e) => e.stopPropagation()}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ========== BACK TO TOP ========== */}
//       <motion.button
//         initial={{ opacity: 0, scale: 0 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 1 }}
//         whileHover={{ scale: 1.08 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//         className="fixed bottom-6 right-6 text-white w-11 h-11 rounded-full shadow-2xl transition-all flex items-center justify-center z-40 text-base bg-[#2563EB] hover:bg-[#1D4ED8] hover:shadow-[0_0_50px_rgba(37,99,235,0.4)]"
//       >
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
//         </svg>
//       </motion.button>

//       {/* ========== FOOTER ========== */}
//       <footer className="relative z-10 text-center py-8 text-gray-500 text-xs sm:text-sm border-t border-white/5 bg-black/30 backdrop-blur-sm">
//         <p className="tracking-wider">
//           © 2024 <span className="text-[#2563EB] font-semibold">CraftCode</span>. All rights reserved.
//         </p>
//       </footer>

//       <style jsx>{`
//         .line-clamp-1 {
//           display: -webkit-box;
//           -webkit-line-clamp: 1;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//         .bg-radial-vignette {
//           background: radial-gradient(ellipse at center, transparent 50%, black 100%);
//         }
//         .bg-gradient-radial {
//           background: radial-gradient(var(--tw-gradient-stops));
//         }
//         .touch-manipulation {
//           touch-action: manipulation;
//           -webkit-tap-highlight-color: transparent;
//         }
//         @media (min-width: 480px) {
//           .xs\\:inline {
//             display: inline;
//           }
//         }
//         @media (max-width: 479px) {
//           .xs\\:inline {
//             display: none;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
















