import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Plus } from 'lucide-react'

const platforms = [
  { name: 'Facebook', followers: 8420, engagementRate: 4.2, postsThisMonth: 12, trend: 'up', reach: 32100 },
  { name: 'Instagram', followers: 5830, engagementRate: 6.8, postsThisMonth: 18, trend: 'up', reach: 19400 },
  { name: 'X / Twitter', followers: 2140, engagementRate: 2.1, postsThisMonth: 24, trend: 'down', reach: 7800 },
  { name: 'LinkedIn', followers: 1290, engagementRate: 5.4, postsThisMonth: 6, trend: 'up', reach: 4200 },
]

const reachData = [
  { month: 'Oct', fb: 28000, ig: 14000 },
  { month: 'Nov', fb: 31000, ig: 16000 },
  { month: 'Dec', fb: 35000, ig: 18000 },
  { month: 'Jan', fb: 29000, ig: 15000 },
  { month: 'Feb', fb: 33000, ig: 17000 },
  { month: 'Mar', fb: 32000, ig: 19000 },
]

const posts = [
  { id: '1', platform: 'Facebook', content: 'This quarter, 19 families found safety in our shelter thanks to your support. Every donation transforms a life. #ImariGhana #SafeHaven', date: '2025-04-02', status: 'published', reach: 4820 },
  { id: '2', platform: 'Instagram', content: 'Year of transformation — swipe to see our Q1 2025 impact in numbers. #Imari #HumanitarianGhana #GirlsProtection', date: '2025-04-01', status: 'published', reach: 6340 },
  { id: '3', platform: 'Facebook', content: 'Join our volunteer orientation this April 26 in Accra. Help us build a stronger network of community support.', date: '2025-04-18', status: 'scheduled', reach: null },
  { id: '4', platform: 'X / Twitter', content: 'We\'re hiring! Social worker position open at our Kumasi facility. Applications close May 10. Link in bio.', date: '2025-04-05', status: 'published', reach: 1240 },
  { id: '5', platform: 'LinkedIn', content: 'Imari\'s Executive Director, Amara Mensah, speaks at the 2025 African Nonprofit Leadership Summit in Accra.', date: '2025-04-10', status: 'scheduled', reach: null },
]

const platformColors: Record<string, string> = {
  'Facebook': 'bg-blue-50 text-blue-700',
  'Instagram': 'bg-pink-50 text-pink-700',
  'X / Twitter': 'bg-sky-50 text-sky-700',
  'LinkedIn': 'bg-indigo-50 text-indigo-700',
}

const tabs = ['Overview', 'Post Calendar', 'Analytics']

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-brand-border rounded-lg shadow-card px-3 py-2 text-xs">
      <p className="font-semibold text-brand-charcoal mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {(p.value / 1000).toFixed(0)}k</p>
      ))}
    </div>
  )
}

export default function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [newAlert, setNewAlert] = useState(false)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Social Media</h1>
          <p className="text-brand-muted text-sm mt-1">Platform performance and content calendar</p>
        </div>
        <button
          onClick={() => setNewAlert(true)}
          className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          <Plus className="w-4 h-4" />
          Draft Post
        </button>
      </div>

      {newAlert && (
        <div className="mb-4 flex items-center gap-2 bg-brand-teal-muted border border-brand-teal/20 rounded-lg px-4 py-3 text-sm text-brand-teal font-medium">
          Post drafting would open a scheduling editor in the full system.
          <button onClick={() => setNewAlert(false)} className="ml-auto text-brand-teal/70">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-brand-stone rounded-lg p-1 mb-6 w-fit gap-0.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white text-brand-charcoal shadow-sm' : 'text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview ───────────────────────────────────────────────────────── */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Platform tiles */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((p) => (
              <div key={p.name} className="bg-white border border-brand-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${platformColors[p.name]}`}>
                    {p.name}
                  </span>
                  {p.trend === 'up'
                    ? <TrendingUp className="w-3.5 h-3.5 text-brand-teal" />
                    : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  }
                </div>
                <p className="font-serif text-2xl text-brand-charcoal mb-0.5">
                  {p.followers.toLocaleString()}
                </p>
                <p className="text-xs text-brand-muted mb-3">followers</p>
                <div className="space-y-1 text-xs text-brand-muted">
                  <div className="flex justify-between">
                    <span>Engagement</span>
                    <span className="font-semibold text-brand-charcoal">{p.engagementRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly reach</span>
                    <span className="font-semibold text-brand-charcoal">{(p.reach / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posts this month</span>
                    <span className="font-semibold text-brand-charcoal">{p.postsThisMonth}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reach chart */}
          <div className="bg-white border border-brand-border rounded-xl p-5">
            <p className="text-sm font-semibold text-brand-charcoal mb-1">Organic Reach — Facebook & Instagram</p>
            <p className="text-xs text-brand-muted mb-5">Monthly unique reach over 6 months</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={reachData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716C' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="fb" name="Facebook" fill="#2D8A8A" radius={[3, 3, 0, 0]} />
                <Bar dataKey="ig" name="Instagram" fill="#D4EEEE" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Post Calendar ──────────────────────────────────────────────────── */}
      {activeTab === 'Post Calendar' && (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-white border border-brand-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${platformColors[p.platform]}`}>
                    {p.platform}
                  </span>
                  <span className="text-xs text-brand-muted">
                    {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {p.reach && (
                    <span className="text-xs text-brand-teal font-medium">{p.reach.toLocaleString()} reach</span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    p.status === 'published' ? 'bg-brand-teal-muted text-brand-teal' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-brand-charcoal leading-relaxed">{p.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Analytics ─────────────────────────────────────────────────────── */}
      {activeTab === 'Analytics' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Followers', value: '17,680', delta: '+890 this month', positive: true },
              { label: 'Avg. Engagement Rate', value: '4.6%', delta: '+0.3% vs last month', positive: true },
              { label: 'Total Monthly Reach', value: '63.5k', delta: '-2.1k vs last month', positive: false },
            ].map(({ label, value, delta, positive }) => (
              <div key={label} className="bg-white border border-brand-border rounded-xl p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-muted mb-2">{label}</p>
                <p className="font-serif text-2xl text-brand-charcoal mb-1">{value}</p>
                <p className={`text-xs font-medium flex items-center gap-1 ${positive ? 'text-brand-teal' : 'text-rose-600'}`}>
                  {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {delta}
                </p>
              </div>
            ))}
          </div>
          <div className="bg-brand-teal-muted border border-brand-teal/20 rounded-xl p-5">
            <p className="text-sm font-semibold text-brand-charcoal mb-2">Recommendation</p>
            <p className="text-sm text-brand-muted leading-relaxed">
              Instagram engagement (6.8%) significantly outperforms Facebook (4.2%) for this audience.
              Consider shifting 20% of Facebook posting cadence to Instagram Reels for higher organic reach.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
