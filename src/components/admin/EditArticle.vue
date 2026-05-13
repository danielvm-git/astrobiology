<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Query } from "appwrite";
import { databases, DATABASE_ID, ARTICLES_COLLECTION_ID, TRANSLATIONS_COLLECTION_ID } from "../../lib/client/appwrite";
import ArticleEditor from "./ArticleEditor.vue";

const props = defineProps<{ articleId: string }>();

const saving = ref(false);
const isLoading = ref(true);
const error = ref(false);

const data = ref<{
  article?: Record<string, unknown>;
  translations?: Array<Record<string, unknown>>;
}>({ article: undefined, translations: [] });

onMounted(async () => {
  try {
    const article = await databases.getDocument(DATABASE_ID, ARTICLES_COLLECTION_ID, props.articleId);
    const transList = await databases.listDocuments(DATABASE_ID, TRANSLATIONS_COLLECTION_ID, [
      Query.equal('articleId', props.articleId)
    ]);
    
    data.value = {
      article,
      translations: transList.documents,
    };
  } catch (err) {
    error.value = true;
  } finally {
    isLoading.value = false;
  }
});

async function handleSave(
  articleData: Record<string, unknown>,
  translations: Array<Record<string, unknown>>
) {
  saving.value = true;
  try {
    await databases.updateDocument(DATABASE_ID, ARTICLES_COLLECTION_ID, props.articleId, articleData);
    
    // Process translations
    for (const t of translations) {
      if (t.$id) {
        // Exclude internal fields
        const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...updateData } = t as any;
        await databases.updateDocument(DATABASE_ID, TRANSLATIONS_COLLECTION_ID, $id, updateData);
      } else {
        await databases.createDocument(DATABASE_ID, TRANSLATIONS_COLLECTION_ID, 'unique()', {
          ...t,
          articleId: props.articleId
        });
      }
    }
    
    alert("Saved successfully!");
  } catch (err: any) {
    alert(err.message || "Error saving article.");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div v-if="isLoading" class="py-20 text-center text-slate-500">
    Carregando...
  </div>
  <div
    v-else-if="error || !data.article"
    class="py-20 text-center text-slate-500"
  >
    Artigo não encontrado.
  </div>
  <template v-else>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-slate-900 uppercase tracking-tight">
          Editar Artigo
        </h1>
        <p
          class="text-slate-500 mt-2 text-sm font-medium uppercase tracking-widest"
        >
          Ajustando conteúdo e metadados
        </p>
      </div>
      <a href="/admin" class="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
        Voltar
      </a>
    </div>

    <ArticleEditor
      v-if="data.translations"
      :article="data.article"
      :translations="data.translations"
      :saving="saving"
      @save="handleSave"
    />
  </template>
</template>
