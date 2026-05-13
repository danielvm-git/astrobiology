<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue';
import { account } from '../../lib/client/appwrite';
import Login from './Login.vue';
import Dashboard from './Dashboard.vue';

import EditArticle from './EditArticle.vue';
import NewArticle from './NewArticle.vue';

const isReady = ref(false);
const currentComponent = shallowRef<any>(null);
const currentProps = shallowRef<any>({});

async function navigate(path: string) {
  window.history.pushState({}, '', path);
  await handleRoute();
}

async function handleRoute() {
  const path = window.location.pathname;
  let user = null;
  currentProps.value = {};
  
  // Handle OAuth2 Token flow (creates session from redirect parameters)
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const secret = params.get('secret');

  if (userId && secret) {
    try {
      await account.createSession(userId, secret);
      // Clean up URL parameters after session creation
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      console.error('Failed to exchange OAuth token for session', e);
    }
  }

  try {
    user = await account.get();
  } catch (e) {
    // Not logged in
  }

  if (path === '/admin/login') {
    if (user) {
      window.history.replaceState({}, '', '/admin');
      currentComponent.value = Dashboard;
    } else {
      currentComponent.value = Login;
    }
  } else {
    // Authenticated routes
    if (!user) {
      window.history.replaceState({}, '', '/admin/login');
      currentComponent.value = Login;
      return;
    }

    if (path.startsWith('/admin/articles/') && path.endsWith('/edit')) {
      const parts = path.split('/');
      const id = parts[3];
      currentProps.value = { articleId: id };
      currentComponent.value = EditArticle;
    } else if (path === '/admin/articles/new') {
      currentComponent.value = NewArticle;
    } else {
      currentComponent.value = Dashboard;
    }
  }
}

onMounted(async () => {
  window.addEventListener('popstate', handleRoute);
  await handleRoute();
  isReady.value = true;
});

function onLoginSuccess() {
  navigate('/admin');
}
</script>

<template>
  <div v-if="isReady" class="font-sans">
    <Login v-if="currentComponent === Login" @login-success="onLoginSuccess" />
    <component v-else :is="currentComponent" v-bind="currentProps" />
  </div>
  <div v-else class="min-h-screen bg-base-300 flex flex-col items-center justify-center gap-4">
    <span class="loading loading-ring loading-lg text-primary"></span>
    <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 animate-pulse">Initializing System</p>
  </div>
</template>
