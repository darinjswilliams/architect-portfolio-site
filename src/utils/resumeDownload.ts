const DOWNLOAD_KEY = 'resume_download_history';
const MAX_DOWNLOADS = 2;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export interface DownloadCheckResult {
  allowed: boolean;
  waitMinutes?: number;
}

export function verifyAndRecordDownload(): DownloadCheckResult {
  try {
    const raw = localStorage.getItem(DOWNLOAD_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();

    // Purge expired records outside the window
    const activeTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

    if (activeTimestamps.length >= MAX_DOWNLOADS) {
      const oldestActive = activeTimestamps[0];
      const waitMinutes = Math.ceil((oldestActive + WINDOW_MS - now) / 60000);
      return { allowed: false, waitMinutes };
    }

    // Append current timestamp and save
    activeTimestamps.push(now);
    localStorage.setItem(DOWNLOAD_KEY, JSON.stringify(activeTimestamps));
    return { allowed: true };
  } catch {
    // If localStorage is completely blocked, permit single download
    return { allowed: true };
  }
}

/**
 * Streams the PDF into memory as a Blob only if limits pass.
 */
export async function downloadResumeFile(
  onLimitExceeded: (waitMinutes: number) => void,
  onError: (msg: string) => void
): Promise<void> {
  const check = verifyAndRecordDownload();

  if (!check.allowed) {
    onLimitExceeded(check.waitMinutes ?? 10);
    return;
  }

  try {
    const response = await fetch('/docs/resume.pdf');
    if (!response.ok) {
      throw new Error(`Failed to retrieve asset: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobUrl;
    tempLink.setAttribute('download', 'Darin_Williams_Resume.pdf');

    document.body.appendChild(tempLink);
    tempLink.click();

    // Clean up memory
    setTimeout(() => {
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (err) {
    onError('Unable to process download. Please connect via LinkedIn.');
  }
}