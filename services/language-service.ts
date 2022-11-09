import { LanguageServiceClient } from "@google-cloud/language";

const SPANISH_SYNONYMS_ENDPOINT = new URL(
  `https://thesaurus.altervista.org/thesaurus/v1?key=${process.env.THESAURUS_API_KEY}&language=es_ES&output=json`
);
const authPayload = {
  projectId: process.env.GOOGLE_APPLICATION_CREDENTIALS_PROJECT_ID!,
  credentials: {
    client_email: process.env.GOOGLE_APPLICATION_CREDENTIALS_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_APPLICATION_CREDENTIALS_PRIVATE_KEY!
  }
};

class LanguageService {
  private static instance: LanguageService;
  private connection: LanguageServiceClient;

  private constructor() {
    this.connection = new LanguageServiceClient(authPayload);
  }

  static getInstance() {
    if (!LanguageService.instance) {
      LanguageService.instance = new LanguageService();
    }
    return LanguageService.instance;
  }

  async getKeywords(query: string) {
    const relevantPartsOfSpeech = new Set([
      "VERB",
      "NOUN",
      "PRON",
      "ADJ",
      "ADV"
    ]); // TODO: Define query content relevance rulebook.
    const [document] = await this.connection.analyzeSyntax({
      document: {
        content: query,
        type: "PLAIN_TEXT",
        language: "es"
      },
      encodingType: "UTF8"
    });
    if (!document.tokens) return [];
    return document.tokens
      .filter(
        (token) =>
          relevantPartsOfSpeech.has(token.partOfSpeech?.tag as string) &&
          token.text?.content?.length! > 5
      )
      .map(({ text, partOfSpeech, lemma }) => ({
        text: text?.content,
        lemma,
        type: partOfSpeech?.tag
      }));
  }

  async getSynonyms(word: string) {
    SPANISH_SYNONYMS_ENDPOINT.searchParams.append("word", word);
    const payload = await fetch(SPANISH_SYNONYMS_ENDPOINT.href);
    const { response } = await payload.json();
    let synonyms: string[] = [];
    for (const {
      list: { synonyms: synonymsAsString }
    } of response) {
      synonyms = [...synonyms, ...synonymsAsString.split("|")];
    }
    return synonyms ?? [];
  }
}

export default LanguageService;
