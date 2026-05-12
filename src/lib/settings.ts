// Shared settings stored in localStorage

export type MarginConfig = {
  type: 'percent' | 'nominal';
  value: string;
};

export type TripConfig = {
  country: string;
  currency: string;
  exchangeRate: number;
};

const MARGIN_KEY = 'jastipflow_margin_config';
const TRIP_KEY = 'jastipflow_trip_config';

export function getMarginConfig(): MarginConfig {
  try {
    const raw = localStorage.getItem(MARGIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { type: 'percent', value: '20' };
}

export function saveMarginConfig(config: MarginConfig) {
  localStorage.setItem(MARGIN_KEY, JSON.stringify(config));
}

export function getTripConfig(): TripConfig {
  try {
    const raw = localStorage.getItem(TRIP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { country: 'SG', currency: 'SGD', exchangeRate: 11500 };
}

export function saveTripConfig(config: TripConfig) {
  localStorage.setItem(TRIP_KEY, JSON.stringify(config));
}
