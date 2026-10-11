// 작성일시: 2026-10-12 01:53 (KST)
// 상식 퀴즈 문항. 스키마는 PRD.md 4.2, 작성 절차는 IMPL-PLAN.md "문항 작성 절차"를 따른다.

const QUESTIONS = {
  korean_history: {
    label: "한국사",
    items: [
      {
        id: "kh-01",
        question: "새 글자의 풀이를 붙인 『훈민정음』 해례본이 책으로 간행된 해는?",
        choices: ["1392년", "1443년", "1446년", "1485년"],
        answerIndex: 2,
        explanation: "글자는 1443년에 완성하고, 해설을 붙인 해례본은 1446년에 간행했다.",
        source: {
          title: "훈민정음 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0065805",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "kh-02",
        question: "김정호가 1861년에 완성한 전국 지도첩 『대동여지도』는 몇 첩으로 이루어져 있는가?",
        choices: ["12첩", "18첩", "22첩", "30첩"],
        answerIndex: 2,
        explanation: "한반도를 남북 22층으로 나누어 접을 수 있게 만든 22첩 지도첩이다.",
        source: {
          title: "대동여지도 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0014266",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "kh-03",
        question: "1876년 조선과 일본이 강화부에서 맺은 조약의 정식 명칭은?",
        choices: ["조일수호조규", "제물포조약", "한성조약", "을사늑약"],
        answerIndex: 0,
        explanation: "강화도조약·병자수호조약이라고도 하며, 정식 명칭은 조일수호조규다.",
        source: {
          title: "강화도조약 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0001508",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "kh-04",
        question: "1377년 청주 흥덕사에서 금속활자로 찍어 지금은 프랑스 파리국립도서관에 있는 책은?",
        choices: ["직지심체요절", "월인천강지곡", "상정고금예문", "고려사절요"],
        answerIndex: 0,
        explanation: "원래 이름은 백운화상초록불조직지심체요절이고, 전해지는 것은 하권 1책이다.",
        source: {
          title: "직지심체요절 권하 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0071845",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "kh-05",
        question: "전국에서 독립만세운동이 일어난 3·1운동의 해는?",
        choices: ["1910년", "1919년", "1926년", "1945년"],
        answerIndex: 1,
        explanation: "1919년 3월 1일을 기해 일어난 거족적인 독립만세운동이다.",
        source: {
          title: "3·1운동 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0026772",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "kh-06",
        question: "고종이 황제 즉위식을 치르고 나라 이름을 대한제국으로 고쳐 선포한 해는?",
        choices: ["1876년", "1884년", "1897년", "1905년"],
        answerIndex: 2,
        explanation: "1897년 10월 환구단에서 즉위식을 치르고 국호를 대한제국으로 고쳤다.",
        source: {
          title: "대한제국 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0015187",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "kh-07",
        question: "414년에 아버지의 무덤 옆에 광개토왕릉비를 세운 고구려 왕은?",
        choices: ["소수림왕", "장수왕", "문자명왕", "동천왕"],
        answerIndex: 1,
        explanation: "아들 장수왕이 414년에 세웠고, 비는 중국 지린성 집안시에 있다.",
        source: {
          title: "광개토왕릉비 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0005058",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "kh-08",
        question: "왕건이 궁예를 내쫓고 고려를 세운 해는?",
        choices: ["892년", "918년", "936년", "1392년"],
        answerIndex: 1,
        explanation: "918년 6월 신하들의 추대로 즉위해 나라 이름을 고려라 했다.",
        source: {
          title: "태조 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0059032",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "kh-09",
        question: "1960년 4·19혁명으로 사임을 발표한 대통령은?",
        choices: ["이승만", "윤보선", "장면", "박정희"],
        answerIndex: 0,
        explanation: "학생이 중심이 된 혁명으로 이승만이 1960년 4월 26일 사임을 발표했다.",
        source: {
          title: "4·19혁명 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0025902",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "kh-10",
        question: "고려 고종 때 다시 새긴 대장경판, 곧 팔만대장경판이 보관되어 있는 절은?",
        choices: ["해인사", "불국사", "통도사", "송광사"],
        answerIndex: 0,
        explanation: "경남 합천 해인사에 있고, 판이 8만여 장이어서 팔만대장경판이라 한다.",
        source: {
          title: "합천 해인사 대장경판 - 한국민족문화대백과사전",
          url: "https://encykorea.aks.ac.kr/Article/E0062711",
          checkedAt: "2026-10-12"
        }
      }
    ]
  },
  world_geography: {
    label: "세계지리",
    items: [
      {
        id: "wg-01",
        question: "외교부 국가정보에 적힌 오스트레일리아(호주연방)의 수도는?",
        choices: ["시드니", "멜버른", "캔버라", "브리즈번"],
        answerIndex: 2,
        explanation: "연방정부와 국회가 있는 행정 중심지는 캔버라다.",
        source: {
          title: "외교부 국가정보 — 호주연방",
          url: "https://www.mofa.go.kr/www/nation/m_3458/view.do?seq=41",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-02",
        question: "외교부 국가정보에 적힌 브라질연방공화국의 언어는?",
        choices: ["에스파냐어", "포르투갈어", "프랑스어", "영어"],
        answerIndex: 1,
        explanation: "남아메리카에서 브라질만 포르투갈어를 쓴다.",
        source: {
          title: "외교부 국가정보 — 브라질연방공화국",
          url: "https://www.mofa.go.kr/www/nation/m_3458/view.do?seq=56",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-03",
        question: "외교부 국가정보에 적힌 이집트아랍공화국의 수도는?",
        choices: ["알렉산드리아", "카이로", "룩소르", "아스완"],
        answerIndex: 1,
        explanation: "수도는 카이로이고, 국토의 95%가 사막이라고 적혀 있다.",
        source: {
          title: "외교부 국가정보 — 이집트아랍공화국",
          url: "https://www.mofa.go.kr/www/nation/m_3458/view.do?seq=168",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-04",
        question: "안데스산맥과 아마존 분지가 만나는 곳에 있는 잉카 유적 마추픽추는 어느 나라에 있는가?",
        choices: ["페루", "볼리비아", "칠레", "멕시코"],
        answerIndex: 0,
        explanation: "해발 2,430m 페루 안데스 동쪽 사면에 있는 세계유산이다.",
        source: {
          title: "UNESCO 세계유산 — Historic Sanctuary of Machu Picchu",
          url: "https://whc.unesco.org/en/list/274",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-05",
        question: "시베리아 남동부에 있으며 지구 담수의 20%를 담고 있다는 호수는?",
        choices: ["카스피해", "바이칼호", "아랄해", "발하슈호"],
        answerIndex: 1,
        explanation: "러시아 바이칼호는 깊이 1,700m로, 세계 담수의 20%를 담고 있다.",
        source: {
          title: "UNESCO 세계유산 — Lake Baikal",
          url: "https://whc.unesco.org/en/list/754",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-06",
        question: "남아메리카 해안에서 약 1,000km 떨어진 갈라파고스 제도를 영토로 둔 나라는?",
        choices: ["에콰도르", "페루", "콜롬비아", "코스타리카"],
        answerIndex: 0,
        explanation: "에콰도르 본토에서 약 1,000km 떨어진 화산섬 제도다.",
        source: {
          title: "UNESCO 세계유산 — Galápagos Islands",
          url: "https://whc.unesco.org/en/list/1",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-07",
        question: "빅토리아 폭포(모시 오아 툰야)를 이루며 떨어지는 강은?",
        choices: ["나일강", "콩고강", "잠베지강", "니제르강"],
        answerIndex: 2,
        explanation: "폭포 지점에서 폭 2km가 넘는 잠베지강이 현무암 협곡으로 떨어진다.",
        source: {
          title: "UNESCO 세계유산 — Mosi-oa-Tunya / Victoria Falls",
          url: "https://whc.unesco.org/en/list/509",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-08",
        question: "누 떼의 이동으로 알려진 세렝게티 국립공원이 있는 나라는?",
        choices: ["케냐", "탄자니아", "우간다", "보츠와나"],
        answerIndex: 1,
        explanation: "유네스코는 소재 국가를 탄자니아연합공화국으로 적고 있다.",
        source: {
          title: "UNESCO 세계유산 — Serengeti National Park",
          url: "https://whc.unesco.org/en/list/156",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-09",
        question: "산호 400종이 사는 그레이트배리어리프가 펼쳐진 나라는?",
        choices: ["인도네시아", "필리핀", "오스트레일리아", "멕시코"],
        answerIndex: 2,
        explanation: "오스트레일리아 북동 해안을 따라 이어진 산호초 지대다.",
        source: {
          title: "UNESCO 세계유산 — Great Barrier Reef",
          url: "https://whc.unesco.org/en/list/154",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-10",
        question: "미국 애리조나주의 그랜드캐니언을 깎아 낸 강은?",
        choices: ["미시시피강", "리오그란데강", "콜로라도강", "컬럼비아강"],
        answerIndex: 2,
        explanation: "콜로라도강이 깎아 낸 깊이 약 1,500m의 협곡이다.",
        source: {
          title: "UNESCO 세계유산 — Grand Canyon National Park",
          url: "https://whc.unesco.org/en/list/75",
          checkedAt: "2026-10-12"
        }
      }
    ]
  },
  science: { label: "과학", items: [] },
  arts_culture: { label: "예술과 문화", items: [] }
};
