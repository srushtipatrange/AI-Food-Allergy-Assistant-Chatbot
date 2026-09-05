'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface AllergySelectorProps {
  selectedAllergies: string[];
  onUpdate: (allergies: string[]) => void;
}

const COMMON_ALLERGENS = [
  'peanut',
  'tree nuts',
  'milk',
  'egg',
  'fish',
  'shellfish',
  'soy',
  'wheat',
  'sesame',
  'mustard',
  'celery'
];

export default function AllergySelector({ selectedAllergies, onUpdate }: AllergySelectorProps) {
  const [localAllergies, setLocalAllergies] = useState<string[]>(selectedAllergies);
  const [customAllergy, setCustomAllergy] = useState('');

  useEffect(() => {
    setLocalAllergies(selectedAllergies);
  }, [selectedAllergies]);

  const toggleAllergy = (allergy: string) => {
    const updated = localAllergies.includes(allergy)
      ? localAllergies.filter(a => a !== allergy)
      : [...localAllergies, allergy];
    
    setLocalAllergies(updated);
    onUpdate(updated);
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !localAllergies.includes(customAllergy.toLowerCase())) {
      const updated = [...localAllergies, customAllergy.toLowerCase()];
      setLocalAllergies(updated);
      onUpdate(updated);
      setCustomAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    const updated = localAllergies.filter(a => a !== allergy);
    setLocalAllergies(updated);
    onUpdate(updated);
  };

  const clearAll = () => {
    setLocalAllergies([]);
    onUpdate([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Your Allergies</h2>
        <p className="text-sm text-gray-600">Select all your food allergies</p>
      </div>

      {/* Selected Allergies Tags */}
      {localAllergies.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Selected ({localAllergies.length})</p>
          <div className="flex flex-wrap gap-2">
            {localAllergies.map(allergy => (
              <div
                key={allergy}
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-md"
              >
                {allergy}
                <button
                  onClick={() => removeAllergy(allergy)}
                  className="ml-1 hover:opacity-80 transition-opacity"
                  aria-label={`Remove ${allergy}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Allergens */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Common Allergens</p>
        <div className="space-y-2">
          {COMMON_ALLERGENS.map(allergen => (
            <label
              key={allergen}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={localAllergies.includes(allergen)}
                onCheckedChange={() => toggleAllergy(allergen)}
                className="border-2 border-blue-300"
              />
              <span className="text-sm font-medium text-gray-700 capitalize">{allergen}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Allergy */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Add Custom</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom allergy..."
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addCustomAllergy();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            onClick={addCustomAllergy}
            disabled={!customAllergy.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 text-sm"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Actions */}
      {localAllergies.length > 0 && (
        <Button
          onClick={clearAll}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          Clear All
        </Button>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-900">💡 Pro Tip</p>
        <p className="text-xs text-blue-800 leading-relaxed">
          Your allergies are saved locally. Speak or type ingredients and I&apos;ll instantly check for safety.
        </p>
      </div>
    </div>
  );
}
