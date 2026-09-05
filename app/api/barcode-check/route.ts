import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode, user_allergies } = body;

    console.log('[v0] Barcode lookup requested for:', barcode);

    // Call Open Food Facts API directly
    const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    console.log('[v0] Calling Open Food Facts API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'FoodAllergyAssistant/1.0',
      },
    });

    if (!response.ok) {
      console.error('[v0] API response not OK:', response.status);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('[v0] API response received, status:', data.status);

    // Check if product was found (status === 1)
    if (data.status === 0) {
      console.log('[v0] Product not found in database');
      return NextResponse.json({
        found: false,
        message: 'Product not found in database',
      });
    }

    // Extract product information
    const product = data.product;
    const productName = product.product_name || 'Unknown Product';
    console.log('[v0] Product found:', productName);

    // Get ingredients from either ingredients_text or ingredients array
    let ingredients = '';
    if (product.ingredients_text) {
      ingredients = product.ingredients_text;
      console.log('[v0] Using ingredients_text');
    } else if (product.ingredients && Array.isArray(product.ingredients)) {
      ingredients = product.ingredients.map((ing: any) => ing.text || ing.name || ing).join(', ');
      console.log('[v0] Using ingredients array');
    } else {
      console.log('[v0] No ingredients found for product');
      ingredients = '';
    }

    console.log('[v0] Extracted ingredients:', ingredients.substring(0, 100));

    // If no ingredients, return product not suitable for analysis
    if (!ingredients.trim()) {
      return NextResponse.json({
        found: true,
        product_name: productName,
        ingredients_text: '',
        message: 'Product found but no ingredients information available',
      });
    }

    return NextResponse.json({
      found: true,
      product_name: productName,
      extracted_ingredients: ingredients,
      message: 'Product found',
    });
  } catch (error) {
    console.error('[v0] Barcode check error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        found: false,
        error: `Failed to look up barcode: ${errorMsg}`,
      },
      { status: 200 }
    );
  }
}
