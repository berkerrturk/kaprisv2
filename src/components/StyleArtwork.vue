<script setup lang="ts">
import type { Category } from '../data/categories'

defineProps<{
  categoryId: Category['id']
  styleId: 'minimal' | 'classic' | 'modern' | 'bold'
}>()
</script>

<template>
  <svg
    class="style-artwork"
    viewBox="0 0 160 120"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <g v-if="categoryId === 'ring'">
      <ellipse cx="80" cy="80" rx="35" ry="24" />
      <path d="M46 73c7 10 19 16 34 16s27-6 34-16" />
      <path v-if="styleId === 'minimal'" d="M59 58c13-7 29-7 42 0" />
      <path
        v-else-if="styleId === 'classic'"
        d="m69 42 11-15 11 15-11 15-11-15Zm0 0h22M80 27v30"
      />
      <path
        v-else-if="styleId === 'modern'"
        d="m61 48 16-13 22 9-17 17-21-13Zm16-13 5 26"
      />
      <g v-else>
        <path d="m80 27 10 15-10 14-10-14 10-15Z" />
        <path d="m59 37 7 10-7 9-7-9 7-10Zm42 0 7 10-7 9-7-9 7-10Z" />
      </g>
    </g>
    <g v-else-if="categoryId === 'bracelet'">
      <ellipse cx="80" cy="63" rx="50" ry="28" />
      <path d="M34 49c17 13 75 13 92 0" />
      <path v-if="styleId === 'minimal'" d="M36 77c22 10 66 10 88 0" />
      <circle v-else-if="styleId === 'classic'" cx="80" cy="35" r="10" />
      <path v-else-if="styleId === 'modern'" d="m57 37 16-13 17 15 16-10" />
      <g v-else>
        <circle cx="54" cy="38" r="7" />
        <circle cx="80" cy="34" r="8" />
        <circle cx="106" cy="38" r="7" />
      </g>
    </g>
    <g v-else-if="categoryId === 'bangle'">
      <ellipse cx="80" cy="61" rx="45" ry="37" />
      <ellipse cx="80" cy="61" rx="35" ry="27" />
      <path v-if="styleId === 'minimal'" d="M48 36c18-12 46-12 64 0" />
      <path v-else-if="styleId === 'classic'" d="m80 20 8 8-8 8-8-8 8-8Z" />
      <path v-else-if="styleId === 'modern'" d="M40 48c20-20 60-24 82-7" />
      <g v-else>
        <circle cx="64" cy="26" r="5" />
        <circle cx="80" cy="22" r="6" />
        <circle cx="96" cy="26" r="5" />
      </g>
    </g>
    <g v-else-if="categoryId === 'necklace'">
      <path d="M31 22c4 41 24 65 49 65s45-24 49-65" />
      <path d="M39 24c6 31 23 50 41 50s35-19 41-50" />
      <path v-if="styleId === 'minimal'" d="M80 87v12" />
      <path
        v-else-if="styleId === 'classic'"
        d="m80 80-11 13 11 14 11-14-11-13Z"
      />
      <path v-else-if="styleId === 'modern'" d="m68 85 22-5-6 25-16-20Z" />
      <g v-else>
        <path d="m80 80-10 12 10 13 10-13-10-12Z" />
        <circle cx="61" cy="74" r="5" />
        <circle cx="99" cy="74" r="5" />
      </g>
    </g>
    <g v-else>
      <circle cx="54" cy="28" r="5" />
      <circle cx="106" cy="28" r="5" />
      <path d="M54 33v20m52-20v20" />
      <path v-if="styleId === 'minimal'" d="M54 53v33m52-33v33" />
      <path
        v-else-if="styleId === 'classic'"
        d="M54 51c-12 0-18 9-18 20s7 20 18 20 18-9 18-20-6-20-18-20Zm52 0c-12 0-18 9-18 20s7 20 18 20 18-9 18-20-6-20-18-20Z"
      />
      <path
        v-else-if="styleId === 'modern'"
        d="m54 51-17 24 17 20 17-20-17-24Zm52 0-17 24 17 20 17-20-17-24Z"
      />
      <g v-else>
        <path
          d="m54 50-14 20 14 19 14-19-14-20Zm52 0L92 70l14 19 14-19-14-20Z"
        />
        <circle cx="54" cy="101" r="5" />
        <circle cx="106" cy="101" r="5" />
      </g>
    </g>
  </svg>
</template>
