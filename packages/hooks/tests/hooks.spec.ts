import { runHookContext } from '@backhooks/core'
import { configureHeadersHook } from '@backhooks/http'
import {useAuthorizationHeader, useBearerToken, useRequestId} from '../src/index'

test('useAuthorizationHeader', async () => {
    await runHookContext(() => {
        const authorizationHeader = useAuthorizationHeader()
        expect(authorizationHeader).not.toBeDefined()
    })

    await runHookContext(() => {
        configureHeadersHook(state => {
            return {
                ...state,
                headers: {
                    authorization: 'abcd'
                }
            }
        })
        const authorizationHeader = useAuthorizationHeader()
        expect(authorizationHeader).toBe('abcd')
    })
})

test('useBearerToken', async () => {
    await runHookContext(() => {
        const bearerToken = useBearerToken()
        expect(bearerToken).not.toBeDefined()
    })

    await runHookContext(() => {
        configureHeadersHook(state => {
            return {
                ...state,
                headers: {
                    authorization: 'Bearer abcd'
                }
            }
        })
        const bearerToken = useBearerToken()
        expect(bearerToken).toBe('abcd')
    })
})

test('useRequestId', async () => {
    await runHookContext(() => {
        const requestId = useRequestId()
        const secondRequestId = useRequestId()
        expect(typeof requestId).toBe('string')
        expect(requestId).toBe(secondRequestId)
    })
})