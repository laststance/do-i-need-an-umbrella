# 🌂 Do I Need an Umbrella?

A modern, responsive weather application built with Next.js 15 that helps you decide whether you need an umbrella based on weather forecasts. The app provides detailed weather information for today and tomorrow with an interactive map-based location selector.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### Core Functionality
- **Weather Forecasts**: View detailed weather forecasts for today and tomorrow
- **Umbrella Recommendation**: Smart recommendation system that analyzes precipitation data to suggest whether you need an umbrella
- **Interactive Map**: Google Maps integration for easy location selection
- **Location Detection**: Automatic geolocation support with manual override
- **Preset Locations**: Quick access to major cities (Tokyo, New York, London, Sydney, Rio de Janeiro)

### User Experience
- **Bilingual Support**: English and Japanese language support
- **Theme Switching**: Light and dark mode with system preference detection
- **Temperature Units**: Toggle between Celsius and Fahrenheit
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: Built with Radix UI primitives for full keyboard navigation and screen reader support

### Technical Features
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Environment Validation**: Type-safe environment variables with `@t3-oss/env-nextjs`
- **Performance Optimization**: 
  - 15-minute in-memory caching for weather data
  - 24-hour caching for geocoding data
  - React Server Components for optimal performance
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety

### UI & Styling
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Shadcn UI** - High-quality React components built on Radix UI
- **Lucide React** - Icon library
- **next-themes** - Theme management

### State Management
- **React Context API** - Global state management for:
  - Location coordinates
  - Temperature units (Celsius/Fahrenheit)
  - UI language (English/Japanese)

### Data & APIs
- **Met.no Weather API** - Free, open weather data from Norwegian Meteorological Institute
- **Google Maps JavaScript API** - Interactive maps and location services
- **Google Geocoding API** - Reverse geocoding for location names

### Form & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@t3-oss/env-nextjs** - Environment variable validation

### Utilities
- **date-fns 4.1** - Date formatting and manipulation
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class name utilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or later
- **pnpm** 8.0 or later (package manager)

### API Keys Required

1. **Google Maps API Key**
   - Get your API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Required APIs:
     - Maps JavaScript API
     - Geocoding API
   - Enable billing (free tier available)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/laststance/do-i-need-an-umbrella.git
cd do-i-need-an-umbrella
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Maps API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Note**: The application uses `@t3-oss/env-nextjs` for type-safe environment variable validation. The API key is required and will be validated at build/runtime.

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 5. Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
do-i-need-an-umbrella/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── geocode/          # Geocoding API endpoint
│   │   └── weather/           # Weather API endpoint
│   ├── today/                # Today's weather page
│   ├── tomorrow/             # Tomorrow's weather page
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # Shadcn UI components (44+ components)
│   ├── *-provider.tsx        # Context providers
│   ├── *-switcher.tsx        # UI controls (theme, language, unit)
│   ├── detailed-weather.tsx  # Detailed weather display
│   ├── map-selector.tsx      # Google Maps location selector
│   ├── umbrella-recommendation.tsx  # Umbrella recommendation logic
│   └── weather-display.tsx   # Weather overview component
├── hooks/                    # Custom React hooks
│   ├── use-translations.tsx # i18n translation hook
│   ├── use-toast.ts          # Toast notification hook
│   └── use-mobile.tsx        # Mobile viewport detection
├── lib/                      # Utility functions
│   ├── api.ts                # API client functions
│   ├── date-utils.ts         # Date formatting utilities
│   ├── geocoding.ts          # Geocoding utilities
│   ├── translations.ts       # Translation strings
│   └── utils.ts              # General utilities (cn helper)
├── types/                    # TypeScript type definitions
│   └── weather.ts            # Weather data interfaces
├── public/                   # Static assets
├── env.ts                    # Environment variable validation
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # TailwindCSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## 🏗️ Architecture

### App Router Structure

The application uses Next.js 15 App Router with the following routes:

- **`/`** - Home page with weather overview, umbrella recommendation, and map selector
- **`/today`** - Detailed weather forecast for today
- **`/tomorrow`** - Detailed weather forecast for tomorrow

### API Routes

#### `/api/weather`
- **Purpose**: Fetches weather data from Met.no API
- **Method**: GET
- **Parameters**: 
  - `lat` (required): Latitude
  - `lon` (required): Longitude
- **Caching**: 15-minute in-memory cache
- **Response**: Weather data with timeseries information

#### `/api/geocode`
- **Purpose**: Reverse geocoding to get location names
- **Method**: GET
- **Parameters**:
  - `lat` (required): Latitude
  - `lng` (required): Longitude
  - `lang` (optional): Language code (default: "en")
- **Caching**: 24-hour in-memory cache
- **Response**: Location name string

### Context Architecture

The application uses React Context for global state management:

1. **LocationProvider** (`components/location-provider.tsx`)
   - Manages user location coordinates
   - Handles geolocation API
   - Provides location name via geocoding

2. **UnitProvider** (`components/unit-provider.tsx`)
   - Manages temperature unit preference (Celsius/Fahrenheit)
   - Provides conversion utilities

3. **LanguageProvider** (`components/language-provider.tsx`)
   - Manages UI language (English/Japanese)
   - Provides translation context

All providers are composed in `app/layout.tsx` and wrap the entire application.

### Component Organization

- **Server Components**: Default for all components unless interactivity is needed
- **Client Components**: Use `"use client"` directive for:
  - Components with state management
  - Event handlers and user interactions
  - Browser APIs (geolocation, localStorage)
  - Context providers and consumers

## 🔧 Configuration

### Environment Variables

The application uses `@t3-oss/env-nextjs` for type-safe environment variable validation.

#### Required Variables

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (string, required)
  - Google Maps API key for map display and geocoding
  - Get from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)

#### Optional Variables

- `SKIP_ENV_VALIDATION` (boolean)
  - Set to `true` to skip environment variable validation (useful for Docker builds)

### Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:

```typescript
"@/*": ["./*"]  // Points to project root
```

This allows imports like:
```typescript
import { env } from "@/env"
import { Button } from "@/components/ui/button"
```

### Build Configuration

The `next.config.mjs` includes:
- ESLint errors ignored during builds (for development)
- TypeScript errors ignored during builds (for development)
- Image optimization disabled (`unoptimized: true`)

## 🎨 Styling

### TailwindCSS

The project uses TailwindCSS with:
- CSS variables for theming (defined in `app/globals.css`)
- Custom color palette for light/dark modes
- Responsive breakpoints
- 4/8px grid system following Apple HIG guidelines

### Shadcn UI

Components are from Shadcn UI library:
- Style: default
- RSC: enabled (React Server Components)
- Base color: neutral
- CSS variables enabled
- Icon library: lucide

## 🌍 Internationalization

The application supports multiple languages:

- **English** (default)
- **Japanese** (日本語)

Language switching is available via the language switcher component. Translations are managed in `lib/translations.ts` and accessed via the `useTranslations` hook.

## 🧪 Development

### Available Scripts

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Development Guidelines

#### Server vs Client Components
- **Server Components**: Default for all components unless interactivity is needed
- **Client Components**: Use `"use client"` directive for interactive components

#### Component Best Practices
- Use PascalCase for component names
- Define TypeScript interfaces for all props
- Keep components focused on single responsibility
- Extract complex logic to custom hooks
- Follow existing Shadcn UI patterns for consistency

#### Styling Approach
- Use TailwindCSS utility classes
- Leverage CSS variables for theming
- Use the `cn()` utility from `lib/utils.ts` for conditional class names
- Follow existing component patterns for consistency

## 📊 Data Flow

### Weather Data Flow

1. User selects location via MapSelector or browser geolocation
2. Coordinates stored in LocationContext
3. Components fetch weather data using `lib/api.ts`
4. API route `/api/weather` fetches from Met.no API with 15-minute caching
5. Weather data rendered with proper unit conversion based on UnitContext

### Location Data Flow

1. User selects location on map or uses geolocation
2. Coordinates sent to `/api/geocode` endpoint
3. Google Geocoding API returns location name
4. Location name cached for 24 hours
5. Location name displayed in UI

## 🚢 Deployment

### Environment Variables

Ensure all required environment variables are set in your deployment platform:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Build Process

The application builds with:

```bash
pnpm build
```

### Recommended Platforms

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (with `SKIP_ENV_VALIDATION=true` for build)

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contributions are not currently accepted.

## 📧 Support

For issues or questions, please contact the repository maintainers.

## 🙏 Acknowledgments

- **Met.no** - Free, open weather data API
- **Google Maps Platform** - Maps and geocoding services
- **Shadcn UI** - Beautiful, accessible component library
- **Next.js Team** - Excellent React framework
- **Radix UI** - Accessible component primitives

---

Made with ❤️ using Next.js, TypeScript, and TailwindCSS

