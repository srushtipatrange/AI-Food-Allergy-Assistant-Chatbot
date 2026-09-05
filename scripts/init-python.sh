#!/bin/bash

# Initialize Python project structure
mkdir -p backend
cd backend

# Initialize uv project
uv init --bare .

# Add required dependencies for FastAPI backend
uv add fastapi uvicorn python-multipart aiohttp pydantic

echo "Python backend initialized successfully!"
