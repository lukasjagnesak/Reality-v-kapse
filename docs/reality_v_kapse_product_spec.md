# Reality v Kapse — Produktová a technická specifikace

## 1. Vize a cíle
Reality v Kapse je nativní iOS aplikace pro iPhone a iPad, která pomáhá investorům a lidem hledajícím bydlení sledovat nové inzeráty na nemovitosti z hlavních českých serverů (Sreality.cz, Annonce.cz, Bezrealitky.cz). Cílem aplikace je poskytovat personalizované upozornění na příležitosti, které odpovídají stanoveným kritériím a jsou cenově atraktivní vzhledem k průměrné ceně v dané lokalitě.

## 2. Personas a use-cases
- **Investiční lovec** – sleduje byty ve více lokalitách, zajímají ho investiční příležitosti pod tržní cenou. Chce rychlé push notifikace a přehledné porovnání.
- **Rodina hledající bydlení** – zaměřuje se na konkrétní dispozici v přesně vymezené čtvrti, sleduje cenu, dispozici a vybavení. Potřebuje snadné filtrování a mapové zobrazení.
- **Realitní makléř** – sleduje konkurenci v dané lokalitě a chce mít přehled o nových inzerátech i cenotvorbě.

## 3. Základní funkcionality
1. **Správa sledovaných serverů** – přepínače pro aktivaci/deaktivaci každého zdroje (Sreality, Annonce, Bezrealitky).
2. **Pokročilé filtrování** – typ nemovitosti (byt/dům), dispozice (1+kk až 6+1, případně mezonet), plocha, cena, lokalita (kraje, města, definované okruhy na mapě) a další parametry.
3. **Chytré notifikace** – push notifikace při nalezení inzerátu splňujícího kritéria a cenovou podmínku (podle procentuální odchylky od průměrné ceny).
4. **Karty nemovitostí** – detailní karta s náhledovou fotkou, názvem, popisem, dispozicí, plochou, cenou, cenou za m², lokalitou, mapou a kontaktem na prodávajícího.
5. **Statistiky lokality** – průměrná cena za m² podle historických dat, graf vývoje cen, odchylka konkrétní nemovitosti.
6. **Uložení do oblíbených** – možnost uložit inzerát pro pozdější prohlížení, sdílení odkazu.
7. **Offline režim** – kešování stažených dat pro rychlé načítání a možnost prohlížení i bez internetu.
8. **Integrace map** – zobrazení polohy přes MapKit, možnost otevření trasy v Apple Maps.

## 4. Designové principy
- **Inspirace Investown** – čisté bílé pozadí, akcentní barva (např. zelená #0DCE8A), velká typografie, karty s jemným stínem a rounded rohy (12 pt), ikonografie SF Symbols.
- **Responsivita** – adaptivní layout pro iPhone (stacked cards) a iPad (split view, vícesloupcové zobrazení, side bar navigace).
- **Tmavý režim** – respektování systémového nastavení s alternativní barevnou paletou.
- **Plynulé animace** – přechody mezi obrazovkami, skeleton loading, implicitní SwiftUI animace.

## 5. Architektura
- **Klient**: SwiftUI + Combine, architektura MVVM s koordinátory pro navigaci.
- **Sdílené jádro**: modul `RealityCore` implementovaný jako Swift Package, obsahuje datové modely, analytické výpočty a logiku agregace.
- **Síťová vrstva**: modul `RealityNetworking` s protokoly pro jednotlivé zdroje a injekcí `URLSession` klienta. Obohacená o vyrovnávací paměť (Cache) pomocí `URLCache`/Core Data.
- **Datové úložiště**: Core Data (SQLite) pro ukládání inzerátů, uživatelských preferencí a statistik; možnost přechodu na CloudKit pro synchronizaci mezi zařízeními.
- **Background processing**: využití `BGTaskScheduler` pro periodické stahování dat a aktualizaci statistik mimo aktivní používání aplikace.

### Architektonické vrstvy
1. **Presentation Layer** – SwiftUI view hierarchy (HomeView, SearchFiltersView, PropertyDetailView, FavoritesView, SettingsView).
2. **Domain Layer** – ViewModely (ObservableObject) pro jednotlivé obrazovky, koordinátory pro navigaci, logika filtrace, výpočtu cen.
3. **Data Layer** – Repository pattern pro přístup k datům (PropertyRepository, StatsRepository, PreferencesRepository). Data source adaptory pro REST scrapers/feeds a Core Data persistence.
4. **Infrastructure** – moduly pro scraping (server-side), API komunikaci, notifikace.

## 6. Datový pipeline
1. **Backend/worker** (doporučeno hostovat odděleně): Node.js nebo Python služba, která pomocí headless prohlížeče (Playwright) nebo oficiálních API stahuje inzeráty z jednotlivých serverů.
2. **Normalizace dat** – transformace do interního formátu (PropertyListing) se sjednocenými poli.
3. **Výpočet statistik** – průměrná cena za m² podle lokality, trend, medián.
4. **Push do Firestore/REST API** – backend vystaví GraphQL/REST endpoint pro aplikaci.
5. **Aplikace klient** – periodicky synchronizuje data, ukládá do Core Data a vyhodnocuje pravidla upozornění.

## 7. Datové modely
```swift
struct PropertyListing: Identifiable, Codable {
    let id: UUID
    let source: ListingSource
    let title: String
    let description: String
    let propertyType: PropertyType
    let layout: Layout
    let priceCZK: Decimal
    let areaM2: Double
    let pricePerSquareMeter: Decimal
    let location: Location
    let media: [PropertyMedia]
    let contact: ContactInfo
    let externalURL: URL
    let publishedAt: Date
}

struct Location: Codable {
    let city: String
    let district: String
    let coordinates: Coordinate
}

struct SearchPreference: Codable {
    var enabledSources: Set<ListingSource>
    var propertyTypes: Set<PropertyType>
    var layouts: Set<Layout>
    var locations: [LocationFilter]
    var maxPriceDeviationPercent: Double
    var minAreaM2: Double?
    var maxPriceCZK: Decimal?
}
```

## 8. UX flow (hlavní obrazovky)
1. **Onboarding** – krátký onboarding s ilustracemi Investown-style, vysvětlení přínosů, povolení notifikací.
2. **Dashboard** – dlaždice s počtem nových inzerátů, graf průměrné ceny za m², rychlé filtry (typ nemovitosti, lokalita), seznam nejnovějších nalezených příležitostí.
3. **Detail nemovitosti** – fullscreen karta s horizontálním carouselem fotek, základní informace, graf ceny vs. průměr, tlačítko „Kontaktovat“ a „Otevřít inzerát“.
4. **Mapové zobrazení** – clusterované anotace, heatmapa průměrných cen.
5. **Filtry** – modulární filtry v bottom sheetu s potvrzením.
6. **Nastavení** – správa serverů, preference notifikací, synchronizace iCloud, export dat.

## 9. Push notifikace a upozornění
- Využití Apple Push Notification service (APNs) s vlastním backendem.
- Každá notifikace obsahuje název, cenu, lokalitu a CTA.
- V aplikaci se vytváří `NotificationCenter` feed s možností označit jako přečtené.

## 10. Bezpečnost a ochrana soukromí
- Ukládání pouze nezbytných osobních dat (email/telefon). Citlivá data v Keychainu.
- GDPR compliance: možnost smazat účet a veškerá data.
- Šifrovaná komunikace (HTTPS), cert pinning pro API.

## 11. Roadmap (MVP -> rozšíření)
1. **MVP (8 týdnů)**
   - Základní SwiftUI aplikace s přehledem inzerátů a filtrováním.
   - Server-side scraper pro Sreality.cz (cron job každých 15 min).
   - Výpočet průměrné ceny za m² a notifikace při podkročení o X %.
2. **Verze 1.1**
   - Přidání Annonce.cz a Bezrealitky.cz, lepší normalizace dat.
   - Mapové zobrazení, oblíbené, sdílení.
3. **Verze 1.2**
   - Pokročilé statistiky, historie cen, grafy.
   - Integrace s Apple Watch (komplikace, notifikace).
4. **Verze 2.0**
   - Machine learning model pro predikci spravedlivé ceny.
   - Integrace s bankami pro kalkulaci hypotéky.

## 12. Technologický stack
- **iOS/iPadOS**: Swift 5.9+, SwiftUI, Combine, MapKit, Core Data, BGTaskScheduler.
- **Backend**: Node.js + TypeScript nebo Python + FastAPI, databáze PostgreSQL + TimescaleDB pro časové řady.
- **Monitoring**: Firebase Crashlytics, Firebase Analytics, Sentry.
- **CI/CD**: GitHub Actions s automatickým buildem, testy a nasazením na TestFlight.

## 13. Testování
- Jednotkové testy ViewModelů (XCTest), snapshot testy UI.
- Automatizované UI testy (XCUITest) pro kritické flow.
- Kontraktní testy API proti mock serveru.

## 14. Monetizace a růst
- Freemium model: základní funkce zdarma, prémiové (více sledovaných lokací, pokročilé statistiky) přes předplatné.
- Referral program: bonus za pozvání dalších uživatelů.

## 15. Další kroky
1. Validace designu s UX/UI designerem a vytvoření Figma prototypu.
2. Založení backendového repozitáře a implementace scraperu pro Sreality.cz.
3. Implementace MVP v SwiftUI podle navržené architektury.
4. Uzavřená beta přes TestFlight pro sběr zpětné vazby.

