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
        question: "시베리아 남동부에 있으며, 얼지 않은 지구 담수의 약 20%를 담고 있다는 호수는?",
        choices: ["카스피해", "바이칼호", "아랄해", "발하슈호"],
        answerIndex: 1,
        explanation: "유네스코는 러시아 바이칼호가 얼지 않은 담수의 20%를 담고 있다고 적는다.",
        source: {
          title: "UNESCO 세계유산 — Lake Baikal",
          url: "https://whc.unesco.org/en/list/754",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "wg-06",
        question: "남아메리카 서쪽 태평양에 있는 화산섬 제도 갈라파고스를 영토로 둔 나라는?",
        choices: ["에콰도르", "페루", "콜롬비아", "코스타리카"],
        answerIndex: 0,
        explanation: "유네스코·브리태니커 모두 본토에서 약 1,000km 떨어졌다고 적는다.",
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
        question: "유네스코 세계유산으로 등재된 산호초 지대 그레이트배리어리프가 펼쳐진 나라는?",
        choices: ["인도네시아", "필리핀", "오스트레일리아", "멕시코"],
        answerIndex: 2,
        explanation: "오스트레일리아 북동 해안을 따라 이어진 산호초 지대다. 산호 종 수는 출처마다 다르다.",
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
  science: {
    label: "과학",
    items: [
      {
        id: "sc-01",
        question: "수증기를 뺀 건조 공기를 기준으로, 지구 대기에서 부피 비율 78.08%를 차지하는 기체는?",
        choices: ["산소", "질소", "아르곤", "이산화탄소"],
        answerIndex: 1,
        explanation: "건조 공기는 질소 78.08%, 산소 20.95%로 이루어져 있다.",
        source: {
          title: "NASA — Earth Fact Sheet",
          url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "sc-02",
        question: "NASA가 태양계의 행성으로 꼽는 천체는 모두 몇 개인가?",
        choices: ["7개", "8개", "9개", "12개"],
        answerIndex: 1,
        explanation: "수성·금성·지구·화성·목성·토성·천왕성·해왕성 8개다.",
        source: {
          title: "NASA — Planets",
          url: "https://science.nasa.gov/solar-system/planets/",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "sc-03",
        question: "NASA 행성 비교표에서 표면 평균 온도가 464°C로 적힌 행성은?",
        choices: ["수성", "금성", "화성", "목성"],
        answerIndex: 1,
        explanation: "두꺼운 이산화탄소 대기 때문에 금성이 464°C로 가장 뜨겁다.",
        source: {
          title: "NASA — Planetary Fact Sheet",
          url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "sc-04",
        question: "NASA 행성 비교표에서 지름이 142,984km로 적힌 행성은?",
        choices: ["토성", "해왕성", "목성", "천왕성"],
        answerIndex: 2,
        explanation: "목성의 지름은 142,984km로 지구의 11배가 넘는다.",
        source: {
          title: "NASA — Planetary Fact Sheet",
          url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "sc-05",
        question: "NASA 행성 비교표에 적힌 화성의 하루 길이는?",
        choices: ["9.9시간", "24.7시간", "58.6일", "243일"],
        answerIndex: 1,
        explanation: "화성의 하루는 24.7시간으로 지구의 하루와 비슷하다.",
        source: {
          title: "NASA — Planetary Fact Sheet",
          url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "sc-06",
        question: "지구와 달 사이의 평균 거리는 약 얼마인가?",
        choices: ["3만 8,440km", "38만 4,400km", "150만km", "1,496만km"],
        answerIndex: 1,
        explanation: "달 궤도의 반지름은 0.3844×10⁶km, 곧 약 38만 4,400km다.",
        source: {
          title: "NASA — Moon Fact Sheet",
          url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "sc-07",
        question: "국제 단위계가 정한 진공에서의 빛의 속도 값은?",
        choices: ["299,792,458 m/s", "300,000,000 m/s", "29,979,245 m/s", "343 m/s"],
        answerIndex: 0,
        explanation: "오차 없이 정확한 값으로 정해진 상수이며 단위는 m/s다.",
        source: {
          title: "NIST — Speed of light in vacuum (CODATA)",
          url: "https://physics.nist.gov/cgi-bin/cuu/Value?c",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "sc-08",
        question: "DNA를 이루는 네 염기는 아데닌, 시토신, 구아닌과 무엇인가?",
        choices: ["우라실", "티민", "리보스", "인산"],
        answerIndex: 1,
        explanation: "DNA는 A·C·G·T 네 염기로 이루어진다. 우라실은 RNA에 쓰인다.",
        source: {
          title: "NHGRI — Deoxyribonucleic Acid (DNA)",
          url: "https://www.genome.gov/genetics-glossary/Deoxyribonucleic-Acid",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "sc-09",
        question: "우리나라 기상청은 중심 부근 바람이 초속 몇 m 이상인 열대저기압을 태풍이라 부르는가?",
        choices: ["10m/s", "17m/s", "25m/s", "33m/s"],
        answerIndex: 1,
        explanation: "한국과 일본은 17㎧ 이상, 세계기상기구는 33㎧ 이상을 기준으로 쓴다.",
        source: {
          title: "기상청 — 태풍 기본지식",
          url: "https://www.weather.go.kr/w/hazard/typhoon/basic/info1.do",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "sc-10",
        question: "NASA 자료에 적힌 태양의 유효 온도(표면 온도)는?",
        choices: ["1,000K", "5,772K", "15,000K", "1,500만K"],
        answerIndex: 1,
        explanation: "표면의 유효 온도는 5,772K이고, 1,500만K는 중심부 온도다.",
        source: {
          title: "NASA — Sun Fact Sheet",
          url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html",
          checkedAt: "2026-10-12"
        }
      }
    ]
  },
  arts_culture: {
    label: "예술과 문화",
    items: [
      {
        id: "ac-01",
        question: "유네스코 세계유산 목록에 1995년에 등재된 우리 유산은?",
        choices: ["창덕궁", "수원 화성", "석굴암과 불국사", "경주역사유적지구"],
        answerIndex: 2,
        explanation: "1995년에 석굴암·불국사, 종묘, 해인사 장경판전이 함께 등재되었다.",
        source: {
          title: "UNESCO 세계유산 — 대한민국 등재 목록",
          url: "https://whc.unesco.org/en/statesparties/kr",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "ac-02",
        question: "조선의 궁궐 창덕궁이 유네스코 세계유산 목록에 오른 해는?",
        choices: ["1995년", "1997년", "2000년", "2007년"],
        answerIndex: 1,
        explanation: "1997년에 창덕궁과 수원 화성이 함께 등재되었다.",
        source: {
          title: "UNESCO 세계유산 — 대한민국 등재 목록",
          url: "https://whc.unesco.org/en/statesparties/kr",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "ac-03",
        question: "우리나라 세계자연유산 가운데 2007년에 등재된 것은?",
        choices: ["한국의 갯벌", "제주 화산섬과 용암동굴", "설악산 천연보호구역", "순천만"],
        answerIndex: 1,
        explanation: "우리 자연유산은 제주 화산섬과 용암동굴(2007), 한국의 갯벌 둘이다.",
        source: {
          title: "UNESCO 세계유산 — 대한민국 등재 목록",
          url: "https://whc.unesco.org/en/statesparties/kr",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "ac-04",
        question: "2026년 10월 기준으로 유네스코 세계유산 목록에 오른 우리나라 유산은 몇 건인가?",
        choices: ["12건", "15건", "17건", "21건"],
        answerIndex: 2,
        explanation: "문화유산 15건과 자연유산 2건을 더해 17건이다.",
        source: {
          title: "UNESCO 세계유산 — 대한민국 등재 목록",
          url: "https://whc.unesco.org/en/statesparties/kr",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "ac-05",
        question: "유네스코 인류무형문화유산에 '종묘의 왕실 조상 제례와 그 음악'으로 등재된 우리 유산은?",
        choices: ["종묘제례악", "영산재", "처용무", "강릉단오제"],
        answerIndex: 0,
        explanation: "2001년에 선포되고 2008년에 대표목록으로 옮겨 등재되었다.",
        source: {
          title: "UNESCO 무형유산 — Royal ancestral ritual in the Jongmyo shrine and its music",
          url: "https://ich.unesco.org/en/RL/royal-ancestral-ritual-in-the-jongmyo-shrine-and-its-music-00016",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "ac-06",
        question: "민요 아리랑이 유네스코 인류무형문화유산 대표목록에 오른 해는?",
        choices: ["2003년", "2008년", "2012년", "2016년"],
        answerIndex: 2,
        explanation: "2012년 제7차 무형유산위원회에서 대표목록에 등재되었다.",
        source: {
          title: "UNESCO 무형유산 — Arirang, lyrical folk song in the Republic of Korea",
          url: "https://ich.unesco.org/en/RL/arirang-lyrical-folk-song-in-the-republic-of-korea-00445",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "ac-07",
        question: "김치를 담그고 나누는 문화로 2013년 유네스코 인류무형문화유산에 등재된 것은?",
        choices: ["한식", "장 담그기", "김장문화", "떡 만들기"],
        answerIndex: 2,
        explanation: "'김장, 김치를 담그고 나누기'라는 이름으로 2013년에 등재되었다.",
        source: {
          title: "UNESCO 무형유산 — Kimjang, making and sharing kimchi in the Republic of Korea",
          url: "https://ich.unesco.org/en/RL/kimjang-making-and-sharing-kimchi-in-the-republic-of-korea-00881",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "ac-08",
        question: "레오나르도 다빈치가 그린 '모나리자'를 소장하고 있는 곳은?",
        choices: ["오르세 미술관", "루브르 박물관", "우피치 미술관", "프라도 미술관"],
        answerIndex: 1,
        explanation: "루브르 박물관 회화부 소장품이며 원제는 '라 조콩드'다.",
        source: {
          title: "Louvre Collections — La Joconde (Mona Lisa)",
          url: "https://collections.louvre.fr/en/ark:/53355/cl010062370",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "ac-09",
        question: "빈센트 반 고흐가 1889년에 그린 '별이 빛나는 밤'을 소장한 곳은?",
        choices: ["뉴욕 현대미술관(MoMA)", "오르세 미술관", "반 고흐 미술관", "구겐하임 미술관"],
        answerIndex: 0,
        explanation: "1889년 6월 생레미에서 그렸고 뉴욕 현대미술관이 소장한다.",
        source: {
          title: "MoMA — Vincent van Gogh, The Starry Night",
          url: "https://www.moma.org/collection/works/79802",
          checkedAt: "2026-10-12"
        }
      },
      {
        id: "ac-10",
        question: "네덜란드 마우리츠하위스 미술관에 있는 '진주 귀고리를 한 소녀'를 그린 화가는?",
        choices: ["렘브란트", "프란스 할스", "얀 반 에이크", "요하네스 베르메르"],
        answerIndex: 3,
        explanation: "헤이그 마우리츠하위스가 소장한 요하네스 베르메르의 그림이다.",
        source: {
          title: "Mauritshuis — Johannes Vermeer, Girl with a Pearl Earring",
          url: "https://www.mauritshuis.nl/en/our-collection/artworks/670-girl-with-a-pearl-earring/",
          checkedAt: "2026-10-12"
        }
      }
    ]
  }
};
