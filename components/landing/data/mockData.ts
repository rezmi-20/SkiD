import { SkilledFile, TradeCard, SkillArticle, StudioWorkerMatch, SkilledWorker } from '../types';

export const MASTER_WORKER: SkilledWorker = {
  id: 'ahmed-kedir',
  name: 'Ahmed Kedir',
  trade: 'Electrician',
  category: 'electrician',
  location: 'Kazira, Dire Dawa',
  kebele: 'Kebele 02',
  rating: 4.9,
  completedJobs: 20,
  faydaVerified: true,
  faydaIdNumber: 'ET-FAYDA-9482-6102',
  proStatus: true,
  skills: ['Circuit Diagnostics', 'Breaker Panels', 'Solar Inverter'],
  startingRate: 4500,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  phone: '+251 91 578 4421'
};

export const SKILLED_WORKERS: SkilledWorker[] = [
  MASTER_WORKER,
  {
    id: 'samuel-t',
    name: 'Samuel T.',
    trade: 'Electrician',
    category: 'electrician',
    location: 'Kezira, Dire Dawa',
    kebele: 'Kebele 01',
    rating: 4.9,
    completedJobs: 42,
    faydaVerified: true,
    faydaIdNumber: 'ET-FAYDA-3104-8821',
    proStatus: true,
    skills: ['Three-Phase Power', 'Emergency Repair', 'Generator Coupling'],
    startingRate: 3800,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    phone: '+251 91 512 9033'
  },
  {
    id: 'bereket-alemayehu',
    name: 'Bereket Alemayehu',
    trade: 'Plumber',
    category: 'plumber',
    location: 'Sabian, Dire Dawa',
    kebele: 'Kebele 04',
    rating: 4.8,
    completedJobs: 34,
    faydaVerified: true,
    faydaIdNumber: 'ET-FAYDA-7719-2041',
    proStatus: true,
    skills: ['Overhead Tank', 'High-Pressure PVC', 'Drain Clearing'],
    startingRate: 3500,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
    phone: '+251 92 144 8709'
  },
  {
    id: 'fatuma-yusuf',
    name: 'Fatuma Yusuf & Crew',
    trade: 'Painter & Finisher',
    category: 'painter',
    location: 'Dechatu, Dire Dawa',
    kebele: 'Kebele 03',
    rating: 5.0,
    completedJobs: 28,
    faydaVerified: true,
    faydaIdNumber: 'ET-FAYDA-6192-3301',
    proStatus: true,
    skills: ['Weather Shield', 'Interior Silk', 'Stucco Texture'],
    startingRate: 5000,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    phone: '+251 94 321 0087'
  }
];

export const MARQUEE_ITEMS = [
  'Kezira District',
  'Sabian',
  'National Fayda ID',
  'Chapa Payments',
  'Dechatu',
  'Taiwan Market',
  'Kebele 02',
  'Megala',
  'Gende Kore'
];

export const SKILL_FILES: SkilledFile[] = [
  {
    id: 'f-1',
    name: 'Fayda_Registry_DireDawa',
    type: 'folder',
    color: '#FF4B2B',
    size: '14.2 MB',
    lastUpdated: 'Today at 3:15 PM',
    author: 'Dire Dawa ICT Lab Verification Team',
    description: 'National Fayda Digital ID verification records for all registered informal tradespersons in Kezira, Sabian, and Dechatu.',
    tags: ['Fayda ID', 'Verified Identity', 'Proclamation 1156/2019'],
    content: {
      summary: 'Centralized registry linking biometric national Fayda identification numbers with skilled trade competencies in Dire Dawa.',
      sections: [
        {
          title: '01. Biometric Identification Audit',
          content: 'Every worker undergoes a 100% ID match check against Ethiopia’s national digital ID database before receiving customer work requests.'
        },
        {
          title: '02. Kebele Jurisdictions',
          content: 'Active coverage spanning Kebele 01 through Kebele 09, ensuring proximity-based worker dispatch with zero travel delays.'
        }
      ]
    }
  },
  {
    id: 'f-2',
    name: 'Digital_Contract_v2',
    type: 'document',
    color: '#8A2387',
    size: '4.8 MB',
    lastUpdated: 'Yesterday at 5:40 PM',
    author: 'Legal Affairs, Dire Dawa Region',
    description: 'Legally documented agreement format detailing job deliverables, materials, warranty, and agreed Ethiopian Birr (ETB) compensation.',
    tags: ['Digital Contract', 'Legal Protection', 'Terms Locked'],
    content: {
      summary: 'Standardized digital contract protecting both homeowners and workers from verbal misunderstandings and arbitrary payment refusals.',
      sections: [
        {
          title: 'Commercial Law Adherence',
          content: 'Fully compliant with Ethiopian Labour Proclamation 1156/2019. Terms and scope are locked before tools are picked up.'
        },
        {
          title: 'Direct Chapa Payment',
          content: 'Payments are processed directly via Chapa using Telebirr, CBE Birr, Awash Bank, or debit cards with instant confirmation once the client inspects completed work.'
        }
      ]
    }
  },
  {
    id: 'f-3',
    name: 'Work_Portfolio_Kezira',
    type: 'image',
    color: '#E94057',
    size: '86.4 MB',
    lastUpdated: '2 days ago',
    author: 'Verified Master Electricians',
    description: 'High-resolution before-and-after photographic documentation of residential breaker panels and solar inverter installations in Kezira.',
    tags: ['Portfolio', 'Electrician', 'Solar'],
    content: {
      summary: 'Curated field photography of completed electrical and panel installations verified by DireSkill inspection units.',
      sections: [
        {
          title: 'Safety Standards Verified',
          content: 'Insulated conduits, three-phase earthing, and industrial circuit breakers installed to Ethiopian standard specifications.'
        }
      ]
    }
  },
  {
    id: 'f-4',
    name: 'Chapa_Payment_Ledger',
    type: 'analytics',
    color: '#F27121',
    size: '2.9 MB',
    lastUpdated: '1 hour ago',
    author: 'Fintech Operations & Chapa Gateway',
    description: 'Live transaction reconciliation ledger tracking instant Telebirr and CBE Birr settlements across all 6 skilled trade categories.',
    tags: ['Chapa', 'Payments', 'Telebirr', 'Payouts'],
    content: {
      summary: 'Real-time financial telemetry showing ETB 4.2M in cumulative payouts with a 99.9% on-time settlement rate.',
      sections: [
        {
          title: 'Payout Velocity',
          content: 'Average provider payout settlement time is under 12 seconds following 4-digit client PIN confirmation.'
        }
      ]
    }
  }
];

export const STUDIO_MATCHES: StudioWorkerMatch[] = [
  {
    id: 'm1',
    label: 'Electrician (Kazira)',
    prompt: 'Find a certified electrician in Kazira for circuit diagnostics, breaker panels, and solar inverter setup.',
    category: 'Electrician · Kazira',
    workerName: 'Ahmed Kedir',
    trade: 'Master Electrician',
    location: 'Kazira, Dire Dawa (Kebele 02)',
    rate: 4500,
    rating: 4.9,
    matchScore: 99,
    outputTitle: 'Recommended Match: Ahmed Kedir (100% Fayda Verified)',
    outputBody: `Certified electrical tradesman with 9+ years experience in Kazira. Specialized in heavy residential circuit panels, solar inverter coupling, and wiring.\n\n• Baseline Rate: ETB 4,500 (Payable via Chapa gateway)\n• Rating: 4.9 ★ across 20 completed jobs\n• Verified National Fayda ID: ET-FAYDA-9482-6102\n• Active Digital Contract: Ready for instant signing`,
    tags: ['Electrician', 'Circuit Diagnostics', 'Kazira', 'Solar']
  },
  {
    id: 'm2',
    label: 'Emergency Plumber (Sabian)',
    prompt: 'Need a trusted plumber in Sabian for overhead water tank installation and high-pressure PVC leaks.',
    category: 'Plumber · Sabian',
    workerName: 'Bereket Alemayehu',
    trade: 'Licensed Plumber',
    location: 'Sabian, Dire Dawa (Kebele 04)',
    rate: 3500,
    rating: 4.8,
    matchScore: 97,
    outputTitle: 'Recommended Match: Bereket Alemayehu (Fayda Verified)',
    outputBody: `Expert in domestic pipe fitting, hydraulic booster pumps, and roof tank plumbing. Response time within 25 minutes across Sabian.\n\n• Baseline Rate: ETB 3,500\n• Rating: 4.8 ★ across 34 completed jobs\n• Digital Contract: Includes 30-day leak-free guarantee`,
    tags: ['Plumber', 'Overhead Tank', 'Sabian', 'Hydraulics']
  },
  {
    id: 'm3',
    label: 'House Finishing (Dechatu)',
    prompt: 'Request villa interior painting, stucco texture, and ceramic floor finishing in Dechatu district.',
    category: 'Finishing & Painter · Dechatu',
    workerName: 'Fatuma Yusuf & Crew',
    trade: 'Finishing Specialist',
    location: 'Dechatu, Dire Dawa (Kebele 03)',
    rate: 5000,
    rating: 5.0,
    matchScore: 98,
    outputTitle: 'Recommended Match: Fatuma Yusuf & Crew',
    outputBody: `High-craft surface preparation, weather-shield exterior paint, and precision tile leveling. Known for clean, timely delivery.\n\n• Baseline Rate: ETB 5,000\n• Rating: 5.0 ★ across 28 completed jobs\n• Chapa Direct Payment: Fast payouts upon client inspection`,
    tags: ['House Finishing', 'Painter', 'Dechatu', 'Ceramic']
  }
];

export const TRADE_CARDS: TradeCard[] = [
  {
    id: 'tc-1',
    title: 'Campaign Briefs & Electrical',
    category: 'Electrician',
    description: 'Generate comprehensive job briefs aligned with safety standards and breaker panels.',
    image: 'https://images.unsplash.com/photo-1614852207233-e8d771f8e9fc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    deliverables: ['Circuit Diagnostics', 'Breaker Panels', 'Solar Inverter Coupling'],
    impactMetric: '100% Fayda Verified',
    details: 'Certified electricians in Kazira and Sabian. Every job is bound by a digital contract with commercial law protections.'
  },
  {
    id: 'tc-2',
    title: 'Hydraulic & Plumbing Works',
    category: 'Plumber',
    description: 'Ensure water safety and pressure consistency across all residential and commercial pipes.',
    image: 'https://images.unsplash.com/photo-1645811791249-93a1e10d0169?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    deliverables: ['Overhead Water Tanks', 'High-Pressure PVC Fitting', 'Drainage Maintenance'],
    impactMetric: '4.8 ★ Average Rating',
    details: 'Quick response plumbers across Sabian and Kebele 02. Secure Chapa gateway payouts processed instantly upon job completion.'
  },
  {
    id: 'tc-3',
    title: 'House Finishing & Gypsum',
    category: 'House Finishing',
    description: 'Empower homeowners with clean, verified craftsmen for tiling and gypsum ceilings.',
    image: 'https://images.unsplash.com/photo-1774420073915-96cc5e3abdb7?q=80&w=2021&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    deliverables: ['Ceramic Tile Levelling', 'Gypsum False Ceilings', 'Epoxy Flooring'],
    impactMetric: 'Zero Verbal Disputes',
    details: 'Pre-negotiated ETB rates locked in digital contracts. Eliminates unexpected price hikes and project delays.'
  },
  {
    id: 'tc-4',
    title: 'Surface Coatings & Voice',
    category: 'Painter',
    description: 'Codify high-grade finishing with non-toxic weather-resistant exterior and interior paints.',
    image: 'https://images.unsplash.com/photo-1770791779732-7d1ef12524f2?q=80&w=2021&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    deliverables: ['Weather Shield Exterior', 'Interior Silk Emulsion', 'Stucco Texture'],
    impactMetric: '99.9% Proven Track Record',
    details: 'Expert painters in Dechatu and Taiwan Market backed by real customer reviews from completed jobs.'
  }
];

export const SKILL_ARTICLES: SkillArticle[] = [
  {
    id: 'art-1',
    title: 'Dire Dawa University ICT Lab launches Fayda integration',
    category: 'Product Update',
    date: 'Oct 12, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1615714259003-5db15f3cf5f5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    excerpt: 'How Dire Dawa University ICT Department is pioneering national digital ID verification to formalize the city’s informal trade workforce.',
    author: {
      name: 'Dr. Yonas Mulugeta',
      role: 'Head of ICT Innovation Lab, Dire Dawa University',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxUZpAK7kBAK1H5Anlz-i_nh19XyaGUt1hLDC6ZASnuBK2vRcwFDP46vx7HodMWCGvWJVA3aKLfp00pDRGNPsH0LVYvOGBSQ1KJIx2wTCxFcEJMNlnv9DHJKT0wyVelxRunXJN3d41Z2MPDK4poxQF_iybQaYL4ebVjC52RWnq9U6Y-VA7k5seZ7Z4c1n3nq7ply6CwSNm8-OH_B6wae1-h-Zmn2y3jh9urDyal2zhahuy408MHHCcPTmA9TNKUOA7WEsjuEy1iMvC'
    },
    content: [
      'In informal markets across Dire Dawa, homeowners have long had to rely on handwritten phone numbers tacked to lampposts. There was zero guarantee of identity, zero background verification, and zero legal recourse if work was abandoned.',
      'Through DireSkill, our ICT Innovation Lab has integrated Ethiopia’s National Fayda Digital ID system. Every tradesperson is verified against official national biometric records before receiving client invitations.',
      'This bridges the trust deficit, ensuring safe domestic repairs for homeowners while elevating skilled workers with verifiable digital credentials.'
    ]
  },
  {
    id: 'art-2',
    title: 'The Modern Brand Architecture & Digital Contracts',
    category: 'Insights',
    date: 'Oct 08, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1646388286080-62887d1b34ab?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    excerpt: 'Why verbal agreements are obsolete, and how legally documented contracts protect both homeowners and workers under Proclamation 1156/2019.',
    author: {
      name: 'Ahmed Tesfaye',
      role: 'Commercial Property Manager, Kezira',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_dQOYUXm-9ocUk-1cRA5ZyP6tu7OdWwNIU7SRhouWt3u89anzj3A5_pr7FGCCICOiz6a2FoSpC-bN53AYbiVQ-spgKPawBtGZtLq-9c6QyNclym7oEuOsCnQllJenEGuMkAeM3mwnTOLdgJakEE63ozCYcDA2l-C2EQnZiozAakUbDrwJG_jxTwrvV9I5p2oiVPXIDBv-rltdG9P0TX6X2OUHQcwckpskXXJEawplcI8ff_rzn1YnIDgrniF27Vjc0Lz4LKcazue9'
    },
    content: [
      'Disputes in domestic trade work typically occur for two reasons: vague verbal agreements on scope, and disputes over upfront deposits. Homeowners worry about poor craftsmanship, while workers worry about non-payment.',
      'DireSkill replaces verbal ambiguity with an automated, legally compliant service contract. Deliverables, warranty terms, and ETB compensation are locked in writing prior to commencing work.',
      'Having legal certainty creates mutual respect and empowers skilled professionals to build lasting businesses.'
    ]
  },
  {
    id: 'art-3',
    title: 'Chapa direct digital payments bring trust to informal trades',
    category: 'News',
    date: 'Sep 24, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1615714259121-c9870fd23fcd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    excerpt: 'How payment gateway integration through Chapa ensures transparent, direct settlements via Telebirr and CBE Birr.',
    author: {
      name: 'Selamawit G.',
      role: 'Fintech Specialist, Dire Dawa',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxUZpAK7kBAK1H5Anlz-i_nh19XyaGUt1hLDC6ZASnuBK2vRcwFDP46vx7HodMWCGvWJVA3aKLfp00pDRGNPsH0LVYvOGBSQ1KJIx2wTCxFcEJMNlnv9DHJKT0wyVelxRunXJN3d41Z2MPDK4poxQF_iybQaYL4ebVjC52RWnq9U6Y-VA7k5seZ7Z4c1n3nq7ply6CwSNm8-OH_B6wae1-h-Zmn2y3jh9urDyal2zhahuy408MHHCcPTmA9TNKUOA7WEsjuEy1iMvC'
    },
    content: [
      'Cash payments left zero receipt and zero security. Homeowners often handed over upfront cash with no verifiable documentation.',
      'With Chapa gateway integration, clients can pay digitally with complete transparency. The worker receives instant settlement straight to Telebirr, CBE Birr, or local bank accounts with official digital transaction records.',
      'This direct fintech architecture is modernizing domestic work in Dire Dawa.'
    ]
  }
];
