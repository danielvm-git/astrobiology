<script setup lang="ts">
import { ref } from "vue";
import { Languages, ChevronDown } from "lucide-vue-next";

const props = defineProps<{
  currentLocale: string;
  locales: string[];
  variant?: "header" | "footer" | "mobile";
}>();

const { variant = "header" } = props;
const isOpen = ref(false);

const languageNames: Record<string, string> = {
  "pt-br": "Português",
  en: "English",
  nl: "Dutch",
  es: "Español",
  ja: "日本語",
  zh: "中文",
};

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  isOpen.value = false;
}

function getLocalePath(locale: string) {
  // Simple path switching logic
  if (locale === 'en') return '/';
  return `/${locale}`;
}
</script>

<template>
  <div v-if="variant === 'header'" class="relative">
    <button
      type="button"
      @click="toggleMenu"
      class="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors rounded-md hover:bg-slate-50"
      :aria-expanded="isOpen"
    >
      <Languages class="h-3.5 w-3.5" />
      {{ currentLocale }}
      <ChevronDown
        class="h-3 w-3 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-slate-100 shadow-2xl py-2 z-50"
    >
      <a
        v-for="l in locales"
        :key="l"
        :href="getLocalePath(l)"
        @click="closeMenu"
        class="block px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-slate-50"
        :class="currentLocale === l ? 'text-primary' : 'text-slate-500'"
      >
        {{ languageNames[l] || l.toUpperCase() }}
      </a>
    </div>
  </div>

  <div
    v-else-if="variant === 'footer'"
    class="flex flex-wrap items-center gap-x-4 gap-y-2"
  >
    <a
      v-for="l in locales"
      :key="l"
      :href="getLocalePath(l)"
      class="text-[10px] font-black tracking-widest transition-colors"
      :class="currentLocale === l ? 'text-primary' : 'text-slate-400 hover:text-slate-600'"
    >
      {{ languageNames[l] || l.toUpperCase() }}
    </a>
  </div>
</template>
