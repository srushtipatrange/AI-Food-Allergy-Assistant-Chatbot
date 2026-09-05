'use client';

// Allergen mapping: maps detected food items to allergen categories
const ALLERGEN_MAPPING: Record<string, string[]> = {
  // Fish/Seafood
  fish: ['fish', 'seafood', 'shellfish'],
  salmon: ['fish', 'seafood'],
  tuna: ['fish', 'seafood'],
  cod: ['fish', 'seafood'],
  trout: ['fish', 'seafood'],
  shrimp: ['shellfish', 'seafood'],
  crab: ['shellfish', 'seafood'],
  lobster: ['shellfish', 'seafood'],
  oyster: ['shellfish', 'seafood'],
  mussel: ['shellfish', 'seafood'],

  // Dairy
  milk: ['milk', 'dairy'],
  cheese: ['milk', 'dairy'],
  yogurt: ['milk', 'dairy'],
  butter: ['milk', 'dairy'],
  cream: ['milk', 'dairy'],
  ice: ['milk', 'dairy'],
  yoghurt: ['milk', 'dairy'],

  // Nuts
  peanut: ['peanuts', 'nuts'],
  almond: ['tree nuts', 'nuts'],
  walnut: ['tree nuts', 'nuts'],
  cashew: ['tree nuts', 'nuts'],
  pecan: ['tree nuts', 'nuts'],
  pistachio: ['tree nuts', 'nuts'],
  hazelnut: ['tree nuts', 'nuts'],
  macadamia: ['tree nuts', 'nuts'],

  // Gluten/Wheat
  bread: ['wheat', 'gluten'],
  wheat: ['wheat', 'gluten'],
  pasta: ['wheat', 'gluten'],
  flour: ['wheat', 'gluten'],
  cereal: ['wheat', 'gluten'],
  grain: ['wheat', 'gluten'],
  barley: ['gluten'],
  rye: ['gluten'],

  // Soy
  soy: ['soy'],
  tofu: ['soy'],
  soybean: ['soy'],
  edamame: ['soy'],

  // Sesame
  sesame: ['sesame'],
  tahini: ['sesame'],

  // Eggs
  egg: ['eggs'],
  eggs: ['eggs'],

  // Celery
  celery: ['celery'],

  // Mustard
  mustard: ['mustard'],

  // Other
  apple: [],
  banana: [],
  orange: [],
  grape: [],
  strawberry: [],
  chocolate: [],
  coffee: [],
  tea: [],
};

// Food category keywords for fallback matching
const FOOD_CATEGORY_KEYWORDS: Record<string, string[]> = {
  fish: ['fish', 'salmon', 'tuna', 'cod', 'trout', 'seafood', 'marine'],
  shellfish: ['shrimp', 'crab', 'lobster', 'oyster', 'mussel', 'clam', 'prawn'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy', 'lactose'],
  nuts: ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'peanut', 'nut', 'seeds'],
  wheat: ['wheat', 'bread', 'pasta', 'flour', 'grain', 'cereal', 'barley', 'rye', 'oat'],
  soy: ['soy', 'tofu', 'soybean', 'edamame', 'miso', 'tempeh'],
  sesame: ['sesame', 'tahini'],
  eggs: ['egg', 'eggs', 'poultry'],
};

interface ClassificationResult {
  detectedFoods: string[];
  allergens: string[];
  confidence: number;
  message: string;
}

interface OCRAndClassificationResult {
  method: 'ocr' | 'classification' | 'hybrid';
  detectedFoods: string[];
  allergens: string[];
  confidence: number;
  ocrText?: string;
  classificationLabels?: string[];
  message: string;
}

/**
 * Load MobileNet model for image classification
 */
export async function loadMobileNetModel() {
  console.log('[v0] Loading MobileNet model...');
  try {
    const mobilenet = await import('@tensorflow-models/mobilenet');
    const tf = await import('@tensorflow/tfjs');
    console.log('[v0] MobileNet and TensorFlow.js loaded successfully');
    return { mobilenet, tf };
  } catch (error) {
    console.error('[v0] Failed to load MobileNet model:', error);
    throw new Error('Failed to load image classification model');
  }
}

/**
 * Classify image using MobileNet
 */
export async function classifyImage(imageUrl: string): Promise<{ labels: string[]; confidences: number[] }> {
  try {
    console.log('[v0] Starting image classification...');
    const { mobilenet } = await loadMobileNetModel();

    // Create image element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.crossOrigin = 'anonymous';

    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    console.log('[v0] Image loaded, running classification...');

    // Classify image
    const predictions = await (mobilenet as any).classify(img);
    console.log('[v0] Classification complete, predictions:', predictions);

    // Extract labels and confidences
    const labels = predictions.map((p: any) => p.className.toLowerCase());
    const confidences = predictions.map((p: any) => p.probability);

    console.log('[v0] Detected labels:', labels);
    return { labels, confidences };
  } catch (error) {
    console.error('[v0] Image classification error:', error);
    throw new Error('Failed to classify image');
  }
}

/**
 * Map detected food labels to allergen categories
 */
export function mapFoodToAllergens(detectedFoods: string[]): string[] {
  const allergenSet = new Set<string>();

  for (const food of detectedFoods) {
    const foodLower = food.toLowerCase().trim();

    // Direct mapping
    if (ALLERGEN_MAPPING[foodLower]) {
      ALLERGEN_MAPPING[foodLower].forEach((allergen) => allergenSet.add(allergen));
    }

    // Keyword matching for categories
    for (const [category, keywords] of Object.entries(FOOD_CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (foodLower.includes(keyword) || keyword.includes(foodLower)) {
          // Map category to allergen
          const categoryAllergens = ALLERGEN_MAPPING[keyword];
          if (categoryAllergens) {
            categoryAllergens.forEach((allergen) => allergenSet.add(allergen));
          }
        }
      }
    }
  }

  return Array.from(allergenSet);
}

/**
 * Filter and clean OCR text to extract meaningful ingredients
 */
export function cleanOCRText(rawText: string): string[] {
  console.log('[v0] Cleaning OCR text, length:', rawText.length);

  // Split by common delimiters
  const words = rawText
    .toLowerCase()
    .split(/[,;:\n\t|()[\]{}]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2); // Filter out very short words like "qpad"

  // Filter meaningful words (at least one letter, not just numbers/symbols)
  const meaningfulWords = words.filter((word) => {
    // Must contain at least one letter
    if (!/[a-z]/i.test(word)) return false;
    // Remove pure numbers and symbols
    if (/^\d+$/.test(word)) return false;
    // Remove garbage patterns (single repeated letters like "aaa")
    if (/^([a-z])\1{2,}$/i.test(word)) return false;
    // Remove random 4-letter nonsense (like "qpad" - all consonants, no vowels)
    const vowels = (word.match(/[aeiou]/gi) || []).length;
    if (word.length <= 5 && vowels === 0) {
      console.log('[v0] Filtering garbage word:', word, '(no vowels)');
      return false;
    }
    // Remove overly short words with low letter ratio
    if (word.length <= 4 && vowels <= 1) {
      console.log('[v0] Filtering garbage word:', word, '(too short, minimal vowels)');
      return false;
    }
    return true;
  });

  console.log('[v0] Cleaned ingredients:', meaningfulWords);
  return meaningfulWords;
}

/**
 * Analyze image using both OCR and classification
 */
export async function analyzeImageHybrid(
  imageUrl: string,
  ocrText: string,
  userAllergies: string[]
): Promise<OCRAndClassificationResult> {
  console.log('[v0] Starting hybrid image analysis (OCR + Classification)');

  let method: 'ocr' | 'classification' | 'hybrid' = 'ocr';
  let detectedFoods: string[] = [];
  let allergens: string[] = [];
  let confidence = 0;
  let classificationLabels: string[] = [];

  // Step 1: Try OCR text first
  const cleanedOCRWords = cleanOCRText(ocrText);
  console.log('[v0] OCR cleaned words:', cleanedOCRWords);

  if (cleanedOCRWords.length > 0) {
    console.log('[v0] Using OCR results');
    detectedFoods = cleanedOCRWords;
    allergens = mapFoodToAllergens(cleanedOCRWords);
    confidence = 0.7; // Moderate confidence for OCR
  }

  // Step 2: If OCR didn't extract meaningful text, use image classification
  if (cleanedOCRWords.length === 0 || confidence < 0.5) {
    try {
      console.log('[v0] OCR insufficient, attempting image classification...');
      const { labels, confidences } = await classifyImage(imageUrl);
      classificationLabels = labels;

      // Filter high-confidence predictions
      const highConfidenceLabels = labels.filter((_, idx) => confidences[idx] > 0.3);
      console.log('[v0] High confidence labels:', highConfidenceLabels);

      if (highConfidenceLabels.length > 0) {
        method = cleanedOCRWords.length > 0 ? 'hybrid' : 'classification';
        const classificationAllergens = mapFoodToAllergens(highConfidenceLabels);
        allergens = [...new Set([...allergens, ...classificationAllergens])];
        detectedFoods = [...new Set([...detectedFoods, ...highConfidenceLabels])];
        confidence = Math.max(...confidences);
      }
    } catch (error) {
      console.error('[v0] Image classification failed:', error);
    }
  }

  // Generate message
  let message = '';
  if (detectedFoods.length === 0) {
    message = '⚠️ Unable to identify the food item in the image. Please try:\n\n• Uploading a clearer image\n• Including visible product label\n• Entering ingredients manually';
  } else {
    const detectedStr = detectedFoods.slice(0, 3).join(', ');
    const methodStr = method === 'hybrid' ? 'OCR + Image Recognition' : method === 'classification' ? 'Image Recognition' : 'Text Recognition';
    message = `📸 Detected: ${detectedStr}\n(Method: ${methodStr}, Confidence: ${Math.round(confidence * 100)}%)\n\n`;

    // Check against user allergies
    const matchingAllergies = allergens.filter((allergen) =>
      userAllergies.some((ua) => ua.toLowerCase() === allergen.toLowerCase())
    );

    if (matchingAllergies.length > 0) {
      message += `⚠️ ALLERGEN DETECTED!\n\nThis product contains: ${matchingAllergies.join(', ')}\n\nI recommend avoiding this product. Always check the label for cross-contamination warnings.`;
    } else {
      message += `✓ SAFE!\n\nBased on your allergy profile (${userAllergies.join(', ')}), this food item appears safe for you.\n\nAlways double-check product labels for potential cross-contamination warnings.`;
    }
  }

  return {
    method,
    detectedFoods,
    allergens,
    confidence,
    ocrText: cleanedOCRWords.length > 0 ? cleanedOCRWords.join(', ') : undefined,
    classificationLabels: classificationLabels.length > 0 ? classificationLabels : undefined,
    message,
  };
}

/**
 * Validate if image contains meaningful food-related data
 */
export function validateFoodImage(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Basic validation: image loaded successfully
        resolve(true);
      };

      img.onerror = () => {
        console.error('[v0] Invalid image URL');
        resolve(false);
      };

      // Timeout after 5 seconds
      setTimeout(() => resolve(true), 5000);
    } catch (error) {
      console.error('[v0] Image validation error:', error);
      resolve(false);
    }
  });
}
