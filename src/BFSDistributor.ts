import type { NS } from '@ns'
import * as HackHelpers from '/Hack/HackHelpers'
import type { IMiner } from '/Hack/IMiner'
import { isFunctionProvider, type MinerProvider } from './Hack/Providers'
export async function BFSDistributor(ns: NS, target: string, provider: MinerProvider) {
    const hosts = HackHelpers.ScanAllServers(ns)
    if (!hosts.valueset.has(target)) {
        ns.tprint(`ERROR: unkown target: ${target}`)
        return false
    }
    if (!ns.hasRootAccess(target)) {
        ns.tprint(`ERROR: no root access to target: ${target}`)
        return false
    }
    hosts.sorted.filter(s => ns.hasRootAccess(s) && ns.getServerMaxRam(s) > 0).map((currentHost) => {
        let miner: IMiner | null = null
        if (isFunctionProvider(provider.next)) {
            miner = provider.next({
                hostName: currentHost,
                targetName: target
            })
        } else {
            miner = provider.next
        }
        ns.killall(currentHost)
        if (miner) {
            miner.run()
        }
        HackHelpers.ShareOn(ns, currentHost)
    })
    return true
}
