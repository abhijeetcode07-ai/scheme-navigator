import { supabaseRest } from './_lib/supabase-admin.js'

const ALLOWED_HOSTS = new Set([
  'pib.gov.in',
  'www.pib.gov.in',
  'india.gov.in',
  'mygov.in',
  'www.mygov.in',
  'government.economictimes.indiatimes.com',
])

const CATEGORY_RULES = [
  ['education', /education|school|college|university|scholarship|fellowship|student|exam|literacy|learning|skill development/i],
  ['health', /health|hospital|medical|medicine|ayush|insurance|vaccin|disease|maternal|nutrition|wellness|treatment/i],
  ['jobs', /job|employment|career|apprentice|skill|training|placement|labour|labor|workforce|livelihood|startup|entrepreneur/i],
  ['housing', /housing|home|urban|rural development|water|sanitation|electricity|power|energy|gas|fuel|smart city|infrastructure|mobility/i],
  ['finance', /finance|bank|credit|pension|insurance|tax|income|payment|financial inclusion|economy|investment|loan|dbt/i],
  ['agriculture', /agri|farmer|farming|crop|kisan|livestock|fisher|irrigation|fertilizer|rural|horticulture|animal husbandry/i],
  ['women-child', /women|woman|girl|child|children|maternal|anganwadi|wcd|nutrition|pregnan|lactating|family welfare|gender/i],
  ['social-justice', /social justice|sc|st|obc|minority|tribal|welfare|inclusion|dignity|backward class|senior citizen|manual scavenger/i],
  ['disability', /disab|divyang|accessib|rehabilitation|assistive|pwd|special needs|barrier-free/i],
]

const MINISTRY_RULES = [
  ['education', /ministry of education|department of school education|ugc|aicte|ncert|navodaya|kvs/i],
  ['health', /ministry of health|health and family welfare|ayush|nhm|nha|medical council/i],
  ['jobs', /ministry of labour|skill development|employment|msme|ncs|apprenticeship/i],
  ['housing', /ministry of housing|urban affairs|rural development|jal shakti|power|new and renewable energy/i],
  ['finance', /ministry of finance|financial services|revenue|rbi|pfrda|insurance|economic affairs/i],
  ['agriculture', /ministry of agriculture|farmers welfare|icar|fisheries|animal husbandry|rural development/i],
  ['women-child', /ministry of women|child development|wcd|nutrition|national commission for women/i],
  ['social-justice', /ministry of social justice|tribal affairs|minority affairs|social empowerment|sc commission|st commission/i],
  ['disability', /department of empowerment of persons with disabilities|depwd|social justice and empowerment|rehabilitation/i],
]

const KNOWN_FEEDS = [
  { url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1', sourceName: 'Press Information Bureau · Ministry releases', sourceType: 'ministry', tags: [] },
  { url: 'https://www.mygov.in/rss.xml', sourceName: 'MyGov India', sourceType: 'official', tags: [] },
  { url: 'https://government.economictimes.indiatimes.com/rss/education', sourceName: 'ETGovernment · Education', sourceType: 'reputable_news', tags: ['category:education'] },
  { url: 'https://government.economictimes.indiatimes.com/rss/healthcare', sourceName: 'ETGovernment · Healthcare', sourceType: 'reputable_news', tags: ['category:health'] },
  { url: 'https://government.economictimes.indiatimes.com/rss/policy', sourceName: 'ETGovernment · Policy', sourceType: 'reputable_news', tags: [] },
  { url: 'https://government.economictimes.indiatimes.com/rss/governance', sourceName: 'ETGovernment · Governance', sourceType: 'reputable_news', tags: [] },
  { url: 'https://government.economictimes.indiatimes.com/rss/smart-infra', sourceName: 'ETGovernment · Smart Infra', sourceType: 'reputable_news', tags: ['category:housing'] },
  { url: 'https://government.economictimes.indiatimes.com/rss/economy', sourceName: 'ETGovernment · Economy', sourceType: 'reputable_news', tags: ['category:finance'] },
  { url: 'https://government.economictimes.indiatimes.com/rss/mobility', sourceName: 'ETGovernment · Mobility', sourceType: 'reputable_news', tags: ['category:housing'] },
  { url: 'https://government.economictimes.indiatimes.com/rss/digital-india', sourceName: 'ETGovernment · Digital India', sourceType: 'reputable_news', tags: ['category:jobs'] },
]

function isHostAllowed(hostname) {
  if (!hostname) return false
  const host = hostname.toLowerCase()
  return ALLOWED_HOSTS.has(host) || host.endsWith('.gov.in') || host.endsWith('.nic.in')
}

const htmlToText = (value = '') => String(value)
  .replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi, '')
  .replace(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi, '')
  .replace(/<noscript(?:\s[^>]*)?>[\s\S]*?<\/noscript>/gi, '')
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec))).replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  .replace(/\s+/g, ' ').trim()

const trimText = (value, max) => {
  const text = htmlToText(value)
  return max && text.length > max ? `${text.slice(0, max - 1)}…` : text
}

const firstTag = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? htmlToText(match[1]) : ''
}

const allTags = (text, tag) => [...text.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'gi'))].map((match) => htmlToText(match[1])).filter(Boolean)
const categoryTags = (text, rules, prefix) => rules.filter(([, pattern]) => pattern.test(text)).map(([name]) => `${prefix}:${name}`)
const parseIsoDate = (value) => { const time = Date.parse(value || ''); return Number.isNaN(time) ? null : new Date(time).toISOString() }

function parseFeed(xml, sourceName, sourceType, sourceTags = []) {
  const normalizedXml = String(xml || '').replace(/^\uFEFF/, '')
  const rssItems = [...normalizedXml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => match[1])
  const atomItems = [...normalizedXml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map((match) => match[1])
  const blocks = rssItems.length ? rssItems : atomItems

  return blocks.map((block) => {
    const linkTag = block.match(/<link(?:\s[^>]*)?href=["']([^"']+)["'][^>]*\/?\s*>/i)
    const rawLink = firstTag(block, 'link') || linkTag?.[1] || firstTag(block, 'guid')
    const sourceUrl = /^https?:\/\//i.test(rawLink) ? rawLink : ''
    const title = trimText(firstTag(block, 'title'), 300)
    const summary = trimText(firstTag(block, 'description') || firstTag(block, 'summary') || firstTag(block, 'content'), 1000)
    const text = `${title} ${summary} ${allTags(block, 'category').join(' ')}`
    const ministryMentioned = MINISTRY_RULES.some(([, pattern]) => pattern.test(text))
    const derivedSourceType = sourceType === 'official' && ministryMentioned ? 'ministry' : sourceType
    const tags = [...new Set([
      ...sourceTags,
      ...categoryTags(text, CATEGORY_RULES, 'category'),
      ...categoryTags(text, MINISTRY_RULES, 'ministry'),
      ...allTags(block, 'category').slice(0, 5).map((tag) => `source:${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`),
    ])]
    return {
      title,
      summary: summary || null,
      source_name: sourceName,
      source_url: sourceUrl,
      source_type: derivedSourceType,
      published_at: parseIsoDate(firstTag(block, 'pubDate') || firstTag(block, 'published') || firstTag(block, 'updated')),
      fetched_at: new Date().toISOString(),
      image_url: null,
      tags,
      status: 'published',
    }
  }).filter((item) => {
    if (!item.title || !item.source_url || !item.source_name || !item.source_type) return false
    try { return isHostAllowed(new URL(item.source_url).hostname) } catch { return false }
  })
}

function configuredFeeds() {
  const rawExtras = String(process.env.NEWS_FEED_URLS || '').split(',').map((value) => value.trim()).filter(Boolean)
  const extras = rawExtras.map((value) => {
    const [url, sourceName = '', sourceType = 'reputable_news', ...tags] = value.split('|').map((part) => part.trim())
    return { url, sourceName, sourceType, tags }
  })
  const feeds = [...KNOWN_FEEDS, ...extras]
  const unique = [...new Map(feeds.map((feed) => [feed.url, feed])).values()]
  return unique.flatMap((feed) => {
    try {
      const parsed = new URL(feed.url)
      if (!isHostAllowed(parsed.hostname)) {
        console.warn(`[feed] Skipping unallowlisted feed host: ${parsed.hostname} (${feed.url})`)
        return []
      }
      if (feed.sourceName) return [feed]
      const host = parsed.hostname.toLowerCase()
      const isEt = host.includes('economictimes.indiatimes.com')
      const isPib = host === 'pib.gov.in' || host === 'www.pib.gov.in'
      const isGov = host.endsWith('.gov.in') || host.endsWith('.nic.in')
      return [{ ...feed, sourceName: isPib ? 'Press Information Bureau' : isEt ? 'ETGovernment' : isGov ? host.replace(/\.(gov|nic)\.in$/, '').toUpperCase() : 'Configured source', sourceType: isEt ? 'reputable_news' : isGov && !isPib ? 'ministry' : 'official' }]
    } catch {
      console.warn(`[feed] Skipping malformed feed URL: ${feed.url}`)
      return []
    }
  })
}

async function fetchFeedWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'SchemeSetu/1.0 official-feed-reader', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' } })
  } finally {
    clearTimeout(timer)
  }
}

async function refreshFeeds() {
  const feeds = configuredFeeds()
  if (!feeds.length) {
    const error = new Error('Set NEWS_FEED_URLS before refreshing the feed.')
    error.code = 'no_feeds_configured'
    throw error
  }
  const allItems = []
  const sourceReports = []
  for (const feed of feeds) {
    try {
      const upstream = await fetchFeedWithTimeout(feed.url)
      if (!upstream.ok) {
        sourceReports.push({ name: feed.sourceName, type: feed.sourceType, url: feed.url, items: 0, error: `HTTP ${upstream.status} ${upstream.statusText}` })
        continue
      }
      const parsed = parseFeed(await upstream.text(), feed.sourceName, feed.sourceType, feed.tags)
      allItems.push(...parsed)
      sourceReports.push({ name: feed.sourceName, type: feed.sourceType, url: feed.url, items: parsed.length, error: null })
    } catch (error) {
      sourceReports.push({ name: feed.sourceName, type: feed.sourceType, url: feed.url, items: 0, error: error.name === 'AbortError' ? 'Request timed out' : error.message })
    }
  }
  const uniqueItems = [...new Map(allItems.map((item) => [item.source_url, item])).values()].sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)).slice(0, 250)
  if (uniqueItems.length) await supabaseRest('feed_items?on_conflict=source_url', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(uniqueItems) })
  return { refreshed: uniqueItems.length, totalFetched: allItems.length, sources: sourceReports, timestamp: new Date().toISOString() }
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    const cronRequest = (process.env.CRON_SECRET && request.headers.authorization === `Bearer ${process.env.CRON_SECRET}`) || String(request.headers['user-agent'] || '').toLowerCase().startsWith('vercel-cron')
    if (cronRequest && request.query.refresh !== 'false') {
      try { response.status(200).json({ ok: true, ...(await refreshFeeds()) }) } catch (error) { response.status(500).json({ code: error.code || 'feed_refresh_failed', message: error.message }) }
      return
    }
    const limit = Math.min(100, Math.max(1, Number.parseInt(request.query.limit || '60', 10) || 60))
    const query = new URLSearchParams({ select: 'id,title,summary,source_name,source_url,source_type,published_at,fetched_at,image_url,tags', status: 'eq.published', order: 'published_at.desc.nullslast,fetched_at.desc', limit: String(limit) })
    try {
      let data = await supabaseRest(`feed_items?${query.toString()}`)
      let items = Array.isArray(data) ? data : []
      let refreshReport = null
      if (!items.length) {
        try { refreshReport = await refreshFeeds(); data = await supabaseRest(`feed_items?${query.toString()}`); items = Array.isArray(data) ? data : [] } catch (error) { refreshReport = { error: error.message } }
      }
      const sourceCounts = {}
      items.forEach((item) => { sourceCounts[item.source_name || 'Unknown'] = (sourceCounts[item.source_name || 'Unknown'] || 0) + 1 })
      const sourcesMeta = Object.entries(sourceCounts).map(([name, count]) => ({ name, type: items.find((item) => item.source_name === name)?.source_type || 'official', items: count, lastError: null }))
      const newestTime = items[0]?.published_at || items[0]?.fetched_at || new Date().toISOString()
      const categoryCounts = Object.fromEntries(CATEGORY_RULES.map(([id]) => [id, items.filter((item) => item.tags?.includes(`category:${id}`)).length]))
      response.status(200).setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900').json({ data: items, meta: { refreshedAt: newestTime, count: items.length, categories: categoryCounts, sources: sourcesMeta, refresh: refreshReport } })
    } catch (error) { response.status(error.status || 500).json({ code: 'feed_unavailable', message: error.message }) }
    return
  }

  if (request.method !== 'POST') { response.status(405).json({ code: 'method_not_allowed', message: 'Use GET to read the feed or POST to refresh it.' }); return }
  const manualSecretValid = process.env.FEED_REFRESH_SECRET && request.headers['x-feed-refresh-secret'] === process.env.FEED_REFRESH_SECRET
  const cronSecretValid = process.env.CRON_SECRET && request.headers.authorization === `Bearer ${process.env.CRON_SECRET}`
  if (!manualSecretValid && !cronSecretValid) { response.status(401).json({ code: 'unauthorized', message: 'A valid feed refresh secret is required.' }); return }
  try { response.status(200).json(await refreshFeeds()) } catch (error) { response.status(500).json({ code: error.code || 'feed_refresh_failed', message: error.message }) }
}
