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
      buildCoverPage(doc, baziData);
      doc.addPage();
      buildDocumentStructure(doc, tier);
      doc.addPage();
      buildArchitecturalChart(doc, baziData);
      doc.addPage();
      buildFourPillarsDetail(doc, baziData);
      doc.addPage();
      buildElementDistribution(doc, baziData, reportContent.elementAnalysis);
      doc.addPage();
      buildElementBalance(doc, baziData, reportContent.fiveElementsInsight);
      doc.addPage();
      buildHiddenStems(doc, baziData, reportContent.hiddenStemsGuidance);
      doc.addPage();
      buildTenDeities(doc, baziData, reportContent.tenDeities);

      if (tier === 'grandmaster') {
        doc.addPage();
        buildLuckCyclesDetail(doc, baziData, reportContent.daYun);
        doc.addPage();
        buildAnnualForecastGrandMaster(doc, baziData, reportContent.annualForecast);
        doc.addPage();
        buildNaYinShenSha(doc, baziData);
        doc.addPage();
        buildPersonalityProfile(doc, baziData, reportContent.personality);
        doc.addPage();
        buildCareerStrategy(doc, baziData, reportContent.lifeGuidance);
      } else {
        doc.addPage();
        buildLuckCycles(doc, baziData, reportContent.daYun);
        doc.addPage();
        buildAnnualForecast(doc, baziData, reportContent.annualForecast);
      }

      doc.addPage();
      buildRemediationGuide(doc, baziData);
      doc.addPage();
      buildPersonalAffirmation(doc, baziData, reportContent.personalAffirmation);
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
function buildCoverPage(doc, data) {
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
  doc.fontSize(11)
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
    doc.fontSize(9)
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

  doc.fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(COLORS.gold)
    .text(tierText + ' EDITION', pageW/2 - 50, badgeY + 7, { width: 100, align: 'center' });

  // Four Pillars Mini Display
  if (bazi?.pillars) {
    buildMiniPillars(doc, bazi.pillars, 80, 430);
  }

  // Confidential text
  doc.fontSize(7)
    .font('Helvetica')
    .fillColor(COLORS.textTertiary)
    .text('◈  CONFIDENTIAL — For personal use only  ◈', 55, pageH - 80, { align: 'center', width: pageW - 110 });

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

  doc.fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.textSecondary)
    .text(isGrandMaster ? 'Grand Master Edition — 24 Page Breakdown' : 'Standard Edition — 14 Page Breakdown', 55, 82);

  const sections = isGrandMaster ? [
    { page: '3', title: 'Architectural Chart', desc: 'Your Four Pillars with complete stem/branch data and elemental energy scoring.' },
    { page: '4-5', title: 'Pillar Deep Analysis', desc: 'Each of the four pillars analyzed individually with day master insight.' },
    { page: '6', title: 'Elemental Distribution', desc: 'Weighted five-element percentages with visual distribution chart.' },
    { page: '7', title: 'Element Balance & Cycle', desc: 'Generating and controlling cycle assessment with balance score.' },
    { page: '8', title: 'Hidden Stems', desc: 'Subconscious energies embedded in each earthly branch.' },
    { page: '9', title: 'Ten Deities', desc: 'Energetic roles and relationships in your chart.' },
    { page: '10-12', title: 'Luck Cycles', desc: '10-Year luck cycles with detailed analysis of each pillar.' },
    { page: '13-15', title: 'Annual Energy Forecast', desc: 'Year-by-year breakdown from 2025 to 2030.' },
    { page: '16', title: 'Na Yin & Shen Sha', desc: 'Musical note energy and divine star influences.' },
    { page: '17-18', title: 'Personality Profile', desc: 'Comprehensive personality assessment based on your chart.' },
    { page: '19-20', title: 'Career & Wealth Strategy', desc: 'Optimized career direction and wealth potential analysis.' },
    { page: '21-22', title: 'Remediation Guide', desc: 'Adjustments, colors, directions, and lifestyle recommendations.' },
    { page: '23', title: 'Personal Affirmation', desc: 'Your customized destiny affirmation.' },
  ] : [
    { page: '3', title: 'Architectural Chart', desc: 'Your Four Pillars with stem/branch data and elemental scores.' },
    { page: '4-5', title: 'Pillar Deep Analysis', desc: 'Each pillar analyzed individually with day master insight.' },
    { page: '6', title: 'Elemental Distribution', desc: 'Five-element percentages with distribution bar chart.' },
    { page: '7', title: 'Element Balance & Cycle', desc: 'Element cycle assessment with balance insights.' },
    { page: '8', title: 'Hidden Stems', desc: 'Subconscious energies in each earthly branch.' },
    { page: '9', title: 'Ten Deities', desc: 'Energetic roles and relationships.' },
    { page: '10', title: 'Luck Cycles Overview', desc: '10-Year luck cycle summary.' },
    { page: '11-12', title: 'Annual Energy Forecast', desc: 'Year-by-year analysis (2025-2030).' },
    { page: '13', title: 'Remediation Guide', desc: 'Favorable directions, colors, and adjustments.' },
    { page: '14', title: 'Personal Affirmation', desc: 'Your customized destiny affirmation.' },
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

    doc.fontSize(9)
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

    doc.fontSize(9)
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
  doc.fontSize(8)
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
    doc.fontSize(8)
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
  doc.fontSize(9)
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
  doc.fontSize(9)
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

  // Render fiveElementsInsight text from reportContent
  if (content) {
    const insightY = 540;
    doc.fontSize(7.5)
      .font('Helvetica')
      .fillColor(COLORS.textSecondary)
      .text(content, 55, insightY, { width: pageW - 110 });
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
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.blue)
      .text('WHAT ARE HIDDEN STEMS?', 55, yPos);

    doc.fontSize(6.5)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(content.intro, 55, yPos + 18, { width: pageW - 110 });
  } else {
    doc.fontSize(8)
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
  doc.fontSize(8)
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
  } else if (daYun.calculationDetail) {
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
  doc.fontSize(9)
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
  doc.fontSize(8)
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
  doc.fontSize(8)
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

  doc.fontSize(8)
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

  doc.fontSize(8)
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
    .text('YOUR AFFIRMATION', centerX, 158, { align: 'center', letterSpacing: 0.15 });

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

    // Footer line
    doc.rect(55, pageH - 35, pageW - 110, 0.5)
      .fillColor(COLORS.gold + '30');

    // Page number
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor(COLORS.textTertiary)
      .text(`Page ${i} of ${pages.count - 1}`, 55, pageH - 28);

    // Brand
    doc.fontSize(6)
.font('Helvetica')
      .fillColor(COLORS.gold + '50')
      .text('SOUL ELEMENTS', pageW - 140, pageH - 28, { width: 80, align: 'right' });
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

module.exports = {
  generatePDF,
  COLORS,
  ELEMENT_COLORS,
};
