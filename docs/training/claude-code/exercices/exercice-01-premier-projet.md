# Exercice 1 : Premier Pas avec Claude Code

**Module :** 1 - Introduction a Claude Code
**Duree :** 30 minutes
**Niveau :** Debutant

---

## Objectifs

A la fin de cet exercice, vous serez capable de :

- Installer et lancer Claude Code
- Utiliser les commandes de base (`/help`, `/status`, `/cost`)
- Ecrire vos premiers prompts
- Experimenter l'Extended Thinking
- Changer de modele (`/model`)

---

## Prerequis

- [ ] Acces a un terminal (macOS, Linux ou Windows)
- [ ] Cle API Anthropic configuree
- [ ] Connexion Internet active

---

## Etape 1 : Installation (5 min)

Installez Claude Code avec la methode adaptee a votre systeme :

```bash
# macOS
brew install claude-code

# Linux
curl -fsSL https://cli.anthropic.com/install.sh | sh

# Windows
winget install Anthropic.ClaudeCode

# Fallback (npm)
npm install -g @anthropic-ai/claude-code
```

Verifiez l'installation :

```bash
claude --version
```

**Resultat attendu :** Le numero de version s'affiche (ex: `2.1.154`).

---

## Etape 2 : Premiere interaction (5 min)

Lancez Claude Code et testez les commandes de base :

```bash
# Lancer Claude Code
claude

# Tester les commandes de base
/help
/status
/cost
```

**Resultat attendu :**
- `/help` affiche la liste des commandes disponibles
- `/status` montre le modele actif, le % de contexte et le cout
- `/cost` affiche le cout de la session en cours

---

## Etape 3 : Premier prompt (5 min)

Testez differents types de prompts :

```bash
# Demander a Claude de se presenter
> Presente-toi et explique ce que tu peux faire

# Explorer les capacites
> Quels fichiers existent dans le repertoire courant ?

# Tester l'execution de commandes
> Quelle version de Node.js est installee sur ce systeme ?
```

**Observez :**
- Comment Claude explore le systeme de fichiers
- Les outils qu'il utilise (Bash, Read, Glob, etc.)
- Le format de ses reponses

---

## Etape 4 : Extended Thinking (10 min)

Testez la difference entre un prompt simple et un prompt avec thinking :

```bash
# Prompt simple (sans thinking)
> Quels sont les avantages de TypeScript ?

# Prompt avec thinking
> think about the pros and cons of microservices vs monolith for a startup

# Prompt avec thinking approfondi
> think hard about how to design a scalable event-driven architecture
```

**Observez :**
- La difference de profondeur entre les reponses
- Le temps de reponse supplementaire avec le thinking
- La qualite de l'analyse avec `think hard`

---

## Etape 5 : Changer de modele (5 min)

```bash
# Verifier le modele actuel
/status

# Passer en Opus
/model opus

# Poser une question complexe
> Analyse les trade-offs entre REST, GraphQL et gRPC pour une API publique

# Revenir a Sonnet
/model sonnet

# Tester le mode fast
/fast
```

**Observez :**
- Le changement de modele dans la status line
- La difference de qualite entre Sonnet et Opus
- La vitesse du mode fast

---

## Verification

- [ ] Claude Code est installe et fonctionnel
- [ ] Les commandes `/help`, `/status`, `/cost` fonctionnent
- [ ] Vous avez observe la difference entre prompts simples et avec thinking
- [ ] Vous avez change de modele avec `/model`
- [ ] Vous avez teste le mode fast avec `/fast`

---

## Bonus

Si vous avez termine en avance :

1. **Testez le mode headless** :
   ```bash
   claude -p "Combien de fichiers dans le repertoire courant ?" --output-format text
   ```

2. **Testez le piping** :
   ```bash
   echo "Explique ce que fait cette commande : ls -la" | claude -p "Reponds en francais"
   ```

3. **Explorez `/compact`** : lancez une conversation longue puis utilisez `/compact` pour compresser le contexte.
