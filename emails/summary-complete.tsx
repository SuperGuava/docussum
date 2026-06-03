import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

import { SUMMARY_COMPLETE_PREVIEW } from "./summary-complete-preview-data";

export type SummaryCompleteEmailProps = {
  title: string;
  tldr: [string, string, string];
  dashboardUrl: string;
};

export function SummaryCompleteEmail({
  title,
  tldr,
  dashboardUrl,
}: SummaryCompleteEmailProps) {
  const tldrLines = tldr.filter((line) => line.trim().length > 0);

  return (
    <Html lang="ko">
      <Head />
      <Preview>
        {title} — DocuSumm 요약이 완료되었습니다.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brandMark}>DocuSumm</Text>
            <Text style={headerTagline}>AI 문서·영상 요약</Text>
          </Section>

          <Heading style={h1}>요약이 완료되었습니다</Heading>
          <Text style={titleText}>{title}</Text>

          <Section style={tldrBox}>
            <Text style={tldrLabel}>TL;DR</Text>
            {tldrLines.length > 0 ? (
              tldrLines.map((line, index) => (
                <Text key={index} style={tldrItem}>
                  • {line}
                </Text>
              ))
            ) : (
              <Text style={tldrItem}>
                대시보드에서 전체 요약을 확인해 주세요.
              </Text>
            )}
          </Section>

          <Section style={ctaSection}>
            <Button href={dashboardUrl} style={button}>
              대시보드에서 전체 요약 보기
            </Button>
          </Section>

          <Text style={linkFallback}>
            버튼이 동작하지 않으면 아래 링크를 복사해 브라우저에 붙여넣으세요.
            <br />
            <a href={dashboardUrl} style={anchor}>
              {dashboardUrl}
            </a>
          </Text>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerBrand}>DocuSumm</Text>
            <Text style={footerNote}>
              이 메일은 요약 작업 완료 알림으로 발송되었습니다.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 16px",
  maxWidth: "560px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const brandMark = {
  fontSize: "22px",
  fontWeight: "700" as const,
  color: "#18181b",
  margin: "0 0 4px",
  letterSpacing: "-0.02em",
};

const headerTagline = {
  fontSize: "13px",
  color: "#71717a",
  margin: "0",
};

const h1 = {
  fontSize: "20px",
  fontWeight: "600" as const,
  color: "#18181b",
  margin: "0 0 8px",
};

const titleText = {
  fontSize: "16px",
  color: "#3f3f46",
  margin: "0 0 24px",
  lineHeight: "1.5",
};

const tldrBox = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e4e4e7",
  padding: "20px",
  marginBottom: "28px",
};

const tldrLabel = {
  fontSize: "12px",
  fontWeight: "600" as const,
  color: "#71717a",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  margin: "0 0 12px",
};

const tldrItem = {
  fontSize: "14px",
  color: "#27272a",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const ctaSection = {
  textAlign: "center" as const,
  marginBottom: "16px",
};

const button = {
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "12px 24px",
  display: "inline-block",
};

const linkFallback = {
  fontSize: "12px",
  color: "#71717a",
  lineHeight: "1.5",
  margin: "0 0 24px",
};

const anchor = {
  color: "#2563eb",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e4e4e7",
  margin: "24px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerBrand = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#52525b",
  margin: "0 0 4px",
};

const footerNote = {
  fontSize: "12px",
  color: "#a1a1aa",
  margin: "0",
};

SummaryCompleteEmail.PreviewProps = SUMMARY_COMPLETE_PREVIEW;

export default SummaryCompleteEmail;
