<script setup lang="ts">
import type { Category } from '../data/categories'

defineProps<{ categoryId: Category['id'] }>()
</script>

<template>
  <svg
    class="jewelry-artwork"
    viewBox="0 0 80 80"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <g v-if="categoryId === 'ring'">
      <ellipse cx="40" cy="52" rx="22" ry="19" />
      <path d="M20 44c5 5 12 8 20 8s15-3 20-8" />
      <path d="m32 22 8-9 8 9-8 12-8-12Z" />
      <path d="m32 22-8 4 16 8 16-8-8-4M40 13v21" />
    </g>
    <g v-else-if="categoryId === 'bracelet'">
      <ellipse cx="40" cy="42" rx="27" ry="19" />
      <path d="M17 31c8 10 38 10 46 0M17 53c8-10 38-10 46 0" />
      <circle cx="40" cy="23" r="4" />
      <circle cx="16" cy="42" r="3" />
      <circle cx="64" cy="42" r="3" />
    </g>
    <g v-else-if="categoryId === 'bangle'">
      <ellipse cx="40" cy="41" rx="26" ry="24" />
      <ellipse cx="40" cy="41" rx="19" ry="17" />
      <path d="M21 25c10-8 28-8 38 0M21 57c10 8 28 8 38 0" />
    </g>
    <g v-else-if="categoryId === 'necklace'">
      <path d="M13 19c1 22 15 34 27 34s26-12 27-34" />
      <path d="M20 21c2 16 11 25 20 25s18-9 20-25" />
      <path d="m40 47-8 11 8 10 8-10-8-11Z" />
      <path d="M36 58h8" />
    </g>
    <g v-else>
      <circle cx="25" cy="24" r="4" />
      <circle cx="55" cy="24" r="4" />
      <path d="M25 29v12m30-12v12" />
      <path
        d="M16 45c0-5 4-9 9-9s9 4 9 9v11c0 6-4 10-9 10s-9-4-9-10V45Zm30 0c0-5 4-9 9-9s9 4 9 9v11c0 6-4 10-9 10s-9-4-9-10V45Z"
      />
    </g>
  </svg>
</template>
