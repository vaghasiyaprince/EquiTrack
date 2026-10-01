// Static company info for our curated stock list (name + description).
// No free API reliably provides this for NSE stocks, so we maintain it ourselves.
const companyInfo = {
  'RELIANCE-EQ': { name: 'Reliance Industries Ltd', description: 'India\'s largest private sector company, with businesses spanning energy, petrochemicals, retail, and telecommunications through Jio.' },
  'TCS-EQ': { name: 'Tata Consultancy Services', description: 'India\'s largest IT services and consulting company, part of the Tata Group, serving clients across banking, retail, and technology sectors globally.' },
  'INFY-EQ': { name: 'Infosys Ltd', description: 'A global leader in next-generation digital services and consulting, helping clients navigate their digital transformation.' },
  'HDFCBANK-EQ': { name: 'HDFC Bank Ltd', description: 'One of India\'s largest private sector banks, offering a wide range of banking and financial products to retail and corporate customers.' },
  'ICICIBANK-EQ': { name: 'ICICI Bank Ltd', description: 'A leading private sector bank in India offering banking, insurance, and financial services across retail and corporate segments.' },
  'SBIN-EQ': { name: 'State Bank of India', description: 'India\'s largest public sector bank, providing banking services to individuals, businesses, and government entities nationwide.' },
  'TATAMOTORS-EQ': { name: 'Tata Motors Ltd', description: 'A leading Indian automobile manufacturer producing commercial vehicles, passenger cars, and owner of Jaguar Land Rover.' },
  'TATASTEEL-EQ': { name: 'Tata Steel Ltd', description: 'One of the world\'s leading steel producers, with operations spanning India, Europe, and Southeast Asia.' },
  'ITC-EQ': { name: 'ITC Ltd', description: 'A diversified Indian conglomerate with interests in FMCG, hotels, paperboards, packaging, and agribusiness.' },
  'HINDUNILVR-EQ': { name: 'Hindustan Unilever Ltd', description: 'India\'s largest fast-moving consumer goods company, with products spanning home care, personal care, and food.' },
  'BAJFINANCE-EQ': { name: 'Bajaj Finance Ltd', description: 'A leading non-banking financial company in India offering consumer finance, SME lending, and wealth management.' },
  'BHARTIARTL-EQ': { name: 'Bharti Airtel Ltd', description: 'One of India\'s largest telecommunications companies, providing mobile, broadband, and digital services.' },
  'KOTAKBANK-EQ': { name: 'Kotak Mahindra Bank Ltd', description: 'A prominent private sector bank in India offering personal and corporate banking, insurance, and asset management.' },
  'LT-EQ': { name: 'Larsen & Toubro Ltd', description: 'A major Indian multinational conglomerate engaged in engineering, construction, manufacturing, and technology services.' },
  'MARUTI-EQ': { name: 'Maruti Suzuki India Ltd', description: 'India\'s largest passenger car manufacturer, known for affordable and reliable vehicles across segments.' },
  'WIPRO-EQ': { name: 'Wipro Ltd', description: 'A leading global information technology, consulting, and business process services company headquartered in India.' },
  'ASIANPAINT-EQ': { name: 'Asian Paints Ltd', description: 'India\'s largest paint company, manufacturing decorative and industrial coatings for domestic and international markets.' },
  'AXISBANK-EQ': { name: 'Axis Bank Ltd', description: 'One of India\'s largest private sector banks, offering retail, corporate, and treasury banking services.' },
  'SUNPHARMA-EQ': { name: 'Sun Pharmaceutical Industries Ltd', description: 'India\'s largest pharmaceutical company and a leading generic drug manufacturer with a global presence.' },
  'TITAN-EQ': { name: 'Titan Company Ltd', description: 'A leading Indian consumer goods company known for watches, jewellery, and eyewear under brands like Tanishq and Fastrack.' },
};

const getCompanyInfo = (symbol) => {
  return companyInfo[symbol] || { name: symbol.replace('-EQ', ''), description: 'Company overview not available for this equity.' };
};

module.exports = { getCompanyInfo };