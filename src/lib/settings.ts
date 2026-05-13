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

export type DpConfig = {
  mandatory: boolean;
};

const MARGIN_KEY = 'jastipflow_margin_config';
const TRIP_KEY = 'jastipflow_trip_config';
const DP_KEY = 'jastipflow_dp_config';

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

export function getDpConfig(): DpConfig {
  try {
    const raw = localStorage.getItem(DP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { mandatory: false };
}

export function saveDpConfig(config: DpConfig) {
  localStorage.setItem(DP_KEY, JSON.stringify(config));
}
