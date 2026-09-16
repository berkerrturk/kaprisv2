<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

defineProps<{
  categoryLabel: string
}>()

const goldKaratOptions = [8, 14, 18, 22] as const
const currentStep = ref(0)
const isComplete = ref(false)
const answers = reactive({
  goldKarat: null as number | null,
  style: '',
  minBudget: '',
  maxBudget: '',
})

function parseBudget(value: string | number): number | null {
  const text = String(value).trim()
  if (!/^\d+$/.test(text)) return null
  const amount = Number(text)
  return Number.isSafeInteger(amount) ? amount : null
}

const budgetFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})

const canContinue = computed(() => {
  if (currentStep.value === 0) return answers.goldKarat !== null
  if (currentStep.value === 1) return answers.style.trim().length > 0

  const minBudget = parseBudget(answers.minBudget)
  const maxBudget = parseBudget(answers.maxBudget)

  return minBudget !== null && maxBudget !== null && maxBudget >= minBudget
})

function goBack() {
  if (currentStep.value > 0) currentStep.value -= 1
}

function continueFlow() {
  if (!canContinue.value) return

  if (currentStep.value === 2) {
    isComplete.value = true
    return
  }

  currentStep.value += 1
}

function restartFlow() {
  currentStep.value = 0
  isComplete.value = false
  answers.goldKarat = null
  answers.style = ''
  answers.minBudget = ''
  answers.maxBudget = ''
}
</script>

<template>
  <section class="discovery-flow" aria-labelledby="discovery-title">
    <div v-if="!isComplete">
      <p class="step-count" aria-live="polite">
        Adım {{ currentStep + 1 }} / 3
      </p>
      <h2 id="discovery-title">{{ categoryLabel }} tercihlerini belirle</h2>

      <form @submit.prevent="continueFlow">
        <fieldset v-if="currentStep === 0">
          <legend>Hangi altın ayarını tercih edersin?</legend>
          <div class="choice-grid">
            <label
              v-for="karat in goldKaratOptions"
              :key="karat"
              class="choice-option"
              :class="{ 'choice-option-selected': answers.goldKarat === karat }"
            >
              <input
                v-model="answers.goldKarat"
                name="goldKarat"
                type="radio"
                :value="karat"
                required
              />
              <span>{{ karat }} Ayar</span>
            </label>
          </div>
        </fieldset>

        <fieldset v-else-if="currentStep === 1">
          <legend>Hangi stili arıyorsun?</legend>
          <label for="style">Stil</label>
          <input
            id="style"
            v-model="answers.style"
            name="style"
            placeholder="Örneğin minimal"
            required
          />
        </fieldset>

        <fieldset v-else>
          <legend>Bütçe aralığın nedir?</legend>
          <div class="budget-fields">
            <label>
              Minimum bütçe
              <input
                v-model="answers.minBudget"
                name="minBudget"
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                placeholder="₺"
                required
              />
            </label>
            <label>
              Maksimum bütçe
              <input
                v-model="answers.maxBudget"
                name="maxBudget"
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                placeholder="₺"
                required
              />
            </label>
          </div>
          <p
            v-if="
              answers.minBudget !== '' &&
              answers.maxBudget !== '' &&
              !canContinue
            "
            class="form-error"
            role="alert"
          >
            Tam sayı bütçe gir; maksimum bütçe minimumdan düşük olamaz.
          </p>
        </fieldset>

        <div class="flow-actions">
          <button
            v-if="currentStep > 0"
            class="secondary-button"
            type="button"
            @click="goBack"
          >
            Geri
          </button>
          <button class="primary-button" type="submit" :disabled="!canContinue">
            {{ currentStep === 2 ? 'Sonuçları gör' : 'Devam et' }}
          </button>
        </div>
      </form>
    </div>

    <div v-else class="flow-complete" aria-live="polite">
      <p class="eyebrow">Arama özeti</p>
      <h2 id="discovery-title">Tercihlerin hazır</h2>
      <dl class="answer-summary">
        <div>
          <dt>Kategori</dt>
          <dd>{{ categoryLabel }}</dd>
        </div>
        <div>
          <dt>Altın ayarı</dt>
          <dd>{{ answers.goldKarat }} ayar</dd>
        </div>
        <div>
          <dt>Stil</dt>
          <dd>{{ answers.style.trim() }}</dd>
        </div>
        <div>
          <dt>Bütçe</dt>
          <dd>
            {{ budgetFormatter.format(Number(answers.minBudget)) }} –
            {{ budgetFormatter.format(Number(answers.maxBudget)) }}
          </dd>
        </div>
      </dl>
      <p>
        Ürün kataloğu henüz eklenmediği için eşleşen ürünler gösterilemiyor.
      </p>
      <button class="secondary-button" type="button" @click="restartFlow">
        Baştan başla
      </button>
    </div>
  </section>
</template>
