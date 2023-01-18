import {runHookContext, createHook} from '../src/index'

const [useRandom, configureRandomHook] = createHook({
  data () {
    return {
      random: Math.random()
    }
  },
  execute (state) {
    return state.random
  }
})

const [useCount] = createHook({
  data () {
    return {
      count: 0
    }
  },
  execute (state) {
    state.count++
    return state.count
  }
})

const [useSpecialCount] = createHook({
  data () {
    return {
      count: 0
    }
  },
  execute (state, increment: number = 1) {
    state.count += increment
    return state.count
  }
})

test('it should be able to create a hook and configure it.', async () => {
  const firstRandom = useRandom()
  const secondRandom = useRandom()
  expect(firstRandom).toBe(secondRandom)
  
  await Promise.all([
    runHookContext(async () => {
      const thirdRandom = useRandom()
      const fourthRandom = useRandom()
      expect(thirdRandom).toBe(fourthRandom)
      expect(thirdRandom).not.toBe(firstRandom)
    }),
    runHookContext(async () => {
      const thirdRandom = useRandom()
      const fourthRandom = useRandom()
      expect(thirdRandom).toBe(fourthRandom)
      expect(thirdRandom).not.toBe(firstRandom)
    }),
    runHookContext(async () => {
      const thirdRandom = Math.random()
      configureRandomHook(state => {
        return {
          ...state,
          random: thirdRandom
        }
      })
      const fourthRandom = useRandom()
      expect(thirdRandom).toBe(fourthRandom)
    })
  ])

  const thirdRandom = Math.random()
  configureRandomHook(state => {
    return {
      ...state,
      random: thirdRandom
    }
  })
  expect(thirdRandom).toBe(useRandom())
})

test('should be able to run in a context', async () => {
  const count = await runHookContext(async () => {
    for (let i = 0; i < 5; i++) {
      useCount()
    }
    return useCount()
  })
  expect(count).toBe(6)
})

test('it should be able to use parameters', async () => {
  await runHookContext(() => {
    const random = useSpecialCount(10)
    expect(random).toBe(10)
  })
})

test('it should be able to create a hook without name', async () => {
  const [useHook] = createHook({
    execute () {
      return 'ok'
    }
  })

  const result = useHook()
  expect(result).toBe('ok')
})