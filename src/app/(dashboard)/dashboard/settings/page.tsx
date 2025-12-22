'use client'

import { useEffect, useState } from 'react'
import { useCopilotReadable } from '@copilotkit/react-core'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Settings, Bell, Zap, User } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await (supabase
          .from('profiles') as any)
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name,
        })
        .eq('id', profile.id)

      if (error) throw error

      alert('Settings saved successfully!')
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={profile?.company_name || ''}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>

          {/* Notification Settings */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <Bell className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
                <span className="text-sm">Email notifications for new content</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4 rounded" defaultChecked />
                <span className="text-sm">Weekly performance reports</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4 rounded" />
                <span className="text-sm">Marketing tips and updates</span>
              </label>
            </div>
          </div>

          {/* Automation Settings */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Automation</h2>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              Configure automation settings through the AI assistant for each company individually.
            </p>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                💡 Tip: Ask the AI assistant to "setup automation" when viewing a company to configure
                automatic content generation and scheduling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
