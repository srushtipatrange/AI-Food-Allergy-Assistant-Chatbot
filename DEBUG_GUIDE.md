# Food Allergy Assistant - Debug Guide

## Event Handler Fixes Implemented

### 1. Input Method Selection Flow

**Problem**: User clicks input method button → no chatbot response triggered

**Fix Applied**:
- Added console logs to track when buttons are clicked
- Wrapped `handleInputMethodSelect` to:
  - Add user message showing selected method
  - Add appropriate assistant response immediately
  - Set stage to 'chatting'
  - Show modals with small delay (300ms) for barcode/OCR

**Test**: Open browser DevTools (F12) → Console tab → Click a button → Should see:
```
[v0] Voice button clicked
[v0] Input method selected: voice
```

### 2. Text Input Handler

**Problem**: Text submission doesn't show feedback

**Fix Applied**:
- Added console log when text is submitted
- Shows "Analyzing ingredients..." message during loading
- Button changes to "Checking..." when loading
- Clear feedback on what's happening

**Test**: 
1. Select "Text" input
2. Type "milk, eggs" 
3. Hit Enter or click "Check"
4. Should see spinner + "Analyzing ingredients..."

### 3. Barcode & OCR Error Handling

**Problem**: Failed operations show generic error

**Fix Applied**:
- Product not found → suggests alternatives
- Network error → provides fallback options
- Extraction failed → guides user to try different methods

**Test**: 
1. Try invalid barcode: "000000"
2. Should see: "Product not found in database..."
3. Try OCR with blank image
4. Should see: "No text could be extracted..."

### 4. Console Logging Strategy

All major events now log with `[v0]` prefix for easy tracking:

```javascript
[v0] Voice button clicked
[v0] Input method selected: voice
[v0] Food check initiated with ingredients: milk, eggs
[v0] Starting food check with ingredients: milk, eggs
[v0] Food check response received: {...}
[v0] Barcode scanned: 123456789
[v0] Barcode check response: {...}
[v0] OCR extraction complete, text length: 245
[v0] OCR check response: {...}
```

## Debugging Steps

### Step 1: Check Console for Errors
```bash
1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to "Console" tab
3. Look for any red errors
4. Look for [v0] logs showing execution flow
```

### Step 2: Verify Event Handlers are Connected
```javascript
// In console, test if handlers work:
// Select an input method and check console for logs
// Expected: [v0] Voice button clicked → [v0] Input method selected: voice
```

### Step 3: Test Each Input Method

#### Voice Input
```
Expected Flow:
1. Click "🎤 Voice" button
2. See user message: "🎤 Voice Input" in chat
3. See assistant response: "🎤 Great! I'm ready to listen..."
4. Click "🎤 Start Speaking" button
5. Speak ingredients
6. See [v0] Food check initiated log
7. See analysis result with allergen warnings
```

#### Text Input
```
Expected Flow:
1. Click "⌨️ Text" button
2. See user message: "⌨️ Text Input" in chat
3. See assistant response: "⌨️ Perfect! Type the ingredients..."
4. Type "milk, eggs, wheat"
5. Press Enter or click "Check"
6. See "Analyzing ingredients..." message
7. See analysis result
```

#### Barcode Input
```
Expected Flow:
1. Click "📷 Barcode" button
2. See user message: "📷 Scan Barcode"
3. Modal opens with scanner
4. Enter barcode manually (e.g., 5449000064812 for Coca-Cola)
5. See "[v0] Barcode scanned:" in console
6. Product data loads or "not found" message
7. Allergen analysis displays
```

#### Image OCR Input
```
Expected Flow:
1. Click "🖼️ Image" button
2. See user message: "🖼️ Upload Image"
3. Modal opens with upload area
4. Upload food label image
5. Click "Extract Text"
6. See "[v0] OCR extraction complete" in console
7. Review/edit extracted text
8. Click "Confirm & Check"
9. See allergen analysis
```

### Step 4: Check API Responses

If data doesn't appear, check API calls:

```javascript
// In DevTools Network tab:
1. Go to Network tab
2. Perform an action (e.g., check food)
3. Look for API calls:
   - /api/conversational-check (text/voice)
   - /api/barcode-check (barcode)
   - /api/ocr-check (image)
4. Click each request
5. Check "Response" tab for data
```

### Step 5: Verify Backend Connection

```bash
# Check if Python backend is running:
1. Open terminal
2. cd backend
3. python app.py
4. Should see: "Uvicorn running on http://127.0.0.1:8000"
```

## Common Issues & Solutions

### Issue 1: Button click shows no response

**Symptoms**:
- Click input method button
- Chat doesn't update
- No console logs

**Solutions**:
1. Check browser console for errors (F12)
2. Verify `handleInputMethodSelect` is being called
3. Check if `addMessage` function works (test by clicking a stage button)
4. Ensure component is properly imported in page.tsx

### Issue 2: Barcode scanner doesn't open

**Symptoms**:
- Select Barcode option
- Scanner modal doesn't appear
- No errors in console

**Solutions**:
1. Check: `[v0] Input method selected: barcode` appears in console
2. Wait 300ms (delay was added for modal to render)
3. Check `showBarcodeScanner` state in React DevTools
4. Check browser permissions for camera access

### Issue 3: API calls fail with 404 or 500 errors

**Symptoms**:
- User action triggers but assistant shows error
- Network tab shows failed API calls

**Solutions**:
1. Verify backend is running: `python backend/app.py`
2. Check API endpoints exist:
   - POST /api/conversational-check
   - POST /api/barcode-check
   - POST /api/ocr-check
3. Check console for response errors
4. Verify allergies list is not empty

### Issue 4: Tesseract.js OCR takes too long or fails

**Symptoms**:
- Click "Extract Text"
- Spinning for >30 seconds
- "Failed to extract text" error

**Solutions**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Use a clearer, higher-quality image
3. Ensure image is at least 200x200 pixels
4. Try with different browser (Chrome/Edge preferred)
5. Check browser console for Tesseract.js errors

### Issue 5: Messages appear out of order or duplicated

**Symptoms**:
- User message appears twice
- Assistant response before user message
- Old messages from previous session

**Solutions**:
1. Hard refresh page (Ctrl+F5 on Windows, Cmd+Shift+R on Mac)
2. Clear browser cache
3. Check browser DevTools for console errors
4. Verify no duplicate `addMessage` calls

## Console Log Reference

| Log | Meaning | Expected Response |
|-----|---------|-------------------|
| `[v0] Voice button clicked` | User clicked voice button | Should see user message + assistant response |
| `[v0] Input method selected: voice` | Handler processed selection | Input area should change |
| `[v0] Food check initiated with` | User submitted food | Should see "Analyzing..." message |
| `[v0] Starting food check` | API call starting | Brief pause (1-2 seconds) |
| `[v0] Food check response received` | API returned data | Assistant message appears with analysis |
| `[v0] Barcode scanned` | Barcode successfully detected | Shows barcode in message |
| `[v0] Barcode check response` | Barcode API returned | Product data or "not found" message |
| `[v0] OCR extraction complete` | Text extracted from image | Shows extraction in message |
| `[v0] OCR check response` | OCR analysis returned | Shows allergen results |

## Testing Checklist

```
[ ] Allergy selection works
    [ ] Can select common allergens
    [ ] Can add custom allergens
    [ ] Can confirm selection

[ ] Input method selection works
    [ ] Voice button triggers response
    [ ] Text button triggers response
    [ ] Barcode button triggers response
    [ ] Image button triggers response

[ ] Voice input works
    [ ] Can start listening
    [ ] Can stop listening
    [ ] Transcript displays
    [ ] Can submit transcript

[ ] Text input works
    [ ] Can type ingredients
    [ ] Can submit via Enter
    [ ] Can submit via button
    [ ] Shows loading state

[ ] Barcode works
    [ ] Scanner modal opens
    [ ] Manual entry works
    [ ] API returns product or "not found"
    [ ] Shows allergen analysis

[ ] Image OCR works
    [ ] Upload modal opens
    [ ] Can select image
    [ ] Can extract text
    [ ] Can edit extracted text
    [ ] Shows allergen analysis

[ ] Error handling works
    [ ] API error shows helpful message
    [ ] Network error shows helpful message
    [ ] User can try alternative method
    [ ] No app crashes
```

## Performance Monitoring

Monitor these metrics to ensure good UX:

```
Voice Recognition: <2 seconds to start listening
Text Input: <1 second to submit
API Response: <3 seconds for text/barcode, <5 seconds for OCR
OCR Processing: <10 seconds for image
Modal Open: <300ms
```

## Need More Help?

1. Check console logs first (F12 → Console)
2. Verify backend is running
3. Clear cache and hard refresh
4. Try different browser
5. Check allergies are selected
6. Review this guide for your specific issue
