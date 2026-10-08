const Stock = require('../models/Stock');

const INITIAL_STOCKS = [
  {
    symbol: 'RELIANCE-EQ',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    token: '2885',
    isCurated: true,
    isSuggested: false,
    aliases: ['reliance', 'jio', 'ril'],
    description: "India's largest private sector company, with businesses spanning energy, petrochemicals, retail, and telecommunications through Jio.",
  },
  {
    symbol: 'TCS-EQ',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    token: '11536',
    isCurated: true,
    isSuggested: false,
    aliases: ['tcs', 'tata consultancy'],
    description: "India's largest IT services and consulting company, part of the Tata Group, serving clients across banking, retail, and technology sectors globally.",
  },
  {
    symbol: 'INFY-EQ',
    name: 'Infosys Ltd',
    exchange: 'NSE',
    token: '1594',
    isCurated: true,
    isSuggested: false,
    aliases: ['infy', 'infosys'],
    description: "A global leader in next-generation digital services and consulting, helping clients navigate their digital transformation.",
  },
  {
    symbol: 'HDFCBANK-EQ',
    name: 'HDFC Bank Ltd',
    exchange: 'NSE',
    token: '1333',
    isCurated: true,
    isSuggested: true,
    aliases: ['hdfc', 'hdfc bank'],
    description: "One of India's largest private sector banks, offering a wide range of banking and financial products to retail and corporate customers.",
  },
  {
    symbol: 'ICICIBANK-EQ',
    name: 'ICICI Bank Ltd',
    exchange: 'NSE',
    token: '4963',
    isCurated: true,
    isSuggested: false,
    aliases: ['icici', 'icici bank'],
    description: "A leading private sector bank in India offering banking, insurance, and financial services across retail and corporate segments.",
  },
  {
    symbol: 'SBIN-EQ',
    name: 'State Bank of India',
    exchange: 'NSE',
    token: '3045',
    isCurated: true,
    isSuggested: false,
    aliases: ['sbi', 'state bank', 'sbin'],
    description: "India's largest public sector bank, providing banking services to individuals, businesses, and government entities nationwide.",
  },
  {
    symbol: 'TATAMOTORS-EQ',
    name: 'Tata Motors Ltd',
    exchange: 'NSE',
    token: '3456',
    isCurated: true,
    isSuggested: false,
    aliases: ['tatamotors', 'tata motors'],
    description: "A leading Indian automobile manufacturer producing commercial vehicles, passenger cars, and owner of Jaguar Land Rover.",
  },
  {
    symbol: 'TATASTEEL-EQ',
    name: 'Tata Steel Ltd',
    exchange: 'NSE',
    token: '3499',
    isCurated: true,
    isSuggested: false,
    aliases: ['tatasteel', 'tata steel'],
    description: "One of the world's leading steel producers, with operations spanning India, Europe, and Southeast Asia.",
  },
  {
    symbol: 'ITC-EQ',
    name: 'ITC Ltd',
    exchange: 'NSE',
    token: '1660',
    isCurated: true,
    isSuggested: false,
    aliases: ['itc'],
    description: "A diversified Indian conglomerate with interests in FMCG, hotels, paperboards, packaging, and agribusiness.",
  },
  {
    symbol: 'HINDUNILVR-EQ',
    name: 'Hindustan Unilever Ltd',
    exchange: 'NSE',
    token: '1394',
    isCurated: true,
    isSuggested: false,
    aliases: ['hul', 'unilever', 'hindunilvr'],
    description: "India's largest fast-moving consumer goods company, with products spanning home care, personal care, and food.",
  },
  {
    symbol: 'BAJFINANCE-EQ',
    name: 'Bajaj Finance Ltd',
    exchange: 'NSE',
    token: '317',
    isCurated: true,
    isSuggested: false,
    aliases: ['bajfinance', 'bajaj', 'bajaj finance'],
    description: "A leading non-banking financial company in India offering consumer finance, SME lending, and wealth management.",
  },
  {
    symbol: 'BHARTIARTL-EQ',
    name: 'Bharti Airtel Ltd',
    exchange: 'NSE',
    token: '10604',
    isCurated: true,
    isSuggested: false,
    aliases: ['airtel', 'bharti', 'bharti airtel'],
    description: "One of India's largest telecommunications companies, providing mobile, broadband, and digital services.",
  },
  {
    symbol: 'KOTAKBANK-EQ',
    name: 'Kotak Mahindra Bank Ltd',
    exchange: 'NSE',
    token: '1922',
    isCurated: true,
    isSuggested: false,
    aliases: ['kotak', 'kotak bank'],
    description: "A prominent private sector bank in India offering personal and corporate banking, insurance, and asset management.",
  },
  {
    symbol: 'LT-EQ',
    name: 'Larsen & Toubro Ltd',
    exchange: 'NSE',
    token: '11483',
    isCurated: true,
    isSuggested: true,
    aliases: ['lt', 'l&t', 'lnt', 'larsen'],
    description: "A major Indian multinational conglomerate engaged in engineering, construction, manufacturing, and technology services.",
  },
  {
    symbol: 'MARUTI-EQ',
    name: 'Maruti Suzuki India Ltd',
    exchange: 'NSE',
    token: '10999',
    isCurated: true,
    isSuggested: false,
    aliases: ['maruti', 'suzuki'],
    description: "India's largest passenger car manufacturer, known for affordable and reliable vehicles across segments.",
  },
  {
    symbol: 'WIPRO-EQ',
    name: 'Wipro Ltd',
    exchange: 'NSE',
    token: '3787',
    isCurated: true,
    isSuggested: true,
    aliases: ['wipro'],
    description: "A leading global information technology, consulting, and business process services company headquartered in India.",
  },
  {
    symbol: 'ASIANPAINT-EQ',
    name: 'Asian Paints Ltd',
    exchange: 'NSE',
    token: '236',
    isCurated: true,
    isSuggested: true,
    aliases: ['asianpaint', 'asian paints'],
    description: "India's largest paint company, manufacturing decorative and industrial coatings for domestic and international markets.",
  },
  {
    symbol: 'AXISBANK-EQ',
    name: 'Axis Bank Ltd',
    exchange: 'NSE',
    token: '5900',
    isCurated: true,
    isSuggested: true,
    aliases: ['axis', 'axis bank'],
    description: "One of India's largest private sector banks, offering retail, corporate, and treasury banking services.",
  },
  {
    symbol: 'SUNPHARMA-EQ',
    name: 'Sun Pharmaceutical Industries Ltd',
    exchange: 'NSE',
    token: '3351',
    isCurated: true,
    isSuggested: false,
    aliases: ['sunpharma', 'sun pharma'],
    description: "India's largest pharmaceutical company and a leading generic drug manufacturer with a global presence.",
  },
  {
    symbol: 'TITAN-EQ',
    name: 'Titan Company Ltd',
    exchange: 'NSE',
    token: '3506',
    isCurated: true,
    isSuggested: true,
    aliases: ['titan', 'tanishq'],
    description: "A leading Indian consumer goods company known for watches, jewellery, and eyewear under brands like Tanishq and Fastrack.",
  },
];

const seedStocksIfEmpty = async () => {
  try {
    const count = await Stock.countDocuments();
    if (count === 0) {
      await Stock.insertMany(INITIAL_STOCKS);
      console.log(`Seeded ${INITIAL_STOCKS.length} stock instruments into MongoDB`);
    }
  } catch (error) {
    console.warn('seedStocksIfEmpty error:', error.message);
  }
};

const getCuratedStocksFromDb = async () => {
  await seedStocksIfEmpty();
  return Stock.find({ isCurated: true }).lean();
};

const getSuggestedSymbolsFromDb = async () => {
  await seedStocksIfEmpty();
  const suggested = await Stock.find({ isSuggested: true }).select('symbol').lean();
  return suggested.map((s) => s.symbol);
};

const getStockInfoFromDb = async (symbol) => {
  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() }).lean();
  if (stock) {
    return {
      name: stock.name,
      description: stock.description || 'Company overview stored in MongoDB.',
      exchange: stock.exchange || 'NSE',
      token: stock.token,
    };
  }
  return {
    name: symbol.replace('-EQ', ''),
    description: 'Company overview not available for this equity.',
    exchange: 'NSE',
    token: null,
  };
};

module.exports = {
  INITIAL_STOCKS,
  seedStocksIfEmpty,
  getCuratedStocksFromDb,
  getSuggestedSymbolsFromDb,
  getStockInfoFromDb,
};
