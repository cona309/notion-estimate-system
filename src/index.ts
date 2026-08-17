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

interface EstimateData extends EstimateResult {
  items: EstimateItem[];
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

// NOTION_API_KEY/NOTION_DATABASE_ID가 비어 있으면 실제 Notion API를 호출하지 않고
// 콘솔에 생성될 페이지 내용만 출력하는 Mock 모드로 동작한다. .env 없이도 로직을
// 검증할 수 있게 하기 위한 안전장치다.
const isNotionConfigured = Boolean(
  process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID
);

async function createEstimatePage(databaseId: string, estimateData: EstimateData) {
  if (!isNotionConfigured) {
    console.log(
      "\n[Mock 모드] NOTION_API_KEY 또는 NOTION_DATABASE_ID가 설정되지 않아 실제 Notion 페이지를 생성하지 않습니다."
    );
    console.log("생성될 페이지 데이터:", JSON.stringify(estimateData, null, 2));
    return { mock: true as const, databaseId, ...estimateData };
  }

  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      이름: {
        title: [
          {
            text: { content: `견적서 ${new Date().toLocaleDateString("ko-KR")}` },
          },
        ],
      },
      공급가액: { number: estimateData.subtotal },
      부가세: { number: estimateData.vat },
      총합계: { number: estimateData.total },
    },
    children: estimateData.items.map((item) => ({
      object: "block" as const,
      type: "bulleted_list_item" as const,
      bulleted_list_item: {
        rich_text: [
          {
            type: "text" as const,
            text: {
              content: `${item.name}  ${item.quantity} x ${item.unitPrice.toLocaleString()}원 = ${(
                item.quantity * item.unitPrice
              ).toLocaleString()}원`,
            },
          },
        ],
      },
    })),
  });

  console.log(`Notion 페이지 생성 완료: ${response.id}`);
  return response;
}

const sampleItems: EstimateItem[] = [
  { name: "웹사이트 디자인", quantity: 1, unitPrice: 1500000 },
  { name: "프론트엔드 개발", quantity: 1, unitPrice: 2000000 },
  { name: "유지보수(월)", quantity: 3, unitPrice: 200000 },
];

async function main() {
  const estimateResult = calculateEstimate(sampleItems);
  await createEstimatePage(process.env.NOTION_DATABASE_ID ?? "", {
    ...estimateResult,
    items: sampleItems,
  });
}

main();

export { notion, calculateEstimate, createEstimatePage };
export type { EstimateItem, EstimateResult, EstimateData };
