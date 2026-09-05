'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { BarcodeScanner } from './BarcodeScanner';
import { ImageOCR } from './ImageOCR';
import VoiceInput from './VoiceInput';

type ConversationStage = 'welcome' | 'select-allergies' | 'confirm-allergies' | 'choose-input' | 'chatting';
type InputMethod = 'voice' | 'text' | 'barcode' | 'image-ocr' | null;

const COMMON_ALLERGENS = [
  'peanuts',
  'tree nuts',
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'soy',
  'wheat',
  'sesame',
  'mustard',
  'celery',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

let messageCounter = 0;

export default function ConversationalChat() {
  const [stage, setStage] = useState<ConversationStage>('welcome');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [inputMethod, setInputMethod] = useState<InputMethod>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showImageOCR, setShowImageOCR] = useState(false);
  const [customAllergy, setCustomAllergy] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    addMessage(
      'assistant',
      "Hello! I'm your Food Allergy Assistant. I'll help you check foods for allergens. Let's start by setting up your allergy profile. Do you have any food allergies?"
    );
  }, []);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${++messageCounter}`,
      role,
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleAllergyToggle = (allergen: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.toLowerCase())) {
      setSelectedAllergies((prev) => [...prev, customAllergy.toLowerCase()]);
      setCustomAllergy('');
    }
  };

  const handleConfirmAllergies = () => {
    if (selectedAllergies.length === 0) {
      addMessage('assistant', 'Please select at least one allergen to continue, or let me know if you have no allergies.');
      return;
    }

    addMessage('user', `My allergies: ${selectedAllergies.join(', ')}`);
    addMessage(
      'assistant',
      `Perfect! I've noted your allergies: ${selectedAllergies.join(', ')}. Now, how would you like to check foods for allergens? You can:\n\n• Speak ingredients aloud\n• Type ingredients manually\n• Scan a product barcode\n• Upload a food label image`
    );
    setStage('choose-input');
  };

  const handleInputMethodSelect = (method: InputMethod) => {
    console.log('[v0] Input method selected:', method);
    
    // Add user message for selection
    const methodLabels: Record<'voice' | 'text' | 'barcode' | 'image-ocr', string> = {
      voice: '🎤 Voice Input',
      text: '⌨️ Text Input',
      barcode: '📷 Scan Barcode',
      'image-ocr': '🖼️ Upload Image',
    };
    
    if (method && method in methodLabels) {
      addMessage('user', methodLabels[method as 'voice' | 'text' | 'barcode' | 'image-ocr']);
    }
    
    // Set input method and stage
    setInputMethod(method);
    setStage('chatting');

    // Add appropriate assistant response
    if (method === 'voice') {
      addMessage('assistant', '🎤 Great! I\'m ready to listen. Speak the ingredients you want to check (e.g., "milk, eggs, wheat") and I\'ll analyze them for allergens.');
    } else if (method === 'text') {
      addMessage('assistant', '⌨️ Perfect! Type the ingredients separated by commas (e.g., "milk, eggs, wheat") and I\'ll check them for you.');
    } else if (method === 'barcode') {
      addMessage('assistant', '📷 Awesome! I\'m opening the barcode scanner. Point your camera at a product barcode to look it up in the database.');
      // Small delay to ensure UI updates before modal opens
      setTimeout(() => setShowBarcodeScanner(true), 300);
    } else if (method === 'image-ocr') {
      addMessage('assistant', '🖼️ Great! I\'m opening the image uploader. Upload a clear photo of the food label and I\'ll extract the ingredients automatically.');
      // Small delay to ensure UI updates before modal opens
      setTimeout(() => setShowImageOCR(true), 300);
    }
  };

  const handleVoiceCheck = async (ingredients: string) => {
    if (!ingredients.trim()) {
      console.log('[v0] Empty ingredients provided');
      return;
    }

    console.log('[v0] Food check initiated with ingredients:', ingredients);
    const label = inputMethod === 'voice' ? '🎤' : '⌨️';
    addMessage('user', `${label} ${ingredients}`);
    await checkFood(ingredients);
  };

  const handleBarcodeSuccess = async (barcode: string) => {
    console.log('[v0] Barcode scanned:', barcode);
    addMessage('user', `📷 Scanned barcode: ${barcode}`);
    setShowBarcodeScanner(false);

    setIsLoading(true);
    try {
      console.log('[v0] Calling API: /api/barcode-check');
      const response = await fetch('/api/barcode-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode,
          user_allergies: selectedAllergies,
        }),
      });

      console.log('[v0] Barcode API response status:', response.status);
      const data = await response.json();
      console.log('[v0] Barcode check response:', data);
      
      if (data.error) {
        console.log('[v0] Barcode API returned error');
        throw new Error(data.error);
      }

      if (data.found === false) {
        addMessage('assistant', '📊 This product wasn\'t found in our database. No problem! You can:\n\n1. Try scanning another product barcode\n2. Enter the ingredients manually\n3. Upload a photo of the label\n\nWhich would you prefer?');
      } else if (data.found === true && data.extracted_ingredients) {
        // Product found, analyze ingredients
        console.log('[v0] Product found, analyzing ingredients:', data.extracted_ingredients);
        const analysis = analyzeIngredients(data.extracted_ingredients, selectedAllergies);
        addMessage('assistant', `📦 Product: ${data.product_name || 'Unknown'}\n\n${analysis.message}`);
      } else {
        addMessage('assistant', formatResponse(data));
      }
    } catch (error) {
      console.error('[v0] Barcode check error:', error);
      addMessage('assistant', '⚠️ Unable to look up this barcode. Your options:\n\n1. Try entering ingredients manually\n2. Upload a photo of the label\n3. Try scanning a different barcode\n\nWhich would you prefer?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOCRComplete = async (extractedText: string) => {
    console.log('[v0] OCR extraction complete, text length:', extractedText.length);
    
    if (!extractedText.trim() || extractedText.length < 3) {
      console.log('[v0] OCR text validation failed');
      addMessage('assistant', '⚠️ No readable text could be extracted from the image. Please try:\n\n• Using a clearer, well-lit photo\n• Making sure all text is visible\n• Uploading another image\n• Entering ingredients manually\n\nWhat would you like to do?');
      setShowImageOCR(false);
      return;
    }

    addMessage('user', `🖼️ Image analysis: ${extractedText.substring(0, 50)}${extractedText.length > 50 ? '...' : ''}`);
    setShowImageOCR(false);

    setIsLoading(true);
    try {
      console.log('[v0] Calling API: /api/ocr-check');
      const response = await fetch('/api/ocr-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extracted_text: extractedText,
          user_allergies: selectedAllergies,
          image_source: 'label',
        }),
      });

      console.log('[v0] OCR API response status:', response.status);
      const data = await response.json();
      console.log('[v0] OCR check response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      addMessage('assistant', formatResponse(data));
    } catch (error) {
      console.error('[v0] OCR check error, using fallback:', error);
      // Check if we have a detection message from the hybrid analysis
      const detectionMessage = (window as any).__detectionMessage;
      if (detectionMessage) {
        console.log('[v0] Using hybrid analysis result');
        addMessage('assistant', detectionMessage);
        delete (window as any).__detectionMessage;
        delete (window as any).__detectionMethod;
      } else {
        // Fallback: Use local analysis on extracted text
        const analysis = analyzeIngredients(extractedText, selectedAllergies);
        addMessage('assistant', analysis.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Comprehensive allergen keyword mapping
  const allergenKeywords: Record<string, string[]> = {
    'peanuts': ['peanut', 'arachis', 'groundnut', 'monkey nut', 'earth nut'],
    'tree nuts': ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'brazil nut', 'chestnut', 'pine nut', 'tree nut'],
    'milk': ['milk', 'lactose', 'casein', 'whey', 'butter', 'cheese', 'cream', 'yogurt', 'dairy', 'ghee', 'lactalbumin', 'lactoglobulin'],
    'eggs': ['egg', 'albumin', 'mayonnaise', 'meringue', 'ovalbumin', 'ovomucin', 'ovomucoid', 'ovovitellin'],
    'fish': ['fish', 'anchovy', 'cod', 'salmon', 'tuna', 'trout', 'halibut', 'flounder', 'sea bass', 'tilapia', 'seafood', 'shellfish'],
    'shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'oyster', 'clam', 'mussel', 'scallop', 'squid', 'octopus', 'crustacean'],
    'soy': ['soy', 'soybean', 'edamame', 'tofu', 'tempeh', 'miso', 'soy sauce', 'shoyu', 'teriyaki'],
    'wheat': ['wheat', 'flour', 'bread', 'pasta', 'cereal', 'barley', 'rye', 'oat', 'gluten', 'bulgur', 'couscous', 'semolina', 'spelt'],
    'sesame': ['sesame', 'tahini', 'halva', 'hummus'],
    'mustard': ['mustard', 'mustard seed'],
    'celery': ['celery', 'celeriac'],
  };

  // Core allergen detection function with improved matching
  const analyzeIngredients = (ingredients: string, allergies: string[]): { riskLevel: string; message: string; allergenFound: string[] } => {
    console.log('[v0] Analyzing ingredients:', ingredients, 'against allergies:', allergies);
    
    // Clean and normalize ingredients
    const ingredientList = ingredients
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 2) // Filter out garbage like "qpad"
      .filter((item) => !/^[a-z]$/.test(item)); // Filter single letters

    console.log('[v0] Parsed ingredients:', ingredientList);

    const foundAllergens: string[] = [];

    // Check each ingredient against user allergies using keyword dictionary
    for (const ingredient of ingredientList) {
      for (const allergen of allergies) {
        const allergenLower = allergen.toLowerCase();
        const keywords = allergenKeywords[allergenLower] || [allergenLower];

        // Check if ingredient matches any keyword for this allergen
        for (const keyword of keywords) {
          if (ingredient.includes(keyword) || keyword.includes(ingredient)) {
            if (!foundAllergens.includes(allergen)) {
              foundAllergens.push(allergen);
              console.log('[v0] Found allergen match:', allergen, 'via keyword:', keyword);
            }
            break;
          }
        }
      }
    }

    // Remove duplicates
    const uniqueAllergens = [...new Set(foundAllergens)];
    console.log('[v0] Unique allergens found:', uniqueAllergens);

    let riskLevel = 'safe';
    let message = '';

    if (uniqueAllergens.length > 0) {
      riskLevel = 'danger';
      message = `⚠️ HIGH RISK - ALLERGEN DETECTED!\n\nI found the following allergens:\n${uniqueAllergens.map((a) => `• ${a}`).join('\n')}\n\n⛔ DO NOT CONSUME\n\nI recommend avoiding this product. Always check the label for cross-contamination warnings.`;
    } else {
      riskLevel = 'safe';
      message = `✅ SAFE!\n\nBased on your allergies (${allergies.join(', ')}), these ingredients appear safe:\n${ingredientList.slice(0, 5).map((i) => `• ${i}`).join('\n')}${ingredientList.length > 5 ? '\n• ...' : ''}\n\n✓ This product appears safe for you. Always verify the label.`;
    }

    return { riskLevel, message, allergenFound: uniqueAllergens };
  };

  const checkFood = async (ingredients: string) => {
    console.log('[v0] Starting food check with ingredients:', ingredients);
    if (!ingredients.trim()) {
      console.log('[v0] Empty ingredients, skipping check');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[v0] Calling API: /api/conversational-check');
      const response = await fetch('/api/conversational-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: 'the food',
          ingredients,
          user_allergies: selectedAllergies,
          input_source: inputMethod || 'text',
        }),
      });

      console.log('[v0] API response status:', response.status);

      if (!response.ok) {
        console.log('[v0] API returned error status, using fallback analysis');
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[v0] API response data:', data);

      // Check if we got a valid response
      if (data.error || !data.primary_message) {
        console.log('[v0] Invalid API response, using fallback analysis');
        throw new Error('Invalid response format');
      }

      addMessage('assistant', formatResponse(data));
    } catch (error) {
      console.error('[v0] API check failed, using fallback local analysis:', error);
      // Fallback: Use local analysis
      const analysis = analyzeIngredients(ingredients, selectedAllergies);
      console.log('[v0] Fallback analysis result:', analysis);
      addMessage('assistant', analysis.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatResponse = (data: any): string => {
    // Handle different response formats
    if (!data) {
      return 'Unable to analyze. Please try again.';
    }

    // If it's a simple text response
    if (typeof data === 'string') {
      return data;
    }

    // Handle new conversational format
    if (data.primary_message) {
      let response = data.primary_message || '';

      if (data.details && Array.isArray(data.details) && data.details.length > 0) {
        response += '\n\n' + data.details.join('\n');
      }

      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        response += '\n\nRecommendations:\n' + data.suggestions.map((s: string) => `• ${s}`).join('\n');
      }

      return response;
    }

    // Fallback
    return JSON.stringify(data, null, 2);
  };

  const handleSkipAllergies = () => {
    addMessage('user', 'I don\'t have any allergies or prefer not to track them');
    addMessage(
      'assistant',
      'Understood! I can still help you check food information. How would you like to provide ingredients?'
    );
    setStage('choose-input');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Food Allergy Assistant</h1>
        <p className="text-blue-100">Check ingredients for allergens</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2">
              <Spinner className="size-4" />
              <span className="text-sm">Analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        {stage === 'welcome' && (
          <div className="space-y-3">
            <Button
              onClick={() => setStage('select-allergies')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Yes, I have allergies
            </Button>
            <Button
              onClick={handleSkipAllergies}
              variant="outline"
              className="w-full"
            >
              No allergies / Skip
            </Button>
          </div>
        )}

        {stage === 'select-allergies' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {COMMON_ALLERGENS.map((allergen) => (
                <button
                  key={allergen}
                  onClick={() => handleAllergyToggle(allergen)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedAllergies.includes(allergen)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                placeholder="Add custom allergy"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAllergy()}
              />
              <Button
                onClick={handleAddCustomAllergy}
                variant="outline"
              >
                Add
              </Button>
            </div>

            {selectedAllergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedAllergies.map((allergen) => (
                  <span
                    key={allergen}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            )}

            <Button
              onClick={handleConfirmAllergies}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={selectedAllergies.length === 0}
            >
              Confirm & Continue
            </Button>
          </div>
        )}

        {stage === 'choose-input' && inputMethod === null && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">Choose your input method:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  console.log('[v0] Voice button clicked');
                  handleInputMethodSelect('voice');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-5 flex items-center justify-center gap-2"
              >
                <span className="text-lg">🎤</span>
                <span>Voice</span>
              </Button>
              <Button
                onClick={() => {
                  console.log('[v0] Text button clicked');
                  handleInputMethodSelect('text');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 flex items-center justify-center gap-2"
              >
                <span className="text-lg">⌨️</span>
                <span>Text</span>
              </Button>
              <Button
                onClick={() => {
                  console.log('[v0] Barcode button clicked');
                  handleInputMethodSelect('barcode');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-5 flex items-center justify-center gap-2"
              >
                <span className="text-lg">📷</span>
                <span>Barcode</span>
              </Button>
              <Button
                onClick={() => {
                  console.log('[v0] Image button clicked');
                  handleInputMethodSelect('image-ocr');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 flex items-center justify-center gap-2"
              >
                <span className="text-lg">🖼️</span>
                <span>Image</span>
              </Button>
            </div>
          </div>
        )}

        {stage === 'chatting' && inputMethod === 'voice' && (
          <VoiceInput
            onFoodCheck={handleVoiceCheck}
            selectedAllergies={selectedAllergies}
            disabled={isLoading}
          />
        )}

        {stage === 'chatting' && inputMethod === 'text' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                ref={textInputRef}
                placeholder="milk, eggs, wheat, peanuts..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && textInputRef.current?.value.trim()) {
                    console.log('[v0] Text input submitted via Enter key');
                    handleVoiceCheck(textInputRef.current.value);
                    if (textInputRef.current) {
                      textInputRef.current.value = '';
                      textInputRef.current.focus();
                    }
                  }
                }}
                disabled={isLoading}
                className="flex-1 border-2 border-blue-200 focus:border-blue-500"
              />
              <Button
                onClick={() => {
                  if (textInputRef.current?.value.trim()) {
                    console.log('[v0] Text input submitted via Check button');
                    handleVoiceCheck(textInputRef.current.value);
                    if (textInputRef.current) {
                      textInputRef.current.value = '';
                      textInputRef.current.focus();
                    }
                  }
                }}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
              >
                {isLoading ? 'Checking...' : 'Check'}
              </Button>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Spinner className="size-4" />
                <span>Analyzing ingredients...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onScanSuccess={handleBarcodeSuccess}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* Image OCR Modal */}
      {showImageOCR && (
        <ImageOCR
          onOCRComplete={handleOCRComplete}
          userAllergies={selectedAllergies}
          onClose={() => setShowImageOCR(false)}
        />
      )}
    </div>
  );
}
