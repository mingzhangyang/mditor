import type { Language } from '@/i18n'

interface SeoMetadata {
  title: string
  description: string
  headline: string
  summary: string
  keywords: string[]
  locale: string
}

const SEO_METADATA: Record<Language, SeoMetadata> = {
  'en-US': {
    title: 'Markdown Table Editor | Visual Markdown, CSV and Excel Table Tool',
    description:
      'Edit Markdown tables visually, import CSV or Excel files, customize styles, and export polished tables to Markdown, HTML, PNG, SVG, and Excel.',
    headline: 'Markdown Table Editor',
    summary:
      'A visual editor for Markdown tables with import, formatting, preview, and export workflows for Markdown, CSV, Excel, JSON, HTML, PNG, and SVG.',
    keywords: [
      'markdown table editor',
      'markdown table generator',
      'csv to markdown table',
      'excel to markdown table',
      'visual markdown editor',
      'table formatter'
    ],
    locale: 'en_US'
  },
  'zh-CN': {
    title: 'Markdown 表格编辑器 | 可视化编辑、导入导出 CSV 与 Excel',
    description:
      '可视化编辑 Markdown 表格，支持导入 CSV、Excel、JSON，调整样式并导出 Markdown、HTML、PNG、SVG 与 Excel。',
    headline: 'Markdown 表格编辑器',
    summary:
      '一个支持 Markdown 表格编辑、预览、样式定制以及 CSV、Excel、JSON 导入导出的可视化工具。',
    keywords: [
      'Markdown 表格编辑器',
      'Markdown 表格生成器',
      'CSV 转 Markdown 表格',
      'Excel 转 Markdown 表格',
      '可视化表格编辑',
      '表格格式化工具'
    ],
    locale: 'zh_CN'
  }
}

const SITE_NAME = 'Mditor'
const GITHUB_URL = 'https://github.com/mingzhangyang/mditor'

function upsertMeta(selector: string, attributes: Record<string, string>, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    Object.entries(attributes).forEach(([name, value]) => {
      element?.setAttribute(name, value)
    })
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector)

  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value)
  })
}

function upsertStructuredData(metadata: SeoMetadata, siteUrl: string, imageUrl: string) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: metadata.headline,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: metadata.locale,
    description: metadata.description,
    image: imageUrl,
    url: siteUrl,
    keywords: metadata.keywords.join(', '),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    sameAs: [GITHUB_URL],
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME
    }
  }

  let script = document.head.querySelector<HTMLScriptElement>('#ld-json-software-app')
  if (!script) {
    script = document.createElement('script')
    script.id = 'ld-json-software-app'
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(schema)
}

export function getSeoMetadata(language: Language): SeoMetadata {
  return SEO_METADATA[language]
}

export function applySeoMetadata(language: Language) {
  const metadata = getSeoMetadata(language)
  const siteUrl = new URL('/', window.location.origin).toString()
  const imageUrl = new URL('/og-image.svg', window.location.origin).toString()

  document.documentElement.lang = language
  document.title = metadata.title

  upsertMeta('meta[name="description"]', { name: 'description' }, metadata.description)
  upsertMeta('meta[name="keywords"]', { name: 'keywords' }, metadata.keywords.join(', '))
  upsertMeta(
    'meta[name="robots"]',
    { name: 'robots' },
    'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  )
  upsertMeta('meta[name="application-name"]', { name: 'application-name' }, SITE_NAME)
  upsertMeta(
    'meta[name="apple-mobile-web-app-title"]',
    { name: 'apple-mobile-web-app-title' },
    SITE_NAME
  )
  upsertMeta('meta[name="theme-color"]', { name: 'theme-color' }, '#3b82f6')
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, SITE_NAME)
  upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
  upsertMeta('meta[property="og:locale"]', { property: 'og:locale' }, metadata.locale)
  upsertMeta('meta[property="og:title"]', { property: 'og:title' }, metadata.title)
  upsertMeta(
    'meta[property="og:description"]',
    { property: 'og:description' },
    metadata.description
  )
  upsertMeta('meta[property="og:url"]', { property: 'og:url' }, siteUrl)
  upsertMeta('meta[property="og:image"]', { property: 'og:image' }, imageUrl)
  upsertMeta(
    'meta[property="og:image:alt"]',
    { property: 'og:image:alt' },
    `${SITE_NAME} Markdown Table Editor preview`
  )
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, metadata.title)
  upsertMeta(
    'meta[name="twitter:description"]',
    { name: 'twitter:description' },
    metadata.description
  )
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, imageUrl)
  upsertLink('link[rel="canonical"]', { rel: 'canonical', href: siteUrl })
  upsertStructuredData(metadata, siteUrl, imageUrl)
}
