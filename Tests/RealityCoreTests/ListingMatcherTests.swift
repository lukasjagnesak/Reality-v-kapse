import XCTest
@testable import RealityCore

final class ListingMatcherTests: XCTestCase {
    private let baseListing: PropertyListing = {
        PropertyListing(
            source: .sreality,
            externalID: "123",
            title: "Světlý byt 2+kk",
            summary: "Novostavba v centru",
            propertyType: .apartment,
            layout: .twoPlusKitchenette,
            priceCZK: 5_000_000,
            areaM2: 60,
            location: Location(
                city: "Praha",
                district: "Praha 3",
                street: "Žižkov",
                coordinates: Coordinate(latitude: 50.086, longitude: 14.452)
            ),
            media: [
                PropertyMedia(kind: .photo, url: URL(string: "https://example.com/1.jpg")!)
            ],
            contact: ContactInfo(name: "Majitel", email: "owner@example.com", phone: "123456789"),
            externalURL: URL(string: "https://sreality.cz/inzerat/123")!,
            publishedAt: Date(timeIntervalSince1970: 1_700_000_000)
        )
    }()

    func testMatchesWhenAllCriteriaSatisfied() {
        let preferences = SearchPreferences(
            enabledSources: [.sreality],
            propertyTypes: [.apartment],
            layouts: [.twoPlusKitchenette],
            locationFilters: [LocationFilter(city: "Praha", radius: .district("Praha 3"))],
            minimumAreaM2: 50,
            maximumPriceCZK: 6_000_000,
            priceBand: PriceBand(averagePricePerSquareMeter: 90_000, acceptableDeviationPercent: 20)
        )

        let result = ListingMatcher().evaluate(listing: baseListing, preferences: preferences)

        XCTAssertTrue(result.matchesPreferences)
        XCTAssertTrue(result.reasons.isEmpty)
    }

    func testRejectsListingsOutsidePriceBand() {
        let preferences = SearchPreferences(
            enabledSources: [.sreality],
            propertyTypes: [.apartment],
            layouts: [.twoPlusKitchenette],
            locationFilters: [],
            minimumAreaM2: nil,
            maximumPriceCZK: nil,
            priceBand: PriceBand(averagePricePerSquareMeter: 50_000, acceptableDeviationPercent: 5)
        )

        let result = ListingMatcher().evaluate(listing: baseListing, preferences: preferences)

        XCTAssertFalse(result.matchesPreferences)
        XCTAssertEqual(result.reasons.count, 1)
        XCTAssertTrue(result.reasons.first?.contains("outside allowed band") ?? false)
    }

    func testRejectsWhenSourceDisabled() {
        let preferences = SearchPreferences(
            enabledSources: [.annonce],
            propertyTypes: [.apartment],
            layouts: [],
            locationFilters: [],
            minimumAreaM2: nil,
            maximumPriceCZK: nil,
            priceBand: nil
        )

        let result = ListingMatcher().evaluate(listing: baseListing, preferences: preferences)

        XCTAssertFalse(result.matchesPreferences)
        XCTAssertTrue(result.reasons.contains(where: { $0.contains("disabled") }))
    }
}
