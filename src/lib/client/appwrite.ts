import { Client, Account, Databases, Storage } from 'appwrite';

const endpoint = import.meta.env.PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.PUBLIC_APPWRITE_PROJECT_ID;

const client = new Client();

if (projectId) {
    client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = import.meta.env.PUBLIC_APPWRITE_DATABASE_ID;
export const ARTICLES_COLLECTION_ID = import.meta.env.PUBLIC_APPWRITE_ARTICLES_COLLECTION_ID;
export const TRANSLATIONS_COLLECTION_ID = import.meta.env.PUBLIC_APPWRITE_TRANSLATIONS_COLLECTION_ID;
export const STORAGE_BUCKET_ID = import.meta.env.PUBLIC_APPWRITE_STORAGE_BUCKET_ID;
