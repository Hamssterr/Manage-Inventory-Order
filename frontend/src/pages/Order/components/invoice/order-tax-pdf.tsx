import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { IOrder } from "@/types/order";
import { format } from "date-fns";
import { numberToVietnameseText } from "@/utils/helper";

// Đăng ký font hỗ trợ Tiếng Việt (Sử dụng font Roboto từ CDN)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#334155",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    paddingBottom: 20,
    marginBottom: 20,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
    color: "#0f172a",
  },
  companyDetail: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },
  invoiceTitleArea: {
    textAlign: "right",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#0f172a",
  },
  orderCode: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 4,
  },
  dateText: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 2,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
  },
  infoColumn: {
    width: "48%",
  },
  infoLabel: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  infoSubValue: {
    fontSize: 9,
    color: "#475569",
    marginBottom: 1,
  },
  table: {
    width: "auto",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
    minHeight: 28,
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
  },
  col1: { width: "8%" },
  col2: { width: "37%" },
  col3: { width: "10%", textAlign: "center" },
  col4: { width: "10%", textAlign: "right" },
  col5: { width: "15%", textAlign: "right" },
  col6: { width: "20%", textAlign: "right" },
  headerText: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
  },
  cellBold: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  noteBox: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    marginRight: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  totalBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 9,
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#0f172a",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#0f172a",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
  },
  amountInWords: {
    fontSize: 8,
    color: "#64748b",
    textAlign: "right",
    marginTop: 6,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
    textAlign: "center",
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 40,
  },
  signatureSub: {
    fontSize: 8,
    color: "#94a3b8",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    fontSize: 7,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

interface OrderTaxPdfProps {
  order: IOrder;
}

export const OrderTaxPdf = ({ order }: OrderTaxPdfProps) => (
  <Document title={`HoaDonThue_${order.orderCode}`}>
    <Page size="A4" style={styles.page}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>Công Ty TNHH Phân Phối ABC</Text>
          <Text style={styles.companyDetail}>
            ĐC: 123 Đường Số 1, P. Tân Phong, Quận 7, TP. HCM
          </Text>
          <Text style={styles.companyDetail}>
            MST: 0102030405 - ĐT: (028) 3888 9999
          </Text>
        </View>
        <View style={styles.invoiceTitleArea}>
          <Text style={styles.titleText}>Hóa Đơn Bán Hàng</Text>
          <Text style={styles.orderCode}>Mã đơn: {order.orderCode}</Text>
          <Text style={styles.dateText}>
            Ngày lập: {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
          </Text>
        </View>
      </View>

      {/* 2. CUSTOMER INFO */}
      <View style={styles.infoSection}>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Thông tin người mua</Text>
          <Text style={styles.infoValue}>{order.customerNameSnapshot}</Text>
          <Text style={styles.infoSubValue}>
            SĐT: {order.customerPhoneSnapshot}
          </Text>
          {order.customerTaxCodeSnapshot && (
            <Text style={styles.infoSubValue}>
              MST: {order.customerTaxCodeSnapshot}
            </Text>
          )}
        </View>
        <View style={[styles.infoColumn, { textAlign: "right" }]}>
          <Text style={styles.infoLabel}>Địa chỉ giao hàng</Text>
          <Text style={[styles.infoSubValue, { lineHeight: 1.4 }]}>
            {order.deliveryAddressSnapshot}
          </Text>
        </View>
      </View>

      {/* 3. TABLE */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.col1}>
            <Text style={styles.headerText}>STT</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.headerText}>Sản phẩm</Text>
          </View>
          <View style={styles.col3}>
            <Text style={styles.headerText}>ĐVT</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.headerText}>SL</Text>
          </View>
          <View style={styles.col5}>
            <Text style={styles.headerText}>Đơn giá</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.headerText}>Thành tiền</Text>
          </View>
        </View>
        {order.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.col1}>
              <Text style={styles.tableCell}>{index + 1}</Text>
            </View>
            <View style={styles.col2}>
              <Text style={[styles.tableCell, styles.cellBold]}>
                {item.productNameSnapshot}
              </Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.tableCell}>{item.unitNameSnapshot}</Text>
            </View>
            <View style={styles.col4}>
              <Text style={styles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={styles.col5}>
              <Text style={styles.tableCell}>
                {new Intl.NumberFormat("vi-VN").format(
                  item.taxAmountSnapshot || 0,
                )}
              </Text>
            </View>
            <View style={styles.col6}>
              <Text style={[styles.tableCell, styles.cellBold]}>
                {new Intl.NumberFormat("vi-VN").format(
                  (item.taxAmountSnapshot || 0) * item.quantity,
                )}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* 4. SUMMARY */}
      <View style={styles.summarySection}>
        <View style={styles.noteBox}>
          <Text style={styles.infoLabel}>Ghi chú đơn hàng</Text>
          <Text style={{ fontSize: 8, color: "#475569" }}>
            {order.note || "Không có ghi chú."}
          </Text>
        </View>
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={{ color: "#64748b" }}>Tạm tính:</Text>
            <Text style={{ fontWeight: "bold" }}>
              {new Intl.NumberFormat("vi-VN").format(order.totalTaxAmount || 0)}{" "}
              đ
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ color: "#64748b" }}>Chiết khấu:</Text>
            <Text style={{ fontWeight: "bold", color: "#16a34a" }}>0 đ</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Tổng cộng:</Text>
            <Text style={styles.grandTotalValue}>
              {new Intl.NumberFormat("vi-VN").format(order.totalTaxAmount || 0)}{" "}
              đ
            </Text>
          </View>
          <Text style={styles.amountInWords}>
            (Bằng chữ: {numberToVietnameseText(order.totalTaxAmount || 0)})
          </Text>
        </View>
      </View>

      {/* 5. SIGNATURES */}
      <View style={styles.signatureSection}>
        <View>
          <Text style={styles.signatureTitle}>Người mua hàng</Text>
          <Text style={styles.signatureSub}>(Ký, họ tên)</Text>
        </View>
        <View>
          <Text style={styles.signatureTitle}>Người lập phiếu</Text>
          <Text style={styles.signatureSub}>(Ký, họ tên)</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi!
      </Text>
    </Page>
  </Document>
);
