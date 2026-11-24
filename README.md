# JoyRide

![JoyRide app icon](frontend/assets/images/icon.png)

A mobile ride-booking app built with **Expo / React Native** and a **FastAPI** backend.

## What it includes

- Ride booking flow
- Trips and profile screens
- FastAPI backend for bookings and status checks
- In-memory local development mode; bookings reset when the backend restarts
- Android APK build profile for EAS Build

## Tech stack

- Expo, React Native, TypeScript
- FastAPI, Python

## Run locally (Windows)

### 1. Start the backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn server:app --host 0.0.0.0 --port 8002 --reload
```

### 2. Set the API URL

Copy `frontend/.env.example` to `frontend/.env` and set:

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8002
```

For a phone on the same Wi-Fi, replace `localhost` with your computer's local network IP address.

### 3. Start the app

In another terminal:

```powershell
cd frontend
corepack yarn install
corepack yarn start --lan
```

## Build an Android APK

The `preview` profile in `frontend/eas.json` produces an installable APK. Set `EXPO_PUBLIC_BACKEND_URL` in your EAS build environment to a backend URL reachable by your phone, then run:

```powershell
cd frontend
npx eas-cli build --platform android --profile preview
```