<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  FileText,
  CheckCircle2,
  PenTool,
  Tag,
  Plus,
  ExternalLink,
  TrendingUp,
  Calendar,
  ChevronRight,
  Telescope,
  Settings,
  RefreshCw,
} from "lucide-vue-next";
import { cn } from "../../lib/utils";
import { databases, DATABASE_ID, ARTICLES_COLLECTION_ID } from "../../lib/client/appwrite";
import { Query } from "appwrite";

type RecentArticle = {
  $id: string;
  title?: string;
  status?: string;
  category?: string;
  publishedAt?: string;
  $createdAt?: string;
  authorName?: string;
};

const stats = ref<{
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  categories: number;
  recentArticles: RecentArticle[];
} | null>(null);

const loadError = ref("");
const redeploying = ref(false);
const redeployStatus = ref<"idle" | "success" | "error">("idle");
const isLoading = ref(true);

async function loadData() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const publishedResponse = await databases.listDocuments(DATABASE_ID!, ARTICLES_COLLECTION_ID!, [
      Query.equal('status', 'published'),
      Query.limit(1)
    ]);
    const draftsResponse = await databases.listDocuments(DATABASE_ID!, ARTICLES_COLLECTION_ID!, [
      Query.equal('status', 'draft'),
      Query.limit(1)
    ]);
    const recentResponse = await databases.listDocuments(DATABASE_ID!, ARTICLES_COLLECTION_ID!, [
      Query.orderDesc('$createdAt'),
      Query.limit(5)
    ]);

    stats.value = {
      totalArticles: publishedResponse.total + draftsResponse.total,
      publishedArticles: publishedResponse.total,
      draftArticles: draftsResponse.total,
      categories: 6, // Hardcoded for now based on CATEGORIES
      recentArticles: recentResponse.documents as unknown as RecentArticle[]
    };
  } catch (err: any) {
    loadError.value = err.message || "Failed to load dashboard data.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});

async function triggerRedeploy() {
  redeploying.value = true;
  redeployStatus.value = "idle";
  try {
    // Optional: Call a webhook or custom endpoint to redeploy Astro if static.
    // For now, simulate success
    await new Promise(r => setTimeout(r, 1000));
    redeployStatus.value = "success";
  } catch {
    redeployStatus.value = "error";
  } finally {
    redeploying.value = false;
    setTimeout(() => (redeployStatus.value = "idle"), 4000);
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
</script>

<template>
  <div class="space-y-10">
    <div v-if="loadError" class="space-y-4">
      <div
        class="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl flex flex-col items-center text-center shadow-sm"
      >
        <div
          class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"
        >
          <Settings class="w-6 h-6" />
        </div>
        <h2 class="text-xl font-black uppercase tracking-tight mb-2">
          Connection Error
        </h2>
        <p class="text-slate-600 max-w-md">{{ loadError }}</p>
        <button
          type="button"
          class="mt-6 px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200"
          @click="loadData"
        >
          Try Again
        </button>
      </div>
    </div>

    <div v-else-if="stats && !isLoading" class="space-y-10">
      <div>
        <h1
          class="text-4xl font-black text-slate-900 uppercase tracking-tighter"
        >
          Control Panel
        </h1>
        <p
          class="text-slate-500 mt-2 text-sm font-medium uppercase tracking-widest flex items-center gap-2"
        >
          <TrendingUp class="w-4 h-4 text-accent" />
          Science Portal Overview
        </p>
      </div>

      <div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            class="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
          >
            <div class="flex items-start justify-between">
              <div>
                <p
                  class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
                >
                  Total Articles
                </p>
                <p class="text-3xl font-black text-slate-900">
                  {{ stats.totalArticles }}
                </p>
              </div>
              <div
                class="p-3 bg-primary/5 rounded-xl text-primary transition-colors group-hover:bg-primary group-hover:text-white"
              >
                <FileText class="w-6 h-6" />
              </div>
            </div>
          </div>

          <div
            class="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
          >
            <div class="flex items-start justify-between">
              <div>
                <p
                  class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
                >
                  Published
                </p>
                <p class="text-3xl font-black text-slate-900">
                  {{ stats.publishedArticles }}
                </p>
              </div>
              <div
                class="p-3 bg-green-50 rounded-xl text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white"
              >
                <CheckCircle2 class="w-6 h-6" />
              </div>
            </div>
          </div>

          <div
            class="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
          >
            <div class="flex items-start justify-between">
              <div>
                <p
                  class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
                >
                  Drafts
                </p>
                <p class="text-3xl font-black text-slate-900">
                  {{ stats.draftArticles }}
                </p>
              </div>
              <div
                class="p-3 bg-yellow-50 rounded-xl text-yellow-600 transition-colors group-hover:bg-yellow-600 group-hover:text-white"
              >
                <PenTool class="w-6 h-6" />
              </div>
            </div>
          </div>

          <div
            class="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
          >
            <div class="flex items-start justify-between">
              <div>
                <p
                  class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
                >
                  Categories
                </p>
                <p class="text-3xl font-black text-slate-900">
                  {{ stats.categories }}
                </p>
              </div>
              <div
                class="p-3 bg-accent/5 rounded-xl text-accent transition-colors group-hover:bg-accent group-hover:text-white"
              >
                <Tag class="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center justify-between">
              <h2
                class="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2"
              >
                <Calendar class="w-5 h-5 text-primary" />
                Recent Articles
              </h2>
              <a
                href="/admin/articles"
                class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
              >
                View All <ExternalLink class="w-3 h-3" />
              </a>
            </div>

            <div
              class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div
                v-if="stats.recentArticles?.length"
                class="divide-y divide-slate-100"
              >
                <div
                  v-for="article in stats.recentArticles"
                  :key="article.$id"
                  class="p-6 hover:bg-slate-50/50 transition-colors group"
                >
                  <div class="flex items-center justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <h3
                        class="text-lg font-bold text-slate-900 truncate group-hover:text-primary transition-colors"
                      >
                        {{ article.title || "(Untitled)" }}
                      </h3>
                      <div class="flex items-center gap-3 mt-2">
                        <span
                          :class="
                            cn(
                              'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border',
                              article.status === 'published'
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                            )
                          "
                        >
                          {{
                            article.status === "published"
                              ? "Published"
                              : "Draft"
                          }}
                        </span>
                        <span
                          class="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-widest font-black"
                        >
                          <Calendar class="w-3 h-3" />
                          {{
                            formatDate(
                              article.publishedAt || article.$createdAt || ""
                            )
                          }}
                        </span>
                        <span
                          v-if="article.category"
                          class="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-widest font-black"
                        >
                          <Tag class="w-3 h-3" />
                          {{ article.category }}
                        </span>
                      </div>
                    </div>
                    <a
                      :href="`/admin/articles/${article.$id}/edit`"
                      class="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              </div>
              <div v-else class="p-12 text-center">
                <p class="text-slate-400 font-medium italic">
                  No articles found. Create your first article to start!
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <h2
              class="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2"
            >
              <CheckCircle2 class="w-5 h-5 text-accent" />
              Quick Actions
            </h2>

            <div class="space-y-3">
              <a
                href="/admin/articles/new"
                class="flex items-center justify-between p-4 bg-primary text-white rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all group"
              >
                <div class="flex items-center gap-3">
                  <Plus class="w-5 h-5" />
                  <span class="font-black uppercase tracking-widest text-xs"
                    >New Article</span
                  >
                </div>
                <ChevronRight
                  class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>

              <a
                href="/admin/articles"
                class="flex items-center justify-between p-4 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:border-primary transition-all group"
              >
                <div class="flex items-center gap-3">
                  <FileText class="w-5 h-5 text-primary" />
                  <span class="font-black uppercase tracking-widest text-xs"
                    >Manage All</span
                  >
                </div>
                <ChevronRight
                  class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>

              <button
                type="button"
                :disabled="redeploying"
                class="w-full flex items-center justify-between p-4 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:border-primary transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                @click="triggerRedeploy"
              >
                <div class="flex items-center gap-3">
                  <RefreshCw
                    class="w-5 h-5 text-primary"
                    :class="{ 'animate-spin': redeploying }"
                  />
                  <span class="font-black uppercase tracking-widest text-xs">
                    <template v-if="redeploying">Publishing...</template>
                    <template v-else-if="redeployStatus === 'success'">Published!</template>
                    <template v-else-if="redeployStatus === 'error'">Error Publishing</template>
                    <template v-else>Publish Site</template>
                  </span>
                </div>
                <ChevronRight
                  class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col justify-center items-center py-32 space-y-4"
    >
      <div class="relative w-16 h-16">
        <div
          class="absolute inset-0 border-4 border-primary/10 rounded-full"
        ></div>
        <div
          class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
      <p
        class="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse"
      >
        Syncing Data...
      </p>
    </div>
  </div>
</template>
