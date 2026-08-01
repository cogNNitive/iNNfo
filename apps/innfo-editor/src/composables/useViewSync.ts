import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore, type ActiveView } from '../stores/uiStore'

const VALID_VIEWS: ActiveView[] = [
  'editor',
  'graph',
  'matrices',
  'info',
  'ai-guide',
  'exports',
  'guided-procedure',
]

/**
 * Syncs `uiStore.activeView` with the `?view=` query parameter on the
 * workspace route so that browser back/forward navigates between views
 * instead of jumping to the homepage.
 *
 * - **Store → URL**: when the active view changes (via sidebar, header, or
 *   internal code), a new history entry is pushed with the updated query.
 * - **URL → Store**: when the user navigates back/forward, the query param
 *   is read and the store is updated.
 * - **Guard**: a `updating` flag prevents infinite update loops between
 *   the two sync directions.
 */
export function useViewSync(): void {
  const route = useRoute()
  const router = useRouter()
  const uiStore = useUiStore()

  let updating = false

  // URL → Store: when route query changes via back/forward
  watch(
    () => route.query.view,
    (view) => {
      if (updating) return
      if (typeof view === 'string' && VALID_VIEWS.includes(view as ActiveView)) {
        updating = true
        uiStore.setActiveView(view as ActiveView)
        updating = false
      }
    },
  )

  // Store → URL: create a history entry when switching views
  watch(
    () => uiStore.activeView,
    (view) => {
      if (updating) return
      updating = true
      // Read the live hash: node selection is synced to the URL hash via
      // useHashSync using raw history.pushState, which vue-router's
      // `route.hash` does not observe. Using the live value keeps the
      // selected node in the URL when switching views.
      router.push({
        query: { ...route.query, view },
        hash: window.location.hash || undefined,
      })
      updating = false
    },
  )

  // On mount, seed the URL with the current view if no view param exists
  onMounted(() => {
    const viewParam = route.query.view as string | undefined
    if (viewParam && VALID_VIEWS.includes(viewParam as ActiveView)) {
      uiStore.setActiveView(viewParam as ActiveView)
    } else if (!viewParam) {
      router.replace({
        query: { ...route.query, view: uiStore.activeView },
        hash: window.location.hash || undefined,
      })
    }
  })
}
