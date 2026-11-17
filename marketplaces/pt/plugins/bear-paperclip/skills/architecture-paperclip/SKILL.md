---
name: architecture-paperclip
description: Arquitetura duas camadas Paperclip (control plane + adapters). Use ao projetar ou revisar limites modulo/adapter Paperclip.
---

# Arquitetura Paperclip

Sistema duas camadas: control plane (server + web + DB) mantem todo estado governanca; adapters executam trabalho e reportam. Adapters nunca decidem orcamentos ou aprovacoes.

Veja ../../rules/02-architecture-paperclip.md para documentacao detalhada.
