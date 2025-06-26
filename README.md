# FlexBuild - Visual-First AI Development Platform

FlexBuild is a revolutionary visual-first AI development platform that empowers developers to build production-ready applications using natural language and intuitive visual tools.

## Features

### 🎨 Visual Builder
- Drag-and-drop component system
- Real-time visual canvas
- Properties panel for component customization
- Responsive design tools

### 🤖 AI-Powered Development
- Natural language component generation
- Smart code suggestions
- AI chat interface for real-time assistance
- Context-aware development help

### 🏗️ Modern Architecture
- Built with React 18 and TypeScript
- Vite for lightning-fast development
- Zustand for state management
- IndexedDB for local persistence (Supabase integration ready)
- Tailwind CSS for styling

### 🚀 Key Capabilities
- Visual component design
- AI-assisted development
- Multi-screen application support
- Design system management
- User journey mapping
- Data model creation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/flexpertsdev/flexbuild.git
cd flexbuild
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
flexbuild/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ai/         # AI chat interface
│   │   ├── auth/       # Authentication components
│   │   ├── builder/    # Visual builder components
│   │   └── common/     # Common UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Application pages
│   ├── services/       # Service layer (auth, database)
│   ├── stores/         # Zustand state stores
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── public/             # Static assets
└── package.json        # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Technology Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Local Storage**: IndexedDB with Dexie
- **Icons**: Lucide React
- **Routing**: React Router

## Features in Development

- [ ] Supabase integration for cloud persistence
- [ ] Real-time collaboration
- [ ] Code export functionality
- [ ] Component marketplace
- [ ] Advanced AI capabilities
- [ ] Team workspaces

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ by the FlexBuild team