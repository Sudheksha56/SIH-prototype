/**
 * STARK - Agricultural Configuration & Knowledge Database
 * Team STARK - Smart India Hackathon 2026
 */

export const CROP_DATABASE = {
  tomato: {
    name: "Tomato",
    category: "Vegetable",
    perishability: "High",
    dailySpoilageRate: 0.045, // 4.5% per day without cold storage
    coldStorageSpoilageRate: 0.008, // 0.8% per day in cold storage
    maxShelfLifeDays: 6,
    optimalTempRange: "18°C - 24°C",
    standardYieldPerAcre: 2000, // kg
    baseMandiPrice: 26.5, // ₹/kg baseline
    defaultQualityGrade: "Grade A (Firm, Red)",
    varieties: ["Vaibhav", "Abhinav", "Rashmi", "Pusa Ruby", "Local Hybrid"],
    storageCostPerKgDay: 0.25, // ₹ per kg per day
    transportWeightFactor: 1.0,
    priceVolatility: "High",
    icon: "🍅"
  },
  potato: {
    name: "Potato",
    category: "Tuber",
    perishability: "Low",
    dailySpoilageRate: 0.004, // 0.4% per day
    coldStorageSpoilageRate: 0.0005,
    maxShelfLifeDays: 45,
    optimalTempRange: "10°C - 15°C",
    standardYieldPerAcre: 8000, // kg
    baseMandiPrice: 18.0, // ₹/kg baseline
    defaultQualityGrade: "Grade A (Large, Clean)",
    varieties: ["Kufri Jyoti", "Kufri Pukhraj", "Kufri Bahar", "Chandramukhi"],
    storageCostPerKgDay: 0.08,
    transportWeightFactor: 1.0,
    priceVolatility: "Moderate",
    icon: "🥔"
  },
  onion: {
    name: "Onion",
    category: "Bulb",
    perishability: "Moderate",
    dailySpoilageRate: 0.008, // 0.8% per day
    coldStorageSpoilageRate: 0.001,
    maxShelfLifeDays: 30,
    optimalTempRange: "15°C - 25°C",
    standardYieldPerAcre: 6000, // kg
    baseMandiPrice: 28.0, // ₹/kg baseline
    defaultQualityGrade: "Grade A (Medium-Large, Dry Outer Skin)",
    varieties: ["Nashik Red", "Bhima Super", "Pusa Red", "Agrifound Light Red"],
    storageCostPerKgDay: 0.12,
    transportWeightFactor: 1.0,
    priceVolatility: "Very High",
    icon: "🧅"
  },
  chilli: {
    name: "Green Chilli",
    category: "Vegetable / Spice",
    perishability: "High",
    dailySpoilageRate: 0.035, // 3.5% per day
    coldStorageSpoilageRate: 0.006,
    maxShelfLifeDays: 8,
    optimalTempRange: "15°C - 20°C",
    standardYieldPerAcre: 3500, // kg
    baseMandiPrice: 42.0, // ₹/kg baseline
    defaultQualityGrade: "Grade A (Deep Green, Unblemished)",
    varieties: ["Guntur Sannam", "Teja", "Byadgi", "Pusa Jwala"],
    storageCostPerKgDay: 0.35,
    transportWeightFactor: 0.9,
    priceVolatility: "High",
    icon: "🌶️"
  },
  rice: {
    name: "Paddy / Rice",
    category: "Grain / Cereal",
    perishability: "Very Low",
    dailySpoilageRate: 0.0005, // 0.05% per day
    coldStorageSpoilageRate: 0.0001,
    maxShelfLifeDays: 180,
    optimalTempRange: "20°C - 30°C",
    standardYieldPerAcre: 2400, // kg
    baseMandiPrice: 24.5, // ₹/kg baseline
    defaultQualityGrade: "Grade A (Common Non-Basmati)",
    varieties: ["BPT 5204 (Samba Mahsuri)", "IR 64", "ADT 37", "Ponni"],
    storageCostPerKgDay: 0.05,
    transportWeightFactor: 1.0,
    priceVolatility: "Low",
    icon: "🌾"
  },
  banana: {
    name: "Banana (Grand Naine)",
    category: "Fruit",
    perishability: "Very High",
    dailySpoilageRate: 0.055, // 5.5% per day
    coldStorageSpoilageRate: 0.012,
    maxShelfLifeDays: 5,
    optimalTempRange: "13°C - 15°C",
    standardYieldPerAcre: 15000, // kg
    baseMandiPrice: 19.0, // ₹/kg baseline
    defaultQualityGrade: "Export Quality Grade A",
    varieties: ["Grand Naine (G9)", "Robusta", "Poovan", "Rasthali"],
    storageCostPerKgDay: 0.30,
    transportWeightFactor: 1.1,
    priceVolatility: "Moderate",
    icon: "🍌"
  },
  wheat: {
    name: "Wheat",
    category: "Grain / Cereal",
    perishability: "Very Low",
    dailySpoilageRate: 0.0005,
    coldStorageSpoilageRate: 0.0001,
    maxShelfLifeDays: 180,
    optimalTempRange: "15°C - 25°C",
    standardYieldPerAcre: 1800,
    baseMandiPrice: 25.0,
    defaultQualityGrade: "Grade A (Sharbati / Mill Quality)",
    varieties: ["HD 2967", "HD 3086", "Sharbati", "PBW 550"],
    storageCostPerKgDay: 0.05,
    transportWeightFactor: 1.0,
    priceVolatility: "Low",
    icon: "🌾"
  },
  cotton: {
    name: "Raw Cotton (Kapas)",
    category: "Cash Crop / Fiber",
    perishability: "Very Low",
    dailySpoilageRate: 0.0002,
    coldStorageSpoilageRate: 0.0001,
    maxShelfLifeDays: 120,
    optimalTempRange: "20°C - 35°C",
    standardYieldPerAcre: 1000,
    baseMandiPrice: 72.0,
    defaultQualityGrade: "Medium Long Staple",
    varieties: ["Bt Cotton Hybrid", "RCH 2", "Bunny Bt"],
    storageCostPerKgDay: 0.06,
    transportWeightFactor: 0.7,
    priceVolatility: "Moderate",
    icon: "☁️"
  }
};

export const REGIONAL_MANDIS = [
  // Tamil Nadu Mandis (Karur Hub)
  {
    id: "mandi_karur_main",
    name: "Karur Regulated Market (APMC)",
    state: "Tamil Nadu",
    district: "Karur",
    latitude: 10.9601,
    longitude: 78.0766,
    commissionRatePercent: 1.5,
    paymentTerms: "Same-Day Direct Bank Transfer",
    reliabilityRating: 4.8,
    dailyArrivalTonnes: 120,
    priceMultiplier: { tomato: 1.0, potato: 1.0, onion: 1.02, chilli: 1.04, rice: 1.0, banana: 1.05, wheat: 0.98, cotton: 1.01 },
    marketTrends: { tomato: "+2.4% (High Buyer Footfall)", potato: "+0.5%", onion: "-1.2%", chilli: "+4.1%", rice: "0%", banana: "+1.8%", wheat: "0%", cotton: "+0.8%" }
  },
  {
    id: "mandi_dindigul_central",
    name: "Dindigul Vegetable Wholesale Market",
    state: "Tamil Nadu",
    district: "Dindigul",
    latitude: 10.3673,
    longitude: 77.9803,
    commissionRatePercent: 2.0,
    paymentTerms: "24-Hour UPI / Cash",
    reliabilityRating: 4.6,
    dailyArrivalTonnes: 340,
    priceMultiplier: { tomato: 1.08, potato: 1.03, onion: 1.06, chilli: 1.12, rice: 0.99, banana: 1.08, wheat: 0.97, cotton: 1.0 },
    marketTrends: { tomato: "+5.1% (Export Demand Spurt)", potato: "+1.2%", onion: "+3.0%", chilli: "+6.5%", rice: "+0.2%", banana: "+3.2%", wheat: "-0.5%", cotton: "+0.5%" }
  },
  {
    id: "mandi_trichy_gandhi",
    name: "Tiruchirappalli Gandhi Market Hub",
    state: "Tamil Nadu",
    district: "Tiruchirappalli",
    latitude: 10.7905,
    longitude: 78.7047,
    commissionRatePercent: 2.5,
    paymentTerms: "Instant Cash at Gate",
    reliabilityRating: 4.7,
    dailyArrivalTonnes: 450,
    priceMultiplier: { tomato: 1.05, potato: 1.04, onion: 1.08, chilli: 1.07, rice: 1.03, banana: 1.11, wheat: 1.0, cotton: 1.02 },
    marketTrends: { tomato: "+3.8% (Hotel & Caterer Buying)", potato: "+2.0%", onion: "+4.2%", chilli: "+3.5%", rice: "+1.0%", banana: "+5.0%", wheat: "+0.4%", cotton: "+1.1%" }
  },
  {
    id: "mandi_salem_apmc",
    name: "Salem Central Agri Commercial APMC",
    state: "Tamil Nadu",
    district: "Salem",
    latitude: 11.6643,
    longitude: 78.1460,
    commissionRatePercent: 1.8,
    paymentTerms: "Same-Day NEFT",
    reliabilityRating: 4.5,
    dailyArrivalTonnes: 280,
    priceMultiplier: { tomato: 1.02, potato: 1.06, onion: 1.04, chilli: 1.05, rice: 1.01, banana: 1.02, wheat: 1.02, cotton: 1.08 },
    marketTrends: { tomato: "+1.5%", potato: "+2.8%", onion: "+1.0%", chilli: "+2.1%", rice: "0%", banana: "+0.8%", wheat: "+1.2%", cotton: "+3.4%" }
  },
  {
    id: "mandi_madurai_mattuthavani",
    name: "Madurai Mattuthavani Central Market",
    state: "Tamil Nadu",
    district: "Madurai",
    latitude: 9.9252,
    longitude: 78.1198,
    commissionRatePercent: 2.2,
    paymentTerms: "Instant Cash & Token",
    reliabilityRating: 4.9,
    dailyArrivalTonnes: 520,
    priceMultiplier: { tomato: 1.10, potato: 1.05, onion: 1.09, chilli: 1.15, rice: 1.02, banana: 1.14, wheat: 0.99, cotton: 1.03 },
    marketTrends: { tomato: "+6.2% (Heavy Southern Demand)", potato: "+1.8%", onion: "+5.1%", chilli: "+7.0%", rice: "+0.8%", banana: "+6.1%", wheat: "0%", cotton: "+1.5%" }
  },
  {
    id: "mandi_coimbatore_mgg",
    name: "Coimbatore M.G.R Wholesale Market",
    state: "Tamil Nadu",
    district: "Coimbatore",
    latitude: 11.0168,
    longitude: 76.9558,
    commissionRatePercent: 2.0,
    paymentTerms: "24-Hour UPI / Bank",
    reliabilityRating: 4.8,
    dailyArrivalTonnes: 600,
    priceMultiplier: { tomato: 1.07, potato: 1.08, onion: 1.11, chilli: 1.09, rice: 1.04, banana: 1.09, wheat: 1.03, cotton: 1.12 },
    marketTrends: { tomato: "+4.0% (Kerala Interstate Trade)", potato: "+3.5%", onion: "+4.8%", chilli: "+4.0%", rice: "+1.5%", banana: "+4.2%", wheat: "+2.0%", cotton: "+4.5%" }
  },

  // Maharashtra Hubs (e.g. Nashik / Pune)
  {
    id: "mandi_nashik_pimpalgaon",
    name: "Pimpalgaon Baswant APMC (Onion Capital)",
    state: "Maharashtra",
    district: "Nashik",
    latitude: 20.1742,
    longitude: 73.9856,
    commissionRatePercent: 1.5,
    paymentTerms: "Direct Bank Transfer (DBT)",
    reliabilityRating: 4.9,
    dailyArrivalTonnes: 1200,
    priceMultiplier: { tomato: 1.04, potato: 1.02, onion: 1.16, chilli: 1.08, rice: 0.98, banana: 1.02, wheat: 1.02, cotton: 1.06 },
    marketTrends: { tomato: "+2.0%", potato: "+0.8%", onion: "+8.4% (Bulk Traders Active)", chilli: "+3.2%", rice: "0%", banana: "+1.1%", wheat: "+0.5%", cotton: "+2.0%" }
  },
  {
    id: "mandi_lasalgaon_apmc",
    name: "Lasalgaon APMC (Asia's Largest Onion Market)",
    state: "Maharashtra",
    district: "Nashik",
    latitude: 20.1472,
    longitude: 74.2256,
    commissionRatePercent: 1.2,
    paymentTerms: "Direct RTGS in 48h",
    reliabilityRating: 4.9,
    dailyArrivalTonnes: 2500,
    priceMultiplier: { tomato: 0.98, potato: 1.01, onion: 1.18, chilli: 1.05, rice: 0.96, banana: 1.01, wheat: 1.01, cotton: 1.04 },
    marketTrends: { tomato: "0%", potato: "+0.2%", onion: "+9.1% (Export Quota Opening)", chilli: "+2.0%", rice: "-0.5%", banana: "0%", wheat: "0%", cotton: "+1.2%" }
  },

  // Uttar Pradesh Hubs (e.g. Agra / Kanpur)
  {
    id: "mandi_agra_fatehabad",
    name: "Agra Fatehabad Road Potato APMC",
    state: "Uttar Pradesh",
    district: "Agra",
    latitude: 27.1767,
    longitude: 78.0081,
    commissionRatePercent: 1.8,
    paymentTerms: "Cold Storage Receipt / Cash",
    reliabilityRating: 4.7,
    dailyArrivalTonnes: 1800,
    priceMultiplier: { tomato: 1.02, potato: 1.14, onion: 1.03, chilli: 1.04, rice: 1.02, banana: 0.95, wheat: 1.08, cotton: 0.92 },
    marketTrends: { tomato: "+1.0%", potato: "+5.6% (Cold Store Inflow High)", onion: "+1.2%", chilli: "+1.8%", rice: "+1.0%", banana: "-1.0%", wheat: "+3.2%", cotton: "0%" }
  },

  // Andhra Pradesh Hubs (e.g. Guntur)
  {
    id: "mandi_guntur_mirchi_yard",
    name: "Guntur Mirchi Yard (Asia's Largest Chilli Mandi)",
    state: "Andhra Pradesh",
    district: "Guntur",
    latitude: 16.3067,
    longitude: 80.4365,
    commissionRatePercent: 1.5,
    paymentTerms: "Immediate e-NAM Settlement",
    reliabilityRating: 5.0,
    dailyArrivalTonnes: 950,
    priceMultiplier: { tomato: 1.01, potato: 0.99, onion: 1.04, chilli: 1.25, rice: 1.05, banana: 1.03, wheat: 0.96, cotton: 1.10 },
    marketTrends: { tomato: "+0.8%", potato: "0%", onion: "+2.0%", chilli: "+11.4% (Spice Exporters Bidding)", rice: "+2.1%", banana: "+1.5%", wheat: "-0.8%", cotton: "+3.9%" }
  }
];

export const DEMO_PROFILES = {
  ramesh: {
    id: "ramesh",
    farmerName: "Ramesh K.",
    phone: "+91 98421 XXXXX",
    state: "Tamil Nadu",
    district: "Karur",
    latitude: 10.9601,
    longitude: 78.0766,
    crop: "tomato",
    cropVariety: "Vaibhav Hybrid (Red)",
    landAreaAcres: 2.0,
    expectedYieldKg: 4000,
    expectedHarvestDate: "2026-09-04",
    cropStage: "Harvesting",
    qualityGrade: "Grade A (Firm, Red)",
    costs: {
      seeds: 4200,
      fertilizer: 6800,
      labour: 11500,
      irrigation: 3200,
      pesticides: 4300,
      transportPerKm: 18,
      storageCostPerDay: 400,
      otherCosts: 2000
    },
    optional: {
      currentBuyerOffer: 22.0,
      availableQuantityKg: 4000,
      storageCapacityKg: 5000,
      maxStorageDays: 4,
      hasColdStorage: false
    },
    demoStory: "Ramesh has 4,000 kg of harvested Grade A tomatoes in Karur. A local village aggregator is offering ₹22/kg, while regional mandis are offering up to ₹29/kg. The engine will evaluate transport costs, spoilage, and suggest the optimal strategy."
  },
  priya: {
    id: "priya",
    farmerName: "Priya Sharma",
    phone: "+91 97190 XXXXX",
    state: "Uttar Pradesh",
    district: "Agra",
    latitude: 27.1767,
    longitude: 78.0081,
    crop: "potato",
    cropVariety: "Kufri Jyoti (Table Potato)",
    landAreaAcres: 3.5,
    expectedYieldKg: 18000,
    expectedHarvestDate: "2026-09-10",
    cropStage: "Post-Harvest Stored",
    qualityGrade: "Grade A (Large, Clean)",
    costs: {
      seeds: 18000,
      fertilizer: 22000,
      labour: 28000,
      irrigation: 7500,
      pesticides: 8000,
      transportPerKm: 28,
      storageCostPerDay: 350,
      otherCosts: 4500
    },
    optional: {
      currentBuyerOffer: 16.5,
      availableQuantityKg: 18000,
      storageCapacityKg: 25000,
      maxStorageDays: 35,
      hasColdStorage: true
    },
    demoStory: "Priya harvested 18,000 kg of potatoes in Agra. Since potatoes have very low daily spoilage in cold storage and prices are forecast to rise +8% over the next 10 days, should she store and wait or offload immediately?"
  },
  suresh: {
    id: "suresh",
    farmerName: "Suresh Patil",
    phone: "+91 98224 XXXXX",
    state: "Maharashtra",
    district: "Nashik",
    latitude: 20.0059,
    longitude: 73.7898,
    crop: "onion",
    cropVariety: "Nashik Red Summer Crop",
    landAreaAcres: 2.5,
    expectedYieldKg: 12000,
    expectedHarvestDate: "2026-09-06",
    cropStage: "Harvesting",
    qualityGrade: "Grade A (Medium-Large, Dry)",
    costs: {
      seeds: 9500,
      fertilizer: 14000,
      labour: 19500,
      irrigation: 4800,
      pesticides: 6200,
      transportPerKm: 22,
      storageCostPerDay: 280,
      otherCosts: 3000
    },
    optional: {
      currentBuyerOffer: 25.0,
      availableQuantityKg: 12000,
      storageCapacityKg: 15000,
      maxStorageDays: 20,
      hasColdStorage: false
    },
    demoStory: "Suresh has 12,000 kg Nashik Red onions. Lasalgaon and Pimpalgaon mandis are offering ₹31-33/kg due to rising national demand, but transport logistics and humidity need to be balanced."
  },
  venkatesh: {
    id: "venkatesh",
    farmerName: "Venkatesh Rao",
    phone: "+91 94402 XXXXX",
    state: "Andhra Pradesh",
    district: "Guntur",
    latitude: 16.3067,
    longitude: 80.4365,
    crop: "chilli",
    cropVariety: "Guntur Teja S17",
    landAreaAcres: 1.5,
    expectedYieldKg: 3200,
    expectedHarvestDate: "2026-09-05",
    cropStage: "Harvesting",
    qualityGrade: "Grade A (Deep Green, Unblemished)",
    costs: {
      seeds: 6500,
      fertilizer: 11000,
      labour: 16000,
      irrigation: 3500,
      pesticides: 8500,
      transportPerKm: 18,
      storageCostPerDay: 300,
      otherCosts: 2500
    },
    optional: {
      currentBuyerOffer: 38.0,
      availableQuantityKg: 3200,
      storageCapacityKg: 4000,
      maxStorageDays: 7,
      hasColdStorage: false
    },
    demoStory: "Venkatesh in Guntur has 3,200 kg high-grade green chilli. Local trader offered ₹38/kg, while Guntur Mirchi Yard is auctioning at ₹52/kg. The decision engine will highlight the huge profit arbitrage."
  }
};

export const DEFAULT_SCORING_WEIGHTS = {
  profitWeight: 0.35,
  marketWeight: 0.25,
  spoilageWeight: 0.20,
  transportWeight: 0.10,
  weatherWeight: 0.10
};

export const SMART_BUY_CATALOG = [
  {
    id: "prod_01",
    name: "Bio-NPK Organic Fertilizer (Liquid Gold)",
    category: "Fertilizer",
    brand: "KrishiVeda AgriTech",
    suitableCrops: ["all"],
    suitableStages: ["Vegetative", "Flowering", "Sowing"],
    price: 650,
    unit: "1 Litre bottle",
    rating: 4.8,
    reviews: 142,
    inStock: true,
    badge: "⚡ AI Recommended for Soil Health",
    description: "Multi-strain consortium of nitrogen fixing and phosphorus solubilizing bio-cultures. Improves root uptake by 30%."
  },
  {
    id: "prod_02",
    name: "Calcium Nitrate + Boron (Blossom End Rot Shield)",
    category: "Crop Protection",
    brand: "AgroNutri Core",
    suitableCrops: ["tomato", "chilli", "banana"],
    suitableStages: ["Flowering", "Harvesting"],
    price: 890,
    unit: "5 Kg Bag",
    rating: 4.9,
    reviews: 218,
    inStock: true,
    badge: "🍅 Essential for Tomato & Chilli Quality",
    description: "Prevents blossom end rot and skin cracking. Guarantees firm Grade-A fruit skin and longer shelf life."
  },
  {
    id: "prod_03",
    name: "Yellow Sticky Pheromone Traps (Pack of 25)",
    category: "Pest Protection",
    brand: "BioTrap Safe",
    suitableCrops: ["tomato", "chilli", "onion", "cotton"],
    suitableStages: ["Vegetative", "Flowering", "Harvesting"],
    price: 380,
    unit: "Pack of 25 traps",
    rating: 4.7,
    reviews: 95,
    inStock: true,
    badge: "🌿 Zero Chemical Residue",
    description: "Catches whiteflies, thrips, leafminers, and aphids naturally. 100% waterproof UV-stabilized polymer."
  },
  {
    id: "prod_04",
    name: "Humic & Fulvic Acid Root Stimulator (98% Active)",
    category: "Fertilizer",
    brand: "GrowPlus Bio",
    suitableCrops: ["all"],
    suitableStages: ["Sowing", "Vegetative"],
    price: 490,
    unit: "1 Kg Pack",
    rating: 4.6,
    reviews: 87,
    inStock: true,
    badge: "🌱 Rapid Root Growth",
    description: "Enhances nutrient assimilation and increases soil cation exchange capacity."
  },
  {
    id: "prod_05",
    name: "Food-Grade Aerated Harvesting Crates (20 kg cap)",
    category: "Storage & Transport",
    brand: "PlastoFarm Pro",
    suitableCrops: ["tomato", "chilli", "banana"],
    suitableStages: ["Harvesting", "Post-Harvest Stored"],
    price: 260,
    unit: "Per Crate (Bundle of 10 available)",
    rating: 4.9,
    reviews: 310,
    inStock: true,
    badge: "🚚 Reduces In-Transit Spoilage by 60%",
    description: "Heavy-duty HDPE stackable crates with precision side perforations for optimal cross-ventilation during transit."
  },
  {
    id: "prod_06",
    name: "Neem Oil 10,000 PPM Cold Pressed Organic Repellent",
    category: "Pest Protection",
    brand: "NeemShield Organics",
    suitableCrops: ["all"],
    suitableStages: ["Vegetative", "Flowering"],
    price: 520,
    unit: "1 Litre bottle",
    rating: 4.7,
    reviews: 164,
    inStock: true,
    badge: "🍃 Certified Organic",
    description: "Broad spectrum botanical antifeedant and oviposition deterrent for over 200 insect pest species."
  },
  {
    id: "prod_07",
    name: "Cold Chain Thermal Insulated Crop Covers (20x20 ft)",
    category: "Storage & Transport",
    brand: "ThermoGuard Agri",
    suitableCrops: ["tomato", "chilli", "banana", "potato"],
    suitableStages: ["Harvesting", "Post-Harvest Stored"],
    price: 1450,
    unit: "1 Sheet (20x20 ft)",
    rating: 4.8,
    reviews: 62,
    inStock: true,
    badge: "❄️ Reduces Solar Heat Degradation",
    description: "Reflective silver outer layer keeps produce 5°C-8°C cooler during open truck transit to distant mandis."
  },
  {
    id: "prod_08",
    name: "Sprout Inhibitor Powder for Potato & Onion Storage",
    category: "Storage & Transport",
    brand: "CropSafe BioTech",
    suitableCrops: ["potato", "onion"],
    suitableStages: ["Post-Harvest Stored"],
    price: 390,
    unit: "500g Dispenser",
    rating: 4.6,
    reviews: 110,
    inStock: true,
    badge: "🥔 Extends Shelf Life by 30 Days",
    description: "CIPC herbal formulation that suppresses sprout emergence and dormancy loss during ambient warehouse storage."
  }
];

export const VERIFIED_BUYERS = [
  {
    id: "buyer_01",
    name: "FreshDirect Agri Supermarket Chain",
    type: "Retail Chain / Supermarket",
    location: "Trichy & Karur Hub",
    distanceKm: 24,
    rating: 4.9,
    ordersCompleted: 1420,
    preferredGrade: "Grade A",
    paymentMode: "Direct Bank UPI in 2 Hours",
    priceOfferPremium: 1.03,
    logisticsSupport: "Doorstep Farm Pickup Available (-₹0.8/kg)",
    badge: "👑 Top Rated Institutional Buyer"
  },
  {
    id: "buyer_02",
    name: "Kovai Green Wholesale Aggregators",
    type: "Wholesale Mandi Merchant",
    location: "Dindigul & Coimbatore",
    distanceKm: 68,
    rating: 4.7,
    ordersCompleted: 980,
    preferredGrade: "Grade A & B",
    paymentMode: "Same Day RTGS",
    priceOfferPremium: 1.05,
    logisticsSupport: "Farmer Delivery Required",
    badge: "⚡ Fast Bulk Settlement"
  },
  {
    id: "buyer_03",
    name: "AgroProcessing Ltd. (Puree & Pulp Div)",
    type: "Industrial Food Processor",
    location: "Madurai Agri SEZ",
    distanceKm: 110,
    rating: 4.8,
    ordersCompleted: 2150,
    preferredGrade: "Processing Grade / Grade A",
    paymentMode: "Contract Escrow in 24h",
    priceOfferPremium: 1.02,
    logisticsSupport: "Assisted Logistics (Bulk 5+ Tonnes)",
    badge: "🏭 High Volume Guaranteed Take"
  },
  {
    id: "buyer_04",
    name: "Local Village Middleman Aggregator",
    type: "Local Trader",
    location: "Karur Village Outskirts",
    distanceKm: 4,
    rating: 3.8,
    ordersCompleted: 240,
    preferredGrade: "All Grades",
    paymentMode: "Immediate Cash (Discounted)",
    priceOfferPremium: 0.88,
    logisticsSupport: "Pickup at Farm Gate",
    badge: "⚠️ Low Offer / Cash Discount"
  }
];
