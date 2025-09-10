import fs from 'fs/promises';
import mammoth from 'mammoth';
import PDFParser from 'pdf2json';

export async function extractTextFromFile(filePath, mimeType) {
  try {
    const buffer = await fs.readFile(filePath);
    
    if (mimeType === 'application/pdf') {
      return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true); // Enable verbose mode for debugging
        pdfParser.on('pdfParser_dataError', errData => {
          console.error('PDF parsing error:', errData.parserError);
          reject(new Error(`PDF parsing failed: ${errData.parserError}`));
        });
        pdfParser.on('pdfParser_dataReady', pdfData => {
          const text = pdfParser.getRawTextContent();
          console.log('Extracted PDF text:', text ? text.slice(0, 100) : 'No text extracted');
          if (!text) {
            reject(new Error('No text extracted from PDF'));
          } else {
            resolve(text);
          }
        });
        console.log('Parsing PDF:', filePath);
        pdfParser.parseBuffer(buffer);
      });
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      console.log('Extracted DOCX text:', result.value.slice(0, 100));
      return result.value;
    } else if (mimeType === 'text/plain') {
      const text = buffer.toString('utf-8');
      console.log('Extracted TXT text:', text.slice(0, 100));
      return text;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}