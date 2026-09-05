# Quick Test Guide - Food Allergy Assistant

## 30-Second Test

1. **Start the app** - Open in browser
2. **Select allergy** - Click "milk"
3. **Confirm** - Click "Confirm & Continue"
4. **Choose input** - Click any button (Voice/Text/Barcode/Image)
5. **Check result**:
   - User message appears with emoji
   - Assistant responds immediately
   - Correct input method interface loads

✅ **Pass**: Messages appear in chat + appropriate interface shows
❌ **Fail**: Silent, no messages, nothing happens

---

## Voice Input Test (1 minute)

```
1. Select "milk" allergy
2. Confirm allergies
3. Click "🎤 Voice" button
   ✓ Should see: "🎤 Voice Input" (user message)
   ✓ Should see: "🎤 Great! I'm ready to listen..." (bot response)
   ✓ Input area changes to show voice controls
   
4. Click "🎤 Start Speaking"
   ✓ Button changes to red "Listening..." with spinner
   
5. Say: "milk and eggs"
   ✓ Should see recognized text below voice button
   
6. Click "Use" next to recognized text
   ✓ Should see "🎤 milk and eggs" (user message)
   ✓ Should see "Analyzing ingredients..." spinner
   ✓ Should see allergen analysis with "DANGER" warning
```

### Expected Output
```
User: 🎤 Voice Input
Bot: 🎤 Great! I'm ready to listen. Speak the ingredients...

User: 🎤 milk and eggs
Bot: ⚠️ DANGER: the food contains milk. I strongly recommend avoiding...
```

---

## Text Input Test (1 minute)

```
1. Select "peanuts" allergy
2. Confirm allergies
3. Click "⌨️ Text" button
   ✓ Should see: "⌨️ Text Input" (user message)
   ✓ Should see: "⌨️ Perfect! Type the ingredients..." (bot response)
   ✓ Input field appears below
   
4. Type: "chocolate, peanut butter, sugar"
5. Press Enter (or click "Check" button)
   ✓ Should see "⌨️ chocolate, peanut butter, sugar" (user message)
   ✓ Should see "Analyzing ingredients..." spinner
   ✓ Should see allergen analysis with "DANGER: peanuts"
```

### Expected Output
```
User: ⌨️ Text Input
Bot: ⌨️ Perfect! Type the ingredients...

User: ⌨️ chocolate, peanut butter, sugar
Bot: ⚠️ DANGER: the food contains peanuts...
    Suggestions:
    • Look for alternative products...
```

---

## Barcode Scanner Test (2 minutes)

```
1. Select "milk" allergy
2. Confirm allergies
3. Click "📷 Barcode" button
   ✓ Should see: "📷 Scan Barcode" (user message)
   ✓ Should see: "📷 Awesome! I'm opening..." (bot response)
   ✓ Modal dialog opens with scanner

4. In Modal:
   - Either: Click "Open Camera" (requires camera permission)
   - Or: Enter barcode manually
   
5. Test with manual barcode entry:
   a) Enter: "5449000064812" (Coca-Cola)
   b) Click "Check"
   ✓ Should see: "📷 Scanned barcode: 5449000064812"
   ✓ Should see: Allergen analysis from product database
   
6. Test with unknown barcode:
   a) Enter: "999999999999" (fake)
   b) Click "Check"
   ✓ Should see: "📊 This product wasn't found in our database..."
   ✓ Should see: "1. Try scanning another..."
```

### Expected Outputs

**Product Found**:
```
User: 📷 Scanned barcode: 5449000064812
Bot: ✓ SAFE: Coca-Cola appears to be safe for your allergies...
```

**Product Not Found**:
```
User: 📷 Scanned barcode: 999999999999
Bot: 📊 This product wasn't found. No problem! You can:
     1. Try scanning another...
     2. Enter the ingredients manually...
     3. Upload a photo of the label...
```

---

## Image OCR Test (3 minutes)

```
1. Select "wheat" allergy
2. Confirm allergies
3. Click "🖼️ Image" button
   ✓ Should see: "🖼️ Upload Image" (user message)
   ✓ Should see: "🖼️ Great! I'm opening..." (bot response)
   ✓ Modal dialog opens with upload area

4. Upload any food label image:
   - Click on dashed area or drag/drop image
   ✓ Image preview appears
   ✓ Blue message: "Image uploaded successfully..."
   ✓ Two buttons: "Extract Text" and "Change"
   
5. Click "Extract Text"
   ✓ Spinner appears: "Extracting..."
   ✓ Text area shows extracted text from label
   ✓ Can edit text if OCR made mistakes
   
6. Click "Confirm & Check"
   ✓ Should see: "🖼️ Uploaded image with ingredients: ..."
   ✓ Should see: "Analyzing ingredients..."
   ✓ Should see: Allergen analysis
```

### Expected Output
```
User: 🖼️ Upload Image
Bot: 🖼️ Great! I'm opening the image uploader...

User: 🖼️ Uploaded image with ingredients: flour, sugar, eggs...
Bot: ⚠️ WARNING: the food may contain ingredients related...
     Suggestions:
     • Always read the full product label...
```

---

## Error Handling Test (2 minutes)

### Test 1: API Failure
```
1. Set up network issue (DevTools → Network throttling → Offline)
2. Select allergy and confirm
3. Click "⌨️ Text"
4. Type "milk" and submit
5. Expected: Error message with 3 alternatives
   "⚠️ Something went wrong. Please try:
    • Re-entering the ingredients
    • Using a different input method
    • Checking again"
```

### Test 2: Empty OCR
```
1. Click "🖼️ Image"
2. Upload a blank/white image
3. Click "Extract Text"
4. Expected: Error before API call
   "⚠️ No text could be extracted..."
5. No "Confirm & Check" button appears
```

### Test 3: No Allerges Selected
```
1. Click "Yes, I have allergies"
2. DON'T select any allergen
3. Try to click "Confirm & Continue"
4. Expected: Assistant says
   "Please select at least one allergen..."
```

---

## Console Debugging Test

1. **Open DevTools**: F12 or Right-click → Inspect
2. **Go to Console tab**
3. **Perform actions and look for logs**:

```
When clicking "Voice" button:
[v0] Voice button clicked
[v0] Input method selected: voice

When typing text and submitting:
[v0] Text input submitted via Check button
[v0] Food check initiated with ingredients: milk, eggs
[v0] Starting food check with ingredients: milk, eggs
[v0] Food check response received: {risk_level: "danger"...}

When scanning barcode:
[v0] Barcode scanned: 5449000064812
[v0] Barcode check response: {found: true...}
```

✅ **Pass**: All [v0] logs appear in order
❌ **Fail**: No logs or different sequence

---

## Network Request Test

1. **Open DevTools**: F12
2. **Go to Network tab**
3. **Perform action** (e.g., submit text)
4. **Look for API requests**:

```
POST /api/conversational-check
  Status: 200 ✅ (not 404 or 500)
  Response: {risk_level: "danger", primary_message: "..."}

POST /api/barcode-check
  Status: 200 ✅
  Response: {found: true/false, ...}

POST /api/ocr-check
  Status: 200 ✅
  Response: {risk_level: "...", ...}
```

✅ **Pass**: All requests return 200 status
❌ **Fail**: 404, 500, or timeout errors

---

## Checklist for Complete Testing

```
[ ] Voice Input
  [ ] Button click shows messages
  [ ] Can start listening
  [ ] Transcript displays
  [ ] Results show allergen analysis
  [ ] [v0] logs appear in console

[ ] Text Input
  [ ] Button click shows messages
  [ ] Can type ingredients
  [ ] Shows "Analyzing..." message
  [ ] Results show allergen analysis
  [ ] [v0] logs appear in console

[ ] Barcode Input
  [ ] Button click shows messages
  [ ] Scanner modal opens
  [ ] Manual entry works
  [ ] Found: Shows product analysis
  [ ] Not found: Shows alternatives
  [ ] [v0] logs appear in console

[ ] Image OCR Input
  [ ] Button click shows messages
  [ ] Upload modal opens
  [ ] Can select/drag image
  [ ] Extract text works
  [ ] Can edit extracted text
  [ ] Results show allergen analysis
  [ ] [v0] logs appear in console

[ ] Error Handling
  [ ] API error shows alternatives
  [ ] Empty OCR prevents API call
  [ ] Network error has helpful message
  [ ] No app crashes

[ ] Console Logs
  [ ] [v0] logs appear for each action
  [ ] Logs show correct values
  [ ] No error messages in console

[ ] Network Requests
  [ ] All API calls return 200
  [ ] Response data has expected fields
  [ ] No 404 or 500 errors
```

---

## Troubleshooting

### "Nothing happens when I click button"
1. Open DevTools (F12)
2. Check Console tab for errors
3. Look for [v0] logs
4. If no logs: handler not connected
5. Try hard refresh (Ctrl+F5)

### "Modal doesn't open"
1. Wait 300ms and try again
2. Check DevTools for React errors
3. Verify no browser errors in console
4. Try different browser

### "API call fails with 500 error"
1. Check backend is running: `python backend/app.py`
2. Check console for Python errors
3. Verify selected allergens are not empty
4. Try different ingredients

### "OCR takes too long"
1. Use clearer, well-lit image
2. Image should be at least 200x200 pixels
3. Try smaller image (faster processing)
4. Check browser console for errors
5. May take 10-30 seconds first time (downloads library)

---

## Success Criteria

### User Action → Bot Response
✅ Click button → See user message + bot response  
✅ Submit food → See "Analyzing..." + results  
✅ API error → See helpful message + alternatives  
✅ Invalid input → See guidance without crash

### Console Output
✅ [v0] logs appear for each action  
✅ Log messages match actual flow  
✅ No error logs in console  
✅ No uncaught exceptions

### Network
✅ All API requests complete  
✅ Status 200 OK (not 404/500)  
✅ Response has expected data  
✅ No network timeouts

---

## Quick Fixes If Tests Fail

| Issue | Quick Fix |
|-------|-----------|
| No response after button click | Hard refresh (Ctrl+F5) + clear cache |
| Modal doesn't open | Wait 300ms + try again |
| API error 404 | Check backend running: `python backend/app.py` |
| API error 500 | Select allerges before testing |
| No console logs | Check component imported in page.tsx |
| Tesseract slow | Use better quality image, smaller size |
| Voice not working | Check browser/tab permissions |

---

## Next: Full Debug Guide

For more detailed debugging, see: **DEBUG_GUIDE.md**

For complete list of fixes, see: **FIXES_APPLIED.md**
