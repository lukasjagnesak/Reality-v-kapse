import Foundation

public enum ListingSource: String, Codable, CaseIterable, Sendable {
    case sreality
    case annonce
    case bezrealitky
}

public enum PropertyType: String, Codable, CaseIterable, Sendable {
    case apartment
    case house
}

public enum Layout: String, Codable, CaseIterable, Sendable {
    case studio
    case onePlusOne
    case onePlusKitchenette
    case twoPlusKitchenette
    case twoPlusOne
    case threePlusKitchenette
    case threePlusOne
    case fourPlusKitchenette
    case fourPlusOne
    case fivePlusKitchenette
    case fivePlusOne
    case maisonette
    case other
}

public enum PropertyMediaKind: String, Codable, CaseIterable, Sendable {
    case photo
    case floorPlan
    case virtualTour
}

public struct PropertyMedia: Codable, Equatable, Sendable {
    public let kind: PropertyMediaKind
    public let url: URL
    public let previewURL: URL?

    public init(kind: PropertyMediaKind, url: URL, previewURL: URL? = nil) {
        self.kind = kind
        self.url = url
        self.previewURL = previewURL
    }
}

public struct Coordinate: Codable, Equatable, Sendable {
    public let latitude: Double
    public let longitude: Double

    public init(latitude: Double, longitude: Double) {
        self.latitude = latitude
        self.longitude = longitude
    }
}

public struct Location: Codable, Equatable, Sendable {
    public let city: String
    public let district: String
    public let street: String?
    public let coordinates: Coordinate?

    public init(city: String, district: String, street: String? = nil, coordinates: Coordinate? = nil) {
        self.city = city
        self.district = district
        self.street = street
        self.coordinates = coordinates
    }
}

public struct ContactInfo: Codable, Equatable, Sendable {
    public let name: String?
    public let email: String?
    public let phone: String?

    public init(name: String? = nil, email: String? = nil, phone: String? = nil) {
        self.name = name
        self.email = email
        self.phone = phone
    }
}

public struct PropertyListing: Identifiable, Codable, Equatable, Sendable {
    public let id: UUID
    public let source: ListingSource
    public let externalID: String
    public let title: String
    public let summary: String
    public let propertyType: PropertyType
    public let layout: Layout
    public let priceCZK: Decimal
    public let areaM2: Double
    public let location: Location
    public let media: [PropertyMedia]
    public let contact: ContactInfo
    public let externalURL: URL
    public let publishedAt: Date

    public init(
        id: UUID = UUID(),
        source: ListingSource,
        externalID: String,
        title: String,
        summary: String,
        propertyType: PropertyType,
        layout: Layout,
        priceCZK: Decimal,
        areaM2: Double,
        location: Location,
        media: [PropertyMedia],
        contact: ContactInfo,
        externalURL: URL,
        publishedAt: Date
    ) {
        self.id = id
        self.source = source
        self.externalID = externalID
        self.title = title
        self.summary = summary
        self.propertyType = propertyType
        self.layout = layout
        self.priceCZK = priceCZK
        self.areaM2 = areaM2
        self.location = location
        self.media = media
        self.contact = contact
        self.externalURL = externalURL
        self.publishedAt = publishedAt
    }
}

public extension PropertyListing {
    var pricePerSquareMeter: Decimal? {
        guard areaM2 > 0 else { return nil }
        return priceCZK / Decimal(areaM2)
    }
}
