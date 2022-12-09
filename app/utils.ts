import * as anchor from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';

export type PDA = [PublicKey, number];

export async function makeAdminPDA(programId: PublicKey): Promise<PDA> {
  return PublicKey.findProgramAddress([anchor.utils.bytes.utf8.encode('admin')], programId);
}

export async function makeStatsPDA(statsProgramId: PublicKey): Promise<PDA> {
  return PublicKey.findProgramAddress([anchor.utils.bytes.utf8.encode('stats')], statsProgramId);
}
