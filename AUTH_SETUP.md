# Authentication Setup Guide

This guide will help you set up Supabase authentication for your Socratic Tutor application.

## Prerequisites

- A Supabase project
- Environment variables configured (see `.env.example`)

## Database Setup

1. **Run the Database Schema**
   
   Go to your Supabase Dashboard → SQL Editor and run the contents of `database/schema.sql`. This will:
   - Create the `chat_sessions` table
   - Enable Row Level Security (RLS)
   - Create policies to ensure users can only access their own sessions
   - Add indexes for better performance
   - Set up automatic timestamp updates

2. **Configure Authentication**

   In your Supabase Dashboard:
   - Go to **Authentication** → **Settings**
   - Make sure **Email** is enabled as a sign-in method
   - Configure your site URL and redirect URLs if needed
   - Optionally, customize email templates

## Features Added

### 🔐 User Authentication
- **Sign Up**: Users can create accounts with email/password
- **Sign In**: Existing users can log in
- **Password Reset**: Users can reset their passwords via email
- **Sign Out**: Users can sign out securely

### 💾 Data Persistence
- **User-specific Sessions**: Each user's chat sessions are stored separately
- **Automatic Migration**: LocalStorage data is automatically migrated to Supabase when users sign in
- **Real-time Sync**: Sessions are automatically saved to the database
- **Offline Fallback**: Unauthenticated users can still use localStorage

### 🔒 Security Features
- **Row Level Security**: Users can only access their own data
- **Authenticated API Calls**: Edge function calls include proper authentication
- **Secure Session Management**: Supabase handles all session management

## How It Works

### Before Authentication
- Sessions are stored in browser localStorage
- Data is lost when browser storage is cleared
- No user accounts

### After Authentication
- Users must sign in to access the app
- Sessions are stored in Supabase database
- Each user only sees their own sessions
- Data persists across devices and browsers
- LocalStorage data is automatically migrated on first login

## User Interface Changes

### Login Screen
- Clean, responsive login/signup form
- Password reset functionality
- Toggle between login and signup modes

### Main App
- User profile button (top-left) showing user's email
- Profile modal with user info and sign-out option
- All existing functionality preserved

### Session Management
- Sessions are now tied to user accounts
- Automatic saving to database
- Proper deletion from database when sessions are removed

## Migration Path

1. **Existing Users**: Any existing localStorage data will be automatically migrated to the database when users first sign in
2. **New Users**: All new sessions are stored directly in the database
3. **Guest Users**: Unauthenticated users can still use the app with localStorage (optional fallback)

## Next Steps

1. Run the database schema in your Supabase project
2. Configure your environment variables
3. Test the authentication flow
4. Deploy your application

The authentication system is now fully integrated and ready to use!
