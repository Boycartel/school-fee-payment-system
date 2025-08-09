import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"

// PDF Receipt Component using @react-pdf/renderer
const ReceiptPDF = ({ receiptData }: { receiptData: any }) => {
  const { Page, Text, View, Document, StyleSheet } = require("@react-pdf/renderer")

  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      padding: 30,
    },
    header: {
      alignItems: "center",
      marginBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: "#0e1c36",
      paddingBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#0e1c36",
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 12,
      color: "#4a90e2",
    },
    receiptTitle: {
      backgroundColor: "#f8f9fa",
      borderWidth: 1,
      borderColor: "#dee2e6",
      borderRadius: 4,
      padding: 15,
      textAlign: "center",
      marginBottom: 20,
    },
    receiptTitleText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#000",
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#0e1c36",
      borderBottomWidth: 1,
      borderBottomColor: "#4a90e2",
      paddingBottom: 5,
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      marginBottom: 8,
    },
    label: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#666",
      width: "40%",
      textTransform: "uppercase",
    },
    value: {
      fontSize: 10,
      color: "#333",
      width: "60%",
    },
    summary: {
      backgroundColor: "#f8f9fa",
      borderRadius: 4,
      padding: 15,
      marginVertical: 15,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    summaryTotal: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#0e1c36",
      fontWeight: "bold",
    },
    amount: {
      color: "#0e1c36",
      fontWeight: "bold",
    },
    footer: {
      textAlign: "center",
      marginTop: 20,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: "#dee2e6",
      fontSize: 8,
      color: "#666",
    },
    verificationNote: {
      backgroundColor: "#e7f3ff",
      borderLeftWidth: 4,
      borderLeftColor: "#4a90e2",
      padding: 15,
      marginVertical: 15,
      borderRadius: 4,
    },
  })

  const { student, payment, fee, summary } = receiptData

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, "The Federal Polytechnic Bida"),
        React.createElement(Text, { style: styles.subtitle }, "Fee Confirmation System"),
      ),

      // Receipt Title
      React.createElement(
        View,
        { style: styles.receiptTitle },
        React.createElement(Text, { style: styles.receiptTitleText }, "PAYMENT RECEIPT"),
      ),

      // Student Information
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Student Information"),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Full Name:"),
          React.createElement(Text, { style: styles.value }, student.full_name),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Matric Number:"),
          React.createElement(Text, { style: styles.value }, student.matric_number),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Level:"),
          React.createElement(Text, { style: styles.value }, student.level),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Department:"),
          React.createElement(Text, { style: styles.value }, student.department_name),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "School:"),
          React.createElement(Text, { style: styles.value }, student.school_name),
        ),
      ),

      // Payment Details
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Payment Details"),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Receipt Number:"),
          React.createElement(Text, { style: styles.value }, payment.receipt_number),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Payment Reference:"),
          React.createElement(Text, { style: styles.value }, payment.reference),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Payment Date:"),
          React.createElement(
            Text,
            { style: styles.value },
            new Date(payment.payment_date).toLocaleDateString("en-GB"),
          ),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Academic Session:"),
          React.createElement(Text, { style: styles.value }, payment.academic_session),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Fee Type:"),
          React.createElement(Text, { style: styles.value }, payment.fee_type),
        ),
      ),

      // Fee Information
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Fee Information"),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Fee Name:"),
          React.createElement(Text, { style: styles.value }, fee.fee_name),
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Total Fee Amount:"),
          React.createElement(Text, { style: [styles.value, styles.amount] }, `₦${fee.total_amount.toLocaleString()}`),
        ),
      ),

      // Payment Summary
      React.createElement(
        View,
        { style: styles.summary },
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, {}, "Amount Paid (This Transaction):"),
          React.createElement(Text, { style: styles.amount }, `₦${payment.amount.toLocaleString()}`),
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, {}, "Total Amount Paid:"),
          React.createElement(Text, { style: styles.amount }, `₦${summary.total_paid.toLocaleString()}`),
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, {}, "Outstanding Balance:"),
          React.createElement(Text, { style: styles.amount }, `₦${summary.balance.toLocaleString()}`),
        ),
        React.createElement(
          View,
          { style: styles.summaryTotal },
          React.createElement(Text, {}, "Total Fee Amount:"),
          React.createElement(Text, { style: styles.amount }, `₦${fee.total_amount.toLocaleString()}`),
        ),
      ),

      // Verification Note
      React.createElement(
        View,
        { style: styles.verificationNote },
        React.createElement(
          Text,
          {},
          `Payment Verification: This payment has been successfully verified and processed. You can verify this payment anytime by visiting our verification portal with your payment reference: ${payment.reference}`,
        ),
      ),

      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, {}, "The Federal Polytechnic Bida"),
        React.createElement(Text, {}, "Automated Fee Confirmation System"),
        React.createElement(Text, {}, "This is an automated email. Please do not reply to this message."),
        React.createElement(Text, {}, "For support, contact the Bursary Department."),
        React.createElement(
          Text,
          {},
          `© ${new Date().getFullYear()} The Federal Polytechnic Bida. All rights reserved.`,
        ),
      ),
    ),
  )
}

export async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  try {
    const pdfBuffer = await renderToBuffer(ReceiptPDF({ receiptData }))
    return pdfBuffer
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF receipt")
  }
}
