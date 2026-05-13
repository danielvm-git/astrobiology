<script setup lang="ts">
import { ref } from "vue";
import { databases, DATABASE_ID, ARTICLES_COLLECTION_ID, TRANSLATIONS_COLLECTION_ID } from "../../lib/client/appwrite";
import ArticleEditor from "./ArticleEditor.vue";

const saving = ref(false);

async function handleSave(
  articleData: Record<string, unknown>,
  translations: Array<Record<string, unknown>>
) {
  saving.value = true;
  try {
    const article = await databases.createDocument(DATABASE_ID!, ARTICLES_COLLECTION_ID!, 'unique()', articleData);
    
    // Process translations
    for (const t of translations) {
      await databases.createDocument(DATABASE_ID!, TRANSLATIONS_COLLECTION_ID!, 'unique()', {
        ...t,
        article_id: article.$id
      });
    }
    
    alert("Created successfully!");
    window.location.href = '/admin'; // Redirect back to dashboard
  } catch (err: any) {
    alert(err.message || "Error creating article.");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-black text-slate-900 uppercase tracking-tight">
        Criar Novo Artigo
      </h1>
      <p
        class="text-slate-500 mt-2 text-sm font-medium uppercase tracking-widest"
      >
        Inicie um novo conteúdo científico
      </p>
    </div>
    <a href="/admin" class="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
      Voltar
    </a>
  </div>

  <ArticleEditor
    :article="null"
    :translations="[]"
    :saving="saving"
    @save="handleSave"
  />
</template>
