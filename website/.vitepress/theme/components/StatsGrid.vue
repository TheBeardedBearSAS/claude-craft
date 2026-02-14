<template>
  <div class="stats-grid" style="margin-top: 4rem; display: grid; grid-template-columns: repeat(6, 1fr); gap: 2rem; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 2rem 0; background: rgba(255,255,255,0.02);">
    <div v-for="stat in stats" :key="stat.label" style="display: flex; flex-direction: column; align-items: center;">
      <dd style="font-size: 1.875rem; font-weight: 800; color: white;">{{ stat.value }}</dd>
      <dt style="margin-top: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #94a3b8;">{{ stat.label }}</dt>
    </div>
  </div>
</template>

<script setup>
const stats = [
  { value: '10', label: 'Tech Stacks' },
  { value: '33', label: 'AI Agents' },
  { value: '160', label: 'Slash Commands' },
  { value: '36', label: 'Skills' },
  { value: '21', label: 'Templates' },
  { value: '10', label: 'Checklists' },
]
</script>

<style scoped>
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 1.5rem !important;
  }
}
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 1rem !important;
  }
}
</style>
