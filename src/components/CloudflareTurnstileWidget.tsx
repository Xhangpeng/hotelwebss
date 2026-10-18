import React, { useEffect, useState } from 'react';
import { cloudflareTurnstile } from '../services/cloudflareTurnstile';
import { CloudflareTurnstileState } from '../types/restaurant';
import { Shield, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  variant?: 'compact' | 'expanded' | 'banner';
  onVerified?: (token: string) => void;
}

export const CloudflareTurnstileWidget: React.FC<Props> = ({ variant = 'compact', onVerified }) => {
  const [cfState, setCfState] = useState<CloudflareTurnstileState>(cloudflareTurnstile.getState());
  const [isInteractiveExecuting, setIsInteractiveExecuting] = useState(false);

  useEffect(() => {
    const unsubscribe = cloudflareTurnstile.subscribe((state) => {
      setCfState(state);
      if (state.status === 'verified' && state.token && onVerified) {
        onVerified(state.token);
      }
    });
    return unsubscribe;
  }, [onVerified]);

  const handleRefresh = async () => {
    await cloudflareTurnstile.runBackgroundChallenge(false);
  };

  const handleInteractiveCheckbox = async () => {
    setIsInteractiveExecuting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    await cloudflareTurnstile.completeInteractiveChallenge();
    setIsInteractiveExecuting(false);
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-600 font-sans-body">
        {cfState.status === 'verifying' ? (
          <span className="flex items-center gap-1.5 text-amber-700">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Cloudflare Turnstile verifying in background...</span>
          </span>
        ) : cfState.status === 'verified' ? (
          <span className="flex items-center gap-1.5 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Turnstile Verified</span>
            <span className="text-stone-400">·</span>
            <span className="font-mono text-[11px] text-stone-500">{cfState.cfRayId}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-amber-800">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Bot Defense Active</span>
          </span>
        )}
      </div>
    );
  }

  // Expanded card (for checkout modal or security transparency drawer)
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 text-xs font-sans-body shadow-xs">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Cloudflare logo icon representation */}
          <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-amber-700">
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 text-xs">Cloudflare Turnstile Anti-Abuse Shield</h4>
            <p className="text-[11px] text-stone-500">Autonomous background protection against booking bots</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={cfState.status === 'verifying'}
          className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 disabled:opacity-50"
          title="Re-run background verification"
        >
          <RefreshCw className={`w-3 h-3 ${cfState.status === 'verifying' ? 'animate-spin' : ''}`} />
          <span>Renew Token</span>
        </button>
      </div>

      {cfState.status === 'challenge_required' ? (
        <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 mb-3">
          <div className="flex items-start gap-2.5 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Interactive Verification Requested</p>
              <p className="text-[11px] text-amber-800">
                Please complete the Turnstile challenge to confirm your restaurant reservation.
              </p>
            </div>
          </div>

          {/* Authentic Cloudflare Turnstile Box */}
          <div className="bg-stone-50 border border-stone-300 rounded-md p-3 flex items-center justify-between max-w-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                onChange={handleInteractiveCheckbox}
                disabled={isInteractiveExecuting}
                className="w-5 h-5 rounded border-stone-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-stone-800 text-xs font-medium">Verify you are human</span>
            </label>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block font-mono">CLOUDFLARE</span>
              <span className="text-[9px] text-stone-400 block">Privacy · Terms</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50/80 p-2.5 rounded-lg border border-stone-100">
          <div>
            <span className="text-stone-500 block">Inspection Mode</span>
            <span className="font-medium text-stone-800 capitalize">
              {cfState.challengeType} Background Runner
            </span>
          </div>
          <div>
            <span className="text-stone-500 block">Security Bot Score</span>
            <span className="font-mono font-medium text-emerald-700">
              {cfState.botScore} (Human Verified &lt; 0.10)
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-stone-500 block">CF-Ray Edge Node</span>
            <span className="font-mono text-stone-700 truncate block">
              {cfState.cfRayId || 'DEL-EDGE-88A23...'}
            </span>
          </div>
          {cfState.token && (
            <div className="col-span-2 pt-1 border-t border-stone-200/60 flex items-center justify-between">
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Turnstile Token Active</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {cfState.verifiedAt || 'Just now'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
