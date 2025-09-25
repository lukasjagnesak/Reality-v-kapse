import XCTest
@testable import RealityCore

final class ListingEligibilityServiceTests: XCTestCase {
    func testInjectsAveragePriceWhenMissingPriceBand() async throws {
        let listing = PropertyListing(
            source: .sreality,
            externalID: "321",
            title: "Rodinný dům",
            summary: "Rekonstrukce",
            propertyType: .house,
            layout: .fourPlusOne,
            priceCZK: 8_000_000,
            areaM2: 200,
            location: Location(city: "Brno", district: "Židenice"),
            media: [],
            contact: ContactInfo(),
            externalURL: URL(string: "https://sreality.cz/inzerat/321")!,
            publishedAt: Date()
        )

        let preferencesRepository = InMemoryPreferencesRepository()
        let statisticsRepository = StaticStatisticsRepository(priceMap: ["brno::židenice": 40_000])
        let service = ListingEligibilityService(
            preferencesRepository: preferencesRepository,
            statisticsRepository: statisticsRepository
        )

        let result = try await service.evaluate(listing: listing)

        XCTAssertTrue(result.matchesPreferences)
    }

    func testRespectsStoredPriceBand() async throws {
        var preferences = SearchPreferences()
        preferences.priceBand = PriceBand(averagePricePerSquareMeter: 20_000, acceptableDeviationPercent: 5)
        let preferencesRepository = InMemoryPreferencesRepository()
        try await preferencesRepository.save(preferences: preferences)

        let statisticsRepository = StaticStatisticsRepository(priceMap: [:])
        let service = ListingEligibilityService(
            preferencesRepository: preferencesRepository,
            statisticsRepository: statisticsRepository
        )

        let listing = PropertyListing(
            source: .sreality,
            externalID: "999",
            title: "Chata",
            summary: "Chata na Vysočině",
            propertyType: .house,
            layout: .other,
            priceCZK: 5_000_000,
            areaM2: 50,
            location: Location(city: "Jihlava", district: "Jihlava"),
            media: [],
            contact: ContactInfo(),
            externalURL: URL(string: "https://sreality.cz/inzerat/999")!,
            publishedAt: Date()
        )

        let result = try await service.evaluate(listing: listing)

        XCTAssertFalse(result.matchesPreferences)
        XCTAssertTrue(result.reasons.contains(where: { $0.contains("outside allowed band") }))
    }
}
