/**
 * STARK - AI Decision & Explainability Engine
 * Translates deterministic mathematical models into actionable, explainable farmer intelligence
 * Team STARK - Smart India Hackathon 2026
 */

import { CROP_DATABASE } from './config.js';

export class AIDecisionEngine {
  /**
   * Synthesize final dynamic decision from all mathematical engines
   */
  generateDecision({
    farmData,
    financials,
    marketRanking,
    fairPriceData,
    buyerOfferEval,
    sellVsWaitData,
    weatherData,
    decisionScoreData
  }) {
    const crop = CROP_DATABASE[farmData.crop] || CROP_DATABASE.tomato;
    const bestMarket = marketRanking[0] || {};
    const sellTodayProfit = sellVsWaitData.scenarios[0]?.netProfit ?? financials.netProfit;
    const isSellTodayOptimal = sellVsWaitData.isSellTodayOptimal;
    const buyerOfferDiffPct = buyerOfferEval.percentageDifference;

    let decisionCode = "SELL_NOW";
    let decisionBadge = "🟢 SELL TODAY";
    let decisionBadgeClass = "badge-sell-now";
    let decisionHeadline = `Sell ${farmData.expectedYieldKg.toLocaleString('en-IN')} kg ${crop.name} immediately at ${bestMarket.mandiName}.`;

    // Dynamic Decision Rule Hierarchy based on calculated scenarios
    if (buyerOfferEval.status === "LOW_OFFER" && farmData.optional?.currentBuyerOffer > 0) {
      if (bestMarket.netExpectedProfit > (farmData.expectedYieldKg * farmData.optional.currentBuyerOffer - financials.productionCost)) {
        decisionCode = "CHANGE_MARKET";
        decisionBadge = "🚚 DISPATCH TO BEST REGIONAL MANDI";
        decisionBadgeClass = "badge-change-market";
        decisionHeadline = `Bypass local trader offer (₹${farmData.optional.currentBuyerOffer}/kg) and dispatch to ${bestMarket.mandiName} for ₹${bestMarket.netExpectedProfit.toLocaleString('en-IN')} net profit.`;
      } else {
        decisionCode = "NEGOTIATE_PRICE";
        decisionBadge = "🤝 COUNTER-OFFER / NEGOTIATE";
        decisionBadgeClass = "badge-negotiate";
        decisionHeadline = `Buyer offer is ₹${Math.abs(buyerOfferEval.difference)}/kg below fair price. Negotiate target to ₹${fairPriceData.suggestedFairRangeMin} - ₹${fairPriceData.suggestedFairRangeMax}/kg.`;
      }
    } else if (!isSellTodayOptimal && sellVsWaitData.netAdvantageOverToday > 2500 && crop.perishability !== "Very High") {
      decisionCode = "WAIT_AND_MONITOR";
      decisionBadge = `⏳ STORE & WAIT (${sellVsWaitData.bestScenarioLabel})`;
      decisionBadgeClass = "badge-wait";
      decisionHeadline = `Hold crop in storage for ${sellVsWaitData.bestScenarioLabel}. Projected price rise yields +₹${sellVsWaitData.netAdvantageOverToday.toLocaleString('en-IN')} additional profit after storage & spoilage deductions.`;
    } else {
      decisionCode = "SELL_NOW";
      decisionBadge = "🟢 SELL TODAY";
      decisionBadgeClass = "badge-sell-now";
      decisionHeadline = `Optimal decision is to sell today at ${bestMarket.mandiName || 'Local Mandi'} (₹${bestMarket.marketPricePerKg || financials.sellingPricePerKg}/kg) to secure ₹${(bestMarket.netExpectedProfit || financials.netProfit).toLocaleString('en-IN')} net profit without spoilage decay.`;
    }

    // Generate strict data-driven reasons
    const reasons = [];
    if (bestMarket.mandiName) {
      reasons.push(`🏆 **Best Market Arbitrage**: ${bestMarket.mandiName} (${bestMarket.distanceKm} km) offers ₹${bestMarket.marketPricePerKg}/kg, generating highest net profit of ₹${bestMarket.netExpectedProfit.toLocaleString('en-IN')} after subtracting ₹${bestMarket.transportCost.toLocaleString('en-IN')} transport.`);
    }

    if (crop.perishability === "High" || crop.perishability === "Very High") {
      reasons.push(`🥬 **Spoilage Protection**: ${crop.name} has a high spoilage rate (${crop.dailySpoilageRate * 100}%/day). Holding produce past 3 days destroys ₹${Math.round(farmData.expectedYieldKg * 0.12 * financials.sellingPricePerKg).toLocaleString('en-IN')} in fruit degradation.`);
    } else {
      reasons.push(`🥔 **Low Spoilage Stability**: ${crop.name} has strong shelf-life resilience (${crop.dailySpoilageRate * 100}%/day daily loss), allowing tactical storage holding.`);
    }

    if (buyerOfferEval.buyerOffer > 0) {
      if (buyerOfferEval.status === "LOW_OFFER") {
        reasons.push(`🛡️ **Fair Price Discrepancy**: Local buyer offer of ₹${buyerOfferEval.buyerOffer}/kg is ${Math.abs(buyerOfferDiffPct)}% below fair regional value (₹${fairPriceData.estimatedFairPrice}/kg).`);
      } else {
        reasons.push(`🤝 **Buyer Offer Alignment**: Current buyer offer of ₹${buyerOfferEval.buyerOffer}/kg is competitive against regional mandi benchmarks.`);
      }
    }

    if (weatherData) {
      if (weatherData.rainProbability > 40) {
        reasons.push(`🌧️ **Weather Hazard Alert**: ${weatherData.rainProbability}% rain probability forecast in next 24h. Wet conditions accelerate fungal rot and cause road transit delays.`);
      } else {
        reasons.push(`☀️ **Transit Weather**: Favorable weather (${weatherData.temperature}°C, ${weatherData.humidity}% humidity) supports safe farm-to-mandi transport.`);
      }
    }

    // Dynamic Risk Factor Assessment
    const risks = [];
    if (weatherData?.rainProbability > 35) {
      risks.push({
        severity: "HIGH",
        title: "Rain & Moisture Transit Hazard",
        detail: `Forecast indicates ${weatherData.rainProbability}% rain chance. Open truck transit without waterproof tarpaulin will cause moisture rot and मंडी dock rejections.`,
        mitigation: "Cover vehicle cargo bed with heavy-duty tarpaulin or use ventilated crates."
      });
    }

    if (crop.perishability === "High" && !farmData.optional?.hasColdStorage) {
      risks.push({
        severity: "MEDIUM",
        title: "Ambient Storage Heat Decay",
        detail: `High ambient temperature (${weatherData?.temperature || 30}°C) reduces marketable tomato/chilli shelf-life to < 4 days without active cold storage.`,
        mitigation: "Store in shaded, cross-ventilated room on raised wooden slats; avoid direct ground contact."
      });
    }

    risks.push({
      severity: "LOW",
      title: "Mandi Price Intraday Volatility",
      detail: `Mandi prices fluctuate by ±₹1.50 - ₹2.50/kg depending on morning truck arrival volume at 6:00 AM auction.`,
      mitigation: "Dispatch truck early to arrive before 5:30 AM for peak buyer auction bidding."
    });

    // Step-by-step Actionable Roadmap
    const actions = [
      `1. **Lock Vehicle / Logistics**: Book tempo transport for ${bestMarket.distanceKm || 20} km trip to ${bestMarket.mandiName || 'Mandi'}. Estimated transit cost: ₹${bestMarket.transportCost || financials.transportCost}.`,
      `2. **Target Price Floor**: Do not accept below ₹${fairPriceData.suggestedFairRangeMin}/kg at auction gate.`,
      `3. **Payment Security**: Require same-day direct UPI or APMC RTGS bank settlement before releasing final delivery challan.`
    ];

    // Calculate Data Confidence Metric (based on live data freshness & data points)
    let confidenceScore = 84;
    if (weatherData?.isLive) confidenceScore += 5;
    if (farmData.optional?.currentBuyerOffer > 0) confidenceScore += 4;
    if (marketRanking.length >= 3) confidenceScore += 4;
    confidenceScore = Math.min(96, confidenceScore);

    return {
      decisionCode,
      decisionBadge,
      decisionBadgeClass,
      decisionHeadline,
      recommendedMarket: bestMarket.mandiName || "Regional Mandi Hub",
      recommendedMarketDistanceKm: bestMarket.distanceKm || 20,
      targetPricePerKg: bestMarket.marketPricePerKg || fairPriceData.estimatedFairPrice,
      expectedNetProfit: bestMarket.netExpectedProfit || financials.netProfit,
      expectedRevenue: bestMarket.grossRevenue || financials.grossRevenue,
      confidencePercent: confidenceScore,
      decisionScore: decisionScoreData.totalScore,
      reasons,
      risks,
      actions,
      generatedAt: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })
    };
  }

  /**
   * Generate AI Negotiation Script based on actual calculated fair price
   */
  generateNegotiationScript({
    farmData,
    fairPriceData,
    buyerOfferEval,
    bestMarket,
    language = "en"
  }) {
    const crop = CROP_DATABASE[farmData.crop] || CROP_DATABASE.tomato;
    const buyerOffer = buyerOfferEval.buyerOffer;
    const fairPrice = fairPriceData.estimatedFairPrice;
    const minTarget = fairPriceData.suggestedFairRangeMin;
    const maxTarget = fairPriceData.suggestedFairRangeMax;
    const marketName = bestMarket?.mandiName || "Regional Wholesale Market";
    const marketPrice = bestMarket?.marketPricePerKg || fairPrice;

    if (language === "ta") {
      return {
        language: "ta",
        suggestedTargetRange: `₹${minTarget} - ₹${maxTarget} / கிலோ`,
        scriptOpening: `வணக்கம் ஐயா. நான் கொண்டு வந்திருக்கும் ${crop.name} (${farmData.cropVariety}) உயர்தர முதல் தர (Grade A) விளைபொருள்.`,
        scriptBody: `தற்போது ${marketName}-ல் இதன் விலை ₹${marketPrice}/கிலோ ஆக உள்ளது. நீங்கள் கேட்கும் ₹${buyerOffer}/கிலோ சந்தை மதிப்பை விட மிகக் குறைவு. எனக்கு போக்குவரத்து செலவு கழித்தாலும் மண்டியிலேயே அதிக லாபம் கிடைக்கிறது.`,
        scriptCounterOffer: `எனவே எனக்கு குறைந்தது ₹${minTarget} முதல் ₹${maxTarget}/கிலோ கொடுத்தால் மட்டுமே உடனடியாக விற்பனை செய்ய முடியும்.`,
        closingTip: "💡 ஆலோசனை: விலையை குறைக்க விடாதீர்கள். உங்கள் தரம் மற்றும் சந்தை விலையை சுட்டிக்காட்டி பேசுங்கள்."
      };
    }

    if (language === "hi") {
      return {
        language: "hi",
        suggestedTargetRange: `₹${minTarget} - ₹${maxTarget} प्रति किलो`,
        scriptOpening: `नमस्ते जी। मेरी यह ${crop.name} (${farmData.cropVariety}) की फसल बिल्कुल ताजा और ग्रेड-ए क्वालिटी की है।`,
        scriptBody: `आज ${marketName} में इसका भाव ₹${marketPrice}/किलो चल रहा है। आपका ₹${buyerOffer}/किलो का ऑफर बाजार भाव से कम है। ट्रांसपोर्ट खर्च के बाद भी मुझे मंडी में ज्यादा मुनाफा मिल रहा है।`,
        scriptCounterOffer: `अगर आप ₹${minTarget} से ₹${maxTarget}/किलो के बीच भाव तय करते हैं, तो हम तुरंत माल फाइनल कर सकते हैं।`,
        closingTip: "💡 सुझाव: अपनी क्वालिटी और मंडी रेट का हवाला देकर मजबूती से बात करें।"
      };
    }

    // Default English Script
    return {
      language: "en",
      suggestedTargetRange: `₹${minTarget} - ₹${maxTarget} / kg`,
      scriptOpening: `Hello. The ${crop.name} produce I am offering (${farmData.cropVariety}) is freshly harvested Grade-A quality.`,
      scriptBody: `Today's benchmark at ${marketName} is trading at ₹${marketPrice}/kg. Your current offer of ₹${buyerOffer}/kg is ₹${Math.abs(buyerOfferEval.difference)}/kg below regional fair market value. Even factoring transport costs, direct mandi dispatch yields a higher net return.`,
      scriptCounterOffer: `I can finalize the deal with you right now at a fair rate between ₹${minTarget} and ₹${maxTarget}/kg.`,
      closingTip: "💡 Negotiation Strategy: Highlight the verified Grade-A quality, zero transit hassle for the buyer, and your alternative option of immediate mandi dispatch."
    };
  }

  /**
   * Conversational AI Advisor Q&A Engine
   * Strictly answers from active calculation state & financial metrics
   */
  answerAdvisorQuery(query, stateContext) {
    const q = query.toLowerCase().trim();
    const { farmData, financials, marketRanking, fairPriceData, buyerOfferEval, sellVsWaitData, weatherData, aiDecision } = stateContext;
    const crop = CROP_DATABASE[farmData.crop] || CROP_DATABASE.tomato;
    const bestMarket = marketRanking[0] || {};

    // 1. "Should I sell today or wait?"
    if (q.includes("sell") && (q.includes("wait") || q.includes("today") || q.includes("now") || q.includes("hold"))) {
      if (sellVsWaitData.isSellTodayOptimal) {
        return `🤖 **STARK AI Advisor Recommendation: SELL TODAY**\n\nFor your **${crop.name}** crop, selling today is mathematically optimal.\n\n• **Net Profit Today**: ₹${financials.netProfit.toLocaleString('en-IN')}\n• **Daily Spoilage Loss**: ${(crop.dailySpoilageRate * 100).toFixed(1)}%/day without cold storage.\n• **Waiting 3 Days Risk**: Expected spoilage reduces sellable quantity from ${farmData.expectedYieldKg} kg down to ${sellVsWaitData.scenarios[1]?.sellableQuantityKg} kg, cutting your net profit.\n\n📍 **Best Action**: Dispatch to **${bestMarket.mandiName}** for ₹${bestMarket.marketPricePerKg}/kg.`;
      } else {
        return `🤖 **STARK AI Advisor Recommendation: HOLD & WAIT (${sellVsWaitData.bestScenarioLabel})**\n\n• **Projected Price**: Expected to increase from ₹${financials.sellingPricePerKg}/kg to ₹${sellVsWaitData.scenarios.find(s => s.key === sellVsWaitData.bestScenarioKey)?.projectedPrice}/kg.\n• **Additional Net Gain**: +₹${sellVsWaitData.netAdvantageOverToday.toLocaleString('en-IN')} after accounting for storage costs and minor spoilage.\n\nEnsure your storage area is dry and shaded!`;
      }
    }

    // 2. "Which market is better / best market?"
    if (q.includes("which market") || q.includes("best market") || q.includes("mandi") || q.includes("where to sell")) {
      const secondMarket = marketRanking[1];
      let comparison = ``;
      if (secondMarket) {
        const diff = bestMarket.netExpectedProfit - secondMarket.netExpectedProfit;
        comparison = `\n\nCompared to ${secondMarket.mandiName} (${secondMarket.distanceKm} km, profit ₹${secondMarket.netExpectedProfit.toLocaleString('en-IN')}), ${bestMarket.mandiName} gives you **₹${diff.toLocaleString('en-IN')} higher net profit** even after covering the extra distance.`;
      }
      return `🤖 **STARK Market Radar Winner: ${bestMarket.mandiName}**\n\n• **Distance**: ${bestMarket.distanceKm} km from your farm\n• **Mandi Price**: ₹${bestMarket.marketPricePerKg}/kg (${bestMarket.trend})\n• **Estimated Transport Cost**: ₹${bestMarket.transportCost.toLocaleString('en-IN')}\n• **Net Expected Profit**: **₹${bestMarket.netExpectedProfit.toLocaleString('en-IN')}** (Highest net return)${comparison}`;
    }

    // 3. "Is buyer offer fair / should I accept buyer offer?"
    if (q.includes("buyer") || q.includes("offer") || q.includes("fair price") || q.includes("trader")) {
      const offer = farmData.optional?.currentBuyerOffer;
      if (!offer || offer === 0) {
        return `🤖 **Fair Price Benchmark**: The calculated fair price for your ${crop.name} is **₹${fairPriceData.estimatedFairPrice}/kg** (Fair Range: ₹${fairPriceData.suggestedFairRangeMin} - ₹${fairPriceData.suggestedFairRangeMax}/kg). Please enter a buyer offer in the farm form to get a direct comparison!`;
      }
      return `🤖 **Fair Price Guard Analysis**:\n\n• **Current Buyer Offer**: ₹${offer}/kg\n• **Calculated Fair Market Price**: ₹${fairPriceData.estimatedFairPrice}/kg\n• **Discrepancy**: ${buyerOfferEval.difference >= 0 ? '+' : ''}${buyerOfferEval.difference} ₹/kg (${buyerOfferEval.percentageDifference}%)\n• **Status**: **${buyerOfferEval.statusLabel}**\n\n${buyerOfferEval.recommendation}\n\n👉 Click **"Negotiate with AI"** on the dashboard to get a tailored negotiation script!`;
    }

    // 4. "What is my expected profit / revenue / costs?"
    if (q.includes("profit") || q.includes("revenue") || q.includes("cost") || q.includes("expense") || q.includes("margin")) {
      return `🤖 **Financial Breakdown for ${farmData.farmerName}**:\n\n• **Total Investment (Production Cost)**: ₹${financials.productionCost.toLocaleString('en-IN')}\n  - Seeds: ₹${financials.productionCostBreakdown.seeds}\n  - Fertilizer: ₹${financials.productionCostBreakdown.fertilizer}\n  - Labour: ₹${financials.productionCostBreakdown.labour}\n  - Irrigation & Pesticides: ₹${financials.productionCostBreakdown.irrigation + financials.productionCostBreakdown.pesticides}\n• **Gross Expected Revenue**: ₹${financials.grossRevenue.toLocaleString('en-IN')}\n• **Transport & Storage Costs**: ₹${(financials.transportCost + financials.storageCost).toLocaleString('en-IN')}\n• **Net Expected Profit**: **₹${financials.netProfit.toLocaleString('en-IN')}**\n• **ROI Profit Margin**: **${financials.profitMarginPercent}%**`;
    }

    // 5. "What if price drops / price changes?"
    if (q.includes("what if") || q.includes("drop") || q.includes("fall") || q.includes("increase")) {
      const priceMinus10 = Number((financials.sellingPricePerKg * 0.9).toFixed(1));
      const revenueMinus10 = Math.round(farmData.expectedYieldKg * priceMinus10);
      const profitMinus10 = revenueMinus10 - financials.totalCost;
      const profitDrop = financials.netProfit - profitMinus10;

      return `🤖 **What-If Sensitivity Simulation**:\n\nIf the market price drops by 10% (from ₹${financials.sellingPricePerKg}/kg to ₹${priceMinus10}/kg):\n\n• **New Gross Revenue**: ₹${revenueMinus10.toLocaleString('en-IN')}\n• **New Net Profit**: ₹${profitMinus10.toLocaleString('en-IN')}\n• **Profit Impact**: Reduction of **-₹${profitDrop.toLocaleString('en-IN')}**\n\nYou can use the interactive **What-If Sliders** on the dashboard to test any custom yield, price, or transport scenario in real-time!`;
    }

    // 6. "What is the weather impact?"
    if (q.includes("weather") || q.includes("rain") || q.includes("temperature")) {
      return `🤖 **Weather Advisory for ${farmData.district}, ${farmData.state}**:\n\n• **Condition**: ${weatherData?.condition || 'Partly Cloudy'} ${weatherData?.icon || '⛅'}\n• **Temperature**: ${weatherData?.temperature || 29}°C\n• **Humidity**: ${weatherData?.humidity || 65}%\n• **Rain Probability**: ${weatherData?.rainProbability || 20}%\n• **Transit Assessment**: ${weatherData?.transitRisk || 'Normal conditions'}\n\n*Source: ${weatherData?.source || 'Open-Meteo API'} (${weatherData?.statusText || 'LIVE'})*`;
    }

    // Default intelligent response synthesized from active decision
    return `🤖 **STARK Active Intelligence Summary for ${crop.name}**:\n\n• **Active Recommendation**: **${aiDecision.decisionBadge}**\n• **Best Mandi**: ${aiDecision.recommendedMarket} (${aiDecision.recommendedMarketDistanceKm} km)\n• **Target Selling Price**: ₹${aiDecision.targetPricePerKg}/kg\n• **Expected Net Profit**: ₹${aiDecision.expectedNetProfit.toLocaleString('en-IN')}\n• **Confidence Score**: ${aiDecision.confidencePercent}%\n\nYou can ask me specific questions like: *"Which market is better?"*, *"Is the buyer offer fair?"*, *"Should I sell today or wait?"*, or *"What happens if price drops 15%?"*`;
  }
}
