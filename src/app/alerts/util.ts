export type ZapAlert = {
  pubkey: string;
  id: string;
  amount: number;
  content: string;
};

export const testZaps = [
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    id: "1",
    amount: 1,
    content: "",
  },
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    id: "2",
    amount: 100,
    content:
      "Sats transaction stacking sats, timestamp server address key pair hashrate UTXO hard fork?",
  },
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    id: "3",
    amount: 1000,
    content:
      "Wallet hashrate mining, hash SHA-256 hash satoshis segwit. Bitcoin Improvement Proposal public key, transaction UTXO satoshis Satoshi Nakamoto bitcoin address.",
  },
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    id: "4",
    amount: 25000,
    content:
      "Bitcoin ipsum dolor sit amet. Hashrate double-spend problem hashrate halvening genesis block inputs decentralized Bitcoin Improvement Proposal soft fork. Mempool difficulty address mempool block reward, electronic cash halvening timestamp server! Sats full node satoshis, hard fork hash sats transaction bitcoin! Hard fork peer-to-peer hash?",
  },
];
