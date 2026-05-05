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

/** Bento minimal — fond blanc, neutres froids, seul accent #c47a14 */
const colors = {
  page: "#ffffff",
  surface: "#ffffff",
  ink: "#171717",
  muted: "#525252",
  faint: "#737373",
  dim: "#a3a3a3",
  line: "#e5e5e5",
  rowAlt: "#fafafa",
  accent: "#c47a14",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.page,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: colors.ink,
  },
  shell: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
  },
  bentoRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 8,
  },
  cell: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
  },
  cellGrow: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 8,
  },
  cellMeta: {
    width: 102,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 8,
    justifyContent: "flex-start",
  },
  cellMetaLast: {
    marginRight: 0,
  },
  cellHalf: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 8,
  },
  cellHalfLast: {
    marginRight: 0,
  },
  cellFull: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: colors.ink,
    letterSpacing: -0.35,
  },
  badge: {
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5.5,
    color: colors.accent,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  subject: {
    fontSize: 8.5,
    color: colors.muted,
    lineHeight: 1.42,
    marginTop: 2,
  },
  period: {
    marginTop: 6,
    fontSize: 7.5,
    color: colors.faint,
    lineHeight: 1.38,
  },
  metaLabel: {
    fontSize: 6,
    letterSpacing: 1.1,
    color: colors.dim,
    textTransform: "uppercase",
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: colors.ink,
  },
  metaValueDate: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.35,
  },
  partyLabel: {
    fontSize: 6,
    letterSpacing: 1.1,
    color: colors.dim,
    textTransform: "uppercase",
    marginBottom: 7,
    fontFamily: "Helvetica-Bold",
  },
  partyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: colors.ink,
    marginBottom: 4,
  },
  partyLine: {
    fontSize: 7.5,
    color: colors.muted,
    lineHeight: 1.4,
  },
  tableSectionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tableSectionAccent: {
    width: 3,
    height: 14,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginRight: 8,
  },
  tableSectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: colors.ink,
    letterSpacing: 0.2,
  },
  thRow: {
    flexDirection: "row",
    backgroundColor: colors.rowAlt,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  thText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    letterSpacing: 0.9,
    color: colors.muted,
    textTransform: "uppercase",
  },
  trRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.surface,
  },
  trAlt: {
    backgroundColor: colors.rowAlt,
  },
  trLast: {
    borderBottomWidth: 0,
  },
  tdDesc: { width: "40%", paddingRight: 8 },
  tdHours: { width: "18%", textAlign: "right" },
  tdPu: { width: "21%", textAlign: "right" },
  tdTot: { width: "21%", textAlign: "right" },
  tdMain: {
    fontSize: 8.5,
    color: colors.ink,
  },
  tdMuted: {
    fontSize: 8,
    color: colors.faint,
  },
  totalsWrap: {
    marginTop: 4,
    alignItems: "flex-end",
  },
  totalsCell: {
    width: 196,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: "center",
  },
  totalLineLast: {
    marginBottom: 0,
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  totalLabel: {
    fontSize: 8,
    color: colors.muted,
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: colors.ink,
  },
  grandLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: colors.ink,
  },
  grandValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: colors.accent,
  },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerBrand: {
    fontSize: 7,
    color: colors.muted,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  footerLegal: {
    fontSize: 6.5,
    color: colors.dim,
    lineHeight: 1.5,
  },
  footerHint: {
    marginTop: 8,
    fontSize: 7,
    color: colors.dim,
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
        <View style={styles.shell}>
          <View style={styles.bentoRow}>
            <View style={[styles.cell, styles.cellGrow]}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Devis</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Indicatif</Text>
                </View>
              </View>
              <Text style={styles.subject}>{subject}</Text>
              <Text style={styles.period}>{props.periodLabel}</Text>
            </View>
            <View style={[styles.cell, styles.cellMeta]}>
              <Text style={styles.metaLabel}>Réf.</Text>
              <Text style={styles.metaValue}>{documentRef}</Text>
            </View>
            <View style={[styles.cell, styles.cellMeta, styles.cellMetaLast]}>
              <Text style={styles.metaLabel}>Émis</Text>
              <Text style={styles.metaValueDate}>{props.createdLabel}</Text>
            </View>
          </View>

          <View style={styles.bentoRow}>
            <View style={[styles.cell, styles.cellHalf]}>
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
            <View style={[styles.cell, styles.cellHalf, styles.cellHalfLast]}>
              <Text style={styles.partyLabel}>Facturation</Text>
              <Text style={styles.partyName}>{props.clientName}</Text>
              {props.clientEmail ? (
                <Text style={styles.partyLine}>{props.clientEmail}</Text>
              ) : (
                <Text style={{ ...styles.partyLine, color: colors.dim }}>
                  —
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.cell, styles.cellFull]}>
            <View style={styles.tableSectionBar}>
              <View style={styles.tableSectionAccent} />
              <Text style={styles.tableSectionTitle}>Prestations</Text>
            </View>
            <View style={styles.thRow}>
              <Text style={[styles.thText, styles.tdDesc]}>Libellé</Text>
              <Text style={[styles.thText, styles.tdHours]}>Qté (h)</Text>
              <Text style={[styles.thText, styles.tdPu]}>PU HT</Text>
              <Text style={[styles.thText, styles.tdTot]}>Montant HT</Text>
            </View>
            {lines.map((l, i) => (
              <View
                key={`${l.label}-${i}`}
                style={[
                  styles.trRow,
                  i % 2 === 1 ? styles.trAlt : {},
                  i === lines.length - 1 ? styles.trLast : {},
                ]}
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
            <View style={styles.totalsCell}>
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
