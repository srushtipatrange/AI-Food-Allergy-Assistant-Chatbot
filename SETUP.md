# Food Allergy Assistant - Setup Guide

## Overview
A modern, AI-powered chatbot that helps users safely identify allergens in foods using voice input, text input, and real-time allergen detection.

## Features
- 🎤 **Voice Input**: Speak ingredients naturally and let the AI transcribe them
- 📝 **Text Input**: Type or paste ingredient lists
- ⚠️ **Real-time Allergen Detection**: Instant safety alerts for selected allergies
- 💾 **Session Storage**: Your allergy profile is saved locally in the browser
- 🎨 **Modern UI**: Beautiful gradient design with responsive layout
- 🚀 **Fast Processing**: Instant allergen matching against common food allergens

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: TailwindCSS v4
- **Speech Recognition**: Web Speech API
- **State Management**: React Hooks + localStorage

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **API**: RESTful endpoints for food checking and chat
- **Data Source**: Built-in allergen database (expandable to USDA FoodData Central API)

## Setup Instructions

### 1. Frontend Setup (Next.js)

```bash
# Install dependencies (automatically done if using v0)
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:3000`

### 2. Backend Setup (Python FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
# or
uvicorn app:app --reload
```

The backend will run on `http://localhost:8000`

### 3. API Documentation

Once the backend is running, view the interactive API docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Key Endpoints

### Frontend Routes
- `/` - Main chat interface with voice and text input

### Backend API Routes
- `GET /` - Health check
- `POST /api/check-food` - Check ingredients for allergens
- `POST /api/chat` - Chat with the AI assistant
- `GET /api/common-allergens` - Get list of common allergens

### Request/Response Examples

**Check Food Request:**
```json
{
  "ingredients": "milk, wheat, eggs",
  "user_allergies": ["milk", "peanut"]
}
```

**Check Food Response:**
```json
{
  "overall_risk": "danger",
  "results": [
    {
      "ingredient": "milk",
      "allergens": ["milk"],
      "risk_level": "danger",
      "details": "Found 1 allergen(s)"
    }
  ],
  "message": "⚠️ DANGER: This food contains milk. Please avoid this product!"
}
```

## Supported Allergens

The system currently supports checking for:
- Peanut
- Tree Nuts
- Milk
- Egg
- Fish
- Shellfish
- Soy
- Wheat
- Sesame
- Mustard
- Celery

Custom allergens can be added through the UI.

## Browser Compatibility

### Voice Input Support
- ✅ Chrome/Edge 25+
- ✅ Firefox 25+
- ✅ Safari 14.1+
- ⚠️ Fallback to text input on unsupported browsers

## Environment Variables (Optional)

Create a `.env.local` file in the backend directory:
```
USDA_API_KEY=your_api_key_here
```

(Currently, the system uses a built-in allergen database. API integration is prepared for future expansion.)

## Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect repo to Vercel
3. Add environment variables if needed
4. Deploy!

### Deploy Backend Separately
The Python backend can be deployed to:
- **Heroku**: Use Procfile configuration
- **Railway**: Auto-detects Python projects
- **PythonAnywhere**: Python hosting platform
- **AWS Lambda**: With serverless framework

## Future Enhancements

- [ ] USDA FoodData Central API integration for real-time food database
- [ ] User accounts with allergy history
- [ ] Food image scanning with OCR
- [ ] Nutrition facts integration
- [ ] Restaurant menu checking
- [ ] Mobile app with barcode scanning
- [ ] Multi-language support
- [ ] Advanced allergy severity levels

## Troubleshooting

**Issue**: Voice input not working
- **Solution**: Check browser compatibility. Use text input as fallback.

**Issue**: Backend connection error
- **Solution**: Ensure FastAPI server is running on port 8000. Check CORS settings.

**Issue**: Styling looks broken
- **Solution**: Clear browser cache and rebuild frontend with `npm run build`

## License
MIT License - Feel free to use this project for personal or commercial purposes.

## Support
For issues or questions, please refer to the documentation or create an issue in the repository.
