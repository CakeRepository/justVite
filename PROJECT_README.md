# Socratic Tutor Frontend

A beautiful, modern React frontend for the Socratic tutoring system that connects to your Supabase edge function. This application provides an intuitive interface for students to engage in guided learning through the Socratic method.

## 🚀 Features

- **Interactive Chat Interface**: Clean, modern chat UI with real-time messaging
- **Multi-Agent System**: Visual indicators for different AI tutors (Socratic, Conversationalist, Explainer)
- **Topic Selection**: Curated learning topics with custom topic input
- **Session Management**: Save and resume learning sessions
- **Responsive Design**: Works beautifully on desktop and mobile
- **Real-time Feedback**: Loading states and typing indicators
- **Markdown Support**: Rich text formatting in messages
- **Azure Deployment Ready**: Configured for Azure Static Web Apps

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Supabase** for backend integration
- **Azure Static Web Apps** for deployment

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd socratic-tutor-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Azure Static Web Apps

1. **Create an Azure Static Web App**
   - Go to Azure Portal
   - Create a new Static Web App
   - Connect to your GitHub repository

2. **Configure build settings**
   - App location: `/`
   - Output location: `dist`
   - Build command: `npm run build`

3. **Set environment variables**
   - Add your Supabase URL and keys in the Azure portal

4. **Deploy**
   - Push to main branch triggers automatic deployment

## 🎨 UI Components

The app includes beautiful, responsive components for an optimal learning experience.

Built with ❤️ for better learning experiences
