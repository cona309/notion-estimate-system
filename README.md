# Notion Estimate System

[![CI](https://github.com/cona309/notion-estimate-system/actions/workflows/ci.yml/badge.svg)](https://github.com/cona309/notion-estimate-system/actions/workflows/ci.yml)

견적 항목(품목명, 수량, 단가)을 입력받아 공급가액·부가세(10%)·총합계를 계산하고,
결과를 Notion 데이터베이스에 새 페이지로 기록하는 TypeScript CLI 도구입니다.

## 설치

```sh
npm install
```

`@notionhq/client`, `dotenv`, `typescript`, `@types/node`, `tsx`가 함께 설치됩니다.

## .env 설정

`.env.example`을 복사해 `.env`를 만들고 실제 Notion 연동 정보를 채웁니다. `.env`는
`.gitignore`에 포함되어 있어 커밋되지 않습니다.

```sh
cp .env.example .env
```

```
NOTION_API_KEY=
NOTION_DATABASE_ID=
```

- `NOTION_API_KEY`: [Notion 통합(Integration)](https://www.notion.so/my-integrations)을
  생성해 발급받은 시크릿 키
- `NOTION_DATABASE_ID`: 페이지를 생성할 대상 Notion 데이터베이스 ID. 데이터베이스에는
  `이름`(제목), `공급가액`(숫자), `부가세`(숫자), `총합계`(숫자) 속성이 있어야 합니다.
- 대상 Notion 데이터베이스에 통합(Integration)을 초대(Connect)해 접근 권한을 부여해야
  실제 페이지 생성이 동작합니다.

두 값 중 하나라도 비어 있으면 `createEstimatePage`가 **Mock 모드**로 동작합니다 — 실제
Notion API를 호출하지 않고, 생성될 페이지 데이터를 콘솔에 출력만 합니다. `.env` 설정 없이도
계산 로직과 CLI를 바로 테스트할 수 있습니다.

## 실행 방법

### CLI로 단일 품목 견적 계산

```sh
npx tsx src/index.ts "웹 개발" 1 3000000
```

인자는 순서대로 `품목명 수량 단가`입니다. 실행하면 다음과 같이 출력됩니다.

```
=== 견적 내역 ===
웹 개발  1 x 3,000,000원 = 3,000,000원
-----------------
공급가액: 3,000,000원
부가세(10%): 300,000원
총합계: 3,300,000원

[Mock 모드] NOTION_API_KEY 또는 NOTION_DATABASE_ID가 설정되지 않아 실제 Notion 페이지를 생성하지 않습니다.
생성될 페이지 데이터: { ... }
```

`.env`에 `NOTION_API_KEY`와 `NOTION_DATABASE_ID`가 모두 설정되어 있으면 Mock 메시지 대신
`Notion 페이지 생성 완료: <페이지 ID>`가 출력되며, 지정한 데이터베이스에 실제 페이지가
생성됩니다.

### 인자 없이 실행 (데모 모드)

```sh
npx tsx src/index.ts
```

인자를 생략하면 `src/index.ts`에 정의된 샘플 견적 항목 3건(웹사이트 디자인, 프론트엔드
개발, 유지보수)으로 계산 결과를 보여줍니다.

## 진행 상태

작업 단계는 [`.tasks/taskmaster.md`](.tasks/taskmaster.md)에서 확인할 수 있습니다.
