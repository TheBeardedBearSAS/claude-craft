<script setup lang="ts">
defineProps<{
  title: string
  desc: string
}>()

const techs = [
  { name: 'Symfony', abbr: 'Sf', bg: '#000', color: '#fff', desc: 'Clean Arch, DDD, API Platform' },
  { name: 'Flutter', abbr: 'Fl', bg: '#02569B', color: '#fff', desc: 'BLoC, Material, Cupertino' },
  { name: 'Python', abbr: 'Py', bg: '#3776AB', color: '#FFD43B', desc: 'FastAPI, Async, Typing' },
  { name: 'React', abbr: 'Re', bg: '#20232a', color: '#61dafb', desc: 'Hooks, A11y, State Mgmt' },
  { name: 'React Native', abbr: 'RN', bg: '#20232a', color: '#61dafb', desc: 'Navigation, Native Modules' },
  { name: 'Angular', abbr: 'A', bg: '#DD0031', color: '#fff', desc: 'Standalone, Signals, OnPush' },
  { name: 'C#/.NET', abbr: 'C#', bg: '#512BD4', color: '#fff', desc: 'Clean Arch, CQRS, EF Core' },
  { name: 'Laravel', abbr: 'La', bg: '#FF2D20', color: '#fff', desc: 'Clean Arch, Pest PHP, Sanctum' },
  { name: 'Vue.js', abbr: 'V', bg: '#42B883', color: '#fff', desc: 'Composition API, Pinia, Vitest' },
  { name: 'PHP', abbr: 'PHP', bg: '#777BB4', color: '#fff', desc: 'Clean Arch, PSR-12, PHPStan' },
  { name: 'Docker', abbr: 'D', bg: '#2496ED', color: '#fff', desc: 'Dockerfile, Compose, CI/CD' },
]
</script>

<template>
  <section id="technologies" style="padding: 5rem 0; background: #1e293b; position: relative; overflow: hidden;">
    <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 10;">
      <div style="text-align: center; margin-bottom: 4rem;">
        <h2 style="font-size: 2.25rem; font-weight: 700; color: white;">{{ title }}</h2>
        <p style="margin-top: 1rem; color: #94a3b8;">{{ desc }}</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
        <div v-for="tech in techs" :key="tech.name" style="background: rgba(30,41,59,0.5); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.05); text-align: center; transition: border-color 0.3s;" class="tech-card">
          <div :style="{ height: '4rem', width: '4rem', margin: '0 auto 1rem', background: tech.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px rgba(0,0,0,0.3)', transition: 'transform 0.3s' }" class="tech-icon">
            <span :style="{ fontSize: tech.abbr.length > 2 ? '0.875rem' : '1.25rem', fontWeight: 700, color: tech.color }">{{ tech.abbr }}</span>
          </div>
          <h3 style="font-weight: 700; color: white;">{{ tech.name }}</h3>
          <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem;">{{ tech.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tech-card:hover {
  border-color: rgba(139, 92, 246, 0.5) !important;
}
.tech-card:hover .tech-icon {
  transform: scale(1.1);
}
</style>
