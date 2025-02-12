/**
 * @packageDocumentation
 *
 * Provides strategies for resolving multiaddrs.
 */

import { getProtocol } from '../protocols-table.js'
import Resolver from './dns.js'
import type { AbortOptions, Multiaddr } from '../index.js'

const { code: dnsaddrCode } = getProtocol('dnsaddr')

/**
 * Resolver for dnsaddr addresses.
 *
 * @example
 *
 * ```typescript
 * import { dnsaddrResolver } from '@multiformats/multiaddr/resolvers'
 * import { multiaddr } from '@multiformats/multiaddr'
 *
 * const ma = multiaddr('/dnsaddr/bootstrap.libp2p.io')
 * const addresses = await dnsaddrResolver(ma)
 *
 * console.info(addresses)
 * //[
 * //  '/dnsaddr/am6.bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
 * //  '/dnsaddr/ny5.bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
 * //  '/dnsaddr/sg1.bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
 * //  '/dnsaddr/sv15.bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'
 * //]
 * ```
 */
export async function dnsaddrResolver (addr: Multiaddr, options: AbortOptions = {}): Promise<string[]> {
  const resolver = new Resolver()

  if (options.signal != null) {
    options.signal.addEventListener('abort', () => {
      resolver.cancel()
    })
  }

  const peerId = addr.getPeerId()
  const [, hostname] = addr.stringTuples().find(([proto]) => proto === dnsaddrCode) ?? []

  if (hostname == null) {
    throw new Error('No hostname found in multiaddr')
  }

  const records = await resolver.resolveTxt(`_dnsaddr.${hostname}`)

  let addresses = records.flat().map((a) => a.split('=')[1])

  if (peerId != null) {
    addresses = addresses.filter((entry) => entry.includes(peerId))
  }

  return addresses
}
