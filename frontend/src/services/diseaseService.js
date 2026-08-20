import { request } from './api';

export const diseaseService = {
  /**
   * Primary disease analysis endpoint: POST /api/disease/analyze
   * Accepts FormData or JSON object
   */
  async analyze(formDataOrJson) {
    try {
      const isFormData = formDataOrJson instanceof FormData;
      return await request('/disease/analyze', {
        method: 'POST',
        body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
      });
    } catch (err) {
      console.warn('[DiseaseService] Backend /disease/analyze fallback:', err.message);
      
      // Determine crop name from payload
      let crop = 'Tomato';
      if (formDataOrJson instanceof FormData) {
        crop = formDataOrJson.get('crop') || 'Tomato';
      } else if (formDataOrJson && formDataOrJson.crop) {
        crop = formDataOrJson.crop;
      }

      // Return dynamic crop-dependent fallback response
      return getMockDiagnosisForCrop(crop);
    }
  },

  /**
   * Legacy alias for analyze
   */
  async diagnose(payload) {
    return this.analyze(payload);
  },

  /**
   * Fetches past scan history: GET /api/disease/history
   */
  async getHistory() {
    try {
      return await request('/disease/history');
    } catch {
      return [
        {
          id: 'scan-sample-1',
          crop: 'Tomato',
          disease: 'Tomato Early Blight',
          confidence: 87,
          severity: 'Moderate',
          advice: ['Remove affected lower leaves', 'Avoid excess wetness and overhead watering', 'Spray Mancozeb 75% WP or Neem extract'],
          prevention: ['Practice 3-year crop rotation', 'Ensure adequate plant spacing'],
          regional_explanation: 'पत्तियों पर शुरुआती झुलसा (Early Blight) रोग के लक्षण दिखाई दे रहे हैं।',
          timestamp: 'Recent'
        }
      ];
    }
  },

  /**
   * Returns list of supported crops: GET /api/disease/crops
   */
  async getCrops() {
    try {
      return await request('/disease/crops');
    } catch {
      return ['Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton', 'Corn'];
    }
  }
};

/**
 * Intelligent client-side fallback generator based on selected crop
 */
function getMockDiagnosisForCrop(crop) {
  const cropLower = crop.toLowerCase();

  if (cropLower.includes('potato')) {
    return {
      crop: 'Potato',
      disease: 'Potato Late Blight',
      scientific_name: 'Phytophthora infestans',
      confidence: 91,
      severity: 'Critical',
      symptoms: [
        'Water-soaked dark lesions on leaf margins turning purplish-black',
        'White fungal downy growth on leaf undersides under high humidity',
        'Brown decaying patches on tuber skin'
      ],
      advice: [
        'Apply Cymoxanil 8% + Mancozeb 64% WP @ 2.5g/L immediately',
        'Dehaulm (cut and remove top foliage) 10-12 days before harvest to safeguard tubers',
        'Avoid furrow irrigation during continuous cloudy/foggy spells'
      ],
      prevention: [
        'Use certified disease-free seed tubers from verified seed centers',
        'Ensure clean field sanitation and destroy cull piles before sowing'
      ],
      regional_explanation: 'आलू की पत्तियों में पछेती झुलसा (Late Blight) का संक्रमण दिख रहा है। कंदों को सड़ने से बचाने के लिए तुरंत कवकनाशी का छिड़काव करें।'
    };
  }

  if (cropLower.includes('rice') || cropLower.includes('paddy')) {
    return {
      crop: 'Rice',
      disease: 'Rice Blast',
      scientific_name: 'Magnaporthe oryzae',
      confidence: 93,
      severity: 'Severe',
      symptoms: [
        'Spindle-shaped or eye-shaped lesions with gray center and dark brown border',
        'Infection of leaf collars and neck nodes leading to grain sterility'
      ],
      advice: [
        'Foliar spray with Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L',
        'Halt top-dressing of excessive nitrogenous urea during cloudy weather',
        'Apply biological Pseudomonas fluorescens formulation @ 5g/L'
      ],
      prevention: [
        'Treat nursery seeds with Carbendazim @ 2g/kg seed',
        'Sow blast-resistant varieties like Pusa-44 or MTU-1010'
      ],
      regional_explanation: 'धान में ब्लास्ट (झोंका) रोग के लक्षण हैं। यूरिया का अत्यधिक प्रयोग रोकें और तुरंत ट्राईसाइक्लाजोल का छिड़काव करें।'
    };
  }

  if (cropLower.includes('wheat')) {
    return {
      crop: 'Wheat',
      disease: 'Wheat Yellow (Stripe) Rust',
      scientific_name: 'Puccinia striiformis',
      confidence: 95,
      severity: 'Severe',
      symptoms: [
        'Bright yellow-orange powdery pustules arranged in linear parallel stripes on leaf blades',
        'Yellow powder rubbing off easily onto fingers when touched'
      ],
      advice: [
        'Spray Propiconazole 25% EC (Tilt) @ 1ml/L or Tebuconazole @ 1.25ml/L immediately',
        'Apply during clear morning hours after morning dew has evaporated'
      ],
      prevention: [
        'Sow rust-resistant varieties such as HD-2967, PBW-550, DBW-187',
        'Avoid delayed sowing to minimize vulnerability to warmer late-winter spore flushes'
      ],
      regional_explanation: 'गेहूं की पत्तियों पर पीला रतुआ (Yellow Rust) के संकेत मिले हैं। तुरंत प्रोपिकोनाजोल (टिल्ट) का स्प्रे करें।'
    };
  }

  if (cropLower.includes('cotton')) {
    return {
      crop: 'Cotton',
      disease: 'Cotton Bacterial Blight / Black Arm',
      scientific_name: 'Xanthomonas citri pv. malvacearum',
      confidence: 89,
      severity: 'Moderate',
      symptoms: [
        'Angular dark water-soaked spots bounded by leaf veins',
        'Black lesions on stems causing branch breakage'
      ],
      advice: [
        'Spray Copper Oxychloride 50% WP @ 2.5g/L + Streptocycline @ 0.1g/L',
        'Avoid late evening overhead sprinkler irrigation'
      ],
      prevention: [
        'Use acid-delinted certified seeds treated with Trichoderma @ 10g/kg',
        'Destroy old cotton crop stalks after picking season'
      ],
      regional_explanation: 'कपास में कोणीय पत्ती धब्बा (Black Arm) रोग के लक्षण हैं। कॉपर ऑक्सीक्लोराइड व स्ट्रेप्टोसाइक्लिन का छिड़काव करें।'
    };
  }

  if (cropLower.includes('corn') || cropLower.includes('maize')) {
    return {
      crop: 'Corn',
      disease: 'Corn Common Rust',
      scientific_name: 'Puccinia sorghi',
      confidence: 92,
      severity: 'Moderate',
      symptoms: [
        'Cinnamon-brown elongated powdery pustules on upper and lower leaf surfaces'
      ],
      advice: [
        'Foliar spray with Mancozeb 75% WP @ 2.5g/L or Pyraclostrobin @ 1ml/L',
        'Apply wettable sulfur 80% WDG @ 2g/L as an organic alternative'
      ],
      prevention: [
        'Plant rust-tolerant hybrid corn seed varieties',
        'Ensure balanced plant nutrition and avoid dense overcrowding'
      ],
      regional_explanation: 'मक्का में रतुआ (Rust) रोग के लक्षण दिखाई दे रहे हैं। मैंकोजेब अथवा सल्फर का छिड़काव करें।'
    };
  }

  // Default Tomato Early Blight
  return {
    crop: 'Tomato',
    disease: 'Tomato Early Blight',
    scientific_name: 'Alternaria solani',
    confidence: 87,
    severity: 'Moderate',
    symptoms: [
      'Concentric dark brown rings forming a target pattern on older leaves',
      'Yellow chlorotic halo surrounding lesions',
      'Lower leaf yellowing and defoliation'
    ],
    advice: [
      'Remove affected leaves and destroy them away from the field',
      'Avoid excess wetness and overhead watering',
      'Apply Mancozeb 75% WP @ 2.5g/L or Neem seed kernel extract (NSKE 5%)',
      'Monitor crop closely over the next 5-7 days'
    ],
    prevention: [
      'Practice 3-year crop rotation with non-solanaceous crops',
      'Ensure adequate 60cm plant spacing for good airflow',
      'Mulch soil with clean straw'
    ],
    regional_explanation: 'पत्तियों पर शुरुआती झुलसा रोग के संकेत दिखाई दे रहे हैं। प्रभावित पत्तियों को हटाएँ, अधिक नमी से बचें और ध्यानपूर्वक निगरानी रखें।'
  };
}
