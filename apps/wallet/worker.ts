import * as Comlink from 'comlink'
import init, {
  Prover,
  Presentation,
  NotaryServer,
  Transcript
} from 'tlsn-js'

const exports = {
  init,
  Prover,
  Presentation,
  NotaryServer,
  Transcript
}

Comlink.expose(exports)

export type WorkerExports = typeof exports