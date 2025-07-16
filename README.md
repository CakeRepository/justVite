# Socratic Tutor Frontend

A beautiful, modern frontend for the Socratic Tutor AI application built with React, TypeScript, and Tailwind CSS. This application provides an intuitive interface for engaging with AI tutors using the Socratic method.

[![Azure Static Web Apps CI/CD](https://github.com/CakeRepository/justVite/actions/workflows/azure-static-web-apps-jolly-field-0cedd170f.yml/badge.svg)](https://github.com/CakeRepository/justVite/actions/workflows/azure-static-web-apps-jolly-field-0cedd170f.yml)

## Features
- 🎓 **Interactive Learning**: Engage with AI tutors through guided questioning
- 🤖 **Multi-Agent System**: Three specialized AI agents (Socratic, Conversationalist, Explainer)
- 📚 **Topic Selection**: Choose from curated topics or enter custom questions
- 💬 **Real-time Chat**: Smooth, responsive chat interface
- 🔄 **Session Management**: Save and resume learning sessions
- 🌟 **Beautiful UI**: Modern, accessible design with smooth animations
- 📱 **Responsive Design**: Works perfectly on desktop and mobile

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Backend**: Supabase Edge Functions
- **AI**: OpenAI GPT models with RAG (Retrieval-Augmented Generation)

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd socratic-tutor-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/           # React components
│   ├── TopicSelector.tsx    # Topic selection interface
│   ├── ChatInterface.tsx    # Main chat interface
│   ├── MessageBubble.tsx    # Individual message component
│   ├── MessageInput.tsx     # Message input component
│   ├── ChatHeader.tsx       # Chat header with controls
│   └── SessionList.tsx      # Session management
├── services/            # API and data services
│   ├── tutorService.ts     # Supabase Edge Function integration
│   └── storageService.ts   # Local storage management
├── types/               # TypeScript type definitions
├── config/              # Configuration and constants
└── styles/              # Global styles
```

## Key Components

### TopicSelector
- Beautiful topic selection interface
- Curated learning topics with difficulty levels
- Custom topic input
- Responsive grid layout

### ChatInterface
- Real-time messaging with AI tutors
- Different agent types with visual indicators
- Markdown support for rich text
- Session persistence

### Multi-Agent System
- **Socratic Tutor**: Guides through questioning
- **Conversationalist**: Provides encouragement and motivation
- **Explainer**: Offers clear explanations and hints

## Azure Deployment

This application is configured for easy deployment to Azure Static Web Apps.

### Using Azure Static Web Apps

1. **Create an Azure Static Web App**:
   - Go to Azure Portal
   - Create a new Static Web App
   - Connect your GitHub repository
   - Set build configuration:
     - Framework: React
     - App location: `/`
     - Build location: `dist`

2. **Configure Environment Variables**:
   In Azure Portal, add your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Deploy**:
   Push to your main branch and Azure will automatically build and deploy.

### Using Azure App Service

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to Azure App Service

## Backend Setup

This frontend connects to a Supabase Edge Function. Make sure you have:

1. **Supabase Project** with the required database schema
2. **Edge Function** deployed (`openai_proxy_tutor_rag`)
3. **Environment Variables** configured in Supabase
4. **Vector Store** set up for RAG functionality

## Configuration

### Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_DEFAULT_MODEL`: (Optional) Default AI model to use

### Customization

- **Topics**: Edit `src/config/constants.ts` to modify suggested topics
- **Styling**: Customize colors and themes in `tailwind.config.js`
- **Agent Behavior**: Modify agent prompts in the Edge Function

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
