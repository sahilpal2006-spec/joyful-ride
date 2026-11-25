import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const configuredUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? Constants.expoConfig?.extra?.backendUrl;
const API_URL = configuredUrl ? (configuredUrl.endsWith("/") ? configuredUrl.slice(0, -1) : configuredUrl) + "/api" : null;

export type Destination = { id: string; name: string; subtitle: string; distance: string; color: string; icon: string };
export type Vehicle = { id: string; name: string; subtitle: string; seats: number; eta: string; base_fare: number; accent: string; icon: string };
export type Estimate = { distance: string; duration: string; fare: number; vehicle_id: string };
export type Booking = { id: string; user_id: string; pickup: string; dropoff: string; vehicle_id: string; fare: number; experience?: string; status: "confirmed" | "arriving" | "completed"; eta: string; created_at: string; driver: { name: string; rating: number; vehicle: string; plate: string; color: string } };

// Local demo data keeps the APK usable without a hosted backend.
const DEMO_DESTINATIONS: Destination[] = [
  { id: "harbor", name: "Sunset Harbor", subtitle: "Ocean views & fresh air", distance: "2.4 mi", color: "#FFE5D9", icon: "sunny-outline" },
  { id: "market", name: "Color Market", subtitle: "Local bites & happy finds", distance: "1.8 mi", color: "#FFF0C2", icon: "basket-outline" },
  { id: "garden", name: "Rose Garden", subtitle: "A quiet floral escape", distance: "3.1 mi", color: "#DDF5EE", icon: "flower-outline" },
  { id: "museum", name: "City Museum", subtitle: "Stories worth the detour", distance: "2.9 mi", color: "#E2ECFF", icon: "color-palette-outline" },
];
const DEMO_VEHICLES: Vehicle[] = [
  { id: "joy", name: "Joy Ride", subtitle: "Most popular", seats: 4, eta: "3 min", base_fare: 12.5, accent: "#FF5722", icon: "car-sport-outline" },
  { id: "comfort", name: "Comfort", subtitle: "Extra legroom", seats: 4, eta: "5 min", base_fare: 18, accent: "#3A86FF", icon: "car-outline" },
  { id: "van", name: "Joy Van", subtitle: "Room for everyone", seats: 6, eta: "7 min", base_fare: 24, accent: "#2EC4B6", icon: "bus-outline" },
];
const BOOKINGS_KEY = "joyride.demo.bookings.v1";

async function readLocalBookings(): Promise<Booking[]> {
  try { return JSON.parse((await AsyncStorage.getItem(BOOKINGS_KEY)) ?? "[]") as Booking[]; }
  catch { return []; }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("Backend is not configured. Set EXPO_PUBLIC_BACKEND_URL.");
  const response = await fetch(API_URL + path, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "Something went wrong");
  return response.json();
}

export const getDestinations = () => API_URL ? request<Destination[]>("/destinations") : Promise.resolve(DEMO_DESTINATIONS);
export const getVehicles = () => API_URL ? request<Vehicle[]>("/vehicles") : Promise.resolve(DEMO_VEHICLES);
export const getBookings = async () => API_URL ? request<Booking[]>("/bookings?user_id=demo-user") : readLocalBookings();
export const getBooking = async (id: string) => {
  if (API_URL) return request<Booking>("/bookings/" + id);
  const booking = (await readLocalBookings()).find((item) => item.id === id);
  if (!booking) throw new Error("This ride could not be found on this phone.");
  return booking;
};
export const estimateRide = (payload: { pickup: string; dropoff: string; vehicle_id: string }) => {
  if (API_URL) return request<Estimate>("/rides/estimate", { method: "POST", body: JSON.stringify(payload) });
  const vehicle = DEMO_VEHICLES.find((item) => item.id === payload.vehicle_id);
  if (!vehicle) return Promise.reject(new Error("Please choose a ride."));
  const routeFactor = Math.max(1, (payload.pickup.length + payload.dropoff.length) % 7);
  return Promise.resolve({ distance: (routeFactor + 1) + "." + routeFactor + " mi", duration: (routeFactor + 6) + " min", fare: Math.round((vehicle.base_fare + routeFactor * 1.35) * 100) / 100, vehicle_id: vehicle.id });
};
export const createBooking = async (payload: { pickup: string; dropoff: string; vehicle_id: string; fare: number; experience?: string }) => {
  if (API_URL) return request<Booking>("/bookings", { method: "POST", body: JSON.stringify(payload) });
  const booking: Booking = {
    ...payload, id: "jr-" + Date.now().toString(36), user_id: "demo-user", status: "confirmed", eta: "6 min", created_at: new Date().toISOString(),
    driver: { name: "Maya Chen", rating: 4.98, vehicle: "Coral hatchback", plate: "JOY 247", color: "#FF6B35" },
  };
  const bookings = await readLocalBookings();
  await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking, ...bookings]));
  return booking;
};
