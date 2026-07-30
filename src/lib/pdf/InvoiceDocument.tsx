import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#1f2937" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  nurseryName: { fontSize: 18, fontWeight: 700 },
  small: { fontSize: 9, color: "#6b7280" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  section: { marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  table: { marginTop: 12, borderTop: "1px solid #e5e7eb" },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #e5e7eb", paddingVertical: 6 },
  tableHeader: { flexDirection: "row", paddingVertical: 6, borderBottom: "1px solid #1f2937" },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totalLabel: { fontSize: 13, fontWeight: 700, marginRight: 12 },
  totalValue: { fontSize: 13, fontWeight: 700 },
  badge: { fontSize: 10, fontWeight: 700, padding: "4 8", borderRadius: 4 },
});

export interface InvoicePdfData {
  invoiceNumber: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  paidAt: Date | null;
  notes: string | null;
  childName: string;
  parentName: string;
  nurseryName: string;
  nurseryAddress: string | null;
  nurseryEmail: string | null;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
}

export function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const total = data.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.nurseryName}>{data.nurseryName}</Text>
            {data.nurseryAddress && <Text style={styles.small}>{data.nurseryAddress}</Text>}
            {data.nurseryEmail && <Text style={styles.small}>{data.nurseryEmail}</Text>}
          </View>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.small}>{data.invoiceNumber}</Text>
            <Text style={styles.small}>Status: {data.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Billed to: {data.parentName}</Text>
            <Text>Child: {data.childName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.small}>Issue date: {formatDate(data.issueDate)}</Text>
            <Text style={styles.small}>Due date: {formatDate(data.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {data.lineItems.map((li, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{li.description}</Text>
              <Text style={styles.colQty}>{li.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(li.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(li.quantity * li.unitPrice)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total due</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>

        {data.paidAt && <Text style={{ marginTop: 8, color: "#15803d" }}>Paid on {formatDate(data.paidAt)}</Text>}
        {data.notes && <Text style={{ marginTop: 16, fontSize: 10, color: "#6b7280" }}>Notes: {data.notes}</Text>}
      </Page>
    </Document>
  );
}
