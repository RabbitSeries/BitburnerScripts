import type { NS } from "@ns";
export async function main(ns: NS) {
    // const servers = ScanAllServers(ns).sorted
    // for (const name of ns.codingcontract.getContractTypes()) {
    const contract = ns.codingcontract.createDummyContract(ns.codingcontract.getContractTypes()[0])
    ns.tprint(ns.codingcontract.getContract(contract).description)
    ns.rm(contract)
    // }
}