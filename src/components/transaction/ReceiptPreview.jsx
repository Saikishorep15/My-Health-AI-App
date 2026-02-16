
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Printer } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const renderTemplate = (template, transaction, settings) => {
  if (!template) return "Receipt template is not defined in settings.";

  const transactionDate = new Date(transaction.transaction_date);

  // Create replacement data without pre-formatting - we'll handle positioning differently
  const data = {
    '{{company_name}}': settings.company_name || '',
    '{{company_address}}': settings.company_address || '',
    '{{company_phone}}': settings.company_phone || '',
    '{{rst_number}}': transaction.rst_number || '',
    '{{customer_name}}': transaction.customer_name || '',
    '{{vehicle_number}}': transaction.vehicle_number || '',
    '{{material_type}}': transaction.material_type || '',
    '{{gross_weight}}': transaction.gross_weight || '',
    '{{tare_weight}}': transaction.tare_weight || '',
    '{{net_weight}}': transaction.net_weight || '',
    '{{date1}}': format(transactionDate, 'dd/MM/yyyy'),
    '{{time1}}': format(transactionDate, 'h:mm'),
    '{{date2}}': format(transactionDate, 'dd/MM/yyyy'),
    '{{time2}}': format(transactionDate, 'h:mm'),
    '{{date}}': format(transactionDate, 'dd/MM/yyyy'),
    '{{time}}': format(transactionDate, 'h:mm'),
    '{{charges}}': 'RS(0)',
  };

  // Split template into lines and process each line to maintain exact positioning
  const lines = template.split('\n');
  const processedLines = lines.map(line => {
    let processedLine = line;
    
    // Find all placeholders in this line and their positions
    const placeholders = [];
    for (const placeholder in data) {
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      let match;
      while ((match = regex.exec(line)) !== null) {
        placeholders.push({
          placeholder: placeholder,
          start: match.index,
          end: match.index + placeholder.length,
          value: String(data[placeholder])
        });
      }
    }
    
    // Sort placeholders by position (right to left to avoid index shifting)
    placeholders.sort((a, b) => b.start - a.start);
    
    // Replace each placeholder while maintaining line length
    placeholders.forEach(({ placeholder, start, end, value }) => {
      const originalLength = placeholder.length;
      let replacementValue = value;
      
      if (placeholder === '{{company_name}}' || placeholder === '{{company_address}}' || placeholder === '{{company_phone}}' || 
          placeholder === '{{date1}}' || placeholder === '{{time1}}' || placeholder === '{{date2}}' || placeholder === '{{time2}}' ||
          placeholder === '{{date}}' || placeholder === '{{time}}') {
        // For these fields, perform a simple replace without length restriction
        replacementValue = value;
      } else {
        // For all other fields, truncate the value to fit the placeholder's original length.
        // This prevents long values (like customer name) from shifting the layout of other elements on the same line.
        replacementValue = value.substring(0, originalLength).padEnd(originalLength, ' ');
      }
      
      // Replace the placeholder in the line string
      processedLine = processedLine.substring(0, start) + 
                    replacementValue + 
                    processedLine.substring(end);
    });
    
    return processedLine;
  });

  return processedLines.join('\n');
};

export default function ReceiptPreview({ transaction, settings, onClose }) {

  const printReceipt = () => {
    const receiptContent = renderTemplate(settings.custom_receipt_layout, transaction, settings);
    const fontSize = settings.receipt_font_size || 12;
    const printWindow = window.open('', '_blank');
    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.rst_number}</title>
          <style>
            @page {
              size: 22cm 8cm;
              margin: 2mm;
            }
            @media print {
              body { 
                -webkit-print-color-adjust: exact; 
                margin: 0; 
                padding: 0;
                overflow: hidden;
              }
              .no-print { display: none; }
              * {
                box-sizing: border-box;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: ${fontSize}pt;
              line-height: 1.15;
              margin: 0;
              padding: 2mm;
              color: #000;
              width: 21.6cm;
              height: 7.6cm;
              overflow: hidden;
            }
            pre {
              white-space: pre;
              word-wrap: normal;
              overflow: hidden;
              margin: 0;
              padding: 0;
              font-family: inherit;
              font-size: inherit;
              line-height: inherit;
              max-height: 7.2cm;
            }
          </style>
        </head>
        <body>
          <pre>${receiptContent}</pre>
        </body>
      </html>
    `;
    
    printWindow.document.write(printDocument);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const receiptText = renderTemplate(settings.custom_receipt_layout, transaction, settings);
  const previewFontSize = `${settings.receipt_font_size || 12}pt`;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 mr-2 text-blue-600" />
            Receipt Preview - Dot-Matrix (22cm x 8cm)
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 overflow-auto bg-white border-2 border-dashed border-gray-300 receipt-preview">
          <pre 
            className="font-mono whitespace-pre" 
            style={{ fontSize: previewFontSize, lineHeight: '1.15' }}
          >
            {receiptText}
          </pre>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button
            onClick={printReceipt}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
