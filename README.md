# FlowStacks - AI Productivity Tools Directory

A production-quality Next.js web application that serves as a curated directory for discovering AI productivity tools. Built with modern web technologies and featuring a sleek dark theme with search API integration.

## Features

- **Curated Tool Directory**: Browse 20 carefully selected AI productivity tools across multiple categories
- **Smart Search & Filtering**: Find tools by name, category, pricing model, or keywords
- **Collections**: Pre-built tool stacks for different personas (founders, developers, students, creators)
- **Web Discovery**: Experimental search feature using Serper.dev and SerpApi to discover new tools
- **Theme Toggle**: Switch between dark and light modes with persistent preferences
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop
- **Smooth Animations**: Polished UI with Framer Motion animations

## Tech Stack

- **Framework**: Next.js 13.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Theming**: next-themes
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required for authentication and reviews)
# Get these from your Supabase project settings: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Search API Keys (Optional - only needed for the Discover feature)
SERPER_API_KEY=your_serper_api_key_here
SERPAPI_API_KEY=your_serpapi_key_here
```

**Supabase Setup:**
- Create a free account at [https://supabase.com](https://supabase.com)
- Create a new project
- Go to Project Settings > API
- Copy your Project URL and anon/public key
- Note: The app will run without Supabase, but authentication and reviews features will be disabled

**Search API Keys (Optional):**
- **Serper.dev**: Sign up at [https://serper.dev](https://serper.dev)
- **SerpApi**: Sign up at [https://serpapi.com](https://serpapi.com)
- The Discover feature requires at least one of these API keys to function

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── api/discover/            # Search API endpoint
│   ├── collections/             # Collections pages
│   ├── discover/                # Web discovery page
│   ├── tools/                   # Tools pages
│   └── page.tsx                 # Landing page
├── components/
│   ├── collections/             # Collection components
│   ├── home/                    # Landing page components
│   ├── layout/                  # Layout components
│   ├── providers/               # Theme provider
│   ├── tools/                   # Tool components
│   └── ui/                      # shadcn/ui components
├── data/
│   ├── tools.json               # Tool database
│   └── collections.json         # Collections database
└── lib/
    ├── data.ts                  # Data loading utilities
    ├── search-providers.ts      # Search API abstraction
    ├── types.ts                 # TypeScript types
    └── utils.ts                 # Utility functions
```

## Key Features

### Landing Page
- Hero section with search functionality
- Browse by persona cards
- Featured tool collections
- Editor's picks showcase

### Tools Explorer
- 20 curated AI productivity tools
- Search by name, description, or tags
- Filter by category (writing, meeting, automation, planning, research, devtools)
- Filter by pricing model (free, freemium, paid)
- Detailed tool pages with related tools

### Collections
- 5 curated tool stacks
- Persona-based collections
- Full tool details for each collection

### Discover (Experimental)
- Web search integration using Serper.dev or SerpApi
- Find potential new AI tools across the internet
- Automatic tool candidate detection
- Real-time search results

## Design System

### Color Scheme
- **Dark Mode** (default): Pure black background (#000000) with yellow accent
- **Light Mode**: Clean white background with yellow accent
- **Accent Color**: Yellow (#EAB308) for highlights and primary actions

### Typography
- Font: Inter
- Responsive sizing for all screen sizes
- Clear hierarchy with proper line spacing

### Components
All UI components follow shadcn/ui patterns with custom theming and animations.

## API Integration

The Discover feature uses a clean abstraction layer for search APIs:

- **Serper.dev**: Default provider for web search
- **SerpApi**: Alternative provider with automatic fallback
- Server-side API route handles authentication and error handling
- Client-side interface with loading states and error messages

## Data Model

### Tool
```typescript
{
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  category: 'writing' | 'meeting' | 'automation' | 'planning' | 'research' | 'devtools' | 'other'
  pricing: 'free' | 'freemium' | 'paid'
  websiteUrl: string
  productHuntUrl?: string
  tags: string[]
  bestFor: string[]
  platforms: string[]
  featured?: boolean
}
```

### Collection
```typescript
{
  id: string
  slug: string
  title: string
  description: string
  toolIds: string[]
  persona?: string
}
```

## Future Enhancements

- User authentication and personalized recommendations
- Tool ratings and reviews
- Bookmark and save favorite tools
- Advanced filtering (by platform, integrations)
- Tool comparison feature
- Newsletter signup
- Submit new tool suggestions
- Database integration (currently using JSON files)

## License

This project is built for demonstration purposes.
