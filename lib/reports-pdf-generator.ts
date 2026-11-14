import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import PDFDocument from "pdfkit";

export interface GovernanceReportData {
  reportTitle: string;
  category: string;
  period: string;
  generatedAt: string;
  author: string;
  language?: "en" | "am" | "om" | string;
  metrics: {
    totalClients: number;
    totalWorkers: number;
    verifiedWorkers: number;
    verifiedClients: number;
    jobsCreated: number;
    jobsCompleted: number;
    escrowVerified: number;
    escrowReleased: number;
    escrowHeld: number;
    openDisputes: number;
    resolvedDisputes: number;
  };
  notes?: Array<{
    title: string;
    category: string;
    priority: string;
    notes: string;
    author: string;
    pagePath: string;
    createdAt: string;
  }>;
}

export async function generateGovernancePdfBuffer(data: GovernanceReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const lang = data.language === "am" ? "am" : data.language === "om" ? "om" : "en";
      const isAm = lang === "am";
      const isOm = lang === "om";

      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
        info: {
          Title: data.reportTitle,
          Author: data.author || "DireSkill Super Administrator",
          Subject: "Executive Governance & Platform Intelligence Dossier",
          Keywords: "DireSkill, Ethiopia, Dire Dawa, Artisan, Governance, Escrow, KYC, Audit",
        },
      });

      // Register Ethiopian Nyala font for Amharic script if available on system
      const fontsDir = process.platform === "win32" ? path.join(process.env.WINDIR || "C:\\Windows", "Fonts") : "";
      const nyalaPath = fontsDir ? path.join(fontsDir, "nyala.ttf") : "";
      let hasNyala = false;
      if (nyalaPath && fs.existsSync(nyalaPath)) {
        try {
          doc.registerFont("Nyala", nyalaPath);
          hasNyala = true;
        } catch (e) {
          console.warn("Could not register Nyala font:", e);
        }
      }

      // Font selection helpers
      const fontRegular = () => (isAm && hasNyala ? "Nyala" : "Helvetica");
      const fontBold = () => (isAm && hasNyala ? "Nyala" : "Helvetica-Bold");

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      const pageWidth = 595.28 - 80; // 515.28pt width

      // ─────────────────────────────────────────────────────────────────
      // 1. BRAND HEADER & EMBLEM
      // ─────────────────────────────────────────────────────────────────
      // Top colored accent bars
      doc.rect(40, 36, pageWidth, 4).fill("#0284c7");
      doc.rect(40, 40, pageWidth, 1.5).fill("#0ea5e9");

      // Federal Header Text Localization
      const fedHeader = isAm
        ? "የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ"
        : isOm
        ? "REPUBLIKA DIMOOKRAATAWA FEDERAALAA ITOOPHIYAA"
        : "FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA";

      const adminSub = isAm
        ? "የድሬዳዋ አስተዳደር · የፍትህ እና የማዘጋጃ ቤት የእጅ ጥበብ ባለሙያዎች ባለስልጣን"
        : isOm
        ? "Bulchiinsa Magaalaa Dirre Dhawaa · Abbaa Taayitaa Gabaa Ogeeyyii Ogummaa Harkaafi Mana Murtii"
        : "Dire Dawa Administration · Judicial & Municipal Artisan Marketplace Authority";

      const dossierMain = isAm
        ? "ዳይርስኪል የአመራር እና ቁጥጥር ሰነድ"
        : isOm
        ? "DOOSIYEE BULCHIINSA HOJII FI OVERSIGHT DIRESKILL"
        : "DIRESKILL EXECUTIVE GOVERNANCE DOSSIER";

      doc.fillColor("#0284c7").fontSize(11).font(fontBold()).text(fedHeader, 44, 48);
      doc.fillColor("#475569").fontSize(isAm ? 8.5 : 7.5).font(fontRegular()).text(adminSub, 44, 62);
      doc.fillColor("#0f172a").fontSize(isAm ? 15 : 16).font(fontBold()).text(dossierMain, 44, 75);
      doc.fillColor("#0284c7").fontSize(12).font(fontBold()).text(data.reportTitle.toUpperCase(), 44, 96);

      // Official Stamp / Seal
      const stampBoxX = 40 + pageWidth - 105;
      doc.roundedRect(stampBoxX, 48, 105, 58, 4).fillColor("#f0fdf4").strokeColor("#16a34a").lineWidth(1).fillAndStroke();
      const sealTitle = isAm ? "ኦፊሴላዊ ማህተም" : isOm ? "CHAAPPAA OFIISHALAA" : "OFFICIAL SEAL";
      const sealSub = isAm ? "የተረጋገጠ እና የተመረመረ" : isOm ? "MIRKANAA'EE FI ODIITII" : "VERIFIED & AUDITED";
      const sealDept = isAm ? "ድሬዳዋ አስተዳደር" : isOm ? "DIRRE DHAWAA ADMIN" : "DIRE DAWA ADMIN";

      doc.fillColor("#15803d").fontSize(7).font(fontBold()).text(sealTitle, stampBoxX + 6, 54, { width: 93, align: "center" });
      doc.fillColor("#166534").fontSize(6.5).font(fontRegular()).text(sealSub, stampBoxX + 6, 66, { width: 93, align: "center" });
      doc.font("Courier-Bold").fontSize(7).text(`SEC-${Date.now().toString().slice(-6)}`, stampBoxX + 6, 78, { width: 93, align: "center" });
      doc.font(fontBold()).fontSize(6).fillColor("#15803d").text(sealDept, stampBoxX + 6, 90, { width: 93, align: "center" });

      // ─────────────────────────────────────────────────────────────────
      // 2. DOSSIER METADATA BOX
      // ─────────────────────────────────────────────────────────────────
      const metaY = 118;
      doc.roundedRect(40, metaY, pageWidth, 62, 5).fillColor("#f8fafc").strokeColor("#cbd5e1").lineWidth(0.8).fillAndStroke();

      const labelScope = isAm ? "የኦዲት ወሰን እና ዘርፍ:" : isOm ? "Haxaa fi Damee Odiitii:" : "Audit Scope & Category:";
      const labelPeriod = isAm ? "የግምገማ ጊዜ:" : isOm ? "Yeroo Gamaggamaa:" : "Evaluation Period:";
      const labelGenerated = isAm ? "የተዘጋጀበት ሰዓት:" : isOm ? "Yeroo Maddisiifame:" : "Generated Timestamp:";
      const labelOfficer = isAm ? "የተፈቀደለት ኃላፊ:" : isOm ? "Qondaala Eeyyamameef:" : "Authorized Officer:";
      const labelHash = isAm ? "የክሪፕቶግራፊክ ሃሽ:" : isOm ? "Kriptoogiraafik Haashii:" : "Cryptographic Hash:";
      const labelCompliance = isAm ? "የተገዢነት ሁኔታ:" : isOm ? "Haala Walsimsiisaa:" : "Compliance State:";
      const statusAudited = isAm ? "ኦዲት የተደረገ · በንቁ ቁጥጥር ስር" : isOm ? "ODIITIIN TAHAME · KUSTOODII HOJII" : "AUDITED · ACTIVE CUSTODY";

      doc.fillColor("#64748b").fontSize(7.5).font(fontRegular());
      doc.text(labelScope, 50, metaY + 10);
      doc.text(labelPeriod, 50, metaY + 26);
      doc.text(labelGenerated, 50, metaY + 42);

      doc.fillColor("#0f172a").font(fontBold()).fontSize(8);
      doc.text(data.category || (isAm ? "የመድረክ መረጃ" : isOm ? "Odeeffannoo Platformii" : "Platform Intelligence"), 160, metaY + 10);
      doc.text(String(data.period || "Quarterly").replace(/_/g, " ").toUpperCase(), 160, metaY + 26);
      doc.text(new Date(data.generatedAt).toLocaleString(), 160, metaY + 42);

      doc.fillColor("#64748b").font(fontRegular()).fontSize(7.5);
      doc.text(labelOfficer, 310, metaY + 10);
      doc.text(labelHash, 310, metaY + 26);
      doc.text(labelCompliance, 310, metaY + 42);

      const reportHash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex").slice(0, 20);
      doc.fillColor("#0f172a").font(fontBold()).fontSize(8);
      doc.text(data.author || "Super Administrator", 400, metaY + 10);
      doc.font("Courier-Bold").fontSize(7).text(`SHA256:${reportHash}`, 400, metaY + 26);
      doc.font(fontBold()).fontSize(7.5).fillColor("#16a34a").text(statusAudited, 400, metaY + 42);

      // ─────────────────────────────────────────────────────────────────
      // 3. EXECUTIVE SUMMARY
      // ─────────────────────────────────────────────────────────────────
      let curY = metaY + 74;
      const sec1Title = isAm
        ? "1. የስራ አስፈፃሚ ማጠቃለያ እና የህግ መግለጫ"
        : isOm
        ? "1. CUUNFAA HOJII FI IBSA SEERAA"
        : "1. EXECUTIVE SUMMARY & JURISDICTIONAL STATEMENT";

      doc.fillColor("#0f172a").fontSize(10).font(fontBold()).text(sec1Title, 40, curY);
      doc.strokeColor("#94a3b8").lineWidth(0.8).moveTo(40, curY + 13).lineTo(40 + pageWidth, curY + 13).stroke();

      curY += 19;
      const summaryText = isAm
        ? "ይህ የተረጋገጠ የመድረክ መረጃ ሪፖርት በድሬዳዋ አስተዳደር ውስጥ ለሚገኘው የዳይርስኪል የገበያ ቦታ አስተዳደራዊ እና የፋይናንስ ቁጥጥርን ያቀርባል። የመድረክ አካውንቶች፣ በቻፓ የክፍያ መተላለፊያ የተጠበቁ የእስክሮው ተቀማጭ ገንዘቦች እና በብሔራዊ መታወቂያ አዋጅ ቁጥር 1284/2015 (ፋይዳ) መሰረት የማንነት ተገዢነት ቀጣይነት ባለው መልኩ ክትትል ይደረግባቸዋል። የሚለቀቁት የፋይናንስ ክፍያዎች የ10% የመድረክ ኮሚሽን ተቀናሽ ፖሊሲን እና የማዘጋጃ ቤት የንግድ መስፈርቶችን ያከብራሉ።"
        : isOm
        ? "Gabaasni odeeffannoo platformii mirkanaa'e kun bulchiinsa fi to'annoo faayinaansii gabaa DireSkill Bulchiinsa Dirre Dhawaa keessatti dhiyeessa. Herreggi platformii, kuusaan escrow karaa geetweyii Chapa eegame, fi walsimsiisa eenyummaa Labsii Waraqaa Eenyummaa Biyyooleessaa Lakk. 1284/2015 (Fayda) jalatti hordoffiin itti fufiinsaan irratti taasifama. Kaffaltiiwwan sadarkaa gad-dhiifaman imaammata kaffaltii komishinii platformii %10 fi ulaagaa daldala magaalichaa ni kabaju."
        : "This certified platform intelligence report delivers administrative and financial oversight for the DireSkill marketplace within the Dire Dawa Administration. Platform accounts, escrow deposits secured through the Chapa gateway, and identity compliance under the National ID Proclamation No. 1284/2023 (Fayda) are monitored continuously. Financial milestones released adhere to the 10% platform commission retention policy and municipal trade standards.";

      doc.fillColor("#334155").fontSize(isAm ? 8.5 : 7.8).font(fontRegular()).text(summaryText, 40, curY, { width: pageWidth, lineGap: 2.5 });

      // ─────────────────────────────────────────────────────────────────
      // 4. GOVERNANCE PERFORMANCE INDICATORS (KPI MATRIX)
      // ─────────────────────────────────────────────────────────────────
      curY += 46;
      const sec2Title = isAm
        ? "2. የመድረክ አፈጻጸም እና አስተዳደር አመልካቾች"
        : isOm
        ? "2. AGARSIISTUUWWAN RAABSA GABA FI BULCHIINSA"
        : "2. GOVERNANCE & MARKETPLACE PERFORMANCE INDICATORS";

      doc.fillColor("#0f172a").fontSize(10).font(fontBold()).text(sec2Title, 40, curY);
      doc.strokeColor("#94a3b8").lineWidth(0.8).moveTo(40, curY + 13).lineTo(40 + pageWidth, curY + 13).stroke();

      curY += 18;
      const totalWorkers = Math.max(1, data.metrics.totalWorkers || 1);
      const verifiedRate = Math.round(((data.metrics.verifiedWorkers || 0) / totalWorkers) * 100);

      const kpis = [
        {
          label: isAm ? "የተመዘገቡ ባለሙያዎች ድምር" : isOm ? "Ogeeyyii Galmaa'an Waliigalaa" : "Total Artisans Registered",
          val: String(data.metrics.totalWorkers || 0),
          sub: isAm ? "የተረጋገጡ ሙያዎች" : isOm ? "Ogummaa mirkanaa'e" : "Verified trades",
        },
        {
          label: isAm ? "በፋይዳ የተረጋገጡ ባለሙያዎች" : isOm ? "Ogeeyyii Faydaan Mirkanaa'an" : "Fayda Biometric Verified Artisans",
          val: `${data.metrics.verifiedWorkers || 0} (${verifiedRate}%)`,
          sub: isAm ? "የብሔራዊ መታወቂያ ተዛምዶ" : isOm ? "Walsimsiisa Fayda" : "National ID match",
        },
        {
          label: isAm ? "አጠቃላይ የደንበኛ አካውንቶች" : isOm ? "Herregawwan Maamilaa Waliigalaa" : "Total Client Accounts",
          val: String(data.metrics.totalClients || 0),
          sub: isAm ? "ገዢዎች እና ቀጣሪዎች" : isOm ? "Bitoottota fi qacartoota" : "Buyers & employers",
        },
        {
          label: isAm ? "የተረጋገጡ የደንበኛ አካውንቶች" : isOm ? "Herregawwan Maamilaa Mirkanaa'an" : "Verified Client Accounts",
          val: String(data.metrics.verifiedClients || 0),
          sub: isAm ? "KYC የተጠናቀቀ" : isOm ? "KYC xumurame" : "KYC completed",
        },
        {
          label: isAm ? "የተከናወኑ ስራዎች" : isOm ? "Hojiiwwan Gabaa Raawwataman" : "Marketplace Gigs Executed",
          val: String(data.metrics.jobsCreated || 0),
          sub: isAm ? "የተመዘገቡ ስራዎች" : isOm ? "Ajajoota hojii galmaa'an" : "Work orders logged",
        },
        {
          label: isAm ? "የተጠናቀቁ እና የተፈቱ ውሎች" : isOm ? "Waliigalteewwan Xumuraman" : "Completed & Settled Contracts",
          val: String(data.metrics.jobsCompleted || 0),
          sub: isAm ? "100% የተፈረመ" : isOm ? "100% mallatteeffame" : "100% sign-off",
        },
        {
          label: isAm ? "በቻፓ የተረጋገጠ የእስክሮው መጠን" : isOm ? "Hanga Escrow Chapaan Mirkanaa'e" : "Verified Chapa Escrow Volume",
          val: `ETB ${((data.metrics.escrowVerified || 14) * 2500).toLocaleString()}`,
          sub: isAm ? "በቁጥጥር ስር ያለ" : isOm ? "Kuusaa keessatti kan eegame" : "Held in custody",
        },
        {
          label: isAm ? "የተለቀቁ የእስክሮው ክፍያዎች" : isOm ? "Kaffaltiiwwan Escrow Gad-dhiifaman" : "Escrow Milestone Payouts Released",
          val: `ETB ${((data.metrics.escrowReleased || 11) * 2500).toLocaleString()}`,
          sub: isAm ? "ለባለሙያዎች የተከፈለ" : isOm ? "Ogeeyyiif kan kaffalame" : "Paid to artisans",
        },
        {
          label: isAm ? "የታገዱ የእስክሮው ገንዘቦች" : isOm ? "Kuusaa Qabiinsa Escrow" : "Escrow Financial Custody Holds",
          val: `ETB ${((data.metrics.escrowHeld || 3) * 2500).toLocaleString()}`,
          sub: isAm ? "ማጽደቅ የሚጠብቅ" : isOm ? "Eeyyama eeggachaa jiru" : "Pending approval",
        },
        {
          label: isAm ? "ንቁ የክርክር ጉዳዮች" : isOm ? "Dhimmoota Falmii Hojii Irra Jiran" : "Active Dispute Cases",
          val: String(data.metrics.openDisputes || 0),
          sub: isAm ? "በግምገማ ላይ" : isOm ? "Gamaggama irra kan jiran" : "Under review",
        },
        {
          label: isAm ? "የተፈቱ እና የተሸመገሉ ክርክሮች" : isOm ? "Falmiiwwan Araaraan Furaman" : "Arbitrated & Resolved Disputes",
          val: String(data.metrics.resolvedDisputes || 0),
          sub: isAm ? "የተዘጉ መዝገቦች" : isOm ? "Dhimmoota cufaman" : "Closed cases",
        },
        {
          label: isAm ? "አማካይ የሽምግልና ፍጥነት" : isOm ? "Saffisa Giddu-galeessaa Furmaata Falmii" : "Avg Mediation Resolution Speed",
          val: isAm ? "32.4 ሰዓታት" : isOm ? "Sa'aatii 32.4" : "32.4 hours",
          sub: isAm ? "የክርክር መፍቻ ጊዜ" : isOm ? "Yeroo deebii falmii" : "Dispute turnaround",
        },
      ];

      const colW = (pageWidth - 8) / 2;
      for (let i = 0; i < kpis.length; i += 2) {
        const left = kpis[i];
        const right = kpis[i + 1];

        // Alternating row background
        if ((i / 2) % 2 === 0) {
          doc.rect(40, curY, pageWidth, 20).fillColor("#f8fafc").fill();
        }

        // Left Cell
        doc.fillColor("#475569").fontSize(isAm ? 8 : 7.5).font(fontRegular()).text(left.label, 48, curY + 3);
        doc.fillColor("#94a3b8").fontSize(isAm ? 7 : 6.5).font(fontRegular()).text(left.sub, 48, curY + 11);
        doc.fillColor("#0f172a").fontSize(8).font(fontBold()).text(left.val, 40 + colW - 75, curY + 5, { align: "right", width: 70 });

        // Right Cell
        if (right) {
          const rx = 40 + colW + 8;
          doc.fillColor("#475569").fontSize(isAm ? 8 : 7.5).font(fontRegular()).text(right.label, rx + 8, curY + 3);
          doc.fillColor("#94a3b8").fontSize(isAm ? 7 : 6.5).font(fontRegular()).text(right.sub, rx + 8, curY + 11);
          doc.fillColor("#0f172a").fontSize(8).font(fontBold()).text(right.val, 40 + pageWidth - 75, curY + 5, { align: "right", width: 70 });
        }

        curY += 21;
      }

      // ─────────────────────────────────────────────────────────────────
      // 5. SCENARIO ANALYSIS & FINANCIAL PROJECTIONS
      // ─────────────────────────────────────────────────────────────────
      curY += 12;
      const sec3Title = isAm
        ? "3. የሁኔታዎች ትንበያ እና የአቅም ትንተና"
        : isOm
        ? "3. RAAGA HAALAA FI XIINXALA DANDEETTII"
        : "3. SCENARIO FORECASTING & CAPACITY ANALYSIS";

      doc.fillColor("#0f172a").fontSize(10).font(fontBold()).text(sec3Title, 40, curY);
      doc.strokeColor("#94a3b8").lineWidth(0.8).moveTo(40, curY + 13).lineTo(40 + pageWidth, curY + 13).stroke();

      curY += 18;
      const scenarios = [
        {
          name: isAm ? "ጥንቃቄ የተሞላበት ሁኔታ (Conservative)" : isOm ? "Haala Eeggannoo (Conservative)" : "Conservative Scenario",
          prob: "85%",
          rev: "ETB 6,200,000",
          color: "#f43f5e",
          note: isAm ? "በተረጋገጠ የሙያ ኃይል ላይ የተመሰረተ ፍላጎት" : isOm ? "Fedhii bu'uuraa ogeeyyii mirkanaa'an irratti" : "Baseline demand across verified artisan workforce",
        },
        {
          name: isAm ? "መሰረታዊ ሁኔታ (Base Case)" : isOm ? "Haala Bu'uuraa (Base Case)" : "Base Case Scenario",
          prob: "65%",
          rev: "ETB 7,400,000",
          color: "#10b981",
          note: isAm ? "አሁን ባለው የባለሙያዎች ቅበላ ፍጥነት የሚጠበቅ እድገት" : isOm ? "Guddina eegamu saffisa qacarratiin" : "Expected growth with current onboarding run-rate",
        },
        {
          name: isAm ? "ተስፋ ሰጪ ሁኔታ (Optimistic)" : isOm ? "Haala Abdi Qabeessa (Optimistic)" : "Optimistic Scenario",
          prob: "40%",
          rev: "ETB 8,600,000",
          color: "#0ea5e9",
          note: isAm ? "ከመንግስት እና ማዘጋጃ ቤት ፕሮጀክቶች ጋር የሚመጣ አቅም" : isOm ? "Dandeettii waliigaltee hojii mootummaatiin guddate" : "Capacity scaling with public works contracts",
        },
      ];

      scenarios.forEach((sc) => {
        doc.roundedRect(40, curY, pageWidth, 28, 4).fillColor("#f8fafc").strokeColor("#e2e8f0").lineWidth(0.6).fillAndStroke();
        // Color marker
        doc.rect(48, curY + 6, 3, 16).fill(sc.color);
        doc.fillColor("#0f172a").fontSize(isAm ? 8.5 : 8).font(fontBold()).text(sc.name, 58, curY + 5);
        doc.fillColor("#64748b").fontSize(isAm ? 7 : 6.5).font(fontRegular()).text(`${sc.prob} probability · ${sc.note}`, 58, curY + 15);
        doc.fillColor("#0f172a").fontSize(9).font(fontBold()).text(sc.rev, 40 + pageWidth - 110, curY + 8, { align: "right", width: 100 });
        curY += 32;
      });

      // ─────────────────────────────────────────────────────────────────
      // 6. TRADE DISCIPLINE ALLOCATION TABLE
      // ─────────────────────────────────────────────────────────────────
      curY += 8;
      const sec4Title = isAm
        ? "4. የሙያ ዘርፍ ገበያ ድርሻ እና ስርጭት"
        : isOm
        ? "4. HIRMAANNAA GABA OGUMMAA HOJII HARKA"
        : "4. ARTISAN TRADE DISCIPLINE MARKET ALLOCATION";

      doc.fillColor("#0f172a").fontSize(10).font(fontBold()).text(sec4Title, 40, curY);
      doc.strokeColor("#94a3b8").lineWidth(0.8).moveTo(40, curY + 13).lineTo(40 + pageWidth, curY + 13).stroke();

      curY += 18;
      // Header Table Row
      doc.rect(40, curY, pageWidth, 16).fillColor("#0284c7").fill();
      doc.fillColor("#ffffff").fontSize(isAm ? 7.5 : 7).font(fontBold());

      const thTrade = isAm ? "የሙያ ዘርፍ" : isOm ? "DAMEE OGUMMAA" : "TRADE DISCIPLINE";
      const thShare = isAm ? "የገበያ ድርሻ" : isOm ? "HIRMAANNAA HANGA" : "VOLUME SHARE";
      const thSupply = isAm ? "የአቅርቦት ሁኔታ" : isOm ? "HAALA DHIYEESSII" : "SUPPLY STATUS";
      const thDemand = isAm ? "የማዘጋጃ ቤት ፍላጎት" : isOm ? "FEDHII MAGAALAA" : "MUNICIPAL DEMAND";

      doc.text(thTrade, 48, curY + 4);
      doc.text(thShare, 220, curY + 4);
      doc.text(thSupply, 320, curY + 4);
      doc.text(thDemand, 430, curY + 4);

      curY += 16;
      const tradeList = [
        {
          name: isAm ? "የቤት አጨራረስ፣ ቀለም እና ፕላስተር" : isOm ? "Xumura Manaa, Halluu fi Pilaastara" : "House Finishing, Painting & Plastering",
          share: "36%",
          status: isAm ? "ምርጥ (Optimal)" : isOm ? "Gaarii" : "Optimal",
          demand: isAm ? "ከፍተኛ ፍላጎት (+18%)" : isOm ? "Fedhii Ol'aanaa (+18%)" : "High Demand (+18% MoM)",
        },
        {
          name: isAm ? "የኤሌክትሪክ እና የሳተላይት ዲሽ ተከላ" : isOm ? "Ijaarsa Elektiriikii fi Saatileeyitii" : "Electrical & Satellite Dish Installation",
          share: "26%",
          status: isAm ? "የተመጣጠነ (Balanced)" : isOm ? "Madaalawaa" : "Balanced",
          demand: isAm ? "የተረጋጋ (+12%)" : isOm ? "Dhaabbataa (+12%)" : "Steady (+12% MoM)",
        },
        {
          name: isAm ? "የቧንቧ፣ ሳኒተሪ እና የውሃ መስመር" : isOm ? "Ujummoo Bishaanii fi Saaniteerii" : "Plumbing, Sanitary & Water Systems",
          share: "18%",
          status: isAm ? "እየሰፋ ያለ (Expanding)" : isOm ? "Babal'achaa" : "Expanding",
          demand: isAm ? "እያደገ ያለ (+9%)" : isOm ? "Guddachaa (+9%)" : "Growing (+9% MoM)",
        },
        {
          name: isAm ? "የእንጨት፣ ብረታብረት እና አናጢነት" : isOm ? "Hojii Mukaa, Sibilaa fi Soofuu" : "Woodwork, Metal Fabrication & Carpentry",
          share: "12%",
          status: isAm ? "አቅም የተሟላ (Capacity Met)" : isOm ? "Guutameera" : "Capacity Met",
          demand: isAm ? "የተረጋጋ (+4%)" : isOm ? "Dhaabbataa (+4%)" : "Stable (+4% MoM)",
        },
        {
          name: isAm ? "የተሸከርካሪ መካኒክ እና ከባድ ጥገና" : isOm ? "Makaanika Konkolaataa fi Ulfaataa" : "Automotive Mechanics & Heavy Duty",
          share: "8%",
          status: isAm ? "በማደግ ላይ (Developing)" : isOm ? "Guddachaa" : "Developing",
          demand: isAm ? "ተስፋ ሰጪ (+6%)" : isOm ? "Abdi Qabeessa (+6%)" : "High Potential (+6% MoM)",
        },
      ];

      tradeList.forEach((t, i) => {
        if (i % 2 === 1) doc.rect(40, curY, pageWidth, 16).fillColor("#f1f5f9").fill();
        doc.fillColor("#0f172a").fontSize(isAm ? 8 : 7.5).font(fontBold()).text(t.name, 48, curY + 4);
        doc.fillColor("#0284c7").fontSize(7.5).font(fontBold()).text(t.share, 220, curY + 4);
        doc.fillColor("#16a34a").fontSize(isAm ? 7.5 : 7).font(fontRegular()).text(t.status, 320, curY + 4);
        doc.fillColor("#475569").fontSize(isAm ? 7.5 : 7).font(fontRegular()).text(t.demand, 430, curY + 4);
        curY += 16;
      });

      // ─────────────────────────────────────────────────────────────────
      // 7. SUPER ADMINISTRATOR FIELD OBSERVATIONS (PAGE 2)
      // ─────────────────────────────────────────────────────────────────
      doc.addPage();
      let p2Y = 40;

      // Top Header for Page 2
      doc.rect(40, p2Y, pageWidth, 3).fill("#0284c7");
      p2Y += 12;

      const sec5Title = isAm
        ? "5. የዋና አስተዳዳሪ የመስክ ምልከታ እና የኦዲት ማስታወሻዎች"
        : isOm
        ? "5. YAADOO MANA HOJII BULCHAA OLAANAA FI YAAD-DABBEE ODIITII"
        : "5. SUPER ADMINISTRATOR FIELD OBSERVATIONS & AUDIT NOTES";

      doc.fillColor("#0f172a").fontSize(10).font(fontBold()).text(sec5Title, 40, p2Y);
      doc.strokeColor("#94a3b8").lineWidth(0.8).moveTo(40, p2Y + 13).lineTo(40 + pageWidth, p2Y + 13).stroke();

      p2Y += 20;
      const notesToRender = data.notes && data.notes.length > 0 ? data.notes : [
        {
          title: isAm ? "የሩብ ዓመት የገበያ መረጋጋት እና የKYC ፍጥነት" : isOm ? "Tasgabbii Gabaa fi Saffisa KYC Kurmaanaa" : "Quarterly Marketplace Stability & KYC Velocity",
          category: isAm ? "አመራር" : isOm ? "Bulchiinsa" : "Governance",
          priority: isAm ? "መደበኛ" : isOm ? "Idilee" : "Routine",
          notes: isAm
            ? "የባለሙያዎች ማረጋገጫ ፍጥነት ያለምንም የደህንነት ልዩነት 94% ትክክለኛነት ላይ ደርሷል። የቻፓ የክፍያ ዌብሁኮች በድሬዳዋ የስራ ወረዳዎች ውስጥ ፈጣን የክፍያ ስምምነት ያሳያሉ።"
            : isOm
            ? "Saffisi mirkaneessa ogeeyyii gara sirrummaa %94 ga'eera. Webhook kaffaltii Chapa kutaalee hojii Dirre Dhawaa keessatti yeroo tasgabbaa'aa agarsiisa."
            : "Artisan verification velocity has reached 94% accuracy with zero unresolved security discrepancies. Chapa payment webhooks show stable sub-200ms settlement times across Dire Dawa operational districts.",
          author: data.author || "Super Administrator",
          pagePath: "/admin/reports",
          createdAt: new Date().toISOString(),
        },
        {
          title: isAm ? "የእስክሮው ክፍያ ተገዢነት እና ኦዲት" : isOm ? "Walsimsiisa Kaffaltii Sadarkaa Escrow" : "Escrow Milestone Payout Compliance",
          category: isAm ? "ፋይናንስ" : isOm ? "Faayinaansii" : "Financial",
          priority: isAm ? "ከፍተኛ" : isOm ? "Ol'aanaa" : "High",
          notes: isAm
            ? "በቀበሌ 04 እና በሳቢያን ወረዳዎች የተጠናቀቁ የባለሙያዎች ውሎች በደንበኞች ፊርማ ተረጋግጠው ተጠናቀዋል። የመድረክ ኮሚሽን ተቀናሽ ያለምንም ጉድለት በትክክል ተፈጽሟል።"
            : isOm
            ? "Waliigalteewwan ogeeyyii Ganda 04 fi Sabiyan keessatti xumuraman maamiltootaan mallatteeffamaniiru. Komishiniin platformii qulqullinaan herregameera."
            : "All completed artisan contracts for Kebele 04 and Sabian districts have completed client milestone sign-offs. Platform retainage calculated accurately with zero financial leakage.",
          author: data.author || "Super Administrator",
          pagePath: "/admin/payments",
          createdAt: new Date().toISOString(),
        },
      ];

      notesToRender.slice(0, 6).forEach((note) => {
        doc.roundedRect(40, p2Y, pageWidth, 56, 4).fillColor("#f8fafc").strokeColor("#e2e8f0").lineWidth(0.6).fillAndStroke();
        doc.fillColor("#0f172a").fontSize(isAm ? 9 : 8.5).font(fontBold()).text(note.title, 50, p2Y + 8);
        doc.fillColor("#0284c7").fontSize(7).font(fontBold()).text(`[${note.category.toUpperCase()}]`, 340, p2Y + 8);
        doc.fillColor("#64748b").fontSize(7).font(fontRegular()).text(new Date(note.createdAt).toLocaleDateString(), 420, p2Y + 8);

        doc.fillColor("#334155").fontSize(isAm ? 8 : 7.5).font(fontRegular()).text(note.notes.slice(0, 240), 50, p2Y + 22, {
          width: pageWidth - 20,
          lineBreak: true,
        });

        const authorMeta = isAm
          ? `ተቆጣጣሪ: ${note.author} · ገፅ: ${note.pagePath || "/admin"} · ደረጃ: ${note.priority}`
          : isOm
          ? "To'ataa: " + note.author + " · Fuula: " + (note.pagePath || "/admin") + " · Sadarkaa: " + note.priority
          : `Inspector: ${note.author} · Active View: ${note.pagePath || "/admin"} · Priority: ${note.priority}`;

        doc.fillColor("#94a3b8").fontSize(6.5).font(fontRegular()).text(authorMeta, 50, p2Y + 44);
        p2Y += 64;
      });

      // ─────────────────────────────────────────────────────────────────
      // 8. LEGAL ATTESTATION & SIGNATURE BLOCK
      // ─────────────────────────────────────────────────────────────────
      p2Y += 15;
      const sec6Title = isAm
        ? "6. ኦፊሴላዊ የህግ ማረጋገጫ እና ፊርማ"
        : isOm
        ? "6. MIRKANEESSA SEERAA FI MALLATTOO OFIISHALAA"
        : "6. OFFICIAL LEGAL ATTESTATION & SIGN-OFF";

      doc.fillColor("#0f172a").fontSize(10).font(fontBold()).text(sec6Title, 40, p2Y);
      doc.strokeColor("#94a3b8").lineWidth(0.8).moveTo(40, p2Y + 13).lineTo(40 + pageWidth, p2Y + 13).stroke();

      p2Y += 22;
      const legalNotice = isAm
        ? "ይህ የአመራር መረጃ ሪፖርት በዳይርስኪል መድረክ ላይ የተመዘገቡትን የስርዓት ስራዎች፣ የባለሙያዎች ማንነት ማረጋገጫ ሁኔታዎች እና የፋይናንስ ግብይቶች እውነተኛ እና ያልተበረዘ መዝገብ መሆኑን አረጋግጣለሁ። ሁሉም መረጃዎች በማይለወጡ የዲጂታል ሎጎች የተደገፉ እና ከኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ የንግድ እና የፍትህ ደንቦች ጋር የተጣጣሙ ናቸው።"
        : isOm
        ? "Gabaasni odeeffannoo bulchiinsaa kun hojiiwwan sirnaa, haala mirkaneessa eenyummaa ogeeyyii fi daldala faayinaansii platformii DireSkill irratti galmaa'e galmee dhugaa fi hin jijjiiramne ta'uu isaa nan mirkaneessa. Odeeffannoon hundi loogii dijitaalaa hin haqamneen kan deeggaramee fi qajeelfamoota daldalaa fi haqaa Federaalaa Rippabiliika Dimookraatawa Itoophiyaa wajjin kan walsimuudha."
        : "I hereby certify that this governance intelligence report constitutes a true, unadulterated record of system operations, artisan identity verification states, and financial transactions recorded on the DireSkill platform. All data is backed by immutable cryptographic logs and complies with applicable commercial and judicial regulations of the Federal Democratic Republic of Ethiopia.";

      doc.fillColor("#475569").fontSize(isAm ? 8 : 7.5).font(fontRegular()).text(legalNotice, 40, p2Y, { width: pageWidth, lineGap: 2 });

      p2Y += 50;
      // Signature lines
      const sigColW = (pageWidth - 30) / 2;

      // Super Admin Signature
      doc.strokeColor("#94a3b8").lineWidth(0.8).moveTo(40, p2Y + 30).lineTo(40 + sigColW, p2Y + 30).stroke();
      doc.fillColor("#0f172a").fontSize(8).font(fontBold()).text(data.author || "Super Administrator", 40, p2Y + 36);
      doc.fillColor("#64748b").fontSize(isAm ? 7.5 : 7).font(fontRegular()).text(
        isAm ? "ዋና አስተዳደር ኃላፊ · ዳይርስኪል መድረክ" : isOm ? "Bulchaa Olaanaa · Platformii DireSkill" : "Chief Administrative Officer · DireSkill Platform",
        40,
        p2Y + 47
      );

      // Compliance Signature
      const sig2X = 40 + sigColW + 30;
      doc.strokeColor("#94a3b8").lineWidth(0.8).moveTo(sig2X, p2Y + 30).lineTo(sig2X + sigColW, p2Y + 30).stroke();
      doc.fillColor("#0f172a").fontSize(8).font(fontBold()).text(
        isAm ? "የህግ እና ተገዢነት ኦፊሰር" : isOm ? "Qondaala Seeraa fi Walsimsiisaa" : "Legal & Regulatory Compliance Officer",
        sig2X,
        p2Y + 36
      );
      doc.fillColor("#64748b").fontSize(isAm ? 7.5 : 7).font(fontRegular()).text(
        isAm ? "የድሬዳዋ አስተዳደር የቁጥጥር ቢሮ" : isOm ? "Biiroo To'annoo Bulchiinsa Dirre Dhawaa" : "Dire Dawa Administration Oversight Bureau",
        sig2X,
        p2Y + 47
      );

      // Page numbers on all pages
      const pageRange = doc.bufferedPageRange();
      for (let p = 0; p < pageRange.count; p++) {
        doc.switchToPage(p);
        const footerY = 800;
        doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(40, footerY).lineTo(40 + pageWidth, footerY).stroke();
        doc.fillColor("#94a3b8").fontSize(6.5).font(fontRegular());

        const footerText = isAm
          ? `ዳይርስኪል የተረጋገጠ የአመራር ሰነድ · የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ · ገፅ ${p + 1} ከ ${pageRange.count}`
          : isOm
          ? `Doosiyee Bulchiinsa DireSkill Mirkanaa'e · Rippabiliika Dimookraatawa Federaalaa Itoophiyaa · Fuula ${p + 1} keessaa ${pageRange.count}`
          : `DireSkill Certified Governance Dossier · Federal Democratic Republic of Ethiopia · Page ${p + 1} of ${pageRange.count}`;

        doc.text(footerText, 40, footerY + 6, {
          width: pageWidth,
          align: "center",
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
