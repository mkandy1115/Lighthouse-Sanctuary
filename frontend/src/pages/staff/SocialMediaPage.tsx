import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Pencil, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import {
  createSocialMediaPost,
  deleteSocialMediaPost,
  getMlInsights,
  getSocialMediaPosts,
  updateSocialMediaPost,
  type MlSocialPostScoreItem,
  type SocialMediaPostDto,
} from '@/lib/staff'
import { formatDate } from '@/lib/formatters'
import { looksUnsafe, sanitizeText } from '@/lib/validation'

const platformColors: Record<string, string> = {
  Facebook: 'bg-blue-50 text-blue-700',
  Instagram: 'bg-pink-50 text-pink-700',
  'X / Twitter': 'bg-sky-50 text-sky-700',
  LinkedIn: 'bg-indigo-50 text-indigo-700',
}

const tabs = ['Overview', 'Post Calendar', 'Analytics'] as const

function emptyForm() {
  return {
    platform: 'Facebook',
    platformPostId: '',
    postType: 'Post',
    caption: '',
    reach: '' as string,
  }
}

export default function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Overview')
  const [posts, setPosts] = useState<SocialMediaPostDto[]>([])
  const [mlScores, setMlScores] = useState<MlSocialPostScoreItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showDemoMessage, setShowDemoMessage] = useState(false)

  const reload = useCallback(async () => {
    const [postList, ml] = await Promise.all([getSocialMediaPosts(), getMlInsights()])
    setPosts(postList)
    setMlScores(ml.socialPostScores ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        await reload()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load social data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reload])

  const platformSummary = useMemo(() => {
    const map = new Map<string, { count: number; reach: number }>()
    for (const p of posts) {
      const key = p.platform || 'Other'
      const cur = map.get(key) ?? { count: 0, reach: 0 }
      cur.count += 1
      cur.reach += p.reach ?? 0
      map.set(key, cur)
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }))
  }, [posts])

  const reachChartData = useMemo(() => platformSummary.map((p) => ({ platform: p.name, reach: p.reach })), [platformSummary])

  const topPerformingPosts = useMemo(() => {
    return [...mlScores]
      .sort((a, b) => b.upliftScore - a.upliftScore)
      .slice(0, 5)
  }, [mlScores])

  const postTypeRecommendations = useMemo(() => {
    const byType = new Map<string, { count: number; totalUplift: number; totalChurn: number }>()
    for (const score of mlScores) {
      const type = score.postType || 'Unknown'
      const cur = byType.get(type) ?? { count: 0, totalUplift: 0, totalChurn: 0 }
      cur.count += 1
      cur.totalUplift += score.upliftScore
      cur.totalChurn += score.churnScore
      byType.set(type, cur)
    }
    return Array.from(byType.entries())
      .map(([type, data]) => ({
        type,
        count: data.count,
        avgUplift: data.totalUplift / data.count,
        avgChurn: data.totalChurn / data.count,
      }))
      .sort((a, b) => b.avgUplift - a.avgUplift)
  }, [mlScores])

  function openCreate() {
    setShowDemoMessage(true)
  }

  function openEdit(post: SocialMediaPostDto) {
    setEditingId(post.postId)
    setForm({
      platform: post.platform,
      platformPostId: post.platformPostId ?? '',
      postType: post.postType ?? 'Post',
      caption: post.caption ?? '',
      reach: post.reach != null ? String(post.reach) : '',
    })
    setModalOpen(true)
    setError('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const cap = sanitizeText(form.caption, 8000, true)
    if (looksUnsafe(cap)) {
      setError('Caption contains invalid content.')
      return
    }
    const reachNum = form.reach.trim() ? Number(form.reach) : undefined
    if (form.reach.trim() && !Number.isFinite(reachNum)) {
      setError('Reach must be a number.')
      return
    }

    const payload = {
      platform: sanitizeText(form.platform, 64),
      platformPostId: form.platformPostId.trim() ? sanitizeText(form.platformPostId, 120) : undefined,
      postType: sanitizeText(form.postType, 64),
      caption: cap,
      reach: reachNum,
    }

    try {
      setSaving(true)
      if (editingId != null) {
        await updateSocialMediaPost(editingId, payload)
      } else {
        await createSocialMediaPost(payload)
      }
      setModalOpen(false)
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this post record?')) return
    try {
      setError('')
      await deleteSocialMediaPost(id)
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Social Media</h1>
          <p className="text-brand-muted text-sm mt-1">Posts from the database · ML scores from admin insights</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          Add post
        </button>
      </div>

      <Modal
        open={showDemoMessage}
        onClose={() => setShowDemoMessage(false)}
        title="Add Post"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-brand-teal-muted bg-brand-teal-muted/20 p-4">
            <p className="text-sm text-brand-charcoal">
              <span className="font-semibold">This full feature is not part of the demo.</span>
            </p>
            <p className="text-sm text-brand-muted mt-2">
              Once we have access to Imari's account login information (Facebook, Instagram, TikTok, LinkedIn, etc.), we can connect them to this dashboard. Then you'll be able to post directly from this view, and all social media posts will automatically feed into the analytics and ML scoring pipeline.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDemoMessage(false)}
            className="w-full rounded-lg bg-brand-bronze px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-bronze-light"
          >
            Got it
          </button>
        </div>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId != null ? 'Edit post' : 'Add post'}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <input
            value={form.platform}
            onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            placeholder="Platform (e.g. Facebook)"
          />
          <input
            value={form.platformPostId}
            onChange={(e) => setForm((f) => ({ ...f, platformPostId: e.target.value }))}
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            placeholder="External post ID (optional)"
          />
          <input
            value={form.postType}
            onChange={(e) => setForm((f) => ({ ...f, postType: e.target.value }))}
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            placeholder="Post type"
          />
          <textarea
            value={form.caption}
            onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
            className="w-full min-h-28 rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            placeholder="Caption"
          />
          <input
            value={form.reach}
            onChange={(e) => setForm((f) => ({ ...f, reach: e.target.value }))}
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            placeholder="Reach (optional)"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </Modal>

      {error ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="flex bg-brand-stone rounded-lg p-1 mb-6 w-fit gap-0.5 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white text-brand-charcoal shadow-sm' : 'text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? <div className="py-12 text-center text-brand-muted">Loading…</div> : null}

      {!loading && activeTab === 'Overview' && (
        <div className="space-y-6">
          {mlScores.length > 0 && (
            <>
              <div className="bg-gradient-to-br from-brand-bronze/10 to-brand-bronze/5 border border-brand-bronze/20 rounded-xl p-6">
                <h2 className="font-semibold text-brand-charcoal mb-4">Recommended Post Types</h2>
                <p className="text-sm text-brand-muted mb-4">Based on ML analysis of uplift potential:</p>
                <div className="space-y-3">
                  {postTypeRecommendations.length === 0 ? (
                    <p className="text-sm text-brand-muted">No post data yet.</p>
                  ) : (
                    postTypeRecommendations.map((rec, idx) => (
                      <div key={rec.type} className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-brand-charcoal">
                            {idx + 1}. {rec.type}
                          </p>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {rec.count} posts · {(rec.avgUplift * 100).toFixed(1)}% avg uplift potential
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-brand-bronze">
                            {(rec.avgUplift * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white border border-brand-border rounded-xl p-6">
                <h2 className="font-semibold text-brand-charcoal mb-4">Top 5 Performing Posts</h2>
                <p className="text-sm text-brand-muted mb-4">Highest uplift potential from your recent posts:</p>
                {topPerformingPosts.length === 0 ? (
                  <p className="text-sm text-brand-muted">No post scores yet. Run ML pipeline to generate predictions.</p>
                ) : (
                  <div className="space-y-3">
                    {topPerformingPosts.map((post, idx) => (
                      <div key={post.postId} className="border border-brand-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-brand-charcoal">#{idx + 1}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${platformColors[post.platform] ?? 'bg-brand-stone text-brand-charcoal'}`}>
                                {post.platform}
                              </span>
                              {post.postType && (
                                <span className="text-xs text-brand-muted bg-brand-stone px-2 py-0.5 rounded">
                                  {post.postType}
                                </span>
                              )}
                            </div>
                            {post.caption && (
                              <p className="text-sm text-brand-charcoal line-clamp-2">{post.caption}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-semibold text-brand-bronze">
                              {(post.upliftScore * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-brand-muted">uplift</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-brand-muted">
                          <div>Churn: <span className="text-brand-charcoal font-medium">{(post.churnScore * 100).toFixed(1)}%</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformSummary.length === 0 ? (
              <div className="col-span-full bg-white border border-brand-border rounded-xl p-6 text-sm text-brand-muted">
                No posts yet. Add a post or run your data import.
              </div>
            ) : (
              platformSummary.map((p) => (
                <div key={p.name} className="bg-white border border-brand-border rounded-xl p-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${platformColors[p.name] ?? 'bg-brand-stone text-brand-charcoal'}`}>
                    {p.name}
                  </span>
                  <p className="font-serif text-2xl text-brand-charcoal mt-3">{p.count}</p>
                  <p className="text-xs text-brand-muted">posts in database</p>
                  <p className="text-sm text-brand-charcoal mt-2">{p.reach.toLocaleString()} total reach</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-white border border-brand-border rounded-xl p-5">
            <p className="text-sm font-semibold text-brand-charcoal mb-1">Reach by platform</p>
            <p className="text-xs text-brand-muted mb-5">Summed from stored <code className="text-xs">reach</code> fields.</p>
            {reachChartData.length === 0 ? (
              <p className="text-sm text-brand-muted">No reach data to chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={reachChartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
                  <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [value.toLocaleString(), 'Reach']}
                  />
                  <Bar dataKey="reach" fill="#2D8A8A" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {!loading && activeTab === 'Post Calendar' && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-sm text-brand-muted">No posts yet.</p>
          ) : (
            posts.map((p) => (
              <div key={p.postId} className="bg-white border border-brand-border rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${platformColors[p.platform] ?? 'bg-brand-stone text-brand-charcoal'}`}>
                      {p.platform}
                    </span>
                    <span className="text-xs text-brand-muted">{formatDate(p.createdAt, 'long')}</span>
                    {p.reach != null ? (
                      <span className="text-xs text-brand-teal font-medium">{p.reach.toLocaleString()} reach</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-2 py-1 text-xs font-medium text-brand-charcoal hover:bg-brand-stone"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.postId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-brand-charcoal leading-relaxed">{p.caption ?? '—'}</p>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && activeTab === 'Analytics' && (
        <div className="space-y-4">
          <div className="bg-white border border-brand-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-brand-stone border-b border-brand-border">
                  {['Post', 'Churn score', 'Uplift score', 'Model'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mlScores.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-brand-muted">
                      No ML post scores yet. Refresh ML scores from the admin dashboard after the pipeline runs.
                    </td>
                  </tr>
                ) : (
                  mlScores.map((row) => (
                    <tr key={row.postId} className="border-b border-brand-border">
                      <td className="px-4 py-3 text-brand-charcoal">
                        {row.platform} #{row.postId}
                        {row.caption ? <span className="block text-xs text-brand-muted mt-1 line-clamp-2">{row.caption}</span> : null}
                      </td>
                      <td className="px-4 py-3 text-brand-charcoal">{(row.churnScore * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-brand-charcoal">{(row.upliftScore * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-brand-muted text-xs">{row.modelVersion}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-brand-muted">
            Scores come from <code className="text-xs">/api/admin/ml-insights</code> (Pipeline 2; uplift may include a donor-level blend).
          </p>
        </div>
      )}
    </div>
  )
}
