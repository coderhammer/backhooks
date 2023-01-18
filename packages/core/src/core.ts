import { AsyncLocalStorage } from "node:async_hooks";
import * as crypto from "node:crypto";
import type { Optional } from "utility-types";

const asyncLocalStorage = new AsyncLocalStorage();

const globalStore = {};

interface CreateHookOptions<
  State extends Record<string, any>,
  ExecuteResult,
  HookOptions
> {
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

export const createHook = <State, ExecuteResult, HookOptions>(
  options: Optional<
    Omit<CreateHookOptions<State, ExecuteResult, HookOptions>, "name">,
    "data"
  >
): [
  (parameters?: HookOptions) => ExecuteResult,
  (fn: (currentState: State) => State) => void
] => {
  const name = crypto.randomUUID();
  const data = options.data || (() => ({} as State));
  return [
    generateHookFunction({
      ...options,
      name,
      data,
    }),
    generateUpdateHookStateFunction({
      ...options,
      name,
      data,
    }),
  ];
};

export const runHookContext = async <T>(
  fn: () => Promise<T> | T
): Promise<T> => {
  const result = (await asyncLocalStorage.run({}, fn)) as T;
  return result;
};
