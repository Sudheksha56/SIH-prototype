/**
 * STARK - Main Reactive Application Controller
 * Orchestrates State, Calculations, Live Weather, and UI Components
 * Team STARK - Smart India Hackathon 2026
 */

import { CROP_DATABASE, REGIONAL_MANDIS, DEMO_PROFILES, SMART_BUY_CATALOG, VERIFIED_BUYERS } from './config.js';
import { WeatherService } from './weatherService.js';
import { CalculationEngine } from './calculationEngine.js';
import { AIDecisionEngine } from './aiDecisionEngine.js';
import { ChartHelper } from './chartHelper.js';
import { TRANSLATIONS } from './translations.js';

class StarkApp {
  constructor() {
    this.weatherService = new WeatherService();
    this.calcEngine = new CalculationEngine();
    this.aiEngine = new AIDecisionEngine();

    // Active Application State (Defaults to Ramesh - Tomato / Karur)
    this.state = {
      language: 'en',
      farmData: { ...DEMO_PROFILES.ramesh },
      weatherData: null,
      financials: null,
      marketRanking: [],
      fairPriceData: null,
      buyerOfferEval: null,
      sellVsWaitData: null,
      priceForecastData: null,
      decisionScoreData: null,
      aiDecision: null,
      whatIf: {
        priceOverride: null,
        yieldOverride: null,
        transportOverride: null
      }
    };

    this.init();
  }

  async init() {
    console.log("🌾 Initializing STARK AgTech Engine (Smart India Hackathon 2026)...");
    
    this.bindEvents();
    
    // Initial fetch and full dynamic computation
    await this.fetchWeatherAndCompute();
    
    this.renderAll();
    console.log("✅ STARK Engine Active — All calculations running dynamically.");
  }

  /**
   * Fetch weather from Open-Meteo & recalculate entire analytical graph
   */
  async fetchWeatherAndCompute() {
    const lat = this.state.farmData.latitude || 10.9601;
    const lon = this.state.farmData.longitude || 78.0766;

    // 1. Fetch live or fallback weather data
    this.state.weatherData = await this.weatherService.getWeatherData(lat, lon);

    // 2. Perform Full Dynamic Mathematical Computations
    this.recalculateAll();
  }

  /**
   * Pure Deterministic Recalculation of all modules
   */
  recalculateAll() {
    const farm = this.state.farmData;
    const weather = this.state.weatherData;
    const crop = CROP_DATABASE[farm.crop] || CROP_DATABASE.tomato;

    // Base price from crop or active regional benchmark
    const basePrice = crop.baseMandiPrice;
    const weatherFactor = weather ? weather.spoilageWeatherMultiplier : 1.0;

    // A. Market Radar Ranking (Calculates profit across all nearby mandis)
    this.state.marketRanking = this.calcEngine.rankMarkets({
      cropKey: farm.crop,
      farmLat: farm.latitude,
      farmLon: farm.longitude,
      quantityKg: farm.expectedYieldKg,
      productionCosts: farm.costs,
      transportRatePerKm: farm.costs.transportPerKm,
      hasColdStorage: farm.optional?.hasColdStorage,
      weatherMultiplier: weatherFactor,
      mandisList: REGIONAL_MANDIS
    });

    const bestMandi = this.state.marketRanking[0] || {};
    const sellingPrice = bestMandi.marketPricePerKg || basePrice;

    // B. Financials (Profit Meter)
    this.state.financials = this.calcEngine.calculateFinancials({
      cropKey: farm.crop,
      quantityKg: farm.expectedYieldKg,
      sellingPricePerKg: sellingPrice,
      productionCosts: farm.costs,
      distanceKm: bestMandi.distanceKm || 20,
      transportRatePerKm: farm.costs.transportPerKm,
      daysStored: 0,
      hasColdStorage: farm.optional?.hasColdStorage,
      weatherMultiplier: weatherFactor
    });

    // C. Fair Price Guard
    this.state.fairPriceData = this.calcEngine.calculateFairPrice(
      farm.crop,
      farm.latitude,
      farm.longitude,
      REGIONAL_MANDIS,
      farm.qualityGrade
    );

    // D. Buyer Offer Evaluation
    this.state.buyerOfferEval = this.calcEngine.evaluateBuyerOffer(
      farm.optional?.currentBuyerOffer || 0,
      this.state.fairPriceData
    );

    // E. Sell Now vs Wait Scenarios (0, 3, 5, 7 Days)
    this.state.sellVsWaitData = this.calcEngine.calculateSellVsWaitScenarios({
      cropKey: farm.crop,
      quantityKg: farm.expectedYieldKg,
      currentPricePerKg: sellingPrice,
      productionCosts: farm.costs,
      distanceKm: bestMandi.distanceKm || 20,
      transportRatePerKm: farm.costs.transportPerKm,
      storageCostPerDay: farm.costs.storageCostPerDay,
      hasColdStorage: farm.optional?.hasColdStorage,
      weatherMultiplier: weatherFactor
    });

    // F. Statistical Price Forecast
    this.state.priceForecastData = this.calcEngine.computePriceForecast(
      farm.crop,
      sellingPrice
    );

    // G. Transparent Decision Scoring System
    this.state.decisionScoreData = this.calcEngine.computeDecisionScore({
      financials: this.state.financials,
      marketRanking: this.state.marketRanking,
      fairPriceData: this.state.fairPriceData,
      buyerOfferEval: this.state.buyerOfferEval,
      sellVsWaitData: this.state.sellVsWaitData,
      weatherData: weather
    });

    // H. Dynamic AI Decision Synthesis
    this.state.aiDecision = this.aiEngine.generateDecision({
      farmData: farm,
      financials: this.state.financials,
      marketRanking: this.state.marketRanking,
      fairPriceData: this.state.fairPriceData,
      buyerOfferEval: this.state.buyerOfferEval,
      sellVsWaitData: this.state.sellVsWaitData,
      weatherData: weather,
      decisionScoreData: this.state.decisionScoreData
    });

    // Sync What-If slider default values
    if (this.state.whatIf.priceOverride === null) {
      this.state.whatIf.priceOverride = sellingPrice;
    }
    if (this.state.whatIf.yieldOverride === null) {
      this.state.whatIf.yieldOverride = farm.expectedYieldKg;
    }
    if (this.state.whatIf.transportOverride === null) {
      this.state.whatIf.transportOverride = farm.costs.transportPerKm;
    }
  }

  /**
   * Bind DOM Events & Listeners
   */
  bindEvents() {
    // 1. Demo Farmer Profile Select
    const profileSelect = document.getElementById('demoProfileSelect');
    if (profileSelect) {
      profileSelect.addEventListener('change', async (e) => {
        const selectedId = e.target.value;
        if (selectedId && DEMO_PROFILES[selectedId]) {
          this.state.farmData = JSON.parse(JSON.stringify(DEMO_PROFILES[selectedId]));
          this.state.whatIf.priceOverride = null;
          this.state.whatIf.yieldOverride = null;
          this.state.whatIf.transportOverride = null;
          
          await this.fetchWeatherAndCompute();
          this.renderAll();
          
          // Also pre-fill form fields
          this.syncFarmModalForm();
        }
      });
    }

    // 2. Geolocation Auto-Detection
    const btnGeo = document.getElementById('btnGeolocation');
    if (btnGeo) {
      btnGeo.addEventListener('click', () => {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser.");
          return;
        }
        btnGeo.innerText = "Detecting GPS...";
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            this.state.farmData.latitude = pos.coords.latitude;
            this.state.farmData.longitude = pos.coords.longitude;
            this.state.farmData.district = "Current GPS Location";
            this.state.farmData.state = "India";
            
            await this.fetchWeatherAndCompute();
            this.renderAll();
            btnGeo.innerText = "GPS Synced ✓";
            setTimeout(() => btnGeo.innerText = "Auto-Detect GPS", 3000);
          },
          (err) => {
            console.warn("Geolocation denied/failed:", err);
            btnGeo.innerText = "Auto-Detect GPS";
            alert("Could not retrieve GPS coordinates. Defaulting to regional farm location.");
          }
        );
      });
    }

    // 3. Language Selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.language = btn.dataset.lang;
        this.applyTranslations();
      });
    });

    // 4. Farm Profile Modal Open & Close
    const farmModal = document.getElementById('farmModal');
    const openFarmBtn = document.getElementById('openFarmModalBtn');
    const closeFarmBtn = document.getElementById('closeFarmModalBtn');
    const cancelFarmBtn = document.getElementById('btnCancelFarmModal');
    const farmForm = document.getElementById('farmProfileForm');

    if (openFarmBtn && farmModal) {
      openFarmBtn.addEventListener('click', () => {
        this.syncFarmModalForm();
        farmModal.classList.remove('hidden');
      });
    }
    if (closeFarmBtn && farmModal) {
      closeFarmBtn.addEventListener('click', () => farmModal.classList.add('hidden'));
    }
    if (cancelFarmBtn && farmModal) {
      cancelFarmBtn.addEventListener('click', () => farmModal.classList.add('hidden'));
    }

    if (farmForm) {
      farmForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        this.saveFarmProfileFromForm();
        farmModal.classList.add('hidden');
        await this.fetchWeatherAndCompute();
        this.renderAll();
      });
    }

    // 5. What-If Sliders (Instant Local Reactivity)
    const sliderPrice = document.getElementById('sliderPrice');
    const sliderYield = document.getElementById('sliderYield');
    const sliderTransport = document.getElementById('sliderTransport');
    const btnResetWhatIf = document.getElementById('btnResetWhatIf');

    if (sliderPrice) {
      sliderPrice.addEventListener('input', (e) => {
        this.state.whatIf.priceOverride = Number(e.target.value);
        this.renderWhatIfCalculations();
      });
    }
    if (sliderYield) {
      sliderYield.addEventListener('input', (e) => {
        this.state.whatIf.yieldOverride = Number(e.target.value);
        this.renderWhatIfCalculations();
      });
    }
    if (sliderTransport) {
      sliderTransport.addEventListener('input', (e) => {
        this.state.whatIf.transportOverride = Number(e.target.value);
        this.renderWhatIfCalculations();
      });
    }
    if (btnResetWhatIf) {
      btnResetWhatIf.addEventListener('click', () => {
        this.state.whatIf.priceOverride = this.state.financials.sellingPricePerKg;
        this.state.whatIf.yieldOverride = this.state.farmData.expectedYieldKg;
        this.state.whatIf.transportOverride = this.state.farmData.costs.transportPerKm;
        this.renderWhatIfSliders();
        this.renderWhatIfCalculations();
      });
    }

    // 6. Explainability Modal
    const explainModal = document.getElementById('explainabilityModal');
    const openExplainBtn = document.getElementById('openExplainabilityBtn');
    const closeExplainBtn = document.getElementById('closeExplainabilityModalBtn');
    const doneExplainBtn = document.getElementById('btnCloseExplainabilityModal');

    if (openExplainBtn && explainModal) {
      openExplainBtn.addEventListener('click', () => {
        ChartHelper.renderDecisionScoreBreakdown('scoringBreakdownContainer', this.state.decisionScoreData);
        explainModal.classList.remove('hidden');
      });
    }
    if (closeExplainBtn && explainModal) {
      closeExplainBtn.addEventListener('click', () => explainModal.classList.add('hidden'));
    }
    if (doneExplainBtn && explainModal) {
      doneExplainBtn.addEventListener('click', () => explainModal.classList.add('hidden'));
    }

    // 7. AI Negotiation Script Modal
    const negModal = document.getElementById('negotiationModal');
    const openNegBtn = document.getElementById('btnOpenNegotiationModal');
    const closeNegBtn = document.getElementById('closeNegotiationModalBtn');
    const doneNegBtn = document.getElementById('btnCloseNegotiationModal');
    const copyNegBtn = document.getElementById('btnCopyNegotiationScript');

    if (openNegBtn && negModal) {
      openNegBtn.addEventListener('click', () => {
        const script = this.aiEngine.generateNegotiationScript({
          farmData: this.state.farmData,
          fairPriceData: this.state.fairPriceData,
          buyerOfferEval: this.state.buyerOfferEval,
          bestMarket: this.state.marketRanking[0],
          language: this.state.language
        });

        document.getElementById('negTargetRangeVal').innerText = script.suggestedTargetRange;
        document.getElementById('negScriptText').innerText = `"${script.scriptOpening} ${script.scriptBody} ${script.scriptCounterOffer}"`;
        document.getElementById('negClosingTip').innerText = script.closingTip;
        negModal.classList.remove('hidden');
      });
    }
    if (closeNegBtn && negModal) {
      closeNegBtn.addEventListener('click', () => negModal.classList.add('hidden'));
    }
    if (doneNegBtn && negModal) {
      doneNegBtn.addEventListener('click', () => negModal.classList.add('hidden'));
    }
    if (copyNegBtn) {
      copyNegBtn.addEventListener('click', () => {
        const text = document.getElementById('negScriptText').innerText;
        navigator.clipboard.writeText(text).then(() => {
          copyNegBtn.innerText = "Copied ✓";
          setTimeout(() => copyNegBtn.innerText = "📋 Copy Script", 2500);
        });
      });
    }

    // 8. Demo Sell Order Modal
    const sellOrderModal = document.getElementById('sellOrderModal');
    const closeSellOrderBtn = document.getElementById('closeSellOrderModalBtn');
    const doneSellOrderBtn = document.getElementById('btnCloseSellOrderModal');

    if (closeSellOrderBtn && sellOrderModal) {
      closeSellOrderBtn.addEventListener('click', () => sellOrderModal.classList.add('hidden'));
    }
    if (doneSellOrderBtn && sellOrderModal) {
      doneSellOrderBtn.addEventListener('click', () => sellOrderModal.classList.add('hidden'));
    }

    // 9. Conversational AI Advisor Floating Chat
    const toggleChatBtn = document.getElementById('toggleAdvisorChatBtn');
    const chatWindow = document.getElementById('advisorChatWindow');
    const closeChatBtn = document.getElementById('closeAdvisorChatBtn');
    const chatForm = document.getElementById('advisorChatForm');
    const chatInput = document.getElementById('advisorChatInput');

    if (toggleChatBtn && chatWindow) {
      toggleChatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
      });
    }
    if (closeChatBtn && chatWindow) {
      closeChatBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));
    }

    // Quick Prompt Chips in Chat
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const query = chip.dataset.query;
        this.handleAdvisorUserQuery(query);
      });
    });

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = chatInput.value.trim();
        if (q) {
          this.handleAdvisorUserQuery(q);
          chatInput.value = '';
        }
      });
    }

    // Window Resize chart redraw
    window.addEventListener('resize', () => {
      this.renderCharts();
    });
  }

  /**
   * Populate Farm Modal form fields with current active state
   */
  syncFarmModalForm() {
    const f = this.state.farmData;
    document.getElementById('inpFarmerName').value = f.farmerName || '';
    document.getElementById('inpDistrictState').value = `${f.district || ''}, ${f.state || ''}`;
    document.getElementById('inpCrop').value = f.crop || 'tomato';
    document.getElementById('inpVariety').value = f.cropVariety || '';
    document.getElementById('inpLandArea').value = f.landAreaAcres || 2;
    document.getElementById('inpYieldKg').value = f.expectedYieldKg || 4000;
    document.getElementById('inpCropStage').value = f.cropStage || 'Harvesting';
    document.getElementById('inpBuyerOffer').value = f.optional?.currentBuyerOffer || 0;

    const costs = f.costs || {};
    document.getElementById('inpCostSeeds').value = costs.seeds || 0;
    document.getElementById('inpCostFertilizer').value = costs.fertilizer || 0;
    document.getElementById('inpCostLabour').value = costs.labour || 0;
    document.getElementById('inpCostIrrigation').value = costs.irrigation || 0;
    document.getElementById('inpCostPesticides').value = costs.pesticides || 0;
    document.getElementById('inpCostOther').value = costs.otherCosts || 0;
    document.getElementById('inpTransportRate').value = costs.transportPerKm || 18;
    document.getElementById('inpStorageRate').value = costs.storageCostPerDay || 400;
  }

  /**
   * Save user edits from Modal and update state
   */
  saveFarmProfileFromForm() {
    const f = this.state.farmData;
    f.farmerName = document.getElementById('inpFarmerName').value;
    
    const locParts = document.getElementById('inpDistrictState').value.split(',');
    f.district = (locParts[0] || 'Karur').trim();
    f.state = (locParts[1] || 'Tamil Nadu').trim();

    f.crop = document.getElementById('inpCrop').value;
    f.cropVariety = document.getElementById('inpVariety').value;
    f.landAreaAcres = Number(document.getElementById('inpLandArea').value) || 1;
    f.expectedYieldKg = Number(document.getElementById('inpYieldKg').value) || 1000;
    f.cropStage = document.getElementById('inpCropStage').value;

    if (!f.optional) f.optional = {};
    f.optional.currentBuyerOffer = Number(document.getElementById('inpBuyerOffer').value) || 0;

    f.costs = {
      seeds: Number(document.getElementById('inpCostSeeds').value) || 0,
      fertilizer: Number(document.getElementById('inpCostFertilizer').value) || 0,
      labour: Number(document.getElementById('inpCostLabour').value) || 0,
      irrigation: Number(document.getElementById('inpCostIrrigation').value) || 0,
      pesticides: Number(document.getElementById('inpCostPesticides').value) || 0,
      otherCosts: Number(document.getElementById('inpCostOther').value) || 0,
      transportPerKm: Number(document.getElementById('inpTransportRate').value) || 18,
      storageCostPerDay: Number(document.getElementById('inpStorageRate').value) || 400
    };
  }

  /**
   * Handle user query in AI Advisor chat
   */
  handleAdvisorUserQuery(query) {
    const msgContainer = document.getElementById('advisorChatMessages');
    if (!msgContainer) return;

    // Append User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.innerText = query;
    msgContainer.appendChild(userBubble);

    // Generate strict context-driven answer
    const answer = this.aiEngine.answerAdvisorQuery(query, {
      farmData: this.state.farmData,
      financials: this.state.financials,
      marketRanking: this.state.marketRanking,
      fairPriceData: this.state.fairPriceData,
      buyerOfferEval: this.state.buyerOfferEval,
      sellVsWaitData: this.state.sellVsWaitData,
      weatherData: this.state.weatherData,
      aiDecision: this.state.aiDecision
    });

    setTimeout(() => {
      const botBubble = document.createElement('div');
      botBubble.className = 'chat-bubble bot';
      botBubble.innerText = answer;
      msgContainer.appendChild(botBubble);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 250);

    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  /**
   * Open Sell Order demo modal
   */
  triggerDemoSellOrder(buyer) {
    const modal = document.getElementById('sellOrderModal');
    if (!modal) return;

    const farm = this.state.farmData;
    const crop = CROP_DATABASE[farm.crop] || CROP_DATABASE.tomato;
    const agreedPrice = Number((this.state.financials.sellingPricePerKg * buyer.priceOfferPremium).toFixed(2));
    const grossPayout = Math.round(farm.expectedYieldKg * agreedPrice);

    document.getElementById('receiptOrderTitle').innerText = `Order Confirmed with ${buyer.name}`;
    document.getElementById('receiptOrderId').innerText = `STARK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById('receiptCropQty').innerText = `${crop.name} (${farm.cropVariety}) • ${farm.expectedYieldKg.toLocaleString('en-IN')} kg`;
    document.getElementById('receiptPrice').innerText = `₹${agreedPrice.toFixed(2)} / kg`;
    document.getElementById('receiptTotalRevenue').innerText = `₹${grossPayout.toLocaleString('en-IN')}`;
    document.getElementById('receiptPayment').innerText = buyer.paymentMode;

    modal.classList.remove('hidden');
  }

  /**
   * Master Render Function
   */
  renderAll() {
    this.renderHeaderAndFarmerRibbon();
    this.renderHeroDecision();
    this.renderProfitMeter();
    this.renderWhatIfSliders();
    this.renderWhatIfCalculations();
    this.renderMarketRadar();
    this.renderFairPriceGuard();
    this.renderSellNowVsWait();
    this.renderWeatherCard();
    this.renderSmartSellMarketplace();
    this.renderSmartBuyCatalog();
    this.renderCharts();
    this.applyTranslations();
  }

  renderHeaderAndFarmerRibbon() {
    const f = this.state.farmData;
    const crop = CROP_DATABASE[f.crop] || CROP_DATABASE.tomato;

    // Status pill
    const statusText = document.getElementById('liveStatusText');
    const statusPill = document.getElementById('liveStatusBadge');
    if (this.state.weatherData && this.state.weatherData.isLive) {
      statusText.innerText = "🟢 LIVE DATA";
      statusPill.className = "live-status-pill";
    } else {
      statusText.innerText = "🟡 DEMO DATA";
      statusPill.className = "live-status-pill demo-mode";
    }

    // Farmer Ribbon
    document.getElementById('farmerNameDisplay').innerText = f.farmerName;
    document.getElementById('cropEmoji').innerText = crop.icon || '🍅';
    document.getElementById('farmerLocationDisplay').innerText = `${f.district}, ${f.state}`;
    document.getElementById('cropSummaryVal').innerText = `${crop.name} (${f.cropVariety})`;
    document.getElementById('landAreaVal').innerText = `${f.landAreaAcres} Acres`;
    document.getElementById('yieldSummaryVal').innerText = `${f.expectedYieldKg.toLocaleString('en-IN')} kg`;
    document.getElementById('cropStageVal').innerText = f.cropStage;
    document.getElementById('qualityGradeVal').innerText = f.qualityGrade;

    document.getElementById('footerTimestamp').innerText = `Updated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  renderHeroDecision() {
    const dec = this.state.aiDecision;
    const badgeEl = document.getElementById('decisionActionBadge');
    
    badgeEl.className = `decision-action-badge ${dec.decisionBadgeClass}`;
    badgeEl.innerText = dec.decisionBadge;

    document.getElementById('decisionHeadlineText').innerText = dec.decisionHeadline;
    document.getElementById('heroBestMarketVal').innerText = dec.recommendedMarket;
    document.getElementById('heroMarketDistSub').innerText = `${dec.recommendedMarketDistanceKm} km • ₹${dec.targetPricePerKg}/kg`;
    document.getElementById('heroTargetPriceVal').innerText = `₹${dec.targetPricePerKg.toFixed(2)} / kg`;
    document.getElementById('heroExpectedProfitVal').innerText = `₹${dec.expectedNetProfit.toLocaleString('en-IN')}`;
    document.getElementById('heroRoiSub').innerText = `ROI Margin: ${this.state.financials.profitMarginPercent}%`;
    document.getElementById('heroConfidenceVal').innerText = `${dec.confidencePercent}%`;
    document.getElementById('heroScoreSub').innerText = `Decision Score: ${dec.decisionScore} / 100`;

    // Dynamic Rationale Bullet List
    const rationaleUl = document.getElementById('heroRationaleList');
    rationaleUl.innerHTML = dec.reasons.map(r => `
      <li>${r.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</li>
    `).join('');
  }

  renderProfitMeter() {
    const fin = this.state.financials;
    document.getElementById('pmTotalCost').innerText = `₹${fin.productionCost.toLocaleString('en-IN')}`;
    document.getElementById('pmCostPerKg').innerText = `₹${(fin.productionCost / fin.initialQuantityKg).toFixed(2)} / kg`;
    
    document.getElementById('pmGrossRevenue').innerText = `₹${fin.grossRevenue.toLocaleString('en-IN')}`;
    document.getElementById('pmRevPerKg').innerText = `₹${fin.revenuePerKg.toFixed(2)} / kg`;

    document.getElementById('pmLogisticsCost').innerText = `₹${(fin.transportCost + fin.storageCost).toLocaleString('en-IN')}`;
    document.getElementById('pmLogisticsPerKg').innerText = `₹${((fin.transportCost + fin.storageCost) / fin.initialQuantityKg).toFixed(2)} / kg`;

    document.getElementById('pmNetProfit').innerText = `₹${fin.netProfit.toLocaleString('en-IN')}`;
    document.getElementById('pmProfitPerKg').innerText = `₹${fin.profitPerKg.toFixed(2)} / kg profit`;

    document.getElementById('pmProfitMargin').innerText = `${fin.profitMarginPercent}%`;

    // Ratio Bar Widths
    const totalRev = Math.max(1, fin.grossRevenue);
    const prodPct = Math.min(100, Math.round((fin.productionCost / totalRev) * 100));
    const transPct = Math.min(100, Math.round((fin.transportCost / totalRev) * 100));
    const profitPct = Math.max(0, 100 - prodPct - transPct);

    document.getElementById('barFillProd').style.width = `${prodPct}%`;
    document.getElementById('barFillTrans').style.width = `${transPct}%`;
    document.getElementById('barFillProfit').style.width = `${profitPct}%`;
  }

  renderWhatIfSliders() {
    const fin = this.state.financials;
    const farm = this.state.farmData;

    const sliderPrice = document.getElementById('sliderPrice');
    const sliderYield = document.getElementById('sliderYield');
    const sliderTransport = document.getElementById('sliderTransport');

    if (sliderPrice) {
      sliderPrice.value = this.state.whatIf.priceOverride || fin.sellingPricePerKg;
      document.getElementById('valSliderPrice').innerText = `₹${Number(sliderPrice.value).toFixed(2)} / kg`;
    }
    if (sliderYield) {
      sliderYield.value = this.state.whatIf.yieldOverride || farm.expectedYieldKg;
      document.getElementById('valSliderYield').innerText = `${Number(sliderYield.value).toLocaleString('en-IN')} kg`;
    }
    if (sliderTransport) {
      sliderTransport.value = this.state.whatIf.transportOverride || farm.costs.transportPerKm;
      document.getElementById('valSliderTransport').innerText = `₹${sliderTransport.value} / km`;
    }
  }

  renderWhatIfCalculations() {
    const price = this.state.whatIf.priceOverride || this.state.financials.sellingPricePerKg;
    const yieldKg = this.state.whatIf.yieldOverride || this.state.farmData.expectedYieldKg;
    const transRate = this.state.whatIf.transportOverride || this.state.farmData.costs.transportPerKm;

    document.getElementById('valSliderPrice').innerText = `₹${price.toFixed(2)} / kg`;
    document.getElementById('valSliderYield').innerText = `${yieldKg.toLocaleString('en-IN')} kg`;
    document.getElementById('valSliderTransport').innerText = `₹${transRate} / km`;

    // Recompute financial output for this simulated tuple
    const simFinancials = this.calcEngine.calculateFinancials({
      cropKey: this.state.farmData.crop,
      quantityKg: yieldKg,
      sellingPricePerKg: price,
      productionCosts: this.state.farmData.costs,
      distanceKm: this.state.marketRanking[0]?.distanceKm || 20,
      transportRatePerKm: transRate,
      daysStored: 0
    });

    const baselineProfit = this.state.financials.netProfit;
    const simulatedProfit = simFinancials.netProfit;
    const diff = simulatedProfit - baselineProfit;
    const diffPct = baselineProfit !== 0 ? ((diff / Math.abs(baselineProfit)) * 100).toFixed(1) : 0;

    document.getElementById('whatIfSimulatedProfit').innerText = `₹${simulatedProfit.toLocaleString('en-IN')}`;
    
    const deltaEl = document.getElementById('whatIfDeltaDisplay');
    if (diff >= 0) {
      deltaEl.className = 'outcome-delta delta-positive';
      deltaEl.innerText = `+ ₹${diff.toLocaleString('en-IN')} (+${diffPct}%)`;
    } else {
      deltaEl.className = 'outcome-delta delta-negative';
      deltaEl.innerText = `- ₹${Math.abs(diff).toLocaleString('en-IN')} (${diffPct}%)`;
    }
  }

  renderMarketRadar() {
    const container = document.getElementById('mandiRadarList');
    if (!container) return;

    container.innerHTML = this.state.marketRanking.map(mandi => `
      <div class="mandi-card ${mandi.isBestMarket ? 'is-winner' : ''}">
        ${mandi.isBestMarket ? '<span class="winner-ribbon">🏆 BEST MANDI</span>' : ''}
        <div class="mandi-name-block">
          <h4>${mandi.mandiName}</h4>
          <div class="mandi-dist-tag">📍 ${mandi.distanceKm} km away • ${mandi.paymentTerms}</div>
        </div>

        <div style="text-align: center;">
          <div class="mandi-price-tag">₹${mandi.marketPricePerKg.toFixed(2)} <span style="font-size: 0.75rem;">/kg</span></div>
          <div class="mandi-trend">${mandi.trend}</div>
        </div>

        <div class="mandi-profit-box">
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">NET PROFIT</div>
          <div class="mandi-net-profit">₹${mandi.netExpectedProfit.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">-₹${mandi.transportCost.toLocaleString('en-IN')} transit</div>
        </div>
      </div>
    `).join('');
  }

  renderFairPriceGuard() {
    const fpg = this.state.fairPriceData;
    const evalData = this.state.buyerOfferEval;

    document.getElementById('fpgBuyerOfferVal').innerText = evalData.buyerOffer > 0
      ? `₹${evalData.buyerOffer.toFixed(2)} / kg`
      : `Not Entered`;

    document.getElementById('fpgFairPriceVal').innerText = `₹${fpg.estimatedFairPrice.toFixed(2)} / kg`;

    const badgeEl = document.getElementById('fpgStatusBadge');
    badgeEl.className = `fair-status-badge ${evalData.statusClass}`;
    badgeEl.innerText = `${evalData.statusLabel} (${evalData.percentageDifference >= 0 ? '+' : ''}${evalData.percentageDifference}%)`;

    document.getElementById('fpgRecommendationText').innerText = evalData.recommendation;
  }

  renderSellNowVsWait() {
    const sw = this.state.sellVsWaitData;
    const grid = document.getElementById('sellWaitScenariosGrid');
    if (!grid) return;

    grid.innerHTML = sw.scenarios.map(sc => `
      <div class="scenario-chip ${sc.key === sw.bestScenarioKey ? 'best' : ''}">
        <div class="scenario-title">${sc.label}</div>
        <div class="scenario-profit" style="color: ${sc.key === sw.bestScenarioKey ? '#059669' : '#0f172a'};">
          ₹${sc.netProfit.toLocaleString('en-IN')}
        </div>
        <div class="scenario-spoilage">
          ${sc.days === 0 ? '0% Spoilage' : `-${sc.spoilagePercent}% Spoilage`}
        </div>
        <div style="font-size: 0.7rem; color: var(--text-muted);">
          Price: ₹${sc.projectedPrice}/kg
        </div>
      </div>
    `).join('');

    const optimalTag = document.getElementById('sellWaitOptimalTag');
    if (optimalTag) {
      optimalTag.innerText = `Optimal: ${sw.bestScenarioLabel}`;
      optimalTag.className = sw.isSellTodayOptimal ? 'badge-sell-now' : 'badge-wait';
    }
  }

  renderWeatherCard() {
    const w = this.state.weatherData;
    if (!w) return;

    document.getElementById('weatherConditionIcon').innerText = w.icon;
    document.getElementById('weatherTempDegrees').innerText = `${w.temperature}°C`;
    document.getElementById('weatherConditionTitle').innerText = w.condition;
    document.getElementById('weatherHumidity').innerText = `${w.humidity}%`;
    document.getElementById('weatherRainProb').innerText = `${w.rainProbability}%`;
    document.getElementById('weatherWind').innerText = `${w.windSpeedKmH} km/h`;
    document.getElementById('weatherTransitRisk').innerText = w.rainProbability > 40 ? "Elevated (Rain)" : "Low (Clear)";
    document.getElementById('weatherSourceTag').innerText = `${w.source} (${w.timestamp})`;

    const liveBadge = document.getElementById('weatherLiveBadge');
    liveBadge.innerText = w.isLive ? "🟢 LIVE" : "🟡 DEMO";
    liveBadge.className = w.isLive ? "live-status-pill" : "live-status-pill demo-mode";

    // 5-Day Forecast Strip
    const strip = document.getElementById('weatherForecastStrip');
    if (strip && w.forecast5Day) {
      strip.innerHTML = w.forecast5Day.map(day => `
        <div class="forecast-day-box">
          <div class="forecast-day-name">${day.day}</div>
          <div style="font-size: 1.25rem; margin: 2px 0;">${day.icon}</div>
          <div class="forecast-temp">${day.maxTemp}° / ${day.minTemp}°</div>
          <div style="font-size: 0.68rem; color: #2563eb;">🌧️ ${day.rainProb}%</div>
        </div>
      `).join('');
    }
  }

  renderSmartSellMarketplace() {
    const grid = document.getElementById('smartSellBuyerGrid');
    if (!grid) return;

    grid.innerHTML = VERIFIED_BUYERS.map(buyer => {
      const priceOffer = Number((this.state.financials.sellingPricePerKg * buyer.priceOfferPremium).toFixed(2));
      return `
        <div class="buyer-card">
          <div>
            <div class="buyer-header">
              <h4>${buyer.name}</h4>
              <span class="buyer-badge">${buyer.badge}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem;">
              📍 ${buyer.location} (${buyer.distanceKm} km) • ⭐ ${buyer.rating}/5.0 (${buyer.ordersCompleted} orders)
            </div>
            <div style="font-size: 0.78rem; margin-top: 0.4rem;">
              Payment: <b>${buyer.paymentMode}</b>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.5rem;">
            <div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">BUYER QUOTE</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #059669;">₹${priceOffer.toFixed(2)}/kg</div>
            </div>
            <button type="button" class="btn-sell-action" data-buyer-id="${buyer.id}">
              Sell Now 🤝
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to Sell Now buttons
    grid.querySelectorAll('.btn-sell-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const buyerId = btn.dataset.buyerId;
        const buyer = VERIFIED_BUYERS.find(b => b.id === buyerId);
        if (buyer) this.triggerDemoSellOrder(buyer);
      });
    });
  }

  renderSmartBuyCatalog() {
    const grid = document.getElementById('smartBuyProductGrid');
    if (!grid) return;

    const farmCrop = this.state.farmData.crop;
    const farmStage = this.state.farmData.cropStage;

    // Filter products dynamically based on crop suitability and growth stage
    const filteredProducts = SMART_BUY_CATALOG.filter(p => {
      const matchCrop = p.suitableCrops.includes('all') || p.suitableCrops.includes(farmCrop);
      const matchStage = p.suitableStages.includes(farmStage) || p.suitableStages.includes('all');
      return matchCrop || matchStage;
    });

    const displayList = filteredProducts.length > 0 ? filteredProducts : SMART_BUY_CATALOG.slice(0, 4);

    grid.innerHTML = displayList.map(prod => `
      <div class="product-card">
        <div>
          <div class="product-header">
            <h4>${prod.name}</h4>
            <span class="product-badge">${prod.badge}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">
            Brand: ${prod.brand} • ⭐ ${prod.rating} (${prod.reviews} reviews)
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem; line-height: 1.35;">
            ${prod.description}
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.5rem;">
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #2563eb;">₹${prod.price}</div>
            <div style="font-size: 0.68rem; color: var(--text-muted);">${prod.unit}</div>
          </div>
          <button type="button" class="btn-buy-action" onclick="alert('Demo Purchase: Order for ${prod.name} placed. Simulated delivery in 24 hours.')">
            Order Now 🛒
          </button>
        </div>
      </div>
    `).join('');
  }

  renderCharts() {
    // Render Forecast Canvas
    if (this.state.priceForecastData) {
      ChartHelper.renderPriceForecastChart('chartPriceForecast', this.state.priceForecastData);
      const trendTag = document.getElementById('forecastTrendDirectionTag');
      if (trendTag) trendTag.innerText = `Trend: ${this.state.priceForecastData.overallTrend}`;
    }

    // Render Sell vs Wait Comparative Bar Chart
    if (this.state.sellVsWaitData) {
      ChartHelper.renderSellVsWaitChart('chartSellVsWait', this.state.sellVsWaitData);
    }
  }

  applyTranslations() {
    const lang = this.state.language || 'en';
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.innerText = dict[key];
    });
  }
}

// Instantiate app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.starkApp = new StarkApp();
});
