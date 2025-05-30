import { NS } from '@ns'
import * as HackHelpers from '/Hack/HackHelpers'
import { IMiner } from '/Hack/IMiner'
export type Provider = ((host: string) => IMiner | null) | IMiner | null
function isFunctionProvider(provider: Provider): provider is (host: string) => IMiner | null {
    return typeof provider === 'function'
}
export async function BFSDistributor(ns: NS, target: string, provider: Provider) {
    const hosts = HackHelpers.ScanAllServers(ns)
    if (!hosts.valueset.has(target)) {
        ns.tprint(`ERROR: unkown target: ${target}`)
        return false
    }
    if (!ns.hasRootAccess(target)) {
        ns.tprint(`ERROR: no root access to target: ${target}`)
        return false
    }
    for (const currentHost of hosts.sorted) {
        let miner: IMiner | null = null
        if (isFunctionProvider(provider)) {
            miner = provider(currentHost)
        } else {
            miner = provider
        }
        if (miner) {
            miner.run()
        }
        const U = ns.getServerUsedRam(currentHost), M = ns.getServerMaxRam(currentHost)
        const shareT = Math.floor((M - U) / ns.getScriptRam("MemSharer.js"))
        if (shareT > 0) {
            ns.exec("MemSharer.js", currentHost, shareT)
        }
    }
    return true
}
