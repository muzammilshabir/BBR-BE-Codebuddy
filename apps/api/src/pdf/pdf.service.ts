import PDFDocument from 'pdfkit';
import { Injectable } from '@nestjs/common';
import { Refund } from 'src/stripe/schema/refund.schema';

@Injectable()
export class PdfService {
  async generateRefundReceipt(refund: Refund): Promise<Buffer> {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    doc.fontSize(25).text('Refund Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Refund ID: ${refund._id}`);
    doc.text(`Amount: $${refund.amount.toFixed(2)}`);
    doc.text(`Status: ${refund.status}`);
    doc.text(`Date: ${refund.createdAt.toDateString()}`);
    doc.moveDown();
    doc.text(`Invoice Number: ${(refund.invoiceId as any).invoiceNumber}`);
    doc.text(`Customer: ${(refund.invoiceId as any).developerId.fullName}`);
    doc.text(`Reason: ${refund.reason}`);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }
}