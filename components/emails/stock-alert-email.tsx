import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface StockAlertEmailProps {
  productName: string;
  currentStock: number;
  minStock: number;
  productUrl: string;
}

export const StockAlertEmail = ({
  productName,
  currentStock,
  minStock,
  productUrl,
}: StockAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>🚨 Peringatan Stok Menipis: {productName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Peringatan Stok Kritis</Heading>
        <Text style={text}>
          Halo Admin, sistem mendeteksi stok barang berikut sudah mencapai batas
          minimum:
        </Text>

        <Section style={box}>
          <Text style={paragraph}>
            <strong>Nama Produk:</strong> {productName}
          </Text>
          <Text style={paragraph}>
            <strong>Sisa Stok:</strong>{" "}
            <span style={critical}>{currentStock} Unit</span>
          </Text>
          <Text style={paragraph}>
            <strong>Batas Minimum:</strong> {minStock} Unit
          </Text>
        </Section>

        <Button style={button} href={productUrl}>
          Restock Sekarang
        </Button>

        <Hr style={hr} />
        <Text style={footer}>Pesan otomatis dari Sistem Inventaris (IMS).</Text>
      </Container>
    </Body>
  </Html>
);

// Styles sederhana agar email terlihat rapi
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "24px",
  backgroundColor: "#f0f0f0",
  borderRadius: "4px",
  marginBottom: "24px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "0 48px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  padding: "0 48px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
};

const critical = {
  color: "#e11d48", // Merah
  fontWeight: "bold",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px",
  margin: "0 auto",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  padding: "0 48px",
};
