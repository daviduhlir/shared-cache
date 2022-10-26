# Cache shared over all forks in cluster

## Usage

``` ts
import { SharedCache } from '@david.uhlir/shared-cache'

;(async function() {

  // sets value
  await SharedCache.setData('some-key', 'Hello world')

  // gets value
  console.log(await SharedCache.getData('some-key'))
})()
```
