<template>
  <div class="flex-1 overflow-y-auto p-6">
    <div class="max-w-3xl mx-auto space-y-8">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm">
          <span class="text-white font-bold text-sm">AI</span>
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100">Use cogNNitive with AI</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Edit your iNNfo models using AI agents</p>
        </div>
      </div>

      <!-- Description card -->
      <div class="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200/60 dark:border-purple-800/30 rounded-xl p-5">
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          You can use cogNNitive through its UI to edit and view models.
          You can also edit models using AI agents like <strong>anti-gravity</strong>,
          <strong>Claude Code</strong>, or <strong>OpenCode</strong> through their
          desktop, CLI, or TUI versions.
        </p>
      </div>

      <!-- Tools section -->
      <section>
        <h2 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Wrench class="w-4 h-4 text-purple-500" />
          Tools
        </h2>
        <div class="grid gap-3">
          <a v-for="tool in tools" :key="tool.name" :href="tool.url" target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors shrink-0">
              {{ tool.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{{ tool.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ tool.description }}</p>
            </div>
            <ExternalLink class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors shrink-0" />
          </a>
        </div>
      </section>

      <!-- Steps section -->
      <section>
        <h2 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ListOrdered class="w-4 h-4 text-purple-500" />
          Steps
        </h2>
        <div class="space-y-3">
          <div v-for="(step, i) in steps" :key="i"
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
          >
            <div class="flex items-start gap-3">
              <span class="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold shrink-0 mt-0.5">
                {{ i + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{{ step.title }}</h3>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed" v-html="step.description"></p>
                <div v-if="step.links" class="flex flex-wrap gap-2 mt-3">
                  <a v-for="link in step.links" :key="link.url" :href="link.url" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-2xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                  >
                    <ExternalLink class="w-3 h-3" />
                    {{ link.label }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Prompt tip -->
      <div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <Lightbulb class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Quick start</p>
            <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Once your workspace is set up, just tell your agent:
              <br>
              <code class="inline-block mt-1.5 px-3 py-1.5 bg-amber-100/80 dark:bg-amber-900/40 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-300">
                "I want to edit a model in the chat"
              </code>
            </p>
          </div>
        </div>
      </div>

      <!-- Right sidebar prompts tip -->
      <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/30 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <PanelRightOpen class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Right sidebar prompts</p>
            <p class="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
              When viewing a model in cogNNitive, the <strong>right sidebar</strong>
              shows suggested prompts for each concept. Copy and paste them into your AI agent
              to dive deeper into that concept or element.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Wrench, ExternalLink, ListOrdered, Lightbulb, PanelRightOpen } from 'lucide-vue-next'

const tools = [
  {
    name: 'Claude Code',
    initials: 'CC',
    description: 'Recommended. Powerful AI agent with a generous free tier. Desktop, CLI, and TUI versions.',
    url: 'https://docs.anthropic.com/en/docs/claude-code/overview',
  },
  {
    name: 'OpenCode',
    initials: 'OC',
    description: 'Open-source TUI/CLI client for editing code and models with AI.',
    url: 'https://github.com/anomalyco/opencode',
  },
  {
    name: 'anti-gravity',
    initials: 'AG',
    description: 'AI tool specialized for editing models and documentation.',
    url: 'https://docs.antigravity.ai',
  },
]

const steps = [
  {
    title: 'Download and choose an AI agent',
    description: 'Download and choose one of the tools from the <strong>Tools</strong> section above. You can use their desktop, CLI, or TUI versions. Pick the one you\'re most comfortable with. We recommend <strong>Claude Code</strong> by default — it has a generous free tier.',
    links: tools.map(t => ({ label: `Download ${t.name}`, url: t.url })),
  },
  {
    title: 'Open the workspace folder in your AI agent',
    description: 'Add a workspace pointing to the same folder you use in cogNNitive. You can find the exact path at the top of the header, in the info icon <strong>(i)</strong>. All AI agents work directly on the file system, so sharing the folder is all you need.',
  },
  {
    title: 'Edit models via chat',
    description: 'Once configured, just tell your agent: <em>"I want to edit a model in the chat"</em>. The agent will activate and you can ask for modifications in natural language: add concepts, change fields, restructure sections, and more.',
  },
  {
    title: 'Use right sidebar prompts to go deeper',
    description: 'When viewing a model in cogNNitive, the <strong>right sidebar</strong> shows <strong>suggested prompts</strong> for each concept. Copy and paste them into your AI agent to dive deeper into that specific concept or element.',
  },
]
</script>
