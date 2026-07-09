'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'CraftCode',
    siteTitle: 'CraftCode - Premium Digital Studio',
    siteDescription: 'Crafting brands people remember',
    email: 'hello@craftcode.com',
    phone: '+1 234 567 890',
    address: '123 Design Street, Creative City',
    instagram: 'https://instagram.com/craftcode',
    twitter: 'https://twitter.com/craftcode',
    linkedin: 'https://linkedin.com/company/craftcode',
    youtube: 'https://youtube.com/craftcode',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setSettings(prev => ({ ...prev, ...data }))
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      showToast(res.ok ? '✅ Settings saved!' : '❌ Save failed')
    } catch {
      showToast('❌ Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  const showToast = (message: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-[#0a0a0a] border border-white/10 text-white px-6 py-3 rounded-xl shadow-lg z-50'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#2563EB]/50 text-white outline-none transition-all"
  const labelClass = "block text-gray-300 text-sm font-medium mb-2"

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your site configuration</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-6 space-y-6">
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">Site Information</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Site Name</label>
              <input type="text" value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Site Title</label>
              <input type="text" value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Site Description</label>
              <textarea value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={2} className={`${inputClass} resize-none`} />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <h2 className="text-white font-semibold text-lg mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="text" value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input type="text" value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className={inputClass} />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <h2 className="text-white font-semibold text-lg mb-4">Social Links</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Instagram</label>
              <input type="url" value={settings.instagram}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Twitter / X</label>
              <input type="url" value={settings.twitter}
                onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input type="url" value={settings.linkedin}
                onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>YouTube</label>
              <input type="url" value={settings.youtube}
                onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
                className={inputClass} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#2563EB]/30 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}