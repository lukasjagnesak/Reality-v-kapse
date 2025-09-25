# Reality v Kapse Prototype Workspace

Tento repozitář obsahuje první krok směrem k aplikaci **Reality v Kapse**. V rámci tohoto kroku vznikl základní Swift Package `RealityCore`, který definuje doménové modely a logiku pro vyhodnocování realitních inzerátů podle uživatelských preferencí.

## Struktura

- `Package.swift` – konfigurace Swift balíčku.
- `Sources/RealityCore` – doménové modely (inzeráty, lokace, preference) a logika (matcher, služby, in-memory repozitáře).
- `Tests/RealityCoreTests` – XCTest s unit testy pokrývajícími PriceBand, matcher i eligibility službu.
- `docs/` – původní produktová specifikace.

## Jak spustit testy

```bash
swift test
```

## Další kroky

- Přidat síťovou vrstvu pro komunikaci s backendem a scraperským API.
- Připravit SwiftUI aplikaci, která využije `RealityCore` pro řízení stavu a vyhodnocování inzerátů.
- Navázat na produktovou specifikaci rozpracováním UI flow a datové integrace.
