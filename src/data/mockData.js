// Finance mock data
export const generateStockData = () => {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple', price: 189.84, change: 1.23 },
    { symbol: 'GOOGL', name: 'Google', price: 141.80, change: -0.45 },
    { symbol: 'MSFT', name: 'Microsoft', price: 374.51, change: 2.10 },
    { symbol: 'AMZN', name: 'Amazon', price: 178.25, change: -1.32 },
    { symbol: 'TSLA', name: 'Tesla', price: 248.50, change: 3.55 },
  ];
  return stocks.map(s => ({
    ...s,
    price: +(s.price + (Math.random() - 0.5) * 2).toFixed(2),
    change: +(s.change + (Math.random() - 0.5) * 0.5).toFixed(2),
  }));
};

export const generateSpendingData = () => {
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'];
  return categories.map(cat => ({
    category: cat,
    thisWeek: Math.floor(Math.random() * 200) + 50,
    lastWeek: Math.floor(Math.random() * 200) + 50,
  }));
};

export const generatePortfolioHistory = () => {
  const data = [];
  let value = 10000;
  const now = Date.now();
  for (let i = 30; i >= 0; i--) {
    value += (Math.random() - 0.45) * 300;
    data.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: +value.toFixed(2),
    });
  }
  return data;
};

// Health mock data
export const generateHealthData = () => ({
  steps: Math.floor(Math.random() * 3000) + 5000,
  stepsGoal: 10000,
  sleep: +(Math.random() * 2 + 6).toFixed(1),
  sleepGoal: 8,
  calories: Math.floor(Math.random() * 500) + 1500,
  caloriesGoal: 2200,
  heartRate: Math.floor(Math.random() * 20) + 65,
  hydration: Math.floor(Math.random() * 4) + 5,
  hydrationGoal: 8,
});

export const generateWeeklySteps = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    steps: Math.floor(Math.random() * 5000) + 4000,
    goal: 10000,
  }));
};

export const generateSleepHistory = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    hours: +(Math.random() * 3 + 5.5).toFixed(1),
    goal: 8,
  }));
};

// News mock data
export const mockNewsArticles = [
  {
    id: 1,
    title: 'AI Breakthroughs Reshape Global Tech Industry in 2026',
    source: 'TechCrunch',
    category: 'Technology',
    time: '2h ago',
    summary: 'Major AI advancements are transforming industries worldwide, with new models achieving unprecedented capabilities in reasoning and problem-solving.',
    url: '#',
    trending: true,
  },
  {
    id: 2,
    title: 'Federal Reserve Signals Potential Rate Cuts Amid Economic Uncertainty',
    source: 'Bloomberg',
    category: 'Finance',
    time: '4h ago',
    summary: 'Central bank officials hint at policy shifts as inflation data shows mixed signals across different economic sectors.',
    url: '#',
    trending: false,
  },
  {
    id: 3,
    title: 'New Study Links Daily Walking to Significantly Reduced Heart Disease Risk',
    source: 'Health Daily',
    category: 'Health',
    time: '6h ago',
    summary: 'Research involving 50,000 participants shows that just 30 minutes of walking daily can reduce cardiovascular risk by up to 35%.',
    url: '#',
    trending: true,
  },
  {
    id: 4,
    title: 'SpaceX Successfully Launches Mars Precursor Mission',
    source: 'Space News',
    category: 'Science',
    time: '8h ago',
    summary: 'The mission carries advanced instruments to analyze Martian soil and atmosphere in preparation for future crewed landings.',
    url: '#',
    trending: false,
  },
  {
    id: 5,
    title: 'Global Climate Summit Reaches Historic Carbon Reduction Agreement',
    source: 'Reuters',
    category: 'World',
    time: '10h ago',
    summary: 'Over 190 nations commit to new binding emissions targets with ambitious timelines and international monitoring frameworks.',
    url: '#',
    trending: true,
  },
  {
    id: 6,
    title: 'Electric Vehicle Sales Surpass Traditional Cars in Europe for First Time',
    source: 'Auto Weekly',
    category: 'Technology',
    time: '12h ago',
    summary: 'A landmark shift in consumer preferences, driven by improved charging infrastructure and competitive pricing.',
    url: '#',
    trending: false,
  },
];

// Weather mock data
export const mockWeatherData = {
  city: 'Chennai',
  country: 'IN',
  temp: 18,
  feelsLike: 16,
  condition: 'Partly Cloudy',
  humidity: 72,
  windSpeed: 14,
  visibility: 10,
  uvIndex: 4,
  forecast: [
    { day: 'Today', high: 20, low: 14, icon: 'cloud-sun', condition: 'Partly Cloudy' },
    { day: 'Tue', high: 22, low: 15, icon: 'sun', condition: 'Sunny' },
    { day: 'Wed', high: 17, low: 12, icon: 'cloud-rain', condition: 'Rainy' },
    { day: 'Thu', high: 19, low: 13, icon: 'cloud', condition: 'Cloudy' },
    { day: 'Fri', high: 23, low: 16, icon: 'sun', condition: 'Sunny' },
  ],
};

// Calendar mock data
export const generateCalendarEvents = () => {
  const now = new Date();
  return [
    {
      id: 1,
      title: 'Team Standup',
      time: '09:00 AM',
      duration: '30 min',
      type: 'work',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    },
    {
      id: 2,
      title: 'Product Review',
      time: '11:00 AM',
      duration: '1 hr',
      type: 'work',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    },
    {
      id: 3,
      title: 'Lunch with Alex',
      time: '01:00 PM',
      duration: '1 hr',
      type: 'personal',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    },
    {
      id: 4,
      title: 'Gym Session',
      time: '06:00 PM',
      duration: '1.5 hr',
      type: 'health',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    },
    {
      id: 5,
      title: 'Q2 Planning',
      time: '10:00 AM',
      duration: '2 hr',
      type: 'work',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    },
    {
      id: 6,
      title: 'Doctor Appointment',
      time: '03:00 PM',
      duration: '45 min',
      type: 'health',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
    },
  ];
};
