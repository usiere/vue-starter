<script setup lang="ts">
import { ref } from 'vue';
import type { CrossrefWork } from '@/types/crossref';

interface Props {
  work: CrossrefWork;
}

const props = defineProps<Props>();
const snackbar = ref(false);

const hasValidAuthors = (authors?: CrossrefWork['author']): boolean => {
  return authors && authors.some(a => a.family || a.given) || false;
};

const formatAuthors = (authors?: CrossrefWork['author']): string => {
  if (!authors || authors.length === 0) {
    return 'Unknown authors';
  }
  const validAuthors = authors
    .filter(a => a.family || a.given)
    .map(a => [a.given, a.family].filter(Boolean).join(' '))
    .join(', ');

  return validAuthors || 'Unknown authors';
};

const getPublicationYear = (work: CrossrefWork): string => {
  const publishedPrint = work['published-print'];
  const publishedOnline = work['published-online'];
  const published = work.published;

  let dateSource = publishedPrint || publishedOnline || published;

  if (dateSource && dateSource['date-parts'] && dateSource['date-parts'][0]) {
    return dateSource['date-parts'][0][0]?.toString() || 'Unknown year';
  }

  return 'Unknown year';
};

const getTitle = (title: string[]): string => {
  const rawTitle = title && title.length > 0 ? title[0] : 'Untitled';
  // Decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = rawTitle;
  return textarea.value;
};

const getContainerTitle = (containerTitle?: string[]): string => {
  return containerTitle?.[0] || '';
};


const copyCitation = async (work: CrossrefWork) => {
  const authors = formatAuthors(work.author);
  const title = getTitle(work.title || []);
  const containerTitle = getContainerTitle(work['container-title']);
  const year = getPublicationYear(work);
  const doi = work.DOI;

  const citation = `${authors}. ${title}. ${containerTitle}, ${year}. https://doi.org/${doi}`;

  try {
    await navigator.clipboard.writeText(citation);
    snackbar.value = true;
  } catch (err) {
    console.error('Failed to copy citation:', err);
  }
};
</script>

<template>
  <v-card
    class="result-item mb-3 px-3 pt-3 pb-2"
    variant="flat"
    data-testid="result-item"
    style="background-color: #ffffff; border: 1px solid #d0d0d0; border-radius: 8px; transition: all 0.2s ease;"
  >
    <v-card-title class="mb-1">
      <a :href="'https://doi.org/' + work.DOI" target="_blank" rel="noopener" style="color: #1867c0; text-decoration: none;" class="title-link">
        {{ work.title?.[0] || 'Untitled' }}
      </a>
    </v-card-title>

    <v-card-subtitle class="mb-1">
      <div class="d-flex flex-wrap ga-2">
        <v-chip
          size="small"
          variant="outlined"
          :aria-label="`Publication type: ${work.type}`"
        >
          {{ work.type }}
        </v-chip>
        <v-chip
          size="small"
          variant="outlined"
          :aria-label="`Publication year: ${getPublicationYear(work)}`"
        >
          {{ getPublicationYear(work) }}
        </v-chip>
      </div>
    </v-card-subtitle>

    <v-card-text>
      <div class="result-content">
        <p v-if="hasValidAuthors(work.author)" class="text-body-2 text-grey-darken-2 mb-1">
          Authors: {{ formatAuthors(work.author) }}
        </p>
        <p v-if="work['container-title'] && work['container-title'].length > 0" class="text-body-2 text-grey-darken-2 mb-1">
          Published in: {{ work['container-title'][0] }}
        </p>

        <div class="d-flex align-center ga-4 mt-1">
          <a :href="'https://doi.org/' + work.DOI" target="_blank" rel="noopener" class="text-body-2 text-grey-darken-1">
            https://doi.org/{{ work.DOI }}
          </a>
          <v-menu>
            <template v-slot:activator="{ props }">
              <span v-bind="props" class="text-body-2 text-primary" style="cursor: pointer;">
                Actions <v-icon size="small">mdi-chevron-down</v-icon>
              </span>
            </template>
            <v-list density="compact">
              <v-list-item @click="copyCitation(work)">
                <v-list-item-title>Cite</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://api.crossref.org/works/' + work.DOI" target="_blank">
                <v-list-item-title>Metadata as JSON</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <v-snackbar
    v-model="snackbar"
    :timeout="3000"
    color="success"
  >
    Citation copied to clipboard
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.result-item:hover {
  border-color: #999 !important;
  background-color: #fafafa !important;
}

.title-link:hover {
  text-decoration: underline !important;
}

.result-content {
  line-height: 1.6;
}
</style>