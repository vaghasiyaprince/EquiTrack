import { apiFetch } from './api';

// Curated Indian stocks (NSE) for Dashboard & Suggestions
export const INDIAN_STOCKS_DATA = [
  {
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Limited',
    exchange: 'NSE',
    category: 'Energy & Telecom',
    price: 2942.50,
    change: 34.20,
    changePercent: 1.17,
    open: 2915.00,
    high: 2955.40,
    low: 2908.10,
    vol: '4.82M',
    mktCap: '19.88T',
    pe: 28.4,
    wk52High: 3217.90,
    wk52Low: 2220.30,
    description: 'Reliance Industries Limited is an Indian multinational conglomerate headquartered in Mumbai. Its businesses include energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.',
  },
  {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services Ltd',
    exchange: 'NSE',
    category: 'Information Technology',
    price: 4280.15,
    change: 48.70,
    changePercent: 1.15,
    open: 4240.00,
    high: 4295.00,
    low: 4230.50,
    vol: '1.94M',
    mktCap: '15.48T',
    pe: 31.8,
    wk52High: 4585.00,
    wk52Low: 3313.00,
    description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai. It is a part of the Tata Group and operates in 150 locations across 46 countries.',
  },
  {
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank Limited',
    exchange: 'NSE',
    category: 'Banking & Finance',
    price: 1654.80,
    change: -12.45,
    changePercent: -0.75,
    open: 1668.00,
    high: 1672.20,
    low: 1648.50,
    vol: '14.2M',
    mktCap: '12.59T',
    pe: 19.2,
    wk52High: 1794.00,
    wk52Low: 1363.55,
    description: 'HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India\'s largest private sector bank by assets and market capitalization.',
  },
  {
    symbol: 'TATAMOTORS.NS',
    name: 'Tata Motors Limited',
    exchange: 'NSE',
    category: 'Automotive',
    price: 984.60,
    change: 22.35,
    changePercent: 2.32,
    open: 968.00,
    high: 991.40,
    low: 964.10,
    vol: '8.45M',
    mktCap: '3.62T',
    pe: 11.5,
    wk52High: 1179.05,
    wk52Low: 600.65,
    description: 'Tata Motors Limited is an Indian multinational automotive manufacturing company, headquartered in Mumbai, and a part of the Tata Group. The company produces cars, trucks, vans, and buses.',
  },
  {
    symbol: 'INFY.NS',
    name: 'Infosys Limited',
    exchange: 'NSE',
    category: 'Information Technology',
    price: 1928.30,
    change: -16.80,
    changePercent: -0.86,
    open: 1948.00,
    high: 1952.00,
    low: 1920.10,
    vol: '6.12M',
    mktCap: '8.01T',
    pe: 29.1,
    wk52High: 1991.45,
    wk52Low: 1358.35,
    description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services. It was founded in Pune and is headquartered in Bangalore.',
  },
  {
    symbol: 'ICICIBANK.NS',
    name: 'ICICI Bank Limited',
    exchange: 'NSE',
    category: 'Banking & Finance',
    price: 1248.90,
    change: 15.60,
    changePercent: 1.27,
    open: 1235.00,
    high: 1254.00,
    low: 1231.20,
    vol: '9.80M',
    mktCap: '8.78T',
    pe: 18.5,
    wk52High: 1340.00,
    wk52Low: 914.00,
    description: 'ICICI Bank Limited is an Indian multinational financial institution offering personal and corporate banking, venture capital, asset management, and insurance services.',
  },
  {
    symbol: 'BHARTIARTL.NS',
    name: 'Bharti Airtel Limited',
    exchange: 'NSE',
    category: 'Telecommunications',
    price: 1572.40,
    change: 18.90,
    changePercent: 1.22,
    open: 1555.00,
    high: 1580.00,
    low: 1550.00,
    vol: '4.10M',
    mktCap: '9.12T',
    pe: 54.2,
    wk52High: 1620.00,
    wk52Low: 890.00,
    description: 'Bharti Airtel is a leading global telecommunications company with operations in 18 countries across South Asia and Africa, providing GSM, 4G, 5G, and broadband internet.',
  },
  {
    symbol: 'ITC.NS',
    name: 'ITC Limited',
    exchange: 'NSE',
    category: 'Consumer Goods',
    price: 508.25,
    change: -4.30,
    changePercent: -0.84,
    open: 512.00,
    high: 514.80,
    low: 506.00,
    vol: '11.5M',
    mktCap: '6.35T',
    pe: 30.6,
    wk52High: 528.50,
    wk52Low: 399.30,
    description: 'ITC Limited is an Indian conglomerate with businesses spanning FMCG, Hotels, Paperboards & Specialty Papers, Packaging, Agri-Business, and Information Technology.',
  },
  {
    symbol: 'SBIN.NS',
    name: 'State Bank of India',
    exchange: 'NSE',
    category: 'Banking',
    price: 814.70,
    change: 8.40,
    changePercent: 1.04,
    open: 808.00,
    high: 819.50,
    low: 805.00,
    vol: '16.8M',
    mktCap: '7.27T',
    pe: 10.9,
    wk52High: 912.00,
    wk52Low: 555.20,
    description: 'State Bank of India is a Fortune 500 company and the largest public sector bank and financial services statutory body in India, holding over a 23% asset market share.',
  },
  {
    symbol: 'WIPRO.NS',
    name: 'Wipro Limited',
    exchange: 'NSE',
    category: 'Information Technology',
    price: 538.10,
    change: -5.90,
    changePercent: -1.08,
    open: 544.00,
    high: 546.50,
    low: 535.20,
    vol: '5.6M',
    mktCap: '2.81T',
    pe: 25.4,
    wk52High: 580.00,
    wk52Low: 375.00,
    description: 'Wipro is an Indian multinational corporation that provides IT, consulting and business process services.',
  },
];

// Market Indices (Shown at top of Watchlist pane like Apple Stocks)
export const MARKET_INDICES = [
  {
    symbol: '^NSEI',
    name: 'NIFTY 50',
    exchange: 'NSE',
    price: 25790.95,
    change: 148.25,
    changePercent: 0.58,
    sparkline: [25620, 25660, 25640, 25700, 25750, 25730, 25790],
  },
  {
    symbol: '^BSESN',
    name: 'SENSEX',
    exchange: 'BSE',
    price: 84544.31,
    change: 484.50,
    changePercent: 0.58,
    sparkline: [84020, 84150, 84100, 84320, 84490, 84410, 84544],
  },
  {
    symbol: '^NSEBANK',
    name: 'BANK NIFTY',
    exchange: 'NSE',
    price: 53793.20,
    change: -112.80,
    changePercent: -0.21,
    sparkline: [53920, 53880, 53840, 53800, 53750, 53780, 53793],
  },
];

// Generate deterministic historical candle charts for timeframes: 1D, 1W, 1M, 1Y
export const generateChartData = (basePrice, timeframe = '1D') => {
  let count = 48; // for 1D: 5-min intervals
  let variance = 0.003;
  let dates = [];

  const now = new Date();

  if (timeframe === '1D') {
    count = 42;
    variance = 0.004;
    for (let i = count; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 10 * 60 * 1000);
      dates.push(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  } else if (timeframe === '1W') {
    count = 35;
    variance = 0.012;
    for (let i = count; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
      dates.push(d.toLocaleDateString([], { weekday: 'short', hour: '2-digit' }));
    }
  } else if (timeframe === '1M') {
    count = 30;
    variance = 0.025;
    for (let i = count; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(d.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    }
  } else if (timeframe === '1Y') {
    count = 52;
    variance = 0.05;
    for (let i = count; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      dates.push(d.toLocaleDateString([], { month: 'short', year: '2-digit' }));
    }
  }

  // Generate realistic smooth curve using pseudo-random walk
  const points = [];
  let current = basePrice * (1 - variance * 2);

  for (let i = 0; i <= count; i++) {
    const change = (Math.sin(i / 3) * 0.5 + (Math.random() - 0.48)) * (basePrice * variance);
    current = Math.max(current + change, basePrice * 0.7);
    points.push({
      time: dates[i] || `T-${i}`,
      price: parseFloat(current.toFixed(2)),
    });
  }

  // Ensure last point hits current price
  points[points.length - 1].price = basePrice;
  return points;
};
