import { NextRequest, NextResponse } from 'next/server';

// Common allergen mappings
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  'peanut': ['peanut', 'arachis', 'groundnut'],
  'tree nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'brazil nut', 'macadamia'],
  'milk': ['milk', 'dairy', 'cheese', 'butter', 'yogurt', 'cream', 'lactose', 'casein', 'whey'],
  'egg': ['egg', 'eggs', 'albumin', 'mayonnaise'],
  'fish': ['fish', 'cod', 'salmon', 'tuna', 'anchovies'],
  'shellfish': ['shellfish', 'shrimp', 'crab', 'lobster', 'oyster', 'clam', 'mussel', 'scallop'],
  'soy': ['soy', 'soybean', 'soya', 'edamame', 'tofu'],
  'wheat': ['wheat', 'flour', 'bread', 'pasta', 'gluten', 'barley', 'rye'],
  'sesame': ['sesame', 'tahini'],
  'mustard': ['mustard'],
  'celery': ['celery', 'celeriac'],
};

function checkAllergensInText(text: string, userAllergies: string[]): Array<{
  ingredient: string;
  allergens: string[];
  riskLevel: string;
}> {
  const results = [];
  const ingredients = text.split(',').map(ing => ing.trim().toLowerCase()).filter(Boolean);

  for (const ingredient of ingredients) {
    const allergensFound: string[] = [];

    // Check against all known allergens
    for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
      if (userAllergies.some(a => a.toLowerCase() === allergen.toLowerCase())) {
        for (const keyword of keywords) {
          if (ingredient.includes(keyword.toLowerCase())) {
            allergensFound.push(allergen);
            break;
          }
        }
      }
    }

    const riskLevel = allergensFound.length > 0 ? 'danger' : 'safe';

    results.push({
      ingredient,
      allergens: allergensFound,
      riskLevel
    });
  }

  return results;
}

function generateAIResponse(results: any[], userAllergies: string[]): string {
  const dangerCount = results.filter(r => r.riskLevel === 'danger').length;

  if (dangerCount > 0) {
    const dangerIngredients = results
      .filter(r => r.riskLevel === 'danger')
      .map(r => r.ingredient)
      .join(', ');
    return `⚠️ DANGER: Found allergens in: ${dangerIngredients}. Please avoid this product!`;
  }

  return `✓ SAFE: All ingredients appear safe for your allergies. However, always check product labels for cross-contamination warnings.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, user_allergies } = body;

    if (!ingredients || !user_allergies) {
      return NextResponse.json(
        { error: 'Missing ingredients or user_allergies' },
        { status: 400 }
      );
    }

    // Check allergens
    const results = checkAllergensInText(ingredients, user_allergies);

    // Generate response
    const message = generateAIResponse(results, user_allergies);

    return NextResponse.json({
      overall_risk: results.some(r => r.riskLevel === 'danger') ? 'danger' : 'safe',
      results,
      message
    });
  } catch (error) {
    console.error('Error checking food:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
