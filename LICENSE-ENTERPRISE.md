# Licence Commerciale Claude Craft Enterprise — DRAFT

> **⚠️ STATUT : DRAFT — REVUE OBLIGATOIRE PAR AVOCAT IP AVANT PUBLICATION**
>
> Ce document est un modèle de travail fourni pour consultation interne et juridique. Il ne constitue pas un contrat exécutoire tant qu'il n'a pas été validé par un avocat spécialisé en propriété intellectuelle et signé par les deux parties.
>
> **Dernière mise à jour :** 15 avril 2026  
> **Version :** 1.0.0-draft

---

## 1. Définitions

- **"Licencié"** : L'organisation (entreprise, association, administration) souscrivant à une licence Claude Craft Enterprise.
- **"Concédant"** : The Bearded Bear SAS, société par actions simplifiée au capital de [MONTANT] euros, immatriculée au RCS de [VILLE] sous le numéro [NUMÉRO SIRET], dont le siège social est situé [ADRESSE].
- **"Logiciel Enterprise"** : Les modules propriétaires distribués sous la marque `claude-craft-enterprise`, incluant (de manière non exhaustive) : SSO SAML/OIDC, audit log immuable, multi-tenant dashboard, priority support, analytics avancées.
- **"Logiciel Core"** : Le framework `claude-craft` distribué sous licence MIT et disponible publiquement sur https://github.com/TheBeardedBearSAS/claude-craft.
- **"Seats"** : Nombre de développeurs, devops ou utilisateurs finaux autorisés à utiliser le Logiciel Enterprise simultanément.
- **"Clé de Licence"** : Jeton numérique signé cryptographiquement permettant l'activation du Logiciel Enterprise.

## 2. Objet de la Licence

Sous réserve du paiement intégral des frais applicables et du respect des termes du présent Accord, le Concédant accorde au Licencié une licence **non exclusive, non transférable, mondiale et limitée dans le temps** pour :

1. Utiliser le Logiciel Enterprise au sein de l'organisation du Licencié, dans la limite du nombre de Seats souscrit.
2. Modifier le Logiciel Enterprise uniquement pour les besoins internes du Licencié (personnalisation, intégration).
3. Déployer le Logiciel Enterprise dans des environnements de production, staging, développement ou test du Licencié.
4. Recevoir les mises à jour, correctifs de sécurité et nouvelles fonctionnalités du Logiciel Enterprise pendant la durée de validité de la licence.

## 3. Restrictions

Le Licencié s'engage à **ne pas** :

1. **Redistribuer** le Logiciel Enterprise, sous forme de code source ou de binaires, à des tiers hors de son organisation.
2. **Revendre, sous-licencier ou louer** la licence ou le Logiciel Enterprise à des tiers.
3. **Reverse-engineer, décompiler ou désassembler** le Logiciel Enterprise, sauf dans la stricte mesure autorisée par la loi applicable (ex. : interopérabilité selon Directive UE 2009/24/CE).
4. **Retirer ou modifier** les mentions de copyright, marques déposées ou avis de propriété intellectuelle.
5. **Partager la Clé de Licence** avec des tiers non autorisés. Toute utilisation frauduleuse entraîne la révocation immédiate de la licence sans remboursement.
6. **Utiliser le Logiciel Enterprise au-delà du nombre de Seats souscrit**. Le Concédant se réserve le droit d'auditer l'utilisation (voir §8).

## 4. Modèle de Tarification par Seats

| Tier | Seats Inclus | Prix Annuel | Support | SLA |
|------|--------------|-------------|---------|-----|
| **Starter** | 1-10 | €5 000 / an | Email | 24h business (voir SLA-TEMPLATE.md) |
| **Pro** | 11-50 | €12 000 / an | Email + Slack Connect | 4h business |
| **Enterprise** | 51+ (tarif dégressif) | Sur devis (min. €25 000 / an) | Dedicated channel + QBR | 1h critical 24/7 |

**Seats additionnels :** Pour dépasser le forfait, facturation au prorata (€500/seat/an pour Starter/Pro, négociable pour Enterprise).

**Renouvellement :** La licence est valable 12 mois à compter de la date d'activation. Le renouvellement est automatique sauf annulation 30 jours avant l'échéance.

## 5. Support et SLA

Le Concédant fournit un support technique et un SLA (Service Level Agreement) selon le Tier souscrit, comme défini dans `docs/dual-license/SLA-TEMPLATE.md`. Les engagements incluent :

- Temps de réponse aux incidents (SEV-1 à SEV-4)
- Garantie de disponibilité pour les services cloud (si applicables)
- Crédits de service en cas de non-respect des engagements

Le support couvre uniquement les versions du Logiciel Enterprise supportées (< 6 mois d'ancienneté). Les versions obsolètes ne bénéficient d'aucun support.

## 6. Durée et Résiliation

### 6.1 Durée Initiale

La licence entre en vigueur à la date d'activation de la Clé de Licence et expire 12 mois après, sauf renouvellement.

### 6.2 Renouvellement Automatique

La licence est renouvelée automatiquement pour une période de 12 mois aux conditions tarifaires en vigueur à la date de renouvellement, sauf annulation écrite par le Licencié **30 jours calendaires avant l'échéance**.

### 6.3 Résiliation pour Manquement

Le Concédant peut résilier immédiatement la licence en cas de :

- Non-paiement des frais dans les 30 jours suivant la date de facturation
- Violation des restrictions (§3)
- Utilisation frauduleuse de la Clé de Licence
- Refus de coopérer lors d'un audit de conformité (§8)

### 6.4 Effets de la Résiliation

À la résiliation ou l'expiration de la licence :

1. Le Licencié doit **cesser immédiatement** toute utilisation du Logiciel Enterprise.
2. Le Licencié peut continuer à utiliser le Logiciel Core sous licence MIT sans limitation.
3. Les frais payés ne sont **pas remboursables**, sauf obligation légale.
4. Les données du Licencié (audit logs, configurations) seront conservées 90 jours puis supprimées définitivement, sauf demande d'export du Licencié dans les 30 jours.

## 7. Propriété Intellectuelle

### 7.1 Droits du Concédant

Le Concédant conserve tous les droits de propriété intellectuelle sur le Logiciel Enterprise, incluant les droits d'auteur, brevets, marques, secrets commerciaux et savoir-faire. La présente licence n'est **pas une cession de droits** mais un simple droit d'usage.

### 7.2 Modifications du Licencié

Les modifications apportées par le Licencié au Logiciel Enterprise pour ses besoins internes restent la propriété du Licencié. Toutefois, le Licencié accorde au Concédant une licence perpétuelle, mondiale, gratuite et non exclusive pour intégrer ces modifications dans les futures versions du Logiciel Enterprise (opt-in uniquement, accord écrit préalable du Licencié).

### 7.3 Marque Déposée

Le nom "Claude Craft" et le logo associé sont des marques déposées ou en cours de dépôt du Concédant. Le Licencié ne peut utiliser ces marques qu'aux fins d'identifier le logiciel utilisé en interne. Toute communication publique (blog, case study, logo sur site web) nécessite l'accord écrit préalable du Concédant.

## 8. Audit de Conformité

Le Concédant se réserve le droit de réaliser un **audit annuel** de l'utilisation du Logiciel Enterprise pour vérifier la conformité au nombre de Seats souscrit. Modalités :

- Préavis de **30 jours calendaires** avant l'audit
- Audit réalisé par le Concédant ou un tiers mandaté (sous NDA)
- Accès aux logs d'utilisation, listes d'utilisateurs actifs, déploiements
- Coûts de l'audit à la charge du Concédant, sauf découverte de dépassement > 10% des Seats → frais à la charge du Licencié + régularisation

En cas de découverte de dépassement, le Licencié doit régulariser dans les **15 jours** en souscrivant aux Seats supplémentaires nécessaires avec effet rétroactif sur 12 mois.

## 9. Garantie Limitée et Responsabilité

### 9.1 Garantie Limitée

Le Logiciel Enterprise est fourni avec une **garantie limitée** définie dans le Master Services Agreement (MSA) signé séparément. En l'absence de MSA, le logiciel est fourni **"tel quel"** ("AS IS"), sans aucune garantie expresse ou implicite, notamment de qualité marchande, d'adéquation à un usage particulier ou d'absence de contrefaçon.

### 9.2 Limitation de Responsabilité

Dans toute la mesure permise par la loi applicable :

1. La responsabilité totale du Concédant au titre du présent Accord est **plafonnée au montant total des frais payés par le Licencié au cours des 12 mois précédant la réclamation**.
2. Le Concédant ne pourra être tenu responsable des **dommages indirects, accessoires, spéciaux, consécutifs ou punitifs**, incluant (de manière non exhaustive) : perte de profits, perte de données, interruption d'activité, perte de clientèle.
3. Cette limitation s'applique même si le Concédant a été informé de la possibilité de tels dommages.

### 9.3 Exclusions

La limitation de responsabilité ne s'applique pas aux dommages résultant de :

- Faute intentionnelle ou négligence grave du Concédant
- Violation des droits de propriété intellectuelle de tiers (sous réserve de l'indemnisation §10)
- Décès ou blessure corporelle causés par le Concédant

## 10. Indemnisation (Tier Enterprise uniquement)

Pour les clients **Enterprise** uniquement, le Concédant s'engage à défendre et indemniser le Licencié contre toute réclamation de tiers alléguant que le Logiciel Enterprise viole un droit de propriété intellectuelle (brevet, droit d'auteur, marque), sous réserve que :

1. Le Licencié notifie le Concédant par écrit dans les **10 jours** suivant la connaissance de la réclamation.
2. Le Licencié laisse au Concédant le contrôle exclusif de la défense et des négociations.
3. Le Licencié coopère raisonnablement avec le Concédant.

**Recours du Concédant :** En cas de réclamation fondée, le Concédant pourra, à son choix :

- Obtenir le droit pour le Licencié de continuer à utiliser le logiciel
- Modifier le logiciel pour le rendre non-contrefaisant
- Remplacer le logiciel par une alternative équivalente
- Résilier la licence et rembourser au prorata les frais payés pour la période non utilisée

**Exclusions :** Cette indemnisation ne couvre pas les réclamations résultant de :

- Modifications du logiciel par le Licencié
- Utilisation combinée avec des logiciels tiers non approuvés par le Concédant
- Utilisation en violation des termes de la licence

## 11. Conformité RGPD et Données Personnelles

Le Concédant traite les données personnelles du Licencié conformément au RGPD (Règlement UE 2016/679). Les données collectées incluent :

- Informations de compte (nom organisation, email admin, adresse)
- Logs d'utilisation du Logiciel Enterprise (commandes exécutées, horodatages, users actifs)
- Audit logs générés par le Licencié (stockés dans l'infrastructure du Licencié, le Concédant n'y accède que lors d'audits de conformité)

Le Licencié conserve le contrôle de ses audit logs et peut les exporter ou les supprimer à tout moment via l'interface du Logiciel Enterprise.

Voir `PRIVACY.md` pour la politique de confidentialité complète.

## 12. Export Control et Sanctions

Le Licencié certifie qu'il n'est pas situé dans un pays soumis à un embargo de l'Union Européenne ou des États-Unis, ni inscrit sur une liste de parties interdites. Le Licencié s'engage à respecter toutes les lois applicables en matière de contrôle des exportations.

## 13. Loi Applicable et Juridiction

### 13.1 Loi Applicable

Le présent Accord est régi par le **droit français**, à l'exclusion des règles de conflit de lois et de la Convention de Vienne sur les contrats de vente internationale de marchandises.

### 13.2 Juridiction Compétente

Tout litige relatif au présent Accord relève de la compétence **exclusive des tribunaux de Paris, France**, même en cas de pluralité de défendeurs ou d'appel en garantie.

### 13.3 Médiation Préalable

Avant toute saisine judiciaire, les parties s'engagent à tenter une **médiation** d'une durée maximale de 30 jours. Frais de médiation partagés équitablement.

## 14. Dispositions Générales

### 14.1 Intégralité de l'Accord

Le présent Accord, conjointement avec le SLA-TEMPLATE.md et le MSA (si signé), constitue l'intégralité de l'accord entre les parties et remplace toute communication ou accord antérieur, écrit ou oral.

### 14.2 Modification

Toute modification du présent Accord doit être établie par écrit et signée par les deux parties. Le Concédant se réserve le droit de modifier les tarifs et conditions au renouvellement, avec préavis de **60 jours**.

### 14.3 Divisibilité

Si une clause du présent Accord est jugée invalide ou inapplicable par un tribunal compétent, les autres clauses resteront en vigueur.

### 14.4 Renonciation

Le fait pour une partie de ne pas exercer un droit au titre du présent Accord ne constitue pas une renonciation à ce droit.

### 14.5 Cession

Le Licencié ne peut céder le présent Accord sans l'accord écrit préalable du Concédant. Le Concédant peut céder l'Accord en cas de fusion, acquisition ou vente du fonds de commerce, avec préavis de **30 jours** au Licencié.

## 15. Contact

Pour toute question relative à la présente licence :

- **Ventes et renouvellements :** sales@thebeardedcto.com
- **Support technique :** support@thebeardedcto.com (clients actifs uniquement)
- **Juridique et conformité :** legal@thebeardedcto.com

---

**⚠️ RAPPEL : DRAFT NON EXÉCUTOIRE**

Ce document ne confère aucun droit tant qu'il n'a pas été validé par un avocat spécialisé en propriété intellectuelle et signé par les deux parties dans un contrat définitif.

**Version :** 1.0.0-draft  
**Date :** 15 avril 2026  
**Auteur :** The Bearded Bear SAS
