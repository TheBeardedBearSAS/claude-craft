# Exercice 3 : Maitriser les Patterns de Travail

**Module :** 3 - Patterns de Travail Quotidien
**Duree :** 30 minutes
**Niveau :** Intermediaire

---

## Objectifs

A la fin de cet exercice, vous serez capable de :

- Rediger des prompts efficaces (vagues vs precis)
- Utiliser le Plan Mode pour planifier avant d'agir
- Exploiter le mode headless (`claude -p`) pour l'automatisation
- Comprendre l'impact de la qualite des prompts sur les resultats

---

## Prerequis

- [ ] Claude Code installe et fonctionnel
- [ ] Acces a un projet existant (le votre ou un projet open source clone)
- [ ] Exercices 1 et 2 completes

---

## Etape 1 : Prompt engineering (10 min)

Naviguez dans un projet existant et pratiquez differents styles de prompts.

### 1.1 Prompt vague

```bash
> Explique ce projet
```

**Notez :** la reponse est-elle utile ? Precise ? Actionnable ?

### 1.2 Prompt precis

```bash
> Explique l'architecture de ce projet en identifiant :
> - Les couches (presentation, business, data)
> - Les patterns utilises
> - Les dependances externes
> Presente le resultat sous forme de tableau
```

**Comparez** avec la reponse precedente. Quelle difference de qualite ?

### 1.3 Prompt avec contrainte

```bash
> Identifie les 3 points d'amelioration les plus impactants
> pour la maintenabilite de ce projet. Pour chaque point,
> donne un exemple concret tire du code.
```

**Regle d'or :** Plus le prompt est precis, meilleur est le resultat. Precisez le quoi, le format et les contraintes.

---

## Etape 2 : Plan Mode (10 min)

### 2.1 Activer le Plan Mode

```bash
# Appuyez sur Shift+Tab pour basculer en Plan Mode
```

### 2.2 Demander une modification complexe

```bash
> Ajoute un systeme de cache avec invalidation
> pour les endpoints les plus appeles de l'API
```

### 2.3 Lire et modifier le plan

Observez le plan propose par Claude :
- Les fichiers a creer/modifier
- L'ordre des operations
- Les risques identifies

Demandez un ajustement :

```bash
> Ajoute aussi un endpoint pour vider le cache manuellement
```

### 2.4 Valider le plan

```bash
> Le plan est bon, implemente-le
```

**Observez :** Comment Claude execute le plan etape par etape.

---

## Etape 3 : Mode headless (10 min)

### 3.1 Prompt simple

```bash
claude -p "Combien de fichiers TypeScript dans ce projet ?" --output-format text
```

### 3.2 Piping

```bash
claude -p "Genere un .gitignore pour un projet Node.js" > .gitignore
```

### 3.3 JSON pour parsing

```bash
claude -p "Liste les dependances du projet" --output-format json | jq '.result'
```

### 3.4 Enchainement avec git

```bash
git diff HEAD~1 | claude -p "Resume les changements du dernier commit"
```

**Resultat attendu :** Chaque commande produit un resultat exploitable directement dans le terminal ou un script.

---

## Verification

- [ ] Vous avez compare un prompt vague et un prompt precis
- [ ] Vous avez utilise le Plan Mode (Shift+Tab) pour planifier une modification
- [ ] Vous avez modifie un plan avant de le valider
- [ ] Vous avez utilise `claude -p` en mode headless
- [ ] Vous avez utilise le piping pour rediriger la sortie

---

## Bonus

Si vous avez termine en avance :

1. **Testez le rewind** : lancez une implementation, puis appuyez sur `Esc+Esc` pour revenir en arriere quand Claude prend une mauvaise direction.

2. **Testez les sessions** :
   ```bash
   # Reprendre la derniere session
   claude --continue

   # Lister les sessions
   claude --resume
   ```

3. **Creez un script d'automatisation** qui utilise `claude -p` pour generer un rapport quotidien du projet :
   ```bash
   #!/bin/bash
   echo "=== Rapport du $(date) ==="
   claude -p "Resume l'etat du projet : fichiers modifies recemment, TODO restants, tests qui echouent" --output-format text
   ```
