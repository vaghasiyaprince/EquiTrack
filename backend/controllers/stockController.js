// Stock controller providing stock search, stock details with charts, and dashboard data
// Compliant with EquiTrack SRS (Lab 02) and REST API Documentation (Lab 03)

const STOCKS = [
  {
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Limited',
    exchange: 'NSE',
    category: 'Energy & Retail',
    currentPrice: 2942.50,
    dayHigh: 2955.40,
    dayLow: 2908.10,
    change: 34.20,
    changePercent: 1.17,
    description: 'Reliance Industries Limited is an Indian multinational conglomerate headquartered in Mumbai. Its businesses include energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.',
  },
  {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services Ltd',
    exchange: 'NSE',
    category: 'Information Technology',
    currentPrice: 4280.15,
    dayHigh: 4295.00,
    dayLow: 4230.50,
    change: 48.70,
    changePercent: 1.15,
    description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai, operating in 150 locations across 46 countries.',
  },
  {
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank Limited',
    exchange: 'NSE',
    category: 'Banking & Finance',
    currentPrice: 1654.80,
    dayHigh: 1672.20,
    dayLow: 1648.50,
    change: -12.45,
    changePercent: -0.75,
    description: 'HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai, and is India\'s largest private sector bank by assets and market capitalization.',
  },
  {
    symbol: 'TATAMOTORS.NS',
    name: 'Tata Motors Limited',
    exchange: 'NSE',
    category: 'Automotive',
    currentPrice: 984.60,
    dayHigh: 991.40,
    dayLow: 964.10,
    change: 22.35,
    changePercent: 2.32,
    description: 'Tata Motors Limited is a leading Indian multinational automotive manufacturer producing cars, utility vehicles, trucks, and buses across global markets.',
  },
  {
    symbol: 'INFY.NS',
    name: 'Infosys Limited',
    exchange: 'NSE',
    category: 'Information Technology',
    currentPrice: 1928.30,
    dayHigh: 1952.00,
    dayLow: 1920.10,
    change: -16.80,
    changePercent: -0.86,
    description: 'Infosys Limited is a global leader in next-generation digital services and consulting, enabling clients across over 50 countries to navigate their digital transformation.',
  },
  {
    symbol: 'ICICIBANK.NS',
    name: 'ICICI Bank Limited',
    exchange: 'NSE',
    category: 'Banking & Finance',
    currentPrice: 1248.90,
    dayHigh: 1254.00,
    dayLow: 1231.20,
    change: 15.60,
    changePercent: 1.27,
    description: 'ICICI Bank offers a diversified portfolio of financial products and services to retail, SME and corporate customers with extensive branches across India.',
  },
  {
    symbol: 'BHARTIARTL.NS',
    name: 'Bharti Airtel Limited',
    exchange: 'NSE',
    category: 'Telecommunications',
    currentPrice: 1572.40,
    dayHigh: 1580.00,
    dayLow: 1550.00,
    change: 18.90,
    changePercent: 1.22,
    description: 'Bharti Airtel Limited is a leading telecommunications company with operations in South Asia and Africa, providing wireless high-speed telecom, 5G, and enterprise services.',
  },
  {
    symbol: 'ITC.NS',
    name: 'ITC Limited',
    exchange: 'NSE',
    category: 'Consumer Goods',
    currentPrice: 508.25,
    dayHigh: 514.80,
    dayLow: 506.00,
    change: -4.30,
    changePercent: -0.84,
    description: 'ITC Limited is an Indian conglomerate with businesses spanning Fast Moving Consumer Goods, Hotels, Paperboards, Packaging, and Agri-Business.',
  },
  {
    symbol: 'SBIN.NS',
    name: 'State Bank of India',
    exchange: 'NSE',
    category: 'Banking',
    currentPrice: 814.70,
    dayHigh: 819.50,
    dayLow: 805.00,
    change: 8.40,
    changePercent: 1.04,
    description: 'State Bank of India is a Fortune 500 company and the largest public sector bank and financial services statutory body in India.',
  },
  {
    symbol: 'WIPRO.NS',
    name: 'Wipro Limited',
    exchange: 'NSE',
    category: 'Information Technology',
    currentPrice: 538.10,
    dayHigh: 546.50,
    dayLow: 535.20,
    change: -5.90,
    changePercent: -1.08,
    description: 'Wipro Limited is a multinational corporation that provides comprehensive IT consulting, cloud engineering, and business process services.',
  },
  {
    symbol: 'LT.NS',
    name: 'Larsen & Toubro Limited',
    exchange: 'NSE',
    category: 'Infrastructure',
    currentPrice: 3580.00,
    dayHigh: 3610.00,
    dayLow: 3550.00,
    change: 45.20,
    changePercent: 1.28,
    description: 'Larsen & Toubro is an Indian multinational conglomerate involved in engineering, procurement, construction, manufacturing, technology, and financial services.',
  },
  {
    symbol: 'SUNPHARMA.NS',
    name: 'Sun Pharmaceutical Industries',
    exchange: 'NSE',
    category: 'Healthcare & Pharma',
    currentPrice: 1720.50,
    dayHigh: 1735.00,
    dayLow: 1705.00,
    change: -14.20,
    changePercent: -0.82,
    description: 'Sun Pharmaceutical Industries Ltd. is the largest pharmaceutical company in India and the fourth largest specialty generic pharmaceutical company in the world.',
  },
  {
    symbol: 'MARUTI.NS',
    name: 'Maruti Suzuki India Limited',
    exchange: 'NSE',
    category: 'Automotive',
    currentPrice: 12150.00,
    dayHigh: 12240.00,
    dayLow: 12050.00,
    change: 185.00,
    changePercent: 1.55,
    description: 'Maruti Suzuki India Limited is the leading passenger vehicle manufacturer in India, catering to millions of families with innovative mobility solutions.',
  },
];

// Helper to generate chart points for requested duration: 5m, 1d, 1w, 1m (SRS R.3.5)
const generateChartData = (currentPrice, duration = '1d') => {
  const normDuration = String(duration).toLowerCase().trim();
  let count = 24;
  let variance = 0.005;
  const points = [];
  const now = Date.now();

  let stepMs = 60 * 1000; // default 1 min
  let labelFormat = 'time';

  if (normDuration === '5m' || normDuration === '5 minutes') {
    count = 10;
    variance = 0.002;
    stepMs = 30 * 1000; // 30s intervals
    labelFormat = 'time';
  } else if (normDuration === '1d' || normDuration === '1 day') {
    count = 24;
    variance = 0.006;
    stepMs = 15 * 60 * 1000; // 15 min intervals
    labelFormat = 'time';
  } else if (normDuration === '1w' || normDuration === '1 week') {
    count = 28;
    variance = 0.015;
    stepMs = 6 * 60 * 60 * 1000; // 6 hr intervals
    labelFormat = 'weekday';
  } else if (normDuration === '1m' || normDuration === '1 month') {
    count = 30;
    variance = 0.03;
    stepMs = 24 * 60 * 60 * 1000; // daily intervals
    labelFormat = 'date';
  }

  // Create smooth pseudo-random walk ending at currentPrice
  let val = currentPrice * (1 - (Math.random() - 0.5) * variance * 2);
  for (let i = count; i >= 0; i--) {
    const timestamp = new Date(now - i * stepMs);
    let timeLabel = '';
    if (labelFormat === 'time') {
      timeLabel = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (labelFormat === 'weekday') {
      timeLabel = timestamp.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
    } else {
      timeLabel = timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    if (i === 0) {
      val = currentPrice;
    } else {
      const delta = (Math.sin(i / 2.5) * 0.4 + (Math.random() - 0.49)) * (currentPrice * (variance / count * 4));
      val = Math.max(val + delta, currentPrice * 0.6);
    }

    points.push({
      time: timeLabel,
      price: parseFloat(val.toFixed(2)),
    });
  }

  return points;
};

// @desc    Search stocks
// @route   GET /api/stocks/search?q=...
// @access  Public
const searchStocks = async (req, res) => {
  try {
    const query = (req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.json(
        STOCKS.slice(0, 8).map((s) => ({
          symbol: s.symbol,
          name: s.name,
          currentPrice: s.currentPrice,
          changePercent: s.changePercent,
        }))
      );
    }

    const matches = STOCKS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        (s.category && s.category.toLowerCase().includes(query))
    ).map((s) => ({
      symbol: s.symbol,
      name: s.name,
      currentPrice: s.currentPrice,
      changePercent: s.changePercent,
    }));

    return res.json(matches);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get company details and chart data
// @route   GET /api/stocks/:symbol
// @access  Public
const getCompanyDetails = async (req, res) => {
  try {
    const rawSymbol = (req.params.symbol || '').toUpperCase().trim();
    const duration = req.query.duration || '1d';

    const stock = STOCKS.find(
      (s) =>
        s.symbol.toUpperCase() === rawSymbol ||
        s.symbol.toUpperCase().replace('.NS', '') === rawSymbol.replace('.NS', '')
    );

    if (!stock) {
      // Generate a dynamic placeholder if symbol not directly in seed list
      const basePrice = 100.0;
      const chartData = generateChartData(basePrice, duration);
      return res.json({
        symbol: rawSymbol,
        companyName: `${rawSymbol.replace('.NS', '')} Corp`,
        currentPrice: basePrice,
        dayHigh: parseFloat((basePrice * 1.02).toFixed(2)),
        dayLow: parseFloat((basePrice * 0.98).toFixed(2)),
        change: 0.0,
        changePercent: 0.0,
        description: `Informational market profile for ${rawSymbol}.`,
        chartData,
      });
    }

    const chartData = generateChartData(stock.currentPrice, duration);

    return res.json({
      symbol: stock.symbol,
      companyName: stock.name,
      name: stock.name,
      currentPrice: stock.currentPrice,
      dayHigh: stock.dayHigh,
      dayLow: stock.dayLow,
      change: stock.change,
      changePercent: stock.changePercent,
      description: stock.description,
      chartData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get Dashboard data (top gainers, top losers, suggested stocks)
// @route   GET /api/dashboard
// @access  Public
const getDashboardData = async (req, res) => {
  try {
    const sorted = [...STOCKS].sort((a, b) => b.changePercent - a.changePercent);
    const topGainers = sorted.filter((s) => s.changePercent > 0).slice(0, 5);
    const topLosers = [...sorted].reverse().filter((s) => s.changePercent < 0).slice(0, 5);
    const suggested = STOCKS.slice(0, 6);

    return res.json({
      topGainers,
      topLosers,
      suggested,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  STOCKS,
  searchStocks,
  getCompanyDetails,
  getDashboardData,
  generateChartData,
};
