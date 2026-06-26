<script setup lang="ts">
defineProps<{
  title: string
  desc: string
}>()

const agents = [
  { name: 'bmad-master', desc: 'BMAD orchestrator: routing, gates enforcement, sprint lifecycle, batch processing.', color: '#22d3ee', badge: 'BMAD v6', badgeBg: 'rgba(6,182,212,0.2)', borderColor: 'rgba(6,182,212,0.3)' },
  { name: 'ralph-conductor', desc: 'v2.0: Adaptive profiles, hooks integration, health monitoring, and DoD templates.', color: '#fb923c', badge: 'v8.17.2', badgeBg: 'rgba(249,115,22,0.2)', borderColor: 'rgba(249,115,22,0.3)' },
  { name: 'uiux-orchestrator', desc: 'Coordinates UI, UX, and Accessibility experts for holistic design solutions.', color: '#f472b6', badge: null, badgeBg: null, borderColor: 'rgba(51,65,85,1)' },
  { name: 'product-owner', desc: 'Helps with user stories, backlog prioritization, and sprint planning.', color: '#fbbf24', badge: null, badgeBg: null, borderColor: 'rgba(51,65,85,1)' },
  { name: 'accessibility-expert', desc: 'Ensures WCAG 2.2 AAA compliance and ARIA best practices.', color: '#2dd4bf', badge: null, badgeBg: null, borderColor: 'rgba(51,65,85,1)' },
  { name: 'tech-lead', desc: 'Technical task decomposition, architecture decisions, and risk assessment.', color: '#818cf8', badge: null, badgeBg: null, borderColor: 'rgba(51,65,85,1)' },
  { name: 'api-designer', desc: 'Expert in REST/GraphQL design, ensuring consistency and best practices in API contracts.', color: '#a78bfa', badge: null, badgeBg: null, borderColor: 'rgba(51,65,85,1)' },
  { name: 'devops-engineer', desc: 'Assists with Docker configurations, CI/CD pipelines, and deployment strategies.', color: '#f87171', badge: null, badgeBg: null, borderColor: 'rgba(51,65,85,1)' },
]
</script>

<template>
  <section id="agents" style="padding: 5rem 0; background: #0f172a;">
    <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h2 style="font-size: 2.25rem; font-weight: 700; color: white;">{{ title }}</h2>
        <p style="margin-top: 1rem; color: #94a3b8;">{{ desc }}</p>
      </div>
      <div class="agent-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;">
        <div v-for="agent in agents" :key="agent.name" :style="{ padding: '1.5rem', background: 'rgba(30,41,59,0.8)', borderRadius: '0.5rem', border: '1px solid ' + agent.borderColor, position: 'relative' }">
          <div v-if="agent.badge" :style="{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.125rem 0.5rem', background: agent.badgeBg, color: agent.color, fontSize: '0.75rem', borderRadius: '9999px' }">
            {{ agent.badge }}
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
            <span :style="{ color: agent.color, fontSize: '1.25rem' }">&#9679;</span>
            <h3 style="font-weight: 700; color: white; font-family: 'JetBrains Mono', monospace; font-size: 0.875rem;">{{ agent.name }}</h3>
          </div>
          <p style="font-size: 0.875rem; color: #94a3b8;">{{ agent.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 768px) {
  .agent-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 480px) {
  .agent-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
