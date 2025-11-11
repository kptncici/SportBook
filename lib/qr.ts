import QrScanner from "qr-scanner";

// Atur path ke worker bawaan dari package (cara baru)
if (typeof window !== "undefined") {
  QrScanner.WORKER_PATH = new URL(
    "qr-scanner/qr-scanner-worker.min.js",
    import.meta.url
  ).toString();
}

export default QrScanner;
