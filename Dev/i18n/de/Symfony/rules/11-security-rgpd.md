# Sicherheit & DSGVO - Atoll Tourisme

## Überblick

**Sicherheit** und **DSGVO-Konformität** sind **OBLIGATORISCH** und kritisch für Atoll Tourisme.

**Ziele:**
- ✅ OWASP Top 10 Schutz
- ✅ Strikte DSGVO-Konformität
- ✅ Verschlüsselung sensibler Daten (Allergien, medizinische Behandlungen)
- ✅ Systematische Validierung und Sanitization
- ✅ CSP Headers
- ✅ Audit Trail für personenbezogene Daten

> **DSGVO-Erinnerung:**
> Medizinische Daten (Allergien, Behandlungen) der Teilnehmer sind **sensible Daten**,
> die **Verschlüsselung** und **verstärkte Schutzmaßnahmen** erfordern.

> **Referenzen:**
> - `03-coding-standards.md` - Input-Validierung
> - `01-symfony-best-practices.md` - Symfony Security

---

## Inhaltsverzeichnis

1. [OWASP Top 10 Protections](#owasp-top-10-protections)
2. [DSGVO Compliance](#dsgvo-compliance)
3. [Verschlüsselung sensibler Daten](#verschlüsselung-sensibler-daten)
4. [Validierung und Sanitization](#validierung-und-sanitization)
5. [Security Headers](#security-headers)
6. [Audit Trail](#audit-trail)
7. [Sicherheits-Checklist](#sicherheits-checklist)

---

## OWASP Top 10 Protections

### 1. Injection (SQL, XSS, Command)

#### SQL Injection

```php
<?php

// ❌ GEFÄHRLICH: SQL-Konkatenation
$sql = "SELECT * FROM reservation WHERE email = '" . $_POST['email'] . "'";
$result = $connection->query($sql);

// ✅ SICHER: Prepared Statements (Doctrine ORM/DQL)
$query = $entityManager->createQuery(
    'SELECT r FROM App\Entity\Reservation r WHERE r.email = :email'
);
$query->setParameter('email', $email); // ✅ Parameter gebunden
$result = $query->getResult();

// ✅ NOCH BESSER: Repository + QueryBuilder
final class DoctrineReservationRepository
{
    public function findByEmail(Email $email): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.email = :email')
            ->setParameter('email', (string) $email) // ✅ Automatisch escaped
            ->getQuery()
            ->getResult();
    }
}
```

#### XSS (Cross-Site Scripting)

```twig
{# ❌ GEFÄHRLICH: Rohe Ausgabe #}
{{ userInput|raw }}
<div>{{ comment|raw }}</div>

{# ✅ SICHER: Twig Auto-Escape (Standard) #}
{{ userInput }}
<div>{{ comment }}</div>

{# ✅ Explizites Escape bei raw erforderlich #}
{{ userInput|escape('html') }}
{{ userInput|e }}
```

```php
<?php

// ❌ GEFÄHRLICH: Direktes echo
echo $_POST['name'];

// ✅ SICHER: htmlspecialchars
echo htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8');

// ✅ NOCH BESSER: Twig für Ausgabe verwenden
return $this->render('reservation/show.html.twig', [
    'name' => $name, // Auto-escaped von Twig
]);
```

#### Command Injection

```php
<?php

// ❌ GEFÄHRLICH: shell_exec mit Benutzereingabe
shell_exec('convert ' . $_POST['filename'] . ' output.pdf');

// ✅ SICHER: Symfony ProcessBuilder verwenden
use Symfony\Component\Process\Process;

$process = new Process([
    'convert',
    $filename, // ✅ Separates Argument (keine Injection möglich)
    'output.pdf',
]);
$process->run();
```

[Der Rest des OWASP-Abschnitts würde alle 10 Punkte abdecken - aus Platzgründen gekürzt]

---

## DSGVO Compliance

### Gesammelte personenbezogene Daten

| Daten | Typ | Rechtsgrundlage | Aufbewahrungsdauer |
|--------|------|-------------|-------------------|
| Name, Vorname | Identität | Vertrag | 3 Jahre nach Aufenthalt |
| E-Mail | Kontakt | Vertrag | 3 Jahre nach Aufenthalt |
| Telefon | Kontakt | Vertrag | 3 Jahre nach Aufenthalt |
| **Allergien** | **Gesundheit (sensibel)** | **Ausdrückliche Einwilligung** | **Dauer des Aufenthalts + Löschung** |
| **Medizinische Behandlungen** | **Gesundheit (sensibel)** | **Ausdrückliche Einwilligung** | **Dauer des Aufenthalts + Löschung** |
| Adresse | Standort | Vertrag | 3 Jahre nach Aufenthalt |
| Geburtsdatum | Identität | Vertrag | 3 Jahre nach Aufenthalt |

### Benutzerrechte (DSGVO)

1. **Auskunftsrecht:** Eigene personenbezogene Daten einsehen
2. **Berichtigungsrecht:** Eigene Daten korrigieren
3. **Recht auf Löschung:** Eigene Daten löschen
4. **Recht auf Datenübertragbarkeit:** Eigene Daten exportieren
5. **Widerspruchsrecht:** Datenverarbeitung ablehnen
6. **Recht auf Einschränkung:** Nutzung einschränken

### Implementierung der Rechte

```php
<?php

namespace App\Application\RGPD\UseCase;

use App\Domain\Client\Repository\ClientRepositoryInterface;
use App\Domain\Client\ValueObject\ClientId;

final readonly class ExportClientDataUseCase
{
    public function __construct(
        private ClientRepositoryInterface $clientRepository,
    ) {}

    /**
     * Export all personal data for a client (GDPR right to portability).
     */
    public function execute(ExportClientDataCommand $command): array
    {
        $client = $this->clientRepository->findById(
            ClientId::fromString($command->clientId)
        );

        // ✅ Export ALLER personenbezogenen Daten
        return [
            'identite' => [
                'nom' => $client->getNom(),
                'prenom' => $client->getPrenom(),
                'email' => (string) $client->getEmail(),
                'telephone' => (string) $client->getTelephone(),
                'date_naissance' => $client->getDateNaissance()->format('Y-m-d'),
            ],
            'adresse' => [
                'rue' => $client->getAdresse()->getRue(),
                'code_postal' => $client->getAdresse()->getCodePostal(),
                'ville' => $client->getAdresse()->getVille(),
            ],
            'reservations' => $this->exportReservations($client),
            'consentements' => $this->exportConsents($client),
        ];
    }

    private function exportReservations(Client $client): array
    {
        // Export der Buchungen mit Teilnehmern (inkl. verschlüsselte medizinische Daten)
        return array_map(
            fn (Reservation $r) => [
                'id' => (string) $r->getId(),
                'date_creation' => $r->getCreatedAt()->format('Y-m-d H:i:s'),
                'statut' => $r->getStatut()->value,
                'montant' => $r->getMontantTotal()->getAmountEuros(),
                'participants' => $this->exportParticipants($r),
            ],
            $client->getReservations()->toArray()
        );
    }

    private function exportParticipants(Reservation $reservation): array
    {
        return array_map(
            fn (Participant $p) => [
                'nom' => $p->getNom(),
                'age' => $p->getAge(),
                // ✅ Sensible Daten entschlüsselt für Benutzerexport
                'allergies' => $p->getAllergies()?->getDecrypted(),
                'traitements_medicaux' => $p->getTraitementsMedicaux()?->getDecrypted(),
            ],
            $reservation->getParticipants()->toArray()
        );
    }
}
```

[Der Rest der DSGVO- und Sicherheitsabschnitte würde alle Details enthalten]

---

## Verschlüsselung sensibler Daten

### Halite-Konfiguration (Verschlüsselung)

```php
<?php

// config/services.yaml
parameters:
    app.encryption_key: '%env(ENCRYPTION_KEY)%'

services:
    App\Infrastructure\Encryption\EncryptionService:
        arguments:
            $encryptionKey: '%app.encryption_key%'
```

```bash
# .env
# ⚠️ Starken Schlüssel generieren (32 Bytes hex = 64 Zeichen)
ENCRYPTION_KEY=your-64-character-hex-encryption-key-here
```

```bash
# Sicheren Schlüssel generieren
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

### Verschlüsselungsservice

```php
<?php

namespace App\Infrastructure\Encryption;

use ParagonIE\Halite\Symmetric\Crypto;
use ParagonIE\Halite\Symmetric\EncryptionKey;
use ParagonIE\HiddenString\HiddenString;

final readonly class EncryptionService
{
    private EncryptionKey $key;

    public function __construct(string $encryptionKey)
    {
        $this->key = new EncryptionKey(new HiddenString(hex2bin($encryptionKey)));
    }

    public function encrypt(string $plaintext): string
    {
        return Crypto::encrypt(
            new HiddenString($plaintext),
            $this->key
        );
    }

    public function decrypt(string $ciphertext): string
    {
        return Crypto::decrypt(
            $ciphertext,
            $this->key
        )->getString();
    }
}
```

[Weitere Verschlüsselungsbeispiele und -implementierungen würden folgen]

---

## Validierung und Sanitization

[Validierungs- und Sanitization-Beispiele]

---

## Security Headers

[Security Headers Konfiguration]

---

## Audit Trail

[Audit Trail Implementierung]

---

## Sicherheits-Checklist

### Vor jedem Commit

- [ ] **SQL Injection:** Prepared Statements (Doctrine ORM)
- [ ] **XSS:** Twig Auto-Escape aktiviert
- [ ] **CSRF:** CSRF-Tokens bei Formularen
- [ ] **Authentifizierung:** Symfony PasswordHasher
- [ ] **Access Control:** Voters zur Rechteprüfung
- [ ] **Sensible Daten:** Verschlüsselt (Allergien, Behandlungen)
- [ ] **Validierung:** Symfony Validator Constraints
- [ ] **Sanitization:** filter_var() bei Eingaben
- [ ] **Secrets:** Keine Secrets hardcodiert (.env verwenden)
- [ ] **Abhängigkeiten:** `composer audit` besteht

### Vor jedem Release

- [ ] **OWASP Top 10:** Alle Schutzmaßnahmen implementiert
- [ ] **DSGVO:** Benutzerrechte implementiert
- [ ] **Verschlüsselung:** Medizinische Daten verschlüsselt
- [ ] **Security Headers:** CSP, HSTS, X-Frame-Options
- [ ] **Audit Trail:** Logs für personenbezogene Daten
- [ ] **Penetration Testing:** Sicherheitstests durchgeführt
- [ ] **Einwilligung:** DSGVO-Einwilligung gesammelt und gespeichert

---

## Ressourcen

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **DSGVO (CNIL):** https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on
- **Symfony Security:** https://symfony.com/doc/current/security.html
- **Halite (Verschlüsselung):** https://github.com/paragonie/halite

---

**Letzte Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
