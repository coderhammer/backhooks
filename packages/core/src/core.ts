import {AsyncLocalStorage} from 'node:async_hooks'

const asyncLocalStorage = new AsyncLocalStorage()

const globalStore = {}

interface CreateHookOptions<State extends Record<string, any>, ExecuteResult, HookOptions> {
  name: string
  data: () => State
  execute: (state: State, options: HookOptions) => ExecuteResult
}

const getCurrentStore = () => {
  return asyncLocalStorage.getStore() || globalStore
}

const generateHookFunction = <State, ExecuteResult, HookOptions>(options: CreateHookOptions<State, ExecuteResult, HookOptions>) => {
  return (parameters?: HookOptions) => {
    const store = getCurrentStore()
    if (!store[options.name]) {
      store[options.name] = options.data()
    }
    const hookStore = store[options.name] as State
    return options.execute(hookStore, parameters)
  }
}

const generateUpdateHookStateFunction = <State, ExecuteResult, HookOptions>(options: CreateHookOptions<State, ExecuteResult, HookOptions>) => {
  return (fn: (currentState: State) => State) => {
    const store = getCurrentStore()
    if (!store[options.name]) {
      store[options.name] = options.data()
    }
    const hookStore = store[options.name] as State
    store[options.name] = fn(hookStore)
  }
}

export const createHook = <State, ExecuteResult, HookOptions>(options: CreateHookOptions<State, ExecuteResult, HookOptions>): [(parameters?: HookOptions) => ExecuteResult, (fn: (currentState: State) => State) => void] => {
  return [
    generateHookFunction(options),
    generateUpdateHookStateFunction(options)
  ]
}

export const runHookContext = async <T>(fn: () => T): Promise<T> => {
  const result = await asyncLocalStorage.run({}, fn) as T
  return result
}