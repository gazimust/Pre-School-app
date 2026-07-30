import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatDate } from "@/lib/utils";
import { DEVELOPMENT_LEVEL_LABEL, REPORT_TYPE_LABEL } from "@/lib/eyfs";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#1f2937" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  nurseryName: { fontSize: 16, fontWeight: 700 },
  small: { fontSize: 9, color: "#6b7280" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 11, color: "#6b7280", marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6, marginTop: 14 },
  paragraph: { marginBottom: 8, lineHeight: 1.5 },
  areaBox: { border: "1px solid #e5e7eb", borderRadius: 4, padding: 8, marginBottom: 8 },
  areaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  areaName: { fontSize: 11, fontWeight: 700 },
  areaLevel: { fontSize: 10, fontWeight: 700 },
  areaComment: { fontSize: 10, color: "#374151" },
});

export interface ReportPdfData {
  nurseryName: string;
  childName: string;
  ageBandLabel: string;
  type: string;
  periodLabel: string;
  generatedAt: Date;
  summary: string;
  nextSteps: string | null;
  entries: { areaName: string; level: string; comment: string | null }[];
}

export function ReportDocument({ data }: { data: ReportPdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.nurseryName}>{data.nurseryName}</Text>
          <Text style={styles.small}>Generated {formatDate(data.generatedAt)}</Text>
        </View>

        <Text style={styles.title}>{REPORT_TYPE_LABEL[data.type] ?? data.type}</Text>
        <Text style={styles.subtitle}>
          {data.childName} · {data.periodLabel} · EYFS band: {data.ageBandLabel}
        </Text>

        <Text style={styles.sectionTitle}>Overall summary</Text>
        <Text style={styles.paragraph}>{data.summary}</Text>

        <Text style={styles.sectionTitle}>Progress by EYFS area of learning</Text>
        {data.entries.map((entry, i) => (
          <View key={i} style={styles.areaBox}>
            <View style={styles.areaRow}>
              <Text style={styles.areaName}>{entry.areaName}</Text>
              <Text style={styles.areaLevel}>{DEVELOPMENT_LEVEL_LABEL[entry.level] ?? entry.level}</Text>
            </View>
            {entry.comment && <Text style={styles.areaComment}>{entry.comment}</Text>}
          </View>
        ))}

        {data.nextSteps && (
          <>
            <Text style={styles.sectionTitle}>Next steps</Text>
            <Text style={styles.paragraph}>{data.nextSteps}</Text>
          </>
        )}
      </Page>
    </Document>
  );
}
