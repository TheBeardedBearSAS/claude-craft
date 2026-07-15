import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type HeadConfig } from 'vitepress'
import { SITE_URL, buildHreflangAlternates, buildLocaleGroups, listPageIds, pageToUrlPath } from './seo-locales.mjs'

// SEO: JSON-LD + canonical tags (docs/internal/SEO_AUDIT_TRACKING_20260715.md, Vague 2)
// and hreflang alternates (Vague 1, item 2). VitePress `head` is static; per-page data
// (canonical URL, breadcrumbs, hreflang) requires the `transformHead` build hook below,
// which only exists on the root config export. URL mapping + locale grouping logic
// lives in `./seo-locales.mjs` so the sitemap generator (scripts/generate-sitemap.mjs)
// stays in sync with this hook instead of duplicating divergent logic.
const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'))

// Built once at config-load time: every markdown page id, grouped by locale-agnostic
// relative path (e.g. "guides/x.md" -> { en: "en/guides/x", fr: "fr/guides/x" }).
const localeGroups = buildLocaleGroups(listPageIds(resolve(__dirname, '..')))

const GITHUB_URL = 'https://github.com/TheBeardedBearSAS/claude-craft'
const SITE_NAME = 'Claude Craft'
const SITE_DESCRIPTION = 'A comprehensive framework for AI-assisted development with Claude Code'

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
}

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'DeveloperApplication',
  description: SITE_DESCRIPTION,
  license: 'https://opensource.org/licenses/MIT',
  url: GITHUB_URL,
  softwareVersion: pkg.version,
}

function segmentToTitle(segment: string): string {
  return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildBreadcrumbList(urlPath: string) {
  const segments = urlPath.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const pageItems = segments.map((segment, index) => ({
    '@type': 'ListItem',
    position: index + 2,
    name: segmentToTitle(segment),
    item: SITE_URL + segments.slice(0, index + 1).join('/') + (index < segments.length - 1 ? '/' : ''),
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, ...pageItems],
  }
}

const guidesItems = [
  { text: '01 - Getting Started', link: '/en/guides/01-getting-started' },
  { text: '02 - Project Creation', link: '/en/guides/02-project-creation' },
  { text: '03 - Feature Development', link: '/en/guides/03-feature-development' },
  { text: '04 - Bug Fixing', link: '/en/guides/04-bug-fixing' },
  { text: '05 - Tools Reference', link: '/en/guides/05-tools-reference' },
  { text: '06 - Troubleshooting', link: '/en/guides/06-troubleshooting' },
  { text: '07 - Backlog Management', link: '/en/guides/07-backlog-management' },
  { text: '08 - Setup New Project', link: '/en/guides/08-setup-new-project' },
  { text: '09 - Setup Existing Project', link: '/en/guides/09-setup-existing-project' },
  { text: '10 - Complete Workflow', link: '/en/guides/10-complete-workflow' },
]

const guidesItemsFr = [
  { text: '01 - Premiers Pas', link: '/fr/guides/01-getting-started' },
  { text: '02 - Création de Projet', link: '/fr/guides/02-project-creation' },
  { text: '03 - Développement de Feature', link: '/fr/guides/03-feature-development' },
  { text: '04 - Correction de Bugs', link: '/fr/guides/04-bug-fixing' },
  { text: '05 - Référence des Outils', link: '/fr/guides/05-tools-reference' },
  { text: '06 - Dépannage', link: '/fr/guides/06-troubleshooting' },
  { text: '07 - Gestion du Backlog', link: '/fr/guides/07-backlog-management' },
  { text: '08 - Nouveau Projet', link: '/fr/guides/08-setup-new-project' },
  { text: '09 - Projet Existant', link: '/fr/guides/09-setup-existing-project' },
  { text: '10 - Workflow Complet', link: '/fr/guides/10-complete-workflow' },
]

const guidesItemsEs = [
  { text: '01 - Primeros Pasos', link: '/es/guides/01-getting-started' },
  { text: '02 - Creación de Proyecto', link: '/es/guides/02-project-creation' },
  { text: '03 - Desarrollo de Features', link: '/es/guides/03-feature-development' },
  { text: '04 - Corrección de Bugs', link: '/es/guides/04-bug-fixing' },
  { text: '05 - Referencia de Herramientas', link: '/es/guides/05-tools-reference' },
  { text: '06 - Solución de Problemas', link: '/es/guides/06-troubleshooting' },
  { text: '07 - Gestión del Backlog', link: '/es/guides/07-backlog-management' },
  { text: '08 - Nuevo Proyecto', link: '/es/guides/08-setup-new-project' },
  { text: '09 - Proyecto Existente', link: '/es/guides/09-setup-existing-project' },
  { text: '10 - Workflow Completo', link: '/es/guides/10-complete-workflow' },
]

const guidesItemsDe = [
  { text: '01 - Erste Schritte', link: '/de/guides/01-getting-started' },
  { text: '02 - Projekt Erstellen', link: '/de/guides/02-project-creation' },
  { text: '03 - Feature Entwicklung', link: '/de/guides/03-feature-development' },
  { text: '04 - Bug Fixing', link: '/de/guides/04-bug-fixing' },
  { text: '05 - Tools Referenz', link: '/de/guides/05-tools-reference' },
  { text: '06 - Fehlerbehebung', link: '/de/guides/06-troubleshooting' },
  { text: '07 - Backlog Verwaltung', link: '/de/guides/07-backlog-management' },
  { text: '08 - Neues Projekt', link: '/de/guides/08-setup-new-project' },
  { text: '09 - Bestehendes Projekt', link: '/de/guides/09-setup-existing-project' },
  { text: '10 - Kompletter Workflow', link: '/de/guides/10-complete-workflow' },
]

const guidesItemsPt = [
  { text: '01 - Primeiros Passos', link: '/pt/guides/01-getting-started' },
  { text: '02 - Criação de Projeto', link: '/pt/guides/02-project-creation' },
  { text: '03 - Desenvolvimento de Features', link: '/pt/guides/03-feature-development' },
  { text: '04 - Correção de Bugs', link: '/pt/guides/04-bug-fixing' },
  { text: '05 - Referência de Ferramentas', link: '/pt/guides/05-tools-reference' },
  { text: '06 - Solução de Problemas', link: '/pt/guides/06-troubleshooting' },
  { text: '07 - Gestão do Backlog', link: '/pt/guides/07-backlog-management' },
  { text: '08 - Novo Projeto', link: '/pt/guides/08-setup-new-project' },
  { text: '09 - Projeto Existente', link: '/pt/guides/09-setup-existing-project' },
  { text: '10 - Workflow Completo', link: '/pt/guides/10-complete-workflow' },
]

export default defineConfig({
  title: 'Claude Craft',
  description: 'A comprehensive framework for AI-assisted development with Claude Code',
  lang: 'en-US',
  base: '/claude-craft/',

  head: [
    ['link', { rel: 'icon', href: '/claude-craft/favicon.ico' }],
    // Fonts are self-hosted (Inter via VitePress theme, JetBrains Mono in public/fonts/).
    // No external Google Fonts request — removes a render-path round-trip and a third-party dependency.
  ],

  // SEO: per-page canonical tag + JSON-LD (WebSite, SoftwareApplication, BreadcrumbList)
  // + Open Graph / Twitter Card (docs/internal/SEO_AUDIT_TRACKING_20260715.md, Vague 2).
  // See constants/helpers defined above the guidesItems arrays.
  transformHead({ page, title, description }): HeadConfig[] {
    const urlPath = pageToUrlPath(page)
    const pageUrl = SITE_URL + urlPath
    const ogImage = SITE_URL + 'og-image.png'

    const canonicalHead: HeadConfig[] = [
      ['link', { rel: 'canonical', href: pageUrl }],
      ['script', { type: 'application/ld+json' }, JSON.stringify(websiteSchema)],
      ['script', { type: 'application/ld+json' }, JSON.stringify(softwareApplicationSchema)],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: SITE_NAME }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: pageUrl }],
      ['meta', { property: 'og:image', content: ogImage }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { property: 'og:image:alt', content: `${SITE_NAME} — ${SITE_DESCRIPTION}` }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: ogImage }],
    ]

    const breadcrumbList = buildBreadcrumbList(urlPath)
    if (breadcrumbList) {
      canonicalHead.push(['script', { type: 'application/ld+json' }, JSON.stringify(breadcrumbList)])
    }

    for (const alt of buildHreflangAlternates(page, localeGroups)) {
      canonicalHead.push(['link', { rel: 'alternate', hreflang: alt.hreflang, href: alt.href }])
    }

    return canonicalHead
  },

  appearance: 'dark',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,

  markdown: {
    // WCAG AA: the default github-dark Shiki comment color (#6A737D) only reaches
    // 3.0:1 on our code-block background — below the 4.5:1 threshold. Lift it to
    // #9198A1 (>=5:1) at build time without altering any other syntax token.
    codeTransformers: [
      {
        name: 'wcag-comment-contrast',
        postprocess(html: string) {
          return html.replace(/#6A737D/gi, '#9198A1')
        },
      },
    ],
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Claude Craft',

    search: {
      provider: 'local',
      options: {
        locales: {
          fr: {
            translations: {
              button: { buttonText: 'Rechercher', buttonAriaLabel: 'Rechercher' },
              modal: {
                noResultsText: 'Aucun résultat pour',
                resetButtonTitle: 'Effacer la recherche',
                footer: { selectText: 'Sélectionner', navigateText: 'Naviguer', closeText: 'Fermer' },
              },
            },
          },
          es: {
            translations: {
              button: { buttonText: 'Buscar', buttonAriaLabel: 'Buscar' },
              modal: {
                noResultsText: 'Sin resultados para',
                resetButtonTitle: 'Borrar búsqueda',
                footer: { selectText: 'Seleccionar', navigateText: 'Navegar', closeText: 'Cerrar' },
              },
            },
          },
          de: {
            translations: {
              button: { buttonText: 'Suchen', buttonAriaLabel: 'Suchen' },
              modal: {
                noResultsText: 'Keine Ergebnisse für',
                resetButtonTitle: 'Suche löschen',
                footer: { selectText: 'Auswählen', navigateText: 'Navigieren', closeText: 'Schließen' },
              },
            },
          },
          pt: {
            translations: {
              button: { buttonText: 'Pesquisar', buttonAriaLabel: 'Pesquisar' },
              modal: {
                noResultsText: 'Sem resultados para',
                resetButtonTitle: 'Limpar pesquisa',
                footer: { selectText: 'Selecionar', navigateText: 'Navegar', closeText: 'Fechar' },
              },
            },
          },
        },
      },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheBeardedBearSAS/claude-craft' },
    ],

    editLink: {
      pattern: 'https://github.com/TheBeardedBearSAS/claude-craft/edit/main/website/:path',
      text: 'Edit this page on GitHub',
    },

    nav: [
      { text: 'Documentation', link: '/en/getting-started/quickstart' },
      { text: 'Guides', link: '/en/guides/01-getting-started' },
      {
        text: 'Reference',
        items: [
          { text: 'CLI', link: '/en/reference/cli' },
          { text: 'Commands', link: '/en/reference/commands' },
          { text: 'Agents', link: '/en/reference/agents' },
          { text: 'Skills', link: '/en/reference/skills' },
          { text: 'Technologies', link: '/en/reference/technologies' },
        ],
      },
      { text: 'Changelog', link: '/en/changelog' },
      { text: 'Compare', link: '/en/compare/claude-craft-vs-superclaude' },
      { text: 'About', link: '/en/about' },
    ],

    // Outline level 2 (h2 only): on dense reference pages the deep [2,3] outline rendered
    // 100+ aside anchors, inflating DOM + hydration cost. h2-only keeps navigation useful
    // while trimming the right-rail node count (also the VitePress default).
    outline: { level: 2 },

    sidebar: {
      '/en/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Quick Start', link: '/en/getting-started/quickstart' },
            { text: 'Prerequisites', link: '/en/getting-started/prerequisites' },
            { text: 'Installation', link: '/en/getting-started/installation' },
            { text: 'Configuration', link: '/en/getting-started/configuration' },
          ],
        },
        {
          text: 'Reference',
          collapsed: false,
          items: [
            { text: 'CLI', link: '/en/reference/cli' },
            { text: 'Commands', link: '/en/reference/commands' },
            { text: 'Commands (Full)', link: '/en/reference/commands-full' },
            { text: 'Agents', link: '/en/reference/agents' },
            { text: 'Agents (Full)', link: '/en/reference/agents-full' },
            { text: 'Skills', link: '/en/reference/skills' },
            { text: 'Technologies', link: '/en/reference/technologies' },
            { text: 'Makefile', link: '/en/reference/makefile' },
            { text: 'Scripts', link: '/en/reference/scripts' },
            { text: 'Hooks', link: '/en/reference/hooks' },
            { text: 'MCP', link: '/en/reference/mcp' },
          ],
        },
        {
          text: 'Guides',
          collapsed: true,
          items: guidesItems,
        },
        {
          text: 'Frameworks',
          collapsed: true,
          items: [
            { text: 'BMAD Practical Guide', link: '/en/frameworks/bmad-guide' },
            { text: 'Ralph Wiggum Guide', link: '/en/frameworks/ralph-guide' },
            { text: 'Agent Teams', link: '/en/frameworks/agent-teams' },
          ],
        },
        {
          text: 'More',
          collapsed: true,
          items: [
            { text: 'Architecture', link: '/en/architecture' },
            { text: 'FAQ', link: '/en/faq' },
            { text: 'Troubleshooting', link: '/en/troubleshooting' },
            { text: 'Contributing', link: '/en/contributing' },
            { text: 'Changelog', link: '/en/changelog' },
          ],
        },
        {
          text: 'Migration',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/en/migration/' },
            { text: 'v4 Migration', link: '/en/migration/v4' },
            { text: 'v6 Migration', link: '/en/migration/v6' },
            { text: 'v7 Migration', link: '/en/migration/v7' },
          ],
        },
      ],
      '/fr/': [
        {
          text: 'Démarrage',
          collapsed: false,
          items: [
            { text: 'Démarrage Rapide', link: '/fr/getting-started/quickstart' },
            { text: 'Prérequis', link: '/fr/getting-started/prerequisites' },
          ],
        },
        {
          text: 'Référence',
          collapsed: false,
          items: [
            { text: 'CLI', link: '/fr/reference/cli' },
          ],
        },
        {
          text: 'Guides',
          collapsed: false,
          items: guidesItemsFr,
        },
        {
          text: 'Plus',
          collapsed: true,
          items: [
            { text: 'FAQ', link: '/fr/faq' },
            { text: 'Dépannage', link: '/fr/troubleshooting' },
          ],
        },
      ],
      '/es/': [
        {
          text: 'Inicio',
          collapsed: false,
          items: [
            { text: 'Inicio Rápido', link: '/es/getting-started/quickstart' },
            { text: 'Requisitos', link: '/es/getting-started/prerequisites' },
          ],
        },
        {
          text: 'Guías',
          collapsed: false,
          items: guidesItemsEs,
        },
      ],
      '/de/': [
        {
          text: 'Erste Schritte',
          collapsed: false,
          items: [
            { text: 'Schnellstart', link: '/de/getting-started/quickstart' },
            { text: 'Voraussetzungen', link: '/de/getting-started/prerequisites' },
          ],
        },
        {
          text: 'Anleitungen',
          collapsed: false,
          items: guidesItemsDe,
        },
      ],
      '/pt/': [
        {
          text: 'Início',
          collapsed: false,
          items: [
            { text: 'Início Rápido', link: '/pt/getting-started/quickstart' },
            { text: 'Pré-requisitos', link: '/pt/getting-started/prerequisites' },
          ],
        },
        {
          text: 'Guias',
          collapsed: false,
          items: guidesItemsPt,
        },
      ],
    },
  },

  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
    },
    fr: {
      label: 'Français',
      lang: 'fr-FR',
      // SEO: fallback <meta description> for /fr/ pages without their own frontmatter
      // `description` (VitePress uses this per-locale value instead of the English
      // root-level `description` above). See docs/internal/SEO_AUDIT_TRACKING_20260715.md.
      description:
        "Framework complet pour le développement assisté par IA avec Claude Code : règles, agents et commandes standardisés pour vos projets, prêts à l'emploi.",
      themeConfig: {
        nav: [
          { text: 'Documentation', link: '/fr/getting-started/quickstart' },
          { text: 'Guides', link: '/fr/guides/01-getting-started' },
          { text: 'Changelog', link: '/en/changelog' },
          { text: 'À propos', link: '/fr/about' },
        ],
        editLink: { text: 'Modifier cette page sur GitHub' },
        lastUpdated: { text: 'Dernière mise à jour' },
        outline: { label: 'Sur cette page' },
        docFooter: { prev: 'Précédent', next: 'Suivant' },
        darkModeSwitchLabel: 'Apparence',
        returnToTopLabel: 'Retour en haut',
        sidebarMenuLabel: 'Menu',
      },
    },
    es: {
      label: 'Español',
      lang: 'es-ES',
      // SEO: fallback <meta description> for /es/ pages — see the /fr/ locale above.
      description:
        'Framework completo para el desarrollo asistido por IA con Claude Code: reglas, agentes y comandos estandarizados listos para tus proyectos.',
      themeConfig: {
        nav: [
          { text: 'Documentación', link: '/es/getting-started/quickstart' },
          { text: 'Guías', link: '/es/guides/01-getting-started' },
          { text: 'Acerca de', link: '/es/about' },
        ],
        editLink: { text: 'Editar esta página en GitHub' },
        lastUpdated: { text: 'Última actualización' },
        outline: { label: 'En esta página' },
        docFooter: { prev: 'Anterior', next: 'Siguiente' },
      },
    },
    de: {
      label: 'Deutsch',
      lang: 'de-DE',
      // SEO: fallback <meta description> for /de/ pages — see the /fr/ locale above.
      description:
        'Umfassendes Framework für KI-gestützte Entwicklung mit Claude Code: standardisierte Regeln, Agenten und Befehle für Ihre Projekte.',
      themeConfig: {
        nav: [
          { text: 'Dokumentation', link: '/de/getting-started/quickstart' },
          { text: 'Anleitungen', link: '/de/guides/01-getting-started' },
          { text: 'Über uns', link: '/de/about' },
        ],
        editLink: { text: 'Diese Seite auf GitHub bearbeiten' },
        lastUpdated: { text: 'Zuletzt aktualisiert' },
        outline: { label: 'Auf dieser Seite' },
        docFooter: { prev: 'Zurück', next: 'Weiter' },
      },
    },
    pt: {
      label: 'Português',
      lang: 'pt-BR',
      // SEO: fallback <meta description> for /pt/ pages — see the /fr/ locale above.
      description:
        'Framework completo para desenvolvimento assistido por IA com Claude Code: regras, agentes e comandos padronizados prontos para os seus projetos.',
      themeConfig: {
        nav: [
          { text: 'Documentação', link: '/pt/getting-started/quickstart' },
          { text: 'Guias', link: '/pt/guides/01-getting-started' },
          { text: 'Sobre', link: '/pt/about' },
        ],
        editLink: { text: 'Editar esta página no GitHub' },
        lastUpdated: { text: 'Última atualização' },
        outline: { label: 'Nesta página' },
        docFooter: { prev: 'Anterior', next: 'Próximo' },
      },
    },
  },
})
