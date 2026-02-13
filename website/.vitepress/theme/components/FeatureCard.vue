<script setup lang="ts">
defineProps<{
  icon: string
  color: string
  badge?: string
  title: string
  desc: string
}>()

const colorMap: Record<string, { bg: string; text: string; badgeBg: string; badgeText: string; badgeBorder: string }> = {
  cyan: { bg: 'rgba(6,182,212,0.2)', text: '#22d3ee', badgeBg: 'rgba(6,182,212,0.2)', badgeText: '#67e8f9', badgeBorder: 'rgba(6,182,212,0.3)' },
  orange: { bg: 'rgba(249,115,22,0.2)', text: '#fb923c', badgeBg: 'rgba(249,115,22,0.2)', badgeText: '#fdba74', badgeBorder: 'rgba(249,115,22,0.3)' },
  brand: { bg: 'rgba(139,92,246,0.2)', text: '#a78bfa', badgeBg: 'rgba(139,92,246,0.2)', badgeText: '#c4b5fd', badgeBorder: 'rgba(139,92,246,0.3)' },
  blue: { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa', badgeBg: 'rgba(59,130,246,0.2)', badgeText: '#93c5fd', badgeBorder: 'rgba(59,130,246,0.3)' },
  emerald: { bg: 'rgba(16,185,129,0.2)', text: '#34d399', badgeBg: 'rgba(16,185,129,0.2)', badgeText: '#6ee7b7', badgeBorder: 'rgba(16,185,129,0.3)' },
  pink: { bg: 'rgba(236,72,153,0.2)', text: '#f472b6', badgeBg: 'rgba(236,72,153,0.2)', badgeText: '#f9a8d4', badgeBorder: 'rgba(236,72,153,0.3)' },
}
</script>

<template>
  <div style="background: rgba(30,41,59,0.5); backdrop-filter: blur(10px); border: 1px solid rgba(148,163,184,0.1); padding: 2rem; border-radius: 1rem; position: relative; overflow: hidden; transition: all 0.3s ease;" class="feature-card">
    <div v-if="badge" :style="{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.125rem 0.5rem', background: colorMap[color]?.badgeBg, color: colorMap[color]?.badgeText, fontSize: '0.75rem', borderRadius: '9999px', border: '1px solid ' + (colorMap[color]?.badgeBorder || 'transparent') }">
      {{ badge }}
    </div>
    <div :style="{ width: '3rem', height: '3rem', background: colorMap[color]?.bg, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }">
      <!-- Icon placeholder - using text instead of lucide for SSR compatibility -->
      <span :style="{ color: colorMap[color]?.text, fontSize: '1.25rem', fontWeight: 700 }">
        {{ icon === 'git-branch' ? '\u2387' : icon === 'repeat' ? '\u21bb' : icon === 'globe' ? '\u2609' : icon === 'bot' ? '\u2699' : icon === 'sparkles' ? '\u2728' : icon === 'zap' ? '\u26a1' : '\u2022' }}
      </span>
    </div>
    <h3 style="font-size: 1.25rem; font-weight: 600; color: white; margin-bottom: 0.75rem;">{{ title }}</h3>
    <p style="color: #94a3b8;">{{ desc }}</p>
  </div>
</template>

<style scoped>
.feature-card:hover {
  transform: translateY(-5px);
  border-color: rgba(139, 92, 246, 0.5) !important;
  background: rgba(30, 41, 59, 0.8) !important;
}
</style>
