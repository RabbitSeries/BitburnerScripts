/** @param {NS} ns */
export async function main(ns) {
    let target = "";
    if (ns.args.length === 1 && typeof ns.args[0] === "string") {
        target = ns.args[0];
    } else {
        target = ns.getHostname();
    }
    const initialMoney = Math.min(ns.getServerMoneyAvailable(target), ns.getServerMaxMoney(target) * 0.8);
    const securityThresh = ns.getServerMinSecurityLevel(target) * 2;
    if (!ns.hasRootAccess(target)) {
        ns.tprint("ERROR: No root access to target");
        ns.exit();
    }
    ns.tprint(`SUCCESS: Running in ${cyanStr(ns.getHostname())} targeting ${cyanStr(target)}: Monney: ${cyanStr(ns.formatNumber(initialMoney))}/${cyanStr(ns.formatNumber(ns.getServerMaxMoney(target)))}, SecurityThresh: ${cyanStr(ns.formatNumber(securityThresh))}`);
    while (true) {
        const curSecurityLevel = ns.getServerSecurityLevel(target);
        const curMoneyAvailable = ns.getServerMoneyAvailable(target);
        if (curMoneyAvailable === 0) {
            ns.tprint(`ERROR: Target(${target}) is drained`);
            ns.exit();
        }
        ns.print(`INFO Targeting:  ${target}`);
        ns.print(`INFO Current security level at: ${cyanStr(curSecurityLevel)}/${cyanStr(securityThresh)}`);
        ns.print(`INFO Current money available at: ${cyanStr(ns.formatNumber(curMoneyAvailable))}/${cyanStr(ns.formatNumber(initialMoney))}`);
        if (curSecurityLevel > securityThresh) {
            ns.print("SUCCESS Weakening")
            await ns.weaken(target);
        } else if (curMoneyAvailable < initialMoney) {
            ns.print("SUCCESS Growing")
            await ns.grow(target);
        } else {
            ns.print("SUCCESS Hacking")
            await ns.hack(target);
        }
    }
}
function cyanStr(str) {
    return `\u001b[36m${str}\u001b[0m`;
}