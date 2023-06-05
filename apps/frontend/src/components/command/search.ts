import { watchDebounced } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { resetSearchCommands, searchCommands } from './searchCommands'
import { resetSearchTasks, searchTasks } from './searchTasks'
type State = 'waitingForInput' | 'inputCompleted' | 'loading' | 'loadCompleted'

export const inputStateMachine = {
  state: ref<State>('waitingForInput'),
  completeInput() {
    this.state.value = 'inputCompleted'
  },
  startLoading() {
    this.state.value = 'loading'
  },
  completeLoad(): void {
    this.state.value = 'loadCompleted'
  },
  reset(): void {
    this.state.value = 'waitingForInput'
  },
}

export const search = ref('')

export function resetSearch() {
  search.value = ''
}

export const isSearchCommand = computed(() => {
  return search.value.startsWith('>')
})

watchDebounced(
  () => search.value,
  async (v) => {
    if (v) {
      inputStateMachine.completeInput()
      inputStateMachine.startLoading()

      if (isSearchCommand.value)
        searchCommands(v.slice(1))
      else
        await searchTasks(v)

      inputStateMachine.completeLoad()
    }
  },
  { debounce: 500 },
)

watch(
  () => search.value,
  (v) => {
    if (v === '') {
      inputStateMachine.reset()
      resetSearchCommands()
      resetSearchTasks()
    }
  },
)
