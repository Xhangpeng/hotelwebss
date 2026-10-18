import { CloudflareTurnstileState } from '../types/restaurant';

export class CloudflareTurnstileEngine {
  private static instance: CloudflareTurnstileEngine;
  private state: CloudflareTurnstileState = {
    status: 'unverified',
    token: null,
    cfRayId: null,
    botScore: 0.02,
    verifiedAt: null,
    challengeType: 'invisible'
  };

  private listeners: ((state: CloudflareTurnstileState) => void)[] = [];
  private autoRefreshTimer: number | null = null;

  private constructor() {
    // Start background verification immediately upon initialization
    this.runBackgroundChallenge();
  }

  public static getInstance(): CloudflareTurnstileEngine {
    if (!CloudflareTurnstileEngine.instance) {
      CloudflareTurnstileEngine.instance = new CloudflareTurnstileEngine();
    }
    return CloudflareTurnstileEngine.instance;
  }

  public getState(): CloudflareTurnstileState {
    return { ...this.state };
  }

  public subscribe(listener: (state: CloudflareTurnstileState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  /**
   * Run invisible background Turnstile challenge
   */
  public async runBackgroundChallenge(forceInteractive = false): Promise<CloudflareTurnstileState> {
    if (this.state.status === 'verifying') {
      return this.getState();
    }

    this.state = {
      ...this.state,
      status: 'verifying',
      challengeType: forceInteractive ? 'interactive' : 'invisible'
    };
    this.notify();

    // Simulate cryptographic proof-of-work & browser client entropy collection in background
    await new Promise((resolve) => setTimeout(resolve, forceInteractive ? 600 : 350));

    // Generate authentic Cloudflare Ray-ID and Turnstile verification token
    const randomHex = (len: number) =>
      Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const cfRay = `${randomHex(16)}-DEL`; // Delhi edge POP
    const timestamp = Date.now();
    const token = `0.cf_tnst_${randomHex(32)}_${timestamp.toString(36)}`;

    // In background mode, human bot score is extremely low (<0.05 is safe human)
    const botScore = Number((0.01 + Math.random() * 0.03).toFixed(3));

    this.state = {
      status: 'verified',
      token,
      cfRayId: cfRay,
      botScore,
      verifiedAt: new Date().toLocaleTimeString(),
      challengeType: forceInteractive ? 'interactive' : 'invisible'
    };
    this.notify();

    // Schedule background silent auto-refresh every 4 minutes before token expiry (Turnstile standard)
    if (this.autoRefreshTimer) {
      window.clearTimeout(this.autoRefreshTimer);
    }
    this.autoRefreshTimer = window.setTimeout(() => {
      this.runBackgroundChallenge(false);
    }, 4 * 60 * 1000);

    return this.getState();
  }

  /**
   * Simulate a bot trigger or security audit check
   */
  public triggerInteractiveChallenge() {
    this.state = {
      ...this.state,
      status: 'challenge_required',
      challengeType: 'interactive'
    };
    this.notify();
  }

  /**
   * User manually completes interactive Cloudflare checkbox challenge
   */
  public async completeInteractiveChallenge(): Promise<void> {
    await this.runBackgroundChallenge(false);
  }
}

export const cloudflareTurnstile = CloudflareTurnstileEngine.getInstance();
