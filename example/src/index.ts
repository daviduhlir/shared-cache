import { SharedCache } from '@david.uhlir/shared-cache'
import * as clusterRaw from 'cluster'
const cluster: typeof clusterRaw.default = clusterRaw as any

/**
 * Start test
 */
;(async function() {
  if (cluster.isMaster) {

    for(let i = 0; i < 2; i++) {
      cluster.fork({ i })
    }

  } else {

    console.log('Set value')
    await SharedCache.setData(`test${process.env.i}`, 'hello world')

    console.log('Loads data', await SharedCache.getData(`test${process.env.i}`) )

  }
})()
