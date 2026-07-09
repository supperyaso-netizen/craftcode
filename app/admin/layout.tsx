"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderOpen, 
  PlusCircle, 
  MessageSquare,
  Settings,
  Image as ImageIcon,
  BarChart3,
  Tags,
  LogOut,
  Home,
  Menu,
  X,
  Search,
  Bell
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/projects', label: 'Projects', icon: FolderOpen },
    { path: '/admin/projects/new', label: 'New Project', icon: PlusCircle },
    { path: '/admin/categories', label: 'Categories', icon: Tags },
    { path: '/admin/media', label: 'Media Library', icon: ImageIcon },
    { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed md:relative z-50 w-[280px] h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col ${
          isMobile ? 'shadow-2xl' : ''
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-[#2563EB]/20 group-hover:shadow-[#2563EB]/40 transition-all duration-300">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight group-hover:text-[#2563EB] transition-colors">
                CraftCode
              </h1>
              <p className="text-[#2563EB] text-[10px] tracking-[0.2em] uppercase font-medium">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.path !== '/admin' && pathname?.startsWith(item.path) && item.path !== '/admin/projects/new');
            
            const isNewProject = pathname === '/admin/projects/new';
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive || (item.path === '/admin/projects/new' && isNewProject)
                      ? 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {(isActive || (item.path === '/admin/projects/new' && isNewProject)) && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-8 rounded-full bg-[#2563EB]"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300">
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Site</span>
            </button>
          </Link>
          <button 
            onClick={() => router.push('/admin/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300 md:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/5 w-[200px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-500"
              />
              <kbd className="text-xs text-gray-500 hidden sm:block">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            </button>
            <Link href="/">
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#2563EB]/30 transition-all duration-300">
                View Site
              </button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}