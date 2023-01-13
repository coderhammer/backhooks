import { createHook } from "@backhooks/core";

const [useLogger] = createHook({
  name: 'useLogger',
  data () {
    return {
      requestId: Math.random().toString()
    }
  },
  execute (state) {
    return {
      debug <T>(...args: T[]) {
        return console.debug(state.requestId, ...args)
      }
    }
  }
})

export {
  useLogger
}