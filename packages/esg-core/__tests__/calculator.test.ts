// ESG Calculator - Unit Tests
// 100% coverage is MANDATORY per .rules/03-multi-tenancy-security.md

import { describe, it, expect } from "vitest";
import { calculateCo2Savings, calculateOrgSummary } from "../src/calculator";
import { EMISSION_FACTORS } from "../src/constants";

describe("calculateCo2Savings", () => {
  const defaultEmission = EMISSION_FACTORS.AVERAGE_CAR; // 0.12

  describe("valid calculations", () => {
    it("should calculate savings for 1 driver + 2 passengers (3 occupants)", () => {
      const result = calculateCo2Savings({
        distanceKm: 30,
        passengerCount: 2,
        emissionFactorKgPerKm: defaultEmission,
      });

      // 30 * 0.12 * (1 - 1/3) = 30 * 0.12 * 0.6667 = 2.4
      expect(result.co2SavedKg).toBe(2.4);
      expect(result.totalOccupants).toBe(3);
      expect(result.formulaVersion).toBe("v1.0");
    });

    it("should calculate savings for 1 driver + 1 passenger (2 occupants)", () => {
      const result = calculateCo2Savings({
        distanceKm: 20,
        passengerCount: 1,
        emissionFactorKgPerKm: defaultEmission,
      });

      // 20 * 0.12 * (1 - 1/2) = 20 * 0.12 * 0.5 = 1.2
      expect(result.co2SavedKg).toBe(1.2);
      expect(result.totalOccupants).toBe(2);
    });

    it("should calculate savings for 1 driver + 4 passengers (5 occupants)", () => {
      const result = calculateCo2Savings({
        distanceKm: 50,
        passengerCount: 4,
        emissionFactorKgPerKm: defaultEmission,
      });

      // 50 * 0.12 * (1 - 1/5) = 50 * 0.12 * 0.8 = 4.8
      expect(result.co2SavedKg).toBe(4.8);
      expect(result.totalOccupants).toBe(5);
    });

    it("should return 0 savings for solo driver (0 passengers)", () => {
      const result = calculateCo2Savings({
        distanceKm: 100,
        passengerCount: 0,
        emissionFactorKgPerKm: defaultEmission,
      });

      expect(result.co2SavedKg).toBe(0);
      expect(result.totalOccupants).toBe(1);
    });

    it("should return 0 savings for 0 km distance", () => {
      const result = calculateCo2Savings({
        distanceKm: 0,
        passengerCount: 3,
        emissionFactorKgPerKm: defaultEmission,
      });

      expect(result.co2SavedKg).toBe(0);
      expect(result.totalOccupants).toBe(4);
    });

    it("should use electric car emission factor correctly", () => {
      const result = calculateCo2Savings({
        distanceKm: 30,
        passengerCount: 2,
        emissionFactorKgPerKm: EMISSION_FACTORS.ELECTRIC_CAR, // 0.03
      });

      // 30 * 0.03 * (1 - 1/3) = 30 * 0.03 * 0.6667 = 0.6
      expect(result.co2SavedKg).toBe(0.6);
    });

    it("should handle large distances", () => {
      const result = calculateCo2Savings({
        distanceKm: 500,
        passengerCount: 3,
        emissionFactorKgPerKm: defaultEmission,
      });

      // 500 * 0.12 * (1 - 1/4) = 500 * 0.12 * 0.75 = 45
      expect(result.co2SavedKg).toBe(45);
    });

    it("should handle fractional distances precisely", () => {
      const result = calculateCo2Savings({
        distanceKm: 15.7,
        passengerCount: 1,
        emissionFactorKgPerKm: defaultEmission,
      });

      // 15.7 * 0.12 * (1 - 1/2) = 15.7 * 0.12 * 0.5 = 0.942
      expect(result.co2SavedKg).toBe(0.942);
    });
  });

  describe("input validation", () => {
    it("should throw for negative distance", () => {
      expect(() =>
        calculateCo2Savings({
          distanceKm: -10,
          passengerCount: 2,
          emissionFactorKgPerKm: defaultEmission,
        })
      ).toThrow("Invalid distanceKm");
    });

    it("should throw for negative passenger count", () => {
      expect(() =>
        calculateCo2Savings({
          distanceKm: 30,
          passengerCount: -1,
          emissionFactorKgPerKm: defaultEmission,
        })
      ).toThrow("Invalid passengerCount");
    });

    it("should throw for non-integer passenger count", () => {
      expect(() =>
        calculateCo2Savings({
          distanceKm: 30,
          passengerCount: 1.5,
          emissionFactorKgPerKm: defaultEmission,
        })
      ).toThrow("Passenger count must be an integer");
    });

    it("should throw for zero emission factor", () => {
      expect(() =>
        calculateCo2Savings({
          distanceKm: 30,
          passengerCount: 2,
          emissionFactorKgPerKm: 0,
        })
      ).toThrow("Invalid emissionFactorKgPerKm");
    });

    it("should throw for negative emission factor", () => {
      expect(() =>
        calculateCo2Savings({
          distanceKm: 30,
          passengerCount: 2,
          emissionFactorKgPerKm: -0.12,
        })
      ).toThrow("Invalid emissionFactorKgPerKm");
    });
  });

  describe("formula version", () => {
    it("should always return the current formula version", () => {
      const result = calculateCo2Savings({
        distanceKm: 30,
        passengerCount: 2,
        emissionFactorKgPerKm: defaultEmission,
      });

      expect(result.formulaVersion).toBe("v1.0");
    });
  });
});

describe("calculateOrgSummary", () => {
  it("should aggregate multiple trip logs", () => {
    const trips = [
      { distanceKm: 30, co2SavedKg: 2.4 },
      { distanceKm: 20, co2SavedKg: 1.2 },
      { distanceKm: 50, co2SavedKg: 4.8 },
    ];

    const result = calculateOrgSummary(trips);

    expect(result.totalTrips).toBe(3);
    expect(result.totalDistanceKm).toBe(100);
    expect(result.totalCo2SavedKg).toBe(8.4);
    expect(result.averageCo2PerTrip).toBe(2.8);
  });

  it("should return zeros for empty array", () => {
    const result = calculateOrgSummary([]);

    expect(result.totalTrips).toBe(0);
    expect(result.totalDistanceKm).toBe(0);
    expect(result.totalCo2SavedKg).toBe(0);
    expect(result.averageCo2PerTrip).toBe(0);
  });

  it("should handle single trip", () => {
    const trips = [{ distanceKm: 30, co2SavedKg: 2.4 }];

    const result = calculateOrgSummary(trips);

    expect(result.totalTrips).toBe(1);
    expect(result.totalDistanceKm).toBe(30);
    expect(result.totalCo2SavedKg).toBe(2.4);
    expect(result.averageCo2PerTrip).toBe(2.4);
  });

  it("should handle trips with zero savings", () => {
    const trips = [
      { distanceKm: 30, co2SavedKg: 0 },
      { distanceKm: 20, co2SavedKg: 1.2 },
    ];

    const result = calculateOrgSummary(trips);

    expect(result.totalTrips).toBe(2);
    expect(result.totalCo2SavedKg).toBe(1.2);
    expect(result.averageCo2PerTrip).toBe(0.6);
  });
});
