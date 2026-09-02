/**
 * STARK - Chart & Visualization Utility
 * High-DPI Canvas / SVG rendering for financial and agricultural forecasting
 * Team STARK - Smart India Hackathon 2026
 */

export class ChartHelper {
  /**
   * Render Price Forecast Canvas with Historical + Forecast Horizon + Uncertainty Cone
   */
  static renderPriceForecastChart(canvasId, forecastData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 260;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const historical = forecastData.historical || [];
    const forecast = forecastData.forecast || [];
    const allPoints = [
      ...historical.map(h => ({ xLabel: h.dateStr, price: h.price, isForecast: false })),
      ...forecast.map(f => ({ xLabel: f.dayLabel, price: f.predictedPrice, lower: f.lowerBound, upper: f.upperBound, isForecast: true }))
    ];

    if (allPoints.length === 0) return;

    const padding = { top: 35, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Determine min/max price for Y-scale
    const prices = allPoints.map(p => p.price);
    allPoints.forEach(p => {
      if (p.lower) prices.push(p.lower);
      if (p.upper) prices.push(p.upper);
    });
    const minPrice = Math.floor(Math.min(...prices) * 0.92);
    const maxPrice = Math.ceil(Math.max(...prices) * 1.08);
    const priceRange = maxPrice - minPrice || 1;

    const getX = (index) => padding.left + (index / (allPoints.length - 1)) * chartWidth;
    const getY = (val) => padding.top + chartHeight - ((val - minPrice) / priceRange) * chartHeight;

    // Draw background grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const yVal = minPrice + (i / gridLines) * priceRange;
      const yPos = getY(yVal);
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      // Y-axis labels (₹/kg)
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Plus Jakarta Sans, Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${yVal.toFixed(1)}`, padding.left - 8, yPos + 4);
    }

    // Historical vs Forecast divider line
    const splitIndex = historical.length - 1;
    const splitX = getX(splitIndex);
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(splitX, padding.top);
    ctx.lineTo(splitX, height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Divider labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Plus Jakarta Sans, Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Historical (7d)', splitX - 8, padding.top - 12);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#059669';
    ctx.fillText('AI Forecast (7d) 🔮', splitX + 8, padding.top - 12);

    // Draw Uncertainty Confidence Cone for Forecast
    if (forecast.length > 0) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.beginPath();
      ctx.moveTo(splitX, getY(historical[splitIndex].price));

      for (let i = 0; i < forecast.length; i++) {
        const ptIndex = splitIndex + 1 + i;
        ctx.lineTo(getX(ptIndex), getY(forecast[i].upperBound));
      }
      for (let i = forecast.length - 1; i >= 0; i--) {
        const ptIndex = splitIndex + 1 + i;
        ctx.lineTo(getX(ptIndex), getY(forecast[i].lowerBound));
      }
      ctx.closePath();
      ctx.fill();
    }

    // Draw Historical Line (Solid Blue-Slate)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= splitIndex; i++) {
      const x = getX(i);
      const y = getY(allPoints[i].price);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Forecast Line (Dashed Emerald Green)
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(splitX, getY(historical[splitIndex].price));
    for (let i = splitIndex + 1; i < allPoints.length; i++) {
      ctx.lineTo(getX(i), getY(allPoints[i].price));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Points and X-labels
    allPoints.forEach((pt, index) => {
      const x = getX(index);
      const y = getY(pt.price);

      // Point Circle
      ctx.beginPath();
      ctx.arc(x, y, pt.isForecast ? 4 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = pt.isForecast ? '#059669' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Show X Labels (alternate to avoid crowding)
      if (index % 2 === 0 || index === splitIndex || index === allPoints.length - 1) {
        ctx.fillStyle = pt.isForecast ? '#047857' : '#64748b';
        ctx.font = '10px Plus Jakarta Sans, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pt.xLabel, x, height - padding.bottom + 16);
      }
    });
  }

  /**
   * Render Sell Now vs Wait Scenario Comparison Bar Chart
   */
  static renderSellVsWaitChart(canvasId, sellVsWaitData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 500;
    const height = canvas.clientHeight || 220;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const scenarios = sellVsWaitData.scenarios || [];
    if (scenarios.length === 0) return;

    const padding = { top: 30, right: 25, bottom: 45, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const profits = scenarios.map(s => s.netProfit);
    const minProfit = Math.min(0, Math.min(...profits) * 0.9);
    const maxProfit = Math.max(1000, Math.max(...profits) * 1.15);
    const profitRange = maxProfit - minProfit || 1;

    const barWidth = Math.min(48, (chartWidth / scenarios.length) * 0.55);

    // Draw horizontal grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const pVal = minProfit + (i / 3) * profitRange;
      const yPos = padding.top + chartHeight - ((pVal - minProfit) / profitRange) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Plus Jakarta Sans, Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${(pVal / 1000).toFixed(1)}k`, padding.left - 6, yPos + 4);
    }

    scenarios.forEach((sc, idx) => {
      const xCenter = padding.left + (idx + 0.5) * (chartWidth / scenarios.length);
      const barX = xCenter - barWidth / 2;
      const barH = ((sc.netProfit - minProfit) / profitRange) * chartHeight;
      const barY = padding.top + chartHeight - barH;

      const isBest = sc.key === sellVsWaitData.bestScenarioKey;

      // Draw Bar with rounded top
      ctx.fillStyle = isBest ? '#059669' : (sc.days === 0 ? '#3b82f6' : '#94a3b8');
      this.drawRoundedRect(ctx, barX, barY, barWidth, barH, 6);
      ctx.fill();

      // Top Value text (Net Profit)
      ctx.fillStyle = isBest ? '#047857' : '#1e293b';
      ctx.font = isBest ? 'bold 11px Plus Jakarta Sans, Inter, sans-serif' : '10px Plus Jakarta Sans, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`₹${Math.round(sc.netProfit).toLocaleString('en-IN')}`, xCenter, barY - 8);

      if (isBest) {
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 9px Plus Jakarta Sans, Inter, sans-serif';
        ctx.fillText('★ BEST', xCenter, barY - 20);
      }

      // X Axis labels
      ctx.fillStyle = '#334155';
      ctx.font = '11px Plus Jakarta Sans, Inter, sans-serif';
      ctx.fillText(sc.label, xCenter, height - padding.bottom + 16);

      // Spoilage percentage subtext
      ctx.fillStyle = sc.spoilagePercent > 10 ? '#ef4444' : '#64748b';
      ctx.font = '9px Plus Jakarta Sans, Inter, sans-serif';
      ctx.fillText(sc.days === 0 ? '0% Spoilage' : `-${sc.spoilagePercent}% Spoilage`, xCenter, height - padding.bottom + 30);
    });
  }

  /**
   * Render Decision Scoring Breakdown Horizontal Bars
   */
  static renderDecisionScoreBreakdown(containerId, scoreData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const components = scoreData.components;
    const items = [
      { name: "Profit Potential", key: "profit", icon: "💰", data: components.profit, color: "#10b981" },
      { name: "Market Opportunity", key: "market", icon: "📈", data: components.market, color: "#3b82f6" },
      { name: "Spoilage Resistance", key: "spoilage", icon: "🥬", data: components.spoilage, color: "#f59e0b" },
      { name: "Transport Logistics", key: "transport", icon: "🚚", data: components.transport, color: "#8b5cf6" },
      { name: "Weather Safety", key: "weather", icon: "🌦️", data: components.weather, color: "#06b6d4" }
    ];

    container.innerHTML = items.map(item => `
      <div class="score-breakdown-row">
        <div class="score-row-header">
          <span class="score-row-name">${item.icon} ${item.name}</span>
          <span class="score-row-weight">${(item.data.weight * 100).toFixed(0)}% weight</span>
          <span class="score-row-val font-semibold">${item.data.score}/100</span>
        </div>
        <div class="score-bar-bg">
          <div class="score-bar-fill" style="width: ${item.data.score}%; background-color: ${item.color};"></div>
        </div>
      </div>
    `).join('');
  }

  static drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height < radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
