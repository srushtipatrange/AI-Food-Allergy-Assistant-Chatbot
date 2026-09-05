#!/usr/bin/env python3
"""
Initialize the Python backend project structure
"""
import os
import subprocess
import sys

def create_backend_structure():
    """Create the backend directory structure"""
    backend_dir = "backend"
    
    # Create backend directory if it doesn't exist
    if not os.path.exists(backend_dir):
        os.makedirs(backend_dir)
        print(f"Created {backend_dir} directory")
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Initialize uv project
    try:
        subprocess.run(["uv", "init", "--bare", "."], check=True)
        print("Initialized uv project")
    except subprocess.CalledProcessError:
        print("Failed to initialize uv project")
        sys.exit(1)
    
    # Add dependencies
    dependencies = [
        "fastapi",
        "uvicorn",
        "python-multipart",
        "aiohttp",
        "pydantic",
        "python-dotenv"
    ]
    
    try:
        subprocess.run(["uv", "add"] + dependencies, check=True)
        print(f"Added dependencies: {', '.join(dependencies)}")
    except subprocess.CalledProcessError:
        print("Failed to add dependencies")
        sys.exit(1)
    
    print("Backend initialization complete!")

if __name__ == "__main__":
    create_backend_structure()
