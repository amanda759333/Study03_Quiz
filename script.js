// 작성일시: 2026-10-12 01:53 (KST)
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

// Fisher–Yates. 원본은 두고 섞은 복사본을 돌려준다.
function shuffle(array, random = Math.random) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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

selfTest("shuffle은 같은 원소를 모두 담은 새 배열을 반환한다", check => {
  const original = [1, 2, 3, 4, 5];
  const result = shuffle(original);
  check(result !== original, "새 배열이어야 함");
  check(result.length === 5, `길이 ${result.length}`);
  check([...result].sort().join() === "1,2,3,4,5", `원소 ${result.join()}`);
  check(original.join() === "1,2,3,4,5", "원본이 바뀜");
});

selfTest("shuffle은 random 값에 따라 순서를 바꾼다", check => {
  const result = shuffle([1, 2, 3, 4], () => 0);
  check(result.join() === "2,3,4,1", `결과 ${result.join()}`);
});


selfTest("validateQuestions는 올바른 데이터에서 경고가 없다", check => {
  const warnings = validateQuestions(makeQuestionSet());
  check(warnings.length === 0, `경고 ${warnings.join(" / ")}`);
});

selfTest("validateQuestions는 카테고리 수와 문항 수를 잡는다", check => {
  const data = makeQuestionSet();
  delete data.science;
  data.korean_history.items.pop();
  const warnings = validateQuestions(data);
  check(warnings.some(w => w.includes("카테고리가 4개가 아닙니다")), "카테고리 수 경고 없음");
  check(warnings.some(w => w.includes("science")), "빠진 카테고리 경고 없음");
  check(warnings.some(w => w.includes("문항이 10개가 아닙니다")), "문항 수 경고 없음");
});

selfTest("validateQuestions는 문항 필드를 잡는다", check => {
  const data = makeQuestionSet();
  const bad = data.korean_history.items[0];
  bad.choices = ["하나", "둘"];
  bad.answerIndex = 7;
  bad.explanation = "";
  bad.source = {};
  const warnings = validateQuestions(data);
  check(warnings.some(w => w.includes("보기가 4개가 아닙니다")), "보기 수 경고 없음");
  check(warnings.some(w => w.includes("answerIndex")), "answerIndex 경고 없음");
  check(warnings.some(w => w.includes("explanation")), "explanation 경고 없음");
  check(warnings.some(w => w.includes("source.url")), "source.url 경고 없음");
  check(warnings.every(w => w.includes("kh-01")), `문항 id가 없는 경고: ${warnings.join(" / ")}`);
});
// ===== 4. 상태 =====

// ===== 5. 화면 조작 =====

// ===== 6. 시작 =====
if (typeof location !== "undefined" && /[?&]test\b/.test(location.search)) runSelfTests();
