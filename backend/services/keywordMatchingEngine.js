// ============================================================
// KEYWORD MATCHING ENGINE v7
// ============================================================
//
// Accurate ATS keyword matching
//
// Features:
// - Exact phrase matching
// - Approved aliases
// - Singular/plural matching
// - Single-word matching
// - No false multi-word matching
// - Keyword score calculation
//
// ============================================================


// ============================================================
// NORMALIZE TEXT
// ============================================================

function normalizeKeywordText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[\/|,;:()[\]{}]/g, " ")
    .replace(/[^a-z0-9+#.\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


// ============================================================
// STOP WORDS
// ============================================================

const KEYWORD_STOP_WORDS = new Set([
  "job",
  "title",
  "company",
  "location",
  "type",
  "employment",
  "fulltime",
  "full",
  "time",
  "part",
  "description",
  "responsibility",
  "responsibilities",
  "qualification",
  "qualifications",
  "preferred",
  "required",
  "requirements",
  "candidate",
  "candidates",
  "position",
  "role",
  "join",
  "looking",
  "india",
  "delhi",
  "abc",
  "pvt",
  "ltd",
  "while",
  "when",
  "where",
  "this",
  "that",
  "these",
  "those",
  "will",
  "would",
  "should",
  "could",
  "must",
  "may",
  "can",
  "able",
  "ability",
  "good",
  "strong",
  "professional",
  "previous",
  "experience",
  "knowledge",
  "familiarity",
  "including",
  "etc",
]);


// ============================================================
// APPROVED ALIASES
// ============================================================

const KEYWORD_ALIASES = {
  "warehouse management system": [
    "warehouse management system",
    "warehouse management systems",
    "wms",
  ],

  "warehouse management systems": [
    "warehouse management system",
    "warehouse management systems",
    "wms",
  ],

  wms: [
    "wms",
    "warehouse management system",
    "warehouse management systems",
  ],

  inventory: [
    "inventory",
    "inventories",
  ],

  "inventory management": [
    "inventory management",
    "inventory-management",
  ],

  "inventory systems": [
    "inventory system",
    "inventory systems",
  ],

  "inventory tracking": [
    "inventory tracking",
    "inventory-tracking",
  ],

  "inventory checks": [
    "inventory check",
    "inventory checks",
  ],

  "cycle count": [
    "cycle count",
    "cycle counts",
  ],

  "cycle counts": [
    "cycle count",
    "cycle counts",
  ],

  "stock record": [
    "stock record",
    "stock records",
  ],

  "stock records": [
    "stock record",
    "stock records",
  ],

  "shipping and receiving": [
    "shipping and receiving",
    "shipping receiving",
    "shipping & receiving",
  ],

  receiving: [
    "receiving",
    "goods receiving",
  ],

  "order fulfillment": [
    "order fulfillment",
    "order-fulfillment",
  ],

  fulfillment: [
    "fulfillment",
    "order fulfillment",
  ],

  "barcode scanner": [
    "barcode scanner",
    "barcode scanners",
    "barcode scanning",
  ],

  "barcode scanners": [
    "barcode scanner",
    "barcode scanners",
    "barcode scanning",
  ],

  "barcode scanning": [
    "barcode scanner",
    "barcode scanners",
    "barcode scanning",
  ],

  "attention to detail": [
    "attention to detail",
    "detail-oriented",
    "detail oriented",
  ],

  "time management": [
    "time management",
    "time-management",
  ],

  "communication skills": [
    "communication skills",
    "communication",
  ],

  communication: [
    "communication",
    "communication skills",
  ],

  teamwork: [
    "teamwork",
    "team work",
  ],

  "warehouse operations": [
    "warehouse operation",
    "warehouse operations",
  ],

  "record keeping": [
    "record keeping",
    "record-keeping",
  ],

  "safety procedures": [
    "safety procedure",
    "safety procedures",
    "workplace safety",
  ],

  "workplace safety": [
    "workplace safety",
    "safety procedure",
    "safety procedures",
  ],
};


// ============================================================
// NORMALIZE WORD
// ============================================================

function normalizeWord(word = "") {
  const value =
    String(word)
      .toLowerCase()
      .trim();

  if (!value) {
    return "";
  }

  if (value.length <= 3) {
    return value;
  }

  if (value.endsWith("ies")) {
    return (
      value.slice(0, -3) +
      "y"
    );
  }

  if (
    value.endsWith("ses") &&
    value.length > 4
  ) {
    return value.slice(0, -2);
  }

  if (
    value.endsWith("s") &&
    !value.endsWith("ss")
  ) {
    return value.slice(0, -1);
  }

  return value;
}


// ============================================================
// NORMALIZE PHRASE
// ============================================================

function normalizePhrase(
  phrase = ""
) {
  return normalizeKeywordText(
    phrase
  )
    .split(" ")
    .filter(Boolean)
    .map(normalizeWord)
    .join(" ");
}


// ============================================================
// TOKENIZE
// ============================================================

function tokenize(
  text = ""
) {
  return normalizeKeywordText(
    text
  )
    .split(" ")
    .filter(Boolean);
}


// ============================================================
// EXACT PHRASE MATCH
// ============================================================

function exactPhraseMatch(
  resumeText = "",
  keyword = ""
) {
  const resume =
    normalizeKeywordText(
      resumeText
    );

  const target =
    normalizeKeywordText(
      keyword
    );

  if (!resume || !target) {
    return false;
  }

  const resumeTokens =
    resume.split(" ");

  const targetTokens =
    target.split(" ");

  if (
    targetTokens.length >
    resumeTokens.length
  ) {
    return false;
  }

  for (
    let i = 0;
    i <=
    resumeTokens.length -
      targetTokens.length;
    i++
  ) {
    let matched = true;

    for (
      let j = 0;
      j < targetTokens.length;
      j++
    ) {
      if (
        resumeTokens[i + j] !==
        targetTokens[j]
      ) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return true;
    }
  }

  return false;
}


// ============================================================
// NORMALIZED PHRASE MATCH
// ============================================================

function normalizedPhraseMatch(
  resumeText = "",
  keyword = ""
) {
  const resumeTokens =
    tokenize(resumeText).map(
      normalizeWord
    );

  const keywordTokens =
    tokenize(keyword).map(
      normalizeWord
    );

  if (
    !resumeTokens.length ||
    !keywordTokens.length
  ) {
    return false;
  }

  if (
    keywordTokens.length >
    resumeTokens.length
  ) {
    return false;
  }

  for (
    let i = 0;
    i <=
    resumeTokens.length -
      keywordTokens.length;
    i++
  ) {
    let matched = true;

    for (
      let j = 0;
      j < keywordTokens.length;
      j++
    ) {
      if (
        resumeTokens[i + j] !==
        keywordTokens[j]
      ) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return true;
    }
  }

  return false;
}


// ============================================================
// ALIAS MATCH
// ============================================================

function aliasPhraseMatch(
  resumeText = "",
  keyword = ""
) {
  const normalizedKeyword =
    normalizePhrase(keyword);

  const aliases =
    KEYWORD_ALIASES[
      normalizedKeyword
    ] || [keyword];

  for (
    const alias of aliases
  ) {
    if (
      exactPhraseMatch(
        resumeText,
        alias
      )
    ) {
      return true;
    }

    if (
      normalizedPhraseMatch(
        resumeText,
        alias
      )
    ) {
      return true;
    }
  }

  return false;
}


// ============================================================
// SINGLE WORD MATCH
// ============================================================

function singleWordMatch(
  resumeText = "",
  keyword = ""
) {
  const resumeTokens =
    tokenize(resumeText).map(
      normalizeWord
    );

  const target =
    normalizeWord(keyword);

  if (!target) {
    return false;
  }

  return resumeTokens.includes(
    target
  );
}


// ============================================================
// KEYWORD MATCH
// ============================================================

function keywordMatches(
  resumeText = "",
  keyword = ""
) {
  const normalized =
    normalizeKeywordText(
      keyword
    );

  if (!normalized) {
    return false;
  }

  const words =
    normalized.split(" ");

  if (
    words.length === 1 &&
    KEYWORD_STOP_WORDS.has(
      words[0]
    )
  ) {
    return false;
  }

  // Multi-word terms must match
  // as an actual phrase or alias.
  if (words.length > 1) {
    return aliasPhraseMatch(
      resumeText,
      keyword
    );
  }

  return singleWordMatch(
    resumeText,
    keyword
  );
}


// ============================================================
// CLASSIFY MATCH
// ============================================================

function classifyKeywordMatch(
  resumeText = "",
  keyword = ""
) {
  if (
    exactPhraseMatch(
      resumeText,
      keyword
    )
  ) {
    return {
      matched: true,
      method: "exact",
    };
  }

  const normalized =
    normalizeKeywordText(
      keyword
    );

  const words =
    normalized.split(" ");

  if (
    words.length > 1 &&
    aliasPhraseMatch(
      resumeText,
      keyword
    )
  ) {
    return {
      matched: true,
      method: "alias",
    };
  }

  if (
    words.length === 1 &&
    singleWordMatch(
      resumeText,
      keyword
    )
  ) {
    return {
      matched: true,
      method: "word",
    };
  }

  return {
    matched: false,
    method: "none",
  };
}


// ============================================================
// FILTER JOB KEYWORDS
// ============================================================

function filterJobKeywords(
  keywords = []
) {
  return [
    ...new Set(
      keywords
        .map(
          (keyword) =>
            normalizeKeywordText(
              keyword
            )
        )
        .filter(Boolean)
        .filter(
          (keyword) => {
            const words =
              keyword.split(" ");

            if (
              words.length === 1 &&
              KEYWORD_STOP_WORDS.has(
                words[0]
              )
            ) {
              return false;
            }

            return true;
          }
        )
    ),
  ];
}


// ============================================================
// BUILD KEYWORD MATCHING RESULT
// ============================================================

function buildKeywordMatchingResult(
  resumeText = "",
  jobKeywords = []
) {
  const filteredKeywords =
    filterJobKeywords(
      jobKeywords
    );

  const matchedKeywords = [];
  const missingKeywords = [];
  const matchDetails = [];

  for (
    const keyword of filteredKeywords
  ) {
    const result =
      classifyKeywordMatch(
        resumeText,
        keyword
      );

    if (result.matched) {
      matchedKeywords.push(
        keyword
      );

      matchDetails.push({
        keyword,
        matched: true,
        method:
          result.method,
      });
    } else {
      missingKeywords.push(
        keyword
      );

      matchDetails.push({
        keyword,
        matched: false,
        method: "none",
      });
    }
  }

  const matched =
    [
      ...new Set(
        matchedKeywords
      ),
    ];

  const missing =
    [
      ...new Set(
        missingKeywords
      ),
    ];

  const totalKeywords =
    matched.length +
    missing.length;

  const keywordScore =
    totalKeywords > 0
      ? Math.round(
          (
            matched.length /
            totalKeywords
          ) * 100
        )
      : 0;

  return {
    matchedKeywords:
      matched,

    missingKeywords:
      missing,

    totalKeywords,

    keywordScore,

    matchDetails,
  };
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  normalizeKeywordText,
  normalizeWord,
  normalizePhrase,
  tokenize,
  exactPhraseMatch,
  normalizedPhraseMatch,
  aliasPhraseMatch,
  singleWordMatch,
  keywordMatches,
  classifyKeywordMatch,
  filterJobKeywords,
  buildKeywordMatchingResult,
};