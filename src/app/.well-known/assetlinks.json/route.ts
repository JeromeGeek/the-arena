import { NextResponse } from "next/server";

// Digital Asset Links for TWA (Trusted Web Activity) - Play Store verification
// Update the sha256_cert_fingerprints with your actual signing key fingerprint
export function GET() {
  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.thearena.app",
        sha256_cert_fingerprints: [
          // TODO: Replace with your actual keystore SHA-256 fingerprint
          // Run: keytool -list -v -keystore arena-keystore.jks -alias arena
          "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00",
        ],
      },
    },
  ]);
}
