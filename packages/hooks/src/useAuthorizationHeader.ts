import {createHook} from '@backhooks/core'
import {useHeaders} from '@backhooks/http'

const [
    useAuthorizationHeader,
    configureAuthorizationHeaderHook
] = createHook({
    name: '@backhooks/hooks/useAuthorizationHeader',
    data () {
        const headers = useHeaders()
        return {
            header: headers['authorization']
        }
    },
    execute (state) {
        return state.header
    }
})

export {
    useAuthorizationHeader,
    configureAuthorizationHeaderHook
}