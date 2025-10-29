// PDF Utilities - Professional Letter PDF Generation
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PDFFont } from "pdf-lib";
import type { Letter } from "./types/database";

/**
 * Generate a professional PDF from a letter using pdf-lib
 * @param letter - The letter object from the database
 * @returns PDF as a Buffer
 */
export async function generateLetterPDF(letter: Letter): Promise<Buffer> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page with US Letter dimensions (612 x 792 points)
    const page = pdfDoc.addPage([612, 792]);

    // Get fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Page dimensions
    const { width, height } = page.getSize();
    const margin = 72; // 1 inch margins
    const maxWidth = width - 2 * margin;

    let yPosition = height - margin;

    // Helper function to draw text with word wrapping
    const drawText = (
      text: string,
      fontSize: number,
      useFont: PDFFont = font,
    ): void => {
      const lines = wrapText(text, maxWidth, fontSize, useFont);

      lines.forEach((line) => {
        if (yPosition < margin + 50) {
          // Add new page if needed
          const newPage = pdfDoc.addPage([612, 792]);
          yPosition = newPage.getHeight() - margin;
        }

        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: useFont,
          color: rgb(0, 0, 0),
        });

        yPosition -= fontSize + 4; // Line spacing
      });
    };

    // Format date
    const date = new Date(letter.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Draw date
    drawText(date, 11);
    yPosition -= 20;

    // Draw recipient address if available
    if (letter.recipient_address) {
      drawText(letter.recipient_address, 11);
      yPosition -= 20;
    }

    // Draw recipient name/salutation
    if (letter.recipient_name) {
      drawText(`Dear ${letter.recipient_name},`, 11, fontBold);
    } else {
      drawText("Dear Sir/Madam,", 11, fontBold);
    }
    yPosition -= 20;

    // Draw title (RE: line)
    drawText(`RE: ${letter.title}`, 11, fontBold);
    yPosition -= 20;

    // Draw letter content
    const content = letter.content || "";
    const paragraphs = content.split("\n\n");

    paragraphs.forEach((paragraph: string) => {
      if (paragraph.trim()) {
        drawText(paragraph.trim(), 11);
        yPosition -= 10; // Paragraph spacing
      }
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error("Failed to generate PDF");
  }
}

/**
 * Word wrapping helper function
 */
function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: PDFFont
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Client-side PDF download helper
 * @param name - Filename (without extension)
 * @param pdfBuffer - PDF data as Buffer or Uint8Array
 */
export function downloadLetterPDF(name: string, pdfBuffer: ArrayBuffer): void {
  const blob = new Blob([pdfBuffer], { type: "application/pdf" });
  const element = document.createElement("a");
  element.href = URL.createObjectURL(blob);
  element.download = `${name}.pdf`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
}

/**
 * Generate PDF from plain text content
 * @deprecated Use generateLetterPDF with Letter object instead
 */
export async function generatePDF(content: string): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const lines = content.split("\n");
  let yPosition = page.getHeight() - 72;

  lines.forEach((line) => {
    if (yPosition < 72) {
      return;
    }
    page.drawText(line, {
      x: 72,
      y: yPosition,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}
