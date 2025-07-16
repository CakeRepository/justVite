#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Install Azure CLI if not already installed
echo "Checking Azure CLI..."
if ! command -v az &> /dev/null; then
    echo "Azure CLI not found. Please install it first."
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure (if not already logged in)
echo "Logging into Azure..."
az login

# Create resource group (if it doesn't exist)
RESOURCE_GROUP="socratic-tutor-rg"
LOCATION="eastus"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Static Web App
APP_NAME="socratic-tutor-frontend"
echo "Creating Static Web App..."
az staticwebapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --source . \
    --branch main \
    --app-location "/" \
    --output-location "dist"

echo "Deployment complete!"
echo "Your app will be available at: https://$APP_NAME.azurestaticapps.net"
