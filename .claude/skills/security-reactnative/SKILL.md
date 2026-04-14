---
name: security-reactnative
description: Security - React Native 0.85+ Best Practices. Use when reviewing security, implementing auth, or hardening code.
---

# Security - React Native 0.85+ Best Practices

Ce skill fournit les bonnes pratiques de sécurité pour React Native 0.85+ avec la New Architecture.

## Principes clés

- **Sécurité native** : Keychain (iOS) / Keystore (Android) pour les secrets sensibles (pas AsyncStorage)
- **HTTPS uniquement** : ATS (iOS) et Network Security Config (Android) strictes
- **JSI synchrone** : validation côté natif des appels TurboModules
- **Expo SecureStore** : abstraction sécurisée cross-platform pour les tokens

## Spécificités React Native 0.85+

- **TurboModules sécurisés** : validation des inputs côté natif avant traitement JSI
- **Bridge legacy supprimé** : pas de risques de sérialisation JSON vulnérable
- **Fabric** : rendu natif isolé du thread JS (limite les injections UI)
- **Hermes obligatoire** : bytecode natif (protection contre le reverse engineering du bundle JS)

## Anti-patterns critiques

- ❌ Stocker des tokens dans AsyncStorage (plaintext)
- ❌ HTTP non sécurisé en production
- ❌ Code PIN/biométrie sans SecureStore
- ❌ Deep links non validés (injection de navigation)
- ❌ WebView sans validation de l'origine

**Sources :** [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/), [RN Security Best Practices](https://reactnative.dev/docs/security)
