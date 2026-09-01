import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedNetwork } from "./demo";
import {
  emptyState,
  type EngineState,
} from "./engine";

type RafStore = {
  dht: EngineState;
  actingAs: string | null;
  replace: (next: EngineState) => void;
  mutate: (fn: (state: EngineState) => void) => void;
  setActingAs: (pubkey: string) => void;
  reset: () => void;
  seed: () => void;
};

const MAX_LOG = 200;

function withActor(state: EngineState): { dht: EngineState; actingAs: string | null } {
  return { dht: state, actingAs: state.agents[0]?.pubkey ?? null };
}

export const useRaf = create<RafStore>()(
  persist(
    (set, get) => ({
      ...withActor(seedNetwork()),
      replace: (next) => set({ dht: next }),
      mutate: (fn) => {
        const copy: EngineState = structuredClone(get().dht);
        fn(copy);
        // The log is newest-first, display-only, and append-only. Every state
        // change passes through here, so this is the one place it needs
        // trimming; left alone it grows without bound for the life of the tab.
        if (copy.log.length > MAX_LOG) copy.log.length = MAX_LOG;
        set({ dht: copy });
      },
      setActingAs: (pubkey) => set({ actingAs: pubkey }),
      reset: () => set(withActor(emptyState())),
      seed: () => set(withActor(seedNetwork())),
    }),
    {
      // Bump this whenever DnaProperties change. The persisted state carries a
      // snapshot of the DNA, so a stale copy rejects records the current build
      // considers valid — adding the real Block 11 terms broke every already-open
      // tab until this moved to v2. v3: CounterAttestation gained attestationHash. v4: TESTED added.
      name: "raf-workbench-v4",

      // The activity log is append-only and unbounded, and it is the one part of
      // the state that never needs to survive a reload. Keeping it out of
      // storage is most of the size problem.
      partialize: (state) => ({
        dht: { ...state.dht, log: [] },
        actingAs: state.actingAs,
      }),

      // Zustand's synchronous persist path does not wrap setItem, so a full
      // quota threw QuotaExceededError straight out of the click handler: React
      // state had already advanced, the write had not, and the tab silently
      // diverged from storage until reload. Degrade instead — the demo keeps
      // working in memory, it just stops persisting.
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            return globalThis.localStorage?.getItem(name) ?? null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            globalThis.localStorage?.setItem(name, value);
          } catch {
            // Full, or storage blocked (private window, site data disabled).
            // Nothing useful to do here, and throwing would break the click.
          }
        },
        removeItem: (name) => {
          try {
            globalThis.localStorage?.removeItem(name);
          } catch {
            /* see setItem */
          }
        },
      })),
    },
  ),
);
