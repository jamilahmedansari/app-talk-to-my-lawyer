// PDF Utilities
import type { Letter } from "./types/database";

/**
 * Generate a PDF buffer from a letter
 * In production, you would use a library like pdf-lib, jsPDF, or Puppeteer
 */
export async function generateLetterPDF(letter: Letter): Promise<Buffer> {
  // Simple text-based PDF generation
  // In production, replace this with proper PDF generation using pdf-lib or similar
  
  const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 500 >>
stream
BT
/F1 12 Tf
50 750 Td
(${letter.title}) Tj
0 -20 Td
(${new Date(letter.created_at).toLocaleDateString()}) Tj
0 -40 Td
${letter.recipient_name ? `(To: ${letter.recipient_name}) Tj` : ''}
${letter.recipient_address ? `0 -20 Td (${letter.recipient_address}) Tj` : ''}
0 -40 Td
(${letter.content.substring(0, 500)}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000298 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
850
%%EOF
  `.trim();

  return Buffer.from(pdfContent, 'utf-8');
}

export function downloadLetterPDF(name: string, content: string): void {
  // Client-side PDF download
  const element = document.createElement('a');
  const blob = new Blob([content], { type: 'application/pdf' });
  element.href = URL.createObjectURL(blob);
  element.download = `${name}.pdf`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export async function generatePDF(content: string): Promise<Blob> {
  // Simple PDF generation
  return new Blob([content], { type: 'application/pdf' });
}
