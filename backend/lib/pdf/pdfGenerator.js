/**
 * Soul Elements — PDF Report Generator
 * 
 * Generates professional BaZi PDF reports using PDFKit.
 * Dark-themed, A4, 12+ pages for Standard tier, 20+ for Grand Master.
 * 
 * Usage:
 *   const { generatePDF } = require('./lib/pdf/pdfGenerator');
 *   const pdfBuffer = await generatePDF(baziData, reportContent, tier);
 */

const PDFDocument = require('pdfkit');

// Brand colors (matching website theme)
const COLORS = {
  gold: '#C9A84C',
  goldLight: '#D4B85A',
  goldDark: '#A88930',
  blue: '#3B82F6',
  blueLight: '#60A5FA',
  blueDark: '#2563EB',
  bgDeep: '#07080A',
  bgSurface: '#0F1111',
  bgElevated: '#191A1B',
  textPrimary: '#F7F8F8',
  textSecondary: '#A0A3B1',
  textTertiary: '#6B6F80',
  textDim: '#434759',
  white: '#FFFFFF',
  black: '#000000',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  // Element colors
  woodColor: '#22C55E',
  fireColor: '#EF4444',
  earthColor: '#E8B84B',
  metalColor: '#94A3B8',
  waterColor: '#3B82F6',
};

const ELEMENT_COLORS = {
  'Wood': COLORS.woodColor,
  'Fire': COLORS.fireColor,
  'Earth': COLORS.earthColor,
  'Metal': COLORS.metalColor,
  'Water': COLORS.waterColor,
};

const FONT = {
  coverTitle: 28,
  coverBrand: 18,
  coverSubtitle: 11,
  pageTitle: 14,
  sectionHeader: 11,
  subSectionHeader: 9,
  body: 9,
  bodySmall: 7.5,
  caption: 6.5,
  meta: 6,
  footer: 6,
};

function buildText(doc, text, x, y, options = {}) {
  const sizes = {
    coverTitle: 28, coverBrand: 18, coverSubtitle: 11,
    pageTitle: 14, sectionHeader: 11, subSectionHeader: 9,
    body: 9, bodySmall: 7.5, caption: 6.5, meta: 6, footer: 6
  };
  const size = sizes[options.level] || sizes.body;
  const font = options.bold ? 'Helvetica-Bold' : (options.italic ? 'Helvetica-Oblique' : 'Helvetica');
  const finalFont = options.fontFamily || font;
  doc.fontSize(size).font(finalFont).fillColor(options.color || COLORS.textPrimary);
  doc.text(text, x, y, {
    width: options.width !== undefined ? options.width : (doc.page ? doc.page.width - 110 : 485),
    align: options.align || 'left',
    ...(options.letterSpacing ? { letterSpacing: options.letterSpacing } : {}),
    ...(options.textOpts || {}),
  });
}

/**
 * Generate a full BaZi report PDF
 * @param {Object} baziData - BaZi analysis data from baziEngine
 * @param {Object} reportContent - Text content from reportContent.js
 * @param {string} tier - 'standard' | 'grandmaster'
 * @returns {Buffer} PDF buffer
 */
function generatePDF(baziData, reportContent, tier = 'standard') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margins: { top: 50, bottom: 50, left: 55, right: 55 },
        info: {
          Title: 'Soul Elements — Destiny Audit Report',
          Author: 'Soul Elements',
          Subject: 'Ba Zi Four Pillars of Destiny',
          Keywords: 'bazi, four pillars, destiny, chinese astrology, soul elements',
        },
        bufferPages: true,
      });

      // Auto-format every page: dark bg, gold top bar
      // Catches auto-created overflow pages from doc.text()
      // Use hardcoded A4 dimensions (595x842 pts) to avoid accessing doc.page getter
      doc.on('pageAdded', () => {
        const A4_W = 595.28;
        const A4_H = 841.89;
        doc.rect(0, 0, A4_W, A4_H)
          .fill(COLORS.bgDeep);
        doc.rect(0, 0, A4_W, 2)
          .fill(COLORS.gold);
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Register fonts
      registerFonts(doc);

      // ============ BUILD PAGES ============
      buildCoverPage(doc, baziData, baziData.name, baziData.dob, baziData.sessionId);
      doc.addPage();
      buildDocumentStructure(doc, tier);
      doc.addPage();
      buildSectionDivider(doc, 1, 'Architectural Chart', 'Your Four Pillars of Destiny with complete stem/branch data');
      doc.addPage();
      buildArchitecturalChart(doc, baziData);
      doc.addPage();
      buildSectionDivider(doc, 2, 'Pillar Deep Analysis', 'Each of the four pillars analyzed individually');
      doc.addPage();
      buildFourPillarsDetail(doc, baziData);
      doc.addPage();
      buildSectionDivider(doc, 3, 'Elemental Distribution', 'Weighted five-element percentages with visual chart');
      doc.addPage();
      buildElementDistribution(doc, baziData, reportContent.elementAnalysis);
      doc.addPage();
      buildSectionDivider(doc, 4, 'Element Balance & Cycle', 'Generating and controlling cycle assessment');
      doc.addPage();
      buildElementBalance(doc, baziData, reportContent.fiveElementsInsight);
      doc.addPage();
      buildSectionDivider(doc, 5, 'Hidden Stems', 'Subconscious energies embedded in each earthly branch');
      doc.addPage();
      buildHiddenStems(doc, baziData, reportContent.hiddenStemsGuidance);
      doc.addPage();
      buildSectionDivider(doc, 6, 'Ten Deities', 'Energetic roles and relationships in your chart');
      doc.addPage();
      buildTenDeities(doc, baziData, reportContent.tenDeities);

      if (tier === 'grandmaster') {
        doc.addPage();
        buildSectionDivider(doc, 7, 'Luck Cycles', '10-Year luck cycles with detailed analysis of each pillar');
        doc.addPage();
        buildLuckCyclesDetail(doc, baziData, reportContent.daYun);
        doc.addPage();
        buildSectionDivider(doc, 8, 'Annual Energy Forecast', 'Year-by-year breakdown from 2025 to 2030');
        doc.addPage();
        buildAnnualForecastGrandMaster(doc, baziData, reportContent.annualForecast);
        doc.addPage();
        buildSectionDivider(doc, 9, 'Na Yin & Shen Sha', 'Musical note energy and divine star influences');
        doc.addPage();
        buildNaYinShenSha(doc, baziData);
        doc.addPage();
        buildSectionDivider(doc, 10, 'Personality Profile', 'Comprehensive personality assessment based on your chart');
        doc.addPage();
        buildPersonalityProfile(doc, baziData, reportContent.personality);
        doc.addPage();
        buildSectionDivider(doc, 11, 'Career & Wealth Strategy', 'Optimized career direction and wealth potential analysis');
        doc.addPage();
        buildCareerStrategy(doc, baziData, reportContent.lifeGuidance);
      } else {
        doc.addPage();
        buildSectionDivider(doc, 7, 'Luck Cycles Overview', '10-Year luck cycle summary');
        doc.addPage();
        buildLuckCycles(doc, baziData, reportContent.daYun);
        doc.addPage();
        buildSectionDivider(doc, 8, 'Annual Energy Forecast', 'Year-by-year analysis (2025-2030)');
        doc.addPage();
        buildAnnualForecast(doc, baziData, reportContent.annualForecast);
      }

      const remediationCh = tier === 'grandmaster' ? 12 : 9;
      const affirmationCh = tier === 'grandmaster' ? 13 : 10;
      const appendixStartCh = tier === 'grandmaster' ? 14 : 11;

      doc.addPage();
      buildSectionDivider(doc, remediationCh, 'Remediation Guide', 'Adjustments, colors, and lifestyle recommendations');
      doc.addPage();
      buildRemediationGuide(doc, baziData);
      doc.addPage();
      buildSectionDivider(doc, affirmationCh, 'Your Affirmation', 'A personalized destiny affirmation for your journey');
      doc.addPage();
      buildPersonalAffirmation(doc, baziData, reportContent.personalAffirmation);

      // Premium appendices
      doc.addPage();
      buildSectionDivider(doc, appendixStartCh, 'Element Reference Guide', 'The five elements and their correspondences');
      doc.addPage();
      buildAppendixElementReference(doc);

      doc.addPage();
      buildSectionDivider(doc, appendixStartCh + 1, 'Reading Your Chart', 'How to interpret your Ba Zi Four Pillars chart');
      doc.addPage();
      buildAppendixReadingGuide(doc);

      doc.addPage();
      buildSectionDivider(doc, appendixStartCh + 2, 'Glossary', 'Key terms and concepts explained');
      doc.addPage();
      buildGlossary(doc);

      doc.addPage();
      buildClosingPage(doc);

      buildFooter(doc);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Register fonts for the PDF
 */
function registerFonts(doc) {
  // Use PDFKit built-in fonts - Helvetica for UI, Courier for mono
  // For Railway Hobby plan, we rely on built-in PDF fonts
  // To add custom fonts (Inter, Playfair), bundle .ttf files and update paths below
  // Built-in fonts are referenced directly via doc.font('Helvetica') etc.
  // No registration needed for built-in PDF fonts

  // Note on CJK / Chinese character rendering:
  // The built-in Helvetica font does NOT include CJK glyphs. However,
  // all pillar data is stored in English (stemEn/branchEn fields like
  // "Jia", "Zi", "Rat"), so Chinese characters (甲子 etc.) are not
  // rendered in the PDF output. If CJK rendering is ever needed,
  // embed a font file (e.g., NotoSansSC-Regular.ttf) as:
  //   doc.registerFont('CJK', 'path/to/NotoSansSC-Regular.ttf');
  // and use doc.font('CJK') for text that may contain CJK characters.
}

/**
 * Draw a Tai Chi (Yin-Yang) symbol
 */
function drawTaiChi(doc, cx, cy, radius, rotation = 0) {
  const r = radius;
  const smallR = r / 2;
  const dotR = r / 6;

  // Save state
  doc.save();

  // Apply rotation if needed
  if (rotation !== 0) {
    // Note: PDFKit doesn't support direct rotation, so we manually transform points
    // For simplicity, we'll draw without rotation or use coordinate transforms
  }

  // Outer circle (border)
  doc.circle(cx, cy, r)
    .lineWidth(1)
    .strokeColor(COLORS.gold + '60')
    .stroke();

  // Yin (dark) half - left side
  doc.path(`M ${cx} ${cy - r}
    A ${r} ${r} 0 0 1 ${cx} ${cy + r}
    A ${smallR} ${smallR} 0 0 0 ${cx} ${cy}
    A ${smallR} ${smallR} 0 0 1 ${cx} ${cy - r}
    Z`)
    .fillColor(COLORS.bgSurface)
    .fill();

  // Yang (light/gold) half - right side
  doc.path(`M ${cx} ${cy - r}
    A ${r} ${r} 0 0 0 ${cx} ${cy + r}
    A ${smallR} ${smallR} 0 0 1 ${cx} ${cy}
    A ${smallR} ${smallR} 0 0 0 ${cx} ${cy - r}
    Z`)
    .fillColor(COLORS.gold + '40')
    .fill();

  // Yang dot (gold dot in dark half)
  doc.circle(cx, cy - smallR, dotR)
    .fillColor(COLORS.gold)
    .fill();

  // Yin dot (dark dot in light half)
  doc.circle(cx, cy + smallR, dotR)
    .fillColor(COLORS.bgDeep)
    .fill();

  // Restore state
  doc.restore();
}

/**
 * Draw decorative mystical border
 */
function drawMysticalBorder(doc, x, y, width, height) {
  const cornerSize = 15;
  const lineWidth = 0.5;

  // Set line style
  doc.lineWidth(lineWidth)
    .strokeColor(COLORS.gold + '40');

  // Top-left corner
  doc.moveTo(x, y + cornerSize)
    .lineTo(x, y)
    .lineTo(x + cornerSize, y)
    .stroke();

  // Top-right corner
  doc.moveTo(x + width - cornerSize, y)
    .lineTo(x + width, y)
    .lineTo(x + width, y + cornerSize)
    .stroke();

  // Bottom-right corner
  doc.moveTo(x + width, y + height - cornerSize)
    .lineTo(x + width, y + height)
    .lineTo(x + width - cornerSize, y + height)
    .stroke();

  // Bottom-left corner
  doc.moveTo(x + cornerSize, y + height)
    .lineTo(x, y + height)
    .lineTo(x, y + height - cornerSize)
    .stroke();

  // Corner decorative dots
  const dotRadius = 1.5;
  doc.circle(x + cornerSize/2, y + cornerSize/2, dotRadius)
    .fillColor(COLORS.gold + '60')
    .fill();
  doc.circle(x + width - cornerSize/2, y + cornerSize/2, dotRadius)
    .fillColor(COLORS.gold + '60')
    .fill();
  doc.circle(x + width - cornerSize/2, y + height - cornerSize/2, dotRadius)
    .fillColor(COLORS.gold + '60')
    .fill();
  doc.circle(x + cornerSize/2, y + height - cornerSize/2, dotRadius)
    .fillColor(COLORS.gold + '60')
    .fill();
}

/**
 * Draw decorative divider with Tai Chi motif
 */
function drawTaiChiDivider(doc, x, y, width) {
  const centerX = x + width / 2;

  // Left line
  doc.moveTo(x, y)
    .lineTo(centerX - 20, y)
    .strokeColor(COLORS.gold + '50')
    .lineWidth(0.5)
    .stroke();

  // Right line
  doc.moveTo(centerX + 20, y)
    .lineTo(x + width, y)
    .stroke();

  // Mini Tai Chi in center
  drawTaiChi(doc, centerX, y, 8);
}

// ============================================================
// PAGE BUILDERS
// ============================================================

/**
 * COVER PAGE — Enhanced with Tai Chi and mystical elements
 */
function buildCoverPage(doc, data, name, dob, sessionId) {
  const { bazi } = data;
  const pageH = doc.page.height;
  const pageW = doc.page.width;

  // Dark background with subtle gradient effect
  doc.rect(0, 0, pageW, pageH)
    .fill(COLORS.bgDeep);

  // Decorative mystical border
  drawMysticalBorder(doc, 40, 40, pageW - 80, pageH - 80);

  // Large background Tai Chi symbol (watermark)
  drawTaiChi(doc, pageW - 100, pageH - 120, 60);
  drawTaiChi(doc, 80, pageH - 150, 40);

  // Top gold bar with gradient effect
  doc.rect(0, 0, pageW, 4)
    .fill(COLORS.gold);

  // Decorative corner Tai Chi symbols
  drawTaiChi(doc, 50, 80, 12);
  drawTaiChi(doc, pageW - 50, 80, 12);

  // Title section with elegant typography
  doc.fontSize(18)
    .font('Helvetica')
    .fillColor(COLORS.gold + '80')
    .text('◈  SOUL ELEMENTS  ◈', 55, 140, { align: 'center', width: pageW - 110 });

  doc.fontSize(28)
    .font('Helvetica-Bold')
    .fillColor(COLORS.textPrimary)
    .text('Destiny Audit', 55, 175, { align: 'center', width: pageW - 110 });

  // Tai Chi divider under title
  drawTaiChiDivider(doc, 100, 220, pageW - 200);

  // Subtitle
  doc.fontSize(10)
    .font('Helvetica-Oblique')
    .fillColor(COLORS.textSecondary)
    .text('A Complete Ba Zi Four Pillars Analysis', 55, 245, { align: 'center', width: pageW - 110 });

  // Day Master info card
  if (bazi?.dayMaster) {
    const dm = bazi.dayMaster;
    const cardY = 290;
    const cardHeight = 70;

    // Card background
    doc.roundedRect(80, cardY, pageW - 160, cardHeight, 5)
      .fillColor(COLORS.bgSurface + '60')
      .fill()
      .strokeColor(COLORS.gold + '30')
      .stroke();

    // Card content
    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.gold)
      .text('DAY MASTER', 95, cardY + 12);

    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(COLORS.textPrimary)
      .text(`${dm.en || dm.element || 'Unknown'}`, 95, cardY + 30);

    doc.fontSize(9)
      .font('Helvetica-Oblique')
      .fillColor(COLORS.textSecondary)
      .text(`${dm.polarity || ''} ${dm.element || ''} — ${dm.archetype || 'The Mystic'}`, 95, cardY + 52);

    // Element color indicator
    const elemColor = ELEMENT_COLORS[transformElement(dm.element)] || COLORS.gold;
    doc.circle(pageW - 115, cardY + 35, 8)
      .fillColor(elemColor + '40')
      .fill()
      .strokeColor(elemColor)
      .stroke();

    // Date of birth below the Day Master card
    if (dob) {
      doc.fontSize(6.5)
        .font('Helvetica')
        .fillColor(COLORS.textTertiary)
        .text(`Date of Birth: ${dob}`, 95, cardY + cardHeight + 10);
    }
  }

  // Tier badge
  const tierText = (data.tier || 'Standard').toUpperCase();
  const badgeY = bazi?.dayMaster ? 380 : 320;

  // Badge background
  doc.roundedRect(pageW/2 - 50, badgeY, 100, 22, 11)
    .fillColor(COLORS.gold + '15')
    .fill()
    .strokeColor(COLORS.gold + '40')
    .stroke();

  doc.fontSize(7)
    .font('Helvetica-Bold')
    .fillColor(COLORS.gold)
    .text(tierText + ' EDITION', pageW/2 - 50, badgeY + 7, { width: 100, align: 'center' });

  // Prepared for [name] — below tier badge
  if (name) {
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(`Prepared for ${name}`, 55, badgeY + 30, { align: 'center', width: pageW - 110 });
  }

  // Four Pillars Mini Display
  if (bazi?.pillars) {
    buildMiniPillars(doc, bazi.pillars, 80, 430);
  }

  // Confidential text
  doc.fontSize(7)
    .font('Helvetica')
    .fillColor(COLORS.textTertiary)
    .text('◈  CONFIDENTIAL — For personal use only  ◈', 55, pageH - 80, { align: 'center', width: pageW - 110 });

  // Session ID at the very bottom
  if (sessionId) {
    doc.fontSize(5.5)
      .font('Helvetica')
      .fillColor(COLORS.textDim)
      .text(`Session: ${sessionId}`, 55, pageH - 64, { align: 'center', width: pageW - 110 });
  }

  // Bottom gold bar
  doc.rect(0, pageH - 4, pageW, 4)
    .fill(COLORS.gold);

  // Small Tai Chi at bottom center
  drawTaiChi(doc, pageW / 2, pageH - 50, 10);
}

/**
 * DOCUMENT STRUCTURE PAGE
 */
function buildDocumentStructure(doc, tier) {
  const pageW = doc.page.width;
  const isGrandMaster = tier === 'grandmaster';

  // Dark bg
  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);

  // Top gold bar
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text('DOCUMENT STRUCTURE', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(isGrandMaster ? 'Grand Master Edition — 38 Page Breakdown' : 'Standard Edition — 33 Page Breakdown', 55, 82);

  const sections = isGrandMaster ? [
    { page: '3', title: 'Architectural Chart', desc: 'Your Four Pillars with complete stem/branch data and elemental energy scoring.' },
    { page: '5-6', title: 'Pillar Deep Analysis', desc: 'Each of the four pillars analyzed individually with day master insight.' },
    { page: '8', title: 'Elemental Distribution', desc: 'Weighted five-element percentages with visual distribution chart.' },
    { page: '10', title: 'Element Balance & Cycle', desc: 'Generating and controlling cycle assessment with balance score.' },
    { page: '12', title: 'Hidden Stems', desc: 'Subconscious energies embedded in each earthly branch.' },
    { page: '14', title: 'Ten Deities', desc: 'Energetic roles and relationships in your chart.' },
    { page: '16-17', title: 'Luck Cycles', desc: '10-Year luck cycles with detailed analysis of each pillar.' },
    { page: '19-21', title: 'Annual Energy Forecast', desc: 'Year-by-year breakdown from 2025 to 2030.' },
    { page: '23', title: 'Na Yin & Shen Sha', desc: 'Musical note energy and divine star influences.' },
    { page: '25-26', title: 'Personality Profile', desc: 'Comprehensive personality assessment based on your chart.' },
    { page: '28-29', title: 'Career & Wealth Strategy', desc: 'Optimized career direction and wealth potential analysis.' },
    { page: '31', title: 'Remediation Guide', desc: 'Adjustments, colors, directions, and lifestyle recommendations.' },
    { page: '33', title: 'Personal Affirmation', desc: 'Your customized destiny affirmation.' },
    { page: '35', title: 'Appendix A: Element Reference', desc: 'Complete guide to the five elements and their correspondences.' },
    { page: '36-37', title: 'Appendix B: Reading Your Chart', desc: 'How to interpret your Ba Zi Four Pillars chart.' },
    { page: '39-40', title: 'Glossary', desc: 'Key Ba Zi terms and concepts explained.' },
  ] : [
    { page: '3', title: 'Architectural Chart', desc: 'Your Four Pillars with stem/branch data and elemental scores.' },
    { page: '5-6', title: 'Pillar Deep Analysis', desc: 'Each pillar analyzed individually with day master insight.' },
    { page: '8', title: 'Elemental Distribution', desc: 'Five-element percentages with distribution bar chart.' },
    { page: '10', title: 'Element Balance & Cycle', desc: 'Element cycle assessment with balance insights.' },
    { page: '12', title: 'Hidden Stems', desc: 'Subconscious energies in each earthly branch.' },
    { page: '14', title: 'Ten Deities', desc: 'Energetic roles and relationships.' },
    { page: '16', title: 'Luck Cycles Overview', desc: '10-Year luck cycle summary.' },
    { page: '18-19', title: 'Annual Energy Forecast', desc: 'Year-by-year analysis (2025-2030).' },
    { page: '21', title: 'Remediation Guide', desc: 'Favorable directions, colors, and adjustments.' },
    { page: '23', title: 'Personal Affirmation', desc: 'Your customized destiny affirmation.' },
    { page: '25', title: 'Appendix A: Element Reference', desc: 'Complete guide to the five elements and their correspondences.' },
    { page: '26-27', title: 'Appendix B: Reading Your Chart', desc: 'How to interpret your Ba Zi Four Pillars chart.' },
    { page: '29-30', title: 'Glossary', desc: 'Key Ba Zi terms and concepts explained.' },
  ];

  let yPos = 115;
  sections.forEach((section, i) => {
    const boxBg = i % 2 === 0 ? COLORS.bgSurface : COLORS.bgElevated;
    doc.rect(55, yPos - 8, doc.page.width - 110, 28)
      .fill(boxBg);

    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(`PAGE ${section.page}`, 65, yPos);

    doc.fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.gold)
      .text(section.title, 65, yPos + 11);

    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(section.desc, 175, yPos + 11, { width: doc.page.width - 290 });

    yPos += 32;
  });
}

/**
 * ARCHITECTURAL CHART PAGE
 */
function buildArchitecturalChart(doc, data) {
  const pageW = doc.page.width;
  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('ARCHITECTURAL CHART', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Four Pillars of Destiny — Each pillar reveals a different life dimension.', 55, 82);

  const { pillars, dayMaster } = data.bazi || {};
  if (!pillars) return;

  const pillarData = [
    { name: 'YEAR', key: 'year', dimension: 'Family & Heritage', pos: 110 },
    { name: 'MONTH', key: 'month', dimension: 'Career & Society', pos: 110 },
    { name: 'DAY', key: 'day', dimension: 'Self & Relationship', pos: 110 },
    { name: 'HOUR', key: 'hour', dimension: 'Legacy & Inner Self', pos: 110 },
  ];

  const pillarWidth = (doc.page.width - 160) / 4;

  doc.fontSize(6.5)
.font('Helvetica')
    .fillColor(COLORS.gold);

  pillarData.forEach((p, i) => {
    const px = 55 + i * (pillarWidth + 15);
    const pillar = pillars[p.key];
    if (!pillar) return;

    // Pillar box
    doc.roundedRect(px, p.pos, pillarWidth, 80, 4)
      .fillColor(COLORS.bgElevated)
      .fill()
      .strokeColor(COLORS.gold)
      .lineWidth(0.5)
      .stroke();

    // Header
    doc.rect(px, p.pos, pillarWidth, 18)
      .fillColor(COLORS.goldDark + '40');

    doc.fontSize(6)
.font('Helvetica')
      .fillColor(COLORS.gold)
      .text(p.name, px + 5, p.pos + 4, { width: pillarWidth - 10 });

    // Stem
    const stemColor = ELEMENT_COLORS[transformElement(pillar.stemElement)] || COLORS.textPrimary;
    doc.fontSize(10)
.font('Helvetica')
      .fillColor(stemColor)
      .text(pillar.stemEn || '', px + 5, p.pos + 25);

    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(pillar.stemElement || '', px + pillarWidth / 2, p.pos + 30, { width: pillarWidth / 2 - 10 });

    // Branch
    doc.fontSize(10)
.font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(pillar.animal || pillar.branchEn || '', px + 5, p.pos + 45);

    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(pillar.branchEn || '', px + pillarWidth / 2, p.pos + 48, { width: pillarWidth / 2 - 10 });

    // Dimension label below box
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(p.dimension, px, p.pos + 90, { width: pillarWidth, align: 'center' });
  });

  // Day Master Highlight
  const yDM = 230;
  doc.roundedRect(55, yDM, pageW - 110, 50, 6)
    .fillColor(COLORS.gold + '15')
    .strokeColor(COLORS.gold)
    .lineWidth(0.5)
    .stroke();

  doc.fontSize(7)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('DAY MASTER', 72, yDM + 10);

  if (dayMaster) {
    doc.fontSize(9)
.font('Helvetica')
      .fillColor(ELEMENT_COLORS[transformElement(dayMaster.element)] || COLORS.textPrimary)
      .text(`${dayMaster.en} (${dayMaster.element} ${dayMaster.polarity || ''})`, 72, yDM + 26);

    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(dayMaster.archetype || '', 200, yDM + 28, { width: pageW - 270 });
  }

  // Element scores bar chart
  if (data.bazi?.fiveElements?.chart || data.bazi?.fiveElements?.percentages) {
    // Element scores inline - prefer chart, fallback to percentages
    const chart = data.bazi.fiveElements.chart || data.bazi.fiveElements.percentages;
    const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
    let yPos = 310;

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.gold)
      .text('ELEMENT PROPORTIONS', 55, yPos);

    yPos += 20;
    elements.forEach((elem, i) => {
      const pct = chart[elem] || 0;
      const barW = Math.max(3, (pct / 100) * (pageW - 200));
      const barY = yPos + i * 20;

      doc.fontSize(6)
        .font('Helvetica')
        .fillColor(COLORS.textSecondary)
        .text(elem, 55, barY + 2);

      doc.rect(100, barY, pageW - 200, 12)
        .fillColor(COLORS.bgElevated);
      doc.rect(100, barY, barW, 12)
        .fillColor(ELEMENT_COLORS[elem] || COLORS.gold);

      doc.fontSize(6)
.font('Helvetica')
        .fillColor(COLORS.textPrimary)
        .text(`${pct}%`, 100 + barW + 5, barY + 1);
    });
  }
}

/**
 * FOUR PILLARS DETAIL PAGE
 */
function buildFourPillarsDetail(doc, data) {
  const pageW = doc.page.width;
  const { pillars, dayMaster } = data.bazi || {};
  if (!pillars) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('PILLAR DEEP ANALYSIS', 55, 58, { letterSpacing: 0.15 });

  const pillarList = [
    { name: 'Year Pillar', key: 'year', desc: 'Family heritage, early environment, and foundational influences.' },
    { name: 'Month Pillar', key: 'month', desc: 'Career path, social standing, and professional life.' },
    { name: 'Day Pillar', key: 'day', desc: 'Your core self, relationship style, and inner nature.' },
    { name: 'Hour Pillar', key: 'hour', desc: 'Legacy, later years, inner world, and hidden talents.' },
  ];

  let yPos = 105;
  pillarList.forEach((p) => {
    const pillar = pillars[p.key];
    if (!pillar) return;

    // Pillar header
    doc.roundedRect(55, yPos, pageW - 110, 40, 4)
      .fillColor(COLORS.bgElevated)
      .strokeColor(COLORS.gold + '30')
      .lineWidth(0.5)
      .stroke();

    const stemColor = ELEMENT_COLORS[transformElement(pillar.stemElement)] || COLORS.textPrimary;
    doc.fontSize(8)
.font('Helvetica')
      .fillColor(COLORS.gold)
      .text(p.name, 70, yPos + 6);

    doc.fontSize(7)
.font('Helvetica')
      .fillColor(stemColor)
      .text(`${pillar.stemEn || ''} (${pillar.stemElement || ''})`, 70, yPos + 21);

    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(`${pillar.animal || pillar.branchEn || ''}`, 190, yPos + 21);

    doc.fontSize(6)
.font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(p.desc, 280, yPos + 10, { width: pageW - 350 });

    yPos += 48;
  });

  // Day Master detailed box
  if (dayMaster) {
    yPos += 5;
    doc.rect(55, yPos, pageW - 110, 1)
      .fillColor(COLORS.gold + '30');

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.gold)
      .text('DAY MASTER DEEP ANALYSIS', 55, yPos + 15);

    const dmColor = ELEMENT_COLORS[transformElement(dayMaster.element)] || COLORS.textPrimary;
    doc.fontSize(10)
.font('Helvetica')
      .fillColor(dmColor)
      .text(`${dayMaster.en} (${dayMaster.element} ${dayMaster.polarity || ''})`, 55, yPos + 35);

    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(dayMaster.archetype || '', 55, yPos + 55);

    if (dayMaster.keywords) {
      doc.fontSize(7)
        .font('Helvetica')
        .fillColor(COLORS.textTertiary)
        .text(dayMaster.keywords, 55, yPos + 72, { width: pageW - 110 });
    }
  }
}

/**
 * ELEMENT DISTRIBUTION PAGE
 */
function buildElementDistribution(doc, data, content) {
  const pageW = doc.page.width;
  const chart = data.bazi?.fiveElements?.chart || data.bazi?.fiveElements?.percentages || data.bazi?.fullElements?.percentages;
  if (!chart) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('ELEMENTAL DISTRIBUTION', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Five Elements with Weighted Percentages', 55, 82);

  const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

  // Horizontal bar chart
  const barX = 100;
  const barMaxWidth = pageW - 200;
  const barY = 130;
  const barHeight = 22;
  const gap = 32;

  elements.forEach((elem, i) => {
    const pct = chart[elem] || 0;
    const barW = Math.max(3, (pct / 100) * barMaxWidth);

    const y = barY + i * gap;

    // Label
    doc.fontSize(7)
.font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(elem, 55, y + 4);

    // Bar background
    doc.rect(barX, y, barMaxWidth, barHeight)
      .fillColor(COLORS.bgElevated);

    // Bar fill
    doc.rect(barX, y, barW, barHeight)
      .fillColor(ELEMENT_COLORS[elem]);

    // Percentage
    doc.fontSize(7)
.font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(`${pct}%`, barX + barW + 8, y + 4);
  });

  // Legend
  const legendY = barY + 5 * gap + 25;
  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text('ELEMENT PROPORTIONS', 55, legendY);

  const elementDescriptions = {
    'Wood': 'Growth, creativity, expansion',
    'Fire': 'Passion, charisma, transformation',
    'Earth': 'Stability, nurturing, foundation',
    'Metal': 'Structure, precision, discipline',
    'Water': 'Wisdom, intuition, depth',
  };

  elements.forEach((elem, i) => {
    const y = legendY + 18 + i * 16;
    doc.rect(55, y, 6, 6)
      .fillColor(ELEMENT_COLORS[elem]);
    doc.fontSize(6.5)
.font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(elem, 68, y - 1.5);
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(elementDescriptions[elem], 110, y - 1, { width: 250 });
  });

  // Render element analysis content from reportContent if available
  if (content && content.details) {
    const analysisY = legendY + 18 + 5 * 16 + 15;
    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.blue)
      .text('ELEMENT ANALYSIS', 55, analysisY);

    let ay = analysisY + 20;
    const elemKeys = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
    elemKeys.forEach(elem => {
      const detail = content.details[elem];
      if (detail) {
        doc.fontSize(6.5)
          .font('Helvetica')
          .fillColor(COLORS.textSecondary)
          .text(detail, 55, ay, { width: pageW - 110 });
        ay += doc.heightOfString(detail, { width: pageW - 110 }) + 8;
      }
    });
  }
}

/**
 * ELEMENT BALANCE PAGE
 */
function buildElementBalance(doc, data, content) {
  const pageW = doc.page.width;
  const chart = data.bazi?.fiveElements?.chart || data.bazi?.fiveElements?.percentages || data.bazi?.fullElements?.percentages;
  if (!chart) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('ELEMENT BALANCE & CYCLE ANALYSIS', 55, 58, { letterSpacing: 0.15 });

  // Generating Cycle
  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(COLORS.blue)
    .text('GENERATING CYCLE', 55, 100, { letterSpacing: 0.1 });

  doc.fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Each element gives birth to the next: Wood → Fire → Earth → Metal → Water → Wood', 55, 118);

  // Visual generating cycle
  drawCycleDiagram(doc, 55, 140, [
    { label: 'Wood', color: COLORS.woodColor },
    { label: 'Fire', color: COLORS.fireColor },
    { label: 'Earth', color: COLORS.earthColor },
    { label: 'Metal', color: COLORS.metalColor },
    { label: 'Water', color: COLORS.waterColor },
  ], chart);

  // Controlling Cycle
  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(COLORS.error)
    .text('CONTROLLING CYCLE', 55, 360, { letterSpacing: 0.1 });

  doc.fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Each element controls another: Wood → Earth → Water → Fire → Metal → Wood', 55, 378);

  drawCycleDiagram(doc, 55, 398, [
    { label: 'Wood', color: COLORS.woodColor },
    { label: 'Earth', color: COLORS.earthColor },
    { label: 'Water', color: COLORS.waterColor },
    { label: 'Fire', color: COLORS.fireColor },
    { label: 'Metal', color: COLORS.metalColor },
  ], chart);

  // Render fiveElementsInsight text from reportContent — flowing across pages
  if (content) {
    writeFlowingDetail(doc, content, 55, pageW - 110, { 
      gap: 20, color: COLORS.textSecondary, fontSize: 7,
      minY: 580,
    });
  }
}

/**
 * HIDDEN STEMS PAGE
 */
function buildHiddenStems(doc, data, content) {
  const pageW = doc.page.width;
  const hiddenStems = data.bazi?.hiddenStems;
  if (!hiddenStems) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('HIDDEN STEMS', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Subconscious energies embedded in every earthly branch.', 55, 82);

  let yPos = 120;
  const positions = ['year', 'month', 'day', 'hour'];

  positions.forEach((pos) => {
    const hs = hiddenStems[pos];
    if (!hs) return;

    // Branch header
    doc.roundedRect(55, yPos, pageW - 110, 22, 3)
      .fillColor(COLORS.bgElevated)
      .strokeColor(COLORS.gold + '20')
      .lineWidth(0.5)
      .stroke();

    doc.fontSize(8)
.font('Helvetica')
      .fillColor(COLORS.gold)
      .text(`${pos.toUpperCase()} PILLAR — ${hs.branchEn || ''}`, 70, yPos + 5);

    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(`Animal: ${hs.hiddenStems?.[0]?.element || ''}`, 300, yPos + 5);

    yPos += 32;

    // Hidden stems detail
    const stems = hs.hiddenStems || [];
    stems.forEach((stem, i) => {
      const depthLabels = { main: 'Main', secondary: 'Secondary', residual: 'Residual' };
      const stemColor = ELEMENT_COLORS[transformElement(stem.element)] || COLORS.textPrimary;

      doc.roundedRect(70, yPos, pageW - 140, 18, 2)
        .fillColor(COLORS.bgSurface);

      doc.fontSize(6)
.font('Helvetica')
        .fillColor(stemColor)
        .text(`${stem.stemEn || ''} — ${stem.element}`, 82, yPos + 4);

      doc.fontSize(6)
        .font('Helvetica')
        .fillColor(COLORS.textTertiary)
        .text(depthLabels[stem.depth] || stem.depth, 250, yPos + 4);

      yPos += 22;
    });

    yPos += 10;
  });

  // Hidden stems explanation - use reportContent if available
  yPos = Math.max(yPos + 10, 400);
  if (content && content.intro) {
    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.blue)
      .text('WHAT ARE HIDDEN STEMS?', 55, yPos);

    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(content.intro, 55, yPos + 18, { width: pageW - 110 });
  } else {
    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.blue)
      .text('WHAT ARE HIDDEN STEMS?', 55, yPos);

    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(
        'Hidden Stems (藏干) are the internal energies contained within each Earthly Branch. ' +
        'While the branch represents the surface expression, the hidden stems reveal deeper, ' +
        'subconscious influences. Each branch contains 1-3 hidden stems ranked by depth: ' +
        'main (primary energy), secondary (supporting energy), and residual (subtle influence).',
        55, yPos + 18,
        { width: pageW - 110 }
      );
  }

  // Expanded hidden stems guidance flowing across pages
  if (content && content.positions) {
    const detailText = content.positions.map(p => 
      `The ${p.position.toUpperCase()} Pillar (${p.animal}):\n${p.hiddenStems.map(s => `- ${s.name} (${s.element}, ${s.depth}): ${s.meaning}`).join('\n')}`
    ).join('\n\n');
    writeFlowingDetail(doc, 
      `${content.intro}\n\n${detailText}\n\n${content.conclusion || ''}`,
      55, pageW - 110, { gap: 15, fontSize: 6.5 });
  }
}

/**
 * TEN DEITIES PAGE
 */
function buildTenDeities(doc, data, content) {
  const pageW = doc.page.width;
  const tenDeities = data.bazi?.tenDeities;
  if (!tenDeities) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('TEN DEITIES ANALYSIS', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(content && content.intro ? content.intro : 'Energetic roles played by each pillar in relation to the Day Master.', 55, 82);

  let yPos = 120;
  const positions = ['year', 'month', 'day', 'hour'];

  positions.forEach((pos) => {
    const deity = tenDeities[pos];
    if (!deity) return;

    const deityColor = deity.tenGodCn === '元男' || deity.tenGodCn === '元女' ? COLORS.gold : COLORS.textPrimary;

    doc.roundedRect(55, yPos, pageW - 110, 45, 4)
      .fillColor(COLORS.bgElevated)
      .strokeColor(COLORS.gold + '15')
      .lineWidth(0.5)
      .stroke();

    doc.fontSize(8)
.font('Helvetica')
      .fillColor(COLORS.gold)
      .text(`${pos.toUpperCase()} PILLAR`, 70, yPos + 6);

    doc.fontSize(8)
.font('Helvetica')
      .fillColor(deityColor)
      .text(deity.tenGodEn || 'The Self (Day Master)', 70, yPos + 22, { width: 230 });

    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(`${deity.stemEn || ''} (${deity.element || ''}, ${deity.polarity || ''})`, 290, yPos + 22);

    if (deity.tenGodSubtitle) {
      doc.fontSize(6)
.font('Helvetica')
        .fillColor(COLORS.textTertiary)
        .text(deity.tenGodSubtitle, 70, yPos + 35, { width: pageW - 140 });
    }

    yPos += 55;
  });

  // Legend
  yPos = Math.max(yPos + 10, 400);
  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text('DEITY RELATIONSHIP TYPES', 55, yPos);

  const deityLegend = [
    { name: 'Peer / Competitor', desc: 'Same element as Day Master' },
    { name: 'Creator / Rebel Genius', desc: 'Element generated by Day Master' },
    { name: 'Warrior / Authority', desc: 'Element controlled by Day Master' },
    { name: 'Mystic / Guardian', desc: 'Element that generates Day Master' },
    { name: 'Steward / Entrepreneur', desc: 'Element that controls Day Master' },
  ];

  deityLegend.forEach((item, i) => {
    const ly = yPos + 18 + i * 14;
    doc.rect(55, ly, 6, 6)
      .fillColor(COLORS.gold + '40');
    doc.fontSize(6)
.font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(item.name, 68, ly - 1.5);
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(item.desc, 210, ly - 1, { width: 200 });
  });

  // Expanded Ten Deities analysis flowing across pages
  if (content && content.conclusion) {
    const detailText = content.deities.map(d => 
      `${d.position.toUpperCase()} Pillar — ${d.name}:\n${d.meaning}\n`
    ).join('\n');
    writeFlowingDetail(doc, 
      `${content.intro}\n\n${detailText}\n${content.conclusion}`,
      55, doc.page.width - 110, { gap: 15, fontSize: 6.5 });
  }
}

/**
 * LUCK CYCLES (Standard)
 */
function buildLuckCycles(doc, data, content) {
  const pageW = doc.page.width;
  const daYun = data.bazi?.daYun;
  if (!daYun) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('LUCK CYCLES OVERVIEW', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(`10-Year Chapters of Destiny — Starting at age ${daYun.startingAge}`, 55, 82);

  // Starting age info - use reportContent intro if available
  if (content && content.intro) {
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(content.intro, 55, 105, { width: pageW - 110 });
  } else if (daYun.calculationDetail || daYun.jieqiDetail) {
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(
        `You begin your first luck cycle at age ${Math.round(daYun.startingAge)}. ` +
        `${daYun.calculationDetail.daysToJie} days from birth to the next jie (${daYun.calculationDetail.jieName}), divided by 3. ` +
        `Direction: ${daYun.direction}.`,
        55, 105,
        { width: pageW - 110 }
      );
  }

  // Luck pillars table
  const pillars = daYun.pillars || [];
  const tableX = 55;
  const tableY = 145;
  const colW = (pageW - 130) / 5;
  const rowH = 22;

  // Header
  const headers = ['Cycle', 'Age', 'Stem', 'Branch', 'Element'];
  doc.rect(tableX, tableY, pageW - 110, 18)
    .fillColor(COLORS.gold + '30');

  headers.forEach((h, i) => {
    doc.fontSize(6.5)
.font('Helvetica')
      .fillColor(COLORS.gold)
      .text(h, tableX + 5 + i * colW, tableY + 4, { width: colW - 10 });
  });

  // Rows
  pillars.forEach((p, i) => {
    const rowY = tableY + 18 + i * rowH;
    const bgColor = i % 2 === 0 ? COLORS.bgElevated : COLORS.bgSurface;

    doc.rect(tableX, rowY, pageW - 110, rowH)
      .fillColor(bgColor);

    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(`${p.pillar}`, tableX + 5, rowY + 6, { width: colW - 10 });

    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(p.ageRange || '', tableX + 5 + colW, rowY + 6, { width: colW - 10 });

    doc.fontSize(6.5)
.font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(p.stemEn || '', tableX + 5 + colW * 2, rowY + 6, { width: colW - 10 });

    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(p.branchAnimal || p.branchEn || '', tableX + 5 + colW * 3, rowY + 6, { width: colW - 10 });

    const elemColor = ELEMENT_COLORS[transformElement(p.stemElement)] || COLORS.textPrimary;
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(elemColor)
      .text(p.stemElement || '', tableX + 5 + colW * 4, rowY + 6, { width: colW - 10 });
  });

  // Per-cycle guidance flowing text (from expanded reportContent)
  if (content && content.pillars && content.pillars[0] && content.pillars[0].guidance) {
    const guidanceText = content.pillars.map(p => 
      `Cycle ${p.pillar} (Ages ${p.ageRange}):\n${p.guidance}`
    ).join('\n\n');
    writeFlowingDetail(doc,
      `${content.intro}\n\n${guidanceText}\n\n${content.conclusion || ''}`,
      55, doc.page.width - 110, { gap: 15, fontSize: 6.5 });
  }
}

/**
 * LUCK CYCLES (Grand Master - more detail)
 */
function buildLuckCyclesDetail(doc, data, content) {
  buildLuckCycles(doc, data, content);
  doc.addPage();

  // Additional detail page for Grand Master
  const pageW = doc.page.width;
  const daYun = data.bazi?.daYun;
  if (!daYun) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('LUCK CYCLES — DETAILED ANALYSIS', 55, 58, { letterSpacing: 0.15 });

  let yPos = 110;
  (daYun.pillars || []).forEach((p, i) => {
    // Cycle box
    doc.roundedRect(55, yPos, pageW - 110, 35, 3)
      .fillColor(COLORS.bgElevated)
      .strokeColor(COLORS.gold + '15')
      .lineWidth(0.5)
      .stroke();

    doc.fontSize(8)
.font('Helvetica')
      .fillColor(COLORS.gold)
      .text(`Cycle ${p.pillar} (Ages ${p.ageRange})`, 70, yPos + 5);

    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(`${p.stemEn || ''} ${p.branchAnimal || ''} — ${p.stemElement || ''}`, 70, yPos + 20);

    // Element relationship indicator
    const elemColor = ELEMENT_COLORS[transformElement(p.stemElement)] || COLORS.textTertiary;
    doc.rect(350, yPos + 8, 6, 6)
      .fillColor(elemColor);

    yPos += 42;
  });
}

/**
 * ANNUAL FORECAST (Standard)
 */
function buildAnnualForecast(doc, data, content) {
  const pageW = doc.page.width;
  const forecasts = data.bazi?.annualForecasts || [];
  if (forecasts.length === 0) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('ANNUAL ENERGY FORECAST', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(content && content.intro ? content.intro : '2025-2030 — Year-by-Year Analysis', 55, 82);

  let yPos = 115;
  forecasts.forEach((f) => {
    const bgColor = COLORS.bgElevated;

    doc.roundedRect(55, yPos, pageW - 110, 50, 4)
      .fillColor(bgColor)
      .strokeColor(COLORS.gold + '15')
      .lineWidth(0.5)
      .stroke();

    // Year header
    doc.fontSize(9)
.font('Helvetica')
      .fillColor(COLORS.gold)
      .text(`${f.year} — ${f.animal || ''} (${f.stemEn || ''} ${f.branchEn || ''})`, 70, yPos + 6);

    // Element
    const elemColor = ELEMENT_COLORS[transformElement(f.stemElement)] || COLORS.textPrimary;
    doc.rect(70, yPos + 22, 5, 5)
      .fillColor(elemColor);
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(f.stemElement || '', 80, yPos + 20);

    // Relationship
    doc.fontSize(6.5)
.font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(f.relationship || '', 140, yPos + 20, { width: pageW - 260 });

    yPos += 58;
  });

  // Per-year analysis flowing across pages (standard)
  if (content && content.years && content.years[0] && content.years[0].analysis) {
    const yearlyText = content.years.map(y => 
      `${y.year} — ${y.animal || ''} Year: ${y.analysis}`
    ).join('\n\n');
    writeFlowingDetail(doc,
      `${content.intro}\n\n${yearlyText}\n\n${content.conclusion || ''}`,
      55, doc.page.width - 110, { gap: 15, fontSize: 6.5 });
  }
}

/**
 * ANNUAL FORECAST (Grand Master - more detail)
 */
function buildAnnualForecastGrandMaster(doc, data, content) {
  const pageW = doc.page.width;
  const forecasts = data.bazi?.annualForecasts || [];
  if (forecasts.length === 0) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('ANNUAL ENERGY FORECAST', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(content && content.intro ? content.intro : '2025-2030 — Comprehensive Year-by-Year Analysis', 55, 82);

  let yPos = 115;
  forecasts.forEach((f) => {
    doc.roundedRect(55, yPos, pageW - 110, 65, 4)
      .fillColor(COLORS.bgElevated)
      .strokeColor(COLORS.gold + '15')
      .lineWidth(0.5)
      .stroke();

    // Year header
    doc.fontSize(9)
.font('Helvetica')
      .fillColor(COLORS.gold)
      .text(`${f.year} — ${f.animal || ''} Year`, 70, yPos + 6);

    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(`${f.stemEn || ''} ${f.branchEn || ''} | Element: ${f.stemElement || ''}`, 70, yPos + 22);

    // Relationship
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(f.relationship || '', 70, yPos + 36, { width: pageW - 140 });

    // Branch interactions
    if (f.branchInteractions && f.branchInteractions.length > 0) {
      doc.fontSize(6)
.font('Helvetica')
        .fillColor(COLORS.textTertiary)
        .text(f.branchInteractions.join('; '), 70, yPos + 50, { width: pageW - 140 });
    }

    yPos += 73;
  });

  // Per-year detailed analysis flowing across pages
  if (content && content.years && content.years[0] && content.years[0].analysis) {
    const yearlyText = content.years.map(y => 
      `${y.year} — ${y.animal || ''} Year (${y.stem} ${y.element}):\n${y.analysis}`
    ).join('\n\n');
    writeFlowingDetail(doc,
      `${content.intro}\n\n${yearlyText}\n\n${content.conclusion || ''}`,
      55, doc.page.width - 110, { gap: 15, fontSize: 6.5 });
  }
}

/**
 * NA YIN & SHEN SHA (Grand Master only)
 */
function buildNaYinShenSha(doc, data) {
  const pageW = doc.page.width;
  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('NA YIN & SHEN SHA', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Musical Note Energy and Divine Star Influences', 55, 82);

  doc.fontSize(7)
    .font('Helvetica')
    .fillColor(COLORS.textTertiary)
    .text(
      'The Na Yin represents the musical note of each pillar — a deeper vibrational quality ' +
      'that reveals hidden talents and innate qualities. The Shen Sha are divine star influences ' +
      'that indicate auspicious or challenging energies in your chart.',
      55, 120,
      { width: pageW - 110 }
    );

  // Placeholder — real implementation would calculate Na Yin and Shen Sha
  doc.fontSize(6.5)
.font('Helvetica')
    .fillColor(COLORS.textTertiary)
    .text('Full Na Yin and Shen Sha analysis available in the complete report.', 55, 200,
      { width: pageW - 110 });
}

/**
 * PERSONALITY PROFILE (Grand Master only)
 */
function buildPersonalityProfile(doc, data, content) {
  const pageW = doc.page.width;
  const dm = data.bazi?.dayMaster;
  if (!dm) return;

  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('PERSONALITY PROFILE', 55, 58, { letterSpacing: 0.15 });

  // Archetype
  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(COLORS.blue)
    .text(`YOUR ARCHETYPE: ${(dm.archetype || '').toUpperCase()}`, 55, 100);

  doc.fontSize(7)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(
      `As a ${dm.en} (${dm.element} ${dm.polarity || ''}), you embody the ${dm.archetype || ''} archetype — ` +
      `a unique expression of cosmic energy that shapes your entire being.`,
      55, 120,
      { width: pageW - 110 }
    );

  // Traits
  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text('KEY TRAITS', 55, 180);

  const traits = (dm.keywords || '').split(',').map(t => t.trim()).filter(Boolean);
  if (traits.length > 0) {
    let yPos = 200;
    traits.forEach((trait, i) => {
      doc.fontSize(6.5)
        .font('Helvetica')
        .fillColor(COLORS.textPrimary)
        .text(`• ${trait}`, 70, yPos);
      yPos += 18;
    });
  }

  // Strengths & Weaknesses section - use content if available
  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(COLORS.success)
    .text('STRENGTHS', 55, 340);

  doc.fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(
      content && content.strengths
        ? content.strengths
        : (dm.keywords || 'Leadership, Creativity, Intuition'),
      55, 360,
      { width: pageW - 110 }
    );

  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(COLORS.warning)
    .text('GROWTH AREAS', 55, 430);

  doc.fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(
      content && content.weaknesses
        ? content.weaknesses
        : 'Balancing natural intensity with patience, harnessing energy sustainably.',
      55, 450,
      { width: pageW - 110 }
    );
}

/**
 * CAREER & WEALTH STRATEGY (Grand Master only)
 */
function buildCareerStrategy(doc, data, content) {
  const pageW = doc.page.width;
  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('CAREER & WEALTH STRATEGY', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Optimized career direction and wealth potential based on your chart.', 55, 82);

  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(COLORS.blue)
    .text('CAREER PATH GUIDANCE', 55, 120);

  // Render career guidance from reportContent if available
  if (content && content.careerPath) {
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(content.careerPath, 55, 142, { width: pageW - 110 });
  } else if (content && content.guidance) {
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(content.guidance, 55, 142, { width: pageW - 110 });
  }

  // Career directions (always shown as visual reference)
  doc.fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.blue)
    .text('OPTIMAL CAREER DIRECTIONS', 55, content ? 300 : 120);

  const careerDirections = [
    { field: 'Leadership & Management', reason: 'Your chart shows natural authority energy' },
    { field: 'Creative Arts', reason: 'Elemental configuration favors expressive fields' },
    { field: 'Spiritual & Healing', reason: 'Water/Metal balance indicates deep intuition' },
    { field: 'Entrepreneurship', reason: 'Independent pillar structure favors self-direction' },
  ];

  let yPos = 142;
  careerDirections.forEach(dir => {
    doc.roundedRect(55, yPos, pageW - 110, 22, 3)
      .fillColor(COLORS.bgElevated);

    doc.fontSize(6.5)
.font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(dir.field, 70, yPos + 4);
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(dir.reason, 230, yPos + 5, { width: 200 });

    yPos += 28;
  });

  doc.fontSize(8)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('WEALTH POTENTIAL', 55, 340);

  doc.fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(
      'Your chart indicates strong wealth potential during favorable luck cycles. ' +
      'Financial success is maximized when aligned with your natural element strengths. ' +
      'The Metal element in your chart suggests prosperity through structured, ' +
      'disciplined approaches to wealth building.',
      55, 360,
      { width: pageW - 110 }
    );

  doc.fontSize(8)
.font('Helvetica')
    .fillColor(COLORS.warning)
    .text('TIMING — FAVORABLE PERIODS', 55, 430);

  doc.fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(
      'Your most favorable periods for career advancement and wealth accumulation ' +
      'align with luck cycles that strengthen your dominant or supportive elements. ' +
      'Consult your Luck Cycles section for specific age ranges that favor financial growth.',
      55, 450,
      { width: pageW - 110 }
    );

  // Extended career + life guidance flowing across pages
  if (content && (content.guidance || content.advice)) {
    const guidanceText = [
      content.guidance || '',
      content.advice || '',
      content.careerPath ? `\nCareer Path Guidance:\n${content.careerPath}` : '',
      content.lovePath ? `\nRelationship Path:\n${content.lovePath}` : '',
      content.innerPath ? `\nInner Growth Path:\n${content.innerPath}` : '',
    ].filter(Boolean).join('\n\n');
    writeFlowingDetail(doc, guidanceText,
      55, doc.page.width - 110, { gap: 20, fontSize: 7 });
  }
}

/**
 * REMEDIATION GUIDE
 */
function buildRemediationGuide(doc, data) {
  const pageW = doc.page.width;
  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('REMEDIATION GUIDE', 55, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Environmental & Behavioral adjustments to harmonize your energy.', 55, 82);

  // Favorable directions
  doc.fontSize(9)
.font('Helvetica')
    .fillColor(COLORS.blue)
    .text('FAVORABLE DIRECTIONS', 55, 115);

  const directions = [
    { dir: 'North', element: 'Water', benefit: 'Enhances wisdom and intuition' },
    { dir: 'East', element: 'Wood', benefit: 'Supports growth and creativity' },
    { dir: 'Southeast', element: 'Wood', benefit: 'Attracts prosperity and abundance' },
    { dir: 'South', element: 'Fire', benefit: 'Amplifies charisma and recognition' },
  ];

  let yPos = 135;
  directions.forEach(d => {
    doc.roundedRect(55, yPos, pageW / 2 - 65, 20, 3)
      .fillColor(COLORS.bgElevated);

    doc.fontSize(6)
.font('Helvetica')
      .fillColor(ELEMENT_COLORS[d.element] || COLORS.textPrimary)
      .text(`${d.dir} (${d.element})`, 68, yPos + 4);
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(d.benefit, 160, yPos + 5, { width: 150 });

    yPos += 26;
  });

  // Colors
  yPos += 10;
  doc.fontSize(9)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('COLORS', 55, yPos);

  yPos += 20;
  const colors = [
    { name: 'Green', element: 'Wood', hex: '#22C55E' },
    { name: 'Red/Purple', element: 'Fire', hex: '#EF4444' },
    { name: 'Yellow', element: 'Earth', hex: '#E8B84B' },
    { name: 'White/Gray', element: 'Metal', hex: '#94A3B8' },
    { name: 'Black/Blue', element: 'Water', hex: '#3B82F6' },
  ];

  colors.forEach(c => {
    doc.rect(55, yPos, 8, 8)
      .fillColor(c.hex);
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(`${c.name} — ${c.element}`, 70, yPos);
    yPos += 14;
  });

  // Lucky numbers
  yPos += 10;
  doc.fontSize(9)
.font('Helvetica')
    .fillColor(COLORS.blue)
    .text('LUCKY NUMBERS', 55, yPos);

  yPos += 20;
  doc.fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('1, 6 (Water), 3, 8 (Wood), 2, 7 (Fire), 5, 10 (Earth), 4, 9 (Metal)', 55, yPos,
      { width: pageW - 110 });

  // Lifestyle
  yPos += 25;
  doc.fontSize(9)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('LIFESTYLE RECOMMENDATIONS', 55, yPos);

  yPos += 20;
  const recs = [
    'Practice mindfulness and meditation to balance your core energy',
    'Spend time in natural environments that align with your supportive elements',
    'Maintain a consistent daily routine to anchor your natural rhythm',
    'Engage in creative expression to channel your elemental energy',
    'Regular physical exercise to maintain energetic flow and balance',
  ];

  recs.forEach(rec => {
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(`• ${rec}`, 70, yPos, { width: pageW - 140 });
    yPos += 16;
  });
}

/**
 * PERSONAL AFFIRMATION PAGE
 */
function buildPersonalAffirmation(doc, data, content) {
  const pageW = doc.page.width;
  doc.rect(0, 0, pageW, doc.page.height)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 3)
    .fill(COLORS.gold);

  const dm = data.bazi?.dayMaster;
  const centerX = pageW / 2;

  doc.fontSize(14)
.font('Helvetica')
    .fillColor(COLORS.gold)
    .text('YOUR AFFIRMATION', 55, 158, { width: pageW - 110, align: 'center', letterSpacing: 0.15 });

  doc.moveTo(centerX - 40, 190)
    .lineTo(centerX + 40, 190)
    .strokeColor(COLORS.gold)
    .stroke();

  // Use affirmation from reportContent if available, else fallback to hardcoded
  const affirmationText = content
    ? (typeof content === 'string' ? content : content.affirmation || '')
    : '';

  if (affirmationText) {
    doc.fontSize(12)
      .font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(`"${affirmationText}"`, 55, 220, { align: 'center', width: pageW - 110 });
  } else if (dm) {
    const affirmations = {
      'Wood': 'I grow with purpose, bending without breaking, reaching toward the light.',
      'Fire': 'I shine with warmth and clarity, illuminating my path and those I love.',
      'Earth': 'I am grounded and abundant, a foundation for greatness to grow upon.',
      'Metal': 'I am precise and strong, cutting through illusion with clarity of purpose.',
      'Water': 'I flow with wisdom, deep and adaptable, finding my way through all obstacles.',
    };

    const affirmation = affirmations[transformElement(dm.element)] ||
      'I honor the unique energy that flows through me and embrace my cosmic destiny.';

    doc.fontSize(12)
.font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(`"${affirmation}"`, 55, 220, { align: 'center', width: pageW - 110 });
  }

  // Closing
  doc.fontSize(7)
    .font('Helvetica')
    .fillColor(COLORS.textTertiary)
    .text('This report was generated for your personal guidance and reflection.', 55, 320, { align: 'center', width: pageW - 110 });

  doc.fontSize(6)
.font('Helvetica')
    .fillColor(COLORS.textTertiary)
    .text('This report is based on the Four Pillars of Destiny (Ba Zi) system. ' +
      'It is intended for personal insight and reflection, not as a substitute for professional advice.', 55, 360,
      { align: 'center', width: pageW - 110 });

  // Gold bottom bar
  doc.rect(0, doc.page.height - 3, pageW, 3)
    .fillColor(COLORS.gold);
}

/**
 * FOOTER — page numbers on every page
 */
function buildFooter(doc) {
  // See if we have multiple pages
  // PDFKit's bufferPages allows us to access page count
  const pages = doc.bufferedPageRange();
  if (!pages) return;

  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    // Skip cover page
    if (i === 0) continue;

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    // Bottom margin = 50pt. Printable bottom = 792 (A4).
    // Footer line at y=775, text at y=780, text ends at ~788 (< 792 ✓)
    const footerY = pageH - 67; // 775

    // Footer line
    doc.rect(55, footerY, pageW - 110, 0.5)
      .fillColor(COLORS.gold + '30');

    // Centered page number + brand
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(`Page ${i} of ${pages.count - 1}  •  SOUL ELEMENTS`, 55, footerY + 5, { align: 'center', width: pageW - 110 });
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Transform element name, handling Chinese characters if present
 */
function transformElement(elem) {
  if (!elem) return 'Wood';
  const map = { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' };
  return map[elem] || elem;
}

/**
 * Draw a 5-element cycle diagram
 */
function drawCycleDiagram(doc, startX, startY, elements, data) {
  const cx = startX + 100;
  const cy = startY + 50;
  const radius = 45;
  const innerRadius = 25;

  // Draw arrows between elements in a circle
  const angles = [-Math.PI / 2, -Math.PI / 2 + 2 * Math.PI / 5, -Math.PI / 2 + 4 * Math.PI / 5,
    -Math.PI / 2 + 6 * Math.PI / 5, -Math.PI / 2 + 8 * Math.PI / 5];

  elements.forEach((elem, i) => {
    const angle = angles[i];
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    // Element circle
    const pct = data[elem.label] || 0;
    const circleRadius = Math.max(10, 8 + pct * 0.15);
    const alpha = Math.min(1, 0.2 + pct * 0.012);

    doc.circle(x, y, circleRadius)
      .fillColor(elem.color)
      .fill();

    // Label
    doc.fontSize(6)
.font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(elem.label, x - 10, y + circleRadius + 4, { width: 20, align: 'center' });

    // Percentage
    doc.fontSize(5.5)
      .font('Helvetica')
      .fillColor(COLORS.textPrimary)
      .text(`${pct}%`, x - 10, y - 5, { width: 20, align: 'center' });
  });

  // Arrow connections
  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    const x1 = cx + radius * Math.cos(angles[i]);
    const y1 = cy + radius * Math.sin(angles[i]);
    const x2 = cx + radius * Math.cos(angles[next]);
    const y2 = cy + radius * Math.sin(angles[next]);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Arrow
    doc.moveTo(x1, y1)
      .lineTo(x2, y2)
      .strokeColor(COLORS.gold + '30')
      .lineWidth(0.5)
      .stroke();
  }
}

/**
 * Build mini four-pillar display for cover page
 */
function buildMiniPillars(doc, pillars, x, y) {
  const width = (doc.page.width - x - 55) / 4;

  ['year', 'month', 'day', 'hour'].forEach((key, i) => {
    const p = pillars[key];
    if (!p) return;
    const px = x + i * (width + 5);

    doc.rect(px, y, width, 30)
      .fillColor(COLORS.bgElevated + '80');

    const stemColor = ELEMENT_COLORS[transformElement(p.stemElement)] || COLORS.textPrimary;
    doc.fontSize(7)
.font('Helvetica')
      .fillColor(stemColor)
      .text(p.stemEn || '', px + 3, y + 4, { width: width - 6 });

    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(p.animal || p.branchEn || '', px + 3, y + 17, { width: width - 6 });
  });
}

/**
 * SECTION DIVIDER — Full-page chapter separator
 */
function buildSectionDivider(doc, chapterNum, title, subtitle) {
  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const cx = pageW / 2;

  // Dark background
  doc.rect(0, 0, pageW, pageH)
    .fill(COLORS.bgDeep);

  // Gold bar at top (4pt)
  doc.rect(0, 0, pageW, 4)
    .fill(COLORS.gold);

  // Gold bar at bottom (4pt)
  doc.rect(0, pageH - 4, pageW, 4)
    .fill(COLORS.gold);

  // Chapter number large (font 48, gold, opacity 0.3)
  doc.fontSize(48)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text(String(chapterNum), 0, 220, { width: pageW, align: 'center', opacity: 0.3 });

  // Decorative line above title
  doc.moveTo(cx - 120, 300)
    .lineTo(cx + 120, 300)
    .strokeColor(COLORS.gold + '50')
    .lineWidth(0.5)
    .stroke();

  // Title (font 24, white) centered
  doc.fontSize(24)
    .font('Helvetica')
    .fillColor(COLORS.textPrimary)
    .text(title, 0, 320, { width: pageW, align: 'center' });

  // Decorative line below title
  doc.moveTo(cx - 120, 360)
    .lineTo(cx + 120, 360)
    .strokeColor(COLORS.gold + '50')
    .lineWidth(0.5)
    .stroke();

  // Subtitle (font 9, gold) centered
  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text(subtitle || '', 0, 385, { width: pageW, align: 'center' });

  // Poetic quote (font 7, italic, textTertiary) — adds spiritual depth
  const quotes = [
    'The patterns of heaven and earth reveal themselves to those who know how to look.',
    'In every moment, the universe writes your destiny in the language of elements.',
    'To know yourself is to know the dance of yin and yang within your soul.',
    'The five elements are not things, but phases of energy in eternal conversation.',
    'Your birth chart is a map, not a destination — the journey is yours to walk.',
    'Ancient wisdom speaks to those who listen with the heart, not just the mind.',
    'The stems and branches weave a pattern as old as time, as new as this moment.',
    'Within you, the elements dance their eternal dance — wood, fire, earth, metal, water.',
    'Destiny is not a cage but a compass — it shows direction, not limitation.',
    'The cosmic blueprint encoded in your birth reveals not fate, but potential.',
    'Understanding your elements is learning the language of your own soul.',
    'Between heaven and earth, you are the bridge — your Four Pillars tell the story.',
    'The cycles of change are the only constant — and your chart reveals their rhythm.',
    'Know your nature, honour your seasons, and you shall find your way.',
    'The Ba Zi is a mirror — it shows not what you will become, but what you already are.',
    'Harmony is not the absence of opposing forces, but their elegant balance.',
    'Time is not a line but a spiral — each luck cycle brings you closer to your centre.',
    'The elements within you are the same elements that move the stars.',
    'Your chart is a seed. What grows from it is entirely your own.',
    'In the silence between thoughts, the ancient wisdom still speaks.',
  ];
  const quote = quotes[(chapterNum - 1) % quotes.length];
  
  // Decorative small diamond before quote
  doc.fontSize(6)
    .font('Helvetica')
    .fillColor(COLORS.gold + '50')
    .text('◈', 0, 440, { width: pageW, align: 'center' });
  
  doc.fontSize(7)
    .font('Helvetica-Oblique')
    .fillColor(COLORS.textTertiary)
    .text(`"${quote}"`, 80, 460, { width: pageW - 160, align: 'center' });

  // Small Tai Chi at bottom center
  drawTaiChi(doc, cx, pageH - 50, 12);
}

/**
 * APPENDIX A: ELEMENT REFERENCE GUIDE
 * Full page with table of 5 elements and their properties
 */
function buildAppendixElementReference(doc) {
  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const margin = 55;
  const tableTop = 120;
  const rowH = 100;
  const colW = (pageW - 2 * margin) / 5;

  // Dark background
  doc.rect(0, 0, pageW, pageH)
    .fill(COLORS.bgDeep);

  // Gold top bar
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  // Title
  doc.fontSize(14)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text('ELEMENT REFERENCE GUIDE', margin, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('The five elements of Chinese metaphysics — their energies, seasons, and correspondences.', margin, 82);

  // Element data
  const elements = [
    { name: 'Wood', season: 'Spring', direction: 'East', color: 'Green', emotion: 'Anger / Kindness', taste: 'Sour', organ: 'Liver / Gallbladder' },
    { name: 'Fire', season: 'Summer', direction: 'South', color: 'Red', emotion: 'Joy / Anxiety', taste: 'Bitter', organ: 'Heart / Small Intestine' },
    { name: 'Earth', season: 'Late Summer', direction: 'Center', color: 'Yellow', emotion: 'Worry / Empathy', taste: 'Sweet', organ: 'Spleen / Stomach' },
    { name: 'Metal', season: 'Autumn', direction: 'West', color: 'White', emotion: 'Grief / Courage', taste: 'Spicy', organ: 'Lungs / Large Intestine' },
    { name: 'Water', season: 'Winter', direction: 'North', color: 'Blue/Black', emotion: 'Fear / Calm', taste: 'Salty', organ: 'Kidneys / Bladder' },
  ];

  const properties = ['Element', 'Season', 'Direction', 'Color', 'Emotion', 'Taste', 'Organ Pair'];

  // Draw column headers
  const headerY = tableTop - 25;
  properties.forEach((prop, i) => {
    const colX = margin + i * colW;
    doc.fontSize(6)
      .font('Helvetica-Bold')
      .fillColor(COLORS.gold)
      .text(prop.toUpperCase(), colX + 2, headerY, { width: colW - 4, align: 'center' });
  });

  // Draw each element row
  elements.forEach((elem, rowIdx) => {
    const rowY = tableTop + rowIdx * rowH;
    const elemColor = ELEMENT_COLORS[elem.name] || COLORS.textPrimary;

    // Element card background
    doc.roundedRect(margin, rowY, pageW - 2 * margin, rowH - 5, 4)
      .fillColor(COLORS.bgSurface + '80')
      .fill()
      .strokeColor(elemColor + '40')
      .lineWidth(0.5)
      .stroke();

    // Element name — first column
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(elemColor)
      .text(elem.name, margin + 5, rowY + 10, { width: colW - 10, align: 'center' });

    // Element name underline
    doc.moveTo(margin + 10, rowY + 30)
      .lineTo(margin + colW - 10, rowY + 30)
      .strokeColor(elemColor + '50')
      .lineWidth(0.5)
      .stroke();

    // Season
    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(elem.season, margin + colW + 5, rowY + 12, { width: colW - 10, align: 'center' });

    // Direction
    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(elem.direction, margin + 2 * colW + 5, rowY + 12, { width: colW - 10, align: 'center' });

    // Color
    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(elem.color, margin + 3 * colW + 5, rowY + 12, { width: colW - 10, align: 'center' });

    // Emotion (two lines)
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(elem.emotion, margin + 5, rowY + 40, { width: colW - 10, align: 'center' });

    // Taste
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(elem.taste, margin + colW + 5, rowY + 40, { width: colW - 10, align: 'center' });

    // Organ pair
    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(elem.organ, margin + 2 * colW + 5, rowY + 40, { width: 3 * colW - 10, align: 'center' });

    // Color swatch
    doc.roundedRect(margin + 3 * colW + colW / 2 - 8, rowY + 55, 16, 16, 3)
      .fillColor(elemColor)
      .fill();
  });

  // Footer note
  doc.fontSize(6)
    .font('Helvetica-Oblique')
    .fillColor(COLORS.textDim)
    .text('These correspondences reflect traditional Chinese Five Element theory (Wu Xing). Each element nourishes and controls another in a continual cycle of balance.', margin, pageH - 60, { width: pageW - 2 * margin, align: 'center' });

  // Bottom gold bar
  doc.rect(0, pageH - 2, pageW, 2)
    .fill(COLORS.gold);
}

/**
 * APPENDIX B: READING YOUR CHART GUIDE
 * 2-page explanation of the Four Pillars structure
 */
function buildAppendixReadingGuide(doc) {
  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const margin = 55;
  const bodyW = pageW - 2 * margin;

  // === PAGE 1 ===
  doc.rect(0, 0, pageW, pageH)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text('READING YOUR BA ZI CHART', margin, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica-Oblique')
    .fillColor(COLORS.textSecondary)
    .text('A guide to understanding the Four Pillars of Destiny', margin, 82);

  let y = 115;

  // Section: What is Ba Zi
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(COLORS.gold)
    .text('What Is Ba Zi?', margin, y);
  y += 20;
  doc.fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Ba Zi, also known as the Four Pillars of Destiny, is a refined system of Chinese metaphysics that maps the cosmic energies present at the moment of your birth. "Ba Zi" literally means "Eight Characters" — referring to the four Heavenly Stems and four Earthly Branches that together form your birth chart. These eight characters encode the unique energetic blueprint that shapes your personality, strengths, challenges, and life path.', margin, y, { width: bodyW, align: 'left' });
  y += 55;

  // The Four Pillars
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(COLORS.gold)
    .text('The Four Pillars', margin, y);
  y += 20;

  const pillars = [
    { name: 'Year Pillar', represents: 'Family, heritage, early childhood, ancestry. Reveals the foundation you were born into and the broader social environment that shaped your early years.' },
    { name: 'Month Pillar', represents: 'Career, peers, social standing, young adulthood. Reflects your professional path, relationships with colleagues, and your role in society.' },
    { name: 'Day Pillar', represents: 'The self, spouse, intimate relationships, middle age. The Day Stem is your Day Master — the central energy of your entire chart.' },
    { name: 'Hour Pillar', represents: 'Children, legacy, later years, inner self. Governs your later life, creative output, and what you pass on to future generations.' },
  ];

  pillars.forEach(p => {
    doc.roundedRect(margin, y, bodyW, 38, 3)
      .fillColor(COLORS.bgSurface + '60')
      .fill()
      .strokeColor(COLORS.gold + '20')
      .lineWidth(0.5)
      .stroke();

    doc.fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(COLORS.gold)
      .text(p.name, margin + 10, y + 5);
    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(p.represents, margin + 10, y + 20, { width: bodyW - 20 });
    y += 44;
  });

  // === PAGE 2 ===
  doc.addPage();
  doc.rect(0, 0, pageW, pageH)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text('READING YOUR BA ZI CHART (CONTINUED)', margin, 58, { letterSpacing: 0.15 });

  // Section: The Day Master
  y = 100;
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(COLORS.gold)
    .text('The Day Master — Your Core Self', margin, y);
  y += 20;
  doc.fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('The Day Master (the Heavenly Stem of your Day Pillar) is the most important element in your chart. It represents you — your core personality, constitution, and innate nature. Every other element in the chart is analyzed in relation to the Day Master: does it support you, drain you, or challenge you? Your Day Master belongs to one of the five elements (Wood, Fire, Earth, Metal, or Water) and has a Yin or Yang polarity. Understanding your Day Master is the first step to unlocking your chart.', margin, y, { width: bodyW });
  y += 70;

  // Section: Element Interactions
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(COLORS.gold)
    .text('How the Elements Interact', margin, y);
  y += 20;
  doc.fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('The five elements are connected in two fundamental cycles:', margin, y, { width: bodyW });
  y += 20;

  doc.fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(COLORS.woodColor)
    .text('Generating (Nourishing) Cycle:', margin, y);
  doc.fontSize(7.5)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Wood feeds Fire, Fire creates Earth (ash), Earth bears Metal, Metal carries Water, Water nourishes Wood. This cycle shows where you receive support and what you naturally nurture.', margin + 5, y + 14, { width: bodyW - 5 });
  y += 34;

  doc.fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(COLORS.error)
    .text('Controlling (Restraining) Cycle:', margin, y);
  doc.fontSize(7.5)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Wood parts Earth, Earth dams Water, Water douses Fire, Fire melts Metal, Metal chops Wood. This cycle shows areas of tension, challenge, or healthy discipline depending on balance.', margin + 5, y + 14, { width: bodyW - 5 });
  y += 34;

  // Section: Balance
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(COLORS.gold)
    .text('Element Balance', margin, y);
  y += 20;
  doc.fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('A well-balanced chart has a healthy mix of elements supporting the Day Master. An excess of one element can create challenges: too much Fire may lead to impulsiveness, while too little Water might indicate difficulty with adaptability. Your chart analysis identifies imbalances and suggests ways to harmonize through colors, directions, and lifestyle choices.', margin, y, { width: bodyW });
  y += 50;

  // Section: Putting It Together
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(COLORS.gold)
    .text('Putting It All Together', margin, y);
  y += 20;
  doc.fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('Your Ba Zi chart is a snapshot of the universe at your birth. By understanding the interplay of Heavenly Stems, Earthly Branches, and the five elements, you gain insight into your natural strengths, recurring patterns, and optimal timing for major life decisions. This report translates those ancient principles into practical, actionable guidance for your modern life.', margin, y, { width: bodyW });

  // Bottom gold bar
  doc.rect(0, pageH - 2, pageW, 2)
    .fill(COLORS.gold);
}

/**
 * GLOSSARY — Key Ba Zi terms and concepts
 * 2 pages: alphabetical terms with explanations
 */
function buildGlossary(doc) {
  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const margin = 55;
  const bodyW = pageW - 2 * margin;

  const terms = [
    { term: 'Ba Zi', def: 'Literally "Eight Characters" — the four Heavenly Stems and four Earthly Branches that form your birth chart. Also known as the Four Pillars of Destiny, this system maps the cosmic energies at your moment of birth.' },
    { term: 'Day Master', def: 'The Heavenly Stem of the Day Pillar and the most important element in your chart. Represents your core self, personality, and innate constitution. All other chart elements are analyzed in relation to the Day Master.' },
    { term: 'Earthly Branches', def: 'The twelve animal signs (Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig) that form the lower half of each pillar. Each branch carries its own elemental energy and contains Hidden Stems.' },
    { term: 'Five Elements (Wu Xing)', def: 'Wood, Fire, Earth, Metal, and Water — the five fundamental energies that interact in generating and controlling cycles. Everything in the chart is classified under one of these elements.' },
    { term: 'Four Pillars', def: 'The Year, Month, Day, and Hour pillars that together form a Ba Zi chart. Each pillar consists of a Heavenly Stem on top and an Earthly Branch below, representing different dimensions of life.' },
    { term: 'Heavenly Stems', def: 'The ten celestial stems (Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren, Gui) that form the upper half of each pillar. They represent the visible, conscious energies in your chart.' },
    { term: 'Hidden Stems', def: 'Subconscious elemental energies embedded within each Earthly Branch. These hidden influences reveal deeper personality layers and talents not immediately visible from the main stems alone.' },
    { term: 'Luck Cycles (Da Yun)', def: 'Ten-year periods of energetic influence that unfold throughout your life. Each cycle activates different elements and life areas, helping you understand the timing of major opportunities and challenges.' },
    { term: 'Na Yin', def: 'Often translated as "Musical Note Energy" — a deeper layer of elemental influence associated with each pillar. Na Yin reveals your intrinsic nature and the song your soul came to sing in this lifetime.' },
    { term: 'Shen Sha', def: 'Divine or noble stars — auspicious and inauspicious influences in your chart. Benefic stars indicate talents and protection, while malefic stars highlight areas requiring awareness and effort.' },
    { term: 'Ten Deities', def: 'Ten relationship archetypes (such as Official, Wealth, Resource, and Peer) that describe how each element in your chart relates to your Day Master. They reveal your relationships, career tendencies, and life patterns.' },
    { term: 'True Solar Time', def: 'Time adjusted for geographic longitude and seasonal variation, used instead of standard clock time for accurate Ba Zi calculation. Ensures the Hour Pillar reflects the actual solar position at your birthplace.' },
    { term: 'Yin / Yang', def: 'The dualistic principle of complementary opposites. Yin is receptive, dark, cool, and feminine. Yang is active, bright, warm, and masculine. Every stem and branch has a Yin or Yang polarity that modifies its expression.' },
  ];

  // === PAGE 1 ===
  doc.rect(0, 0, pageW, pageH)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text('GLOSSARY', margin, 58, { letterSpacing: 0.15 });

  doc.fontSize(9)
    .font('Helvetica-Oblique')
    .fillColor(COLORS.textSecondary)
    .text('Key terms and concepts in Ba Zi metaphysics', margin, 82);

  let y = 115;
  const half = Math.ceil(terms.length / 2);

  // Page 1: first half of terms
  for (let i = 0; i < half; i++) {
    const t = terms[i];
    doc.fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(COLORS.gold)
      .text(t.term, margin, y);
    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(t.def, margin + 5, y + 14, { width: bodyW - 5 });
    y += 52;
  }

  // Bottom gold bar page 1
  doc.rect(0, pageH - 2, pageW, 2)
    .fill(COLORS.gold);

  // === PAGE 2 ===
  doc.addPage();
  doc.rect(0, 0, pageW, pageH)
    .fill(COLORS.bgDeep);
  doc.rect(0, 0, pageW, 2)
    .fill(COLORS.gold);

  doc.fontSize(14)
    .font('Helvetica')
    .fillColor(COLORS.gold)
    .text('GLOSSARY (CONTINUED)', margin, 58, { letterSpacing: 0.15 });

  y = 100;
  for (let i = half; i < terms.length; i++) {
    const t = terms[i];
    doc.fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(COLORS.gold)
      .text(t.term, margin, y);
    doc.fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(t.def, margin + 5, y + 14, { width: bodyW - 5 });
    y += 52;
  }

  // Bottom gold bar page 2
  doc.rect(0, pageH - 2, pageW, 2)
    .fill(COLORS.gold);
}

/**
 * CLOSING PAGE — Final blessing and share CTA
 */
function buildClosingPage(doc) {
  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const cx = pageW / 2;

  // Dark background
  doc.rect(0, 0, pageW, pageH)
    .fill(COLORS.bgDeep);

  // Mystical border
  drawMysticalBorder(doc, 40, 40, pageW - 80, pageH - 80);

  // Gold top bar
  doc.rect(0, 0, pageW, 4)
    .fill(COLORS.gold);

  // Gold bottom bar
  doc.rect(0, pageH - 4, pageW, 4)
    .fill(COLORS.gold);

  // Large Tai Chi at center
  drawTaiChi(doc, cx, pageH / 2 - 60, 40);

  // Blessing / quote
  doc.fontSize(16)
    .font('Helvetica')
    .fillColor(COLORS.textPrimary)
    .text('"Know the patterns of heaven and earth,', 55, pageH / 2 + 40, { align: 'center', width: pageW - 110 });

  doc.fontSize(16)
    .font('Helvetica')
    .fillColor(COLORS.textPrimary)
    .text('and you shall know yourself."', 55, pageH / 2 + 68, { align: 'center', width: pageW - 110 });

  // Attribution
  doc.fontSize(8)
    .font('Helvetica-Oblique')
    .fillColor(COLORS.textTertiary)
    .text('— Ancient Ba Zi Proverb', 55, pageH / 2 + 100, { align: 'center', width: pageW - 110 });

  // Decorative divider
  drawTaiChiDivider(doc, 120, pageH / 2 + 130, pageW - 240);

  // Report attribution
  doc.fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text('This report was generated by Soul Elements', 55, pageH / 2 + 160, { align: 'center', width: pageW - 110 });

  // Website
  doc.fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(COLORS.gold)
    .text('www.soulelements.com', 55, pageH / 2 + 185, { align: 'center', width: pageW - 110 });

  // Separator
  doc.moveTo(cx - 60, pageH / 2 + 210)
    .lineTo(cx + 60, pageH / 2 + 210)
    .strokeColor(COLORS.gold + '40')
    .lineWidth(0.5)
    .stroke();

  // CTA
  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.textPrimary)
    .text('Share Your Experience', 55, pageH / 2 + 225, { align: 'center', width: pageW - 110 });

  doc.fontSize(7)
    .font('Helvetica')
    .fillColor(COLORS.textTertiary)
    .text('Tag us on social media and let the community know what you discovered about your destiny.', 55, pageH / 2 + 245, { align: 'center', width: pageW - 110 });

  // Decorative corner Tai Chi
  drawTaiChi(doc, 55, 70, 8);
  drawTaiChi(doc, pageW - 55, 70, 8);
}

module.exports = {
  generatePDF,
  // Exposed for testing
  transformElement,
};

/**
 * Write a detailed text block that flows across pages naturally.
 * After fixed-position visual elements, this appends flowing text
 * starting at the current doc.y position, creating overflow pages as needed.
 */
function writeFlowingDetail(doc, text, x, width, options = {}) {
  if (!text) return;
  const margin = 55;
  const startX = x || margin;
  const textWidth = width || (doc.page.width - 110);
  const gap = options.gap !== undefined ? options.gap : 20;
  
  doc.fontSize(options.fontSize || 6.5)
    .font(options.font || 'Helvetica')
    .fillColor(options.color || COLORS.textSecondary);
  
  // Use doc.x, doc.y for relative positioning — lets text overflow naturally
  // Don't pass explicit y so PDFKit uses doc.y which is auto-updated
  doc.x = startX;
  const startY = Math.max(doc.y + gap, options.minY || doc.y + gap);
  doc.text(text, startX, startY, { 
    width: textWidth, 
    align: options.align || 'left',
    lineGap: options.lineGap || 2,
  });
}
