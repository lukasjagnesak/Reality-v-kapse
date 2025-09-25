import Foundation

public struct ListingMatchResult: Equatable, Sendable {
    public let listing: PropertyListing
    public let matchesPreferences: Bool
    public let reasons: [String]

    public init(listing: PropertyListing, matchesPreferences: Bool, reasons: [String]) {
        self.listing = listing
        self.matchesPreferences = matchesPreferences
        self.reasons = reasons
    }
}

public struct ListingMatcher: Sendable {
    public init() {}

    public func evaluate(listing: PropertyListing, preferences: SearchPreferences) -> ListingMatchResult {
        var reasons: [String] = []
        var matches = true

        if !preferences.enabledSources.contains(listing.source) {
            matches = false
            reasons.append("Source \(listing.source.rawValue) is disabled")
        }

        if !preferences.propertyTypes.isEmpty && !preferences.propertyTypes.contains(listing.propertyType) {
            matches = false
            reasons.append("Property type \(listing.propertyType.rawValue) is not selected")
        }

        if !preferences.layouts.isEmpty && !preferences.layouts.contains(listing.layout) {
            matches = false
            reasons.append("Layout \(listing.layout.rawValue) is not selected")
        }

        if let minimumArea = preferences.minimumAreaM2, listing.areaM2 < minimumArea {
            matches = false
            reasons.append("Area \(listing.areaM2)m² is below minimum \(minimumArea)m²")
        }

        if let maxPrice = preferences.maximumPriceCZK, listing.priceCZK > maxPrice {
            matches = false
            reasons.append("Price \(listing.priceCZK) CZK exceeds maximum \(maxPrice) CZK")
        }

        if let priceBand = preferences.priceBand, !priceBand.contains(pricePerSquareMeter: listing.pricePerSquareMeter) {
            matches = false
            reasons.append("Price per m² \(listing.pricePerSquareMeter?.description ?? "n/a") is outside allowed band")
        }

        if !preferences.locationFilters.isEmpty {
            let matchesLocation = preferences.locationFilters.contains { filter in
                switch filter.radius {
                case .citywide:
                    return listing.location.city.caseInsensitiveCompare(filter.city) == .orderedSame
                case .district(let district):
                    return listing.location.city.caseInsensitiveCompare(filter.city) == .orderedSame &&
                        listing.location.district.caseInsensitiveCompare(district) == .orderedSame
                case let .custom(center, kilometers):
                    guard let listingCoordinate = listing.location.coordinates else { return false }
                    let distance = center.distanceInKilometers(to: listingCoordinate)
                    return distance <= kilometers
                }
            }

            if !matchesLocation {
                matches = false
                reasons.append("Listing does not fall within preferred locations")
            }
        }

        return ListingMatchResult(listing: listing, matchesPreferences: matches, reasons: reasons)
    }
}

private extension Coordinate {
    func distanceInKilometers(to other: Coordinate) -> Double {
        let earthRadiusKm = 6371.0

        let lat1 = latitude.toRadians
        let lon1 = longitude.toRadians
        let lat2 = other.latitude.toRadians
        let lon2 = other.longitude.toRadians

        let latDelta = lat2 - lat1
        let lonDelta = lon2 - lon1

        let a = sin(latDelta / 2) * sin(latDelta / 2) +
            cos(lat1) * cos(lat2) * sin(lonDelta / 2) * sin(lonDelta / 2)
        let c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return earthRadiusKm * c
    }
}

private extension Double {
    var toRadians: Double { self * .pi / 180 }
}
