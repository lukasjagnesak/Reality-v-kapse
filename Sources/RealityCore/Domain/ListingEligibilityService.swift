import Foundation

public struct ListingEligibilityService: Sendable {
    private let matcher: ListingMatcher
    private let preferencesRepository: PreferencesRepository
    private let statisticsRepository: StatisticsRepository

    public init(
        matcher: ListingMatcher = ListingMatcher(),
        preferencesRepository: PreferencesRepository,
        statisticsRepository: StatisticsRepository
    ) {
        self.matcher = matcher
        self.preferencesRepository = preferencesRepository
        self.statisticsRepository = statisticsRepository
    }

    public func evaluate(listing: PropertyListing) async throws -> ListingMatchResult {
        var preferences = try await preferencesRepository.loadPreferences()

        if preferences.priceBand == nil {
            if let average = try await statisticsRepository.averagePricePerSquareMeter(for: listing.location) {
                preferences.priceBand = PriceBand(averagePricePerSquareMeter: average, acceptableDeviationPercent: 10)
            }
        }

        return matcher.evaluate(listing: listing, preferences: preferences)
    }
}
