<!-- 작성일시: 2026-10-11 12:58 (KST) -->

# 상식 퀴즈 웹 앱 구현 계획

> **작업자(사람·에이전트 공통):** 이 계획은 태스크 단위로 실행한다. 에이전트로 실행할
> 경우 `superpowers:subagent-driven-development`(권장) 또는
> `superpowers:executing-plans` 스킬을 쓴다. 진행 표시는 체크박스(`- [ ]`)로 한다.

**목표:** 답을 고른 즉시 정답 여부와 한 줄 해설을 같은 화면에 보여 주는 4지선다 상식
퀴즈 웹 앱을, 서버 없이 `index.html`을 열면 동작하는 정적 파일 4개로 만든다.
연습 모드와 점수 → 스피드·힌트 모드와 틀린 문제 다시 풀기 → 점수 저장과 순위표
순서로 3단계로 진행한다.

**구조:** `index.html`에 화면 5개를 `<section>`으로 미리 두고 `hidden` 클래스로
전환한다. `questions.js`는 전역 상수 `QUESTIONS`만 정의하는 일반 스크립트다.
`script.js`는 **상수, 순수 로직, 자체 점검, 상태, 화면 조작, 시작의 여섯 구역**으로
나눈다. 순수 로직은 DOM을 쓰지 않으므로 Node에서도 점검할 수 있다.

**기술:** HTML, CSS, 바닐라 자바스크립트(ES2020). 라이브러리·빌드 도구·테스트
프레임워크를 쓰지 않는다. 점검용으로만 Node.js(이 컴퓨터에서 v24.19.0 확인)를 쓴다.

**명세:** [PRD.md](PRD.md). 실행자는 이 계획과 PRD를 함께 읽는다.

## 전역 제약

PRD에서 가져온 프로젝트 전체 규칙이다. **모든 태스크의 요구사항에 이 절이 암묵적으로
포함된다.**

- 앱 파일은 `index.html`, `style.css`, `script.js`, `questions.js` 4개뿐이다. 다른
  파일(테스트 파일, JSON, 이미지 등)을 만들지 않는다.
- `file://`로 열어 동작해야 한다. `fetch()`, `import`/`export`,
  `<script type="module">`을 쓰지 않는다.
- `index.html`은 `questions.js`를 `script.js`보다 먼저 불러온다.
- `questions.js`는 전역 변수 `QUESTIONS` 하나만 정의한다. 로직을 넣지 않는다.
- 카테고리는 `korean_history`(한국사), `world_geography`(세계지리), `science`(과학),
  `arts_culture`(예술과 문화) 4개이고, 문항 id 접두어는 차례대로 `kh`, `wg`, `sc`,
  `ac`다. 카테고리마다 10문항, 총 40문항이다. 한 판은 한 카테고리의 문항 전부다.
- 문항 데이터에 **난이도 필드를 두지 않는다.** 난이도로 골라 푸는 기능도 만들지 않는다.
- 점수: 맞히면 1점, 힌트 모드에서 힌트를 쓰고 맞히면 0.5점, 틀리면(시간 초과 포함)
  0점이다. 표기는 소수점 한 자리까지 하되 정수면 정수로 쓴다 (`7`, `6.5`).
- 스피드 모드는 문항마다 15초다.
- 순위표는 스피드·힌트 모드만 대상이다. **카테고리 4 × 모드 2 = 8개 표**로 분리하고,
  표마다 상위 5건을 점수 내림차순으로 보여 주며 동점이면 먼저 세운 기록이 위다.
- `localStorage` 키는 `quiz.scores.v1` 하나이고 구조는 `{ version: 1, records: [...] }`
  다. 접근은 모두 `try`/`catch`로 감싼다. 실패해도 퀴즈 자체는 끝까지 동작해야 하고,
  순위표 영역에만 안내를 표시한다.
- 화면 문구는 다음 그대로 쓴다: `순위표에 기록되지 않음`, `정답입니다`, `오답입니다`,
  `시간 초과 — 오답으로 처리했습니다`, `복습 — 점수에 반영되지 않음`, `기록 없음`,
  `이 브라우저에서는 기록을 저장할 수 없습니다`, `틀린 문제 다시 풀기`
- 사용자 입력(이름)과 문항 텍스트는 `textContent`로만 화면에 넣는다. `innerHTML`을
  쓰지 않는다.
- 창 폭 400px에서 가로 스크롤이 생기면 안 된다.
- 문항 품질 규칙 3개(PRD 4.1): 정답은 정확히 하나, 해설에는 **작성 시점에 실제로 열어
  확인한** 출처(제목·URL·확인 날짜), 최상급 표현에는 기준과 시점을 문항 본문에 명시.
- 새로 만드는 파일 맨 위에 `작성일시: YYYY-MM-DD HH:MM (KST)` 주석을 각 형식의 주석
  문법으로 넣는다. 이미 있는 파일을 고칠 때는 이 줄을 건드리지 않는다.
- 태스크마다 **점검 명령**이 기대한 결과로 끝난 뒤 그 태스크에서 바꾼 파일만 커밋한다.
  커밋 메시지는 `feat: <태스크 이름>` 꼴이고, 문항 태스크는
  `content: <카테고리> 10문항` 꼴이다. 태스크 5~7은 실제 데이터 점검이 의도대로 실패한
  상태에서 커밋한다(남은 카테고리가 아직 비어 있기 때문이다).
- **단계(1·2·3)가 끝나면 실행을 멈추고, 사용자가 "브라우저에서 직접 확인할 항목"을
  확인한 뒤에 다음 단계로 넘어간다.** 사용자의 확인 없이 다음 단계를 시작하지 않는다.

### 점검 명령

프로젝트 폴더에서 실행한다. `questions.js`와 `script.js`를 브라우저처럼 같은 전역
공간에 차례로 불러오고, `?test` 주소로 연 것처럼 자체 점검을 돌린다. 실패가 있으면
종료 코드가 1이다.

```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```

Node에는 `document`가 없으므로 화면 조작 구역은 실행되지 않는다. 즉 이 명령은 순수
로직만 점검한다. 화면 동작은 사람이 브라우저에서 확인한다.

### 문항 검수 명령

80자를 넘는 해설과, 최상급 표현이 들어간 문제 문장을 나열한다. 아무것도 찍히지
않으면 통과다.

```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({});vm.runInContext(fs.readFileSync('questions.js','utf8')+';globalThis.Q=QUESTIONS;',c);for(const k of Object.keys(c.Q))for(const q of c.Q[k].items){if(q.explanation.length>80)console.log('해설 80자 초과',q.id,q.explanation.length);if(/가장|최초|최대|최소|최고|최장|최다/.test(q.question))console.log('최상급 확인',q.id,q.question)}"
```

`최상급 확인`으로 찍힌 문항은 기준과 시점이 문제 본문에 들어 있는지 눈으로 본다.
들어 있으면 그대로 두고, 없으면 문장을 고치거나 문항을 버린다.

### 문항 작성 절차 (태스크 5~8 공통)

1. 카테고리 안에서 주제가 겹치지 않게 10개를 고른다. 대학 1학년이 상식으로 접근할 수
   있는 범위로 하고, 전공 지식을 요구하지 않는다.
2. 문항마다 WebSearch로 출처를 찾고, WebFetch나 브라우저로 **그 사실이 적힌 페이지를
   직접 열어** 정답을 확인한다.
   - 우선 쓸 출처: 국사편찬위원회 우리역사넷(contents.history.go.kr),
     한국민족문화대백과사전(encykorea.aks.ac.kr), 국가유산청, 국립국어원,
     기상청·통계청 등 정부 기관 누리집, 국립중앙박물관 등 공식 누리집,
     유네스코 세계유산센터(whc.unesco.org), NASA, 브리태니커(britannica.com)
   - 한국어 출처를 먼저 찾고, 한국어 쪽에 믿을 자료가 없을 때만 영어권 1차 출처를 쓴다.
   - 위키백과, 나무위키, 블로그, 커뮤니티 글은 출처로 쓰지 않는다.
   - 페이지를 열 수 없거나 내용이 확인되지 않으면 그 문항을 버리고 다른 주제로 바꾼다.
3. 문제를 쓴다.
   - 정답은 하나뿐이어야 한다. 오답 3개는 그럴듯하되 출처 기준으로 명백히 틀려야 한다.
   - 보기 4개는 서로 다르고, 길이와 형식을 비슷하게 맞춘다. 유독 긴 보기가 정답이라는
     단서를 주지 않는다.
   - 「가장 ~한」, 「최초」, 「최대」 같은 최상급 표현을 쓰면 기준과 시점을 문제 문장에
     넣는다. 예: `유역 면적이 아니라 길이를 기준으로, 2024년 통용되는 측정값에서 …`
     기준과 시점을 적어도 권위 있는 출처들이 서로 다른 값을 내놓는 소재는 버린다.
   - "~이 아닌 것은?" 같은 부정형 문제는 쓰지 않는다. 정답이 하나인지 검수하기
     어렵기 때문이다.
4. 해설은 80자 이내 한 줄로, 정답의 근거를 쓴다.
5. `source`에 출처의 제목, URL, 확인한 날짜(KST 기준 그날 날짜)를 적는다. 기억이나
   추정으로 적지 않는다.
6. 10문항을 다 쓰면 **문항 검수 명령**을 돌리고, 걸린 항목을 고친 뒤 커밋한다.

## 리뷰 중점

PRD가 전제하지만 어느 태스크의 본 기능에도 드러나지 않는, 사용자를 가장 괴롭힐 만한
입력·상황 5개다. 각 줄의 점검은 그 코드를 소유한 태스크 안에 들어가 있다.

1. **`localStorage`가 막힌 브라우저(`file://` 제한, 시크릿 모드, 용량 초과).** 퀴즈는
   끝까지 정상 동작하고 순위표에만 안내가 떠야 한다. 예외가 올라와 화면이 멈추면
   안 된다. → 태스크 15(`parseStore`), 태스크 16(`try`/`catch`와 안내)
2. **`questions.js`가 손상된 경우(문항 9개, `answerIndex`가 7, `QUESTIONS` 미정의).**
   앱이 빈 화면으로 죽지 않고 콘솔 경고와 화면 안내를 내야 한다. 진행 표시와 만점은
   하드코딩한 10이 아니라 실제 문항 수를 써야 한다. → 태스크 2, 9
3. **한 문항을 두 번 채점하는 경우(보기를 빠르게 두 번 클릭, 시간 만료와 클릭이 동시에
   발생).** 점수가 두 번 오르거나 `results`에 같은 문항이 두 번 들어가면 안 된다.
   → 태스크 4(`applyAnswer`·`applyTimeout`의 `locked`)
4. **스피드 모드 타이머 누수.** 해설이 뜬 뒤, 결과 화면으로 넘어간 뒤, 다른 모드로 새
   판을 시작한 뒤에 이전 타이머가 살아 있으면 엉뚱한 문항이 시간 초과로 처리된다.
   → 태스크 12
5. **이름 입력이 빈 값·공백뿐·20자 초과·HTML 조각인 경우.** 빈 값은 저장을 거부하고
   안내하며, 긴 값은 잘라내고, 순위표는 이름을 `textContent`로만 넣어야 한다.
   → 태스크 15(`normalizeName`), 태스크 16

---

# 1단계: 연습 모드와 점수

**만들 것**

- `script.js`의 여섯 구역 틀과 자체 점검 틀(`selfTest`, `runSelfTests`)
- 순수 로직: 섞기, 한 판 만들기, 데이터 검증, 점수 계산과 표기, 채점 상태 전이
- `questions.js`에 40문항(카테고리마다 10문항, 출처를 직접 열어 확인)
- `index.html`의 화면 5개 골격과 `style.css`
- 연습 모드 화면 흐름: 카테고리 선택 → 문제 풀이(즉시 채점·한 줄 해설·출처) → 결과
- 결과 화면의 `순위표에 기록되지 않음` 표시, 문항별 정답·오답 목록, [같은 모드 다시],
  [처음으로]

**이 단계에 없는 것**: 모드 선택 화면, 스피드·힌트 모드, 틀린 문제 다시 풀기, 순위표.
앱을 열면 카테고리 선택 화면으로 바로 들어가고 연습 모드로만 진행한다. 이 화면이
1단계의 시작 화면이다. 결과 화면 버튼은 [같은 모드 다시]와 [처음으로] 둘뿐이고,
[처음으로]는 1단계에서 카테고리 선택 화면으로 간다(2단계부터 모드 선택 화면).

**완료 기준** (실행자가 스스로 점검한다)

- [ ] 점검 명령이 `자체 점검 결과: 통과 12, 실패 0`으로 끝나고 종료 코드가 0이다.
- [ ] 문항 검수 명령에서 `해설 80자 초과`가 없고, `최상급 확인`으로 찍힌 문항은 모두
      기준과 시점이 본문에 들어 있다.
- [ ] 카테고리 4개가 각각 10문항이고, 40문항 모두 `source.url`을 직접 열어 확인했다.
- [ ] `file://`로 열었을 때 콘솔에 오류와 데이터 경고가 없다.

**브라우저에서 직접 확인할 항목** (사용자가 확인한다 — PRD 7.1·7.2)

- [ ] 1. `index.html`을 더블클릭해 연다. 주소창이 `file:///C:/Study03_Quiz/index.html`
      이고, F12 콘솔에 빨간 오류와 `[quiz] 데이터 경고`가 없다.
- [ ] 2. 시작 화면에 카테고리 버튼 4개(한국사, 세계지리, 과학, 예술과 문화)가 보이고,
      각 항목에 `문항 10개`가 적혀 있다. 화면에
      `연습 모드 · 순위표에 기록되지 않음`이 보인다.
- [ ] 3. 한국사를 누른다. 상단에 `한국사 · 연습`, `1 / 10`, `점수 0`이 보인다.
- [ ] 4. 정답을 고른다. 그 보기가 초록색이 되고, **같은 화면에** 한 줄 해설과 출처
      링크가 즉시 나타난다. 화면이 바뀌거나 버튼을 더 누를 필요가 없다.
- [ ] 5. 오답을 고른다. 고른 보기는 빨간색, 정답 보기는 초록색으로 표시된다.
- [ ] 6. 답을 고른 뒤에 다른 보기를 눌러도 변화가 없다. 아주 빠르게 두 번 연속
      눌러도 점수가 1만 오른다.
- [ ] 7. 출처 링크를 누르면 새 탭에서 출처가 열리고, 내용이 해설과 맞는다.
- [ ] 8. [다음]으로 10문항을 끝낸다. 10번째 문항에서 버튼이 [결과 보기]로 바뀐다.
- [ ] 9. 결과 화면의 `9 / 10`이 맞힌 개수와 같고, 문항별 정답·오답 목록(문제, 정답
      보기, 틀린 문항은 내 선택까지)과 `순위표에 기록되지 않음`이 보인다.
- [ ] 10. [같은 모드 다시]를 누르면 **문항 순서와 보기 순서가 앞 판과 다르다.**
- [ ] 11. [처음으로]를 누르면 시작 화면으로 돌아간다. 다른 카테고리로 한 판 더 풀면
      해설과 출처가 문항에 맞게 바뀐다.
- [ ] 12. 창 폭을 400px 정도로 줄인다. 글자가 잘리거나 가로 스크롤이 생기지 않는다.
- [ ] 13. 주소 끝에 `?test`를 붙여 다시 열고 콘솔을 본다.
      `자체 점검 결과: 통과 12, 실패 0`이 찍힌다(1단계 점검 항목 12개, 2단계 15개).

---

### 태스크 1: 자체 점검 틀과 섞기

**파일:**
- 생성: `C:\Study03_Quiz\questions.js`
- 생성: `C:\Study03_Quiz\script.js`

**인터페이스:**
- 소비: 없음(첫 태스크)
- 생산:
  - 상수 `CATEGORY_ORDER: string[]`, `CATEGORY_PREFIX: {[key]: string}`,
    `MODE_LABELS: {practice,speed,hint}`, `QUESTIONS_PER_ROUND = 10`
  - `selfTest(name: string, run: (check) => void): void` — 점검을 등록한다.
    `check(condition: boolean, message: string)`는 실패 메시지를 모은다
  - `runSelfTests(): {passed: number, failed: number}` — 결과를 콘솔에 찍고
    `globalThis.selfTestFailed`를 설정한다
  - `makeQuestion(categoryKey, number): Item`,
    `makeQuestionSet(perCategory = 10): QuestionsData` — 점검용 가짜 데이터
  - `shuffle(array, random = Math.random): Array` — 섞은 복사본을 반환한다

- [ ] **1단계: 빈 `questions.js`를 만든다**

```js
// 작성일시: (파일을 만드는 시점의 KST 시각)
// 상식 퀴즈 문항. 스키마는 PRD.md 4.2, 작성 절차는 IMPL-PLAN.md "문항 작성 절차"를 따른다.

const QUESTIONS = {
  korean_history: { label: "한국사", items: [] },
  world_geography: { label: "세계지리", items: [] },
  science: { label: "과학", items: [] },
  arts_culture: { label: "예술과 문화", items: [] }
};
```

- [ ] **2단계: `script.js` 뼈대와 실패하는 점검을 쓴다**

```js
// 작성일시: (파일을 만드는 시점의 KST 시각)
"use strict";

// ===== 1. 상수 =====
const SCREENS = [
  "screen-mode",
  "screen-category",
  "screen-quiz",
  "screen-result",
  "screen-leaderboard"
];
const CATEGORY_ORDER = ["korean_history", "world_geography", "science", "arts_culture"];
const CATEGORY_PREFIX = {
  korean_history: "kh",
  world_geography: "wg",
  science: "sc",
  arts_culture: "ac"
};
const CATEGORY_LABELS = {
  korean_history: "한국사",
  world_geography: "세계지리",
  science: "과학",
  arts_culture: "예술과 문화"
};
const MODE_LABELS = { practice: "연습", speed: "스피드", hint: "힌트" };
const QUESTIONS_PER_ROUND = 10;

// ===== 2. 순수 로직 =====

// ===== 3. 자체 점검 =====
const SELF_TESTS = [];

function selfTest(name, run) {
  SELF_TESTS.push({ name: name, run: run });
}

function runSelfTests() {
  let passed = 0;
  let failed = 0;
  for (const test of SELF_TESTS) {
    const failures = [];
    const check = (condition, message) => {
      if (!condition) failures.push(message);
    };
    try {
      test.run(check);
    } catch (error) {
      failures.push(`예외: ${error.message}`);
    }
    if (failures.length === 0) {
      passed += 1;
      console.log(`통과: ${test.name}`);
    } else {
      failed += 1;
      console.error(`실패: ${test.name}\n  - ${failures.join("\n  - ")}`);
    }
  }
  console.log(`자체 점검 결과: 통과 ${passed}, 실패 ${failed}`);
  globalThis.selfTestFailed = failed > 0;
  return { passed: passed, failed: failed };
}

function makeQuestion(categoryKey, number) {
  const id = `${CATEGORY_PREFIX[categoryKey]}-${String(number).padStart(2, "0")}`;
  return {
    id: id,
    question: `${id} 문제`,
    choices: [`${id} 보기1`, `${id} 보기2`, `${id} 정답`, `${id} 보기4`],
    answerIndex: 2,
    explanation: `${id} 해설`,
    source: { title: "점검용 출처", url: `https://example.com/${id}`, checkedAt: "2026-10-11" }
  };
}

function makeQuestionSet(perCategory = QUESTIONS_PER_ROUND) {
  const data = {};
  for (const key of CATEGORY_ORDER) {
    data[key] = {
      label: CATEGORY_LABELS[key],
      items: Array.from({ length: perCategory }, (_, i) => makeQuestion(key, i + 1))
    };
  }
  return data;
}

// 점검 항목은 1단계 12개다(수업 노트 기준). 섞기·문항 검사는 확인(check)을 그대로 두고
// 점검 하나로 묶었다.
selfTest("shuffle은 원소를 모두 담은 새 배열을 돌려주고 random 값에 따라 순서를 바꾼다", check => {
  const original = [1, 2, 3, 4, 5];
  const result = shuffle(original);
  check(result !== original, "새 배열이어야 함");
  check(result.length === 5, `길이 ${result.length}`);
  check([...result].sort().join() === "1,2,3,4,5", `원소 ${result.join()}`);
  check(original.join() === "1,2,3,4,5", "원본이 바뀜");

  const fixed = shuffle([1, 2, 3, 4], () => 0);
  check(fixed.join() === "2,3,4,1", `고정 난수 결과 ${fixed.join()}`);
});

// ===== 4. 상태 =====

// ===== 5. 화면 조작 =====

// ===== 6. 시작 =====
if (typeof location !== "undefined" && /[?&]test\b/.test(location.search)) runSelfTests();
```

- [ ] **3단계: 점검이 실패하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `실패: shuffle은 …` 한 줄이 나오고 `예외: shuffle is not defined`가 찍힌다.
마지막 줄은 `자체 점검 결과: 통과 0, 실패 1`, 종료 코드 1.

- [ ] **4단계: `shuffle`을 구현한다** (`// ===== 2. 순수 로직 =====` 아래)

```js
// Fisher–Yates. 원본은 두고 섞은 복사본을 돌려준다.
function shuffle(array, random = Math.random) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
```

- [ ] **5단계: 점검이 통과하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 1, 실패 0`, 종료 코드 0.

- [ ] **6단계: 커밋**

```bash
cd /c/Study03_Quiz && git add questions.js script.js && git commit -m "feat: 자체 점검 틀과 섞기"
```

---

### 태스크 2: 문항 데이터 검사

**파일:**
- 수정: `C:\Study03_Quiz\script.js` (2. 순수 로직 구역 끝, 3. 자체 점검 구역 끝)

**인터페이스:**
- 소비: `CATEGORY_ORDER`, `QUESTIONS_PER_ROUND`, `makeQuestionSet`, `selfTest`
- 생산:
  - `validateQuestions(data): string[]` — 문제가 없으면 빈 배열, 있으면 사람이 읽을 수
    있는 경고 문자열 배열
  - `reportDataWarnings(warnings: string[]): void` — 콘솔에 경고를 남긴다

- [ ] **1단계: 실패하는 점검을 쓴다** (3. 자체 점검 구역의 마지막 `selfTest` 뒤에 추가)

```js
selfTest("validateQuestions는 올바른 데이터를 통과시키고 카테고리·문항 수·문항 필드 문제를 잡는다", check => {
  check(validateQuestions(makeQuestionSet()).length === 0,
    `정상 데이터 경고 ${validateQuestions(makeQuestionSet()).join(" / ")}`);

  const missing = makeQuestionSet();
  delete missing.science;
  missing.korean_history.items.pop();
  const countWarnings = validateQuestions(missing);
  check(countWarnings.some(w => w.includes("카테고리가 4개가 아닙니다")), "카테고리 수 경고 없음");
  check(countWarnings.some(w => w.includes("science")), "빠진 카테고리 경고 없음");
  check(countWarnings.some(w => w.includes("문항이 10개가 아닙니다")), "문항 수 경고 없음");

  const broken = makeQuestionSet();
  const bad = broken.korean_history.items[0];
  bad.choices = ["하나", "둘"];
  bad.answerIndex = 7;
  bad.explanation = "";
  bad.source = {};
  const fieldWarnings = validateQuestions(broken);
  check(fieldWarnings.some(w => w.includes("보기가 4개가 아닙니다")), "보기 수 경고 없음");
  check(fieldWarnings.some(w => w.includes("answerIndex")), "answerIndex 경고 없음");
  check(fieldWarnings.some(w => w.includes("explanation")), "explanation 경고 없음");
  check(fieldWarnings.some(w => w.includes("source.url")), "source.url 경고 없음");
  check(fieldWarnings.every(w => w.includes("kh-01")), `문항 id가 없는 경고: ${fieldWarnings.join(" / ")}`);
});
```

- [ ] **2단계: 점검이 실패하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: 새 점검 1개가 `예외: validateQuestions is not defined`로 실패.
`자체 점검 결과: 통과 1, 실패 1`, 종료 코드 1.

- [ ] **3단계: `validateQuestions`를 구현한다** (2. 순수 로직 구역 끝에 추가)

```js
// PRD 4.3. 손으로 고치는 데이터이므로 오타를 조용히 넘기지 않는다.
function validateQuestions(data) {
  const warnings = [];

  if (!data || typeof data !== "object") {
    warnings.push("QUESTIONS가 객체가 아닙니다");
    return warnings;
  }

  const keys = Object.keys(data);
  if (keys.length !== 4) warnings.push(`카테고리가 4개가 아닙니다: ${keys.length}개`);
  for (const key of CATEGORY_ORDER) {
    if (!keys.includes(key)) warnings.push(`카테고리 ${key}가 없습니다`);
  }

  for (const key of keys) {
    const category = data[key];
    if (!category || !Array.isArray(category.items)) {
      warnings.push(`${key}: items 배열이 없습니다`);
      continue;
    }
    if (!category.label) warnings.push(`${key}: label이 비어 있습니다`);
    if (category.items.length !== QUESTIONS_PER_ROUND) {
      warnings.push(`${key}: 문항이 ${QUESTIONS_PER_ROUND}개가 아닙니다 (${category.items.length}개)`);
    }
    category.items.forEach((item, i) => {
      const at = item && item.id ? item.id : `${key}[${i}]`;
      if (!item || typeof item !== "object") {
        warnings.push(`${at}: 문항이 객체가 아닙니다`);
        return;
      }
      if (!item.question) warnings.push(`${at}: question이 비어 있습니다`);
      if (!Array.isArray(item.choices) || item.choices.length !== 4) {
        warnings.push(`${at}: 보기가 4개가 아닙니다`);
      } else if (new Set(item.choices).size !== 4) {
        warnings.push(`${at}: 보기 4개가 서로 다르지 않습니다`);
      }
      if (!Number.isInteger(item.answerIndex) || item.answerIndex < 0 || item.answerIndex > 3) {
        warnings.push(`${at}: answerIndex가 0~3 범위의 정수가 아닙니다`);
      }
      if (!item.explanation) warnings.push(`${at}: explanation이 비어 있습니다`);
      if (!item.source || !item.source.url) warnings.push(`${at}: source.url이 비어 있습니다`);
    });
  }

  return warnings;
}

function reportDataWarnings(warnings) {
  for (const message of warnings) console.warn(`[quiz] 데이터 경고: ${message}`);
}
```

- [ ] **4단계: 점검이 통과하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 2, 실패 0`, 종료 코드 0.

- [ ] **5단계: 커밋**

```bash
cd /c/Study03_Quiz && git add script.js && git commit -m "feat: 문항 데이터 검사"
```

---

### 태스크 3: 한 판 만들기와 점수 계산

**파일:**
- 수정: `C:\Study03_Quiz\script.js` (2. 순수 로직 구역 끝, 3. 자체 점검 구역 끝)

**인터페이스:**
- 소비: `shuffle`, `makeQuestionSet`, `selfTest`
- 생산:
  - `toRoundItem(item, random = Math.random): Item` — 보기를 섞고 `answerIndex`를
    섞은 뒤 위치로 다시 계산한다
  - `buildRound(data, categoryKey, random = Math.random): Item[]` — 문항 순서까지 섞어
    한 판 분량을 반환한다
  - `Item` = `{ id, question, choices: string[4], answerIndex: number, explanation, source }`
    (`choices`는 **섞은 뒤**의 보기, `answerIndex`는 **섞은 뒤**의 정답 위치)
  - `scoreFor(correct: boolean, mode: string, usedHint: boolean): number` — 1 / 0.5 / 0
  - `formatScore(n: number): string` — `7` / `6.5`

- [ ] **1단계: 실패하는 점검을 쓴다** (3. 자체 점검 구역 끝에 추가)

```js
selfTest("toRoundItem은 보기를 섞어도 정답을 잃지 않는다", check => {
  const source = makeQuestion("science", 1);
  for (let seed = 0; seed < 50; seed++) {
    const item = toRoundItem(source, () => (seed % 7) / 7);
    check(item.choices.length === 4, `보기 ${item.choices.length}개`);
    check(item.choices[item.answerIndex] === source.choices[source.answerIndex],
      `정답 위치 틀림: ${item.choices[item.answerIndex]}`);
    check([...item.choices].sort().join("|") === [...source.choices].sort().join("|"),
      "보기 내용이 바뀜");
  }
});

selfTest("buildRound는 한 카테고리 전부를 담고 원본을 건드리지 않는다", check => {
  const data = makeQuestionSet();
  const before = data.science.items.map(item => item.id).join(",");
  const round = buildRound(data, "science");
  check(round.length === 10, `문항 ${round.length}개`);
  check(data.science.items.map(item => item.id).join(",") === before, "원본 순서가 바뀜");
  check([...round].map(item => item.id).sort().join(",") === before.split(",").sort().join(","),
    "문항 구성이 다름");
  check(buildRound(data, "없는카테고리").length === 0, "없는 카테고리에서 빈 배열이 아님");
});

selfTest("scoreFor는 모드와 힌트 사용에 따라 점수를 준다", check => {
  check(scoreFor(true, "practice", false) === 1, "연습 정답 1점");
  check(scoreFor(true, "speed", false) === 1, "스피드 정답 1점");
  check(scoreFor(true, "hint", false) === 1, "힌트 미사용 정답 1점");
  check(scoreFor(true, "hint", true) === 0.5, "힌트 사용 정답 0.5점");
  check(scoreFor(false, "hint", true) === 0, "오답 0점");
  check(scoreFor(false, "speed", false) === 0, "오답 0점");
});

selfTest("formatScore는 정수는 정수로, 소수는 한 자리로 쓴다", check => {
  check(formatScore(0) === "0", `0 → ${formatScore(0)}`);
  check(formatScore(7) === "7", `7 → ${formatScore(7)}`);
  check(formatScore(6.5) === "6.5", `6.5 → ${formatScore(6.5)}`);
  check(formatScore(6.499) === "6.5", `6.499 → ${formatScore(6.499)}`);
});
```

- [ ] **2단계: 점검이 실패하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: 새 점검 4개가 `… is not defined`로 실패.
`자체 점검 결과: 통과 2, 실패 4`, 종료 코드 1.

- [ ] **3단계: 구현한다** (2. 순수 로직 구역 끝에 추가)

```js
// 보기를 원래 색인과 함께 묶어 섞은 뒤, 정답이 어디로 갔는지 다시 찾는다.
function toRoundItem(item, random = Math.random) {
  const pairs = shuffle(item.choices.map((text, i) => ({ text: text, origin: i })), random);
  return {
    id: item.id,
    question: item.question,
    choices: pairs.map(pair => pair.text),
    answerIndex: pairs.findIndex(pair => pair.origin === item.answerIndex),
    explanation: item.explanation,
    source: item.source
  };
}

// 판마다 문항 순서와 보기 순서를 모두 섞는다 (PRD 4.2).
function buildRound(data, categoryKey, random = Math.random) {
  const category = data && data[categoryKey];
  if (!category || !Array.isArray(category.items)) return [];
  return shuffle(category.items, random).map(item => toRoundItem(item, random));
}

function scoreFor(correct, mode, usedHint) {
  if (!correct) return 0;                       // 틀린 문항은 모든 모드에서 0점
  if (mode === "hint" && usedHint) return 0.5;  // 힌트를 쓰고 맞히면 절반
  return 1;
}

function formatScore(n) {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
```

- [ ] **4단계: 점검이 통과하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 6, 실패 0`, 종료 코드 0.

- [ ] **5단계: 커밋**

```bash
cd /c/Study03_Quiz && git add script.js && git commit -m "feat: 한 판 만들기와 점수 계산"
```

---

### 태스크 4: 채점 상태 전이

화면 없이도 한 판을 끝까지 돌릴 수 있는 상태 전이를 만든다. **리뷰 중점 3(중복 채점)이
여기서 막힌다.**

**파일:**
- 수정: `C:\Study03_Quiz\script.js` (2. 순수 로직 구역 끝, 3. 자체 점검 구역 끝)

**인터페이스:**
- 소비: `scoreFor`, `buildRound`, `makeQuestionSet`, `selfTest`
- 생산:
  - `createSession(mode, categoryKey, items, options = {}): Session`
    (`options = { isReview?: boolean }`)
  - `Session` = `{ mode, categoryKey, items, index, score, results, isReview, locked, hintUsed }`
  - `results` 한 건 = `{ id, selectedIndex, correct, usedHint, timedOut }`
  - `applyAnswer(session, choiceIndex): {correct, gained} | null` — 이미 채점했으면 `null`
  - `applyTimeout(session): boolean` — 시간 초과를 오답으로 기록. 이미 채점했으면 `false`
  - `advance(session): boolean` — 다음 문항으로. 마지막이면 `false`
  - `isLastQuestion(session): boolean`
  - `countCorrect(session)`, `countWrong(session)`, `countHintUsed(session)`

- [ ] **1단계: 실패하는 점검을 쓴다** (3. 자체 점검 구역 끝에 추가)

```js
function makeTestSession(mode = "practice") {
  return createSession(mode, "science", buildRound(makeQuestionSet(), "science", () => 0));
}

selfTest("applyAnswer는 정답과 오답의 점수를 더한다", check => {
  const session = makeTestSession();
  const result = applyAnswer(session, session.items[0].answerIndex);
  check(result.correct === true, "정답 판정 실패");
  check(session.score === 1, `점수 ${session.score}`);
  check(session.results.length === 1, `기록 ${session.results.length}건`);
  check(session.results[0].timedOut === false, "timedOut이 false가 아님");

  advance(session);
  const wrongIndex = (session.items[1].answerIndex + 1) % 4;
  const second = applyAnswer(session, wrongIndex);
  check(second.correct === false, "오답 판정 실패");
  check(session.score === 1, `오답 뒤 점수 ${session.score}`);
  check(session.results[1].selectedIndex === wrongIndex, "고른 보기가 기록되지 않음");
});

selfTest("applyAnswer는 한 문항을 두 번 채점하지 않는다", check => {
  const session = makeTestSession();
  applyAnswer(session, session.items[0].answerIndex);
  const again = applyAnswer(session, session.items[0].answerIndex);
  check(again === null, "두 번째 채점이 null이 아님");
  check(session.score === 1, `점수 ${session.score}`);
  check(session.results.length === 1, `기록 ${session.results.length}건`);
});

selfTest("applyTimeout은 오답으로 기록하고 중복되지 않는다", check => {
  const session = makeTestSession("speed");
  check(applyTimeout(session) === true, "시간 초과 처리 실패");
  check(session.score === 0, `점수 ${session.score}`);
  check(session.results[0].correct === false, "오답으로 기록되지 않음");
  check(session.results[0].timedOut === true, "timedOut이 기록되지 않음");
  check(session.results[0].selectedIndex === null, "selectedIndex가 null이 아님");
  check(applyTimeout(session) === false, "두 번째 시간 초과가 먹힘");
  check(applyAnswer(session, 0) === null, "시간 초과 뒤에 채점이 먹힘");
  check(session.results.length === 1, `기록 ${session.results.length}건`);
});

selfTest("advance는 마지막 문항에서 멈추고 문항 상태를 되돌린다", check => {
  const session = makeTestSession("hint");
  session.hintUsed = true;
  applyAnswer(session, 0);
  check(advance(session) === true, "다음 문항으로 가지 못함");
  check(session.index === 1, `위치 ${session.index}`);
  check(session.locked === false, "locked가 초기화되지 않음");
  check(session.hintUsed === false, "hintUsed가 초기화되지 않음");

  session.index = session.items.length - 1;
  check(isLastQuestion(session) === true, "마지막 문항 판정 실패");
  check(advance(session) === false, "마지막에서 더 넘어감");
});

selfTest("집계 함수는 맞힌 수와 틀린 수와 힌트 수를 센다", check => {
  const session = makeTestSession("hint");
  session.results = [
    { id: "a", selectedIndex: 0, correct: true, usedHint: false, timedOut: false },
    { id: "b", selectedIndex: 1, correct: true, usedHint: true, timedOut: false },
    { id: "c", selectedIndex: null, correct: false, usedHint: false, timedOut: true }
  ];
  check(countCorrect(session) === 2, `맞힌 수 ${countCorrect(session)}`);
  check(countWrong(session) === 1, `틀린 수 ${countWrong(session)}`);
  check(countHintUsed(session) === 1, `힌트 수 ${countHintUsed(session)}`);
});
```

- [ ] **2단계: 점검이 실패하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: 새 점검 5개가 `createSession is not defined` 등으로 실패.
`자체 점검 결과: 통과 6, 실패 5`, 종료 코드 1.

- [ ] **3단계: 구현한다** (2. 순수 로직 구역 끝에 추가)

```js
function createSession(mode, categoryKey, items, options = {}) {
  return {
    mode: mode,
    categoryKey: categoryKey,
    items: items.slice(),
    index: 0,
    score: 0,
    results: [],
    isReview: Boolean(options.isReview),
    locked: false,     // 현재 문항을 이미 채점했는가
    hintUsed: false    // 현재 문항에서 힌트를 썼는가
  };
}

function currentItem(session) {
  return session.items[session.index];
}

function isLastQuestion(session) {
  return session.index >= session.items.length - 1;
}

// 선택은 확정이며 되돌릴 수 없다 (PRD 3.3). 두 번째 호출은 무시한다.
function applyAnswer(session, choiceIndex) {
  if (session.locked) return null;
  session.locked = true;

  const item = currentItem(session);
  const correct = choiceIndex === item.answerIndex;
  const gained = scoreFor(correct, session.mode, session.hintUsed);
  session.score = Math.round((session.score + gained) * 10) / 10;
  session.results.push({
    id: item.id,
    selectedIndex: choiceIndex,
    correct: correct,
    usedHint: session.hintUsed,
    timedOut: false
  });
  return { correct: correct, gained: gained };
}

// 시간 만료는 0점이지만 정답과 해설은 그대로 보여 준다 (PRD 2.2).
function applyTimeout(session) {
  if (session.locked) return false;
  session.locked = true;

  const item = currentItem(session);
  session.results.push({
    id: item.id,
    selectedIndex: null,
    correct: false,
    usedHint: session.hintUsed,
    timedOut: true
  });
  return true;
}

function advance(session) {
  if (isLastQuestion(session)) return false;
  session.index += 1;
  session.locked = false;
  session.hintUsed = false;
  return true;
}

function countCorrect(session) {
  return session.results.filter(result => result.correct).length;
}

function countWrong(session) {
  return session.results.filter(result => !result.correct).length;
}

function countHintUsed(session) {
  return session.results.filter(result => result.usedHint).length;
}
```

- [ ] **4단계: 점검이 통과하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 11, 실패 0`, 종료 코드 0.

- [ ] **5단계: 커밋**

```bash
cd /c/Study03_Quiz && git add script.js && git commit -m "feat: 채점 상태 전이"
```

---

### 태스크 5: 한국사 10문항

**파일:**
- 수정: `C:\Study03_Quiz\questions.js` (`korean_history.items`)
- 수정: `C:\Study03_Quiz\script.js` (3. 자체 점검 구역 끝 — 실제 데이터 점검 1개)

**인터페이스:**
- 소비: `validateQuestions`, `selfTest`
- 생산: `QUESTIONS.korean_history.items`에 `kh-01` ~ `kh-10`

**이 태스크는 점검이 실패한 상태로 커밋한다.** 세계지리·과학·예술과 문화가 아직
비어 있어 `validateQuestions`가 경고를 내기 때문이다. 태스크 8이 끝나면 통과한다.

- [ ] **1단계: 실제 데이터 점검을 추가한다** (3. 자체 점검 구역 끝에 추가)

```js
selfTest("실제 QUESTIONS가 검증을 통과한다", check => {
  const warnings = validateQuestions(QUESTIONS);
  check(warnings.length === 0, `경고 ${warnings.length}개: ${warnings.slice(0, 5).join(" / ")}`);
});
```

- [ ] **2단계: 점검이 실패하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `실패: 실제 QUESTIONS가 검증을 통과한다`와 함께 카테고리 4개가 모두 문항 0개라는
경고. `자체 점검 결과: 통과 11, 실패 1`, 종료 코드 1.

- [ ] **3단계: 한국사 10문항을 쓴다**

위의 **문항 작성 절차**를 문항마다 그대로 따른다. 출처를 하나하나 직접 열어
확인한다. 형식은 아래와 같다(`answerIndex`는 `choices`의 0-기반 색인이며, 작성할 때
정답 위치를 한쪽으로 몰지 않는다).

```js
  korean_history: {
    label: "한국사",
    items: [
      {
        id: "kh-01",
        question: "조선 세종 때 훈민정음이 반포된 해는?",
        choices: ["1392년", "1443년", "1446년", "1485년"],
        answerIndex: 2,
        explanation: "1443년에 창제하고 1446년에 해례본과 함께 반포했다.",
        source: {
          title: "우리역사넷 — 훈민정음",
          url: "http://contents.history.go.kr/front/tg/index.do?levelId=tg_003_0710",
          checkedAt: "2026-10-11"
        }
      }
      // kh-02 … kh-10
    ]
  },
```

위 예시의 URL과 `checkedAt`도 **그대로 믿지 말고 직접 열어 확인한다.** 링크가 죽었거나
내용이 다르면 다른 출처로 바꾸고, `checkedAt`은 확인한 날짜로 적는다.

- [ ] **4단계: 문항 검수 명령을 돌린다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({});vm.runInContext(fs.readFileSync('questions.js','utf8')+';globalThis.Q=QUESTIONS;',c);for(const k of Object.keys(c.Q))for(const q of c.Q[k].items){if(q.explanation.length>80)console.log('해설 80자 초과',q.id,q.explanation.length);if(/가장|최초|최대|최소|최고|최장|최다/.test(q.question))console.log('최상급 확인',q.id,q.question)}"
```
기대: `해설 80자 초과`가 없다. `최상급 확인`으로 찍힌 문항은 기준과 시점이 본문에
들어 있는지 눈으로 보고, 없으면 고친다.

- [ ] **5단계: 점검 명령으로 한국사만 통과했는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `통과 11, 실패 1`. 경고에 `korean_history`는 더 이상 나오지 않고, 남은 세
카테고리만 `문항이 10개가 아닙니다 (0개)`로 남는다.

- [ ] **6단계: 커밋** (점검이 실패한 상태로 커밋한다)

```bash
cd /c/Study03_Quiz && git add questions.js script.js && git commit -m "content: 한국사 10문항"
```

---

### 태스크 6: 세계지리 10문항

**파일:**
- 수정: `C:\Study03_Quiz\questions.js` (`world_geography.items`)

**인터페이스:**
- 소비: 태스크 5의 실제 데이터 점검
- 생산: `QUESTIONS.world_geography.items`에 `wg-01` ~ `wg-10`

태스크 5와 같은 이유로 점검이 실패한 상태로 커밋한다.

- [ ] **1단계: 세계지리 10문항을 쓴다**

**문항 작성 절차**를 그대로 따른다. 세계지리는 최상급 표현을 쓰기 쉬운 영역이므로
절차 3번(기준과 시점 명시)을 특히 조심한다. 예: `유역 면적이 아니라 길이를 기준으로,
2024년 통용되는 측정값에서 세계에서 가장 긴 강은?` 기준을 적어도 출처들이 값이
엇갈리는 소재(산의 높이 측정값 등)는 문항에서 뺀다.

```js
  world_geography: {
    label: "세계지리",
    items: [
      {
        id: "wg-01",
        question: "(문항 본문)",
        choices: ["(보기1)", "(보기2)", "(보기3)", "(보기4)"],
        answerIndex: 0,
        explanation: "(80자 이내 한 줄 해설)",
        source: { title: "(출처 제목)", url: "(직접 열어 확인한 URL)", checkedAt: "(확인 날짜)" }
      }
      // wg-02 … wg-10
    ]
  },
```

- [ ] **2단계: 문항 검수 명령을 돌린다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({});vm.runInContext(fs.readFileSync('questions.js','utf8')+';globalThis.Q=QUESTIONS;',c);for(const k of Object.keys(c.Q))for(const q of c.Q[k].items){if(q.explanation.length>80)console.log('해설 80자 초과',q.id,q.explanation.length);if(/가장|최초|최대|최소|최고|최장|최다/.test(q.question))console.log('최상급 확인',q.id,q.question)}"
```
기대: `해설 80자 초과`가 없고, `최상급 확인` 문항은 모두 기준과 시점이 들어 있다.

- [ ] **3단계: 점검 명령을 돌린다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `통과 11, 실패 1`. 경고에 `science`와 `arts_culture`만 남는다.

- [ ] **4단계: 커밋**

```bash
cd /c/Study03_Quiz && git add questions.js && git commit -m "content: 세계지리 10문항"
```

---

### 태스크 7: 과학 10문항

**파일:**
- 수정: `C:\Study03_Quiz\questions.js` (`science.items`)

**인터페이스:**
- 소비: 태스크 5의 실제 데이터 점검
- 생산: `QUESTIONS.science.items`에 `sc-01` ~ `sc-10`

태스크 5와 같은 이유로 점검이 실패한 상태로 커밋한다.

- [ ] **1단계: 과학 10문항을 쓴다**

**문항 작성 절차**를 그대로 따른다. 전공 지식을 요구하지 않는 범위로 하고, 수치는
출처에 적힌 값을 그대로 쓴다.

```js
  science: {
    label: "과학",
    items: [
      {
        id: "sc-01",
        question: "수증기를 제외한 건조 공기를 기준으로, 부피 비율이 가장 큰 지구 대기의 기체는?",
        choices: ["산소", "질소", "아르곤", "이산화탄소"],
        answerIndex: 1,
        explanation: "건조 공기의 약 78%가 질소이고 산소는 약 21%다.",
        source: {
          title: "NASA — Earth Fact Sheet",
          url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html",
          checkedAt: "2026-10-11"
        }
      }
      // sc-02 … sc-10
    ]
  },
```

- [ ] **2단계: 문항 검수 명령을 돌린다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({});vm.runInContext(fs.readFileSync('questions.js','utf8')+';globalThis.Q=QUESTIONS;',c);for(const k of Object.keys(c.Q))for(const q of c.Q[k].items){if(q.explanation.length>80)console.log('해설 80자 초과',q.id,q.explanation.length);if(/가장|최초|최대|최소|최고|최장|최다/.test(q.question))console.log('최상급 확인',q.id,q.question)}"
```
기대: `해설 80자 초과`가 없고, `최상급 확인` 문항은 모두 기준과 시점이 들어 있다.
(`sc-01`은 "건조 공기를 기준으로"가 들어 있으므로 그대로 둔다.)

- [ ] **3단계: 점검 명령을 돌린다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `통과 11, 실패 1`. 경고에 `arts_culture`만 남는다.

- [ ] **4단계: 커밋**

```bash
cd /c/Study03_Quiz && git add questions.js && git commit -m "content: 과학 10문항"
```

---

### 태스크 8: 예술과 문화 10문항

**파일:**
- 수정: `C:\Study03_Quiz\questions.js` (`arts_culture.items`)

**인터페이스:**
- 소비: 태스크 5의 실제 데이터 점검
- 생산: `QUESTIONS.arts_culture.items`에 `ac-01` ~ `ac-10`. 이 태스크가 끝나면 40문항이
  모두 채워지고 실제 데이터 점검이 통과한다.

- [ ] **1단계: 예술과 문화 10문항을 쓴다**

**문항 작성 절차**를 그대로 따른다. 작품·작가·양식은 미술관·박물관 공식 누리집이나
유네스코, 국가유산청 쪽을 우선 출처로 쓴다.

```js
  arts_culture: {
    label: "예술과 문화",
    items: [
      {
        id: "ac-01",
        question: "(문항 본문)",
        choices: ["(보기1)", "(보기2)", "(보기3)", "(보기4)"],
        answerIndex: 3,
        explanation: "(80자 이내 한 줄 해설)",
        source: { title: "(출처 제목)", url: "(직접 열어 확인한 URL)", checkedAt: "(확인 날짜)" }
      }
      // ac-02 … ac-10
    ]
  }
```

- [ ] **2단계: 문항 검수 명령을 돌린다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({});vm.runInContext(fs.readFileSync('questions.js','utf8')+';globalThis.Q=QUESTIONS;',c);for(const k of Object.keys(c.Q))for(const q of c.Q[k].items){if(q.explanation.length>80)console.log('해설 80자 초과',q.id,q.explanation.length);if(/가장|최초|최대|최소|최고|최장|최다/.test(q.question))console.log('최상급 확인',q.id,q.question)}"
```
기대: `해설 80자 초과`가 없고, `최상급 확인` 문항은 모두 기준과 시점이 들어 있다.

- [ ] **3단계: 40문항이 모두 점검을 통과하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 12, 실패 0`, 종료 코드 0.

- [ ] **4단계: 출처 40개를 훑는다**

`questions.js`의 `source.url` 40개를 훑어, 실제로 열어 본 것만 남았는지 확인한다.
열어 보지 않은 URL이 하나라도 있으면 지금 열어 확인한다. 위키백과·나무위키·블로그가
섞여 있으면 다른 출처로 바꾼다.

- [ ] **5단계: 커밋**

```bash
cd /c/Study03_Quiz && git add questions.js && git commit -m "content: 예술과 문화 10문항"
```

---

### 태스크 9: 연습 모드 화면

이 앱의 존재 이유가 이 태스크다. 답을 고른 직후 같은 화면에 정답 여부와 해설이 떠야
한다. 화면 전환이나 추가 클릭이 필요해지면 태스크 실패다.

**파일:**
- 생성: `C:\Study03_Quiz\index.html`
- 생성: `C:\Study03_Quiz\style.css`
- 수정: `C:\Study03_Quiz\script.js` (4. 상태, 5. 화면 조작, 6. 시작 구역)

**인터페이스:**
- 소비: `buildRound`, `createSession`, `applyAnswer`, `advance`, `isLastQuestion`,
  `currentItem`, `countCorrect`, `countWrong`, `countHintUsed`, `formatScore`,
  `validateQuestions`, `reportDataWarnings`, `CATEGORY_ORDER`, `MODE_LABELS`
- 생산:
  - 상태: `let session = null`, `let currentMode = "practice"`
  - `showScreen(id): void`, `showFatal(message): void`, `showDataWarning(count): void`
  - `categoryLabel(categoryKey): string`
  - `renderCategoryScreen(): void`
  - `startRound(mode, categoryKey, options = {}): void`
  - `renderQuestion(): void`, `updateHud(): void`
  - `onChoiceClick(choiceIndex): void`, `revealAnswer(selectedIndex): void`
  - `renderFeedback(correct, timedOut): void`, `onNextClick(): void`
  - `renderResult(): void`
  - `init(): void`
  - 요소 id: `app-error`, `app-warning`, `screen-*`, `category-list`,
    `category-mode-note`, `category-to-mode`, `quiz-progress`, `quiz-score`,
    `quiz-context`, `quiz-timer`, `quiz-question`, `quiz-choices`, `quiz-hint`,
    `quiz-feedback`, `feedback-verdict`, `feedback-explanation`, `feedback-source`,
    `quiz-next`, `result-score`, `result-breakdown`, `result-hint-count`,
    `result-note`, `result-items`, `result-save`, `result-name`, `result-save-btn`,
    `result-save-msg`,
    `result-retry-wrong`, `result-again`, `result-to-category`, `result-to-mode`,
    `mode-list`, `mode-to-leaderboard`, `lb-tables`, `lb-storage-warning`, `lb-clear`,
    `lb-back`

- [ ] **1단계: `index.html`을 만든다**

화면 5개를 모두 써 두고 `hidden`으로 감춘다. 2·3단계에서 쓸 요소(`quiz-timer`,
`quiz-hint`, `result-save`, `result-retry-wrong`, `result-to-mode`,
`mode-to-leaderboard`)도 지금 만들어 두고 감춘 채 둔다.

```html
<!doctype html>
<!-- 작성일시: (파일을 만드는 시점의 KST 시각) -->
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>상식 퀴즈</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1 class="app-title">상식 퀴즈</h1>
  <p id="app-error" class="banner error hidden" role="alert"></p>
  <p id="app-warning" class="banner warn hidden" role="alert"></p>

  <main>
    <section id="screen-mode" class="screen hidden" aria-labelledby="mode-heading">
      <h2 id="mode-heading">모드 선택</h2>
      <ul id="mode-list" class="pick-list"></ul>
      <div class="screen-actions">
        <button id="mode-to-leaderboard" class="hidden" type="button">순위표 보기</button>
      </div>
    </section>

    <section id="screen-category" class="screen hidden" aria-labelledby="category-heading">
      <h2 id="category-heading">카테고리 선택</h2>
      <p id="category-mode-note" class="note"></p>
      <ul id="category-list" class="pick-list"></ul>
      <div class="screen-actions">
        <button id="category-to-mode" class="hidden" type="button">모드 선택으로</button>
      </div>
    </section>

    <section id="screen-quiz" class="screen hidden" aria-labelledby="quiz-question">
      <div class="quiz-hud">
        <span id="quiz-context"></span>
        <span id="quiz-progress"></span>
        <span id="quiz-score"></span>
        <span id="quiz-timer" class="hidden" role="timer"></span>
      </div>

      <h2 id="quiz-question"></h2>
      <ul id="quiz-choices" class="choices"></ul>
      <button id="quiz-hint" class="hidden" type="button">힌트</button>

      <div id="quiz-feedback" class="feedback hidden" role="status">
        <p id="feedback-verdict" class="verdict"></p>
        <p id="feedback-explanation"></p>
        <p id="feedback-source" class="source"></p>
        <button id="quiz-next" type="button">다음</button>
      </div>
    </section>

    <section id="screen-result" class="screen hidden" aria-labelledby="result-heading">
      <h2 id="result-heading">결과</h2>
      <p id="result-score" class="result-score"></p>
      <p id="result-breakdown"></p>
      <p id="result-hint-count" class="hidden"></p>
      <p id="result-note" class="note hidden"></p>

      <ol id="result-items" class="result-items"></ol>

      <div id="result-save" class="hidden">
        <label for="result-name">이름(별명)</label>
        <input id="result-name" type="text" maxlength="20" autocomplete="off">
        <button id="result-save-btn" type="button">기록 저장</button>
        <p id="result-save-msg" class="note hidden" role="status"></p>
      </div>

      <div class="screen-actions">
        <button id="result-retry-wrong" class="hidden" type="button">틀린 문제 다시 풀기</button>
        <button id="result-again" type="button">같은 모드 다시</button>
        <button id="result-to-category" type="button">처음으로</button>
        <button id="result-to-mode" class="hidden" type="button">모드 선택</button>
      </div>
    </section>

    <section id="screen-leaderboard" class="screen hidden" aria-labelledby="lb-heading">
      <h2 id="lb-heading">순위표</h2>
      <p id="lb-storage-warning" class="note hidden" role="alert"></p>
      <div id="lb-tables"></div>
      <div class="screen-actions">
        <button id="lb-clear" type="button">기록 전체 지우기</button>
        <button id="lb-back" type="button">모드 선택으로</button>
      </div>
    </section>
  </main>

  <script src="questions.js"></script>
  <script src="script.js"></script>
</body>
</html>
```

- [ ] **2단계: `style.css`를 만든다**

정답과 오답을 색만으로 구분하지 않는다. 테두리 굵기와 앞머리 글자를 함께 쓴다.

```css
/* 작성일시: (파일을 만드는 시점의 KST 시각) */
:root {
  --bg: #f7f7f9;
  --fg: #1b1b1f;
  --muted: #5c5c66;
  --line: #d6d6dd;
  --accent: #2f5bd8;
  --correct: #1b7f4a;
  --wrong: #b3261e;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 16px;
  background: var(--bg);
  color: var(--fg);
  font-family: "Malgun Gothic", "맑은 고딕", system-ui, sans-serif;
  line-height: 1.6;
}

.app-title { font-size: 1.25rem; margin: 0 0 16px; }

main { max-width: 720px; margin: 0 auto; }

.hidden { display: none; }

.screen {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 20px;
}

.banner {
  max-width: 720px;
  margin: 0 auto 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #fff;
}

.banner.error { border: 1px solid var(--wrong); color: var(--wrong); }
.banner.warn { border: 1px solid var(--accent); color: var(--accent); }

.note { color: var(--muted); margin: 0 0 12px; }

button {
  font: inherit;
  cursor: pointer;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #fff;
  color: var(--fg);
}

button:disabled { cursor: default; }

.pick-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.pick-list button { width: 100%; text-align: left; padding: 14px 16px; }
.pick-list button:hover { border-color: var(--accent); }
.pick-list .pick-sub { display: block; color: var(--muted); font-size: 0.9rem; }
.pick-list .pick-warn { display: block; color: var(--wrong); font-size: 0.9rem; }

.screen-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }

.quiz-hud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 12px;
}

#quiz-timer { font-variant-numeric: tabular-nums; font-weight: bold; color: var(--fg); }
#quiz-timer.is-urgent { color: var(--wrong); }

#quiz-question { font-size: 1.15rem; margin: 0 0 16px; }

.choices { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.choices button { width: 100%; text-align: left; }
.choices button:hover:enabled { border-color: var(--accent); }

.choices button.is-correct {
  border: 2px solid var(--correct);
  color: var(--correct);
  font-weight: bold;
}
.choices button.is-correct::before { content: "정답 — "; }

.choices button.is-wrong { border: 2px solid var(--wrong); color: var(--wrong); }
.choices button.is-wrong::before { content: "내 선택 — "; }

.choices button.is-removed { display: none; }

.feedback { margin-top: 16px; padding: 14px 16px 0; border-top: 1px solid var(--line); }
.verdict { font-weight: bold; margin: 0 0 8px; }
.verdict.ok { color: var(--correct); }
.verdict.no { color: var(--wrong); }
.source { font-size: 0.85rem; color: var(--muted); margin: 8px 0 14px; }
.source a { color: var(--accent); }

.result-score { font-size: 1.6rem; font-weight: bold; margin: 0 0 8px; }

#result-save { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
#result-save label { color: var(--muted); }
#result-save input {
  font: inherit;
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 6px;
  min-width: 160px;
}
#result-save-msg { flex-basis: 100%; margin: 0; }

.lb-group { margin-bottom: 20px; }
.lb-group h3 { font-size: 1rem; margin: 0 0 8px; }
.lb-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.lb-table th, .lb-table td { text-align: left; padding: 7px 8px; border-bottom: 1px solid var(--line); }
.lb-table th { color: var(--muted); font-weight: normal; }
.lb-table td.lb-score { font-variant-numeric: tabular-nums; font-weight: bold; }
.lb-empty { color: var(--muted); margin: 0; }

.result-items { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 8px; }
.result-items li {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  gap: 2px 10px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-left-width: 4px;
  border-radius: 6px;
}
.result-items li.ri-ok { border-left-color: var(--correct); }
.result-items li.ri-no { border-left-color: var(--wrong); }
.result-items .ri-verdict { grid-row: span 2; font-weight: bold; }
.result-items li.ri-ok .ri-verdict { color: var(--correct); }
.result-items li.ri-no .ri-verdict { color: var(--wrong); }
.result-items .ri-answer { color: var(--muted); font-size: 0.9rem; }

@media (max-width: 480px) {
  body { padding: 12px; }
  .screen { padding: 14px; }
  .lb-table th, .lb-table td { padding: 6px 4px; }
  .result-items li { grid-template-columns: 1fr; }
}
```

- [ ] **3단계: 상태와 화면 조작을 구현한다** (4·5·6 구역)

`// ===== 4. 상태 =====` 아래:

```js
let session = null;
let currentMode = "practice";   // 2단계에서 모드 선택 화면이 바꾼다
```

`// ===== 5. 화면 조작 =====` 아래:

```js
function byId(id) {
  return document.getElementById(id);
}

function showScreen(id) {
  for (const screenId of SCREENS) {
    const el = byId(screenId);
    if (el) el.classList.toggle("hidden", screenId !== id);
  }
  window.scrollTo(0, 0);
}

function showFatal(message) {
  const box = byId("app-error");
  box.textContent = message;
  box.classList.remove("hidden");
  for (const screenId of SCREENS) {
    const el = byId(screenId);
    if (el) el.classList.add("hidden");
  }
}

function showDataWarning(count) {
  const box = byId("app-warning");
  if (count === 0) {
    box.classList.add("hidden");
    return;
  }
  box.textContent = `문항 데이터에 문제가 ${count}건 있습니다. 개발자 도구 콘솔을 확인해 주세요.`;
  box.classList.remove("hidden");
}

function categoryLabel(categoryKey) {
  const category = QUESTIONS[categoryKey];
  return category && category.label ? category.label : categoryKey;
}

function renderCategoryScreen() {
  // 시작 화면에 모드를 적고, 연습 모드면 순위표 미기록을 함께 알린다 (PRD 2.2).
  const modeNote = `${MODE_LABELS[currentMode]} 모드`;
  byId("category-mode-note").textContent =
    currentMode === "practice" ? `${modeNote} · 순위표에 기록되지 않음` : modeNote;

  const list = byId("category-list");
  list.textContent = "";

  for (const key of CATEGORY_ORDER) {
    const category = QUESTIONS[key];
    if (!category || !Array.isArray(category.items)) continue;

    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.category = key;
    button.textContent = category.label;

    const sub = document.createElement("span");
    sub.className = "pick-sub";
    // 하드코딩한 10이 아니라 실제 문항 수를 쓴다 (리뷰 중점 2).
    sub.textContent = `문항 ${category.items.length}개`;
    button.appendChild(sub);

    button.addEventListener("click", () => startRound(currentMode, key));
    li.appendChild(button);
    list.appendChild(li);
  }
}

function startRound(mode, categoryKey, options = {}) {
  currentMode = mode;
  const items = options.items ? options.items : buildRound(QUESTIONS, categoryKey);
  if (items.length === 0) {
    showFatal("이 카테고리의 문항을 불러올 수 없습니다. questions.js를 확인해 주세요.");
    return;
  }
  session = createSession(mode, categoryKey, items, { isReview: Boolean(options.isReview) });
  renderQuestion();
  showScreen("screen-quiz");
}

function updateHud() {
  byId("quiz-progress").textContent = `${session.index + 1} / ${session.items.length}`;
  byId("quiz-score").textContent =
    session.isReview ? "복습 중" : `점수 ${formatScore(session.score)}`;
  byId("quiz-context").textContent =
    `${categoryLabel(session.categoryKey)} · ${MODE_LABELS[session.mode]}`;
}

function renderQuestion() {
  const item = currentItem(session);
  updateHud();
  byId("quiz-question").textContent = item.question;

  const list = byId("quiz-choices");
  list.textContent = "";
  item.choices.forEach((text, i) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.index = String(i);
    button.textContent = text;
    button.addEventListener("click", () => onChoiceClick(i));
    li.appendChild(button);
    list.appendChild(li);
  });

  byId("quiz-feedback").classList.add("hidden");
}

function onChoiceClick(choiceIndex) {
  const outcome = applyAnswer(session, choiceIndex);
  if (outcome === null) return;   // 이미 채점한 문항 (리뷰 중점 3)
  revealAnswer(choiceIndex);
  renderFeedback(outcome.correct, false);
  updateHud();
}

function revealAnswer(selectedIndex) {
  const item = currentItem(session);
  for (const button of byId("quiz-choices").querySelectorAll("button")) {
    const i = Number(button.dataset.index);
    button.disabled = true;
    button.classList.remove("is-removed");   // 힌트로 감춘 보기도 정답 확인 때는 보여 준다
    if (i === item.answerIndex) button.classList.add("is-correct");
    else if (i === selectedIndex) button.classList.add("is-wrong");
  }
}

function renderFeedback(correct, timedOut) {
  const item = currentItem(session);

  const verdict = byId("feedback-verdict");
  verdict.classList.remove("ok", "no");
  if (timedOut) {
    verdict.textContent = "시간 초과 — 오답으로 처리했습니다";
    verdict.classList.add("no");
  } else if (correct) {
    verdict.textContent = "정답입니다";
    verdict.classList.add("ok");
  } else {
    verdict.textContent = "오답입니다";
    verdict.classList.add("no");
  }

  byId("feedback-explanation").textContent = item.explanation;

  const sourceBox = byId("feedback-source");
  sourceBox.textContent = "출처: ";
  const link = document.createElement("a");
  link.href = item.source.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = item.source.title || item.source.url;
  sourceBox.appendChild(link);
  if (item.source.checkedAt) {
    sourceBox.appendChild(document.createTextNode(` (확인: ${item.source.checkedAt})`));
  }

  byId("quiz-next").textContent = isLastQuestion(session) ? "결과 보기" : "다음";
  byId("quiz-feedback").classList.remove("hidden");
}

function onNextClick() {
  if (advance(session)) {
    renderQuestion();
    return;
  }
  renderResult();
  showScreen("screen-result");
}

function renderResult() {
  const total = session.items.length;   // 하드코딩한 10을 쓰지 않는다 (리뷰 중점 2)
  const correct = countCorrect(session);
  const scoreBox = byId("result-score");
  const note = byId("result-note");

  if (session.isReview) {
    // 복습은 점수를 매기지 않고 맞힌 수만 알려 준다 (PRD 2.2).
    scoreBox.textContent = `맞힌 문항 ${correct} / ${total}`;
    note.textContent = "복습 — 점수에 반영되지 않음";
    note.classList.remove("hidden");
  } else {
    scoreBox.textContent = `${formatScore(session.score)} / ${total}`;
    if (session.mode === "practice") {
      note.textContent = "순위표에 기록되지 않음";
      note.classList.remove("hidden");
    } else {
      note.textContent = "";
      note.classList.add("hidden");
    }
  }

  byId("result-breakdown").textContent =
    `맞힌 문항 ${correct}개 · 틀린 문항 ${countWrong(session)}개`;

  const hintBox = byId("result-hint-count");
  if (session.mode === "hint") {
    hintBox.textContent = `힌트를 쓴 문항 ${countHintUsed(session)}개`;
    hintBox.classList.remove("hidden");
  } else {
    hintBox.classList.add("hidden");
  }

  renderResultItems();
}

// 문항별로 정답·오답과 정답 보기를 함께 보여 준다. 사용자 입력은 textContent로만 넣는다.
function renderResultItems() {
  const list = byId("result-items");
  list.textContent = "";

  session.results.forEach((result, i) => {
    const item = session.items.find(candidate => candidate.id === result.id) || session.items[i];
    if (!item) return;

    const li = document.createElement("li");
    li.className = result.correct ? "ri-ok" : "ri-no";

    const verdict = document.createElement("span");
    verdict.className = "ri-verdict";
    verdict.textContent = result.timedOut ? "시간 초과" : result.correct ? "정답" : "오답";
    li.appendChild(verdict);

    const question = document.createElement("span");
    question.className = "ri-question";
    question.textContent = `${i + 1}. ${item.question}`;
    li.appendChild(question);

    const answer = document.createElement("span");
    answer.className = "ri-answer";
    let text = `정답: ${item.choices[item.answerIndex]}`;
    if (!result.correct && result.selectedIndex !== null) {
      text += ` · 내 선택: ${item.choices[result.selectedIndex]}`;
    }
    answer.textContent = text;
    li.appendChild(answer);

    list.appendChild(li);
  });
}

function init() {
  if (typeof QUESTIONS === "undefined" || !QUESTIONS) {
    showFatal("문항 데이터를 불러오지 못했습니다. questions.js가 같은 폴더에 있는지 확인해 주세요.");
    return;
  }

  const warnings = validateQuestions(QUESTIONS);
  reportDataWarnings(warnings);
  showDataWarning(warnings.length);

  byId("quiz-next").addEventListener("click", onNextClick);
  byId("result-again").addEventListener("click", () => startRound(session.mode, session.categoryKey));
  byId("result-to-category").addEventListener("click", () => {
    renderCategoryScreen();
    showScreen("screen-category");
  });

  renderCategoryScreen();
  showScreen("screen-category");
}
```

`// ===== 6. 시작 =====`의 `runSelfTests` 줄 **아래**에 추가:

```js
if (typeof document !== "undefined") init();
```

- [ ] **4단계: 점검 명령으로 Node에서 깨지지 않았는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 12, 실패 0`, 종료 코드 0. Node에는 `document`가 없어
`init`은 실행되지 않는다.

- [ ] **5단계: 데이터 경고 표시를 확인한다**

`questions.js`의 `kh-01`의 `answerIndex`를 잠시 `9`로 바꾸고 `index.html`을 브라우저로
연다. 화면 위에 `문항 데이터에 문제가 1건 있습니다…`가 보이고, 콘솔에
`[quiz] 데이터 경고: kh-01: answerIndex가 0~3 범위의 정수가 아닙니다`가 찍히며,
**퀴즈는 그대로 풀 수 있는지** 확인한다. 확인 후 원래 값으로 되돌리고 새로고침해서
경고가 사라지는 것까지 본다.

- [ ] **6단계: 1단계 "브라우저에서 직접 확인할 항목"을 실행자가 먼저 확인한다**

내장 브라우저로 `file:///C:/Study03_Quiz/index.html`을 열 수 있으면 1단계 목록을 따라
확인하고 결과를 보고한다. 열 수 없으면 그 사실을 보고한다.

- [ ] **7단계: 커밋**

```bash
cd /c/Study03_Quiz && git add index.html style.css script.js && git commit -m "feat: 연습 모드 화면"
```

- [ ] **8단계: 멈추고 사용자에게 1단계 확인을 요청한다**

**여기서 작업을 멈춘다.** 사용자가 1단계의 "브라우저에서 직접 확인할 항목"을 확인하고
다음 단계를 시작하라고 말할 때까지 2단계를 시작하지 않는다.

---

# 2단계: 스피드 모드, 힌트 모드, 틀린 문제 다시 풀기

**만들 것**

- 순수 로직: `pickHintRemovals`(지울 오답 2개), `wrongItemsOf`(복습 문항),
  `canRetryWrong`과 그 점검
- 모드 선택 화면(연습·스피드·힌트). 연습 항목에 `순위표에 기록되지 않음` 표시
- 스피드 모드: 문항마다 15초 타이머, 시간 초과는 오답 처리하고 **정답과 해설을 보여 줌**,
  해설 중에는 타이머 정지, [다음]에서 15초 재시작
- 힌트 모드: 문항마다 힌트 1번, 오답 2개를 무작위로 감춤, 힌트 쓰고 맞히면 0.5점
- 연습 모드 결과 화면의 [틀린 문제 다시 풀기](재채점 없음, 저장 없음)
- 카테고리 화면의 [모드 선택] 입구

> **1단계 뒤 결정(2026-10-12, 수업 노트 기준):** 결과 화면 버튼은 [같은 모드 다시]와
> [처음으로] 둘뿐이다. 2단계에서는 `result-to-category`([처음으로])가 모드 선택
> 화면으로 가게 하고, `result-to-mode`([모드 선택]) 버튼은 쓰지 않는다. 아래 태스크
> 11·12에 남아 있는 `result-to-mode` 단계는 그때 이 결정에 맞춰 고친다.
> 힌트 모드 결과의 점수 표기(노트는 `맞힌 수 / 문항 수`, PRD 2.3은 `6.5 / 10`)는
> 사용자에게 확인한 뒤 정한다.

**완료 기준** (실행자가 스스로 점검한다)

- [ ] 점검 명령이 `자체 점검 결과: 통과 15, 실패 0`으로 끝나고 종료 코드가 0이다.
- [ ] `pickHintRemovals`가 어떤 난수에서도 정답을 지우지 않는다(점검에 포함).
- [ ] 스피드 모드에서 `stopTimer`가 채점·결과 이동·판 시작·모드 이동에서 모두 불린다
      (코드를 눈으로 확인).
- [ ] `file://`로 열었을 때 콘솔에 오류가 없다.

**브라우저에서 직접 확인할 항목** (사용자가 확인한다 — PRD 7.1·7.3)

- [ ] 1. 앱을 열면 모드 선택 화면이 나오고, 모드 3개와 각각의 한 줄 설명이 보인다.
      연습 항목에 `순위표에 기록되지 않음`이 붙어 있다.
- [ ] 2. [스피드]로 들어간다. 남은 시간이 15에서 1초씩 줄고, 5초 이하에서 빨간색이 된다.
- [ ] 3. 스피드에서 답을 고른다. 타이머가 멈추고 해설이 나온다. 10초쯤 기다려도 숫자가
      그대로다.
- [ ] 4. [다음]을 누르면 다음 문항에서 다시 15부터 센다.
- [ ] 5. 스피드에서 일부러 답하지 않고 15초를 넘긴다. 오답으로 처리되고 **정답과 해설이
      나온다.**
- [ ] 6. [힌트]로 들어가 [힌트]를 누른다. 보기 4개 중 2개가 사라지고, 남은 2개 안에
      정답이 있다. 버튼이 비활성화된다.
- [ ] 7. 힌트를 쓰고 맞힌다. 점수가 0.5만 오른다. 힌트를 쓰지 않고 맞히면 1이 오른다.
      점수가 `6.5`처럼 보인다.
- [ ] 8. 답을 고른 뒤에는 [힌트]를 누를 수 없다.
- [ ] 9. 힌트 모드 결과 화면에 `힌트를 쓴 문항 N개`가 보인다.
- [ ] 10. 연습으로 몇 문항 일부러 틀린다. 결과 화면에 [틀린 문제 다시 풀기]가 보인다.
- [ ] 11. 다시 풀기로 들어가 전부 맞힌다. **원래 점수가 오르지 않고**,
      `복습 — 점수에 반영되지 않음`이 보이며 맞힌 수만 나온다.
- [ ] 12. 다시 풀기에서 또 틀리면 다시 풀기를 한 번 더 할 수 있다.
- [ ] 13. 스피드 문항 중간에 [모드 선택]으로 나간다. 20초를 기다려도 화면이 바뀌지 않고
      콘솔도 조용하다.
- [ ] 14. 연습·힌트에는 시간 표시가 없고, 스피드에는 힌트 버튼이 없다.
- [ ] 15. 창 폭 400px에서 모드 카드·보기·타이머·힌트 버튼이 겹치거나 잘리지 않는다.

---

### 태스크 10: 힌트와 다시 풀기용 순수 로직

**파일:**
- 수정: `C:\Study03_Quiz\script.js` (2. 순수 로직 구역 끝, 3. 자체 점검 구역 끝)

**인터페이스:**
- 소비: `shuffle`, `toRoundItem`, `countWrong`, `buildRound`, `makeQuestionSet`, `selfTest`
- 생산:
  - `pickHintRemovals(item, random = Math.random): number[]` — 섞인 보기를 기준으로
    오답 3개 중 2개를 무작위로 골라 색인 배열로 반환
  - `wrongItemsOf(session, random = Math.random): Item[]` — 틀린 문항만 추려 다시 섞음
  - `canRetryWrong(session): boolean` — 연습 모드이고 틀린 문항이 1개 이상인가

- [ ] **1단계: 실패하는 점검을 쓴다** (3. 자체 점검 구역 끝에 추가)

```js
selfTest("pickHintRemovals는 오답 2개만 고르고 정답을 남긴다", check => {
  const item = toRoundItem(makeQuestion("science", 1), () => 0.5);
  for (let seed = 0; seed < 50; seed++) {
    const removals = pickHintRemovals(item, () => (seed % 9) / 9);
    check(removals.length === 2, `지울 보기 ${removals.length}개`);
    check(!removals.includes(item.answerIndex), "정답을 지움");
    check(new Set(removals).size === 2, "같은 보기를 두 번 지움");
    check(removals.every(i => i >= 0 && i <= 3), `색인 범위 밖 ${removals.join()}`);
  }
});

selfTest("wrongItemsOf는 틀린 문항만 담는다", check => {
  const data = makeQuestionSet();
  const session = createSession("practice", "science", buildRound(data, "science", () => 0));
  session.results = session.items.map((item, i) => ({
    id: item.id,
    selectedIndex: 0,
    correct: i < 7,
    usedHint: false,
    timedOut: false
  }));
  const wrongIds = session.results.filter(r => !r.correct).map(r => r.id).sort().join(",");
  const review = wrongItemsOf(session, () => 0);
  check(review.length === 3, `복습 문항 ${review.length}개`);
  check(review.map(item => item.id).sort().join(",") === wrongIds, "복습 문항이 다름");
  check(review.every(item => item.choices.length === 4), "보기가 4개가 아님");
  check(review.every(item => item.choices[item.answerIndex].includes("정답")),
    "복습 문항의 정답 위치가 틀림");
});

selfTest("canRetryWrong은 연습 모드에서 틀린 문항이 있을 때만 참이다", check => {
  const data = makeQuestionSet();
  const make = mode => createSession(mode, "science", buildRound(data, "science", () => 0));

  const clean = make("practice");
  clean.results = [{ id: "a", selectedIndex: 0, correct: true, usedHint: false, timedOut: false }];
  check(canRetryWrong(clean) === false, "다 맞혔는데 참");

  const dirty = make("practice");
  dirty.results = [{ id: "a", selectedIndex: 0, correct: false, usedHint: false, timedOut: false }];
  check(canRetryWrong(dirty) === true, "틀렸는데 거짓");

  const speed = make("speed");
  speed.results = [{ id: "a", selectedIndex: 0, correct: false, usedHint: false, timedOut: false }];
  check(canRetryWrong(speed) === false, "스피드 모드인데 참");

  const review = createSession("practice", "science", buildRound(data, "science", () => 0), { isReview: true });
  review.results = [{ id: "a", selectedIndex: 0, correct: false, usedHint: false, timedOut: false }];
  check(canRetryWrong(review) === true, "복습에서 또 틀렸는데 거짓");
});
```

- [ ] **2단계: 점검이 실패하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: 새 점검 3개가 `pickHintRemovals is not defined` 등으로 실패.
`자체 점검 결과: 통과 12, 실패 3`, 종료 코드 1.

- [ ] **3단계: 구현한다** (2. 순수 로직 구역 끝에 추가)

```js
// 섞은 뒤의 보기를 기준으로 오답 3개 중 2개를 무작위로 고른다 (PRD 2.2).
function pickHintRemovals(item, random = Math.random) {
  const wrongIndexes = item.choices
    .map((_, i) => i)
    .filter(i => i !== item.answerIndex);
  return shuffle(wrongIndexes, random).slice(0, 2);
}

// 복습에서도 문항과 보기 순서를 다시 섞는다.
function wrongItemsOf(session, random = Math.random) {
  const wrongIds = session.results.filter(result => !result.correct).map(result => result.id);
  const wrongItems = session.items.filter(item => wrongIds.includes(item.id));
  return shuffle(wrongItems, random).map(item => toRoundItem(item, random));
}

// 연습 모드(원판이든 복습이든)에서만, 틀린 문항이 있을 때만 쓸 수 있다.
function canRetryWrong(session) {
  return Boolean(session) && session.mode === "practice" && countWrong(session) > 0;
}
```

- [ ] **4단계: 점검이 통과하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 15, 실패 0`, 종료 코드 0.

- [ ] **5단계: 커밋**

```bash
cd /c/Study03_Quiz && git add script.js && git commit -m "feat: 힌트와 다시 풀기용 순수 로직"
```

---

### 태스크 11: 모드 선택 화면

**파일:**
- 수정: `C:\Study03_Quiz\index.html` (감춰 둔 입구 2개 노출)
- 수정: `C:\Study03_Quiz\script.js` (1. 상수, 5. 화면 조작, `init`)

**인터페이스:**
- 소비: `showScreen`, `renderCategoryScreen`, `currentMode`
- 생산:
  - 상수 `MODE_INFO: {key, label, rule, ranked}[]`
  - `renderModeScreen(): void`
  - `goToModeScreen(): void` — 모드 선택 화면으로 (태스크 12에서 타이머 정지를 더한다)

- [ ] **1단계: `index.html`에서 입구 2개를 보이게 한다**

`class="hidden"`만 지운다.

```html
        <button id="category-to-mode" type="button">모드 선택으로</button>
```

```html
        <button id="result-to-mode" type="button">모드 선택</button>
```

- [ ] **2단계: 모드 설명 상수를 더한다** (1. 상수 구역의 `MODE_LABELS` 아래)

```js
const MODE_INFO = [
  {
    key: "practice",
    label: "연습",
    rule: "시간 제한과 힌트 없이 천천히 푼다. 틀린 문제를 다시 풀 수 있다.",
    ranked: false
  },
  {
    key: "speed",
    label: "스피드",
    rule: "문항마다 15초. 시간이 지나면 오답으로 처리한다.",
    ranked: true
  },
  {
    key: "hint",
    label: "힌트",
    rule: "문항마다 힌트 1번. 힌트를 쓰고 맞히면 0.5점.",
    ranked: true
  }
];
```

- [ ] **3단계: 모드 선택 화면을 구현한다** (5. 화면 조작 구역의 `renderCategoryScreen` 위)

```js
function renderModeScreen() {
  const list = byId("mode-list");
  list.textContent = "";

  for (const mode of MODE_INFO) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.mode = mode.key;
    button.textContent = mode.label;

    const sub = document.createElement("span");
    sub.className = "pick-sub";
    sub.textContent = mode.rule;
    button.appendChild(sub);

    if (!mode.ranked) {
      const warn = document.createElement("span");
      warn.className = "pick-warn";
      warn.textContent = "순위표에 기록되지 않음";
      button.appendChild(warn);
    }

    button.addEventListener("click", () => {
      currentMode = mode.key;
      renderCategoryScreen();
      showScreen("screen-category");
    });

    li.appendChild(button);
    list.appendChild(li);
  }
}

function goToModeScreen() {
  renderModeScreen();
  showScreen("screen-mode");
}
```

- [ ] **4단계: `init`을 고친다**

`renderCategoryScreen(); showScreen("screen-category");` 두 줄을 **지우고** 아래로
바꾼다. 입구 2개도 연결한다.

```js
  byId("result-to-mode").addEventListener("click", goToModeScreen);
  byId("category-to-mode").addEventListener("click", goToModeScreen);

  goToModeScreen();
```

- [ ] **5단계: 점검 명령으로 Node에서 깨지지 않았는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 15, 실패 0`, 종료 코드 0.

- [ ] **6단계: 브라우저로 모드 선택을 확인한다**

`index.html`을 열어 모드 3개와 한 줄 설명이 보이는지, 연습 항목에
`순위표에 기록되지 않음`이 붙는지, 모드를 고르면 카테고리 화면에 `모드: 힌트`처럼
선택한 모드가 보이는지, [모드 선택으로]로 돌아오는지 확인한다.

- [ ] **7단계: 커밋**

```bash
cd /c/Study03_Quiz && git add index.html script.js && git commit -m "feat: 모드 선택 화면"
```

---

### 태스크 12: 스피드 모드

**파일:**
- 수정: `C:\Study03_Quiz\script.js` (1. 상수, 5. 화면 조작, `init`)

**인터페이스:**
- 소비: `applyTimeout`, `revealAnswer`, `renderFeedback`, `updateHud`, `session`
- 생산:
  - 상수 `SPEED_LIMIT_SEC = 15`
  - `let timerId = null`, `let remainingSec = 0`
  - `startTimer(): void` — 스피드 모드일 때만 15초부터 센다
  - `stopTimer(): void` — 여러 번 불러도 안전하다
  - `renderTimer(): void` — 스피드 모드가 아니면 감춘다
  - `onTimeout(): void` — 오답 처리 + 정답·해설 표시

- [ ] **1단계: 상수를 더한다** (1. 상수 구역의 `QUESTIONS_PER_ROUND` 아래)

```js
const SPEED_LIMIT_SEC = 15;
```

- [ ] **2단계: 타이머를 구현한다** (5. 화면 조작 구역의 `renderQuestion` 아래)

```js
let timerId = null;
let remainingSec = 0;

function renderTimer() {
  const box = byId("quiz-timer");
  if (!session || session.mode !== "speed") {
    box.classList.add("hidden");
    box.classList.remove("is-urgent");
    box.textContent = "";
    return;
  }
  box.classList.remove("hidden");
  box.classList.toggle("is-urgent", remainingSec <= 5);
  box.textContent = `남은 시간 ${remainingSec}초`;
}

// 리뷰 중점 4 — 어디서 불러도 안전해야 한다. 남은 타이머가 없으면 아무 일도 하지 않는다.
function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();
  if (!session || session.mode !== "speed") {
    renderTimer();
    return;
  }
  remainingSec = SPEED_LIMIT_SEC;
  renderTimer();
  timerId = setInterval(() => {
    remainingSec -= 1;
    renderTimer();
    if (remainingSec <= 0) {
      stopTimer();
      onTimeout();
    }
  }, 1000);
}

function onTimeout() {
  if (!applyTimeout(session)) return;   // 이미 채점한 문항 (리뷰 중점 3)
  revealAnswer(null);
  renderFeedback(false, true);          // 만료도 정답과 해설을 보여 준다 (PRD 2.2)
  updateHud();
}
```

- [ ] **3단계: 타이머를 다섯 자리에 연결한다**

`renderQuestion`의 마지막 줄 다음:

```js
  byId("quiz-feedback").classList.add("hidden");
  startTimer();                       // ← 추가
}
```

`onChoiceClick`에서 채점이 성립한 직후(해설을 읽는 시간은 제한하지 않는다):

```js
  if (outcome === null) return;
  stopTimer();                        // ← 추가
```

`startRound`의 첫 줄(앞 판의 타이머를 끊는다):

```js
function startRound(mode, categoryKey, options = {}) {
  stopTimer();                        // ← 추가
  currentMode = mode;
```

`onNextClick`의 결과 화면 분기:

```js
function onNextClick() {
  if (advance(session)) {
    renderQuestion();                 // 안에서 startTimer()가 다시 15초부터 센다
    return;
  }
  stopTimer();                        // ← 추가
  renderResult();
  showScreen("screen-result");
}
```

`goToModeScreen`의 첫 줄과 `init`의 `result-to-category` 처리:

```js
function goToModeScreen() {
  stopTimer();                        // ← 추가
  renderModeScreen();
  showScreen("screen-mode");
}
```

```js
  byId("result-to-category").addEventListener("click", () => {
    stopTimer();                      // ← 추가
    renderCategoryScreen();
    showScreen("screen-category");
  });
```

- [ ] **4단계: 점검 명령으로 Node에서 깨지지 않았는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 15, 실패 0`, 종료 코드 0.

- [ ] **5단계: 타이머 누수를 브라우저에서 확인한다** (리뷰 중점 4)

`index.html`을 열고 다음을 차례로 한다. 콘솔에 오류가 없어야 하고, 화면이 저절로
바뀌면 안 된다.

1. 스피드로 들어가 답을 고른다 → 숫자가 멈춘다. 20초 기다린다 → 그대로다.
2. 그 상태에서 [다음] → 다음 문항에서 15부터 다시 센다.
3. 문항 중간에 [모드 선택]으로 나간다 → 20초 기다려도 아무 일이 없다.
4. 모드 선택에서 연습으로 들어간다 → 시간 표시가 없고, 20초 기다려도 시간 초과가
   생기지 않는다.
5. 스피드 마지막 문항을 풀어 결과 화면으로 간다 → 20초 기다려도 조용하다.

- [ ] **6단계: 커밋**

```bash
cd /c/Study03_Quiz && git add script.js && git commit -m "feat: 스피드 모드"
```

---

### 태스크 13: 힌트 모드

**파일:**
- 수정: `C:\Study03_Quiz\script.js` (5. 화면 조작, `init`)

**인터페이스:**
- 소비: `pickHintRemovals`, `currentItem`, `session`
- 생산:
  - `renderHintButton(): void` — 힌트 모드에서만 버튼을 보이고 활성화한다
  - `onHintClick(): void` — 오답 2개를 감추고 버튼을 잠근다

- [ ] **1단계: 힌트를 구현한다** (5. 화면 조작 구역의 타이머 아래)

```js
function renderHintButton() {
  const button = byId("quiz-hint");
  if (!session || session.mode !== "hint") {
    button.classList.add("hidden");
    return;
  }
  button.classList.remove("hidden");
  button.disabled = false;
  button.textContent = "힌트 (오답 2개 지우기)";
}

function onHintClick() {
  // 답을 고른 뒤에는 쓸 수 없고, 한 문항에 한 번만 쓸 수 있다 (PRD 2.2).
  if (!session || session.mode !== "hint" || session.locked || session.hintUsed) return;
  session.hintUsed = true;

  for (const index of pickHintRemovals(currentItem(session))) {
    const button = byId("quiz-choices").querySelector(`button[data-index="${index}"]`);
    if (!button) continue;
    button.disabled = true;
    button.classList.add("is-removed");
  }

  byId("quiz-hint").disabled = true;
}
```

- [ ] **2단계: 두 자리에 연결한다**

`renderQuestion`에서 `startTimer()` **위**:

```js
  byId("quiz-feedback").classList.add("hidden");
  renderHintButton();                 // ← 추가
  startTimer();
}
```

`onChoiceClick`에서 `stopTimer()` 다음(채점 후에는 힌트를 잠근다):

```js
  stopTimer();
  byId("quiz-hint").disabled = true;  // ← 추가
```

`init`에 연결을 추가한다.

```js
  byId("quiz-hint").addEventListener("click", onHintClick);
```

- [ ] **3단계: 점검 명령으로 Node에서 깨지지 않았는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 15, 실패 0`, 종료 코드 0.

- [ ] **4단계: 브라우저에서 힌트를 확인한다**

1. 힌트 모드로 들어가 [힌트]를 누른다 → 보기 2개가 사라지고 남은 2개에 정답이 있다.
   버튼이 비활성화된다.
2. 남은 보기에서 정답을 고른다 → 점수가 `0.5`만 오른다.
3. 다음 문항은 힌트 없이 맞힌다 → 점수가 1 올라 `1.5`가 된다.
4. 그다음 문항에서 먼저 답을 고른 뒤 [힌트]를 눌러 본다 → 아무 일도 없다.
5. 채점 후 화면에서 **감췄던 보기가 다시 보이고** 정답 표시가 붙는지 본다.
6. 10문항을 끝낸다 → 결과에 `6.5 / 10`처럼 소수점 한 자리와 `힌트를 쓴 문항 N개`가
   보인다.

- [ ] **5단계: 커밋**

```bash
cd /c/Study03_Quiz && git add script.js && git commit -m "feat: 힌트 모드"
```

---

### 태스크 14: 틀린 문제 다시 풀기

다시 풀기는 **재채점하지 않는다.** 원래 판의 점수는 그대로이고, 기록도 남기지 않는다.

**파일:**
- 수정: `C:\Study03_Quiz\script.js` (5. 화면 조작, `init`)

**인터페이스:**
- 소비: `canRetryWrong`, `wrongItemsOf`, `startRound`, `renderResult`
- 생산: `onRetryWrongClick(): void`

- [ ] **1단계: 다시 풀기를 구현한다** (5. 화면 조작 구역의 `renderResult` 아래)

```js
function onRetryWrongClick() {
  if (!canRetryWrong(session)) return;
  // 새 판을 만들므로 원래 판의 점수는 건드려지지 않는다 (PRD 2.2).
  startRound("practice", session.categoryKey, {
    isReview: true,
    items: wrongItemsOf(session)
  });
}
```

- [ ] **2단계: 결과 화면에 버튼 노출을 더한다**

`renderResult`의 끝(힌트 수 처리 다음)에 추가한다.

```js
  byId("result-retry-wrong").classList.toggle("hidden", !canRetryWrong(session));
```

`init`에 연결을 추가한다.

```js
  byId("result-retry-wrong").addEventListener("click", onRetryWrongClick);
```

- [ ] **3단계: 점검 명령으로 Node에서 깨지지 않았는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 15, 실패 0`, 종료 코드 0.

- [ ] **4단계: 2단계 "브라우저에서 직접 확인할 항목"을 실행자가 먼저 확인한다**

내장 브라우저로 `file:///C:/Study03_Quiz/index.html`을 열 수 있으면 2단계 목록을 따라
확인하고 결과를 보고한다. 특히 10~12번(다시 풀기에서 원래 점수가 오르지 않는지)을
빠뜨리지 않는다. 열 수 없으면 그 사실을 보고한다.

- [ ] **5단계: 커밋**

```bash
cd /c/Study03_Quiz && git add script.js && git commit -m "feat: 틀린 문제 다시 풀기"
```

- [ ] **6단계: 멈추고 사용자에게 2단계 확인을 요청한다**

**여기서 작업을 멈춘다.** 사용자가 2단계의 "브라우저에서 직접 확인할 항목"을 확인하고
다음 단계를 시작하라고 말할 때까지 3단계를 시작하지 않는다.

---

# 3단계: 점수 저장과 순위표

**만들 것**

- 순수 로직: 이름 정규화, 저장값 해석(`parseStore`), 기록 추가, 상위 N 정렬,
  KST 시각 문자열과 그 점검
- 스피드·힌트 모드 결과 화면의 이름(별명) 입력칸과 [기록 저장]
- `localStorage` 키 `quiz.scores.v1`에 저장. 접근은 모두 `try`/`catch`
- 순위표 화면: 카테고리 4 × 모드 2 = 8개 표, 각 상위 5건, 동점은 먼저 세운 기록이 위,
  기록 없는 조합은 `기록 없음`
- 기록 전체 지우기(확인을 받음), 저장 실패 시 안내

**완료 기준** (실행자가 스스로 점검한다)

- [ ] 점검 명령이 `자체 점검 결과: 통과 20, 실패 0`으로 끝나고 종료 코드가 0이다.
- [ ] `localStorage` 접근(읽기·쓰기·지우기) 세 곳이 모두 `try`/`catch` 안에 있다
      (코드를 눈으로 확인).
- [ ] 연습 모드와 복습 결과에는 이름 입력칸이 나오지 않는다.
- [ ] 순위표의 이름은 `textContent`로만 들어간다(`innerHTML` 없음).

**브라우저에서 직접 확인할 항목** (사용자가 확인한다 — PRD 7.1·7.4)

- [ ] 1. 스피드로 한 판 끝낸다. 결과 화면에 이름 입력칸이 보인다. 이름을 넣고
      [기록 저장]을 누르면 저장됐다는 안내가 뜨고 버튼이 잠긴다.
- [ ] 2. [모드 선택] → [순위표 보기]. 표 8개(카테고리 4 × 모드 2)가 있고, 방금 기록이
      해당 표에 이름·점수·날짜로 보인다.
- [ ] 3. 기록이 없는 조합은 `기록 없음`으로 보인다.
- [ ] 4. 같은 카테고리·모드로 같은 점수를 한 번 더 내고 다른 이름으로 저장한다.
      **먼저 세운 기록이 위에 남는다.**
- [ ] 5. 한 조합에 6건 이상 쌓아도 표에는 상위 5건만 보인다.
- [ ] 6. 브라우저를 완전히 닫고 다시 연다. 기록이 그대로 있다.
- [ ] 7. 연습으로 한 판 끝낸다. 이름 입력칸이 없고 `순위표에 기록되지 않음`이 보이며,
      순위표에도 나타나지 않는다.
- [ ] 8. 힌트로 한 판 끝내고 저장한다. 힌트 표의 점수가 `6.5 / 10`처럼 보인다.
- [ ] 9. 연습에서 틀린 문제를 다시 풀고 결과 화면을 본다. 이름 입력칸이 없다.
- [ ] 10. 이름을 비우고 [기록 저장]을 누른다. `이름을 입력해 주세요.`가 뜨고 저장되지
      않는다.
- [ ] 11. 이름을 30자 이상 넣어 저장한다. 순위표에서 20자까지만 보이고 표가 깨지지
      않는다.
- [ ] 12. [기록 전체 지우기]를 누른다. 확인을 묻는다. [취소]하면 그대로 있고, 확인하면
      모든 표가 `기록 없음`이 된다.
- [ ] 13. 시크릿 창에서 `index.html`을 연다. 순위표에
      `이 브라우저에서는 기록을 저장할 수 없습니다`가 뜨거나 기록이 비어 있고,
      **퀴즈는 끝까지 정상으로 풀린다.**
- [ ] 14. 창 폭 400px에서 순위표 표 8개가 가로로 넘치지 않는다.

---

### 태스크 15: 순위표 순수 로직

**파일:**
- 수정: `C:\Study03_Quiz\script.js` (1. 상수, 2. 순수 로직 구역 끝, 3. 자체 점검 구역 끝)

**인터페이스:**
- 소비: `selfTest`
- 생산:
  - 상수 `STORAGE_KEY = "quiz.scores.v1"`, `STORAGE_VERSION = 1`,
    `RANKED_MODES = ["speed", "hint"]`, `TOP_N = 5`, `NAME_MAX = 20`
  - `normalizeName(raw): string` — 앞뒤 공백 제거, 연속 공백 한 칸, 20자로 자름
  - `emptyStore(): Store` — `{ version: 1, records: [] }`
  - `parseStore(raw): Store | null` — 깨진 값은 `null`, 빈 값·다른 버전은 빈 저장소
  - `insertRecord(store, record, now = new Date()): Store` — `playedAt`을 붙여 뒤에 담는다
  - `Record` = `{ name, categoryKey, mode, score, total, playedAt }`
  - `topRecords(store, categoryKey, mode, limit = TOP_N): Record[]`
  - `nowIsoKst(now = new Date()): string` — `2026-10-11T12:19:00+09:00`
  - `formatPlayedAt(playedAt): string` — `2026-10-11`

- [ ] **1단계: 실패하는 점검을 쓴다** (3. 자체 점검 구역 끝에 추가)

```js
selfTest("normalizeName은 공백과 길이를 다듬는다", check => {
  check(normalizeName("  홍길동  ") === "홍길동", `앞뒤 공백: ${normalizeName("  홍길동  ")}`);
  check(normalizeName("홍   길동") === "홍 길동", `연속 공백: ${normalizeName("홍   길동")}`);
  check(normalizeName("   ") === "", "공백뿐인 이름이 빈 문자열이 아님");
  check(normalizeName("") === "", "빈 문자열 처리 실패");
  check(normalizeName(null) === "", "null에서 터짐");
  check(normalizeName(undefined) === "", "undefined에서 터짐");
  check(normalizeName("가".repeat(40)).length === NAME_MAX, `길이 ${normalizeName("가".repeat(40)).length}`);
});

selfTest("parseStore는 빈 값·깨진 값·다른 버전을 구분한다", check => {
  check(parseStore(null).records.length === 0, "빈 값이 빈 저장소가 아님");
  check(parseStore("").records.length === 0, "빈 문자열이 빈 저장소가 아님");
  check(parseStore("{이건 JSON이 아니다") === null, "깨진 JSON이 null이 아님");
  check(parseStore(JSON.stringify({ version: 99, records: [] })).records.length === 0,
    "다른 버전이 빈 저장소가 아님");
  check(parseStore(JSON.stringify({ version: 1, records: "배열아님" })).records.length === 0,
    "records가 배열이 아닐 때 빈 저장소가 아님");
  const good = { version: 1, records: [{ name: "가", categoryKey: "science", mode: "speed", score: 8, total: 10, playedAt: "2026-10-11T12:00:00+09:00" }] };
  check(parseStore(JSON.stringify(good)).records.length === 1, "정상 값을 읽지 못함");
});

selfTest("nowIsoKst는 시간대와 무관하게 KST로 적는다", check => {
  const iso = nowIsoKst(new Date("2026-10-11T03:19:00Z"));
  check(iso === "2026-10-11T12:19:00+09:00", `결과 ${iso}`);
  check(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(nowIsoKst()), "형식이 다름");
  check(formatPlayedAt(iso) === "2026-10-11", `날짜 ${formatPlayedAt(iso)}`);
  check(formatPlayedAt(undefined) === "", "값이 없을 때 빈 문자열이 아님");
});

selfTest("insertRecord는 뒤에 담고 playedAt을 붙인다", check => {
  const store = emptyStore();
  insertRecord(store, { name: "먼저", categoryKey: "science", mode: "speed", score: 7, total: 10 },
    new Date("2026-10-11T03:19:00Z"));
  insertRecord(store, { name: "나중", categoryKey: "science", mode: "speed", score: 7, total: 10 },
    new Date("2026-10-11T04:19:00Z"));
  check(store.records.length === 2, `기록 ${store.records.length}건`);
  check(store.records[0].name === "먼저", "저장 순서가 뒤바뀜");
  check(store.records[0].playedAt === "2026-10-11T12:19:00+09:00", `playedAt ${store.records[0].playedAt}`);
  check(store.version === 1, "version이 1이 아님");
});

selfTest("topRecords는 점수 내림차순, 동점은 먼저 세운 기록이 위다", check => {
  const store = { version: 1, records: [
    { name: "먼저", categoryKey: "science", mode: "speed", score: 7, total: 10, playedAt: "2026-10-11T10:00:00+09:00" },
    { name: "최고", categoryKey: "science", mode: "speed", score: 9, total: 10, playedAt: "2026-10-11T11:00:00+09:00" },
    { name: "나중", categoryKey: "science", mode: "speed", score: 7, total: 10, playedAt: "2026-10-11T12:00:00+09:00" },
    { name: "다른모드", categoryKey: "science", mode: "hint", score: 10, total: 10, playedAt: "2026-10-11T13:00:00+09:00" },
    { name: "다른카테고리", categoryKey: "korean_history", mode: "speed", score: 10, total: 10, playedAt: "2026-10-11T14:00:00+09:00" }
  ] };
  const top = topRecords(store, "science", "speed");
  check(top.map(r => r.name).join(",") === "최고,먼저,나중", `정렬 ${top.map(r => r.name).join(",")}`);
  check(topRecords(store, "science", "hint").length === 1, "모드가 섞임");
  check(topRecords(store, "arts_culture", "speed").length === 0, "없는 조합에 기록이 있음");

  const many = emptyStore();
  for (let i = 1; i <= 8; i++) {
    insertRecord(many, { name: `P${i}`, categoryKey: "science", mode: "hint", score: i, total: 10 });
  }
  const limited = topRecords(many, "science", "hint");
  check(limited.length === TOP_N, `상위 ${limited.length}건`);
  check(limited[0].name === "P8", `1위 ${limited[0].name}`);
});
```

- [ ] **2단계: 점검이 실패하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: 새 점검 5개가 `normalizeName is not defined` 등으로 실패.
`자체 점검 결과: 통과 15, 실패 5`, 종료 코드 1.

- [ ] **3단계: 상수를 더한다** (1. 상수 구역의 `SPEED_LIMIT_SEC` 아래)

```js
const STORAGE_KEY = "quiz.scores.v1";
const STORAGE_VERSION = 1;
const RANKED_MODES = ["speed", "hint"];
const TOP_N = 5;
const NAME_MAX = 20;
```

- [ ] **4단계: 구현한다** (2. 순수 로직 구역 끝에 추가)

```js
// 리뷰 중점 5 — 공백뿐인 이름, 긴 이름, 값이 없는 경우를 모두 흡수한다.
function normalizeName(raw) {
  if (raw === null || raw === undefined) return "";
  return String(raw).trim().replace(/\s+/g, " ").slice(0, NAME_MAX);
}

function emptyStore() {
  return { version: STORAGE_VERSION, records: [] };
}

// 깨진 값은 null로 알려 주고(안내를 띄우려고), 빈 값과 다른 버전은 빈 저장소로 본다.
function parseStore(raw) {
  if (!raw) return emptyStore();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return null;
  }
  if (!parsed || parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.records)) {
    return emptyStore();
  }
  return parsed;
}

// 어느 시간대의 컴퓨터에서도 KST로 적는다.
function nowIsoKst(now = new Date()) {
  const kst = new Date(now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60000);
  const pad = n => String(n).padStart(2, "0");
  return `${kst.getFullYear()}-${pad(kst.getMonth() + 1)}-${pad(kst.getDate())}` +
    `T${pad(kst.getHours())}:${pad(kst.getMinutes())}:${pad(kst.getSeconds())}+09:00`;
}

function formatPlayedAt(playedAt) {
  return typeof playedAt === "string" ? playedAt.slice(0, 10) : "";
}

// 배열 뒤에 붙인다. 이 순서가 "먼저 세운 기록"의 근거가 된다.
function insertRecord(store, record, now = new Date()) {
  store.records.push({
    name: record.name,
    categoryKey: record.categoryKey,
    mode: record.mode,
    score: record.score,
    total: record.total,
    playedAt: nowIsoKst(now)
  });
  return store;
}

function topRecords(store, categoryKey, mode, limit = TOP_N) {
  if (!store || !Array.isArray(store.records)) return [];
  return store.records
    .map((record, order) => ({ record: record, order: order }))
    .filter(row => row.record.categoryKey === categoryKey && row.record.mode === mode)
    .sort((a, b) => {
      // 점수 내림차순. 동점이면 저장 순서가 앞선 기록이 위로 온다 (PRD 2.3).
      if (b.record.score !== a.record.score) return b.record.score - a.record.score;
      return a.order - b.order;
    })
    .slice(0, limit)
    .map(row => row.record);
}
```

- [ ] **5단계: 점검이 통과하는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 20, 실패 0`, 종료 코드 0.

- [ ] **6단계: 커밋**

```bash
cd /c/Study03_Quiz && git add script.js && git commit -m "feat: 순위표 순수 로직"
```

---

### 태스크 16: 기록 저장과 순위표 화면

**파일:**
- 수정: `C:\Study03_Quiz\index.html` (`mode-to-leaderboard` 노출)
- 수정: `C:\Study03_Quiz\script.js` (5. 화면 조작, `init`, `renderResult`)

**인터페이스:**
- 소비: `parseStore`, `emptyStore`, `insertRecord`, `topRecords`, `normalizeName`,
  `formatPlayedAt`, `formatScore`, `RANKED_MODES`, `TOP_N`, `CATEGORY_ORDER`, `MODE_LABELS`
- 생산:
  - `let storageWorks = true`
  - `probeStorage(): void`, `readStore(): Store | null`, `writeStore(store): boolean`,
    `saveRecord(record): boolean`
  - `isRankedSession(): boolean`, `renderSaveBox(): void`, `onSaveClick(): void`
  - `renderStorageWarning(): void`, `buildRecordTable(records): HTMLTableElement`,
    `renderLeaderboard(): void`, `goToLeaderboard(): void`, `onClearClick(): void`

- [ ] **1단계: `index.html`에서 순위표 입구를 보이게 한다**

```html
        <button id="mode-to-leaderboard" type="button">순위표 보기</button>
```

- [ ] **2단계: 저장 계층을 구현한다** (5. 화면 조작 구역의 `renderResult` 아래)

```js
// 일부 브라우저는 file://이나 시크릿 모드에서 localStorage를 막는다.
// 그래도 퀴즈 자체는 끝까지 동작해야 하므로, 실패를 이 플래그로만 기억한다 (리뷰 중점 1).
let storageWorks = true;

function probeStorage() {
  try {
    const probeKey = `${STORAGE_KEY}.probe`;
    localStorage.setItem(probeKey, "1");
    localStorage.removeItem(probeKey);
    storageWorks = true;
  } catch (error) {
    storageWorks = false;
    console.warn(`[quiz] 이 브라우저에서는 기록을 저장할 수 없습니다: ${error.message}`);
  }
}

function readStore() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    storageWorks = false;
    console.warn(`[quiz] 기록을 읽을 수 없습니다: ${error.message}`);
    return null;
  }
  const store = parseStore(raw);
  if (store === null) console.warn("[quiz] 저장된 기록이 깨져 있습니다");
  return store;
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    storageWorks = true;
    return true;
  } catch (error) {
    storageWorks = false;
    console.warn(`[quiz] 기록을 저장할 수 없습니다: ${error.message}`);
    return false;
  }
}

function saveRecord(record) {
  const store = readStore();
  if (store === null) return false;
  return writeStore(insertRecord(store, record));
}
```

- [ ] **3단계: 결과 화면의 이름 입력을 구현한다** (저장 계층 아래)

```js
function isRankedSession() {
  return Boolean(session) && !session.isReview && RANKED_MODES.includes(session.mode);
}

function renderSaveBox() {
  const box = byId("result-save");
  const message = byId("result-save-msg");
  const input = byId("result-name");
  const button = byId("result-save-btn");

  message.textContent = "";
  message.classList.add("hidden");

  if (!isRankedSession()) {
    box.classList.add("hidden");
    return;
  }

  box.classList.remove("hidden");
  input.value = "";
  input.disabled = !storageWorks;
  button.disabled = !storageWorks;

  if (!storageWorks) {
    message.textContent = "이 브라우저에서는 기록을 저장할 수 없습니다";
    message.classList.remove("hidden");
  }
}

function onSaveClick() {
  const input = byId("result-name");
  const message = byId("result-save-msg");
  const name = normalizeName(input.value);

  message.classList.remove("hidden");

  if (name === "") {
    message.textContent = "이름을 입력해 주세요.";
    input.focus();
    return;
  }

  const saved = saveRecord({
    name: name,
    categoryKey: session.categoryKey,
    mode: session.mode,
    score: session.score,
    total: session.items.length
  });

  if (!saved) {
    message.textContent = "이 브라우저에서는 기록을 저장할 수 없습니다";
    return;
  }

  // 한 판을 두 번 저장하지 않는다.
  message.textContent = `${name} 님의 기록을 순위표에 남겼습니다.`;
  input.disabled = true;
  byId("result-save-btn").disabled = true;
}
```

`renderResult`의 끝(다시 풀기 버튼 처리 다음)에 한 줄 더한다.

```js
  renderSaveBox();
```

- [ ] **4단계: 순위표 화면을 구현한다** (이름 입력 아래)

```js
function renderStorageWarning(extraMessage) {
  const box = byId("lb-storage-warning");
  if (storageWorks && !extraMessage) {
    box.textContent = "";
    box.classList.add("hidden");
    return;
  }
  box.textContent = extraMessage || "이 브라우저에서는 기록을 저장할 수 없습니다";
  box.classList.remove("hidden");
}

function buildRecordTable(records) {
  const table = document.createElement("table");
  table.className = "lb-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const text of ["순위", "이름", "점수", "날짜"]) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = text;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  records.forEach((record, i) => {
    const tr = document.createElement("tr");

    const rank = document.createElement("td");
    rank.textContent = String(i + 1);
    tr.appendChild(rank);

    const name = document.createElement("td");
    // 리뷰 중점 5 — 이름은 글자로만 넣는다. innerHTML을 쓰지 않는다.
    name.textContent = record.name;
    tr.appendChild(name);

    const score = document.createElement("td");
    score.className = "lb-score";
    score.textContent = `${formatScore(record.score)} / ${record.total}`;
    tr.appendChild(score);

    const date = document.createElement("td");
    date.textContent = formatPlayedAt(record.playedAt);
    tr.appendChild(date);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}

function renderLeaderboard() {
  const store = readStore();
  renderStorageWarning(store === null ? "저장된 기록이 깨져 있어 보여 줄 수 없습니다" : "");

  const box = byId("lb-tables");
  box.textContent = "";

  for (const categoryKey of CATEGORY_ORDER) {
    for (const mode of RANKED_MODES) {
      const group = document.createElement("div");
      group.className = "lb-group";
      group.dataset.category = categoryKey;
      group.dataset.mode = mode;

      const heading = document.createElement("h3");
      heading.textContent = `${categoryLabel(categoryKey)} · ${MODE_LABELS[mode]}`;
      group.appendChild(heading);

      const records = store === null ? [] : topRecords(store, categoryKey, mode, TOP_N);
      if (records.length === 0) {
        const empty = document.createElement("p");
        empty.className = "lb-empty";
        empty.textContent = "기록 없음";
        group.appendChild(empty);
      } else {
        group.appendChild(buildRecordTable(records));
      }

      box.appendChild(group);
    }
  }
}

function goToLeaderboard() {
  stopTimer();
  renderLeaderboard();
  showScreen("screen-leaderboard");
}

function onClearClick() {
  // 되돌릴 수 없으므로 확인을 받는다 (PRD 3.5).
  if (!window.confirm("저장된 기록을 모두 지웁니다. 되돌릴 수 없습니다. 계속할까요?")) return;
  const cleared = writeStore(emptyStore());
  renderLeaderboard();
  if (!cleared) renderStorageWarning("이 브라우저에서는 기록을 지울 수 없습니다");
}
```

- [ ] **5단계: `init`에 연결을 더한다**

`reportDataWarnings(...)`·`showDataWarning(...)` 아래에 `probeStorage()`를 넣고,
버튼 3개를 연결한다.

```js
  probeStorage();

  byId("result-save-btn").addEventListener("click", onSaveClick);
  byId("mode-to-leaderboard").addEventListener("click", goToLeaderboard);
  byId("lb-clear").addEventListener("click", onClearClick);
  byId("lb-back").addEventListener("click", goToModeScreen);
```

- [ ] **6단계: 점검 명령으로 Node에서 깨지지 않았는지 확인한다**

Run:
```bash
node -e "const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,location:{search:'?test'}});for(const f of ['questions.js','script.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});process.exitCode=c.selfTestFailed?1:0"
```
기대: `자체 점검 결과: 통과 20, 실패 0`, 종료 코드 0. Node에는 `localStorage`가 없지만
`probeStorage`는 `init` 안에서만 불리므로 실행되지 않는다.

- [ ] **7단계: 저장이 막힌 상태를 브라우저에서 확인한다** (리뷰 중점 1)

`index.html`을 열고 콘솔에서 아래를 실행한 뒤, 스피드로 한 판 끝까지 풀어 본다.

```js
Storage.prototype.setItem = function () { throw new Error("차단됨"); };
```

기대: 퀴즈는 끝까지 정상으로 풀리고, 결과 화면의 이름 입력칸이 잠기며
`이 브라우저에서는 기록을 저장할 수 없습니다`가 보인다. 순위표 화면에도 같은 안내가
뜬다. 확인 후 새로고침해 원래대로 돌린다.

- [ ] **8단계: 3단계 "브라우저에서 직접 확인할 항목"을 실행자가 먼저 확인한다**

내장 브라우저로 `file:///C:/Study03_Quiz/index.html`을 열 수 있으면 3단계 목록을 따라
확인하고 결과를 보고한다. 열 수 없으면 그 사실을 보고한다. 확인이 끝나면 테스트로 남은
기록을 [기록 전체 지우기]로 비운다.

- [ ] **9단계: 커밋**

```bash
cd /c/Study03_Quiz && git add index.html script.js && git commit -m "feat: 기록 저장과 순위표 화면"
```

- [ ] **10단계: 멈추고 사용자에게 3단계 확인을 요청한다**

**여기서 작업을 멈춘다.** 사용자가 3단계의 "브라우저에서 직접 확인할 항목"을 확인하고
마무리를 지시할 때까지 다른 일을 시작하지 않는다.

---

## PRD 대응표

PRD의 항목마다 그것을 구현하는 태스크다. 누락된 요구가 없는지 확인할 때 쓴다.

| PRD 항목 | 태스크 |
|---|---|
| 1.1 앱 구성(파일 4개, 카테고리 4개, 40문항, 모드 3개) | 전역 제약, 태스크 1, 5~8 |
| 1.1 데스크톱 주 대상 + 400px 반응형 | 태스크 9(`style.css`) |
| 2.1 모드 비교표(점수·시간·힌트·기록 여부) | 태스크 3(`scoreFor`), 11, 12, 13, 16 |
| 2.2 연습 모드(1점, 순위표 미기록 문구) | 태스크 9, 11 |
| 2.2 연습 모드 틀린 문제 다시 풀기(재채점·저장 없음) | 태스크 10, 14 |
| 2.2 스피드 모드(15초, 만료 시 해설, 해설 중 정지, 재시작) | 태스크 4(`applyTimeout`), 12 |
| 2.2 힌트 모드(1회, 오답 2개 무작위, 0.5점) | 태스크 10(`pickHintRemovals`), 13 |
| 2.3 점수 표기(`7`, `6.5`) | 태스크 3(`formatScore`) |
| 2.3 순위표 8개 표·상위 5·동점 처리 | 태스크 15(`topRecords`), 16 |
| 2.3 이름을 판이 끝난 뒤 받음 | 태스크 16(`renderSaveBox`) |
| 3.1 모드 선택 화면 | 태스크 11 |
| 3.2 카테고리 선택 화면 | 태스크 9 |
| 3.3 문제 풀이 화면(즉시 채점, 해설, 출처, 확정 선택) | 태스크 4, 9 |
| 3.4 결과 화면 | 태스크 9, 14, 16 |
| 3.5 순위표 화면(기록 없음, 전체 지우기 확인) | 태스크 16 |
| 4.1 문항 품질 규칙 3개 | 문항 작성 절차, 태스크 5~8, 문항 검수 명령 |
| 4.2 데이터 스키마·섞기 | 태스크 1(`questions.js`), 3(`toRoundItem`·`buildRound`) |
| 4.3 데이터 검증 | 태스크 2, 9(경고 표시) |
| 5.1 파일 구조와 책임 | 전역 제약, 태스크 1, 9 |
| 5.2 ES 모듈·fetch 금지 | 전역 제약, 태스크 9(`index.html`) |
| 5.3 세션 상태 | 태스크 4(`createSession`) |
| 5.4 localStorage(키·버전·실패 처리) | 태스크 15(`parseStore`), 16 |
| 6.1~6.3 구현 3단계 | 1단계(태스크 1~9), 2단계(태스크 10~14), 3단계(태스크 15~16) |
| 7.1~7.4 검증 방법 | 각 단계의 "브라우저에서 직접 확인할 항목" |
| 8 범위 밖(난이도 구분 포함) | 어느 태스크에도 넣지 않음 |

## PRD에 없이 이 계획에서 정한 것

PRD에 적혀 있지 않아 계획 단계에서 정한 것이다. 요구와 어긋나는 것이 있으면 구현을
시작하기 전에 고친다.

- **점검 방식**: `script.js` 안에 자체 점검 구역을 두고 `?test` 주소나 Node.js 명령 한
  줄로 돌린다. 점검 코드를 별도 파일로 두지 않아 앱 파일 4개가 유지된다.
- **해설 길이 기준 80자**: PRD는 "한 줄"이라고만 했다. 검수 명령이 기계적으로 걸러
  내려면 숫자 기준이 필요해 80자로 정했다.
- **출처 제한**: 위키백과·나무위키·블로그·커뮤니티 글은 출처로 쓰지 않고, 한국어 기관
  출처를 먼저 찾는다.
- **부정형 문제 금지**: "~이 아닌 것은?" 꼴은 정답이 하나인지 검수하기 어려워 쓰지 않는다.
- **보기 4개는 서로 달라야 한다**: `validateQuestions`가 중복 보기를 경고한다.
- **데이터 경고 화면 표시**: PRD 4.3은 콘솔 경고만 요구한다. 경고가 있으면 화면 위에도
  한 줄로 알리되, 퀴즈는 그대로 풀 수 있게 둔다.
- **이름 정규화**: 앞뒤 공백을 지우고 연속 공백을 한 칸으로 줄여 20자까지 저장한다
  (`maxlength="20"`과 맞춘다). 빈 이름은 저장을 거부한다.
- **한 판은 한 번만 저장**: 저장에 성공하면 입력칸과 버튼을 잠근다.
- **깨진 저장값 처리**: `version`이 1이 아니거나 `records`가 배열이 아니면 빈 목록으로
  보고, JSON 자체가 깨졌으면 순위표에 안내를 띄운다. 어느 경우에도 지우지는 않는다.
- **동점 정렬 기준**: "먼저 세운 기록"은 `records` 배열의 저장 순서로 판단한다
  (`playedAt` 문자열 비교 대신). 같은 초에 두 건이 들어가도 순서가 흔들리지 않는다.
- **복습 판도 다시 섞는다**: 틀린 문제 다시 풀기에서 문항과 보기 순서를 새로 섞는다.
- **남은 시간 5초 이하 강조**: 스피드 모드 타이머가 5초 이하이면 빨간색으로 바뀐다.

## 자기 점검 결과

계획을 다 쓴 뒤 PRD를 다시 읽고 맞춰 본 결과다.

**1. 스펙 반영:** 위 PRD 대응표로 1~8절을 모두 짚었다. 빠진 요구는 없다.

**2. 자리만 잡아 둔 코드:** 없다. 모든 단계에 실제로 넣을 코드가 들어 있다. 태스크
5~8의 문항 본문은 작성 절차와 형식을 적어 두었고, 출처는 실행자가 직접 열어 확인해야
하므로 미리 쓸 수 없는 부분이다.

**3. 이름 일관성:** 태스크 사이를 넘나드는 이름을 맞췄다. `scoreFor`는 처음부터
`(correct, mode, usedHint)` 세 인자로 두어 2단계에서 시그니처가 바뀌지 않는다.
만점·진행 표시는 `session.items.length`를 쓰고 상수 10을 쓰지 않는다. 섞기·난수가
필요한 순수 함수는 모두 `random = Math.random` 인자를 받아 점검에서 결과를 고정한다.

**4. 리뷰 중점:** 5개 모두 소유 태스크의 점검에 들어갔다 — 저장 차단(태스크 15의
`parseStore`, 태스크 16의 7단계), 손상 데이터(태스크 2, 태스크 9의 5단계), 중복
채점(태스크 4), 타이머 누수(태스크 12의 5단계), 이름 입력과 `textContent`(태스크 15,
16).

**5. 점검 코드 사전 실행:** 이 계획에 넣은 순수 로직과 점검 20개를 임시 폴더에서
실제로 조립해 Node v24.19.0으로 돌려 보았다. 확인한 것은 다음과 같다.

- 전체 통과: `자체 점검 결과: 통과 20, 실패 0`, 종료 코드 0.
- 태스크별 누적 통과 수: 1 → 2 → 6 → 11 → 12 → 15 → 20 (계획에 적힌 숫자와 같다).
- 태스크 1의 실패 상태: `shuffle`이 없을 때 점검 1개가
  `예외: shuffle is not defined`로 실패하고 `통과 0, 실패 1`, 종료 코드 1.
- 태스크 5~7의 실패 상태: 문항이 비어 있을 때 `실제 QUESTIONS가 검증을 통과한다`만
  실패해 `통과 11, 실패 1`이 되고, 경고에 빈 카테고리 4개가 나열된다.
- `questions.js`가 정의한 `const QUESTIONS`를 `script.js`가 같은 vm 전역에서 읽는 것
  (브라우저에서 스크립트 두 개를 차례로 불러오는 것과 같은 동작).
- 문항 검수 명령이 우리 스키마(`QUESTIONS[카테고리].items`)에서 동작하는 것.

## 1단계 수정 기록 (2026-10-12)

1단계를 구현한 뒤 수업 노트의 확인 항목과 맞추며 고친 것이다. 노트가 기준이므로
PRD.md 3.2·3.3·3.4·6.1·7.2와 이 계획서를 함께 고쳤다.

- 시작 화면(카테고리 선택)에 `연습 모드 · 순위표에 기록되지 않음`을 적는다.
- 문제 풀이 화면 상단을 `한국사 · 연습` → `1 / 10` → `점수 0` 순서로 둔다.
- 결과 화면에 문항별 목록(문제, 정답·오답, 정답 보기, 틀린 문항은 내 선택)을 둔다.
- 결과 화면 버튼 이름을 [같은 모드 다시], [처음으로]로 바꿨다.
- 점검 항목을 1단계 12개로 맞췄다. 확인(`check`) 하나도 지우지 않고, 섞기 점검 2개를
  하나로, `validateQuestions` 점검 3개를 하나로 묶었다. 누적 통과 수가
  1 → 2 → 6 → 11 → 12 → 15 → 20으로 바뀌었다(2단계 15개, 3단계 20개).
