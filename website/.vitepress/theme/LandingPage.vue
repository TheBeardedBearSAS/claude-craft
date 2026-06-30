<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { withBase } from 'vitepress'
import StatsGrid from './components/StatsGrid.vue'
import FeatureCard from './components/FeatureCard.vue'
import TechGrid from './components/TechGrid.vue'
import AgentShowcase from './components/AgentShowcase.vue'
import TerminalAnimation from './components/TerminalAnimation.vue'

const currentLang = ref('en')
const mobileMenuOpen = ref(false)
const availableLangs = ['en', 'fr', 'es', 'de', 'pt']

const translations = {
  en: {
    nav_features: "Features",
    nav_tools: "Tools",
    nav_install: "Install",
    nav_tech: "Tech Stack",
    hero_badge: "v8.18.2 - Claude Code 2.1.193",
    hero_title_1: "Supercharge",
    hero_title_2: "with Expert Knowledge",
    hero_desc: "A comprehensive framework for AI-assisted development. Install standardized rules, agents, and commands for your projects across multiple technology stacks.",
    cta_get_started: "Get Started",
    cta_docs: "Documentation",
    feat_main_title: "Everything you need to scale AI coding",
    feat_main_desc: "Stop prompting from scratch. Equip Claude with context-aware tools.",
    feat_bmad_title: "BMAD v6 Framework",
    feat_bmad_desc: "9 Agent-as-Code personas, 5 Quality Gates with thresholds, Status-based routing, and batch processing.",
    feat_ralph_title: "Ralph Wiggum v2.0",
    feat_ralph_desc: "Adaptive circuit breaker, Claude Code hooks, auto-detection, real-time dashboard, and health monitoring.",
    feat_1_title: "Multi-Language Support",
    feat_1_desc: "Native support for English, French, Spanish, German, and Portuguese. Install rules in your team's preferred language.",
    feat_2_title: "Specialized Agents",
    feat_2_desc: "Deploy virtual reviewers, architects, and coaches. From api-designer to tdd-coach, get expert feedback instantly.",
    feat_skills_title: "55 Skills",
    feat_skills_desc: "Best practices in official Claude Code format. Architecture, testing, security patterns for all technologies.",
    feat_3_title: "Automated Workflows",
    feat_3_desc: "Use 126 slash commands to automate tedious tasks. Generate components, check architecture, and run pre-commit audits.",
    tools_title: "Developer Experience Tools",
    tools_desc: "Enhance your terminal workflow with power tools designed for daily use.",
    tool_status_title: "Custom Status Line",
    tool_status_desc: "Rich status bar with profile, model, git branch, and context usage tracking.",
    tool_account_title: "Multi-Account Manager",
    tool_account_desc: "Switch easily between different Claude Code profiles and accounts with a single command.",
    tool_ralph_title: "Ralph Wiggum v2.0",
    tool_ralph_desc: "Adaptive circuit breaker, Claude Code hooks, auto-detection, dashboard, and health monitoring.",
    term_preview_label: "Terminal Preview",
    install_methods_title: "Flexible Installation Methods",
    install_method_1_title: "Makefile",
    install_method_1_desc: "Best for quick setup on single projects.",
    install_method_2_title: "YAML Config",
    install_method_2_desc: "Perfect for Monorepos and complex setups.",
    install_method_3_title: "Direct Script",
    install_method_3_desc: "Granular control without Make dependencies.",
    tech_title: "Supported Technologies",
    tech_desc: "Tailored rulesets for your favorite stacks.",
    qs_title: "Up and running in seconds",
    qs_step1_title: "Clone the repository",
    qs_step1_desc: "Get the framework on your local machine.",
    qs_step2_title: "Install rules to your project",
    qs_step2_desc: "Use the Makefile to inject rules into specific project directories.",
    qs_lang_note: "Supports: en, fr, es, de, pt",
    qs_step3_title: "Use in Claude Code",
    qs_step3_desc: "Start using slash commands and agents immediately.",
    agents_title: "Meet Your New AI Team",
    agents_desc: "Specialized personas ready to assist you.",
    footer_copyright: "\u00a9 2026 Claude Craft. MIT License.",
    footer_built: "Built for Claude Code by Anthropic",
  },
  fr: {
    nav_features: "Fonctionnalit\u00e9s",
    nav_tools: "Outils",
    nav_install: "Installation",
    nav_tech: "Technologies",
    hero_badge: "v8.18.2 - Claude Code 2.1.193",
    hero_title_1: "Superchargez",
    hero_title_2: "d'une Expertise Technique",
    hero_desc: "Un framework complet pour le d\u00e9veloppement assist\u00e9 par IA. Installez des r\u00e8gles, agents et commandes standardis\u00e9s pour vos projets.",
    cta_get_started: "Commencer",
    cta_docs: "Documentation",
    feat_main_title: "Tout pour passer \u00e0 l'\u00e9chelle",
    feat_main_desc: "Arr\u00eatez de prompter de z\u00e9ro. \u00c9quipez Claude d'outils conscients du contexte.",
    feat_bmad_title: "Framework BMAD v6",
    feat_bmad_desc: "9 agents Agent-as-Code, 5 Quality Gates avec seuils, routage par statut et traitement par lot.",
    feat_ralph_title: "Ralph Wiggum v2.0",
    feat_ralph_desc: "Circuit breaker adaptatif, hooks Claude Code, auto-d\u00e9tection, dashboard temps r\u00e9el et monitoring.",
    feat_1_title: "Support Multi-Langues",
    feat_1_desc: "Support natif pour l'anglais, le fran\u00e7ais, l'espagnol, l'allemand et le portugais.",
    feat_2_title: "Agents Sp\u00e9cialis\u00e9s",
    feat_2_desc: "D\u00e9ployez des r\u00e9viseurs, architectes et coachs virtuels.",
    feat_skills_title: "55 Skills",
    feat_skills_desc: "Bonnes pratiques au format officiel Claude Code.",
    feat_3_title: "Flux Automatis\u00e9s",
    feat_3_desc: "Utilisez 126 commandes pour automatiser les t\u00e2ches fastidieuses.",
    tools_title: "Outils d'Exp\u00e9rience D\u00e9veloppeur",
    tools_desc: "Am\u00e9liorez votre flux de travail terminal avec des outils puissants.",
    tool_status_title: "Barre d'\u00c9tat Personnalis\u00e9e",
    tool_status_desc: "Barre d'\u00e9tat riche avec profil, mod\u00e8le, git et suivi du contexte.",
    tool_account_title: "Gestionnaire Multi-Comptes",
    tool_account_desc: "Basculez facilement entre diff\u00e9rents profils et comptes Claude Code.",
    tool_ralph_title: "Ralph Wiggum v2.0",
    tool_ralph_desc: "Circuit breaker adaptatif, hooks Claude Code, auto-d\u00e9tection, dashboard et monitoring.",
    term_preview_label: "Aper\u00e7u du Terminal",
    install_methods_title: "M\u00e9thodes d'Installation Flexibles",
    install_method_1_title: "Makefile",
    install_method_1_desc: "Id\u00e9al pour configurer rapidement des projets uniques.",
    install_method_2_title: "Config YAML",
    install_method_2_desc: "Parfait pour les Monorepos et configurations complexes.",
    install_method_3_title: "Script Direct",
    install_method_3_desc: "Contr\u00f4le granulaire sans d\u00e9pendance \u00e0 Make.",
    tech_title: "Technologies Support\u00e9es",
    tech_desc: "Des jeux de r\u00e8gles sur mesure pour vos stacks pr\u00e9f\u00e9r\u00e9es.",
    qs_title: "Op\u00e9rationnel en quelques secondes",
    qs_step1_title: "Cloner le d\u00e9p\u00f4t",
    qs_step1_desc: "R\u00e9cup\u00e9rez le framework sur votre machine locale.",
    qs_step2_title: "Installer les r\u00e8gles",
    qs_step2_desc: "Utilisez le Makefile pour injecter les r\u00e8gles dans vos projets.",
    qs_lang_note: "Supporte: en, fr, es, de, pt",
    qs_step3_title: "Utiliser dans Claude Code",
    qs_step3_desc: "Commencez imm\u00e9diatement \u00e0 utiliser les commandes slash et les agents.",
    agents_title: "Rencontrez votre nouvelle \u00e9quipe IA",
    agents_desc: "Des personas sp\u00e9cialis\u00e9s pr\u00eats \u00e0 vous aider.",
    footer_copyright: "\u00a9 2026 Claude Craft. Licence MIT.",
    footer_built: "Con\u00e7u pour Claude Code par Anthropic",
  },
  es: {
    nav_features: "Caracter\u00edsticas", nav_tools: "Herramientas", nav_install: "Instalaci\u00f3n", nav_tech: "Tecnolog\u00edas",
    hero_badge: "v8.18.2 - Claude Code 2.1.193", hero_title_1: "Potencia", hero_title_2: "con Conocimiento Experto",
    hero_desc: "Un marco integral para el desarrollo asistido por IA.", cta_get_started: "Empezar", cta_docs: "Documentaci\u00f3n",
    feat_main_title: "Todo lo que necesitas para escalar", feat_main_desc: "Equipa a Claude con herramientas conscientes del contexto.",
    feat_bmad_title: "Framework BMAD v6", feat_bmad_desc: "9 agentes Agent-as-Code, 5 Quality Gates.",
    feat_ralph_title: "Ralph Wiggum v2.0", feat_ralph_desc: "Circuit breaker adaptativo, hooks Claude Code.",
    feat_1_title: "Soporte Multi-Idioma", feat_1_desc: "Soporte nativo para 5 idiomas.",
    feat_2_title: "Agentes Especializados", feat_2_desc: "Despliega revisores, arquitectos y entrenadores virtuales.",
    feat_skills_title: "55 Skills", feat_skills_desc: "Mejores pr\u00e1cticas en formato oficial de Claude Code.",
    feat_3_title: "Flujos Automatizados", feat_3_desc: "Usa 126 comandos para automatizar tareas.",
    tools_title: "Herramientas de Desarrollador", tools_desc: "Mejora tu flujo de trabajo en la terminal.",
    tool_status_title: "L\u00ednea de Estado", tool_status_desc: "Barra de estado rica con perfil, modelo y git.",
    tool_account_title: "Gestor Multi-Cuenta", tool_account_desc: "Cambia f\u00e1cilmente entre perfiles.",
    tool_ralph_title: "Ralph Wiggum v2.0", tool_ralph_desc: "Circuit breaker adaptativo.",
    term_preview_label: "Vista Previa de Terminal",
    install_methods_title: "M\u00e9todos de Instalaci\u00f3n Flexibles",
    install_method_1_title: "Makefile", install_method_1_desc: "R\u00e1pida configuraci\u00f3n.",
    install_method_2_title: "Config YAML", install_method_2_desc: "Para Monorepos.",
    install_method_3_title: "Script Directo", install_method_3_desc: "Control granular.",
    tech_title: "Tecnolog\u00edas Soportadas", tech_desc: "Reglas adaptadas para tus stacks favoritos.",
    qs_title: "Listo en segundos", qs_step1_title: "Clonar el repositorio", qs_step1_desc: "Obt\u00e9n el framework.",
    qs_step2_title: "Instalar reglas", qs_step2_desc: "Usa el Makefile para inyectar reglas.",
    qs_lang_note: "Soporta: en, fr, es, de, pt",
    qs_step3_title: "Usar en Claude Code", qs_step3_desc: "Comienza a usar comandos slash.",
    agents_title: "Conoce a tu equipo de IA", agents_desc: "Personas especializadas.",
    footer_copyright: "\u00a9 2026 Claude Craft. Licencia MIT.", footer_built: "Creado para Claude Code por Anthropic",
  },
  de: {
    nav_features: "Funktionen", nav_tools: "Werkzeuge", nav_install: "Installation", nav_tech: "Technologien",
    hero_badge: "v8.18.2 - Claude Code 2.1.193", hero_title_1: "Laden Sie", hero_title_2: "mit Expertenwissen auf",
    hero_desc: "Ein umfassendes Framework f\u00fcr KI-gest\u00fctzte Entwicklung.", cta_get_started: "Loslegen", cta_docs: "Dokumentation",
    feat_main_title: "Alles f\u00fcr skalierbare KI-Entwicklung", feat_main_desc: "Statten Sie Claude mit kontextbezogenen Tools aus.",
    feat_bmad_title: "BMAD v6 Framework", feat_bmad_desc: "9 Agent-as-Code Personas, 5 Quality Gates.",
    feat_ralph_title: "Ralph Wiggum v2.0", feat_ralph_desc: "Adaptiver Circuit Breaker, Claude Code Hooks.",
    feat_1_title: "Mehrsprachige Unterst\u00fctzung", feat_1_desc: "Native Unterst\u00fctzung f\u00fcr 5 Sprachen.",
    feat_2_title: "Spezialisierte Agenten", feat_2_desc: "Virtuelle Reviewer, Architekten und Coaches.",
    feat_skills_title: "55 Skills", feat_skills_desc: "Best Practices im offiziellen Claude Code Format.",
    feat_3_title: "Automatisierte Abl\u00e4ufe", feat_3_desc: "126 Befehle f\u00fcr Automatisierung.",
    tools_title: "Entwickler-Tools", tools_desc: "Leistungsstarke Terminal-Tools.",
    tool_status_title: "Statuszeile", tool_status_desc: "Reichhaltige Statusleiste.",
    tool_account_title: "Multi-Account Manager", tool_account_desc: "Einfacher Profilwechsel.",
    tool_ralph_title: "Ralph Wiggum v2.0", tool_ralph_desc: "Adaptiver Circuit Breaker.",
    term_preview_label: "Terminal Vorschau",
    install_methods_title: "Flexible Installationsmethoden",
    install_method_1_title: "Makefile", install_method_1_desc: "Schnelle Einrichtung.",
    install_method_2_title: "YAML Konfig", install_method_2_desc: "F\u00fcr Monorepos.",
    install_method_3_title: "Direktes Skript", install_method_3_desc: "Granulare Kontrolle.",
    tech_title: "Unterst\u00fctzte Technologien", tech_desc: "Ma\u00dfgeschneiderte Regels\u00e4tze.",
    qs_title: "In Sekunden einsatzbereit", qs_step1_title: "Repository klonen", qs_step1_desc: "Framework herunterladen.",
    qs_step2_title: "Regeln installieren", qs_step2_desc: "Makefile verwenden.",
    qs_lang_note: "Unterst\u00fctzt: en, fr, es, de, pt",
    qs_step3_title: "In Claude Code verwenden", qs_step3_desc: "Slash-Befehle und Agenten nutzen.",
    agents_title: "Treffen Sie Ihr KI-Team", agents_desc: "Spezialisierte Personas.",
    footer_copyright: "\u00a9 2026 Claude Craft. MIT Lizenz.", footer_built: "Entwickelt f\u00fcr Claude Code von Anthropic",
  },
  pt: {
    nav_features: "Funcionalidades", nav_tools: "Ferramentas", nav_install: "Instala\u00e7\u00e3o", nav_tech: "Tecnologias",
    hero_badge: "v8.18.2 - Claude Code 2.1.193", hero_title_1: "Turbine o", hero_title_2: "com Conhecimento Especializado",
    hero_desc: "Um framework abrangente para desenvolvimento assistido por IA.", cta_get_started: "Come\u00e7ar", cta_docs: "Documenta\u00e7\u00e3o",
    feat_main_title: "Tudo para escalar", feat_main_desc: "Equipe o Claude com ferramentas conscientes do contexto.",
    feat_bmad_title: "Framework BMAD v6", feat_bmad_desc: "9 agentes Agent-as-Code, 5 Quality Gates.",
    feat_ralph_title: "Ralph Wiggum v2.0", feat_ralph_desc: "Circuit breaker adaptativo, hooks Claude Code.",
    feat_1_title: "Suporte Multi-Idioma", feat_1_desc: "Suporte nativo para 5 idiomas.",
    feat_2_title: "Agentes Especializados", feat_2_desc: "Implante revisores, arquitetos e treinadores virtuais.",
    feat_skills_title: "55 Skills", feat_skills_desc: "Melhores pr\u00e1ticas no formato oficial do Claude Code.",
    feat_3_title: "Fluxos Automatizados", feat_3_desc: "Use 126 comandos para automatizar tarefas.",
    tools_title: "Ferramentas do Desenvolvedor", tools_desc: "Melhore seu fluxo de trabalho no terminal.",
    tool_status_title: "Linha de Status", tool_status_desc: "Barra de status rica.",
    tool_account_title: "Gerenciador Multi-Conta", tool_account_desc: "Alterne entre perfis.",
    tool_ralph_title: "Ralph Wiggum v2.0", tool_ralph_desc: "Circuit breaker adaptativo.",
    term_preview_label: "Visualiza\u00e7\u00e3o do Terminal",
    install_methods_title: "M\u00e9todos de Instala\u00e7\u00e3o Flex\u00edveis",
    install_method_1_title: "Makefile", install_method_1_desc: "Configura\u00e7\u00e3o r\u00e1pida.",
    install_method_2_title: "Config YAML", install_method_2_desc: "Para Monorepos.",
    install_method_3_title: "Script Direto", install_method_3_desc: "Controle granular.",
    tech_title: "Tecnologias Suportadas", tech_desc: "Regras personalizadas para suas stacks.",
    qs_title: "Funcionando em segundos", qs_step1_title: "Clonar o reposit\u00f3rio", qs_step1_desc: "Obtenha o framework.",
    qs_step2_title: "Instalar regras", qs_step2_desc: "Use o Makefile para injetar regras.",
    qs_lang_note: "Suporta: en, fr, es, de, pt",
    qs_step3_title: "Usar no Claude Code", qs_step3_desc: "Comece a usar comandos slash.",
    agents_title: "Conhe\u00e7a sua equipe de IA", agents_desc: "Personas especializadas.",
    footer_copyright: "\u00a9 2026 Claude Craft. Licen\u00e7a MIT.", footer_built: "Constru\u00eddo para Claude Code por Anthropic",
  },
}

function t(key) {
  return translations[currentLang.value]?.[key] || translations.en[key] || key
}

const langToLocale = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  pt: 'pt-PT',
}

function changeLanguage(lang) {
  currentLang.value = lang
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('claude_craft_lang', lang)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = langToLocale[lang] || lang
  }
}

onMounted(() => {
  const saved = localStorage.getItem('claude_craft_lang')
  const browser = navigator.language.split('-')[0]
  if (saved && availableLangs.includes(saved)) {
    currentLang.value = saved
  } else if (availableLangs.includes(browser)) {
    currentLang.value = browser
  }

})
</script>

<template>
  <a href="#main" class="skip-link">Skip to main content</a>
  <div class="landing-page" style="background-color: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif;">
    <!-- Navigation -->
    <nav style="position: fixed; width: 100%; z-index: 50; top: 0; left: 0; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(15,23,42,0.8); backdrop-filter: blur(12px);">
      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; height: 4rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <span style="font-weight: 700; font-size: 1.25rem; letter-spacing: -0.025em;">Claude Craft</span>
          </div>
          <div class="nav-links" style="display: flex; align-items: center; gap: 1rem;">
            <a :href="'#features'" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0.75rem;">{{ t('nav_features') }}</a>
            <a :href="'#tools'" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0.75rem;">{{ t('nav_tools') }}</a>
            <a :href="'#install'" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0.75rem;">{{ t('nav_install') }}</a>
            <a :href="'#technologies'" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0.75rem;">{{ t('nav_tech') }}</a>
            <a :href="withBase('/' + currentLang + '/getting-started/quickstart')" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0.75rem;">{{ t('cta_docs') }}</a>
            <select :value="currentLang" @change="changeLanguage($event.target.value)" aria-label="Select language" style="background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.375rem; padding: 0.25rem 0.5rem; font-size: 0.875rem; cursor: pointer;">
              <option value="en" style="background: #1e293b;">English</option>
              <option value="fr" style="background: #1e293b;">Français</option>
              <option value="es" style="background: #1e293b;">Español</option>
              <option value="de" style="background: #1e293b;">Deutsch</option>
              <option value="pt" style="background: #1e293b;">Português</option>
            </select>
            <a href="https://github.com/TheBeardedBearSAS/claude-craft" target="_blank" aria-label="GitHub repository" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.375rem; color: white; text-decoration: none; font-size: 0.875rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              GitHub
            </a>
          </div>
          <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Menu" style="display: none; background: none; border: none; color: white; cursor: pointer; padding: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </nav>
    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="mobile-menu" style="position: fixed; top: 4rem; left: 0; right: 0; z-index: 49; background: rgba(15,23,42,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1rem 1.5rem; display: none;">
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <a href="#features" @click="mobileMenuOpen = false" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0;">{{ t('nav_features') }}</a>
        <a href="#tools" @click="mobileMenuOpen = false" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0;">{{ t('nav_tools') }}</a>
        <a href="#install" @click="mobileMenuOpen = false" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0;">{{ t('nav_install') }}</a>
        <a href="#technologies" @click="mobileMenuOpen = false" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0;">{{ t('nav_tech') }}</a>
        <a :href="withBase('/' + currentLang + '/getting-started/quickstart')" @click="mobileMenuOpen = false" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 0;">{{ t('cta_docs') }}</a>
        <select :value="currentLang" @change="changeLanguage($event.target.value)" aria-label="Select language" style="background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.375rem; padding: 0.5rem; font-size: 0.875rem; cursor: pointer; width: 100%;">
          <option value="en" style="background: #1e293b;">English</option>
          <option value="fr" style="background: #1e293b;">Français</option>
          <option value="es" style="background: #1e293b;">Español</option>
          <option value="de" style="background: #1e293b;">Deutsch</option>
          <option value="pt" style="background: #1e293b;">Português</option>
        </select>
        <a href="https://github.com/TheBeardedBearSAS/claude-craft" target="_blank" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; color: #94a3b8; text-decoration: none; font-size: 0.875rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          GitHub
        </a>
      </div>
    </div>

    <main id="main">
    <!-- Hero Section -->
    <div style="position: relative; padding: 10rem 0 5rem; overflow: hidden;">
      <div style="position: absolute; top: 10%; left: 20%; width: 18rem; height: 18rem; background: rgba(124,58,237,0.2); border-radius: 50%; filter: blur(100px);"></div>
      <div style="position: absolute; bottom: 10%; right: 20%; width: 24rem; height: 24rem; background: rgba(37,99,235,0.1); border-radius: 50%; filter: blur(100px);"></div>

      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; text-align: center; position: relative;">
        <div style="display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid rgba(139,92,246,0.3); background: rgba(139,92,246,0.1); color: #c4b5fd; font-size: 0.75rem; font-weight: 500; margin-bottom: 1.5rem;">
          <span style="display: flex; height: 0.5rem; width: 0.5rem; border-radius: 50%; background: #a78bfa; margin-right: 0.5rem; animation: pulse 2s infinite;"></span>
          {{ t('hero_badge') }}
        </div>

        <h1 style="font-size: 3.75rem; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 1.5rem; line-height: 1.1;">
          {{ t('hero_title_1') }} <span style="background: linear-gradient(to right, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Claude Code</span><br>
          {{ t('hero_title_2') }}
        </h1>

        <p style="margin-top: 1rem; max-width: 42rem; margin-left: auto; margin-right: auto; font-size: 1.25rem; color: #94a3b8;">
          {{ t('hero_desc') }}
        </p>

        <div style="margin-top: 2.5rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <a href="#quickstart" style="display: inline-flex; align-items: center; padding: 0.75rem 2rem; background: #7c3aed; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 500; font-size: 1.125rem; box-shadow: 0 4px 14px rgba(139,92,246,0.3);">
            {{ t('cta_get_started') }}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 0.5rem;"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a :href="withBase('/' + currentLang + '/getting-started/quickstart')" style="display: inline-flex; align-items: center; padding: 0.75rem 2rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #cbd5e1; border-radius: 0.5rem; text-decoration: none; font-weight: 500; font-size: 1.125rem; backdrop-filter: blur(4px);">
            {{ t('cta_docs') }}
          </a>
        </div>

        <StatsGrid />
      </div>
    </div>

    <!-- Features -->
    <section id="features" style="padding: 5rem 0; background: #1e293b;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
        <div style="text-align: center; margin-bottom: 4rem;">
          <h2 style="font-size: 2.25rem; font-weight: 700; color: white;">{{ t('feat_main_title') }}</h2>
          <p style="margin-top: 1rem; font-size: 1.25rem; color: #94a3b8;">{{ t('feat_main_desc') }}</p>
        </div>
        <div class="grid-3col" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
          <FeatureCard icon="git-branch" color="cyan" :badge="'v8.18.2'" :title="t('feat_bmad_title')" :desc="t('feat_bmad_desc')" />
          <FeatureCard icon="repeat" color="orange" :badge="'v8.18.2'" :title="t('feat_ralph_title')" :desc="t('feat_ralph_desc')" />
          <FeatureCard icon="globe" color="brand" :title="t('feat_1_title')" :desc="t('feat_1_desc')" />
          <FeatureCard icon="bot" color="blue" :title="t('feat_2_title')" :desc="t('feat_2_desc')" />
          <FeatureCard icon="sparkles" color="emerald" :title="t('feat_skills_title')" :desc="t('feat_skills_desc')" />
          <FeatureCard icon="zap" color="pink" :title="t('feat_3_title')" :desc="t('feat_3_desc')" />
        </div>
      </div>
    </section>

    <!-- Developer Tools Section -->
    <section id="tools" style="padding: 5rem 0; background: #0f172a; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);">
      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
        <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;">
          <div>
            <h2 style="font-size: 2.25rem; font-weight: 700; color: white; margin-bottom: 1rem;">{{ t('tools_title') }}</h2>
            <p style="font-size: 1.25rem; color: #94a3b8; margin-bottom: 2rem;">{{ t('tools_desc') }}</p>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div style="display: flex; gap: 1rem;">
                <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: rgba(139,92,246,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                </div>
                <div>
                  <h3 style="font-size: 1.125rem; font-weight: 600; color: white;">{{ t('tool_status_title') }}</h3>
                  <p style="color: #94a3b8;">{{ t('tool_status_desc') }}</p>
                </div>
              </div>
              <div style="display: flex; gap: 1rem;">
                <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: rgba(59,130,246,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <h3 style="font-size: 1.125rem; font-weight: 600; color: white;">{{ t('tool_account_title') }}</h3>
                  <p style="color: #94a3b8;">{{ t('tool_account_desc') }}</p>
                </div>
              </div>
              <div style="display: flex; gap: 1rem;">
                <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: rgba(249,115,22,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
                </div>
                <div>
                  <h3 style="font-size: 1.125rem; font-weight: 600; color: white;">{{ t('tool_ralph_title') }}</h3>
                  <p style="color: #94a3b8;">{{ t('tool_ralph_desc') }}</p>
                </div>
              </div>
            </div>
          </div>
          <TerminalAnimation :lang="currentLang" :t="t" />
        </div>
      </div>
    </section>

    <!-- Quick Start -->
    <section id="quickstart" style="padding: 6rem 0 3rem; background: #1e293b;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
        <div class="grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
          <div>
            <h2 style="font-size: 2.25rem; font-weight: 700; color: white; margin-bottom: 1.5rem;">{{ t('qs_title') }}</h2>
            <div style="display: flex; flex-direction: column; gap: 2rem;">
              <div v-for="(step, i) in [
                { title: t('qs_step1_title'), desc: t('qs_step1_desc') },
                { title: t('qs_step2_title'), desc: t('qs_step2_desc') },
                { title: t('qs_step3_title'), desc: t('qs_step3_desc') },
              ]" :key="i" style="display: flex;">
                <div style="flex-shrink: 0;">
                  <div style="display: flex; align-items: center; justify-content: center; height: 2.5rem; width: 2.5rem; border-radius: 50%; background: #7c3aed; color: white; font-weight: 700;">{{ i + 1 }}</div>
                </div>
                <div style="margin-left: 1rem;">
                  <h3 style="font-size: 1.125rem; font-weight: 500; color: white;">{{ step.title }}</h3>
                  <p style="margin-top: 0.5rem; color: #94a3b8;">{{ step.desc }}</p>
                  <div v-if="i === 1" style="margin-top: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.25rem; font-size: 0.75rem; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.05);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    {{ t('qs_lang_note') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Quick Start Terminal -->
          <div style="position: relative;">
            <div style="background: #1e1e1e; border: 1px solid #333; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 20px 25px rgba(0,0,0,0.5);">
              <div style="background: #252526; padding: 0.5rem 0.75rem; border-bottom: 1px solid #333; display: flex; gap: 6px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></div>
              </div>
              <div style="padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; color: #cbd5e1; min-height: 280px;">
                <div style="margin-bottom: 0.75rem;">
                  <span style="color: #94a3b8;">$</span> <span style="color: #e2e8f0;">npx @the-bearded-bear/claude-craft install . --tech=react --lang=fr</span>
                </div>
                <div style="color: #4ade80; margin-bottom: 0.25rem;">Installing React rules (French)... Done</div>
                <div style="color: #94a3b8; margin-bottom: 0.75rem;">Installing Templates... Done</div>
                <div style="margin-bottom: 0.75rem;">
                  <span style="color: #94a3b8;">$</span> <span style="color: #e2e8f0;">npx @the-bearded-bear/claude-craft install-tools</span>
                </div>
                <div style="color: #4ade80; margin-bottom: 0.75rem;">Installing StatusLine... Done</div>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(15,23,42,0.8); border-radius: 0.375rem; border: 1px solid rgba(255,255,255,0.1);">
                  <span style="color: #c084fc;">User:</span> <span style="color: #e2e8f0;">/react:generate-component Button</span><br>
                  <span style="color: #60a5fa;">Claude:</span> <span style="color: #94a3b8;">I'll generate a Button component using your project's React standards...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Installation Methods -->
    <section id="install" style="padding: 4rem 0; background: #0f172a; border-top: 1px solid rgba(255,255,255,0.05);">
      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
        <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 2rem; text-align: center;">{{ t('install_methods_title') }}</h3>
        <div class="grid-3col" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
          <div v-for="method in [
            { title: t('install_method_1_title'), desc: t('install_method_1_desc'), cmd: 'make install-symfony TARGET=~/proj', color: '#8b5cf6' },
            { title: t('install_method_2_title'), desc: t('install_method_2_desc'), cmd: 'make config-install PROJECT=mono', color: '#3b82f6' },
            { title: t('install_method_3_title'), desc: t('install_method_3_desc'), cmd: './scripts/install-rules.sh ...', color: '#22c55e' },
          ]" :key="method.title" style="padding: 1.5rem; background: rgba(30,41,59,0.5); border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.05);">
            <h4 style="font-weight: 700; color: white; margin-bottom: 0.5rem;">{{ method.title }}</h4>
            <p style="font-size: 0.875rem; color: #94a3b8; margin-bottom: 1rem; min-height: 2.5rem;">{{ method.desc }}</p>
            <div style="background: rgba(0,0,0,0.5); padding: 0.75rem; border-radius: 0.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #cbd5e1;">
              {{ method.cmd }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technologies -->
    <TechGrid :title="t('tech_title')" :desc="t('tech_desc')" />

    <!-- Agents -->
    <AgentShowcase :title="t('agents_title')" :desc="t('agents_desc')" />

    </main>
    <!-- Footer -->
    <footer style="background: #0f172a; border-top: 1px solid rgba(255,255,255,0.1); padding: 4rem 0 2rem;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <span style="font-weight: 700; font-size: 1.25rem;">Claude Craft</span>
          </div>
          <a href="https://github.com/TheBeardedBearSAS/claude-craft" target="_blank" aria-label="GitHub repository" style="color: #94a3b8; text-decoration: none;">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
        </div>
        <div class="footer-row" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: #94a3b8;">
          <p>{{ t('footer_copyright') }}</p>
          <p>{{ t('footer_built') }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Accessibility: skip link */
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  background: #7c3aed;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  z-index: 9999;
}
.skip-link:focus {
  position: fixed;
  left: 8px;
  top: 8px;
  width: auto;
  height: auto;
  overflow: visible;
}

/* Animations: only play when the user has no motion preference */
@media (prefers-reduced-motion: no-preference) {
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
}

.landing-page :deep(.VPNav),
.landing-page :deep(.VPSidebar),
.landing-page :deep(.VPFooter) {
  display: none !important;
}

@media (max-width: 768px) {
  .landing-page h1 {
    font-size: 2rem !important;
  }
  .landing-page h2 {
    font-size: 1.75rem !important;
  }
  .nav-links {
    display: none !important;
  }
  .mobile-menu-btn {
    display: block !important;
  }
  .mobile-menu {
    display: block !important;
  }
  .grid-3col {
    grid-template-columns: 1fr !important;
  }
  .grid-2col {
    grid-template-columns: 1fr !important;
    gap: 2rem !important;
  }
  .footer-row {
    flex-direction: column !important;
    gap: 0.5rem !important;
    text-align: center !important;
  }
}
</style>
