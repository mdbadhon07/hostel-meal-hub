import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MemberSummary } from '@/types';

const formatTaka = (amount: number) => {
  const absAmount = Math.abs(amount);
  if (absAmount === 0) return '0 Tk';
  return `${Math.round(absAmount)} Tk`;
};

interface MonthlyStats {
  totalMeals: number;
  totalExpenses: number;
  totalExtraExpenses: number;
  totalDeposits: number;
  totalMaidPayments: number;
  mealRate: number;
}

export const generateTotalReportPDF = (
  monthlyStats: MonthlyStats,
  summaries: MemberSummary[],
  totalPositiveBalance: number,
  totalNegativeBalance: number
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with gradient-like background
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MESS MANAGER REPORT', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Summary Section Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('OVERALL SUMMARY', 14, 48);
  
  const totalBalance = monthlyStats.totalDeposits - monthlyStats.totalExpenses - monthlyStats.totalExtraExpenses - monthlyStats.totalMaidPayments;
  
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    startY: 52,
    head: [['Description', 'Value']],
    body: [
      ['Total Meals', monthlyStats.totalMeals.toFixed(1)],
      ['Market Expenses (Bazar)', formatTaka(monthlyStats.totalExpenses)],
      ['Extra Expenses', formatTaka(monthlyStats.totalExtraExpenses)],
      ['Maid Payment', formatTaka(monthlyStats.totalMaidPayments)],
      ['Total Deposits', formatTaka(monthlyStats.totalDeposits)],
      ['Cash Balance', `${totalBalance >= 0 ? '+' : ''}${formatTaka(totalBalance)}`],
      ['Meal Rate', `${formatTaka(monthlyStats.mealRate)} per meal`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 248, 255] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    },
  });
  
  // Balance Overview Section
  const balanceY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('BALANCE OVERVIEW', 14, balanceY);
  
  doc.setTextColor(0, 0, 0);
  
  // Balance boxes
  const boxY = balanceY + 5;
  const boxWidth = (pageWidth - 42) / 2;
  
  // Positive Balance Box (Green)
  doc.setFillColor(220, 252, 231);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(14, boxY, boxWidth, 25, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(22, 163, 74);
  doc.text('TOTAL RECEIVABLE (+)', 14 + boxWidth/2, boxY + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`+ ${formatTaka(totalPositiveBalance)}`, 14 + boxWidth/2, boxY + 19, { align: 'center' });
  
  // Negative Balance Box (Red)
  doc.setFillColor(254, 226, 226);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(28 + boxWidth, boxY, boxWidth, 25, 3, 3, 'FD');
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL PAYABLE (-)', 28 + boxWidth + boxWidth/2, boxY + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`- ${formatTaka(totalNegativeBalance)}`, 28 + boxWidth + boxWidth/2, boxY + 19, { align: 'center' });
  
  // Member Details Section
  const memberY = boxY + 35;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('MEMBER-WISE BREAKDOWN', 14, memberY);
  
  // Separate positive and negative balance members
  const positiveMembers = summaries.filter(s => s.balance > 0).sort((a, b) => b.balance - a.balance);
  const negativeMembers = summaries.filter(s => s.balance < 0).sort((a, b) => a.balance - b.balance);
  const zeroMembers = summaries.filter(s => s.balance === 0);
  
  doc.setTextColor(0, 0, 0);
  
  // All members table with visual balance indicators
  autoTable(doc, {
    startY: memberY + 5,
    head: [['#', 'Member Name', 'Meals', 'Cost', 'Deposit', 'Balance', 'Status']],
    body: summaries.map((s, index) => [
      (index + 1).toString(),
      s.name,
      s.totalMeals.toFixed(1),
      formatTaka(s.totalCost),
      formatTaka(s.totalDeposit),
      `${s.balance >= 0 ? '+' : ''}${formatTaka(s.balance)}`,
      s.balance > 0 ? '(+) PABE' : s.balance < 0 ? '(-) DEBE' : '(=) SOMAN',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
      6: { halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: function(data: any) {
      if (data.section === 'body' && data.column.index === 5) {
        const balance = summaries[data.row.index]?.balance || 0;
        if (balance > 0) {
          data.cell.styles.textColor = [22, 163, 74]; // Green
        } else if (balance < 0) {
          data.cell.styles.textColor = [220, 38, 38]; // Red
        }
      }
      if (data.section === 'body' && data.column.index === 6) {
        const balance = summaries[data.row.index]?.balance || 0;
        if (balance > 0) {
          data.cell.styles.fillColor = [220, 252, 231]; // Light green
          data.cell.styles.textColor = [22, 163, 74];
        } else if (balance < 0) {
          data.cell.styles.fillColor = [254, 226, 226]; // Light red
          data.cell.styles.textColor = [220, 38, 38];
        } else {
          data.cell.styles.fillColor = [243, 244, 246]; // Gray
        }
      }
    },
  });
  
  // Summary section at bottom
  const summaryY = (doc as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page
  if (summaryY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
  }
  
  const finalY = summaryY > doc.internal.pageSize.getHeight() - 40 ? 20 : summaryY;
  
  // Legend
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Legend:', 14, finalY);
  
  doc.setFillColor(220, 252, 231);
  doc.rect(14, finalY + 3, 8, 5, 'F');
  doc.setTextColor(22, 163, 74);
  doc.text('(+) PABE = Will Receive (Advance)', 24, finalY + 7);
  
  doc.setFillColor(254, 226, 226);
  doc.rect(90, finalY + 3, 8, 5, 'F');
  doc.setTextColor(220, 38, 38);
  doc.text('(-) DEBE = Will Pay (Due)', 100, finalY + 7);
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFillColor(59, 130, 246);
  doc.rect(0, footerY - 5, pageWidth, 15, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(255, 255, 255);
  doc.text('Generated by Mess Manager App', pageWidth / 2, footerY + 2, { align: 'center' });
  
  doc.save('mess-total-report.pdf');
};

export const generateMemberReportPDF = (
  member: MemberSummary,
  monthlyStats: MonthlyStats
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with color based on balance
  const headerColor = member.balance >= 0 ? [34, 197, 94] : [239, 68, 68];
  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('INDIVIDUAL MEMBER REPORT', pageWidth / 2, 15, { align: 'center' });
  
  // Member name
  doc.setFontSize(14);
  doc.text(`Member: ${member.name}`, pageWidth / 2, 26, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 35, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Status Banner
  const statusY = 50;
  const statusColor = member.balance > 0 ? [220, 252, 231] : member.balance < 0 ? [254, 226, 226] : [243, 244, 246];
  const statusTextColor = member.balance > 0 ? [22, 163, 74] : member.balance < 0 ? [220, 38, 38] : [107, 114, 128];
  
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(14, statusY, pageWidth - 28, 30, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusTextColor[0], statusTextColor[1], statusTextColor[2]);
  
  const statusText = member.balance > 0 
    ? `STATUS: (+) PABE - Will Receive`
    : member.balance < 0 
      ? `STATUS: (-) DEBE - Will Pay`
      : `STATUS: (=) SOMAN - Settled`;
  
  doc.text(statusText, pageWidth / 2, statusY + 12, { align: 'center' });
  
  doc.setFontSize(20);
  const balanceText = `${member.balance >= 0 ? '+' : ''}${formatTaka(member.balance)}`;
  doc.text(balanceText, pageWidth / 2, statusY + 24, { align: 'center' });
  
  // Meal Details Section
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MEAL DETAILS', 14, statusY + 45);
  
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    startY: statusY + 50,
    head: [['Description', 'Count']],
    body: [
      ['Total Lunch', member.totalLunch.toString()],
      ['Total Dinner', member.totalDinner.toString()],
      ['Total Meals', member.totalMeals.toFixed(1)],
      ['Meal Rate', `${formatTaka(monthlyStats.mealRate)} per meal`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 248, 255] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    },
  });
  
  // Financial Details Section
  const finY = (doc as any).lastAutoTable.finalY + 12;
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL DETAILS', 14, finY);
  
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    startY: finY + 5,
    head: [['Description', 'Amount']],
    body: [
      ['Total Cost (Meals x Rate)', formatTaka(member.totalCost)],
      ['Total Deposit', formatTaka(member.totalDeposit)],
      ['Balance (Deposit - Cost)', `${member.balance >= 0 ? '+' : ''}${formatTaka(member.balance)}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: member.balance >= 0 ? [34, 197, 94] : [239, 68, 68], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: member.balance >= 0 ? [220, 252, 231] : [254, 226, 226] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold' }
    },
  });
  
  // Final Summary Box
  const sumY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setDrawColor(statusTextColor[0], statusTextColor[1], statusTextColor[2]);
  doc.roundedRect(14, sumY, pageWidth - 28, 35, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusTextColor[0], statusTextColor[1], statusTextColor[2]);
  
  const summaryLine1 = member.balance > 0 
    ? `${member.name}`
    : member.balance < 0 
      ? `${member.name}`
      : `${member.name}`;
      
  const summaryLine2 = member.balance > 0 
    ? `Will RECEIVE ${formatTaka(member.balance)} (Advance Paid)`
    : member.balance < 0 
      ? `Needs to PAY ${formatTaka(Math.abs(member.balance))} (Due Amount)`
      : `Account is SETTLED (No Due)`;
  
  doc.text(summaryLine1, pageWidth / 2, sumY + 14, { align: 'center' });
  doc.setFontSize(14);
  doc.text(summaryLine2, pageWidth / 2, sumY + 26, { align: 'center' });
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.rect(0, footerY - 5, pageWidth, 15, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(255, 255, 255);
  doc.text('Generated by Mess Manager App', pageWidth / 2, footerY + 2, { align: 'center' });
  
  const safeName = member.name.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  doc.save(`mess-report-member-${safeName || member.memberId}.pdf`);
};
