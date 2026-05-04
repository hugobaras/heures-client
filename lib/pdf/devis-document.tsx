import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Prisma } from "@prisma/client";

export type DevisPdfProps = {
  issuer: {
    name: string;
    siret?: string;
    vatNumber?: string;
    address?: string;
  };
  clientName: string;
  clientEmail?: string | null;
  quoteTitle?: string | null;
  /** Ex. DEV-A1B2C3D4 pour rappel dans l’en-tête */
  documentRef: string;
  periodLabel: string;
  createdLabel: string;
  lines: {
    label: string;
    billableHours: Prisma.Decimal | string;
    unitPrice: Prisma.Decimal | string;
    lineTotal: Prisma.Decimal | string;
  }[];
  subtotal: number;
  vatRate: number | null;
  vatAmount: number | null;
  totalTtc: number;
  currency: string;
};

function n(v: Prisma.Decimal | string | number): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number.parseFloat(v);
  return v.toNumber();
}

function fmtMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency === "EUR" ? "EUR" : "EUR",
  }).format(amount);
}

function fmtHours(h: number) {
  return `${h.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h`;
}

/* Palette pro, proche du thème clair de l’app */
const colors = {
  ink: "#141210",
  inkSoft: "#3d3830",
  muted: "#6b655a",
  faint: "#9a9488",
  paper: "#fefdfb",
  wash: "#f4f0e8",
  headerTable: "#ebe4d6",
  rowAlt: "#faf7f1",
  border: "#d9d2c4",
  accent: "#9a5f18",
  accentBar: "#c47a14",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: colors.ink,
  },
  bleedBar: {
    height: 7,
    width: "100%",
    backgroundColor: colors.accentBar,
  },
  content: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 52,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "stretch",
    flex: 1,
  },
  accentRule: {
    width: 5,
    backgroundColor: colors.accentBar,
    marginRight: 18,
  },
  titleBlock: {
    flex: 1,
  },
  docType: {
    fontFamily: "Times-Bold",
    fontSize: 26,
    letterSpacing: 2.5,
    color: colors.ink,
    marginBottom: 6,
  },
  docSubtitle: {
    fontSize: 11,
    color: colors.inkSoft,
    lineHeight: 1.45,
    maxWidth: 320,
  },
  metaCard: {
    width: 168,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metaLabel: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: colors.ink,
  },
  metaValueSmall: {
    fontSize: 8.5,
    color: colors.inkSoft,
    marginTop: 2,
    lineHeight: 1.35,
  },
  partiesRow: {
    flexDirection: "row",
    marginBottom: 26,
  },
  partyBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.wash,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 108,
  },
  partyLabel: {
    fontSize: 7.5,
    letterSpacing: 1,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
  },
  partyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: colors.ink,
    marginBottom: 6,
  },
  partyLine: {
    fontSize: 9,
    color: colors.inkSoft,
    lineHeight: 1.45,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    letterSpacing: 0.4,
    color: colors.ink,
  },
  sectionRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  thRow: {
    flexDirection: "row",
    backgroundColor: colors.headerTable,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  thText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 0.6,
    color: colors.ink,
    textTransform: "uppercase",
  },
  trRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trAlt: {
    backgroundColor: colors.rowAlt,
  },
  tdDesc: { width: "40%", paddingRight: 8 },
  tdHours: { width: "18%", textAlign: "right" },
  tdPu: { width: "21%", textAlign: "right" },
  tdTot: { width: "21%", textAlign: "right" },
  tdMain: {
    fontSize: 9.5,
    color: colors.ink,
  },
  tdMuted: {
    fontSize: 9,
    color: colors.muted,
  },
  totalsWrap: {
    marginTop: 22,
    alignItems: "flex-end",
  },
  totalsCard: {
    width: 232,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLineLast: {
    marginBottom: 0,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 9.5,
    color: colors.inkSoft,
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: colors.ink,
  },
  grandLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: colors.ink,
  },
  grandValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: colors.accentBar,
  },
  footer: {
    marginTop: 36,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBrand: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  footerLegal: {
    fontSize: 7.5,
    color: colors.faint,
    lineHeight: 1.5,
  },
  footerHint: {
    marginTop: 10,
    fontSize: 8,
    color: colors.muted,
    fontFamily: "Helvetica-Oblique",
  },
});

export function DevisPdfDocument(props: DevisPdfProps) {
  const { issuer, lines, currency, documentRef } = props;
  const subject = props.quoteTitle?.trim() || "Prestations intellectuelles";

  return (
    <Document
      title={`Devis ${documentRef}`}
      author={issuer.name}
      subject={subject}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.bleedBar} fixed />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.accentRule} />
              <View style={styles.titleBlock}>
                <Text style={styles.docType}>DEVIS</Text>
                <Text style={styles.docSubtitle}>{subject}</Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                    marginTop: 4,
                    lineHeight: 1.45,
                  }}
                >
                  {props.periodLabel}
                </Text>
              </View>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Référence</Text>
              <Text style={styles.metaValue}>{documentRef}</Text>
              <Text style={{ ...styles.metaLabel, marginTop: 10 }}>
                Date d’émission
              </Text>
              <Text style={styles.metaValueSmall}>{props.createdLabel}</Text>
            </View>
          </View>

          <View style={styles.partiesRow}>
            <View style={[styles.partyBox, { marginRight: 14 }]}>
              <Text style={styles.partyLabel}>Émetteur</Text>
              <Text style={styles.partyName}>{issuer.name}</Text>
              {issuer.address ? (
                <Text style={styles.partyLine}>{issuer.address}</Text>
              ) : null}
              {issuer.siret ? (
                <Text style={styles.partyLine}>SIRET · {issuer.siret}</Text>
              ) : null}
              {issuer.vatNumber ? (
                <Text style={styles.partyLine}>
                  N° TVA · {issuer.vatNumber}
                </Text>
              ) : null}
            </View>
            <View style={styles.partyBox}>
              <Text style={styles.partyLabel}>Facturation à</Text>
              <Text style={styles.partyName}>{props.clientName}</Text>
              {props.clientEmail ? (
                <Text style={styles.partyLine}>{props.clientEmail}</Text>
              ) : (
                <Text style={{ ...styles.partyLine, color: colors.faint }}>
                  —
                </Text>
              )}
            </View>
          </View>

          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Détail des prestations</Text>
            <View style={styles.sectionRule} />
          </View>

          <View style={styles.table}>
            <View style={styles.thRow}>
              <Text style={[styles.thText, styles.tdDesc]}>Prestation</Text>
              <Text style={[styles.thText, styles.tdHours]}>Qté (h)</Text>
              <Text style={[styles.thText, styles.tdPu]}>PU HT</Text>
              <Text style={[styles.thText, styles.tdTot]}>Montant HT</Text>
            </View>
            {lines.map((l, i) => (
              <View
                key={`${l.label}-${i}`}
                style={[styles.trRow, i % 2 === 1 ? styles.trAlt : {}]}
                wrap={false}
              >
                <Text style={[styles.tdMain, styles.tdDesc]}>{l.label}</Text>
                <Text style={[styles.tdMuted, styles.tdHours]}>
                  {fmtHours(n(l.billableHours))}
                </Text>
                <Text style={[styles.tdMain, styles.tdPu]}>
                  {fmtMoney(n(l.unitPrice), currency)}
                </Text>
                <Text style={[styles.tdMain, styles.tdTot]}>
                  {fmtMoney(n(l.lineTotal), currency)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalsCard}>
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Total HT</Text>
                <Text style={styles.totalValue}>
                  {fmtMoney(props.subtotal, currency)}
                </Text>
              </View>
              {props.vatRate != null && props.vatAmount != null ? (
                <>
                  <View style={styles.totalLine}>
                    <Text style={styles.totalLabel}>
                      TVA ({(props.vatRate * 100).toFixed(1)} %)
                    </Text>
                    <Text style={styles.totalValue}>
                      {fmtMoney(props.vatAmount, currency)}
                    </Text>
                  </View>
                  <View style={[styles.totalLine, styles.totalLineLast]}>
                    <Text style={styles.grandLabel}>Total TTC</Text>
                    <Text style={styles.grandValue}>
                      {fmtMoney(props.totalTtc, currency)}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={[styles.totalLine, styles.totalLineLast]}>
                  <Text style={styles.grandLabel}>Total HT (TVA N/A)</Text>
                  <Text style={styles.grandValue}>
                    {fmtMoney(props.subtotal, currency)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerBrand}>{issuer.name}</Text>
            <Text style={styles.footerLegal}>
              Document émis à titre d’estimation. Les montants sont indicatifs
              sous réserve de l’exécution effective des prestations. TVA non
              applicable ou autoliquidation selon votre situation ; vérifiez
              votre qualification juridique et fiscale avant facturation
              définitive.
            </Text>
            <Text style={styles.footerHint}>Merci de votre confiance.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
