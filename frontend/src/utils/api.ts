import Constants from "expo-constants";

const configuredUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? Constants.expoConfig?.extra?.backendUrl;
const API_URL = configuredUrl ? `${configuredUrl.replace(/\/$/, "")}/api` : null;

export type Destination = { id: string; name: string; subtitle: string; distance: string; color: string; icon: string };
export type Vehicle = { id: string; name: string; subtitle: string; seats: number; eta: string; base_fare: number; accent: string; icon: string };
export type Estimate = { distance: string; duration: string; fare: number; vehicle_id: string };
export type Booking = { id: string; user_id: string; pickup: string; dropoff: string; vehicle_id: string; fare: number; experience?: string; status: "confirmed" | "arriving" | "completed"; eta: string; created_at: string; driver: { name: string; rating: number; vehicle: string; plate: string; color: string } };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("Backend is not configured. Set EXPO_PUBLIC_BACKEND_URL.");
  const response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "Something went wrong");
  return response.json();
}

export const getDestinations = () => request<Destination[]>("/destinations");
export const getVehicles = () => request<Vehicle[]>("/vehicles");
export const getBookings = () => request<Booking[]>("/bookings?user_id=demo-user");
export const getBooking = (id: string) => request<Booking>(`/bookings/${id}`);
export const estimateRide = (payload: { pickup: string; dropoff: string; vehicle_id: string }) => request<Estimate>("/rides/estimate", { method: "POST", body: JSON.stringify(payload) });
export const createBooking = (payload: { pickup: string; dropoff: string; vehicle_id: string; fare: number; experience?: string }) => request<Booking>("/bookings", { method: "POST", body: JSON.stringify(payload) });
