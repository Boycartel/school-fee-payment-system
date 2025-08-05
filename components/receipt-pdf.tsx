// components/receipt-pdf.tsx
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer"
import { ReceiptData } from "./payment-receipt"

// Create styles
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
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0e1c36",
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
    padding: 10,
    textAlign: "center",
    marginBottom: 20,
  },
  receiptTitleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0e1c36",
    borderBottomWidth: 1,
    borderBottomColor: "#4a90e2",
    paddingBottom: 3,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  gridItem: {
    width: "50%",
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 10,
    color: "#333",
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
  amount: {
    color: "#0e1c36",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
    fontSize: 8,
    color: "#666",
  },
})

export function ReceiptPDF({ receipt }: { receipt: ReceiptData }) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"}/verify?reference=${receipt.payment.reference}&auto=true`
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/images/bida-logo.png" style={styles.logo} />
          <Text style={styles.title}>The Federal Polytechnic Bida</Text>
          <Text style={styles.subtitle}>Niger State, North Central, Nigeria</Text>
        </View>

        {/* Receipt Title */}
        <View style={styles.receiptTitle}>
          <Text style={styles.receiptTitleText}>PAYMENT RECEIPT</Text>
        </View>

        {/* Student Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{receipt.student.full_name}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Matric Number</Text>
              <Text style={styles.value}>{receipt.student.matric_number}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Level</Text>
              <Text style={styles.value}>{receipt.student.level}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Department</Text>
              <Text style={styles.value}>{receipt.student.department_name}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>School</Text>
              <Text style={styles.value}>{receipt.student.school_name}</Text>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Receipt Number</Text>
              <Text style={styles.value}>{receipt.payment.receipt_number}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Reference Number</Text>
              <Text style={styles.value}>{receipt.payment.reference}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Payment Date</Text>
              <Text style={styles.value}>
                {new Date(receipt.payment.payment_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Academic Session</Text>
              <Text style={styles.value}>{receipt.payment.academic_session}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Payment Method</Text>
              <Text style={styles.value}>{receipt.payment.payment_method}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Fee Type</Text>
              <Text style={styles.value}>{receipt.payment.fee_type}</Text>
            </View>
          </View>
        </View>

        {/* Fee Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fee Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Fee Name</Text>
              <Text style={styles.value}>{receipt.fee.fee_name}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Total Fee Amount</Text>
              <Text style={[styles.value, styles.amount]}>
                ₦{receipt.fee.total_amount.toLocaleString()}
              </Text>
            </View>
            {receipt.payment.total_installments && receipt.payment.total_installments > 1 && (
              <>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Installment</Text>
                  <Text style={styles.value}>
                    {receipt.payment.installment_number} of {receipt.payment.total_installments}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>This Payment</Text>
                  <Text style={[styles.value, styles.amount]}>
                    ₦{receipt.payment.amount.toLocaleString()}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Amount Paid (This Transaction):</Text>
            <Text style={styles.amount}>₦{receipt.payment.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Total Amount Paid:</Text>
            <Text style={styles.amount}>₦{receipt.summary.total_paid.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Outstanding Balance:</Text>
            <Text style={styles.amount}>
              {receipt.summary.balance > 0 
                ? `₦${receipt.summary.balance.toLocaleString()}` 
                : "FULLY PAID"}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#0e1c36' }]}>
            <Text style={{ fontWeight: 'bold' }}>Total Fee Amount:</Text>
            <Text style={[styles.amount, { fontWeight: 'bold' }]}>
              ₦{receipt.fee.total_amount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is an official receipt from The Federal Polytechnic Bida</Text>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
          <Text>For verification, visit our portal with reference: {receipt.payment.reference}</Text>
        </View>
      </Page>
    </Document>
  )
}
