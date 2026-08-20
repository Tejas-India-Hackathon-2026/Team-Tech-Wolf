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
      
      // Determine crop name and scenario from payload
      let crop = 'Tomato';
      let scenarioId = null;
      if (formDataOrJson instanceof FormData) {
        crop = formDataOrJson.get('crop') || 'Tomato';
        scenarioId = formDataOrJson.get('scenario_id') || formDataOrJson.get('scenario');
      } else if (formDataOrJson && formDataOrJson.crop) {
        crop = formDataOrJson.crop;
        scenarioId = formDataOrJson.scenario_id || formDataOrJson.scenario;
      }

      // Return honest dynamic crop-dependent prototype demo fallback
      return getMockDiagnosisForCrop(crop, scenarioId);
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
          is_demo: true,
          crop: 'Tomato',
          disease: 'Tomato Early Blight',
          confidence: null,
          confidence_label: 'Model confidence unavailable in demo mode.',
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
      const data = await request('/disease/crops');
      if (Array.isArray(data)) {
        if (!data.includes('Auto Detect Crop')) {
          return ['Auto Detect Crop', ...data];
        }
        return data;
      }
      return ['Auto Detect Crop', 'Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton', 'Corn', 'Chilli', 'Onion', 'Brinjal', 'Maize'];
    } catch {
      return ['Auto Detect Crop', 'Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton', 'Corn', 'Chilli', 'Onion', 'Brinjal', 'Maize'];
    }
  },

  /**
   * Returns demo scenarios: GET /api/disease/scenarios
   */
  async getScenarios(crop) {
    try {
      const query = crop ? `?crop=${encodeURIComponent(crop)}` : '';
      return await request(`/disease/scenarios${query}`);
    } catch {
      return null;
    }
  }
};

/**
 * Intelligent client-side fallback generator based on selected crop and scenario
 * Maintains honest prototype demo labeling and zero fake confidence ratings.
 */
function getMockDiagnosisForCrop(crop = 'Tomato', scenarioId = null) {
  const cropLower = String(crop).toLowerCase();
  const sid = String(scenarioId || '').toLowerCase();

  const baseDemoFields = {
    is_demo: true,
    mode_label: 'Demo Analysis',
    mode_description: 'Prototype demonstration — real AI disease model is not currently connected.',
    confidence: null,
    confidence_label: 'Model confidence unavailable in demo mode.',
    safety_disclaimer: 'AI provides preliminary decision support only — not a guaranteed diagnosis. Consult agricultural experts for confirmation.',
    demo_note: 'Demo result — connect a trained crop-disease vision model for real image-based classification.',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
  };

  // Potato Scenarios
  if (cropLower.includes('potato')) {
    if (sid.includes('early') || sid.includes('eb')) {
      return {
        ...baseDemoFields,
        crop: 'Potato',
        disease: 'Potato Early Blight',
        scientific_name: 'Alternaria solani',
        severity: 'Moderate',
        symptoms: [
          'Dark brown angular necrotic spots with target-like rings on older leaves',
          'Yellow chlorosis developing around expanding leaf lesions',
          'Premature senescence of lower canopy leaves'
        ],
        advice: [
          'Foliar spray with Chlorothalonil 75% WP @ 2g/L or Azoxystrobin @ 1ml/L',
          'Ensure balanced potash fertilization to strengthen plant cell walls',
          'Prune dead lower foliage to minimize inoculant load'
        ],
        prevention: [
          'Rotate potato with maize or pulses for 2 seasons',
          'Avoid nitrogen deficiency stress during tuber bulking'
        ],
        regional_explanation: 'आलू की पत्तियों पर अगेती झुलसा (Early Blight) के लक्षण हैं। पोटाश का संतुलित प्रयोग करें और सुरक्षात्मक स्प्रे करें।'
      };
    }
    if (sid.includes('healthy')) {
      return {
        ...baseDemoFields,
        crop: 'Potato',
        disease: 'Healthy Potato Crop',
        scientific_name: 'Solanum tuberosum',
        severity: 'None',
        symptoms: [
          'Vibrant dark green canopy with sturdy stems and intact leaf margins',
          'No fungal blighting, bacterial ooze, or leaf roll symptoms'
        ],
        advice: [
          'Continue standard earthing-up (mounding) around stems',
          'Maintain optimal soil moisture without waterlogging'
        ],
        prevention: ['Inspect leaf undersides weekly for aphid vectors'],
        regional_explanation: 'आलू की फसल पूर्णतः स्वस्थ एवं रोगमुक्त है। मिट्टी चढ़ाने का कार्य समय पर पूरा करें।'
      };
    }
    // Default Potato: Late Blight
    return {
      ...baseDemoFields,
      crop: 'Potato',
      disease: 'Potato Late Blight',
      scientific_name: 'Phytophthora infestans',
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

  // Rice Scenarios
  if (cropLower.includes('rice') || cropLower.includes('paddy')) {
    if (sid.includes('brown') || sid.includes('spot')) {
      return {
        ...baseDemoFields,
        crop: 'Rice',
        disease: 'Rice Brown Spot',
        scientific_name: 'Bipolaris oryzae',
        severity: 'Moderate',
        symptoms: [
          'Small circular to oval dark brown spots evenly distributed across leaf surface',
          'Lesions with yellow halo resembling sesame seeds',
          'Chaffy grains with dark discoloration on glumes'
        ],
        advice: [
          'Spray Mancozeb 75% WP @ 2g/L or Edifenphos 50% EC @ 1ml/L',
          'Apply soil potassium and zinc sulphate (25 kg/ha) to correct nutrient stress',
          'Maintain adequate shallow water level in the field'
        ],
        prevention: [
          'Hot water seed treatment (52-54°C for 10-12 minutes) before sowing',
          'Improve soil organic matter and avoid soil drought stress'
        ],
        regional_explanation: 'धान में भूरा धब्बा (Brown Spot) रोग के लक्षण हैं। पोटाश व जिंक की कमी दूर करें और मैंकोजेब का छिड़काव करें।'
      };
    }
    if (sid.includes('healthy')) {
      return {
        ...baseDemoFields,
        crop: 'Rice',
        disease: 'Healthy Rice (Paddy) Crop',
        scientific_name: 'Oryza sativa',
        severity: 'None',
        symptoms: [
          'Healthy erect green tillers with uniform chlorophyll distribution',
          'No spindle lesions, bacterial streaks, or sheath blighting'
        ],
        advice: [
          'Maintain 2-3 cm standing water layer during tillering to panicle initiation',
          'Scout for stem borer dead hearts or brown planthopper at water level'
        ],
        prevention: ['Keep field bunds free of weed alternate hosts'],
        regional_explanation: 'धान की फसल पूर्णतः हरी-भरी और स्वस्थ है। कल्ले फूटते समय खेत में पर्याप्त नमी बनाए रखें।'
      };
    }
    // Default Rice: Leaf Blast
    return {
      ...baseDemoFields,
      crop: 'Rice',
      disease: 'Rice Leaf Blast',
      scientific_name: 'Magnaporthe oryzae',
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
      regional_explanation: 'धान में ब्लास्ट (Leaf Blast - झोंका) रोग के लक्षण हैं। यूरिया का अत्यधिक प्रयोग रोकें और तुरंत ट्राईसाइक्लाजोल का छिड़काव करें।'
    };
  }

  // Wheat Scenarios
  if (cropLower.includes('wheat')) {
    if (sid.includes('mildew') || sid.includes('powdery')) {
      return {
        ...baseDemoFields,
        crop: 'Wheat',
        disease: 'Wheat Powdery Mildew',
        scientific_name: 'Blumeria graminis f. sp. tritici',
        severity: 'Moderate',
        symptoms: [
          'White to light gray powdery fungal patches on upper leaf surfaces and leaf sheaths',
          'Powdery patches turning dull gray with tiny black fruiting bodies',
          'Yellowing and premature death of lower leaves under dense canopy'
        ],
        advice: [
          'Spray Hexaconazole 5% EC @ 2ml/L or Wettable Sulfur 80% WDG @ 3g/L',
          'Avoid excessive nitrogen fertilizer which creates overly lush dense canopies'
        ],
        prevention: [
          'Maintain optimal seed rate to prevent dense crop crowding',
          'Ensure proper field drainage and air circulation'
        ],
        regional_explanation: 'गेहूं पर सफेद चूर्णिल फफूंद (Powdery Mildew) का प्रकोप है। हेक्साकोनाजोल या घुलनशील सल्फर का स्प्रे करें।'
      };
    }
    if (sid.includes('healthy')) {
      return {
        ...baseDemoFields,
        crop: 'Wheat',
        disease: 'Healthy Wheat Crop',
        scientific_name: 'Triticum aestivum',
        severity: 'None',
        symptoms: [
          'Vigorous green foliage with strong spike emergence and no fungal pustules',
          'Uniform stand density and healthy flag leaf development'
        ],
        advice: [
          'Ensure critical irrigation at CRI (Crown Root Initiation) and flowering stages',
          'Apply recommended urea top-dressing before second irrigation'
        ],
        prevention: ['Scout border rows regularly during cool windy mornings'],
        regional_explanation: 'गेहूं की फसल स्वस्थ है। समय पर सिंचाई और यूरिया की संस्तुत मात्रा दें।'
      };
    }
    // Default Wheat: Leaf Rust
    return {
      ...baseDemoFields,
      crop: 'Wheat',
      disease: 'Wheat Leaf Rust (Yellow / Stripe Rust)',
      scientific_name: 'Puccinia striiformis / Puccinia triticina',
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
      regional_explanation: 'गेहूं की पत्तियों पर पीला रतुआ (Yellow / Stripe Rust) के संकेत मिले हैं। तुरंत प्रोपिकोनाजोल (टिल्ट) का स्प्रे करें।'
    };
  }

  // Cotton Scenarios
  if (cropLower.includes('cotton')) {
    if (sid.includes('curl') || sid.includes('virus')) {
      return {
        ...baseDemoFields,
        crop: 'Cotton',
        disease: 'Cotton Leaf Curl Disease',
        scientific_name: 'Cotton leaf curl virus (CLCuV)',
        severity: 'Severe',
        symptoms: [
          'Upward or downward curling of leaf margins with thickened veins',
          'Enation (small cup-shaped leaf outgrowths) on leaf undersides',
          'Stunted plant growth and reduced boll formation'
        ],
        advice: [
          'Control whitefly insect vectors by spraying Diafenthiuron 50% WP @ 1.2g/L or Pyriproxyfen @ 2ml/L',
          'Rogue out and destroy severely virus-infected plants early'
        ],
        prevention: [
          'Grow CLCuV-resistant Bt cotton hybrid varieties',
          'Eradicate weed hosts like Abutilon indicum from field margins'
        ],
        regional_explanation: 'कपास में पत्ती मरोड़ (Leaf Curl Virus) रोग के लक्षण हैं। सफेद मक्खी (Whitefly) के नियंत्रण के लिए कीटनाशक का छिड़काव करें।'
      };
    }
    if (sid.includes('healthy')) {
      return {
        ...baseDemoFields,
        crop: 'Cotton',
        disease: 'Healthy Cotton Crop',
        scientific_name: 'Gossypium hirsutum',
        severity: 'None',
        symptoms: [
          'Lush green palmate leaves with healthy square and boll development',
          'No vein thickening, enations, or angular black lesions'
        ],
        advice: [
          'Monitor for sucking pests using yellow & blue sticky traps',
          'Ensure balanced boron & magnesium foliar spray during boll formation'
        ],
        prevention: ['Maintain clean field borders free from malvaceous weed hosts'],
        regional_explanation: 'कपास की फसल स्वस्थ है। फूल व गूलर बनते समय आवश्यक सूक्ष्म पोषक तत्वों का ध्यान रखें।'
      };
    }
    // Default Cotton: Bacterial Blight
    return {
      ...baseDemoFields,
      crop: 'Cotton',
      disease: 'Cotton Bacterial Blight / Black Arm',
      scientific_name: 'Xanthomonas citri pv. malvacearum',
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

  // Corn Scenarios
  if (cropLower.includes('corn') || cropLower.includes('maize')) {
    if (sid.includes('blight') || sid.includes('northern')) {
      return {
        ...baseDemoFields,
        crop: 'Corn',
        disease: 'Northern Corn Leaf Blight',
        scientific_name: 'Exserohilum turcicum',
        severity: 'Severe',
        symptoms: [
          'Long elliptical grayish-green or tan lesions (cigar-shaped) on leaves',
          'Dark fungal spores visible in centers of old lesions during damp weather',
          'Extensive blighting of upper leaves during grain fill'
        ],
        advice: [
          'Foliar spray with Azoxystrobin + Difenoconazole @ 1ml/L or Propiconazole @ 1ml/L',
          'Ensure spray reaches both upper and lower canopy leaves'
        ],
        prevention: [
          'Select resistant corn hybrids with Ht gene protection',
          'Incorporate crop residue into soil after harvest'
        ],
        regional_explanation: 'मक्के में उत्तरी पत्ती झुलसा (Leaf Blight) के लक्षण हैं। एज़ोक्सीस्ट्रोबिन या प्रोपिकोनाजोल का छिड़काव करें।'
      };
    }
    if (sid.includes('healthy')) {
      return {
        ...baseDemoFields,
        crop: 'Corn',
        disease: 'Healthy Corn (Maize) Crop',
        scientific_name: 'Zea mays',
        severity: 'None',
        symptoms: [
          'Broad dark green leaves with strong stalk girth and normal tassel initiation',
          'No cigar-shaped blights or rust pustules'
        ],
        advice: [
          'Maintain adequate nitrogen split doses at knee-high and tasseling stages',
          'Scout for Fall Armyworm whorl damage'
        ],
        prevention: ['Ensure weed-free critical period during the first 30 days of growth'],
        regional_explanation: 'मक्के की फसल पूर्णतः स्वस्थ है। घुटने तक की ऊंचाई पर यूरिया की दूसरी खुराक दें।'
      };
    }
    // Default Corn: Common Rust
    return {
      ...baseDemoFields,
      crop: 'Corn',
      disease: 'Corn Common Rust',
      scientific_name: 'Puccinia sorghi',
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
      regional_explanation: 'मक्का में रतुआ (Common Rust) रोग के लक्षण दिखाई दे रहे हैं। मैंकोजेब अथवा सल्फर का छिड़काव करें।'
    };
  }

  // Tomato Scenarios
  if (sid.includes('late')) {
    return {
      ...baseDemoFields,
      crop: 'Tomato',
      disease: 'Tomato Late Blight',
      scientific_name: 'Phytophthora infestans',
      severity: 'Severe',
      symptoms: [
        'Large irregular water-soaked pale green lesions rapidly turning dark purplish-brown',
        'White cottony fungal growth on leaf undersides during humid weather',
        'Rapid collapse of foliage and brown greasy rot on green fruit'
      ],
      advice: [
        'Apply systemic fungicide Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L immediately',
        'Destroy heavily blighted foliage outside the field boundaries',
        'Spray Bordeaux mixture (1%) as an organic preventative barrier'
      ],
      prevention: [
        'Plant certified resistant hybrids and avoid fields near infected potato crops',
        'Ensure proper drainage to prevent field water stagnation'
      ],
      regional_explanation: 'पत्तियों पर पछेती झुलसा (Late Blight) का गंभीर संक्रमण है। तुरंत अनुशंसित फफूंदनाशक का छिड़काव करें ताकि फसल को नुकसान से बचाया जा सके।'
    };
  }

  if (sid.includes('healthy')) {
    return {
      ...baseDemoFields,
      crop: 'Tomato',
      disease: 'Healthy Tomato Crop',
      scientific_name: 'Solanum lycopersicum',
      severity: 'None',
      symptoms: [
        'Uniform green turgid foliage with healthy leaf venation',
        'No necrotic spots, powdery mildew, or viral curling detected'
      ],
      advice: [
        'No fungicide or chemical intervention needed at this stage',
        'Continue balanced N-P-K fertigation and standard scouting schedule',
        'Apply biostimulant or seaweed extract to maintain vegetative vigor'
      ],
      prevention: [
        'Maintain consistent drip watering schedule',
        'Keep monitoring yellow sticky traps for early whitefly or aphid arrivals'
      ],
      regional_explanation: 'पौधा पूरी तरह स्वस्थ है। किसी कीटनाशक की आवश्यकता नहीं है। नियमित पोषण और संतुलित सिंचाई जारी रखें।'
    };
  }

  // Default Tomato: Early Blight
  return {
    ...baseDemoFields,
    crop: 'Tomato',
    disease: 'Tomato Early Blight',
    scientific_name: 'Alternaria solani',
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
    regional_explanation: 'पत्तियों पर शुरुआती झुलसा (Early Blight) रोग के संकेत दिखाई दे रहे हैं। प्रभावित पत्तियों को हटाएँ, अधिक नमी से बचें और ध्यानपूर्वक निगरानी रखें।'
  };
}
