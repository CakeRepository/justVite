# Deployment Guide for Socratic Tutor Frontend

## Prerequisites

1. **Azure CLI** installed on your system
2. **Node.js** and **npm** installed
3. **Git** repository with your code

## Quick Deploy to Azure Static Web Apps

### Option 1: Using Azure CLI (Recommended)

1. **Clone and setup**
   ```bash
   git clone <your-repo>
   cd socratic-tutor-frontend
   npm install
   ```

2. **Set environment variables**
   ```bash
   # Copy example file
   cp .env.example .env
   
   # Edit .env with your Supabase credentials
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Deploy**
   ```bash
   # On Windows
   deploy-azure.bat
   
   # On Mac/Linux
   chmod +x deploy-azure.sh
   ./deploy-azure.sh
   ```

### Option 2: Azure Portal

1. **Go to Azure Portal**
   - Navigate to https://portal.azure.com
   - Search for "Static Web Apps"
   - Click "Create"

2. **Configure deployment**
   - **Resource Group**: Create new or select existing
   - **Name**: `socratic-tutor-frontend`
   - **Region**: Choose closest to your users
   - **Source**: GitHub (connect your repository)
   - **Branch**: `main`
   - **Build Presets**: Custom
   - **App location**: `/`
   - **Output location**: `dist`

3. **Environment Variables**
   - Go to your Static Web App in Azure Portal
   - Navigate to "Configuration"
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Push to your main branch
   - GitHub Actions will automatically build and deploy

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## Supabase Configuration

Ensure your Supabase project has:

1. **Edge Function** deployed (`openai_proxy_tutor_rag`)
2. **CORS** configured for your domain
3. **Environment variables** set in Supabase dashboard:
   - `OPENAI_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Custom Domain (Optional)

1. **In Azure Portal**:
   - Go to your Static Web App
   - Navigate to "Custom domains"
   - Add your domain
   - Follow DNS configuration instructions

2. **SSL Certificate**:
   - Automatically provisioned by Azure
   - Takes 5-10 minutes to activate

## Monitoring

- **Azure Portal**: View deployment logs and metrics
- **GitHub Actions**: Monitor build and deployment status
- **Browser DevTools**: Debug frontend issues

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Check Azure Portal configuration
   - Redeploy after adding variables

3. **Supabase Connection Issues**
   - Verify URL and key are correct
   - Check CORS configuration
   - Ensure edge function is deployed

### Getting Help

- Check the GitHub Issues
- Review Supabase documentation
- Contact support team

## Security Considerations

- Never commit `.env` files
- Use environment variables for sensitive data
- Regularly rotate API keys
- Monitor for suspicious activity

## Performance Optimization

- Enable compression in Azure
- Use CDN for static assets
- Implement caching strategies
- Monitor Core Web Vitals

---

🚀 **Happy Deploying!** Your Socratic Tutor frontend will be live and ready to help students learn through guided questioning.
