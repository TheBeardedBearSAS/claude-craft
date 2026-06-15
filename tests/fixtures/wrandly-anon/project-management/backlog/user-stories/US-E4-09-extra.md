---
id: US-E4-09
title: "Story markdown id E-style (cas limite)"
status: ready-for-dev
story_points: 3
---

**Note de test :** Cet fichier sert de cas limite pour le scanner de stories markdown.

L'identifiant `US-E4-09` suit le format épic-style (`US-E{n}-{seq}`), mais ce fichier est placé dans `backlog/user-stories/` et **non** dans un dossier d'epic. Le scanner doit être capable de le détecter via le frontmatter YAML (`id: US-E4-09`) indépendamment du chemin de fichier.

Ce cas vérifie que le parser YAML prend la priorité sur l'inférence du chemin pour l'attribution de l'epic.
