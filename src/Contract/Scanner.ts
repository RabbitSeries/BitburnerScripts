import type { NS } from "@ns"
// Don't import {type NS} from "@ns"
// instead import type {NS} from "@ns"
export async function main(ns: NS) {
    // const servers = ScanAllServers(ns).sorted
    // for (const name of ns.codingcontract.getContractTypes()) {
    const contracts = ns.codingcontract.getContractTypes()
    const contract = ns.codingcontract.createDummyContract(contracts[contracts.length - 4])
    ns.alert(ns.codingcontract.getContract(contract).description)
    ns.rm(contract)
    // }
}