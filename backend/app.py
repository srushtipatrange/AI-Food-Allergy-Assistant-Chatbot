from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import aiohttp
import os
from typing import List, Dict, Optional
import json

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class UserAllergies(BaseModel):
    allergies: List[str]

class FoodCheckRequest(BaseModel):
    ingredients: str  # comma-separated ingredients or food items
    user_allergies: List[str]

class AllergenResult(BaseModel):
    ingredient: str
    allergens: List[str]
    risk_level: str  # "safe", "warning", "danger"
    details: Optional[str] = None

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ConversationalCheckRequest(BaseModel):
    """Request for conversational food checking with allergies"""
    food_name: str
    ingredients: str  # comma-separated or extracted from OCR/barcode
    user_allergies: List[str]
    input_source: str = "text"  # "text", "voice", "barcode", "ocr"
    message_history: Optional[List[Dict]] = None

class BarcodeProductRequest(BaseModel):
    """Request for barcode product lookup"""
    barcode: str
    user_allergies: List[str]

class OCRExtractionRequest(BaseModel):
    """Request for OCR extracted ingredients"""
    extracted_text: str
    user_allergies: List[str]
    image_source: str = "label"

# USDA FoodData Central API
USDA_API_KEY = os.getenv("USDA_API_KEY", "DEMO_KEY")
USDA_API_URL = "https://fdc.nal.usda.gov/api/food/search"

# Common allergen mappings
ALLERGEN_KEYWORDS = {
    "peanut": ["peanut", "arachis", "groundnut"],
    "tree nuts": ["almond", "walnut", "pecan", "cashew", "pistachio", "brazil nut", "macadamia"],
    "milk": ["milk", "dairy", "cheese", "butter", "yogurt", "cream", "lactose", "casein", "whey"],
    "egg": ["egg", "eggs", "albumin", "mayonnaise"],
    "fish": ["fish", "cod", "salmon", "tuna", "anchovies"],
    "shellfish": ["shellfish", "shrimp", "crab", "lobster", "oyster", "clam", "mussel", "scallop"],
    "soy": ["soy", "soybean", "soya", "edamame", "tofu"],
    "wheat": ["wheat", "flour", "bread", "pasta", "gluten", "barley", "rye"],
    "sesame": ["sesame", "tahini"],
    "mustard": ["mustard"],
    "celery": ["celery", "celeriac"],
}

async def check_allergens_in_text(text: str, user_allergies: List[str]) -> List[AllergenResult]:
    """Check if ingredients contain user's allergens"""
    results = []
    ingredients = [ing.strip().lower() for ing in text.split(",")]
    
    for ingredient in ingredients:
        allergens_found = []
        
        # Check against all known allergens
        for allergen, keywords in ALLERGEN_KEYWORDS.items():
            if allergen.lower() in user_allergies:
                for keyword in keywords:
                    if keyword.lower() in ingredient.lower():
                        allergens_found.append(allergen)
                        break
        
        # Determine risk level
        if allergens_found:
            risk_level = "danger" if len(allergens_found) > 0 else "warning"
        else:
            risk_level = "safe"
        
        results.append(AllergenResult(
            ingredient=ingredient,
            allergens=allergens_found,
            risk_level=risk_level,
            details=f"Found {len(allergens_found)} allergen(s)" if allergens_found else "No allergens detected"
        ))
    
    return results

@app.get("/")
async def root():
    return {"message": "Food Allergy Chatbot API", "version": "1.0.0"}

@app.post("/api/check-food")
async def check_food(request: FoodCheckRequest):
    """Check food ingredients against user allergies"""
    try:
        results = await check_allergens_in_text(request.ingredients, request.user_allergies)
        
        # Calculate overall risk
        overall_risk = "safe"
        has_danger = any(r.risk_level == "danger" for r in results)
        has_warning = any(r.risk_level == "warning" for r in results)
        
        if has_danger:
            overall_risk = "danger"
        elif has_warning:
            overall_risk = "warning"
        
        return {
            "overall_risk": overall_risk,
            "results": results,
            "message": get_ai_response(results, request.user_allergies)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(message: ChatMessage):
    """Process chat messages with AI-like responses"""
    user_input = message.content.lower()
    
    # Simulate AI responses for different queries
    if "allerg" in user_input:
        return {
            "role": "assistant",
            "content": "I can help you identify potential allergens in foods. You can speak or type the ingredients, and I'll check them against your allergy profile."
        }
    elif "safe" in user_input:
        return {
            "role": "assistant",
            "content": "Great! These ingredients appear to be safe for your allergies. However, always check product labels for cross-contamination warnings."
        }
    else:
        return {
            "role": "assistant",
            "content": "I'm here to help you check foods for allergens. Please tell me what ingredients you'd like to check or update your allergy profile."
        }

@app.post("/api/conversational-check")
async def conversational_check(request: ConversationalCheckRequest):
    """Conversational food checking with detailed response"""
    try:
        results = await check_allergens_in_text(request.ingredients, request.user_allergies)
        response = get_conversational_response(results, request.user_allergies, request.food_name)
        
        return {
            "status": "success",
            "food_name": request.food_name,
            "input_source": request.input_source,
            **response,
            "detailed_results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/barcode-lookup")
async def barcode_lookup(request: BarcodeProductRequest):
    """Lookup product by barcode using Open Food Facts API"""
    try:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            # Open Food Facts API endpoint
            url = f"https://world.openfoodfacts.org/api/v0/product/{request.barcode}.json"
            async with session.get(url) as resp:
                if resp.status == 200:
                    product_data = await resp.json()
                    if product_data.get("status") == 1:
                        product = product_data.get("product", {})
                        ingredients = product.get("ingredients_text", "")
                        food_name = product.get("product_name", "Unknown Product")
                        
                        if ingredients:
                            results = await check_allergens_in_text(ingredients, request.user_allergies)
                            response = get_conversational_response(results, request.user_allergies, food_name)
                            return {
                                "status": "success",
                                "found": True,
                                "product_name": food_name,
                                "barcode": request.barcode,
                                "ingredients": ingredients,
                                **response,
                                "detailed_results": results
                            }
        
        return {
            "status": "success",
            "found": False,
            "message": "Product not found in database. Please enter ingredients manually."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Barcode lookup failed: {str(e)}",
            "found": False
        }

@app.post("/api/ocr-check")
async def ocr_check(request: OCRExtractionRequest):
    """Check ingredients extracted from OCR"""
    try:
        results = await check_allergens_in_text(request.extracted_text, request.user_allergies)
        response = get_conversational_response(results, request.user_allergies, "the scanned product")
        
        return {
            "status": "success",
            "source": request.image_source,
            "extracted_ingredients": request.extracted_text,
            **response,
            "detailed_results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/common-allergens")
async def get_common_allergens():
    """Get list of common allergens"""
    return {
        "allergens": list(ALLERGEN_KEYWORDS.keys()),
        "description": "Common food allergens to track"
    }

@app.post("/api/conversational-message")
async def conversational_message(message: ChatMessage):
    """Process conversational messages for onboarding and guidance"""
    user_input = message.content.lower()
    
    # Conversational responses for different intents
    if any(word in user_input for word in ["hello", "hi", "start", "help"]):
        return {
            "role": "assistant",
            "content": "Hello! I'm your Food Allergy Assistant. I can help you check if foods are safe based on your allergies. Would you like to get started?"
        }
    elif any(word in user_input for word in ["allergies", "allergy", "allergic", "sensitive"]):
        return {
            "role": "assistant",
            "content": "I can help you manage your allergies. I support tracking common allergens like peanuts, milk, eggs, fish, shellfish, tree nuts, wheat, soy, and more. What allergies should I know about?"
        }
    elif any(word in user_input for word in ["check", "scan", "upload", "ingredients"]):
        return {
            "role": "assistant",
            "content": "Great! I can check ingredients in multiple ways: speak ingredients, type them, scan a barcode, or upload a food label image. Which method would you prefer?"
        }
    elif any(word in user_input for word in ["safe", "safe", "okay"]):
        return {
            "role": "assistant",
            "content": "That's great to hear! Remember to always check product labels, as manufacturers can change ingredients. Feel free to check more foods anytime."
        }
    else:
        return {
            "role": "assistant",
            "content": "I'm here to help you check foods for allergens. You can ask about checking a food, your allergies, or how to use different input methods (voice, barcode, image)."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
