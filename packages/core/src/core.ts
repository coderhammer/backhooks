import { AsyncLocalStorage } from "node:async_hooks";
import * as crypto from "node:crypto";

const asyncLocalStorage = new AsyncLocalStorage();

let globalStore = {};

interface CreateHookOptions<State, ExecuteResult, HookOptions> {
  name: string;
  data: () => State;
  execute: (state: State, options: HookOptions) => ExecuteResult;
}

const getCurrentStore = () => {
  return asyncLocalStorage.getStore() || globalStore;
};

const generateHookFunction = <State, ExecuteResult, HookOptions>(
  options: CreateHookOptions<State, ExecuteResult, HookOptions>
) => {
  return (parameters?: HookOptions) => {
    const store = getCurrentStore();
    if (!store[options.name]) {
      store[options.name] = options.data();
    }
    const hookStore = store[options.name] as State;
    return options.execute(hookStore, parameters);
  };
};

const generateUpdateHookStateFunction = <State, ExecuteResult, HookOptions>(
  options: CreateHookOptions<State, ExecuteResult, HookOptions>
) => {
  return (fn: (currentState: State) => State) => {
    const store = getCurrentStore();
    if (!store[options.name]) {
      store[options.name] = options.data();
    }
    const hookStore = store[options.name] as State;
    store[options.name] = fn(hookStore);
  };
};

type StateAndExecuteOptions<State, ExecuteResult, HookOptions> = Omit<
  CreateHookOptions<State, ExecuteResult, HookOptions>,
  "name"
>;

type StateOnlyOptions<State, HookOptions> = Omit<
  StateAndExecuteOptions<State, undefined, HookOptions>,
  "execute"
>;

type ExecuteOnlyOptions<ExecuteResult, HookOptions> = Omit<
  StateAndExecuteOptions<undefined, ExecuteResult, HookOptions>,
  "data"
>;

export function createHook<State, ExecuteResult, HookOptions>(
  options: StateAndExecuteOptions<State, ExecuteResult, HookOptions>
): [
  (parameters?: HookOptions) => ExecuteResult,
  (fn: (currentState: State) => State) => void
];
export function createHook<State, HookOptions>(
  options: StateOnlyOptions<State, HookOptions>
): [() => State, (fn: (currentState: State) => State) => void];
export function createHook<ExecuteResult, HookOptions>(
  options: ExecuteOnlyOptions<ExecuteResult, HookOptions>
): [(parameters?: HookOptions) => ExecuteResult, (fn: () => void) => void];
export function createHook<State, ExecuteResult, HookOptions>(
  options:
    | StateOnlyOptions<State, HookOptions>
    | ExecuteOnlyOptions<ExecuteResult, HookOptions>
    | StateAndExecuteOptions<State, ExecuteResult, HookOptions>
) {
  const name = crypto.randomUUID();
  if ("data" in options && !("execute" in options)) {
    const execute = (state: State) => state;
    return [
      generateHookFunction({
        name,
        data: options.data,
        execute,
      }),
      generateUpdateHookStateFunction({
        name,
        data: options.data,
        execute,
      }),
    ];
  }
  if ("data" in options) {
    return [
      generateHookFunction({
        name,
        data: options.data,
        execute: options.execute,
      }),
      generateUpdateHookStateFunction({
        name,
        data: options.data,
        execute: options.execute,
      }),
    ];
  }

  const data = () => undefined;
  return [
    generateHookFunction({
      name,
      data,
      execute: options.execute,
    }),
    generateUpdateHookStateFunction({
      name,
      data,
      execute: options.execute,
    }),
  ];
}

export const runHookContext = async <T>(
  fn: () => Promise<T> | T
): Promise<T> => {
  const result = (await asyncLocalStorage.run({}, fn)) as T;
  return result;
};

export const resetGlobalContext = () => {
  globalStore = {};
};
