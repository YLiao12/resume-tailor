import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Element not found')
  }

  // Create canvas from element
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  // Calculate PDF dimensions (A4)
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  
  const imgX = (pdfWidth - imgWidth * ratio) / 2
  const scaledWidth = imgWidth * ratio
  const scaledHeight = imgHeight * ratio
  
  // If content fits on one page
  if (scaledHeight <= pdfHeight - 20) {
    pdf.addImage(imgData, 'PNG', imgX, 10, scaledWidth, scaledHeight)
  } else {
    // Multi-page handling
    let heightLeft = scaledHeight
    let position = 10
    
    // First page
    pdf.addImage(imgData, 'PNG', imgX, position, scaledWidth, scaledHeight)
    heightLeft -= (pdfHeight - 20)
    
    // Additional pages
    while (heightLeft > 0) {
      pdf.addPage()
      position = -((scaledHeight - heightLeft) - 10)
      pdf.addImage(imgData, 'PNG', imgX, position, scaledWidth, scaledHeight)
      heightLeft -= (pdfHeight - 20)
    }
  }
  
  pdf.save(filename)
}

export function exportToMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
