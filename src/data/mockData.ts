import { Level } from "@/types";

export const defaultLevels: Level[] = [
  {
    id: "level-beginner",
    name: "Beginner",
    isPaid: false,
    description: "Start your trading journey with fundamental concepts of forex and cryptocurrency markets.",
    courses: [
      {
        id: "course-forex-basics",
        title: "Forex Basics",
        description: "Learn the fundamentals of foreign exchange trading, currency pairs, and market mechanics.",
        levelId: "level-beginner",
        category: "forex",
        modules: [
          {
            id: "mod-fb-1",
            title: "Introduction to Forex",
            courseId: "course-forex-basics",
            order: 1,
            lessons: [
              {
                id: "lesson-fb-1-1",
                title: "What is Forex Trading?",
                content: "<h2>What is Forex Trading?</h2><p>Forex (Foreign Exchange) trading is the act of buying and selling currencies on the global market. It is the largest financial market in the world, with a daily trading volume exceeding $6 trillion.</p><p>In Malawi, understanding forex is crucial as the Malawian Kwacha (MWK) fluctuates against major currencies like the US Dollar, British Pound, and South African Rand.</p><h3>Key Concepts:</h3><ul><li><strong>Currency Pairs</strong> – Currencies are traded in pairs (e.g., USD/MWK)</li><li><strong>Bid/Ask Price</strong> – The price at which you can buy or sell</li><li><strong>Spread</strong> – The difference between bid and ask price</li><li><strong>Pip</strong> – The smallest price movement in a currency pair</li></ul>",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                moduleId: "mod-fb-1",
                order: 1,
                quiz: [
                  {
                    id: "q-fb-1",
                    question: "What is the daily trading volume of the forex market?",
                    options: ["$1 trillion", "$3 trillion", "$6 trillion", "$10 trillion"],
                    correctAnswer: 2,
                  },
                  {
                    id: "q-fb-2",
                    question: "What is a 'pip' in forex trading?",
                    options: ["A type of currency", "The smallest price movement", "A trading platform", "A type of order"],
                    correctAnswer: 1,
                  },
                ],
              },
              {
                id: "lesson-fb-1-2",
                title: "Understanding Currency Pairs",
                content: "<h2>Understanding Currency Pairs</h2><p>In forex trading, currencies are always quoted in pairs. The first currency is the <strong>base currency</strong> and the second is the <strong>quote currency</strong>.</p><h3>Major Pairs:</h3><ul><li>EUR/USD – Euro vs US Dollar</li><li>GBP/USD – British Pound vs US Dollar</li><li>USD/JPY – US Dollar vs Japanese Yen</li></ul><h3>Relevant for Malawi:</h3><ul><li>USD/MWK – US Dollar vs Malawian Kwacha</li><li>ZAR/MWK – South African Rand vs Malawian Kwacha</li></ul>",
                moduleId: "mod-fb-1",
                order: 2,
              },
            ],
          },
          {
            id: "mod-fb-2",
            title: "Market Mechanics",
            courseId: "course-forex-basics",
            order: 2,
            lessons: [
              {
                id: "lesson-fb-2-1",
                title: "How the Forex Market Works",
                content: "<h2>How the Forex Market Works</h2><p>The forex market operates 24 hours a day, 5 days a week across major financial centers worldwide.</p><h3>Trading Sessions:</h3><ul><li><strong>Asian Session</strong> – Tokyo (00:00–09:00 UTC)</li><li><strong>European Session</strong> – London (07:00–16:00 UTC)</li><li><strong>American Session</strong> – New York (12:00–21:00 UTC)</li></ul><p>For Malawian traders, the London session is particularly relevant due to the time zone overlap.</p>",
                moduleId: "mod-fb-2",
                order: 1,
              },
            ],
          },
        ],
      },
      {
        id: "course-crypto-basics",
        title: "Crypto Basics",
        description: "Understand blockchain technology, major cryptocurrencies, and how to start trading crypto.",
        levelId: "level-beginner",
        category: "crypto",
        modules: [
          {
            id: "mod-cb-1",
            title: "Introduction to Cryptocurrency",
            courseId: "course-crypto-basics",
            order: 1,
            lessons: [
              {
                id: "lesson-cb-1-1",
                title: "What is Cryptocurrency?",
                content: "<h2>What is Cryptocurrency?</h2><p>Cryptocurrency is a digital or virtual form of money that uses cryptography for security. Unlike traditional currencies issued by central banks, cryptocurrencies operate on decentralized networks called blockchains.</p><h3>Key Cryptocurrencies:</h3><ul><li><strong>Bitcoin (BTC)</strong> – The first and most valuable cryptocurrency</li><li><strong>Ethereum (ETH)</strong> – Known for smart contracts</li><li><strong>USDT (Tether)</strong> – A stablecoin pegged to the US Dollar</li></ul><p>In Malawi, crypto adoption is growing as people seek alternative investment opportunities and ways to send/receive money internationally.</p>",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                moduleId: "mod-cb-1",
                order: 1,
                quiz: [
                  {
                    id: "q-cb-1",
                    question: "What technology underpins cryptocurrencies?",
                    options: ["Cloud computing", "Blockchain", "Artificial Intelligence", "Quantum computing"],
                    correctAnswer: 1,
                  },
                ],
              },
              {
                id: "lesson-cb-1-2",
                title: "How to Buy Your First Crypto",
                content: "<h2>How to Buy Your First Crypto</h2><p>Getting started with cryptocurrency is easier than you think. Here's a step-by-step guide:</p><ol><li><strong>Choose an Exchange</strong> – Binance, Luno, or Paxful are popular in Africa</li><li><strong>Verify Your Identity</strong> – Complete KYC requirements</li><li><strong>Fund Your Account</strong> – Deposit via mobile money or bank transfer</li><li><strong>Place Your Order</strong> – Buy Bitcoin, Ethereum, or other crypto</li><li><strong>Secure Your Assets</strong> – Use a secure wallet</li></ol>",
                moduleId: "mod-cb-1",
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "level-intermediate",
    name: "Intermediate",
    isPaid: true,
    description: "Advance your trading skills with technical analysis, chart patterns, and indicator strategies.",
    courses: [
      {
        id: "course-candlestick",
        title: "Candlestick Patterns",
        description: "Master Japanese candlestick patterns to predict market movements with confidence.",
        levelId: "level-intermediate",
        category: "forex",
        modules: [
          {
            id: "mod-cs-1",
            title: "Basic Candlestick Patterns",
            courseId: "course-candlestick",
            order: 1,
            lessons: [
              {
                id: "lesson-cs-1-1",
                title: "Reading Candlestick Charts",
                content: "<h2>Reading Candlestick Charts</h2><p>Candlestick charts are the most popular charting method in trading. Each candlestick shows four price points: Open, High, Low, and Close (OHLC).</p><h3>Anatomy of a Candlestick:</h3><ul><li><strong>Body</strong> – The thick part showing open and close prices</li><li><strong>Wicks/Shadows</strong> – The thin lines showing high and low</li><li><strong>Bullish (Green)</strong> – Close is higher than open</li><li><strong>Bearish (Red)</strong> – Close is lower than open</li></ul>",
                moduleId: "mod-cs-1",
                order: 1,
                quiz: [
                  {
                    id: "q-cs-1",
                    question: "What does a bullish candlestick indicate?",
                    options: ["Price went down", "Price went up", "No change", "Market closed"],
                    correctAnswer: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "course-indicators",
        title: "Technical Indicators",
        description: "Learn to use RSI, MACD, Moving Averages, and more to make informed trading decisions.",
        levelId: "level-intermediate",
        category: "crypto",
        modules: [
          {
            id: "mod-ti-1",
            title: "Moving Averages",
            courseId: "course-indicators",
            order: 1,
            lessons: [
              {
                id: "lesson-ti-1-1",
                title: "Simple vs Exponential Moving Averages",
                content: "<h2>Simple vs Exponential Moving Averages</h2><p>Moving averages smooth out price data to identify trends. They are one of the most widely used indicators in trading.</p><h3>Types:</h3><ul><li><strong>SMA (Simple Moving Average)</strong> – Average price over a set period</li><li><strong>EMA (Exponential Moving Average)</strong> – Gives more weight to recent prices</li></ul><h3>Common Periods:</h3><ul><li>20-period – Short-term trend</li><li>50-period – Medium-term trend</li><li>200-period – Long-term trend</li></ul>",
                moduleId: "mod-ti-1",
                order: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "level-expert",
    name: "Expert",
    isPaid: true,
    description: "Master advanced strategies, risk management, and professional trading systems.",
    courses: [
      {
        id: "course-advanced-strategies",
        title: "Advanced Trading Strategies",
        description: "Professional-grade strategies including swing trading, scalping, and position trading.",
        levelId: "level-expert",
        category: "forex",
        modules: [
          {
            id: "mod-as-1",
            title: "Swing Trading Mastery",
            courseId: "course-advanced-strategies",
            order: 1,
            lessons: [
              {
                id: "lesson-as-1-1",
                title: "Swing Trading Fundamentals",
                content: "<h2>Swing Trading Fundamentals</h2><p>Swing trading is a style that aims to capture gains over days to weeks. It's ideal for traders who can't monitor markets full-time.</p><h3>Key Principles:</h3><ul><li>Identify the trend direction</li><li>Wait for pullbacks to key levels</li><li>Enter with confirmation</li><li>Set clear stop-loss and take-profit levels</li></ul>",
                moduleId: "mod-as-1",
                order: 1,
              },
            ],
          },
        ],
      },
      {
        id: "course-risk-management",
        title: "Risk Management Systems",
        description: "Build robust risk management frameworks to protect your capital and maximize returns.",
        levelId: "level-expert",
        category: "crypto",
        modules: [
          {
            id: "mod-rm-1",
            title: "Risk Management Basics",
            courseId: "course-risk-management",
            order: 1,
            lessons: [
              {
                id: "lesson-rm-1-1",
                title: "Position Sizing & Risk-Reward Ratios",
                content: "<h2>Position Sizing & Risk-Reward Ratios</h2><p>The key to long-term trading success is not just winning trades—it's managing your risk on every single trade.</p><h3>The 1% Rule:</h3><p>Never risk more than 1-2% of your trading account on a single trade.</p><h3>Risk-Reward Ratio:</h3><ul><li><strong>1:2</strong> – Risk $1 to make $2 (minimum recommended)</li><li><strong>1:3</strong> – Risk $1 to make $3 (ideal)</li></ul>",
                moduleId: "mod-rm-1",
                order: 1,
                quiz: [
                  {
                    id: "q-rm-1",
                    question: "What is the recommended maximum risk per trade?",
                    options: ["5-10%", "1-2%", "20%", "50%"],
                    correctAnswer: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
