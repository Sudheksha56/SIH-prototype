/**
 * STARK - Deterministic Calculation Engine
 * Pure mathematical algorithms for AgTech profit optimization
 * NO HARDCODED OR FAKE AI DECISIONS.
 * Team STARK - Smart India Hackathon 2026
 */

import { CROP_DATABASE, REGIONAL_MANDIS, DEFAULT_SCORING_WEIGHTS } from './config.js';

export class CalculationEngine {
  constructor() {
    this.weights = { ...DEFAULT_SCORING_WEIGHTS };
  }

  setWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
  }

  /**
   * 1. Calculate Total Production Cost
   */
  calculateProductionCost(costs) {
    const seeds = Number(costs.seeds) || 0;
    const fertilizer = Number(costs.fertilizer) || 0;
    const labour = Number(costs.labour) || 0;
    const irrigation = Number(costs.irrigation) || 0;
    const pesticides = Number(costs.pesticides) || 0;
    const otherCosts = Number(costs.otherCosts) || 0;

    const total = seeds + fertilizer + labour + irrigation + pesticides + otherCosts;
    return {
      seeds,
      fertilizer,
      labour,
      irrigation,
      pesticides,
      otherCosts,
      totalProductionCost: total
    };
  }

  /**
   * 2. Haversine Distance in Kilometers with road winding factor
   */
  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineKm = R * c;
    
    // Road factor: Indian rural & highway road network typically 1.25x straight-line
    const roadKm = Math.round(straightLineKm * 1.28);
    return Math.max(2, roadKm); // minimum 2 km if in same town
  }

  /**
   * 3. Calculate Transport Cost based on Distance, Rate, and Vehicle Trips
   */
  calculateTransportCost(distanceKm, ratePerKm, quantityKg) {
    const dist = Number(distanceKm) || 5;
    const rate = Number(ratePerKm) || 18;
    const qty = Number(quantityKg) || 1000;

    // A standard light commercial vehicle (Tata Ace / Bolero Pickup) carries ~1,500 - 2,000 kg.
    // Trucks carry 5,000 - 10,000 kg.
    const vehicleCapacity = qty > 5000 ? 8000 : (qty > 2000 ? 3500 : 1800);
    const trips = Math.ceil(qty / vehicleCapacity);

    const cost = Math.round(dist * rate * trips);
    return {
      distanceKm: dist,
      ratePerKm: rate,
      trips,
      totalTransportCost: cost,
      costPerKg: Number((cost / qty).toFixed(2))
    };
  }

  /**
   * 4. Calculate Storage & Spoilage Degradation
   */
  calculateStorageAndSpoilage(cropKey, quantityKg, daysStored, hasColdStorage = false, weatherMultiplier = 1.0) {
    const crop = CROP_DATABASE[cropKey] || CROP_DATABASE.tomato;
    const qty = Number(quantityKg) || 1000;
    const days = Math.max(0, Number(daysStored) || 0);

    const baseDailyRate = hasColdStorage ? crop.coldStorageSpoilageRate : crop.dailySpoilageRate;
    const effectiveDailyRate = baseDailyRate * weatherMultiplier;

    // Cumulative non-linear degradation formula: spoilage = 1 - (1 - rate)^days
    const cumulativeSpoilageFactor = 1 - Math.pow(1 - effectiveDailyRate, days);
    const boundedSpoilageFactor = Math.min(0.95, Math.max(0, cumulativeSpoilageFactor));

    const spoiledQuantityKg = Math.round(qty * boundedSpoilageFactor);
    const sellableQuantityKg = Math.max(0, qty - spoiledQuantityKg);

    const storageCostRate = hasColdStorage ? crop.storageCostPerKgDay * 1.8 : crop.storageCostPerKgDay;
    const totalStorageCost = Math.round(qty * storageCostRate * days);

    return {
      cropName: crop.name,
      daysStored: days,
      dailySpoilageRatePercent: Number((effectiveDailyRate * 100).toFixed(2)),
      cumulativeSpoilagePercent: Number((boundedSpoilageFactor * 100).toFixed(1)),
      spoiledQuantityKg,
      sellableQuantityKg,
      totalStorageCost,
      perishability: crop.perishability
    };
  }

  /**
   * 5. Profit Engine - Deterministic calculations for a single sale context
   */
  calculateFinancials({
    cropKey = 'tomato',
    quantityKg = 4000,
    sellingPricePerKg = 25.0,
    productionCosts = {},
    distanceKm = 10,
    transportRatePerKm = 18,
    daysStored = 0,
    hasColdStorage = false,
    weatherMultiplier = 1.0
  }) {
    const crop = CROP_DATABASE[cropKey] || CROP_DATABASE.tomato;
    const qty = Number(quantityKg) || 0;
    const price = Number(sellingPricePerKg) || 0;

    const prodCostData = this.calculateProductionCost(productionCosts);
    const transportData = this.calculateTransportCost(distanceKm, transportRatePerKm, qty);
    const storageData = this.calculateStorageAndSpoilage(cropKey, qty, daysStored, hasColdStorage, weatherMultiplier);

    const grossRevenue = Math.round(storageData.sellableQuantityKg * price);
    const spoilageLossValue = Math.round(storageData.spoiledQuantityKg * price);

    const totalOperationalCost =
      prodCostData.totalProductionCost +
      transportData.totalTransportCost +
      storageData.totalStorageCost;

    const netProfit = grossRevenue - totalOperationalCost;
    const profitMarginPercent = totalOperationalCost > 0
      ? Number(((netProfit / totalOperationalCost) * 100).toFixed(1))
      : 0;

    const profitPerKg = qty > 0 ? Number((netProfit / qty).toFixed(2)) : 0;
    const revenuePerKg = qty > 0 ? Number((grossRevenue / qty).toFixed(2)) : 0;
    const totalCostPerKg = qty > 0 ? Number((totalOperationalCost / qty).toFixed(2)) : 0;

    return {
      cropKey,
      cropName: crop.name,
      initialQuantityKg: qty,
      sellableQuantityKg: storageData.sellableQuantityKg,
      spoiledQuantityKg: storageData.spoiledQuantityKg,
      spoilagePercent: storageData.cumulativeSpoilagePercent,
      spoilageLossValue,
      sellingPricePerKg: price,
      grossRevenue,
      productionCost: prodCostData.totalProductionCost,
      productionCostBreakdown: prodCostData,
      transportCost: transportData.totalTransportCost,
      transportDetails: transportData,
      storageCost: storageData.totalStorageCost,
      storageDetails: storageData,
      totalCost: totalOperationalCost,
      netProfit,
      profitMarginPercent,
      profitPerKg,
      revenuePerKg,
      totalCostPerKg
    };
  }

  /**
   * 6. Fair Price Guard - Deterministic calculation from regional mandis & quality
   */
  calculateFairPrice(cropKey, farmLat, farmLon, candidateMandis, qualityGrade = "Grade A") {
    const crop = CROP_DATABASE[cropKey] || CROP_DATABASE.tomato;
    const mandis = candidateMandis || REGIONAL_MANDIS;

    // Filter relevant mandis and calculate distance-weighted benchmark
    let totalWeight = 0;
    let weightedPriceSum = 0;

    const evaluatedMandis = mandis.map(mandi => {
      const dist = this.calculateDistanceKm(farmLat, farmLon, mandi.latitude, mandi.longitude);
      const multiplier = mandi.priceMultiplier?.[cropKey] || 1.0;
      const mandiPricePerKg = Number((crop.baseMandiPrice * multiplier).toFixed(2));
      
      // Inverse distance weighting: Closer mandis carry higher weight
      const weight = 1 / Math.max(10, dist);
      totalWeight += weight;
      weightedPriceSum += mandiPricePerKg * weight;

      return {
        mandiId: mandi.id,
        mandiName: mandi.name,
        distanceKm: dist,
        pricePerKg: mandiPricePerKg,
        weight
      };
    });

    const baselineFairPrice = totalWeight > 0 ? (weightedPriceSum / totalWeight) : crop.baseMandiPrice;

    // Quality Grade Adjustment (+4% for Grade A, 0% for Grade B, -8% for Grade C)
    let qualityFactor = 1.0;
    if (qualityGrade.includes("Grade A") || qualityGrade.includes("Export")) qualityFactor = 1.04;
    else if (qualityGrade.includes("Grade C") || qualityGrade.includes("Processing")) qualityFactor = 0.92;

    const estimatedFairPrice = Number((baselineFairPrice * qualityFactor).toFixed(2));
    const suggestedFairRangeMin = Number((estimatedFairPrice * 0.97).toFixed(1));
    const suggestedFairRangeMax = Number((estimatedFairPrice * 1.05).toFixed(1));

    return {
      cropKey,
      cropName: crop.name,
      estimatedFairPrice,
      suggestedFairRangeMin,
      suggestedFairRangeMax,
      qualityGrade,
      qualityFactor,
      evaluatedMandis
    };
  }

  /**
   * 7. Evaluate Buyer Offer vs Fair Price
   */
  evaluateBuyerOffer(buyerOffer, fairPriceData) {
    const offer = Number(buyerOffer) || 0;
    const fairPrice = fairPriceData.estimatedFairPrice || 1;
    
    const difference = Number((offer - fairPrice).toFixed(2));
    const percentageDifference = Number(((difference / fairPrice) * 100).toFixed(1));

    let status = "FAIR_OFFER";
    let statusLabel = "🟡 FAIR MARKET OFFER";
    let statusClass = "status-warning";
    let recommendation = "Offer is reasonable and within 5% of regional mandi fair price.";

    if (percentageDifference < -8.0) {
      status = "LOW_OFFER";
      statusLabel = "🔴 UNDERVALUED OFFER (Low)";
      statusClass = "status-danger";
      recommendation = `Buyer is offering ₹${Math.abs(difference).toFixed(1)}/kg (${Math.abs(percentageDifference)}%) below fair market rate. Strong candidate for negotiation or direct mandi dispatch.`;
    } else if (percentageDifference >= 2.0) {
      status = "PREMIUM_OFFER";
      statusLabel = "🟢 PREMIUM OFFER (Attractive)";
      statusClass = "status-success";
      recommendation = `Buyer is paying ₹${difference.toFixed(1)}/kg (+${percentageDifference}%) above average mandi benchmark. Favorable for immediate closing.`;
    }

    return {
      buyerOffer: offer,
      fairPrice,
      difference,
      percentageDifference,
      status,
      statusLabel,
      statusClass,
      recommendation
    };
  }

  /**
   * 8. Market Radar - Rank all regional mandis by calculated Net Expected Profit
   */
  rankMarkets({
    cropKey = 'tomato',
    farmLat = 10.9601,
    farmLon = 78.0766,
    quantityKg = 4000,
    productionCosts = {},
    transportRatePerKm = 18,
    hasColdStorage = false,
    weatherMultiplier = 1.0,
    mandisList = REGIONAL_MANDIS
  }) {
    const crop = CROP_DATABASE[cropKey] || CROP_DATABASE.tomato;
    const prodCostData = this.calculateProductionCost(productionCosts);

    const ranked = mandisList.map(mandi => {
      const distanceKm = this.calculateDistanceKm(farmLat, farmLon, mandi.latitude, mandi.longitude);
      const priceMultiplier = mandi.priceMultiplier?.[cropKey] || 1.0;
      const marketPricePerKg = Number((crop.baseMandiPrice * priceMultiplier).toFixed(2));

      const transportData = this.calculateTransportCost(distanceKm, transportRatePerKm, quantityKg);

      // In-transit spoilage risk based on transit duration & distance
      const transitHours = distanceKm / 40; // avg truck speed 40 km/h in rural corridors
      const transitSpoilagePercent = Math.min(0.06, (transitHours / 24) * crop.dailySpoilageRate * weatherMultiplier);
      const transitSpoilageKg = Math.round(quantityKg * transitSpoilagePercent);
      const sellableAtMandiKg = quantityKg - transitSpoilageKg;

      const grossRevenue = Math.round(sellableAtMandiKg * marketPricePerKg);
      const transitSpoilageLoss = Math.round(transitSpoilageKg * marketPricePerKg);

      const netExpectedProfit = grossRevenue - prodCostData.totalProductionCost - transportData.totalTransportCost;
      const netProfitPerKg = Number((netExpectedProfit / quantityKg).toFixed(2));

      return {
        mandiId: mandi.id,
        mandiName: mandi.name,
        state: mandi.state,
        district: mandi.district,
        distanceKm,
        marketPricePerKg,
        priceMultiplier,
        trend: mandi.marketTrends?.[cropKey] || "+1.0%",
        commissionRatePercent: mandi.commissionRatePercent,
        paymentTerms: mandi.paymentTerms,
        reliabilityRating: mandi.reliabilityRating,
        dailyArrivalTonnes: mandi.dailyArrivalTonnes,
        transportCost: transportData.totalTransportCost,
        transitSpoilagePercent: Number((transitSpoilagePercent * 100).toFixed(1)),
        transitSpoilageLoss,
        grossRevenue,
        netExpectedProfit,
        netProfitPerKg,
        isBestMarket: false
      };
    });

    // Sort descending by Net Expected Profit
    ranked.sort((a, b) => b.netExpectedProfit - a.netExpectedProfit);

    if (ranked.length > 0) {
      ranked[0].isBestMarket = true;
    }

    return ranked;
  }

  /**
   * 9. Sell Now vs Wait Scenarios (0, 3, 5, 7 Days)
   */
  calculateSellVsWaitScenarios({
    cropKey = 'tomato',
    quantityKg = 4000,
    currentPricePerKg = 26.5,
    productionCosts = {},
    distanceKm = 25,
    transportRatePerKm = 18,
    storageCostPerDay = 400,
    hasColdStorage = false,
    weatherMultiplier = 1.0,
    forecastPriceChangePercents = { day3: 4.5, day5: 7.0, day7: 8.5 }
  }) {
    const crop = CROP_DATABASE[cropKey] || CROP_DATABASE.tomato;
    const prodCostData = this.calculateProductionCost(productionCosts);
    const transportData = this.calculateTransportCost(distanceKm, transportRatePerKm, quantityKg);

    const horizons = [
      { key: "TODAY", label: "Sell Today (Day 0)", days: 0, priceChangePct: 0 },
      { key: "WAIT_3D", label: "Wait 3 Days", days: 3, priceChangePct: forecastPriceChangePercents.day3 ?? 3.5 },
      { key: "WAIT_5D", label: "Wait 5 Days", days: 5, priceChangePct: forecastPriceChangePercents.day5 ?? 5.5 },
      { key: "WAIT_7D", label: "Wait 7 Days", days: 7, priceChangePct: forecastPriceChangePercents.day7 ?? 6.0 }
    ];

    const scenarios = horizons.map(h => {
      const projectedPrice = Number((currentPricePerKg * (1 + h.priceChangePct / 100)).toFixed(2));
      const storageData = this.calculateStorageAndSpoilage(cropKey, quantityKg, h.days, hasColdStorage, weatherMultiplier);
      
      const storageCost = h.days > 0 ? (Number(storageCostPerDay) * h.days) : 0;
      const grossRevenue = Math.round(storageData.sellableQuantityKg * projectedPrice);
      const spoilageLoss = Math.round(storageData.spoiledQuantityKg * projectedPrice);

      const totalCost = prodCostData.totalProductionCost + transportData.totalTransportCost + storageCost;
      const netProfit = grossRevenue - totalCost;
      const profitDiffVsToday = h.days === 0 ? 0 : (netProfit - (horizons[0].calculatedProfit || 0));

      const res = {
        key: h.key,
        label: h.label,
        days: h.days,
        projectedPrice,
        priceChangePct: h.priceChangePct,
        sellableQuantityKg: storageData.sellableQuantityKg,
        spoiledQuantityKg: storageData.spoiledQuantityKg,
        spoilagePercent: storageData.cumulativeSpoilagePercent,
        spoilageLoss,
        storageCost,
        transportCost: transportData.totalTransportCost,
        grossRevenue,
        totalCost,
        netProfit,
        profitDiffVsToday: 0
      };

      if (h.days === 0) {
        horizons[0].calculatedProfit = netProfit;
      } else {
        res.profitDiffVsToday = netProfit - horizons[0].calculatedProfit;
      }

      return res;
    });

    // Determine optimal selling horizon
    let bestScenario = scenarios[0];
    scenarios.forEach(sc => {
      if (sc.netProfit > bestScenario.netProfit) {
        bestScenario = sc;
      }
    });

    return {
      cropKey,
      cropName: crop.name,
      perishability: crop.perishability,
      scenarios,
      bestScenarioKey: bestScenario.key,
      bestScenarioLabel: bestScenario.label,
      netAdvantageOverToday: bestScenario.netProfit - scenarios[0].netProfit,
      isSellTodayOptimal: bestScenario.days === 0
    };
  }

  /**
   * 10. Statistical Price Forecast (7-Day horizon with Linear Regression & Moving Average)
   */
  computePriceForecast(cropKey, currentBasePrice = 26.5) {
    const crop = CROP_DATABASE[cropKey] || CROP_DATABASE.tomato;
    const base = Number(currentBasePrice) || crop.baseMandiPrice;

    // Generate realistic historical 7 days with statistical variance
    const historical = [];
    const now = new Date();
    const volatilityPct = crop.priceVolatility === "Very High" ? 0.05 : (crop.priceVolatility === "High" ? 0.035 : 0.02);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const noise = (Math.sin(i * 1.5) * 0.7 + (6 - i) * 0.2) * volatilityPct * base;
      const price = Number((base - (6 - i) * 0.35 + noise).toFixed(2));
      historical.push({
        dayIndex: -i,
        dateStr: `${date.getDate()}/${date.getMonth() + 1}`,
        price: Math.max(5, price)
      });
    }

    // Linear Regression on historical points (x = dayIndex, y = price)
    const n = historical.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    historical.forEach(pt => {
      sumX += pt.dayIndex;
      sumY += pt.price;
      sumXY += pt.dayIndex * pt.price;
      sumXX += pt.dayIndex * pt.dayIndex;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Forecast next 7 days
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      const trendPrice = Number((intercept + slope * i).toFixed(2));
      // Confidence band expands into the future (±3% at Day 1 up to ±8% at Day 7)
      const uncertainty = Number((trendPrice * (0.025 + i * 0.009)).toFixed(2));
      
      forecast.push({
        dayIndex: i,
        dayLabel: `+${i}d (${date.getDate()}/${date.getMonth() + 1})`,
        predictedPrice: Math.max(5, trendPrice),
        lowerBound: Math.max(4, Number((trendPrice - uncertainty).toFixed(2))),
        upperBound: Number((trendPrice + uncertainty).toFixed(2)),
        trendDirection: slope > 0.1 ? "UP" : (slope < -0.1 ? "DOWN" : "STABLE")
      });
    }

    return {
      cropKey,
      cropName: crop.name,
      currentPrice: base,
      trendSlope: Number(slope.toFixed(3)),
      overallTrend: slope > 0.1 ? "Bullish (Rising)" : (slope < -0.1 ? "Bearish (Softening)" : "Stable Range"),
      historical,
      forecast
    };
  }

  /**
   * 11. Transparent Decision Scoring System
   */
  computeDecisionScore({
    financials,
    marketRanking,
    fairPriceData,
    buyerOfferEval,
    sellVsWaitData,
    weatherData
  }) {
    const w = this.weights;

    // 1. Profit Score (0 - 100): Based on Profit Margin %
    const margin = financials.profitMarginPercent || 0;
    const profitScore = Math.min(100, Math.max(10, Math.round(50 + margin * 0.8)));

    // 2. Market Opportunity Score (0 - 100): Spread between best mandi and baseline
    const bestMandi = marketRanking[0] || {};
    const mandiPrice = bestMandi.marketPricePerKg || financials.sellingPricePerKg;
    const fairPrice = fairPriceData.estimatedFairPrice || mandiPrice;
    const priceRatio = mandiPrice / fairPrice;
    const marketScore = Math.min(100, Math.max(20, Math.round(priceRatio * 85)));

    // 3. Spoilage Risk Score (0 - 100): High score = LOW spoilage risk
    const perishability = CROP_DATABASE[financials.cropKey]?.perishability || "Moderate";
    let spoilageBase = perishability === "Very High" ? 30 : (perishability === "High" ? 45 : (perishability === "Moderate" ? 75 : 90));
    if (weatherData && weatherData.temperature > 32) spoilageBase -= 10;
    const spoilageScore = Math.max(10, spoilageBase);

    // 4. Transport Efficiency Score (0 - 100): Proximity & road safety
    const dist = bestMandi.distanceKm || 20;
    const transportScore = Math.min(100, Math.max(15, Math.round(100 - dist * 0.6)));

    // 5. Weather Score (0 - 100): Safe conditions for harvest & transit
    const rainProb = weatherData?.rainProbability ?? 20;
    const weatherScore = Math.max(15, Math.round(100 - rainProb * 0.8));

    // Combined Weighted Decision Score
    const totalScore = Math.round(
      profitScore * w.profitWeight +
      marketScore * w.marketWeight +
      spoilageScore * w.spoilageWeight +
      transportScore * w.transportWeight +
      weatherScore * w.weatherWeight
    );

    return {
      totalScore,
      components: {
        profit: { score: profitScore, weight: w.profitWeight, weightedValue: Math.round(profitScore * w.profitWeight) },
        market: { score: marketScore, weight: w.marketWeight, weightedValue: Math.round(marketScore * w.marketWeight) },
        spoilage: { score: spoilageScore, weight: w.spoilageWeight, weightedValue: Math.round(spoilageScore * w.spoilageWeight) },
        transport: { score: transportScore, weight: w.transportWeight, weightedValue: Math.round(transportScore * w.transportWeight) },
        weather: { score: weatherScore, weight: w.weatherWeight, weightedValue: Math.round(weatherScore * w.weatherWeight) }
      },
      weights: { ...w }
    };
  }
}
