import { Language } from '../types';

export interface Translations {
  nav: {
    home: string;
    findWorkers: string;
    howItWorks: string;
    features: string;
    reviews: string;
    faq: string;
    login: string;
    getStarted: string;
  };
  hero: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    popularLabel: string;
    exploreStudio: string;
    hireDirectly: string;
    stat1Label: string;
    stat1Val: string;
    stat2Label: string;
    stat2Val: string;
    stat3Label: string;
    stat3Val: string;
    trades: {
      electrician: string;
      plumber: string;
      painter: string;
      carpenter: string;
      finishing: string;
    };
  };
  trustStrip: {
    fayda: string;
    chapa: string;
    contract: string;
    reviews: string;
    districts: string;
    tagline: string;
  };
  trustCollage: {
    tag: string;
    title: string;
    exploreNow: string;
    cards: {
      fayda: { title: string; desc: string; badge: string };
      chapa: { title: string; desc: string; badge: string };
      contracts: { title: string; desc: string; badge: string };
      reviews: { title: string; desc: string; badge: string };
      location: { title: string; desc: string; badge: string };
    };
  };
  manifesto: {
    tag: string;
    title: string;
    p1: string;
    p2: string;
    pill1: string;
    pill2: string;
    pill3: string;
  };
  howItWorks: {
    tag: string;
    title: string;
    subtitle: string;
    stepPrefix: string;
    steps: {
      step1: { tag: string; title: string; desc: string; action: string };
      step2: { tag: string; title: string; desc: string; action: string };
      step3: { tag: string; title: string; desc: string; action: string };
      step4: { tag: string; title: string; desc: string; action: string };
    };
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
    topicLabel: string;
    takeawayLabel: string;
    items: {
      id: string;
      num: string;
      topic: string;
      question: string;
      answer: string;
      takeaway: string;
      badge: string;
    }[];
  };
  categories: {
    tag: string;
    title: string;
    subtitle: string;
    prosCount: string;
    verifiedBadge: string;
    hireNow: string;
    list: {
      id: string;
      num: string;
      name: string;
      fullName: string;
      description: string;
      rate: string;
      workersCount: number;
      districts: string;
    }[];
  };
  features: {
    tag: string;
    title: string;
    subtitle: string;
    tabs: {
      homeowners: string;
      workers: string;
      shared: string;
    };
    dialogue: {
      msg1: string;
      msg2: string;
      msg3: string;
    };
    checklist: string[];
    homeownerChecklist: string[];
    workerChecklist: string[];
    getStarted: string;
    findWorkerBtn: string;
    joinProBtn: string;
    forHomeownersHeading: string;
    hireWithConfidence: string;
    forWorkersHeading: string;
    buildReputation: string;
    proCard: {
      name: string;
      trade: string;
      badge: string;
      faydaBadge: string;
      signedPill: string;
      jobsCount: string;
      ratingValue: string;
      jobsDoneLabel: string;
      ratingLabel: string;
      responseLabel: string;
      responseValue: string;
      faydaVerifiedTitle: string;
      faydaVerifiedSubtitle: string;
    };
    forEveryone: string;
    twoSides: string;
    proSpeakerLabel: string;
    homeownerSpeakerLabel: string;
  };
  reviews: {
    tag: string;
    quote: string;
    subquote: string;
  };
  latestUpdates: {
    title: string;
    subtitle: string;
    findSolution: string;
    verifiedBadge: string;
    problemLabel: string;
    solutionLabel: string;
    benefitLabel: string;
    cards: {
      num: string;
      badge: string;
      problem: string;
      solution: string;
      benefit: string;
    }[];
  };
  cta: {
    title: string;
    subtitle: string;
    findWorker: string;
    joinPro: string;
    verifiedNote: string;
  };
  footer: {
    tagline: string;
    rights: string;
    forClients: string;
    forArtisans: string;
    support: string;
    findWorker: string;
    verifyId: string;
    registerTrade: string;
    safetyGuarantees: string;
    disputeOffice: string;
    chapaStatus: string;
    kaziraHub: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  EN: {
    nav: {
      home: 'Home',
      findWorkers: 'Find Workers',
      howItWorks: 'How It Works',
      features: 'Features',
      reviews: 'Reviews',
      faq: 'FAQ',
      login: 'Login',
      getStarted: 'Get Started'
    },
    hero: {
      title: 'Find Verified Skilled Workers in Dire Dawa',
      subtitle: 'Get Fayda-verified professionals with digital contracts and real ratings.',
      searchPlaceholder: 'What service do you need? (e.g. Electrician, Plumber...)',
      searchButton: 'Search',
      popularLabel: 'Popular Trades:',
      exploreStudio: 'Explore Directory',
      hireDirectly: 'Join as a Pro',
      stat1Label: 'Verified Artisans',
      stat1Val: '180+',
      stat2Label: 'Fayda ID Verified',
      stat2Val: '100%',
      stat3Label: 'Avg Client Rating',
      stat3Val: '4.9★',
      trades: {
        electrician: 'Electrician',
        plumber: 'Plumber',
        painter: 'Painter',
        carpenter: 'Carpenter',
        finishing: 'House Finishing'
      }
    },
    trustStrip: {
      fayda: '100% FAYDA ID VERIFIED',
      chapa: 'SECURE CHAPA PAYMENTS',
      contract: 'DIGITAL CONTRACTS (PROCLAMATION 1156)',
      reviews: 'ZERO ANONYMOUS REVIEWS',
      districts: 'KEZIRA · SABIAN · DECHATU',
      tagline: "DIRE DAWA'S VERIFIED TRADE PLATFORM"
    },
    trustCollage: {
      tag: 'Guaranteed Trust',
      title: 'Why Thousands Trust DireSkill',
      exploreNow: 'Explore Now',
      cards: {
        fayda: {
          title: 'Fayda ID Verified',
          desc: "Every worker's identity confirmed by Ethiopia's national digital ID system before they're listed.",
          badge: 'Dire Dawa Verified'
        },
        chapa: {
          title: 'Secure Chapa Payments',
          desc: "All transactions processed securely through Chapa — Ethiopia's trusted payment gateway.",
          badge: 'Direct Payments'
        },
        contracts: {
          title: 'Digital Contracts',
          desc: 'Every job is backed by a legally documented digital agreement, protecting both parties.',
          badge: 'Proclamation 1156/2019'
        },
        reviews: {
          title: 'Verified Reviews',
          desc: 'Only clients who completed a job can leave reviews. No fake ratings, no anonymous noise.',
          badge: '★ 4.9 Verified Avg'
        },
        location: {
          title: 'Location-Based Search',
          desc: 'Find workers available in your district, eliminating travel delays and hidden fees.',
          badge: 'Kezira · Sabian · Dechatu'
        }
      }
    },
    manifesto: {
      tag: 'MANIFESTO',
      title: 'Craftsmanship Deserves Honor. Homeowners Deserve Certainty.',
      p1: "DireSkill was founded on a simple truth: informal work in Dire Dawa didn't need another directory — it needed dignity, legal protection, and accountability.",
      p2: 'By combining Fayda ID verification, binding digital agreements, and direct Chapa payments, we elevate skilled trades from the shadows into a trusted modern economy.',
      pill1: 'National Fayda ID',
      pill2: 'Digital Contracts',
      pill3: 'Instant Chapa Settlement'
    },
    howItWorks: {
      tag: 'HOW IT WORKS',
      title: 'How DireSkill Works',
      subtitle: 'A clean, transparent process from start to finish. Connect with verified local tradespeople, establish clear terms, and pay directly through Chapa.',
      stepPrefix: 'Step',
      steps: {
        step1: {
          tag: 'Start',
          title: 'Find Verified Worker',
          desc: 'Browse skilled artisans across Kezira, Sabian, and Dechatu. Filter by trade, verified customer reviews, and national Fayda ID confirmation.',
          action: 'Find Workers'
        },
        step2: {
          tag: 'Next',
          title: 'Agree on Terms & Contract',
          desc: 'Send a quick invitation with the job scope and agreed price. A clear digital contract protects both parties before any work begins on site.',
          action: 'Sample Agreement'
        },
        step3: {
          tag: 'Next',
          title: 'Work Completed on Site',
          desc: 'The tradesperson arrives at your location in Dire Dawa and executes the task to standard. You personally inspect the delivered craftsmanship.',
          action: 'On-Site Inspection'
        },
        step4: {
          tag: 'Finish · Done',
          title: 'Pay Directly via Chapa',
          desc: 'Pay the artisan directly through the Chapa gateway using Telebirr, CBE Birr, Awash Bank, or debit cards with instant digital confirmation.',
          action: 'Direct Settlement'
        }
      }
    },
    faq: {
      tag: 'HELP & PROTOCOLS',
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about Fayda verification, digital agreements, and direct Chapa payments in Dire Dawa.',
      topicLabel: 'Topic',
      takeawayLabel: 'Key Takeaway',
      items: [
        {
          id: 'faq-1',
          num: '1',
          topic: 'Fayda ID Verification',
          question: 'How does Fayda ID verification work?',
          answer: "Workers upload their Ethiopia Fayda National Digital ID during registration. Our admin team manually reviews and authenticates the document. Once approved, a verified badge appears permanently on their profile. Unverified workers cannot access the platform's hiring features.",
          takeaway: 'Manual admin verification ensures only authenticated artisans receive hiring invites.',
          badge: 'Fayda Verified · 100%'
        },
        {
          id: 'faq-2',
          num: '2',
          topic: 'Digital Contracts',
          question: 'How are digital contracts created?',
          answer: 'When a client sends a hiring invitation, DireSkill automatically generates a digital service contract from the job details (title, budget, scope, and terms). Both the client and worker review and digitally sign the contract before any work begins.',
          takeaway: 'Auto-generated agreements eliminate verbal ambiguity and set clear legal expectations.',
          badge: 'Digital Agreement · Proclamation 1156'
        },
        {
          id: 'faq-3',
          num: '3',
          topic: 'Chapa Payments',
          question: 'How does the Chapa payment work?',
          answer: "After job completion, the client pays the agreed amount securely through Chapa, Ethiopia's trusted payment gateway. The transaction is recorded in both the client and worker's payment history and is linked to the digital contract as proof of payment.",
          takeaway: 'Direct digital settlements via Telebirr, CBE Birr, Awash Bank, or local cards.',
          badge: 'Chapa Gateway · Instant Settlement'
        },
        {
          id: 'faq-4',
          num: '4',
          topic: 'Pricing & Negotiation',
          question: 'Can workers negotiate prices?',
          answer: 'Yes. Workers can communicate pricing preferences through in-app messaging before a formal hiring invitation is created. Once both parties agree on terms, a contract is drafted with the negotiated amount.',
          takeaway: 'Transparent communication before contract generation ensures mutual alignment.',
          badge: 'Mutual Terms · Fair Pricing'
        },
        {
          id: 'faq-5',
          num: '5',
          topic: 'Dispute Resolution',
          question: 'What happens if there is a dispute?',
          answer: 'Both clients and workers can raise a dispute from within the contract details page. Our admin team reviews the dispute, examines the contract terms and any uploaded evidence, and issues a binding platform decision within 48 hours.',
          takeaway: 'Direct arbitration backed by documented scope and photo evidence within 48 hours.',
          badge: '48h Resolution · Documented Scope'
        },
        {
          id: 'faq-6',
          num: '6',
          topic: 'Reputation & Reviews',
          question: 'How do workers improve their reputation?',
          answer: 'Every completed, paid job allows the client to leave a verified rating and written review. Workers accumulate ratings over time, building a public reputation score visible to all future clients. High-rated workers appear higher in search results.',
          takeaway: 'Only verified clients who completed paid contracts can submit reviews.',
          badge: 'Verified Ratings · Zero Anonymous'
        }
      ]
    },
    categories: {
      tag: 'DISCOVER TRADES',
      title: 'Explore Categories',
      subtitle: 'Categories cycle automatically in order, or tap any card or category below to inspect verified artisans in Dire Dawa.',
      prosCount: 'Pros',
      verifiedBadge: '✓ Verified',
      hireNow: 'Hire Now',
      list: [
        {
          id: 'cat-electrician',
          num: '1',
          name: 'Electrician',
          fullName: 'Electricians & Power Systems',
          description: 'Certified electrical technicians for residential breaker panels, solar inverter coupling, rewiring, and emergency fault isolation.',
          rate: 'From ETB 4,500',
          workersCount: 34,
          districts: 'Kezira · Sabian · Dechatu'
        },
        {
          id: 'cat-plumbers',
          num: '2',
          name: 'Plumbers',
          fullName: 'Plumbing & Pipe Fitting',
          description: 'Experienced plumbers for overhead rooftop water tanks, high-pressure PVC fittings, booster pump maintenance, and drainage leaks.',
          rate: 'From ETB 3,500',
          workersCount: 28,
          districts: 'Sabian · Kezira · Gende Kore'
        },
        {
          id: 'cat-finishing',
          num: '3',
          name: 'House finishing',
          fullName: 'House Finishing & Gypsum',
          description: 'Precision craftsmen for modern gypsum false ceilings, laser-guided ceramic tile leveling, and elegant interior stucco plastering.',
          rate: 'From ETB 5,000',
          workersCount: 22,
          districts: 'Dechatu · Kezira · Melka Jebdu'
        },
        {
          id: 'cat-painter',
          num: '4',
          name: 'Painter',
          fullName: 'Surface Coatings & Painting',
          description: 'Clean surface specialists for smooth interior wall washes, weather-shield exterior painting, decorative textures, and glossy trim finishes.',
          rate: 'From ETB 4,000',
          workersCount: 26,
          districts: 'Kezira · Sabian · Dechatu'
        },
        {
          id: 'cat-satellite',
          num: '5',
          name: 'Satellite dish worker',
          fullName: 'Satellite Dish & Receiver Tech',
          description: 'Rooftop technicians for precision Nilesat & Yahsat dish alignment, high-gain LNB frequency tuning, multi-room splitters, and decoder setup.',
          rate: 'From ETB 1,800',
          workersCount: 19,
          districts: 'Kezira · Sabian · Addis Ketema'
        },
        {
          id: 'cat-others',
          num: '6',
          name: 'Others',
          fullName: 'Carpentry, Masonry & General',
          description: 'Verified carpenters, masonry artisans, and welding specialists for custom hardwood furniture, solid security doors, and structural home fixes.',
          rate: 'From ETB 3,000',
          workersCount: 41,
          districts: 'All Dire Dawa Woredas'
        }
      ]
    },
    features: {
      tag: 'FEATURES',
      title: 'Everything you need. Nothing you don\'t.',
      subtitle: 'Designed for Dire Dawa homeowners who need verified reliability, and skilled workers who want respected careers.',
      tabs: {
        homeowners: 'FOR HOMEOWNERS',
        workers: 'FOR WORKERS',
        shared: 'SHARED'
      },
      dialogue: {
        msg1: 'I can start the wiring tomorrow morning.',
        msg2: 'That works for me. Sending contract now.',
        msg3: 'Contract signed — job is now active'
      },
      checklist: [
        'Real-time in-app messaging',
        'Push notifications',
        'Dispute reporting and resolution',
        'Contract history and PDF export',
        'Review and rating system',
        'Multilingual support (EN, AM, ORO)'
      ],
      homeownerChecklist: [
        'Nearby worker search by district',
        'Fayda-verified worker profiles',
        'Real reviews and star ratings',
        'In-app messaging',
        'Digital contract creation',
        'Secure Chapa payment integration',
        'Job tracking and progress updates',
        'Dispute reporting system'
      ],
      workerChecklist: [
        'Professional digital profile and portfolio',
        'Fayda ID verification badge',
        'Receive and manage job requests',
        'Sign and manage digital contracts',
        'Secure payment history',
        'Community feed for professionals',
        'Bidirectional reputation system',
        'Career growth through verified reviews'
      ],
      getStarted: 'GET STARTED',
      findWorkerBtn: 'FIND A WORKER',
      joinProBtn: 'JOIN AS PROFESSIONAL',
      forHomeownersHeading: 'FOR HOMEOWNERS',
      hireWithConfidence: 'HIRE WITH CONFIDENCE.',
      forWorkersHeading: 'FOR WORKERS',
      buildReputation: 'BUILD YOUR REPUTATION.',
      proSpeakerLabel: 'DIRE PRO · ELECTRICAL (KEZIRA)',
      homeownerSpeakerLabel: 'HOMEOWNER · VERIFIED',
      proCard: {
        name: 'Samuel T.',
        trade: 'ELECTRICIAN · KEZIRA',
        badge: 'Fayda Verified',
        faydaBadge: '✓ FAYDA',
        signedPill: 'Digital contract signed by both parties',
        jobsCount: '42 jobs',
        ratingValue: '4.9 ★',
        jobsDoneLabel: 'JOBS DONE',
        ratingLabel: 'RATING',
        responseLabel: 'RESPONSE',
        responseValue: '< 1h',
        faydaVerifiedTitle: 'FAYDA VERIFIED',
        faydaVerifiedSubtitle: 'Identity confirmed by national ID'
      },
      forEveryone: 'FOR EVERYONE',
      twoSides: 'ONE PLATFORM. TWO SIDES.'
    },
    reviews: {
      tag: 'TESTIMONIALS',
      quote: '“DireSkill was built with the desire to liberate homeowners and workers from informal uncertainty, allowing them to focus on true quality craftsmanship.”',
      subquote: 'Verified Reviews from Kezira, Sabian & Dechatu Clients'
    },
    latestUpdates: {
      title: 'Hiring informal workers today is broken',
      subtitle: 'Before DireSkill, every hire was a gamble — no credentials, no receipts, no accountability.',
      findSolution: 'Find Solution',
      verifiedBadge: 'DireSkill Verified',
      problemLabel: 'Problem',
      solutionLabel: 'Solution',
      benefitLabel: 'Benefit',
      cards: [
        {
          num: '01',
          badge: 'Discovery · 100% Verified',
          problem: 'Workers advertise using hand-written posters.',
          solution: 'Search verified professionals by skill and district instantly.',
          benefit: 'Hire faster with confidence.'
        },
        {
          num: '02',
          badge: 'National Fayda · Authentication',
          problem: "No way to verify a worker's real identity.",
          solution: "Every worker passes Ethiopia's Fayda Digital ID verification.",
          benefit: 'Know exactly who is entering your home.'
        },
        {
          num: '03',
          badge: 'Legal Agreement · Proclamation 1156',
          problem: 'Verbal agreements lead to disputes with no proof.',
          solution: 'Create a legally documented digital contract with one click.',
          benefit: 'Both parties are protected, always.'
        },
        {
          num: '04',
          badge: 'Chapa Gateway · Digital History',
          problem: 'Cash payments leave no record for either party.',
          solution: 'Pay securely through Chapa — the most trusted Ethiopian gateway.',
          benefit: 'A full transaction history at your fingertips.'
        }
      ]
    },
    cta: {
      title: 'Ready to Experience Reliable Craftsmanship?',
      subtitle: 'Join hundreds of satisfied homeowners and verified artisans in Dire Dawa today. Protected by Fayda ID and Chapa payments.',
      findWorker: 'Find Verified Workers',
      joinPro: 'Join as a Pro',
      verifiedNote: 'Protected under Ethiopian Proclamation 1156/2019 · Dire Dawa Trade Bureau aligned'
    },
    footer: {
      tagline: "Dire Dawa's verified informal labor marketplace. Connecting skilled artisans with homeowners through national Fayda verification and secure Chapa payments.",
      rights: 'DireSkill Platform. All rights reserved. Dire Dawa, Ethiopia.',
      forClients: 'For Homeowners',
      forArtisans: 'For Artisans',
      support: 'Support & Bureau',
      findWorker: 'Find Verified Worker',
      verifyId: 'Fayda ID Audit',
      registerTrade: 'Register Your Trade',
      safetyGuarantees: 'Safety & Disputes',
      disputeOffice: 'Dispute Arbitration',
      chapaStatus: 'Chapa Settlements',
      kaziraHub: 'Kezira Artisan Hub'
    }
  },

  'አማ': {
    nav: {
      home: 'መነሻ',
      findWorkers: 'ባለሙያዎች',
      howItWorks: 'እንዴት ይሰራል',
      features: 'ባህሪያት',
      reviews: 'አስተያየቶች',
      faq: 'ጥያቄዎች',
      login: 'ይግቡ',
      getStarted: 'ይጀምሩ'
    },
    hero: {
      title: 'በድሬዳዋ የተረጋገጡ ባለሙያዎችን በቀላሉ ያግኙ',
      subtitle: 'በፋይዳ ብሔራዊ ዲጂታል መታወቂያ የተረጋገጡ፣ ሕጋዊ ዲጂታል ውልና እውነተኛ ደረጃ ያላቸው ባለሙያዎች።',
      searchPlaceholder: 'ምን ዓይነት ባለሙያ ይፈልጋሉ? (ለምሳሌ ኤሌክትሪሻን፣ ቧንቧ ሠራተኛ...)',
      searchButton: 'ፈልግ',
      popularLabel: 'ተፈላጊ ሙያዎች:',
      exploreStudio: 'ባለሙያዎችን ያስሱ',
      hireDirectly: 'እንደ ባለሙያ ይመዝገቡ',
      stat1Label: 'የተረጋገጡ ባለሙያዎች',
      stat1Val: '180+',
      stat2Label: 'የፋይዳ ማረጋገጫ',
      stat2Val: '100%',
      stat3Label: 'አማካይ የደንበኛ ደረጃ',
      stat3Val: '4.9★',
      trades: {
        electrician: 'ኤሌክትሪሻን',
        plumber: 'የቧንቧ ሠራተኛ',
        painter: 'ቀለም ቀቢ',
        carpenter: 'አናፂ',
        finishing: 'የቤት ማጠናቀቂያ'
      }
    },
    trustStrip: {
      fayda: '100% በፋይዳ መታወቂያ የተረጋገጠ',
      chapa: 'አስተማማኝ የቻፓ ክፍያ',
      contract: 'ሕጋዊ ዲጂታል ውል (አዋጅ ቁጥር 1156)',
      reviews: 'እውነተኛ አስተያየቶች ብቻ',
      districts: 'ቀዚራ · ሳቢያን · ደቻቱ',
      tagline: 'የድሬዳዋ የታመነ የባለሙያዎች መድረክ'
    },
    trustCollage: {
      tag: 'የተረጋገጠ እምነት',
      title: 'በሺዎች የሚቆጠሩ ደንበኞች በድሬስኪል ለምን ይተማመናሉ',
      exploreNow: 'አሁን ያስሱ',
      cards: {
        fayda: {
          title: 'በፋይዳ መታወቂያ የተረጋገጠ',
          desc: 'እያንዳንዱ ባለሙያ በኢትዮጵያ ብሔራዊ ዲጂታል መታወቂያ (ፋይዳ) ማንነቱ ተረጋግጦ ይመዘገባል።',
          badge: 'በድሬዳዋ የተረጋገጠ'
        },
        chapa: {
          title: 'አስተማማኝ የቻፓ ክፍያ',
          desc: 'ሁሉም ክፍያዎች በኢትዮጵያ አስተማማኝ የክፍያ መድረክ በቻፓ (Chapa) በኩል ይፈጸማሉ።',
          badge: 'ቀጥታ ክፍያ'
        },
        contracts: {
          title: 'ዲጂታል ውሎች',
          desc: 'እያንዳንዱ ሥራ በሕጋዊ ዲጂታል ውል የተደገፈ ሲሆን ሁለቱንም ወገኖች ከአለመግባባት ይጠብቃል።',
          badge: 'አዋጅ 1156/2011'
        },
        reviews: {
          title: 'እውነተኛ አስተያየቶች',
          desc: 'ሥራውን ያጠናቀቁ እውነተኛ ደንበኞች ብቻ ደረጃ እና አስተያየት መስጠት ይችላሉ።',
          badge: '★ 4.9 አማካይ ደረጃ'
        },
        location: {
          title: 'በአካባቢ ላይ የተመሠረተ ፍለጋ',
          desc: 'በአቅራቢያዎ እና በክፍለ ከተማዎ ያሉ ባለሙያዎችን በመምረጥ የጉዞ መዘግየትን ያስወግዱ።',
          badge: 'ቀዚራ · ሳቢያን · ደቻቱ'
        }
      }
    },
    manifesto: {
      tag: 'ማኒፌስቶ',
      title: 'ሙያ ክብር ይገባዋል፤ ደንበኞች ደግሞ ዋስትና ይገባቸዋል።',
      p1: 'ድሬስኪል የተመሠረተው በአንድ እውነት ላይ ነው፡ በድሬዳዋ መደበኛ ያልሆነው የጉልበት ሥራ ሌላ ዝርዝር ማውጫ ሳይሆን ክብር፣ ሕጋዊ ጥበቃ እና ተጠያቂነት ያስፈልገዋል።',
      p2: 'የፋይዳ ዲጂታል መታወቂያን፣ አስገዳጅ ዲጂታል ውሎችን እና የቀጥታ ቻፓ ክፍያን በማስተሳሰር፣ የተካኑ ሙያዎችን ወደ ዘመናዊና የታመነ ኢኮኖሚ እናሳድጋለን።',
      pill1: 'ብሔራዊ የፋይዳ መታወቂያ',
      pill2: 'ሕጋዊ ዲጂታል ውሎች',
      pill3: 'ፈጣን የቻፓ ክፍያ'
    },
    howItWorks: {
      tag: 'የአሠራር ሂደት',
      title: 'ድሬስኪል እንዴት ይሰራል',
      subtitle: 'ከመጀመሪያ እስከ መጨረሻ ግልጽ እና አስተማማኝ ሂደት። ከተረጋገጡ የአካባቢው ባለሙያዎች ጋር ይገናኙ፣ ውል ይፈራረሙ፣ በቻፓ ይክፈሉ።',
      stepPrefix: 'ደረጃ',
      steps: {
        step1: {
          tag: 'መጀመሪያ',
          title: 'የተረጋገጠ ባለሙያ ይፈልጉ',
          desc: 'በቀዚራ፣ ሳቢያን እና ደቻቱ ያሉ ባለሙያዎችን ያስሱ። በሙያ፣ በእውነተኛ ደረጃ እና በፋይዳ መታወቂያ ያጣሩ።',
          action: 'ባለሙያዎችን ፈልግ'
        },
        step2: {
          tag: 'ቀጣይ',
          title: 'ውል እና ዋጋ ይስማሙ',
          desc: 'የሥራውን ዝርዝር እና ዋጋ ያካተተ ፈጣን ጥሪ ይላኩ። ሥራ ከመጀመሩ በፊት ሕጋዊ ዲጂታል ውል ይዘጋጃል።',
          action: 'የናሙና ውል ይመልከቱ'
        },
        step3: {
          tag: 'ቀጣይ',
          title: 'ሥራው በቦታው ይጠናቀቃል',
          desc: 'ባለሙያው ድሬዳዋ ወዳሉበት ቦታ በመምጣት ሥራውን በጥራት ያከናውናል፤ ሥራውን መርምረው ያረጋግጣሉ።',
          action: 'የጥራት ፍተሻ'
        },
        step4: {
          tag: 'ፍፃሜ · ተጠናቋል',
          title: 'በቻፓ በቀጥታ ይክፈሉ',
          desc: 'ሥራው ሲጠናቀቅ በቴሌብር፣ በሲቢኢ ብር፣ በአዋሽ ባንክ ወይም በካርድ በቻፓ በኩል ደህንነቱ በተጠበቀ ሁኔታ ይክፈሉ።',
          action: 'ቀጥታ ክፍያ ፈጽም'
        }
      }
    },
    faq: {
      tag: 'እገዛ እና መመሪያዎች',
      title: 'ተደጋግመው የሚጠየቁ ጥያቄዎች',
      subtitle: 'ስለ ፋይዳ ማረጋገጫ፣ ዲጂታል ውሎች እና የቀጥታ ቻፓ ክፍያ ማወቅ የሚፈልጉት ሙሉ መረጃ።',
      topicLabel: 'ርዕስ',
      takeawayLabel: 'ዋና ነጥብ',
      items: [
        {
          id: 'faq-1',
          num: '1',
          topic: 'የፋይዳ መታወቂያ ማረጋገጫ',
          question: 'የፋይዳ መታወቂያ ማረጋገጫ እንዴት ይሰራል?',
          answer: 'ባለሙያዎች በሚመዘገቡበት ጊዜ የኢትዮጵያን የፋይዳ ብሔራዊ ዲጂታል መታወቂያቸውን ይሰቅላሉ። አስተዳዳሪዎቻችን ሰነዱን መርምረው ያረጋግጣሉ። ሲረጋገጥ የተረጋገጠ ባጅ በቋሚነት በፕሮፋይላቸው ላይ ይታያል። ያልተረጋገጡ ባለሙያዎች የቅጥር አገልግሎት ማግኘት አይችሉም።',
          takeaway: 'የአስተዳዳሪ ማረጋገጫ የታመኑ እና ማንነታቸው የተረጋገጠ ባለሙያዎች ብቻ እንዲቀጠሩ ዋስትና ይሰጣል።',
          badge: 'በፋይዳ የተረጋገጠ · 100%'
        },
        {
          id: 'faq-2',
          num: '2',
          topic: 'ዲጂታል ውሎች',
          question: 'ዲጂታል ውሎች እንዴት ይዘጋጃሉ?',
          answer: 'ደንበኛው የቅጥር ጥሪ ሲልክ፣ ድሬስኪል በሥራው ዝርዝር (ርዕስ፣ በጀት፣ ወሰንና ውሎች) መሠረት ዲጂታል የውል ስምምነት ያዘጋጃል። ሥራ ከመጀመሩ በፊት ሁለቱም ወገኖች ውሉን አንብበው በዲጂታል መንገድ ይፈርማሉ።',
          takeaway: 'በራስ-ሰር የሚዘጋጁ ውሎች የቃል አለመግባባትን ያስቀራሉ፣ ግልጽ ሕጋዊ ጥበቃ ይሰጣሉ።',
          badge: 'ዲጂታል ውል · አዋጅ 1156'
        },
        {
          id: 'faq-3',
          num: '3',
          topic: 'የቻፓ ክፍያዎች',
          question: 'የቻፓ ክፍያ እንዴት ይሰራል?',
          answer: 'ሥራው ከተጠናቀቀ በኋላ ደንበኛው የተስማሙበትን ገንዘብ በኢትዮጵያ አስተማማኝ የክፍያ መድረክ በቻፓ በኩል ይከፍላል። ክፍያው በደንበኛውና በባለሙያው ታሪክ ውስጥ ተመዝግቦ ለውሉ ማረጋገጫ ሆኖ ይቀመጣል።',
          takeaway: 'በቴሌብር፣ በሲቢኢ ብር፣ በአዋሽ ባንክ ወይም በባንክ ካርዶች ቀጥታ ፈጣን ክፍያ።',
          badge: 'የቻፓ መድረክ · ፈጣን ክፍያ'
        },
        {
          id: 'faq-4',
          num: '4',
          topic: 'ዋጋ እና ድርድር',
          question: 'ባለሙያዎች በዋጋ መደራደር ይችላሉ?',
          answer: 'አዎ። ይፋዊ የቅጥር ውል ከመዘጋጀቱ በፊት ባለሙያዎች በመተግበሪያው መልእክት መላኪያ በኩል የዋጋ ድርድር ማድረግ ይችላሉ። ሁለቱም ሲስማሙ ውሉ በተስማሙበት ዋጋ ይዘጋጃል።',
          takeaway: 'ከውል ዝግጅት በፊት የሚደረግ ግልጽ ግንኙነት የጋራ ስምምነትን ያረጋግጣል።',
          badge: 'የጋራ ስምምነት · ፍትሐዊ ዋጋ'
        },
        {
          id: 'faq-5',
          num: '5',
          topic: 'አለመግባባቶችን መፍታት',
          question: 'አለመግባባት ቢፈጠር ምን ይደረጋል?',
          answer: 'ሁለቱም ወገኖች ከውል ዝርዝር ገጽ ላይ ቅሬታ ማቅረብ ይችላሉ። አስተዳዳሪዎቻችን ውሉን እና ማስረጃዎችን መርምረው በ48 ሰዓታት ውስጥ አስገዳጅ ውሳኔ ይሰጣሉ።',
          takeaway: 'በተመዘገበ ውል እና የፎቶ ማስረጃ የተደገፈ ፈጣን የሽምግልና ውሳኔ በ48 ሰዓት።',
          badge: 'የ48 ሰዓት ውሳኔ · የተመዘገበ ውል'
        },
        {
          id: 'faq-6',
          num: '6',
          topic: 'ደረጃ እና አስተያየቶች',
          question: 'ባለሙያዎች መልካም ስማቸውን እንዴት ያሳድጋሉ?',
          answer: 'እያንዳንዱ የተጠናቀቀና የተከፈለበት ሥራ ደንበኛው ደረጃና አስተያየት እንዲሰጥ ያስችለዋል። ባለሙያዎች በጊዜ ሂደት መልካም ስማቸውን በመገንባት በውጤት ሰሌዳው ላይ ቀድመው ይታያሉ።',
          takeaway: 'ሥራቸውን ያጠናቀቁ እውነተኛ ደንበኞች ብቻ ደረጃ መስጠት ይችላሉ።',
          badge: 'የተረጋገጠ ደረጃ · ሐሰተኛ የለም'
        }
      ]
    },
    categories: {
      tag: 'ሙያዎችን ያስሱ',
      title: 'የሥራ ዘርፎች',
      subtitle: 'ዘርፎች በራስ-ሰር ይፈራረቃሉ፣ ወይም የተረጋገጡ የድሬዳዋ ባለሙያዎችን ለማየት ከስር ይምረጡ።',
      prosCount: 'ባለሙያዎች',
      verifiedBadge: '✓ የተረጋገጠ',
      hireNow: 'አሁን ይቅጠሩ',
      list: [
        {
          id: 'cat-electrician',
          num: '1',
          name: 'ኤሌክትሪሻን',
          fullName: 'የኤሌክትሪክ እና የኃይል ሲስተም',
          description: 'የቤት ውስጥ ቆጣሪ፣ የሶላር ኢንቨርተር ተከላ፣ አዲስ መስመር ዝርጋታ እና ድንገተኛ ብልሽት ጥገና ባለሙያዎች።',
          rate: 'ከብር 4,500 ጀምሮ',
          workersCount: 34,
          districts: 'ቀዚራ · ሳቢያን · ደቻቱ'
        },
        {
          id: 'cat-plumbers',
          num: '2',
          name: 'የቧንቧ ሠራተኛ',
          fullName: 'የቧንቧ እና መስመር ዝርጋታ',
          description: 'የጣሪያ የውሃ ታንከር ተከላ፣ የፒቪሲ ቧንቧ ፍሳሽ ጥገና፣ የውሃ መሳቢያ ፓምፕ እና የፍሳሽ መስመር ማስተካከያ።',
          rate: 'ከብር 3,500 ጀምሮ',
          workersCount: 28,
          districts: 'ሳቢያን · ቀዚራ · ገنده ቆሬ'
        },
        {
          id: 'cat-finishing',
          num: '3',
          name: 'የቤት ማጠናቀቂያ',
          fullName: 'የቤት ማጠናቀቂያ እና ጂፕሰም',
          description: 'ዘመናዊ የጂፕሰም ጣሪያ፣ የሴራሚክ እና ሸክላ ንጣፍ፣ እንዲሁም ውብ የውስጥ ፕላስተር ሥራ ባለሙያዎች።',
          rate: 'ከብር 5,000 ጀምሮ',
          workersCount: 22,
          districts: 'ደቻቱ · ቀዚራ · መልካ ጀብዱ'
        },
        {
          id: 'cat-painter',
          num: '4',
          name: 'ቀለም ቀቢ',
          fullName: 'የግድግዳ ቅብ እና ውበት',
          description: 'ለስላሳ የውስጥ ግድግዳ ቅብ፣ የአየር ሁኔታን የሚቋቋም የውጭ ቀለም እና የጌጣጌጥ ቴክስቸር ሥራዎች።',
          rate: 'ከብር 4,000 ጀምሮ',
          workersCount: 26,
          districts: 'ቀዚራ · ሳቢያን · ደቻቱ'
        },
        {
          id: 'cat-satellite',
          num: '5',
          name: 'የዲሽ ቴክኒሻን',
          fullName: 'የሳተላይት ዲሽ እና ሪሲቨር ቴክኒሻን',
          description: 'የናይልሳት እና ያህሳት ዲሽ አቅጣጫ ማስተካከል፣ ኤልኤንቢ ፍሪኩዌንሲ ቅንብር እና የብዙ ክፍሎች መስመር ማገናኘት።',
          rate: 'ከብር 1,800 ጀምሮ',
          workersCount: 19,
          districts: 'ቀዚራ · ሳቢያን · አዲስ ከተማ'
        },
        {
          id: 'cat-others',
          num: '6',
          name: 'ሌሎች ሙያዎች',
          fullName: 'አናፂ፣ የግንበኝነት እና ብየዳ',
          description: 'ጠንካራ የቤት ዕቃዎች፣ የጥበቃ በሮች፣ የብረት ብየዳ እና አጠቃላይ የቤት ውስጥ ጥገና ባለሙያዎች።',
          rate: 'ከብር 3,000 ጀምሮ',
          workersCount: 41,
          districts: 'ሁሉም የድሬዳዋ ወረዳዎች'
        }
      ]
    },
    features: {
      tag: 'ባህሪያት',
      title: 'የሚያስፈልግዎት ሁሉ በአንድ ቦታ።',
      subtitle: 'አስተማማኝነት ለሚፈልጉ የድሬዳዋ የቤት ባለቤቶች እና የተከበረ ሥራ ለሚሹ ባለሙያዎች የተዘጋጀ።',
      tabs: {
        homeowners: 'ለቤት ባለቤቶች',
        workers: 'ለባለሙያዎች',
        shared: 'የጋራ'
      },
      dialogue: {
        msg1: 'የኤሌክትሪክ መስመሩን ነገ ጠዋት መጀመር እችላለሁ።',
        msg2: 'ይስማማኛል፤ ውሉን አሁን እየላኩልዎት ነው።',
        msg3: 'ውል ተፈርሟል — ሥራው በይፋ ተጀምሯል'
      },
      checklist: [
        'የቀጥታ የመልእክት ልውውጥ',
        'ፈጣን ማሳወቂያዎች',
        'አለመግባባቶችን ሪፖርት ማድረግና መፍታት',
        'የውል ታሪክ እና በፒዲኤፍ ማውረድ',
        'ደረጃ አሰጣጥ እና እውነተኛ አስተያየቶች',
        'የብዙ ቋንቋ ድጋፍ (እንግሊዝኛ፣ አማርኛ፣ ኦሮምኛ)'
      ],
      homeownerChecklist: [
        'በቀበሌ እና በክፍለ ከተማ የቅርብ ባለሙያዎችን መፈለግ',
        'በብሔራዊ ፋይዳ የተረጋገጡ የባለሙያ መገለጫዎች',
        'እውነተኛ የደንበኞች ደረጃ እና አስተያየቶች',
        'በመተግበሪያው ውስጥ የቀጥታ የመልእክት ልውውጥ',
        'ሕጋዊ ዲጂታል የሥራ ውል ማዘጋጀት',
        'አስተማማኝ የቻፓ ክፍያ ሥርዓት',
        'የሥራውን ሂደት ደረጃ በደረጃ መከታተል',
        'የአለመግባባት ሪፖርትና የሽምግልና ሥርዓት'
      ],
      workerChecklist: [
        'ሙያዊ ዲጂታል መገለጫ እና የሥራ ፖርትፎሊዮ',
        'የብሔራዊ ፋይዳ መታወቂያ ማረጋገጫ ባጅ',
        'የሥራ ጥያቄዎችን መቀበልና ማስተዳደር',
        'ሕጋዊ ዲጂታል ውሎችን መፈረምና ማስተዳደር',
        'አስተማማኝ የክፍያ ታሪክ መዝገብ',
        'ለባለሙያዎች የተዘጋጀ የሙያ ማኅበረሰብ',
        'የሁለትዮሽ ዝና እና ተአማኒነት ግንባታ',
        'በተረጋገጡ አስተያየቶች የሙያ እድገትን ማሳደግ'
      ],
      getStarted: 'ይጀምሩ',
      findWorkerBtn: 'ባለሙያ ይፈልጉ',
      joinProBtn: 'እንደ ባለሙያ ይቀላቀሉ',
      forHomeownersHeading: 'ለቤት ባለቤቶች',
      hireWithConfidence: 'በሙሉ እምነት ይቀጥሩ።',
      forWorkersHeading: 'ለባለሙያዎች',
      buildReputation: 'የሙያ ዝናዎን ይገንቡ።',
      proSpeakerLabel: 'ድሬ ባለሙያ · ኤሌክትሪክ (ቀዚራ)',
      homeownerSpeakerLabel: 'የቤት ባለቤት · የተረጋገጠ',
      proCard: {
        name: 'ሳሙኤል ተ.',
        trade: 'ኤሌክትሪሻን · ቀዚራ',
        badge: 'በፋይዳ የተረጋገጠ',
        faydaBadge: '✓ ፋይዳ',
        signedPill: 'በሁለቱም ወገኖች የተፈረመ ዲጂታል ውል',
        jobsCount: '42 ሥራዎች',
        ratingValue: '4.9 ★',
        jobsDoneLabel: 'የተጠናቀቁ',
        ratingLabel: 'ደረጃ',
        responseLabel: 'ምላሽ',
        responseValue: '< 1 ሰዓት',
        faydaVerifiedTitle: 'በፋይዳ የተረጋገጠ',
        faydaVerifiedSubtitle: 'ማንነት በብሔራዊ ዲጂታል መታወቂያ የተረጋገጠ'
      },
      forEveryone: 'ለሁሉም ክፍት',
      twoSides: 'አንድ መድረክ። ሁለት ተጠቃሚዎች።'
    },
    reviews: {
      tag: 'የደንበኞች አስተያየት',
      quote: '“ድሬስኪል የተገነባው የቤት ባለቤቶችን እና ሠራተኞችን ካልተረጋገጠ አሠራር ነፃ በማውጣት ጥራት ባለው ሙያ ላይ እንዲያተኩሩ ለማስቻል ነው።”',
      subquote: 'ከቀዚራ፣ ሳቢያን እና ደቻቱ ደንበኞች የተሰጡ እውነተኛ አስተያየቶች'
    },
    latestUpdates: {
      title: 'መደበኛ ያልሆኑ ሠራተኞችን መቅጠር የቀድሞው መንገድ ተሰብሯል',
      subtitle: 'ድሬስኪል ከመምጣቱ በፊት እያንዳንዱ ቅጥር አደጋ ነበረው — መታወቂያ የለም፣ ደረሰኝ የለም፣ ተጠያቂነት የለም።',
      findSolution: 'መፍትሔ ያግኙ',
      verifiedBadge: 'በድሬስኪል የተረጋገጠ',
      problemLabel: 'ችግሩ',
      solutionLabel: 'መፍትሔው',
      benefitLabel: 'ጥቅሙ',
      cards: [
        {
          num: '01',
          badge: 'ማግኛ · 100% የተረጋገጠ',
          problem: 'ባለሙያዎች በግድግዳ ላይ በተለጠፈ ወረቀት ይፈልጉ ነበር።',
          solution: 'የተረጋገጡ ባለሙያዎችን በሙያ እና በክፍለ ከተማ በቀላሉ ይፈልጉ።',
          benefit: 'በፍጥነት እና በእርግጠኝነት ይቀጥሩ።'
        },
        {
          num: '02',
          badge: 'ብሔራዊ ፋይዳ · ማንነት ማረጋገጫ',
          problem: 'የባለሙያውን እውነተኛ ማንነት ለማወቅ ምንም መንገድ አልነበረም።',
          solution: 'እያንዳንዱ ባለሙያ በኢትዮጵያ የፋይዳ ዲጂታል መታወቂያ የተረጋገጠ ነው።',
          benefit: 'ወደ ቤትዎ ማን እየገባ እንደሆነ በትክክል ያውቃሉ።'
        },
        {
          num: '03',
          badge: 'ሕጋዊ ውል · አዋጅ ቁጥር 1156',
          problem: 'የቃል ስምምነቶች ማስረጃ ወደሌለው አለመግባባት ያመራሉ።',
          solution: 'በአንድ ጠቅታ ሕጋዊ ዲጂታል ውል ያዘጋጁ።',
          benefit: 'ሁለቱም ወገኖች ሁልጊዜ የተጠበቁ ናቸው።'
        },
        {
          num: '04',
          badge: 'የቻፓ መድረክ · የዲጂታል ታሪክ',
          problem: 'የጥሬ ገንዘብ ክፍያ ለሁለቱም ወገን ምንም ማስረጃ አይተውም።',
          solution: 'በኢትዮጵያ አስተማማኝ የክፍያ መድረክ በቻፓ በኩል ይክፈሉ።',
          benefit: 'ሙሉ የክፍያ ታሪክ በእጅዎ ላይ ይገኛል።'
        }
      ]
    },
    cta: {
      title: 'አስተማማኝ የሙያ አገልግሎት ለማግኘት ዝግጁ ነዎት?',
      subtitle: 'በድሬዳዋ በመቶዎች ከሚቆጠሩ ደንበኞች እና ከተረጋገጡ ባለሙያዎች ጋር ዛሬውኑ ይቀላቀሉ። በፋይዳ መታወቂያ እና በቻፓ ክፍያ የተጠበቀ።',
      findWorker: 'የተረጋገጡ ባለሙያዎችን ያግኙ',
      joinPro: 'እንደ ባለሙያ ይመዝገቡ',
      verifiedNote: 'በኢትዮጵያ የሥራ አዋጅ ቁጥር 1156/2011 የተጠበቀ · ከድሬዳዋ ንግድ ቢሮ ጋር የተጣጣመ'
    },
    footer: {
      tagline: 'የድሬዳዋ የተረጋገጠ የሥራ መድረክ። የተካኑ ባለሙያዎችን ከቤት ባለቤቶች ጋር በብሔራዊ የፋይዳ ማረጋገጫ እና በቻፓ ክፍያ ያገናኛል።',
      rights: 'የድሬስኪል መድረክ። መብቱ በሕግ የተጠበቀ ነው። ድሬዳዋ፣ ኢትዮጵያ።',
      forClients: 'ለቤት ባለቤቶች',
      forArtisans: 'ለባለሙያዎች',
      support: 'እገዛ እና ቢሮ',
      findWorker: 'ባለሙያ ይፈልጉ',
      verifyId: 'የፋይዳ ማረጋገጫ ፍተሻ',
      registerTrade: 'ሙያዎን ይመዝግቡ',
      safetyGuarantees: 'ዋስትና እና አለመግባባት',
      disputeOffice: 'የሽምግልና ቢሮ',
      chapaStatus: 'የቻፓ ክፍያዎች ሁኔታ',
      kaziraHub: 'የቀዚራ ባለሙያዎች ማዕከል'
    }
  },

  ORO: {
    nav: {
      home: 'Mana',
      findWorkers: 'Ogeessota',
      howItWorks: 'Akkaataa Hojii',
      features: 'Amaloota',
      reviews: 'Yaada',
      faq: 'Gaaffiilee',
      login: 'Seeni',
      getStarted: 'Jalqabi'
    },
    hero: {
      title: "Ogeessota Ogummaa Mirkanaa'an Dirre Dhawaatti Argadhaa",
      subtitle: "Ogeessota waraqaa eenyummaa Faayidaatiin mirkanaa'an, waliigaltee dijitaalaafi qulqullina dhugaa qaban.",
      searchPlaceholder: 'Tajaajila akkamii barbaaddu? (Fkn Elektiriikii, Ujummoo...)',
      searchButton: 'Barbaadi',
      popularLabel: 'Ogummaawwan Jaallatamo:',
      exploreStudio: 'Ogeessota Hunda Ilaalaa',
      hireDirectly: "Akka Ogeessaatti Galmaa'aa",
      stat1Label: "Ogeessota Mirkanaa'an",
      stat1Val: '180+',
      stat2Label: 'Eenyummaa Faayidaa',
      stat2Val: '100%',
      stat3Label: 'Madaallii Maamilaa',
      stat3Val: '4.9★',
      trades: {
        electrician: 'Elektiriikii',
        plumber: 'Ujummoo Bishaanii',
        painter: 'Halluu',
        carpenter: 'Hoji Harka (Anxaxii)',
        finishing: 'Qulqullina Manaa'
      }
    },
    trustStrip: {
      fayda: "100% EENYUMMAA FAAYIDAATIIN MIRKANAA'E",
      chapa: 'KAFALTII CHAPA AMANAMAA',
      contract: 'WALIIGALTEE DIJITAALAA (LABSII 1156)',
      reviews: 'YAADA QULQULLUU QOFA',
      districts: 'QAZIRAA · SAABIYAAN · DACHATUU',
      tagline: 'WALTIIJII OGEESSOTA DIRRE DHAWAA'
    },
    trustCollage: {
      tag: "Amanamtummaa Mirkanaa'e",
      title: 'Kumaatamaan Kanneen DireSkill Amananiif',
      exploreNow: 'Amma Ilaalaa',
      cards: {
        fayda: {
          title: "Faayidaan Mirkanaa'e",
          desc: "Ogeessi kamiyyuu eenyummaan isaa waraqaa Faayidaa biyyaalessaatiin qulqullaa'ee galmaa'a.",
          badge: "Dirre Dhawaatti Mirkanaa'e"
        },
        chapa: {
          title: 'Kafaltii Chapa Amanamaa',
          desc: 'Kafaltiin hundi karaa tajaajila kaffaltii amansiisaa Chapaatiin qulqullinaan raawwatama.',
          badge: 'Kafaltii Kallattii'
        },
        contracts: {
          title: 'Waliigaltee Dijitaalaa',
          desc: 'Hojiin hundi waliigaltee seera qabeessa ta\'een deggerama, qaamolee lamaanuu eega.',
          badge: 'Labsii 1156/2011'
        },
        reviews: {
          title: "Yaada Mirkanaa'e",
          desc: 'Maamiltoota hojii xumuraniifi kafalan qofatu yaada kennuu danda\'a.',
          badge: '★ 4.9 Madaallii Gaarii'
        },
        location: {
          title: "Barbaacha Naannootti Hundaa'e",
          desc: 'Ogeessota ganda keessanitti argaman daftanii argadhaa, yeroofi baasii qusadhaa.',
          badge: 'Qaziraa · Saabiyaan · Dachatuu'
        }
      }
    },
    manifesto: {
      tag: 'MANIFEESTOO',
      title: 'Ogummaan Kabaja Malata. Maamilli Wabii Malata.',
      p1: "DireSkill dhugaa tokko irratti hundaa'e: Dirre Dhawaatti hojiin ogummaa galmee qofa miti — kabaja, eegumsa seeraafi itti-gaafatamummaa barbaada.",
      p2: 'Eenyummaa Faayidaa, waliigaltee dijitaalaafi kafaltii Chapa walitti qindeessuun, ogummaa gara diinagdee ammayyaafi amansiisaatti ol guddisna.',
      pill1: 'Faayidaa Biyyaalessaa',
      pill2: 'Waliigaltee Dijitaalaa',
      pill3: 'Kafaltii Battalaa Chapa'
    },
    howItWorks: {
      tag: 'AKKAATAA HOJII',
      title: 'DireSkill Akkamitti Hojjeta',
      subtitle: "Adeemsa qulqulluu fi ifa ta'e. Ogeessota mirkanaa'an waliin walqunnamaa, waliigaltee qopheessaa, karaa Chapaatiin kaffalaa.",
      stepPrefix: 'Sadarkaa',
      steps: {
        step1: {
          tag: 'Jalqaba',
          title: "Ogeessa Mirkanaa'aa Barbaadaa",
          desc: 'Ogeessota Qaziraa, Saabiyaanii fi Dachatutti argaman filadhaa. Faayidaa fi yaada maamiltootaatiin calalaa.',
          action: 'Ogeessa Barbaadi'
        },
        step2: {
          tag: 'Itti Aanu',
          title: 'Waliigaltee fi Gatii Murteessaa',
          desc: "Bal'ina hojiifi gatii irratti walii galaa. Hojiin jalqabamuu dura waliigalteen dijitaalaa qophaa'a.",
          action: 'Fakkeenya Waliigaltee'
        },
        step3: {
          tag: 'Itti Aanu',
          title: 'Hojiin Iddootti Xumurama',
          desc: 'Ogeessi iddoo keessan dhufee qulqullinaan hojjeta. Isinis hojicha ilaaltanii mirkaneessitu.',
          action: 'Qulqullina Mirkaneessaa'
        },
        step4: {
          tag: 'Xumura · Raawwate',
          title: 'Kallattiin Chapaan Kaffalaa',
          desc: 'Karaa Telebirr, CBE Birr, Baankii Hawaas ykn kaardiin sirna Chapaatiin kaffaltii amansiisaa raawwadhaa.',
          action: 'Kafaltii Raawwadhu'
        }
      }
    },
    faq: {
      tag: 'GARGAARSA & QAJEELLAMA',
      title: 'Gaaffiilee Yeroo Baay\'ee Gaafataman',
      subtitle: 'Waa\'ee mirkaneessa Faayidaa, waliigaltee dijitaalaafi kaffaltii Chapa Dirre Dhawaa ilaalchisee hunda beekaa.',
      topicLabel: 'Mata Duree',
      takeawayLabel: 'Qabxii Ijoo',
      items: [
        {
          id: 'faq-1',
          num: '1',
          topic: 'Eenyummaa Faayidaa Mirkaneessuu',
          question: 'Eenyummaa Faayidaa mirkaneessuun akkamitti hojjeta?',
          answer: 'Ogeeyyiin yeroo galmaa\'an waraqaa Faayidaa biyyaalessaa ni ol fe\'u. Gareen keenya ragaa dhiyaate of eeggannoon ilaalee mirkaneessa. Erga mirkanaa\'ee booda beekisni mirkanaa\'uu proofaayilii isaanii irratti mul\'ata.',
          takeaway: 'Mirkaneessi hoogganootaa ogeeyyii amanamoo qofti akka hojjetan taasisa.',
          badge: 'Faayidaan Mirkanaa\'e · 100%'
        },
        {
          id: 'faq-2',
          num: '2',
          topic: 'Waliigaltee Dijitaalaa',
          question: 'Waliigalteen dijitaalaa akkamitti qophaa\'a?',
          answer: 'Yeroo maamilli affeerraa hojii ergu, DireSkill ofumaan waliigaltee tajaajila dijitaalaa odeeffannoo hojichaa irraa qopheessa. Hojiin osoo hin jalqabamin dura qaamoleen lamaanuu dubbisanii mallatteessu.',
          takeaway: 'Waliigalteen kun wal-dhabdee afaanii hambisuun eegumsa seeraa guutuu kenna.',
          badge: 'Waliigaltee Dijitaalaa · Labsii 1156'
        },
        {
          id: 'faq-3',
          num: '3',
          topic: 'Kafaltii Chapa',
          question: 'Kafaltiin Chapa akkamitti raawwatama?',
          answer: 'Hojiin erga xumuramee booda maamilli gatii walii galame karaa kaffaltii amansiisaa Chapaatiin kaffala. Galmeen kaffaltichaa lamaaniifuu ragaa ta\'ee waliigalticha waliin qabama.',
          takeaway: 'Telebirr, CBE Birr, Baankii Awash ykn kaardiidhaan kaffaltii battalaa.',
          badge: 'Tajaajila Chapa · Kafaltii Battalaa'
        },
        {
          id: 'faq-4',
          num: '4',
          topic: 'Gatii fi Marii',
          question: 'Ogeeyyiin gatii irratti mari\'achuu danda\'uu?',
          answer: 'Eeyyee. Ergaa keessaatiin (in-app message) affeerraan rasmii qophaa\'uu dura gatii irratti mari\'achuun ni danda\'ama. Erga walii galamee booda waliigalteen gatii sanaan qophaa\'a.',
          takeaway: 'Mariin ifa ta\'e waliigaltee dura taasifamu hubannoo waloof gumaacha.',
          badge: 'Walii Galtee Waloof · Gatii Haqaa'
        },
        {
          id: 'faq-5',
          num: '5',
          topic: 'Furmaata Wal-dhabdee',
          question: 'Yoo wal-dhabdeen uumame maaltu ta\'a?',
          answer: 'Maamillis ta\'ee ogeessi fuula waliigaltee irraa komii isaanii dhiyeessuu danda\'u. Gareen keenya ragaalee dhiyaataniifi qabiyyee waliigaltee ilaalee sa\'aatii 48 keessatti murtoo dhumaa kenna.',
          takeaway: 'Waliigaltee galmaa\'eefi ragaa suuraatiin murtoon araaraa sa\'aatii 48 keessatti kennama.',
          badge: 'Furmaata Sa\'aatii 48'
        },
        {
          id: 'faq-6',
          num: '6',
          topic: 'Madaallii fi Qulqullina',
          question: 'Ogeeyyiin maqaa gaarii akkamitti ijaaru?',
          answer: 'Hojii kaffalamee xumurame hunda irratti maamilli madaalliifi yaada kennuu danda\'a. Ogeessi yeroo keessatti madaallii ol aanaa argachuun barbaacha irratti dursa argata.',
          takeaway: 'Maamiltoota hojii xumuran qofatu madaallii kennuu danda\'a.',
          badge: 'Madaallii Mirkanaa\'e'
        }
      ]
    },
    categories: {
      tag: 'OGUMMAAWWAN ILAALAA',
      title: 'Gosoota Ogummaa',
      subtitle: 'Gosoonni ofumaan jijjiiramu, yookaan ogeessota Dirre Dhawaa mirkanaa\'an ilaaluuf kanneen gadii tuqaa.',
      prosCount: 'Ogeessota',
      verifiedBadge: '✓ Mirkanaa\'e',
      hireNow: 'Amma Hiri',
      list: [
        {
          id: 'cat-electrician',
          num: '1',
          name: 'Elektiriikii',
          fullName: 'Elektiriikiifi Humna Ibsaa',
          description: 'Ogeessota qorannoo sarara ibsaa mana keessaa, soolaarii, sarara haaraa fi sirreessa hatattamaa.',
          rate: 'ETB 4,500 irraa',
          workersCount: 34,
          districts: 'Qaziraa · Saabiyaan · Dachatuu'
        },
        {
          id: 'cat-plumbers',
          num: '2',
          name: 'Ujummoo Bishaanii',
          fullName: 'Ujummoofi Paayipii Bishaanii',
          description: 'Taanikii bishaanii baaxii irraa, paayipii PVC dhiibbaa qabu, paampii bishaaniifi dhangala\'aa sirreessuu.',
          rate: 'ETB 3,500 irraa',
          workersCount: 28,
          districts: 'Saabiyaan · Qaziraa · Gande Kooree'
        },
        {
          id: 'cat-finishing',
          num: '3',
          name: 'Qulqullina Manaa',
          fullName: 'Ceelinii Giipsamiifi Seeraamiksii',
          description: 'Baaxii giipsamii ammayyaa, seeraamiksii lafaa fi pilastara keessaa qulqullinaan hojjechuu.',
          rate: 'ETB 5,000 irraa',
          workersCount: 22,
          districts: 'Dachatuu · Qaziraa · Melkaa Jebduu'
        },
        {
          id: 'cat-painter',
          num: '4',
          name: 'Halluu',
          fullName: 'Dibatamaa fi Halluu Manaa',
          description: 'Halluu keessaa lallaafaa, qilleensa damdamatu kan alaa fi hojii faaya babbareedaa.',
          rate: 'ETB 4,000 irraa',
          workersCount: 26,
          districts: 'Qaziraa · Saabiyaan · Dachatuu'
        },
        {
          id: 'cat-satellite',
          num: '5',
          name: 'Saatiilaytii (Dish)',
          fullName: 'Diishii Saatiilaytiifi Risiivarii',
          description: 'Qajeelcha diishii Naayilsaatiifi Yaahsaat, qindaa\'ina LNB fi kutaalee adda addaatti sarara geessuu.',
          rate: 'ETB 1,800 irraa',
          workersCount: 19,
          districts: 'Qaziraa · Saabiyaan · Addis Katamaa'
        },
        {
          id: 'cat-others',
          num: '6',
          name: 'Ogummaawwan Biroo',
          fullName: 'Anxaxii, Jaaramaafi Sibila',
          description: 'Meeshaalee manaa mukaa, balbala eegumsaa, walitti hidhuu sibilaafi suphaa waliigalaa.',
          rate: 'ETB 3,000 irraa',
          workersCount: 41,
          districts: 'Wandoolee Dirre Dhawaa Hunda'
        }
      ]
    },
    features: {
      tag: 'AMALOOTA',
      title: 'Wanta isin barbaachisu hunda. Kan hin barbaachisne tokkollee.',
      subtitle: 'Abbootii manaa Dirre Dhawaa wabii barbaadaniifi ogeeyyii kabaja barbaadaniif qophaa\'e.',
      tabs: {
        homeowners: 'ABBOOTII MANAAF',
        workers: 'OGEESSOTAAF',
        shared: 'WALIIN'
      },
      dialogue: {
        msg1: 'Hojii wayaraa bor ganama jalqabuu nan danda\'a.',
        msg2: 'Naaf ta\'a. Waliigaltee amma siif erga.',
        msg3: 'Waliigalteen mallattaa\'e — hojiin eegalameera'
      },
      checklist: [
        'Ergaa kallattii mukuu malee',
        'Beeksisa battalaa',
        'Gabaasa wal-dhabdeefi furmaata',
        'Seenaa waliigaltee fi PDF buusuu',
        'Sirna madaallii fi yaada dhugaa',
        'Deeggarsa afaan hedduu (EN, AM, ORO)'
      ],
      homeownerChecklist: [
        'Ogeessota dhihoo gandaafi kutaa magaalaan barbaaduu',
        'Piroofayilii ogeessotaa Faayidaan mirkanaa\'e',
        'Yaadaafi sadarkaa maamiltootaa dhugaa',
        'Ergaa kallattii appilikeeshinii keessaan',
        'Waliigaltee hojii dijitaalaa qopheessuu',
        'Kaffaltii amansiisaa Chapaatiin raawwachuu',
        'Adeemsa hojii hordofuu',
        'Sirna komii dhiyeessuufi araaraa'
      ],
      workerChecklist: [
        'Piroofaayilii ogummaa fi poortifooliyoo dijitaalaa',
        'Baajii mirkanaa\'ina eenyummaa Faayidaa',
        'Gaaffiiwwan hojii fudhachuufi bulchuu',
        'Waliigaltee dijitaalaa mallatteessuufi to\'achuu',
        'Galmee seenaa kaffaltii amansiisaa',
        'Hawaasa ogummaa ogeeyyii',
        'Ijaarsa maqaa gaarii qaama lamaanii',
        'Guddina ogummaa yaada maamilaan mirkanaa\'een'
      ],
      getStarted: 'JALQABAA',
      findWorkerBtn: 'OGEESSA BARBAADAA',
      joinProBtn: 'AKKA OGEESSAATTI MAKAMA',
      forHomeownersHeading: 'ABBOOTII MANAAF',
      hireWithConfidence: 'AMANTUMMAA GUUTUUN QACARAA.',
      forWorkersHeading: 'OGEESSOTAAF',
      buildReputation: 'MAQAA OGUMMAA KEESSAN IJARAADHA.',
      proSpeakerLabel: 'OGEESSA DIRE · ELEKTIRIIKII (QAZIRAA)',
      homeownerSpeakerLabel: 'ABBAA MANAA · MIRKANAA\'E',
      proCard: {
        name: 'Saamu\'eel T.',
        trade: 'ELEKTIRIIKII · QAZIRAA',
        badge: 'Faayidaan Mirkanaa\'e',
        faydaBadge: '✓ FAAYIDAA',
        signedPill: 'Waliigalteen dijitaalaa qaama lamaaniin mallatteeffame',
        jobsCount: 'Hojii 42',
        ratingValue: '4.9 ★',
        jobsDoneLabel: 'HOJII XUMURAME',
        ratingLabel: 'SADARKAA',
        responseLabel: 'DEEBII',
        responseValue: '< 1h',
        faydaVerifiedTitle: 'FAAYIDAAN MIRKANAA\'E',
        faydaVerifiedSubtitle: 'Eenyummaan waraqaa biyyaalessaatiin mirkanaa\'e'
      },
      forEveryone: 'HUNDAAF',
      twoSides: 'WALTIIJII TOKKO. QAAMA LAMA.'
    },
    reviews: {
      tag: 'YAADA MAAMILTOOTAA',
      quote: '“DireSkill kan ijaarame abbootii manaa fi ogeeyyii sodaa fi ragaa dhabuu jalaa baasee ogummaa qulqullina qabu irratti akka xiyyeeffatan gochuufi.”',
      subquote: 'Yaada Qaziraa, Saabiyaan fi Dachatuu irraa walitti qabame'
    },
    latestUpdates: {
      title: 'Ogeeyyii kanaan dura qacaruun rakkoo qaba ture',
      subtitle: 'DireSkill dura qacaruun hundi tasa ture — ragaan hin jiru, nagaan hin jiru, itti-gaafatamummaan hin jiru.',
      findSolution: 'Furmaata Argadhaa',
      verifiedBadge: "DireSkill'n Mirkanaa'e",
      problemLabel: 'Rakkoo',
      solutionLabel: 'Furmaata',
      benefitLabel: 'Bu\'aa',
      cards: [
        {
          num: '01',
          badge: "Argachuu · 100% Mirkanaa'e",
          problem: 'Ogeeyyiin waraqaa caccabaa bobaasanii beeksisu turan.',
          solution: 'Ogeessota mirkanaa\'an ogummaafi gandaan dafaa argadhaa.',
          benefit: 'Saffisaafi amantummaan qacaraa.'
        },
        {
          num: '02',
          badge: "Faayidaa Biyyaalessaa · Eenyummaa",
          problem: 'Eenyummaa dhugaa ogeessaa beekuun hin danda\'amu ture.',
          solution: 'Ogeessi kamiyyuu waraqaa Faayidaatiin qulqullaa\'a.',
          benefit: 'Eenyu mana keessan akka seenu sirriitti beektu.'
        },
        {
          num: '03',
          badge: 'Waliigaltee Seeraa · Labsii 1156',
          problem: 'Waliigalteen afaanii wal-dhabdeetti geessa ture.',
          solution: 'Tuqaa tokkoon waliigaltee seera qabeessa uumaa.',
          benefit: 'Qaamoleen lamaanuu yeroo hunda eegumsa qabu.'
        },
        {
          num: '04',
          badge: 'Chapa · Seenaa Dijitaalaa',
          problem: 'Kafaltiin qarshii harka ragaa tokkollee hin hambisu.',
          solution: 'Tajaajila amansiisaa Chapaatiin kaffaltii raawwadhaa.',
          benefit: 'Seenaan kaffaltii guutuun harka keessan jira.'
        }
      ]
    },
    cta: {
      title: 'Tajaajila Ogummaa Amanamaa Argachuuf Qophiidhaa?',
      subtitle: 'Abbootii manaa fi ogeeyyii dhibbaan lakkaa\'aman Dirre Dhawaa keessaa waliin har\'uma makamaa. Faayidaa fi Chapaan kan eegame.',
      findWorker: "Ogeessota Mirkanaa'an Barbaadaa",
      joinPro: "Akka Ogeessaatti Galmaa'aa",
      verifiedNote: 'Labsii Hojjettoota Itoophiyaa 1156/2011 jalatti kan eegame · Biiroo Daldalaa Dirre Dhawaa waliin kan walsime'
    },
    footer: {
      tagline: 'Waltijii ogeeyyii Dirre Dhawaa. Ogeeyyii abbootii manaa waliin karaa waraqaa Faayidaa fi kaffaltii Chapa walitti qabsiisa.',
      rights: 'Pilaatfoormii DireSkill. Mirgi hundi seeraan eegamaadha. Dirre Dhawaa, Itoophiyaa.',
      forClients: 'Abbootii Manaaf',
      forArtisans: 'Ogeessotaaf',
      support: 'Deeggarsa & Biiroo',
      findWorker: 'Ogeessa Barbaadaa',
      verifyId: 'Qorannoo Faayidaa',
      registerTrade: 'Ogummaa Galmeessaa',
      safetyGuarantees: 'Wabii & Wal-dhabdee',
      disputeOffice: 'Biiroo Araaraa',
      chapaStatus: 'Haala Kaffaltii Chapa',
      kaziraHub: 'Wiirtuu Ogeeyyii Qaziraa'
    }
  }
};
