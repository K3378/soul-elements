/**
 * Test live PDF generation with real bazi data from API
 */
const https = require('https');

const API = 'https://stemssouls.up.railway.app';
const fs = require('fs');

// Step 1: Get bazi data
const analyzeData = JSON.stringify({
  birthDate: '1997-07-01',
  birthTime: '00:00',
  latitude: 22.3,
  longitude: 114.17,
  timezone: 'Asia/Hong_Kong',
  timezoneOffset: 8,
  gender: 'male',
  goal: 'all'
});

const options = {
  hostname: 'stemssouls.up.railway.app',
  path: '/api/analyze',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    console.log('Got bazi data. Day Master:', data.bazi.dayMaster.en);
    console.log('DaYun starting age:', data.bazi.daYun?.startingAge);
    console.log('Annual forecasts:', data.bazi.annualForecasts?.length);

    // Step 2: Generate PDF
    const pdfPayload = JSON.stringify({ bazi: data.bazi, tier: 'standard' });
    
    const pdfReq = https.request({
      hostname: 'stemssouls.up.railway.app',
      path: '/api/report/generate-pdf',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (pdfRes) => {
      const chunks = [];
      pdfRes.on('data', (c) => chunks.push(c));
      pdfRes.on('end', () => {
        const buf = Buffer.concat(chunks);
        const path = '/Users/kevinchan/Desktop/soul-pdf-samples/live_standard.pdf';
        fs.writeFileSync(path, buf);
        
        const content = buf.toString('latin1');
        const pages = (content.match(/\/Type\s*\/Page[^s]/g) || []).length;
        console.log('PDF: ' + (buf.length/1024).toFixed(0) + ' KB, ' + pages + ' pages, saved to ' + path);
      });
    });

    pdfReq.write(pdfPayload);
    pdfReq.end();
  });
});

req.write(analyzeData);
req.end();
