
const fs = require('fs');
const path = require('path');

function extractSvgText() {
    console.log('--- SVG Text Content ---');
    const svgPath = 'E-learning Hackathon Mockup - 24 hours.excalidraw.svg';
    if (!fs.existsSync(svgPath)) return console.log('SVG not found');
    const content = fs.readFileSync(svgPath, 'utf8');
    const matches = content.match(/<text[^>]*>([^<]*)<\/text>/g);
    if (matches) {
        const texts = matches.map(m => m.replace(/<[^>]*>/g, '').trim()).filter(Boolean);
        const uniqueTexts = [...new Set(texts)];
        uniqueTexts.forEach(t => console.log(t));
    } else {
        console.log('No text tags found in SVG');
    }
}

function extractDocxText() {
    console.log('\n--- Docx Text Content ---');
    const xmlPath = 'temp_docx/word/document.xml';
    if (!fs.existsSync(xmlPath)) return console.log('temp_docx/word/document.xml not found');
    const content = fs.readFileSync(xmlPath, 'utf8');
    const matches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (matches) {
        console.log(matches.map(m => m.replace(/<[^>]*>/g, '')).join(' '));
    } else {
        console.log('No text found in docx XML');
    }
}

function scanPdf() {
    console.log('\n--- PDF Scanned Strings ---');
    const pdfPath = 'LearnSphere (eLearning Platform).pdf';
    if (!fs.existsSync(pdfPath)) return console.log('PDF not found');
    const buffer = fs.readFileSync(pdfPath);
    // Find strings of length > 5
    let currentStr = '';
    const strings = [];
    for (let i = 0; i < buffer.length; i++) {
        const c = buffer[i];
        if (c >= 32 && c <= 126) {
            currentStr += String.fromCharCode(c);
        } else {
            if (currentStr.length > 10) {
                strings.push(currentStr);
            }
            currentStr = '';
        }
    }
    // Filter out some garbage
    const filtered = strings.filter(s => /[a-zA-Z]/.test(s));
    console.log(filtered.slice(0, 50).join('\n'));
}

extractSvgText();
extractDocxText();
scanPdf();
