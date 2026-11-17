---
name: architecture-paperclip
description: Arquitectura de dos capas de Paperclip (control plane + adaptadores). Usar al diseñar o revisar límites de módulo/adaptador de Paperclip.
---

# Arquitectura Paperclip

Sistema de dos capas: control plane (servidor + web + DB) mantiene todo el estado de gobernanza; los adaptadores ejecutan trabajo y reportan. Los adaptadores nunca deciden presupuestos o aprobaciones.

Ver ../../rules/02-architecture-paperclip.md para documentación detallada.
