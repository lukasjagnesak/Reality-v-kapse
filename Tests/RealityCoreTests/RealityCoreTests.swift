import XCTest
@testable import RealityCore

final class PriceBandTests: XCTestCase {
    func testContainsWithinDeviation() {
        let band = PriceBand(averagePricePerSquareMeter: 100_000, acceptableDeviationPercent: 10)
        XCTAssertTrue(band.contains(pricePerSquareMeter: 95_000))
        XCTAssertTrue(band.contains(pricePerSquareMeter: 105_000))
        XCTAssertFalse(band.contains(pricePerSquareMeter: 120_000))
    }
}
