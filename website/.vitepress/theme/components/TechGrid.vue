<script setup lang="ts">
import { useData } from 'vitepress'

defineProps<{
  title: string
  desc: string
}>()

const { site } = useData()
const base = site.value.base || '/'

const appTechs = [
  { name: 'Symfony', logo: `${base}logos/symfony.svg`, desc: 'Clean Arch, DDD, API Platform' },
  { name: 'Flutter', logo: `${base}logos/flutter.svg`, desc: 'BLoC, Material, Cupertino' },
  { name: 'Python', logo: `${base}logos/python.svg`, desc: 'FastAPI, Async, Typing' },
  { name: 'React', logo: `${base}logos/react.svg`, desc: 'Hooks, A11y, State Mgmt' },
  { name: 'React Native', logo: `${base}logos/react.svg`, desc: 'Navigation, Native Modules' },
  { name: 'Angular', logo: `${base}logos/angular.svg`, desc: 'Standalone, Signals, OnPush' },
  { name: 'C#/.NET', logo: `${base}logos/dotnet.svg`, desc: 'Clean Arch, CQRS, EF Core' },
  { name: 'Laravel', logo: `${base}logos/laravel.svg`, desc: 'Clean Arch, Pest PHP, Sanctum' },
  { name: 'Vue.js', logo: `${base}logos/vuejs.svg`, desc: 'Composition API, Pinia, Vitest' },
  { name: 'PHP', logo: `${base}logos/php.svg`, desc: 'Clean Arch, PSR-12, PHPStan' },
  { name: 'Paperclip', logo: `${base}logos/paperclip.svg`, desc: 'Control plane + adapters, governance-first' },
]

const infraTechs = [
  { name: 'Docker', logo: `${base}logos/docker.svg`, desc: 'Dockerfile, Compose, CI/CD' },
  { name: 'Coolify', logo: `${base}logos/coolify.svg`, desc: 'Self-hosted, Auto-deploy' },
  { name: 'Kubernetes', logo: `${base}logos/kubernetes.svg`, desc: 'Orchestration, Scaling' },
  { name: 'OpenTofu', logo: `${base}logos/opentofu.svg`, desc: 'IaC, State, Modules' },
  { name: 'Ansible', logo: `${base}logos/ansible.svg`, desc: 'Playbooks, Roles, Vault' },
  { name: 'Hetzner Cloud', logo: `${base}logos/hetzner.svg`, desc: 'Servers, Networks, LB' },
  { name: 'PgBouncer', logo: `${base}logos/pgbouncer.svg`, desc: 'Connection Pooling' },
  { name: 'FrankenPHP', logo: `${base}logos/frankenphp.svg`, desc: 'App Server, Worker Mode' },
]
</script>

<template>
  <section id="technologies" style="padding: 5rem 0; background: #1e293b; position: relative; overflow: hidden;">
    <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 10;">
      <div style="text-align: center; margin-bottom: 4rem;">
        <h2 style="font-size: 2.25rem; font-weight: 700; color: white;">{{ title }}</h2>
        <p style="margin-top: 1rem; color: #94a3b8;">{{ desc }}</p>
      </div>
      <div class="tech-grid tech-grid-3" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem;">
        <div v-for="tech in appTechs" :key="tech.name" style="background: rgba(30,41,59,0.5); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.05); text-align: center; transition: border-color 0.3s;" class="tech-card">
          <div style="height: 4rem; width: 4rem; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; transition: transform 0.3s;" class="tech-icon">
            <img :src="tech.logo" :alt="tech.name" class="tech-logo" />
          </div>
          <h3 style="font-weight: 700; color: white;">{{ tech.name }}</h3>
          <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem;">{{ tech.desc }}</p>
        </div>
      </div>

      <h3 style="color: #94a3b8; margin: 3rem 0 1.5rem; font-size: 1.1rem; text-align: center;">Infrastructure</h3>

      <div class="tech-grid tech-grid-4" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem;">
        <div v-for="tech in infraTechs" :key="tech.name" style="background: rgba(30,41,59,0.5); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.05); text-align: center; transition: border-color 0.3s;" class="tech-card">
          <div style="height: 4rem; width: 4rem; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; transition: transform 0.3s;" class="tech-icon">
            <img :src="tech.logo" :alt="tech.name" class="tech-logo" />
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
.tech-logo {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
}
.tech-card {
  flex-grow: 0;
  flex-shrink: 1;
}
.tech-grid-3 .tech-card {
  flex-basis: calc((100% - 3rem) / 3);
}
.tech-grid-4 .tech-card {
  flex-basis: calc((100% - 4.5rem) / 4);
}
@media (max-width: 768px) {
  .tech-card {
    flex-basis: calc((100% - 1.5rem) / 2) !important;
  }
}
@media (max-width: 480px) {
  .tech-card {
    flex-basis: 100% !important;
  }
}
</style>
