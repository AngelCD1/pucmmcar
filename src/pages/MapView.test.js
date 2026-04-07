import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * MapView - Coordinate Validation Tests (Vitest Version)
 */

// --- HELPER FUNCTIONS (Copiados de tu lógica de Santo Domingo) ---

const SD_BOUNDS = {
  latMin: 18.35, latMax: 18.60,
  lngMin: -70.10, lngMax: -69.75
};

const isValidNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

const isInSD = (lat, lng) => {
  return lat >= SD_BOUNDS.latMin && lat <= SD_BOUNDS.latMax &&
    lng >= SD_BOUNDS.lngMin && lng <= SD_BOUNDS.lngMax;
};

const isValidRide = (ride) => {
  if (!isValidNumber(ride.fromLat) || !isValidNumber(ride.fromLng) ||
    !isValidNumber(ride.toLat) || !isValidNumber(ride.toLng)) {
    return false;
  }

  const fromLat = Number(ride.fromLat);
  const fromLng = Number(ride.fromLng);
  const toLat = Number(ride.toLat);
  const toLng = Number(ride.toLng);

  const isZeroCoord = (lat, lng) => lat === 0 && lng === 0;

  if (isZeroCoord(fromLat, fromLng) || isZeroCoord(toLat, toLng)) return false;
  if (!isInSD(fromLat, fromLng) || !isInSD(toLat, toLng)) return false;

  return true;
};

const processRide = (ride) => {
  if (!isValidRide(ride)) {
    console.warn(`[MapView] Skipping ride ${ride.id}`, {
      fromLat: ride.fromLat,
      fromLng: ride.fromLng,
    });
    return null;
  }
  return {
    fromLat: Number(ride.fromLat),
    fromLng: Number(ride.fromLng),
  };
};

// --- TEST CASES ---

describe("MapView - Coordinate Validation", () => {
  let warnSpy;

  beforeEach(() => {
    // En Vitest usamos vi.spyOn en lugar de jest.spyOn
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('TEST 1 — null coordinates (all four null)', () => {
    const input = { id: 1, fromLat: null, fromLng: null, toLat: null, toLng: null };
    expect(processRide(input)).toBeNull();
  });

  it('TEST 2 — partial null (origin null, destination valid)', () => {
    const input = { id: 2, fromLat: null, fromLng: null, toLat: 18.49, toLng: -69.93 };
    expect(isValidRide(input)).toBe(false);
    expect(processRide(input)).toBeNull();
  });

  it('TEST 3 — valid string coordinates', () => {
    const input = { fromLat: "18.4861", fromLng: "-69.9312", toLat: "18.49", toLng: "-69.93" };
    const result = processRide(input);
    expect(result).not.toBeNull();
    expect(result.fromLat).toBe(18.4861);
  });

  it('TEST 4 — "NaN" string coordinates', () => {
    const input = { fromLat: "NaN", fromLng: "NaN", toLat: "18.49", toLng: "-69.93" };
    expect(isValidRide(input)).toBe(false);
  });

  it('TEST 5 — 0,0 coordinates (GPS failure)', () => {
    const input = { fromLat: 0, fromLng: 0, toLat: 0, toLng: 0 };
    expect(isValidRide(input)).toBe(false);
  });

  it('TEST 6 — coordinates outside Santo Domingo (e.g. Santiago o NY)', () => {
    // Santiago de los Caballeros (Fuera de nuestros límites de SD)
    const input = { fromLat: 19.45, fromLng: -70.68, toLat: 18.49, toLng: -69.93 };
    expect(isValidRide(input)).toBe(false);
  });

  it('TEST 7 — console.warn is called for invalid ride', () => {
    const input = { id: 99, fromLat: null, fromLng: null, toLat: null, toLng: null };
    processRide(input);
    expect(warnSpy).toHaveBeenCalled();
  });
});