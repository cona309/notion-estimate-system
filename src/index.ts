import "dotenv/config";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

interface EstimateItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface EstimateResult {
  subtotal: number;
  vat: number;
  total: number;
}

const VAT_RATE = 0.1;

function calculateEstimate(items: EstimateItem[]): EstimateResult {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  console.log("=== 견적 내역 ===");
  for (const item of items) {
    const amount = item.quantity * item.unitPrice;
    console.log(
      `${item.name}  ${item.quantity} x ${item.unitPrice.toLocaleString()}원 = ${amount.toLocaleString()}원`
    );
  }
  console.log("-----------------");
  console.log(`공급가액: ${subtotal.toLocaleString()}원`);
  console.log(`부가세(10%): ${vat.toLocaleString()}원`);
  console.log(`총합계: ${total.toLocaleString()}원`);

  return { subtotal, vat, total };
}

const sampleItems: EstimateItem[] = [
  { name: "웹사이트 디자인", quantity: 1, unitPrice: 1500000 },
  { name: "프론트엔드 개발", quantity: 1, unitPrice: 2000000 },
  { name: "유지보수(월)", quantity: 3, unitPrice: 200000 },
];

calculateEstimate(sampleItems);

export { notion, calculateEstimate };
export type { EstimateItem, EstimateResult };
