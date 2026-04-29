/**
 * react-native-nitro-fetch@1.1.1 calls RCTInspectorNetworkReporter with NSString * IDs;
 * RN 0.81+ expects NSNumber *, so Xcode fails to compile NitroDevToolsReporter.mm.
 * Disable DevTools reporter integration (fetch still works; only RN network inspector hooks are skipped).
 */
const fs = require("node:fs");
const path = require("node:path");

const marker = "__has_include(<React/RCTInspectorNetworkReporter.h>)";
const target = path.join(
	__dirname,
	"..",
	"node_modules",
	"react-native-nitro-fetch",
	"ios",
	"NitroDevToolsReporter.mm",
);

function patch() {
	let s;
	try {
		s = fs.readFileSync(target, "utf8");
	} catch {
		return;
	}
	if (!s.includes(marker)) return;

	const replacement = `//
// RN 0.81+ changed request-id parameters (NSNumber vs NSString); nitro-fetch 1.1.1
// targets the older API and fails to compile. Disable reporter integration until upstream aligns.
#define NITRO_HAS_NETWORK_REPORTER 0`;

	const oldBlock = `#if __has_include(<React/RCTInspectorNetworkReporter.h>)
#import <React/RCTInspectorNetworkReporter.h>
#define NITRO_HAS_NETWORK_REPORTER 1
#else
#define NITRO_HAS_NETWORK_REPORTER 0
#endif`;

	if (!s.includes(oldBlock)) return;

	fs.writeFileSync(target, s.replace(oldBlock, replacement), "utf8");
	console.warn("[patch-nitro-fetch-ios] Patched NitroDevToolsReporter.mm for RN 0.81+");
}

patch();
