import { supabaseRest } from './_lib/supabase-admin.js'

const ALLOWED_HOSTS = new Set([
  'pib.gov.in',
  'www.pib.gov.in',
  'india.gov.in',
  'mygov.in',
  'government.economictimes.indiatimes.com',
])

function isHostAllowed(hostname) {
  if (!hostname) return false
  const host = hostname.toLowerCase()
  if (ALLOWED_HOSTS.has(host)) return true
  if (host.endsWith('.gov.in') || host.endsWith('.nic.in')) return true
  return false
}

const KNOWN_FEEDS = [
  {
    url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1',
    sourceName: 'Press Information Bureau',
    sourceType: 'official',
  },
  {
    url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
    sourceName: 'Press Information Bureau',
    sourceType: 'official',
  },
  {
    url: 'https://government.economictimes.indiatimes.com/rss/education',
    sourceName: 'ETGovernment',
    sourceType: 'reputable_news',
  },
]

const htmlToText = (value = '') => {
  return value
    .replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript(?:\s[^>]*)?>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, '—')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

const firstTag = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? htmlToText(match[1]) : ''
}

function parseIsoDate(dateString) {
  if (!dateString) return null
  const parsed = Date.parse(dateString)
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString()
  }
  return null
}

function parseFeed(xml, sourceName, sourceType) {
  // Some government feeds include a UTF-8 BOM and omit optional RSS dates.
  // Titles and canonical links are still valid records, so do not discard them.
  xml = String(xml || '').replace(/^\uFEFF/, '')
  const rssItems = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => match[1])
  const atomItems = [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map((match) => match[1])
  const blocks = rssItems.length ? rssItems : atomItems

  return blocks.map((block) => {
    const linkTag = block.match(/<link(?:\s[^>]*)?href=["']([^"']+)["'][^>]*\/?\s*>/i)
    const rawLink = firstTag(block, 'link') || linkTag?.[1] || firstTag(block, 'guid')
    const cleanUrl = rawLink.startsWith('http://') || rawLink.startsWith('https://') ? rawLink : ''

    const rawTitle = firstTag(block, 'title')
    const title = rawTitle.length > 300 ? `${rawTitle.slice(0, 297)}…` : rawTitle

    const rawSummary = firstTag(block, 'description') || firstTag(block, 'summary') || firstTag(block, 'content')
    const summary = rawSummary.length > 1000 ? `${rawSummary.slice(0, 997)}…` : rawSummary

    const rawPubDate = firstTag(block, 'pubDate') || firstTag(block, 'published') || firstTag(block, 'updated')
    const publishedAt = parseIsoDate(rawPubDate)

    return {
      title,
      summary: summary || null,
      source_name: sourceName,
      source_url: cleanUrl,
      source_type: sourceType,
      published_at: publishedAt,
      fetched_at: new Date().toISOString(),
      status: 'published',
    }
  }).filter((item) => {
    if (!item.title || !item.source_url || !item.source_name || !item.source_type) return false
    try { return isHostAllowed(new URL(item.source_url).hostname) } catch { return false }
  })
}

function configuredFeeds() {
  const defaults = KNOWN_FEEDS.map((feed) => feed.url)
  const rawList = String(process.env.NEWS_FEED_URLS || defaults.join(','))
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

  const feeds = []
  for (const url of rawList) {
    try {
      const parsed = new URL(url)
      if (!isHostAllowed(parsed.hostname)) {
        console.warn(`[feed] Skipping unallowlisted feed host: ${parsed.hostname} (${url})`)
        continue
      }
      const known = KNOWN_FEEDS.find((k) => k.url === url)
      if (known) {
        feeds.push({ url, sourceName: known.sourceName, sourceType: known.sourceType })
        continue
      }
      const host = parsed.hostname.toLowerCase()
      const isGov = host.endsWith('.gov.in') || host.endsWith('.nic.in')
      const isPib = host === 'pib.gov.in' || host === 'www.pib.gov.in'
      const isEt = host.includes('economictimes.indiatimes.com')
      const isMinistry = isGov && !isPib && host !== 'india.gov.in' && host !== 'mygov.in'

      let sourceName = 'Official Announcement'
      if (isPib) sourceName = 'Press Information Bureau'
      else if (isEt) sourceName = 'ETGovernment'
      else if (isMinistry) {
        sourceName = host.replace(/\.(gov|nic)\.in$/, '').toUpperCase()
      }

      feeds.push({
        url,
        sourceName,
        sourceType: isMinistry ? 'ministry' : isGov ? 'official' : 'reputable_news',
      })
    } catch {
      console.warn(`[feed] Skipping malformed feed URL: ${url}`)
    }
  }
  return feeds
}

async function fetchFeedWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SchemeSetuLiveFeed/1.0)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    })
    return response
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
      const upstream = await fetchFeedWithTimeout(feed.url, 10000)
      if (!upstream.ok) {
        sourceReports.push({ name: feed.sourceName, type: feed.sourceType, url: feed.url, items: 0, error: `HTTP ${upstream.status} ${upstream.statusText}` })
        continue
      }
      const xml = await upstream.text()
      const parsed = parseFeed(xml, feed.sourceName, feed.sourceType)
      allItems.push(...parsed)
      sourceReports.push({ name: feed.sourceName, type: feed.sourceType, url: feed.url, items: parsed.length, error: null })
    } catch (err) {
      sourceReports.push({ name: feed.sourceName, type: feed.sourceType, url: feed.url, items: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message })
    }
  }

  const uniqueItems = [...new Map(allItems.map((item) => [item.source_url, item])).values()].slice(0, 100)
  if (uniqueItems.length) {
    await supabaseRest('feed_items?on_conflict=source_url', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(uniqueItems),
    })
  }
  return { refreshed: uniqueItems.length, totalFetched: allItems.length, sources: sourceReports, timestamp: new Date().toISOString() }
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    // Vercel Cron invokes functions with GET. Refresh only when the request is
    // authenticated as cron; public GET remains a read-only feed request.
    const cronRequest =
      (process.env.CRON_SECRET && request.headers.authorization === `Bearer ${process.env.CRON_SECRET}`) ||
      String(request.headers['user-agent'] || '').toLowerCase().startsWith('vercel-cron')
    if (cronRequest && request.query.refresh !== 'false') {
      try {
        const result = await refreshFeeds()
        response.status(200).json({ ok: true, ...result })
      } catch (error) {
        response.status(500).json({ code: error.code || 'feed_refresh_failed', message: error.message })
      }
      return
    }

    const limit = Math.min(50, Math.max(1, Number.parseInt(request.query.limit || '24', 10) || 24))
    const query = new URLSearchParams({
      select: 'id,title,summary,source_name,source_url,source_type,published_at,fetched_at,image_url,tags',
      status: 'eq.published',
      order: 'published_at.desc.nullslast,fetched_at.desc',
      limit: String(limit),
    })
    try {
      let data = await supabaseRest(`feed_items?${query.toString()}`)
      let items = Array.isArray(data) ? data : []
      let refreshReport = null
      // Bootstrap an empty production database immediately. Once rows exist,
      // normal reads stay cheap and scheduled refreshes handle new items.
      if (!items.length) {
        try {
          refreshReport = await refreshFeeds()
          data = await supabaseRest(`feed_items?${query.toString()}`)
          items = Array.isArray(data) ? data : []
        } catch (refreshError) {
          refreshReport = { error: refreshError.message }
        }
      }

      const sourceCounts = {}
      for (const item of items) {
        const name = item.source_name || 'Unknown'
        sourceCounts[name] = (sourceCounts[name] || 0) + 1
      }
      const sourcesMeta = Object.entries(sourceCounts).map(([name, count]) => {
        const sample = items.find((i) => i.source_name === name)
        return {
          name,
          type: sample?.source_type || 'official',
          items: count,
          lastError: null,
        }
      })

      const newestTime = items[0]?.published_at || items[0]?.fetched_at || new Date().toISOString()

      response
        .status(200)
        .setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')
        .json({
          data: items,
          meta: {
            refreshedAt: newestTime,
            count: items.length,
            sources: sourcesMeta,
            refresh: refreshReport,
          },
        })
    } catch (error) {
      response.status(error.status || 500).json({ code: 'feed_unavailable', message: error.message })
    }
    return
  }

  if (request.method !== 'POST') {
    response.status(405).json({ code: 'method_not_allowed', message: 'Use GET to read the feed or POST to refresh it.' })
    return
  }

  const manualSecretValid = process.env.FEED_REFRESH_SECRET && request.headers['x-feed-refresh-secret'] === process.env.FEED_REFRESH_SECRET
  const cronSecretValid = process.env.CRON_SECRET && request.headers.authorization === `Bearer ${process.env.CRON_SECRET}`
  if (!manualSecretValid && !cronSecretValid) {
    response.status(401).json({ code: 'unauthorized', message: 'A valid feed refresh secret is required.' })
    return
  }

  const feeds = configuredFeeds()
  if (!feeds.length) {
    response.status(400).json({ code: 'no_feeds_configured', message: 'Set NEWS_FEED_URLS before refreshing the feed.' })
    return
  }

  try {
    const result = await refreshFeeds()
    response.status(200).json(result)
  } catch (error) {
    response.status(500).json({ code: error.code || 'feed_refresh_failed', message: error.message })
  }
  return
}
