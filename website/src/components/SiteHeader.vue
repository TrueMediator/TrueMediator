<script setup lang="ts">
import { ref } from "vue";
import logo from "../assets/logo.svg";
const open = ref(false);
</script>
<template>
  <header class="header wrap">
    <RouterLink class="brand" to="/" @click="open = false"
      ><img :src="logo" alt="" width="36" height="36" /><span
        >True<span class="brand-accent">Mediator</span></span
      ></RouterLink
    >
    <button
      class="menu-toggle"
      :aria-expanded="open"
      aria-controls="main-nav"
      @click="open = !open"
    >
      {{ open ? "Close" : "Menu" }}
    </button>
    <nav
      id="main-nav"
      :class="{ 'is-open': open }"
      aria-label="Main navigation"
      @click="open = false"
    >
      <RouterLink to="/#why-truemediator">Features</RouterLink>
      <RouterLink to="/#faq">FAQ</RouterLink>
      <RouterLink to="/docs/getting-started/">Documents</RouterLink>
    </nav>
    <div class="header-actions">
      <a
        class="header-github"
        href="https://github.com/TrueMediator/TrueMediator"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub (opens in a new tab)"
        title="GitHub"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.931 0-1.31.465-2.381 1.235-3.221-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.404c1.02.005 2.045.138 3 .404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.911 1.23 3.221 0 4.609-2.805 5.625-5.475 5.921.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
          />
        </svg></a
      >
    <RouterLink class="button primary header-cta" to="/docs/getting-started/"
      >Get started </RouterLink
    >
    </div>
  </header>
</template>
