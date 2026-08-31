import { create } from "zustand";
import { persist } from "zustand/middleware";
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
      // tab until this moved to v2.
      name: "raf-workbench-v2",
    },
  ),
);
