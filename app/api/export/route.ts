import { NextRequest, NextResponse } from 'next/server';
import { Document, Paragraph, TextRun, Packer, AlignmentType } from 'docx';

// Helper function to parse markdown-like text into formatted runs
function parseTextToRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const lines = text.split('\n');
  
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      runs.push(new TextRun({ text: '', break: 1 }));
    }

    // Handle bold text (**text** or __text__)
    const boldPattern = /(\*\*|__)(.*?)\1/g;
    let lastIndex = 0;
    let match;

    while ((match = boldPattern.exec(line)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        runs.push(new TextRun({ text: line.substring(lastIndex, match.index) }));
      }
      // Add bold text
      runs.push(new TextRun({ text: match[2], bold: true }));
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < line.length) {
      runs.push(new TextRun({ text: line.substring(lastIndex) }));
    }
  });

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

// Helper function to parse text into paragraphs with formatting
function parseTextToParagraphs(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = text.split('\n');
  
  lines.forEach((line) => {
    // Check for headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: headingMatch[2], bold: true, size: 28 - (level * 2) })],
        spacing: { before: 200, after: 100 },
      }));
      return;
    }

    // Check for bullet points
    if (line.match(/^[\*\-\+]\s+/)) {
      const text = line.replace(/^[\*\-\+]\s+/, '');
      paragraphs.push(new Paragraph({
        children: parseTextToRuns(text),
        bullet: { level: 0 },
        spacing: { before: 50, after: 50 },
      }));
      return;
    }

    // Check for numbered lists
    if (line.match(/^\d+\.\s+/)) {
      const text = line.replace(/^\d+\.\s+/, '');
      paragraphs.push(new Paragraph({
        children: parseTextToRuns(text),
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 50, after: 50 },
      }));
      return;
    }

    // Regular paragraph
    if (line.trim()) {
      paragraphs.push(new Paragraph({
        children: parseTextToRuns(line),
        spacing: { after: 100 },
      }));
    } else {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
    }
  });

  return paragraphs;
}

// Helper to strip markdown for plain text
function stripMarkdown(text: string): string {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')  // Bold
    .replace(/(\*|_)(.*?)\1/g, '$2')      // Italic
    .replace(/^#{1,6}\s+/gm, '')          // Headers
    .replace(/^[\*\-\+]\s+/gm, '• ')      // Bullet points
    .replace(/`{3}[\s\S]*?`{3}/g, '')     // Code blocks
    .replace(/`([^`]+)`/g, '$1');         // Inline code
}

export async function POST(request: NextRequest) {
  try {
    const { messages, format } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages to export' },
        { status: 400 }
      );
    }

    if (format === 'word') {
      // Generate Word document with rich formatting
      const children: Paragraph[] = [
        new Paragraph({
          children: [
            new TextRun({
              text: 'AI Chat Export',
              bold: true,
              size: 32,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Exported on: ${new Date().toLocaleString()}`,
              italics: true,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      ];

      messages.forEach((msg: any) => {
        // Sender header
        children.push(new Paragraph({
          children: [
            new TextRun({
              text: `${msg.sender === 'user' ? 'You' : 'AI'} - ${new Date(msg.timestamp).toLocaleTimeString()}`,
              bold: true,
              color: msg.sender === 'user' ? '2563EB' : '059669',
              size: 24,
            }),
          ],
          spacing: { before: 300, after: 100 },
        }));

        // Message content with formatting
        const contentParagraphs = parseTextToParagraphs(msg.text);
        children.push(...contentParagraphs);
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      
      return new NextResponse(Buffer.from(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="chat-export-${Date.now()}.docx"`,
        },
      });

    } else if (format === 'pdf') {
      // Generate a simple PDF manually (no external dependencies with font issues)
      const pdfContent = generateSimplePDF(messages);
      
      return new NextResponse(new Uint8Array(pdfContent), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="chat-export-${Date.now()}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

// Generate a simple PDF without external font dependencies
function generateSimplePDF(messages: any[]): Buffer {
  const objects: string[] = [];
  let objectCount = 0;
  
  const addObject = (content: string): number => {
    objectCount++;
    objects.push(`${objectCount} 0 obj\n${content}\nendobj\n`);
    return objectCount;
  };
  
  // PDF content stream
  let content = '';
  let yPos = 750;
  const lineHeight = 14;
  const pageWidth = 595;
  const margin = 50;
  const maxWidth = pageWidth - 2 * margin;
  
  // Title
  content += `BT /F1 18 Tf ${margin} ${yPos} Td (AI Chat Export) Tj ET\n`;
  yPos -= 25;
  content += `BT /F1 10 Tf ${margin} ${yPos} Td (Exported on: ${new Date().toLocaleString()}) Tj ET\n`;
  yPos -= 30;
  
  // Draw a line
  content += `${margin} ${yPos} m ${pageWidth - margin} ${yPos} l S\n`;
  yPos -= 20;
  
  // Messages
  messages.forEach((msg: any) => {
    if (yPos < 100) {
      yPos = 750; // Simple page break handling (won't create new page, just resets)
    }
    
    // Sender
    const sender = msg.sender === 'user' ? 'You' : 'AI';
    const time = new Date(msg.timestamp).toLocaleTimeString();
    content += `BT /F1 11 Tf ${margin} ${yPos} Td (${escapeForPDF(`${sender} - ${time}`)}) Tj ET\n`;
    yPos -= lineHeight + 2;
    
    // Message text (simplified, break into lines)
    const cleanText = stripMarkdown(msg.text);
    const lines = wrapText(cleanText, 80); // ~80 chars per line
    
    lines.forEach(line => {
      if (yPos < 50) return; // Stop if near bottom
      content += `BT /F1 10 Tf ${margin + 10} ${yPos} Td (${escapeForPDF(line)}) Tj ET\n`;
      yPos -= lineHeight;
    });
    
    yPos -= 10; // Extra space between messages
  });
  
  // Build PDF structure
  const catalogRef = addObject('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesRef = addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  const pageRef = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`);
  
  const streamContent = content;
  const streamLength = Buffer.byteLength(streamContent, 'latin1');
  addObject(`<< /Length ${streamLength} >>\nstream\n${streamContent}endstream`);
  
  // Simple built-in font (Helvetica)
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  
  // Build xref and trailer
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  
  objects.forEach(obj => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += obj;
  });
  
  const xrefStart = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objectCount + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach(offset => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  
  pdf += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;
  
  return Buffer.from(pdf, 'latin1');
}

function escapeForPDF(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\x00-\x1f\x7f-\xff]/g, ''); // Remove non-printable chars
}

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  
  paragraphs.forEach(para => {
    if (para.length <= maxChars) {
      lines.push(para);
      return;
    }
    
    const words = para.split(' ');
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + ' ' + word).trim().length <= maxChars) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
  });
  
  return lines;
}
