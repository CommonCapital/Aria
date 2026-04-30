'use client'

import React, { useState, useEffect } from 'react'
import RunAgentButton from './ui/RunAgentButton'
import { Badge } from '@/components/ui/badge'
import {
  ZapIcon, Clock, Activity, Timer, FileText, Mail,
  CheckCircle2, CircleIcon, ChevronRight, Sparkles,
  Inbox, PenLine, ListTodo, Menu, X, Bell, User as UserIcon
} from 'lucide-react'
import { AgentRun, Integration, User } from '@/app/db/schema'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { VoiceInterface } from '@/components/aria/voice-interface'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  latestRun: AgentRun | null
  userIntegrations: Integration[] | []
  User: User[]
  emailsProcessed: number
  draftsCreated: number
  tasksCreated: number
}

const statusConfig = {
  running: { label: 'Active', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20', dot: 'bg-amber-500 animate-pulse' },
  success: { label: 'Harmony', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' },
  failed:  { label: 'Interrupted',  className: 'bg-rose-500/10 text-rose-500 border-rose-500/20', dot: 'bg-rose-500' },
}

function StatRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/[0.03] last:border-0">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-800 text-right truncate max-w-[50%]">
        {value}
      </span>
    </div>
  )
}

export const Dashboard = ({ latestRun, userIntegrations, User, emailsProcessed, draftsCreated, tasksCreated }: Props) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState("Aria is keeping an eye on things");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const status = latestRun?.status
  const badge = status ? statusConfig[status] : null

  const gmailConnected = userIntegrations.find((i) => i.provider === 'gmail')
  const googleCalendarConnected = userIntegrations.find((i) => i.provider === 'google_calendar')

  const onboardingSteps = [
    { name: 'Sync Gmail',           completed: !!gmailConnected,         href: '/settings', icon: Mail  },
    { name: 'Sync Calendar', completed: !!googleCalendarConnected, href: '/settings', icon: Clock },
  ]

  const completedCount     = onboardingSteps.filter((s) => s.completed).length
  const progressPercentage = Math.round((completedCount / onboardingSteps.length) * 100)

  const stats = [
    { label: 'Unread',  value: emailsProcessed, icon: Inbox,    color: 'text-amber-600',    bg: 'bg-amber-50',    border: 'border-amber-100'    },
    { label: 'Drafts', value: draftsCreated,    icon: PenLine,  color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { label: 'Tasks',  value: tasksCreated,    icon: ListTodo, color: 'text-emerald-600',  bg: 'bg-emerald-50',  border: 'border-emerald-100'  },
  ]

  return (
    <div className="min-h-screen bg-[#fdfcf7] text-gray-900 font-sans selection:bg-amber-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* MOBILE NAVIGATION */}
      <nav className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="font-serif italic text-2xl text-amber-600">Aria</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-500">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* DESKTOP SIDEBAR (Simplified for Gorgeous UI) */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-100 p-8 flex-col justify-between">
        <div className="space-y-10">
          <div className="font-serif italic text-3xl text-amber-600">Aria</div>
          <div className="space-y-1">
            {['Dashboard', 'Conversations', 'Tasks', 'Memories', 'Settings'].map((item, i) => (
              <button key={item} className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${i === 0 ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-3xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
            {User[0]?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{User[0]?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">Pro Companion</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 p-6 lg:p-12 max-w-5xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif italic mb-2">Morning, {User[0]?.name?.split(' ')[0] || 'there'}</h1>
            <p className="text-gray-500 font-medium">I&apos;ve prepared your briefing. Ready when you are.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-amber-500 transition-colors shadow-sm">
              <Bell className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Sparkles className="w-4 h-4" />
              New Memory
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: VOICE & STATS */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Aria Voice Interface Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[40px] bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
            >
              <div className="absolute top-0 right-0 p-8">
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-serif italic px-4 py-1">Voice First</Badge>
              </div>
              <VoiceInterface 
                isListening={isListening}
                isSpeaking={isSpeaking}
                onToggleListen={() => setIsListening(!isListening)}
                statusText={statusText}
              />
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h4>
                  <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity / Action Log */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-serif italic">Aria&apos;s Actions</h3>
                <Link href="/dashboard/monitoring" className="text-sm font-bold text-amber-600">History →</Link>
              </div>
              
              {latestRun ? (
                <div className="space-y-1">
                  <StatRow icon={Clock}    label="Cared at"  value={new Date(latestRun.startedAt).toLocaleTimeString()} />
                  <StatRow icon={Activity} label="Status"    value={latestRun.status.charAt(0).toUpperCase() + latestRun.status.slice(1)} />
                  <div className="py-6">
                    <p className="text-sm text-gray-400 mb-3 font-medium uppercase tracking-wider">Aria&apos;s Summary</p>
                    <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 text-gray-700 text-sm leading-relaxed italic">
                      &ldquo;{latestRun.summary || "I've handled everything for now. You can rest easy."}&rdquo;
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 font-medium">
                  I haven&apos;t performed any actions yet. Shall we start?
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ONBOARDING & STATUS */}
          <div className="space-y-8">
            
            {/* Onboarding / Setup */}
            {!User[0]?.onboardingCompleted && (
              <div className="bg-amber-600 rounded-[40px] p-8 text-white shadow-xl shadow-amber-600/20 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <h3 className="text-2xl font-serif italic mb-2">Final Touches</h3>
                <p className="text-white/80 text-sm mb-6">Let&apos;s connect your life so I can support you better.</p>
                
                <div className="space-y-3 mb-8">
                  {onboardingSteps.map((step) => (
                    <Link key={step.name} href={step.href}>
                      <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${step.completed ? 'bg-white/10 border-white/10 opacity-50' : 'bg-white/20 border-white/20 hover:bg-white/30'}`}>
                        <div className="flex items-center gap-3">
                          {step.completed ? <CheckCircle2 className="w-5 h-5 text-amber-200" /> : <CircleIcon className="w-5 h-5 text-white/40" />}
                          <span className="text-sm font-semibold">{step.name}</span>
                        </div>
                        {!step.completed && <ChevronRight className="w-4 h-4" />}
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/60">
                    <span>Sync Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1.5 bg-white/10" />
                </div>
              </div>
            )}

            {/* Integration Status */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-serif italic mb-6">Connected Brains</h3>
              <div className="space-y-4">
                {[
                  { name: 'Gmail', connected: !!gmailConnected, icon: Mail },
                  { name: 'Calendar', connected: !!googleCalendarConnected, icon: Clock },
                  { name: 'Telegram', connected: true, icon: Activity },
                ].map((integ) => (
                  <div key={integ.name} className="flex items-center justify-between p-4 rounded-3xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${integ.connected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                        <integ.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{integ.name}</span>
                    </div>
                    {integ.connected ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px]">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-400 border-gray-200 text-[10px]">Offline</Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <RunAgentButton />
              </div>
            </div>

            {/* Aria's Thought of the Day */}
            <div className="p-8 rounded-[40px] bg-rose-50 border border-rose-100">
               <h4 className="text-rose-900 font-bold text-sm mb-2">Aria&apos;s Thought</h4>
               <p className="text-rose-800 text-sm leading-relaxed italic">
                 &ldquo;The best way to predict the future is to create it, but don&apos;t forget to breathe along the way. I&apos;m here if it gets heavy.&rdquo;
               </p>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Aria's specialized mobile bar) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-[32px] p-2 flex items-center justify-between shadow-2xl shadow-black/10">
          {['Home', 'Chat', 'Tasks', 'Memories'].map((item, i) => (
            <button key={item} className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-colors ${i === 0 ? 'bg-amber-50 text-amber-600' : 'text-gray-400'}`}>
              <div className="text-[10px] font-bold uppercase tracking-tighter mt-1">{item}</div>
            </button>
          ))}
        </div>
      </div>
      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white p-8 lg:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="font-serif italic text-3xl text-amber-600">Aria</div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                <X />
              </button>
            </div>
            <div className="space-y-6">
              {['Dashboard', 'Conversations', 'Tasks', 'Memories', 'Settings'].map((item) => (
                <button 
                  key={item} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-left text-2xl font-serif italic text-gray-800 border-b border-gray-100 pb-4"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}