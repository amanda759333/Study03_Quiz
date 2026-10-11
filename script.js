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

// ===== 4. 상태 =====

// ===== 5. 화면 조작 =====

// ===== 6. 시작 =====
if (typeof location !== "undefined" && /[?&]test\b/.test(location.search)) runSelfTests();
