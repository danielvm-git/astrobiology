import { Client, Databases, Storage, Account, Query } from 'node-appwrite';

const client = new Client();

const endpoint = import.meta.env.PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.PUBLIC_APPWRITE_PROJECT_ID;

if (projectId) {
  client
    .setEndpoint(endpoint)
    .setProject(projectId);
}

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

export const CATEGORIES = [
  { id: "news", name: "News", slug: "news", color: "primary" },
  { id: "interviews", name: "Interviews", slug: "interviews", color: "secondary" },
  { id: "analyses", name: "Analyses", slug: "analyses", color: "accent" },
  { id: "brazilian-research", name: "Brazilian Research", slug: "brazilian-research", color: "primary" },
  { id: "exoplanets", name: "Exoplanets", slug: "exoplanets", color: "secondary" },
  { id: "extremophiles", name: "Extremophiles", slug: "extremophiles", color: "accent" },
];

export function getImageUrl(fileId: string, width = 800, height = 600): string {
  if (!fileId) return "";
  if (fileId.startsWith("http")) return fileId;
  return `${endpoint}/storage/buckets/${import.meta.env.PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/preview?project=${projectId}&width=${width}&height=${height}`;
}

export function createAdminClient() {
  const adminClient = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId!)
    .setKey(import.meta.env.APPWRITE_API_KEY!);

  return {
    databases: new Databases(adminClient),
    storage: new Storage(adminClient),
    account: new Account(adminClient),
  };
}

export async function getArticles(locale: string, limit = 10) {
  const { databases } = createAdminClient();
  
  const response = await databases.listDocuments(
    DATABASE_ID!,
    ARTICLES_COLLECTION_ID!,
    [
      Query.equal('status', 'published'),
      Query.orderDesc('publishedAt'),
      Query.limit(limit)
    ]
  );

  const articles = await Promise.all(response.documents.map(async (article) => {
    const translations = await databases.listDocuments(
      DATABASE_ID!,
      TRANSLATIONS_COLLECTION_ID!,
      [
        Query.equal('article_id', article.$id),
        Query.equal('language', locale)
      ]
    );
    
    return {
      ...article,
      translation: translations.documents[0] || null
    };
  }));

  return articles;
}

export async function getArticleBySlug(slug: string, locale: string) {
  const { databases } = createAdminClient();
  
  const translations = await databases.listDocuments(
    DATABASE_ID!,
    TRANSLATIONS_COLLECTION_ID!,
    [
      Query.equal('slug', slug),
      Query.equal('language', locale)
    ]
  );

  if (translations.documents.length === 0) return null;
  
  const translation = translations.documents[0];
  const article = await databases.getDocument(
    DATABASE_ID!,
    ARTICLES_COLLECTION_ID!,
    translation.article_id
  );

  return {
    ...article,
    translation
  };
}

export const DATABASE_ID = import.meta.env.PUBLIC_APPWRITE_DATABASE_ID;
export const ARTICLES_COLLECTION_ID = import.meta.env.PUBLIC_APPWRITE_ARTICLES_COLLECTION_ID;
export const TRANSLATIONS_COLLECTION_ID = import.meta.env.PUBLIC_APPWRITE_TRANSLATIONS_COLLECTION_ID;
