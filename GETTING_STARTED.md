# Getting Started - Complete Implementation

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
pnpm install

# Backend dependencies (if not already installed)
cd backend
pip install -r requirements.txt
cd ..
```

### Step 2: Start the Services

**Terminal 1 - Frontend:**
```bash
pnpm dev
```

**Terminal 2 - Backend:**
```bash
cd backend
python -m uvicorn app:app --reload
```

### Step 3: Test in Browser
1. Open http://localhost:3000
2. Open DevTools (F12) → Console
3. Select "milk" allergy
4. Click "⌨️ Text"
5. Type "milk, eggs"
6. Press Enter
7. See warning about milk
8. Check console for [v0] logs

✅ **If you see all this, everything is working!**

---

## 📋 Complete Feature Testing

### 1. Voice Input Test (2 minutes)

**Setup:**
- Click "Yes, I have allergies"
- Click "milk" allergy
- Click "Confirm & Continue"

**Test:**
- Click "🎤 Voice" button
- Click "Start Speaking"
- Say clearly: "milk and eggs"
- Wait for transcript to appear
- Click "Use"

**Expected Results:**
- Listening indicator shown
- Transcript displayed in real-time
- Analyzed automatically
- Warning about milk allergen
- [v0] logs in console

---

### 2. Text Input Test (1 minute)

**Setup:**
- Select allergy: "eggs"
- Click "Confirm & Continue"

**Test:**
- Click "⌨️ Text"
- Type: "wheat, eggs, sugar"
- Press Enter

**Expected Results:**
- Input appears in chat
- "Analyzing..." spinner shown
- Results appear
- Eggs highlighted as allergen
- [v0] logs in console

---

### 3. Image OCR Test (3 minutes)

**Setup:**
- Select allergy: "milk"
- Click "Confirm & Continue"

**Test:**
- Click "🖼️ Image"
- Click "Click to upload" or drag image
- Use any food label photo
- Click "Extract Text"
- Wait for progress (first time: ~10 seconds)
- Review extracted text
- Click "Confirm & Check"

**Expected Results:**
- Image previewed
- Progress bar shown
- Text extracted
- Text editable
- Analyzed for allergens
- [v0] logs throughout

---

### 4. Barcode Scanner Test (2 minutes)

**Setup:**
- Select allergy: "peanuts"
- Click "Confirm & Continue"

**Test Option A (with barcode):**
- Click "📷 Barcode"
- Click "Open Camera"
- Point at product barcode
- Wait for detection

**Test Option B (without barcode):**
- Click "📷 Barcode"
- Type barcode: `5449000064812` (Coca-Cola)
- Click "Check Barcode"

**Expected Results:**
- Camera opens (Option A)
- Product found in database
- Ingredients displayed
- Analyzed for allergens
- [v0] logs in console

---

## 🔍 Debugging with Console Logs

### Important Log Messages

**Voice Input:**
```
[v0] Voice button clicked
[v0] Voice recognition started
[v0] Transcript: milk and eggs
[v0] Submitting voice input: milk and eggs
```

**Text Input:**
```
[v0] Text button clicked
[v0] Text input submitted
[v0] Food check initiated with ingredients: milk and eggs
```

**Image OCR:**
```
[v0] Image button clicked
[v0] Starting OCR processing
[v0] OCR Progress: 25% ... 50% ... 100%
[v0] OCR complete, extracted text length: 245
```

**Barcode:**
```
[v0] Barcode button clicked
[v0] Barcode scanned: 5449000064812
[v0] Barcode check response: {found: true...}
```

**Food Check:**
```
[v0] Food check initiated with ingredients: milk
[v0] Starting food check
[v0] Food check response received: {risk_level: "danger"...}
```

---

## ⚠️ Troubleshooting

### Issue: "Something went wrong while checking the food"

**Causes:**
1. Backend not running
2. API route misconfigured
3. Network error

**Solutions:**
1. Check backend is running: `python -m uvicorn app:app --reload`
2. Check BACKEND_URL in API routes (default: `http://localhost:8000`)
3. Check browser console for [v0] error logs
4. Check Network tab (F12) for failed requests

---

### Issue: Voice Input Not Working

**Causes:**
1. Browser doesn't support Speech Recognition
2. Microphone not permitted
3. Microphone not available

**Solutions:**
1. Use Chrome, Firefox, or Edge (Safari has limited support)
2. Allow microphone: Browser → Settings → Permissions
3. Check microphone is connected and working
4. Use text input as fallback

---

### Issue: OCR Extraction Failing

**Causes:**
1. Image too blurry
2. Text too small
3. Tesseract.js not loaded

**Solutions:**
1. Use clearer, well-lit image
2. Zoom in on label before uploading
3. Wait for Tesseract worker to load (first time: ~10 seconds)
4. Try smaller image file size
5. Check [v0] logs for specific error

---

### Issue: Barcode Scanner Not Working

**Causes:**
1. Camera permission denied
2. QuaggaJS not loaded
3. Barcode in wrong format

**Solutions:**
1. Allow camera: Browser → Settings → Permissions
2. Use manual barcode entry
3. Try different barcode (should be 12-13 digits)
4. Try scanning different angle
5. Ensure good lighting

---

## 📁 Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── page.tsx (main app)
│   ├── layout.tsx (layout)
│   └── api/
│       ├── conversational-check/
│       ├── barcode-check/
│       ├── ocr-check/
│       └── check-food/
├── components/
│   ├── ConversationalChat.tsx (main component)
│   ├── VoiceInput.tsx (voice recognition)
│   ├── ImageOCR.tsx (OCR processing)
│   └── BarcodeScanner.tsx (barcode scanning)
├── backend/
│   ├── app.py (FastAPI server)
│   └── requirements.txt
├── GETTING_STARTED.md (this file)
├── TESTING_CHECKLIST.md (test procedures)
├── ALL_FIXES_COMPLETE.md (what was fixed)
└── COMPLETE_IMPLEMENTATION_SUMMARY.txt (detailed summary)
```

---

## 🌐 Deployment

### Deploy Frontend to Vercel

```bash
# Build the project
pnpm build

# Deploy to Vercel
npx vercel
```

### Deploy Backend to Heroku/Railway

```bash
# Option 1: Heroku
heroku create
git push heroku main

# Option 2: Railway
railway up
```

### Configure Environment

Set `BACKEND_URL` in Vercel environment variables:
```
BACKEND_URL=https://your-backend-url.com
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Frontend running on http://localhost:3000
- [ ] Backend running on http://localhost:8000
- [ ] Can select allergies
- [ ] Text input works and returns results
- [ ] Voice input works (browser supports it)
- [ ] Image upload shows progress
- [ ] OCR extracts text from image
- [ ] Barcode scanner (or manual) returns products
- [ ] Console shows [v0] logs
- [ ] Error messages are helpful

If all checked ✅, you're ready to go!

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| GETTING_STARTED.md | This file - quick start guide |
| TESTING_CHECKLIST.md | Complete testing procedures |
| ALL_FIXES_COMPLETE.md | What was fixed and how |
| COMPLETE_IMPLEMENTATION_SUMMARY.txt | Detailed technical summary |
| DEBUG_GUIDE.md | Debugging procedures |
| QUICK_TEST.md | 5-minute quick test |

---

## 🚨 Quick Help

**Everything broken?**
1. Stop both services (Ctrl+C)
2. Clear node_modules: `rm -rf node_modules && pnpm install`
3. Restart both services
4. Check console logs: F12 → Console tab

**Backend not responding?**
1. Check it's running: `lsof -i :8000`
2. Restart: `python -m uvicorn app:app --reload`
3. Check logs for errors

**API routes giving 404?**
1. Check URL path is correct
2. Verify API files exist
3. Restart frontend

---

## 🎉 Success!

If you can:
1. ✅ See text input results
2. ✅ See [v0] logs in console
3. ✅ Try other input methods
4. ✅ Get allergen warnings

**You're all set!** 🚀

---

## 🔗 Resources

- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Tesseract.js](https://github.com/naptha/tesseract.js)
- [QuaggaJS](https://github.com/serratus/quaggaJS)
- [Open Food Facts API](https://world.openfoodfacts.org/api/v0/product/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)

---

## 📞 Support

If something doesn't work:
1. Check the TESTING_CHECKLIST.md for your feature
2. Look for [v0] logs in console
3. Check Network tab (F12) for API errors
4. Read error messages carefully - they're specific!

**All features are production-ready and fully implemented.** ✅

