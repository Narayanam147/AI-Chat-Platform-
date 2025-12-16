import { NextRequest, NextResponse } from 'next/server';
import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel } from 'docx';
import PDFDocument from 'pdfkit';

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

// Helper function to render formatted text in PDF
function renderFormattedPDF(doc: PDFKit.PDFDocument, text: string) {
  const lines = text.split('\n');
  
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) doc.moveDown(0.3);

    // Check for headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const size = 16 - level;
      doc.fontSize(size).font('Helvetica-Bold').fillColor('#000000').text(headingMatch[2]);
      return;
    }

    // Check for bullet points
    if (line.match(/^[\*\-\+]\s+/)) {
      const text = line.replace(/^[\*\-\+]\s+/, '');
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text(`• ${text}`, { indent: 20 });
      return;
    }

    // Check for numbered lists
    if (line.match(/^\d+\.\s+/)) {
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text(line, { indent: 20 });
      return;
    }

    // Handle bold text in line
    const boldPattern = /(\*\*|__)(.*?)\1/g;
    let lastIndex = 0;
    let match;
    let hasBold = false;

    while ((match = boldPattern.exec(line)) !== null) {
      hasBold = true;
      // Print text before bold
      if (match.index > lastIndex) {
        doc.fontSize(10).font('Helvetica').fillColor('#000000').text(line.substring(lastIndex, match.index), { continued: true });
      }
      // Print bold text
      doc.font('Helvetica-Bold').text(match[2], { continued: true });
      lastIndex = match.index + match[0].length;
    }
    
    if (hasBold) {
      // Print remaining text
      if (lastIndex < line.length) {
        doc.font('Helvetica').text(line.substring(lastIndex));
      } else {
        doc.text(''); // End the line
      }
    } else {
      // No bold, just print normally
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text(line);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { messages, format, userId } = await request.json();

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
      // Generate PDF document with rich formatting
      return new Promise<NextResponse>((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="chat-export-${Date.now()}.pdf"`,
            },
          }));
        });

        // Title
        doc.fontSize(20).font('Helvetica-Bold').text('AI Chat Export', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Exported on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(1.5);

        // Messages
        messages.forEach((msg: any, index: number) => {
          if (index > 0) doc.moveDown(0.5);
          
          // Sender header
          doc.fontSize(12).font('Helvetica-Bold')
            .fillColor(msg.sender === 'user' ? '#2563EB' : '#059669')
            .text(`${msg.sender === 'user' ? 'You' : 'AI'} - ${new Date(msg.timestamp).toLocaleTimeString()}`);
          
          doc.moveDown(0.4);
          
          // Message text with formatting
          renderFormattedPDF(doc, msg.text);
          
          if (index < messages.length - 1) {
            doc.moveDown(0.5);
            doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
          }
        });

        doc.end();
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
