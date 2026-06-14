// Thin persistence interface. "Swap to Postgres" = a second implementation.
import type { Vehicle, Fill, Anchor, QuotaConfig, Profile } from "@/domain/types";

export interface Store {
  getVehicle(): Vehicle;
  listFills(): Fill[];
  addFill(f: Fill): void;
  getAnchor(): Anchor | undefined;
  setAnchor(a: Anchor): void;
  getQuotaConfig(): QuotaConfig;
  getProfile(): Profile;
}
