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

selfTest("실제 QUESTIONS가 검증을 통과한다", check => {
  const warnings = validateQuestions(QUESTIONS);
  check(warnings.length === 0, `경고 ${warnings.length}개: ${warnings.slice(0, 5).join(" / ")}`);
});
// ===== 4. 상태 =====
let session = null;
let currentMode = "practice";   // 2단계에서 모드 선택 화면이 바꾼다

// ===== 5. 화면 조작 =====
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
  byId("category-mode-note").textContent = `모드: ${MODE_LABELS[currentMode]}`;

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
    `${MODE_LABELS[session.mode]} · ${categoryLabel(session.categoryKey)}`;
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

// ===== 6. 시작 =====
if (typeof location !== "undefined" && /[?&]test\b/.test(location.search)) runSelfTests();
if (typeof document !== "undefined") init();
