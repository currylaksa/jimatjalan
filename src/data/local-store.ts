// Local-first, in-memory implementation of the Store (no hosted DB).
import type { Vehicle, Fill, Anchor, QuotaConfig, Profile } from "@/domain/types";
import type { Store } from "./store";
import { seedVehicle, seedQuotaConfig, seedAnchor, seedFills, seedProfile } from "./seed";

class LocalStore implements Store {
  private vehicle: Vehicle = seedVehicle;
  private config: QuotaConfig = seedQuotaConfig;
  private anchor: Anchor | undefined = seedAnchor;
  private fills: Fill[] = [...seedFills];
  private profile: Profile = seedProfile;

  getVehicle() { return this.vehicle; }
  listFills() { return this.fills; }
  addFill(f: Fill) { this.fills.push(f); }
  getAnchor() { return this.anchor; }
  setAnchor(a: Anchor) { this.anchor = a; }
  getQuotaConfig() { return this.config; }
  getProfile() { return this.profile; }
}

// Module-singleton: one Demo Account per server process.
export const store: Store = new LocalStore();
