import Foundation

public struct PriceBand: Codable, Equatable, Sendable {
    public let averagePricePerSquareMeter: Decimal
    public let acceptableDeviationPercent: Double

    public init(averagePricePerSquareMeter: Decimal, acceptableDeviationPercent: Double) {
        self.averagePricePerSquareMeter = averagePricePerSquareMeter
        self.acceptableDeviationPercent = acceptableDeviationPercent
    }

    public func contains(pricePerSquareMeter: Decimal?) -> Bool {
        guard let pricePerSquareMeter else { return false }
        guard acceptableDeviationPercent >= 0 else { return false }
        let deviation = acceptableDeviationPercent / 100
        let lowerBound = averagePricePerSquareMeter * Decimal(1 - deviation)
        let upperBound = averagePricePerSquareMeter * Decimal(1 + deviation)
        return pricePerSquareMeter >= lowerBound && pricePerSquareMeter <= upperBound
    }
}

public struct LocationFilter: Codable, Equatable, Sendable {
    public enum Radius: Codable, Equatable, Sendable {
        case citywide
        case district(String)
        case custom(center: Coordinate, kilometers: Double)
    }

    public let city: String
    public let radius: Radius

    public init(city: String, radius: Radius = .citywide) {
        self.city = city
        self.radius = radius
    }
}

public struct SearchPreferences: Codable, Equatable, Sendable {
    public var enabledSources: Set<ListingSource>
    public var propertyTypes: Set<PropertyType>
    public var layouts: Set<Layout>
    public var locationFilters: [LocationFilter]
    public var minimumAreaM2: Double?
    public var maximumPriceCZK: Decimal?
    public var priceBand: PriceBand?
    public var updatedAt: Date

    public init(
        enabledSources: Set<ListingSource> = Set(ListingSource.allCases),
        propertyTypes: Set<PropertyType> = Set(PropertyType.allCases),
        layouts: Set<Layout> = [],
        locationFilters: [LocationFilter] = [],
        minimumAreaM2: Double? = nil,
        maximumPriceCZK: Decimal? = nil,
        priceBand: PriceBand? = nil,
        updatedAt: Date = .now
    ) {
        self.enabledSources = enabledSources
        self.propertyTypes = propertyTypes
        self.layouts = layouts
        self.locationFilters = locationFilters
        self.minimumAreaM2 = minimumAreaM2
        self.maximumPriceCZK = maximumPriceCZK
        self.priceBand = priceBand
        self.updatedAt = updatedAt
    }
}
