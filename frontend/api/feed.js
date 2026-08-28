import { supabaseRest } from './_lib/supabase-admin.js'

const htmlToText = (value = '') => value
  .replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ').trim()

const firstTag = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? htmlToText(match[1]) : ''
}

function parseFeed(xml, sourceName, sourceType) {
  const rssItems = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => match[1])
  const atomItems = [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map((match) => match[1])
  const blocks = rssItems.length ? rssItems : atomItems

  return blocks.map((block) => {
    const linkTag = block.match(/<link(?:\s[^>]*)?href=["']([^"']+)["'][^>]*\/?\s*>/i)
    return {
      title: firstTag(block, 'title'),
      summary: firstTag(block, 'description') || firstTag(block, 'summary') || firstTag(block, 'content'),
      source_name: sourceName,
      source_url: firstTag(block, 'link') || linkTag?.[1] || firstTag(block, 'guid'),
      source_type: sourceType,
      published_at: firstTag(block, 'pubDate') || firstTag(block, 'published') || firstTag(block, 'updated') || null,
      status: 'published',
    }
  }).filter((item) => item.title && item.source_url)
}

function configuredFeeds() {
  const defaults = [
    'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
    'https://government.economictimes.indiatimes.com/rss/education',
  ]
  return String(process.env.NEWS_FEED_URLS || defaults.join(',')).split(',').map((value) => value.trim()).filter(Boolean).map((url) => {
    const isOfficial = /pib\.gov\.in|india\.gov\.in|mygov\.in|gov\.in/i.test(url)
    return {
      url,
      sourceName: isOfficial ? 'Press Information Bureau' : 'ETGovernment',
      sourceType: isOfficial ? 'official' : 'reputable_news',
    }
  })
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    const limit = Math.min(50, Math.max(1, Number.parseInt(request.query.limit || '24', 10) || 24))
    const query = new URLSearchParams({
      select: 'id,title,summary,source_name,source_url,source_type,published_at,image_url,tags',
      status: 'eq.published',
      order: 'published_at.desc',
      limit: String(limit),
    })
    try {
      const data = await supabaseRest(`feed_items?${query.toString()}`)
      response.status(200).setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900').json({ data: data || [] })
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
    const allItems = []
    for (const feed of feeds) {
      const upstream = await fetch(feed.url, { headers: { 'User-Agent': 'SchemeSetu/1.0 feed reader' } })
      if (!upstream.ok) continue
      allItems.push(...parseFeed(await upstream.text(), feed.sourceName, feed.sourceType))
    }

    const uniqueItems = [...new Map(allItems.map((item) => [item.source_url, item])).values()].slice(0, 100)
    if (uniqueItems.length) {
      await supabaseRest('feed_items?on_conflict=source_url', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(uniqueItems),
      })
    }
    response.status(200).json({ refreshed: uniqueItems.length })
  } catch (error) {
    response.status(500).json({ code: 'feed_refresh_failed', message: error.message })
  }
}
