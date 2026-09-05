<div align="center">

# 🥗 FOOD ALLERGY ASSISTANT

### 💙 *Smart Food Analysis for Safer & More Informed Choices* 💙

<br>

> ## 🛡️ Check Before You Eat — Your Safety Matters!

<br>

**An intelligent web application that helps users identify potential food allergens using text, voice, barcode scanning, and image analysis.**

<br>

---

### ✨ ⚡ SMART • FAST • INTERACTIVE • USER-FRIENDLY ⚡ ✨

---

</div>

# 🌟 About The Project

## 🥗 What is Food Allergy Assistant?

**Food Allergy Assistant** is an intelligent and interactive web application designed to help users make **safer and more informed food choices**.

The application allows users to select their food allergies and analyze food products using multiple methods such as **text input, voice input, barcode scanning, and image analysis**.

The system then compares the available food or ingredient information with the user's selected allergies and provides a clear potential risk assessment.

> ⚠️ **The goal is simple: Help users become more aware of possible allergens before consuming a food product.**

---

# ✨ Key Features

<table>
<tr>
<td width="50%">

## 🧑‍⚕️ Allergy Selection

Users can create a personalized allergy profile by selecting common food allergies or adding their own custom allergies.

🥜 Peanuts  
🥛 Milk  
🥚 Eggs  
🐟 Fish  
🦐 Shellfish  
🌱 Soy  
🌾 Wheat  
⚪ Sesame  

</td>

<td width="50%">

## 💬 Smart Food Analysis

The application analyzes food information and compares detected ingredients with the user's selected allergy profile.

🟢 **Safe**  
🟡 **Warning**  
🔴 **Potential Risk**

</td>
</tr>
</table>

---

## 🎤 Voice Input

Don't want to type?

Simply use **voice input** to speak the name of a food product or its ingredients.

### 🔄 Simple Process

```text
🎤 Speak → 📝 Convert to Text → 🧠 Analyze → ⚠️ Get Results
```

---

## ⌨️ Text-Based Analysis

Users can manually enter:

- 🍔 Food names
- 📋 Ingredients
- 🥫 Product information
- 🍽️ Food descriptions

The system analyzes the information and checks for potential allergens.

---

## 📷 Barcode Scanner

Users can scan a food product's barcode using their device camera.

### Process

```text
📷 Scan Barcode
       ↓
🔍 Retrieve Product Information
       ↓
🧠 Analyze Ingredients
       ↓
⚠️ Check Selected Allergies
       ↓
🟢 Safe / 🟡 Warning / 🔴 Potential Risk
```

---

## 🖼️ Image & Label Analysis

Users can upload an image of:

- 🥫 Food packaging
- 🏷️ Ingredient labels
- 🍔 Food products

The application uses intelligent analysis techniques to extract useful information from the image.

### Technologies Used

🔤 **OCR (Optical Character Recognition)**  
🧠 **AI-Based Image Classification**  
📷 **Image Analysis**

---

# 🧠 How It Works

<div align="center">

```text
                    👤 USER
                       │
                       ▼
             🥜 SELECT ALLERGIES
                       │
                       ▼
             🎯 CHOOSE INPUT METHOD
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       🎤 VOICE      ⌨️ TEXT      📷 BARCODE
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
                 🖼️ IMAGE / OCR
                       │
                       ▼
                🧠 SMART ANALYSIS
                       │
                       ▼
                ⚠️ ALLERGY CHECK
                       │
                       ▼
            🟢 SAFE • 🟡 WARNING • 🔴 RISK
```

</div>

---

# 🛠️ Technology Stack

## 🎨 Frontend

| Technology | Purpose |
|---|---|
| ⚛️ **Next.js** | Frontend Framework |
| ⚛️ **React** | User Interface Development |
| 🔷 **TypeScript** | Type-Safe Development |
| 🎨 **Tailwind CSS** | Modern Styling |
| 🧩 **Radix UI** | User Interface Components |
| 🎭 **Lucide React** | Icons |

---

## ⚙️ Backend

| Technology | Purpose |
|---|---|
| 🐍 **Python** | Backend Development |
| ⚡ **FastAPI** | API Development |
| 🚀 **Uvicorn** | Application Server |
| 🌐 **Aiohttp** | Asynchronous HTTP Requests |

---

## 🧠 AI & Smart Technologies

| Technology | Purpose |
|---|---|
| 🧠 **TensorFlow.js** | Machine Learning |
| 📸 **MobileNet** | Image Classification |
| 🔤 **Tesseract.js** | OCR Text Extraction |
| 🎤 **Web Speech API** | Voice Recognition |
| 📊 **Vercel Analytics** | Application Analytics |

---

# 📂 Project Structure

```text
🥗 Food-Allergy-Assistant
│
├── 📁 app
│   │
│   ├── 📁 api
│   │   │
│   │   ├── 📁 barcode-check
│   │   ├── 📁 check-food
│   │   ├── 📁 conversational-check
│   │   └── 📁 ocr-check
│   │
│   ├── 📄 globals.css
│   ├── 📄 layout.tsx
│   └── 📄 page.tsx
│
├── 📁 backend
│   ├── 📄 app.py
│   └── 📄 requirements.txt
│
├── 📁 components
│   │
│   ├── 📄 AllergySelector.tsx
│   ├── 📄 BarcodeScanner.tsx
│   ├── 📄 ChatInterface.tsx
│   ├── 📄 ConversationalChat.tsx
│   ├── 📄 ImageOCR.tsx
│   ├── 📄 VoiceInput.tsx
│   └── 📁 ui
│
├── 📁 hooks
│
├── 📁 lib
│   ├── 📄 imageAnalysis.ts
│   └── 📄 utils.ts
│
├── 📁 public
│
├── 📄 package.json
│
└── 📄 README.md
```

---

# 🚀 Getting Started

## 📋 Prerequisites

Before running the project, make sure you have the following installed:

### 🟢 Node.js

Version **18 or above**

### 🐍 Python

Version **3.8 or above**

### 📦 Package Manager

Use either:

- npm
- pnpm

---

# ⚙️ Installation

## 1️⃣ Download or Clone the Project

Download the project and extract it into your preferred location.

---

## 2️⃣ Open the Project Folder

Open the project folder in **Visual Studio Code** or your preferred code editor.

---

## 3️⃣ Install Frontend Dependencies

Open the terminal inside the main project folder and run:

```bash
npm install
```

Alternatively, if you use pnpm:

```bash
pnpm install
```

---

## 4️⃣ Install Backend Dependencies

Navigate to the backend folder:

```bash
cd backend
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

---

# ▶️ Run The Application

## 💻 Start the Frontend

Open a terminal in the main project directory and run:

```bash
npm run dev
```

or:

```bash
pnpm dev
```

The application will start on:

```text
localhost:3000
```

---

## ⚡ Start the Backend

Open another terminal and navigate to the backend folder:

```bash
cd backend
```

Run the FastAPI server:

```bash
python -m uvicorn app:app --reload
```

The backend server will run on:

```text
localhost:8000
```

---

# 🧪 Example Workflow

### 🥇 Step 1 — Select Your Allergies

Example:

```text
🥜 Peanuts
🥛 Milk
🥚 Eggs
```

### 🥈 Step 2 — Choose an Input Method

```text
🎤 Voice Input
⌨️ Text Input
📷 Barcode Scanner
🖼️ Image Analysis
```

### 🥉 Step 3 — Provide Food Information

For example:

```text
Milk, eggs, wheat flour and sugar
```

### 🏆 Step 4 — Get the Analysis

The application compares the provided information against the selected allergies.

Possible results include:

| Result | Meaning |
|---|---|
| 🟢 **SAFE** | No selected allergen detected |
| 🟡 **WARNING** | Potential allergen or additional checking required |
| 🔴 **RISK DETECTED** | A selected allergen may be present |

---

# 📸 Application Screenshots

## 🏠 Home Page

> 📌 **Add your application screenshot here**

```text
📁 public
   └── 📁 screenshots
       └── 🖼️ home-page.png
```

After adding your screenshot, replace this section with:

```markdown
![Home Page](./public/screenshots/home-page.png)
```

---

## 🥜 Allergy Selection

> 📌 Add a screenshot showing the allergy selection interface here.

```markdown
![Allergy Selection](./public/screenshots/allergy-selection.png)
```

---

## 📷 Barcode Scanner

> 📌 Add a screenshot of the barcode scanning feature here.

```markdown
![Barcode Scanner](./public/screenshots/barcode-scanner.png)
```

---

## 🖼️ Image Analysis

> 📌 Add a screenshot demonstrating image or label analysis here.

```markdown
![Image Analysis](./public/screenshots/image-analysis.png)
```

---

# 🎯 Project Objectives

The main objectives of this project are:

- 🛡️ Help users identify potential food allergens
- 📱 Create an easy-to-use and interactive interface
- 🧠 Use modern AI and web technologies
- 🎤 Provide multiple methods of food input
- 📷 Support barcode and image analysis
- ⚠️ Improve awareness regarding food ingredients
- 💙 Promote safer and more informed food choices

---

# 🔮 Future Enhancements

The project can be further improved by adding:

- [ ] 🤖 Advanced AI-powered food recognition
- [ ] 🌍 Larger food and allergen databases
- [ ] 👤 User authentication
- [ ] 📱 Dedicated mobile application
- [ ] 🌐 Multi-language support
- [ ] 📊 User allergy history
- [ ] 🔔 Personalized food alerts
- [ ] 🏪 Expanded barcode product database
- [ ] 🧠 Advanced ingredient analysis
- [ ] ☁️ Cloud-based user profiles

---

# ⚠️ Important Disclaimer

<div align="center">

## 🚨 PLEASE READ

</div>

> **This application is created for educational and informational purposes.**

Food allergies can be serious and potentially life-threatening.

This application should **NOT** be considered a replacement for:

- 🧑‍⚕️ Professional medical advice
- 🏥 Medical diagnosis
- 💊 Emergency medical treatment
- 🏷️ Official food product labels

### Always:

✔️ Check the official ingredient label  
✔️ Consult a healthcare professional when necessary  
✔️ Follow appropriate medical guidance  
✔️ Take immediate action during an allergic emergency  

---

# 🤝 Contributing

Contributions, suggestions, and improvements are always welcome! 💙

### Steps to Contribute

```text
1️⃣ Fork the repository
        ↓
2️⃣ Create a new branch
        ↓
3️⃣ Make your changes
        ↓
4️⃣ Test the application
        ↓
5️⃣ Commit your changes
        ↓
6️⃣ Create a Pull Request
```

---

# 👩‍💻 Author

<div align="center">

## 🌸 Parnika Patrange 🌸

### 🎓 Student | 💻 Technology Enthusiast

<br>

**Building projects, learning technologies, and exploring innovative solutions. 🚀**

</div>

---

<div align="center">

# 💙 Thank You for Visiting! 💙

### ⭐ If you found this project interesting, consider giving it a star!

<br>

## 🥗 Think Smart • Eat Safe • Stay Healthy 🥗

<br>

### Made with ❤️ and ☕ by Parnika

</div>
