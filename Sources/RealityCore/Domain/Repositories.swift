import Foundation

public protocol PropertyRepository: Sendable {
    func fetchLatestListings(limit: Int) async throws -> [PropertyListing]
    func save(listings: [PropertyListing]) async throws
    func listing(withID id: UUID) async throws -> PropertyListing?
}

public protocol PreferencesRepository: Sendable {
    func loadPreferences() async throws -> SearchPreferences
    func save(preferences: SearchPreferences) async throws
}

public protocol StatisticsRepository: Sendable {
    func averagePricePerSquareMeter(for location: Location) async throws -> Decimal?
}

public struct InMemoryPropertyRepository: PropertyRepository {
    private actor Storage {
        var listings: [UUID: PropertyListing] = [:]

        func latest(limit: Int) -> [PropertyListing] {
            Array(listings.values.sorted(by: { $0.publishedAt > $1.publishedAt }).prefix(limit))
        }

        func merge(_ items: [PropertyListing]) {
            for item in items {
                listings[item.id] = item
            }
        }

        func listing(withID id: UUID) -> PropertyListing? {
            listings[id]
        }
    }

    private let storage = Storage()

    public init() {}

    public func fetchLatestListings(limit: Int) async throws -> [PropertyListing] {
        await storage.latest(limit: limit)
    }

    public func save(listings: [PropertyListing]) async throws {
        await storage.merge(listings)
    }

    public func listing(withID id: UUID) async throws -> PropertyListing? {
        await storage.listing(withID: id)
    }
}

public struct InMemoryPreferencesRepository: PreferencesRepository {
    private actor Storage {
        var preferences = SearchPreferences()

        func load() -> SearchPreferences { preferences }
        func save(preferences: SearchPreferences) { self.preferences = preferences }
    }

    private let storage = Storage()

    public init() {}

    public func loadPreferences() async throws -> SearchPreferences {
        await storage.load()
    }

    public func save(preferences: SearchPreferences) async throws {
        await storage.save(preferences: preferences)
    }
}

public struct StaticStatisticsRepository: StatisticsRepository {
    private let priceMap: [String: Decimal]

    public init(priceMap: [String: Decimal]) {
        self.priceMap = priceMap
    }

    public func averagePricePerSquareMeter(for location: Location) async throws -> Decimal? {
        priceMap[locationKey(for: location)]
    }

    private func locationKey(for location: Location) -> String {
        "\(location.city.lowercased())::\(location.district.lowercased())"
    }
}
