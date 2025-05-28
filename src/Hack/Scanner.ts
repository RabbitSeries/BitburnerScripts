import { NS } from "@ns"
export default function scanAllServers(ns: NS) {
    const visited = new Set<string>();
    const queue = ["home"];
    visited.add("home");
    const BFSSorted = ["home"];
    while (queue.length > 0) {
        const current = queue.shift()!;
        for (const neighbor of ns.scan(current)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
                BFSSorted.push(neighbor);
            }
        }
    }
    return {
        sorted: BFSSorted,
        valueset: visited
    };
}