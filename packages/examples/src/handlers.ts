import { useHeaders } from "@backhooks/http"
import { useLogger } from "./hooks/useLogger"

export const mainHandler = async () => {
  const logger = useLogger()
  logger.debug('Executing main handler.')
  const headers = useHeaders()
  return headers
}