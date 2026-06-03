import { useCallback, useEffect, useState } from "react";

// The non-standardised event Chromium fires when the app is installable.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari exposes this non-standard flag instead.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export type InstallState = "unsupported" | "available" | "ios-manual" | "installed";

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferred(null);
    return choice.outcome === "accepted";
  }, [deferred]);

  let state: InstallState;
  if (installed) state = "installed";
  else if (deferred) state = "available";
  else if (isIos()) state = "ios-manual";
  else state = "unsupported";

  return { state, promptInstall };
}
