"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface ReviewCardItem {
  id: string;
  initial: string;
  name: string;
  role: string;
  trade: string;
  jobs: string;
  quote: string;
  avatarBg: string;
}

interface TestimonialProps {
  customTestimonials?: Array<{
    id: string;
    name: string;
    role: string;
    trade: string;
    jobs?: string;
    quote: string;
    language?: string;
    avatarBg?: string;
  }>;
}

export const Testimonial: React.FC<TestimonialProps> = ({ customTestimonials = [] }) => {
  const { t, language } = useLanguage();

  const langCustom = (customTestimonials || []).filter(
    ct => ct.language === language || (!ct.language && language === 'EN')
  ).map((ct, idx) => ({
    id: ct.id || `custom-rev-${idx}`,
    initial: (ct.name || "U").charAt(0).toUpperCase(),
    name: ct.name,
    role: ct.role,
    trade: ct.trade,
    jobs: ct.jobs || "Verified Job",
    quote: ct.quote.startsWith("“") ? ct.quote : `“${ct.quote}”`,
    avatarBg: ct.avatarBg || 'bg-gradient-to-tr from-emerald-600 via-teal-400 to-emerald-200 text-white'
  }));

  const reviews: ReviewCardItem[] = language === 'አማ' ? [
    {
      id: 'rev-1',
      initial: 'M',
      name: 'ሙና ኢብራሂም',
      role: 'የቤት ባለቤት',
      trade: 'ኤሌክትሪክ',
      jobs: '7 ሥራዎች',
      quote: '“ቀደም ሲል ሠራተኛ ወደ ቤት ሳስገባ ስለ ደህንነት እጨነቅ ነበር። አሁን ግን በዲጂታል ውልና በፋይዳ ማረጋገጫ ሙሉ በሙሉ እርግጠኛ ነኝ።”',
      avatarBg: 'bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white'
    },
    {
      id: 'rev-2',
      initial: 'D',
      name: 'ዳዊት ብርሃኑ',
      role: 'የንግድ ድርጅት ባለቤት',
      trade: 'ቀለም ቀቢ',
      jobs: '5 ሥራዎች',
      quote: '“በዚህ መድረክ ያሉ ባለሙያዎች ጥራት ተወዳዳሪ የለውም። ፈጣን፣ የተረጋገጡ እና ሁልጊዜም ሙያዊ ናቸው።”',
      avatarBg: 'bg-gradient-to-tr from-blue-600 via-indigo-400 to-sky-200 text-white'
    },
    {
      id: 'rev-3',
      initial: 'S',
      name: 'ሰላማዊት ገ.',
      role: 'የመደብር ኃላፊ',
      trade: 'ኤሌክትሪሻን',
      jobs: '3 ሥራዎች',
      quote: '“በቀዚራ ኤሌክትሪሻን ለማግኘት በጣም ፈጣኑ መንገድ። የደረጃ አሰጣጥ ሥርዓቱ ትክክለኛውን ሰው ለመምረጥ በጣም ረድቶኛል።”',
      avatarBg: 'bg-gradient-to-tr from-rose-600 via-rose-400 to-pink-200 text-white'
    },
    {
      id: 'rev-4',
      initial: 'Y',
      name: 'ዮናስ ባ.',
      role: 'የሬስቶራንት ባለቤት',
      trade: 'የቤት ማጠናቀቂያ',
      jobs: '4 ሥራዎች',
      quote: '“በድሬስኪል በኩል ያገኘሁት የቤት ማጠናቀቂያ ሥራ ድንቅ ነበር። ንፁህ፣ ሙያዊ እና በሰዓቱ የተጠናቀቀ።”',
      avatarBg: 'bg-gradient-to-tr from-emerald-600 via-teal-400 to-emerald-200 text-white'
    },
    {
      id: 'rev-5',
      initial: 'H',
      name: 'ሃና ተ.',
      role: 'የት/ቤት ዳይሬክተር',
      trade: 'ጠቅላላ ጥገና',
      jobs: '8 ሥራዎች',
      quote: '“በመጨረሻም ባለሙያዎች የተረጋገጡበት አስተማማኝ የሥራ መድረክ። ለትምህርት ቤታችን ጥገና ትልቅ እፎይታ ሰጥቶናል።”',
      avatarBg: 'bg-gradient-to-tr from-purple-600 via-violet-400 to-fuchsia-200 text-white'
    },
    {
      id: 'rev-6',
      initial: 'A',
      name: 'አህመድ ተ.',
      role: 'የሕንፃ አስተዳዳሪ',
      trade: 'የቧንቧ ሠራተኛ',
      jobs: '12 ሥራዎች',
      quote: '“ድሬስኪል ሕንፃዎቼን የማስተዳድርበትን መንገድ ሙሉ በሙሉ ቀይሮታል። በደቂቃዎች ውስጥ የተረጋገጠ ቧንቧ ሠራተኛ ማግኘት ይቻላል።”',
      avatarBg: 'bg-gradient-to-tr from-amber-700 via-orange-500 to-amber-300 text-white'
    }
  ] : language === 'ORO' ? [
    {
      id: 'rev-1',
      initial: 'M',
      name: 'Muunaa Ibraahiim',
      role: 'Abbaa Manaa',
      trade: 'Elektiriikii',
      jobs: 'Hojii 7',
      quote: '“Kanaan dura yeroo ogeessa qacaru nageenya nan sodaadha ture. Amma waliigaltee dijitaalaafi Faayidaan guutummatti amansiisaadha.”',
      avatarBg: 'bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white'
    },
    {
      id: 'rev-2',
      initial: 'D',
      name: 'Daawwit Birhaanuu',
      role: 'Abbaa Daldalaa',
      trade: 'Halluu',
      jobs: 'Hojii 5',
      quote: '“Qulqullinni ogeessota waltajjii kanaa dorgomaa hin qabu. Saffisaa, mirkanaa\'aafi yeroo hunda ogummaa qaba.”',
      avatarBg: 'bg-gradient-to-tr from-blue-600 via-indigo-400 to-sky-200 text-white'
    },
    {
      id: 'rev-3',
      initial: 'S',
      name: 'Selaamawit G.',
      role: 'Hogganaa Suuqii',
      trade: 'Elektiriikii',
      jobs: 'Hojii 3',
      quote: '“Qaziraa keessatti ogeessa elektiriikii argachuuf karaa baay\'ee saffisaadha. Sirni sadarkaa nama sirrii filachuuf na gargaareera.”',
      avatarBg: 'bg-gradient-to-tr from-rose-600 via-rose-400 to-pink-200 text-white'
    },
    {
      id: 'rev-4',
      initial: 'Y',
      name: 'Yoonaas B.',
      role: 'Abbaa Resteeraantii',
      trade: 'Xumura Manaa',
      jobs: 'Hojii 4',
      quote: '“Hojiin xumura manaa DireSkill irraa argadhe baay\'ee kan nama gammachiisudha. Qulqulluu fi yeroo isaatti kan xumurame.”',
      avatarBg: 'bg-gradient-to-tr from-emerald-600 via-teal-400 to-emerald-200 text-white'
    },
    {
      id: 'rev-5',
      initial: 'H',
      name: 'Haanaa T.',
      role: 'Daayireektara M/B',
      trade: 'Suphaa Waliigalaa',
      jobs: 'Hojii 8',
      quote: '“Dhuma irratti waltijii ogeeyyiin itti qulqullaa\'an argame. Suphaa mana barumsaa keenyaaf tasgabbii guddaa nuuf kenneera.”',
      avatarBg: 'bg-gradient-to-tr from-purple-600 via-violet-400 to-fuchsia-200 text-white'
    },
    {
      id: 'rev-6',
      initial: 'A',
      name: 'Ahmad T.',
      role: 'Bulchaa Gamoo',
      trade: 'Ujummoo',
      jobs: 'Hojii 12',
      quote: '“DireSkill akkaataa ani gamoo koo itti bulchu guutummatti jijjiireera. Daqiiqaa muraasa keessatti ogeessa ujummoo argachuun baay\'ee salphaadha.”',
      avatarBg: 'bg-gradient-to-tr from-amber-700 via-orange-500 to-amber-300 text-white'
    }
  ] : [
    {
      id: 'rev-1',
      initial: 'M',
      name: 'Muna Ibrahim',
      role: 'Home Owner',
      trade: 'Electrician',
      jobs: '7 jobs',
      quote: '“I used to worry about safety when hiring workers. Now with the digital contract and identity verification, I feel 100% secure.”',
      avatarBg: 'bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white'
    },
    {
      id: 'rev-2',
      initial: 'D',
      name: 'Dawit Berhanu',
      role: 'Business Owner',
      trade: 'Painter',
      jobs: '5 jobs',
      quote: '“The quality of professionals on this platform is unmatched. Efficient, verified, and professional every time.”',
      avatarBg: 'bg-gradient-to-tr from-blue-600 via-indigo-400 to-sky-200 text-white'
    },
    {
      id: 'rev-3',
      initial: 'S',
      name: 'Selamawit G.',
      role: 'Store Manager',
      trade: 'Electrician',
      jobs: '3 jobs',
      quote: '“Fastest way to get an electrician in Kezira. The rating system really helps in choosing the right person.”',
      avatarBg: 'bg-gradient-to-tr from-rose-600 via-rose-400 to-pink-200 text-white'
    },
    {
      id: 'rev-4',
      initial: 'Y',
      name: 'Yonas B.',
      role: 'Restaurant Owner',
      trade: 'House Finishing',
      jobs: '4 jobs',
      quote: '“The house finishing work I got through DireSkill was exceptional. Clean, professional, and on time.”',
      avatarBg: 'bg-gradient-to-tr from-emerald-600 via-teal-400 to-emerald-200 text-white'
    },
    {
      id: 'rev-5',
      initial: 'H',
      name: 'Hana T.',
      role: 'School Director',
      trade: 'Maintenance',
      jobs: '8 jobs',
      quote: '“Finally, a marketplace where workers are verified. It gives me peace of mind for all our school maintenance.”',
      avatarBg: 'bg-gradient-to-tr from-purple-600 via-violet-400 to-fuchsia-200 text-white'
    },
    {
      id: 'rev-6',
      initial: 'A',
      name: 'Ahmed Tesfaye',
      role: 'Property Manager',
      trade: 'Plumber',
      jobs: '12 jobs',
      quote: '“DireSkill has completely changed how I manage my buildings. Finding a verified plumber in minutes is a lifesaver.”',
      avatarBg: 'bg-gradient-to-tr from-amber-700 via-orange-500 to-amber-300 text-white'
    }
  ];

  const combinedReviews = langCustom.length > 0 ? [...langCustom, ...reviews] : reviews;

  // Duplicate for seamless infinite sliding animation
  const infiniteReviewsTrack1 = [...combinedReviews, ...combinedReviews, ...combinedReviews];
  const infiniteReviewsTrack2 = [
    ...combinedReviews.slice(Math.min(3, combinedReviews.length)),
    ...combinedReviews,
    ...combinedReviews
  ];

  return (
    <section id="reviews" className="py-24 md:py-32 bg-[#FAF9F5] border-t border-[#E8E6DF] overflow-hidden">
      {/* Central Statement with Testimonials Title and scroll reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1200px] mx-auto px-4 md:px-10 text-center mb-14 md:mb-18"
      >
        <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#FF416C] mb-4 block">
          {t.reviews.tag}
        </span>
        <h2 className="font-sans text-[28px] sm:text-[38px] md:text-[48px] leading-[1.2] md:leading-[1.15] tracking-tight text-[#1B1B1B] font-normal max-w-[960px] mx-auto text-balance">
          {t.reviews.quote}
        </h2>
        <p className="mt-4 text-xs font-mono uppercase tracking-[0.2em] text-[#8C8880]">
          {t.reviews.subquote}
        </p>
      </motion.div>

      {/* Track 1: Sliding from Left to Right (Pauses on Hover) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full overflow-hidden marquee-container py-3 touch-pan-y"
      >
        <div className="animate-marquee-right flex gap-5 hover:[animation-play-state:paused] touch-pan-y">
          {infiniteReviewsTrack1.map((item, index) => (
            <div
              key={`${item.id}-t1-${index}`}
              className="w-[340px] sm:w-[420px] shrink-0 p-5 sm:p-6 rounded-[28px] bg-white border border-[#E4E2DA] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-default"
            >
              {/* Review Quote */}
              <p className="font-sans text-sm sm:text-[15px] text-[#333] leading-relaxed mb-5 font-normal italic">
                {item.quote}
              </p>

              {/* Author Info Bar matching the pill avatar card style from image */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F0EFEB]">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${item.avatarBg} flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                    {item.initial}
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-[#1B1B1B] leading-tight">
                      {item.name}
                    </h4>
                    <span className="text-xs text-[#8C8880] block">
                      {item.role}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-[#1B1B1B] block">
                    {item.trade}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {item.jobs}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Track 2: Sliding in Reverse / Offset (Pauses on Hover) */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full overflow-hidden marquee-container py-3 mt-2 touch-pan-y"
      >
        <div className="animate-marquee flex gap-5 hover:[animation-play-state:paused] touch-pan-y">
          {infiniteReviewsTrack2.map((item, index) => (
            <div
              key={`${item.id}-t2-${index}`}
              className="w-[340px] sm:w-[420px] shrink-0 p-5 sm:p-6 rounded-[28px] bg-white border border-[#E4E2DA] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-default"
            >
              {/* Review Quote */}
              <p className="font-sans text-sm sm:text-[15px] text-[#333] leading-relaxed mb-5 font-normal italic">
                {item.quote}
              </p>

              {/* Author Info Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F0EFEB]">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${item.avatarBg} flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                    {item.initial}
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-[#1B1B1B] leading-tight">
                      {item.name}
                    </h4>
                    <span className="text-xs text-[#8C8880] block">
                      {item.role}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-[#1B1B1B] block">
                    {item.trade}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {item.jobs}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

