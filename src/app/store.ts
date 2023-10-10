import Dexie, { Table } from "dexie";

export interface UserMetadata {
  name?: string;
  display_name?: string;
  picture?: string;
  about?: string;
  website?: string;
  banner?: string;
  lud06?: string;
  lud16?: string;
  nip05?: string;
}

export type UserMetadataStore = UserMetadata & {
  pubkey: string;
  npub: string;
  created_at: number;
  updated_at: number;
};

export class DexieDB extends Dexie {
  users!: Table<UserMetadataStore>;

  constructor() {
    super("DexieDB");
    this.version(1).stores({
      users: "++pubkey, name, npub",
    });
  }
}

export const db = new DexieDB();
