'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    publishedProjects: 0,
    totalMessages: 0,
    unreadMessages: 0,
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/projects')
        const projects = await res.json()
        setRecentProjects(projects.slice(0, 5))
        setStats(prev => ({
          ...prev,
          totalProjects: projects.length,
          publishedProjects: projects.filter((p: any) => p.status === 'published').length,
        }))
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/20', link: '/admin/projects' },
    { label: 'Published', value: stats.publishedProjects, color: 'from-green-500/20 to-green-600/20', border: 'border-green-500/20', link: '/admin/projects' },
    { label: 'Messages', value: stats.totalMessages, color: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/20', link: '/admin/messages' },
    { label: 'Unread', value: stats.unreadMessages, color: 'from-orange-500/20 to-orange-600/20', border: 'border-orange-500/20', link: '/admin/messages' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back to CraftCode Admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link href={card.link} key={i}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 border ${card.border} cursor-pointer`}
            >
              {isLoading ? (
                <div className="h-8 w-16 bg-white/10 rounded animate-pulse mb-2" />
              ) : (
                <p className="text-3xl font-bold text-white">{card.value}</p>
              )}
              <p className="text-gray-400 text-sm mt-1">{card.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Recent Projects</h2>
          <Link href="/admin/projects">
            <span className="text-[#2563EB] text-sm hover:underline">View all</span>
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                <div className="flex-1 h-4 bg-white/5 rounded" />
                <div className="h-6 w-20 bg-white/5 rounded-full" />
              </div>
            ))
          ) : recentProjects.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No projects yet</p>
              <Link href="/admin/projects/new">
                <span className="text-[#2563EB] text-sm mt-2 inline-block hover:underline">Create your first project</span>
              </Link>
            </div>
          ) : (
            recentProjects.map((project: any) => (
              <div key={project.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-white font-medium text-sm">{project.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{project.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  project.status === 'published'
                    ? 'text-green-400 bg-green-500/10 border-green-500/20'
                    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                }`}>
                  {project.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'New Project', href: '/admin/projects/new', desc: 'Add a new project' },
          { label: 'View Messages', href: '/admin/messages', desc: 'Check your inbox' },
          { label: 'Settings', href: '/admin/settings', desc: 'Configure your site' },
        ].map((action, i) => (
          <Link href={action.href} key={i}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-[#2563EB]/30 cursor-pointer transition-all"
            >
              <p className="text-white font-semibold">{action.label}</p>
              <p className="text-gray-400 text-sm mt-1">{action.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}