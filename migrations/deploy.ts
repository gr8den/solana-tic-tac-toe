import * as anchor from "@project-serum/anchor";
import { Program } from '@project-serum/anchor';
import { makeAdminPDA, makeStatsPDA } from '../app/utils';
import { SolanaTicTacToe } from '../target/types/solana_tic_tac_toe';
import { Stats } from '../target/types/stats';

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);
  // anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaTicTacToe as Program<SolanaTicTacToe>;
  const statsProgram = anchor.workspace.Stats as Program<Stats>;

  const [statsPDA,] = await makeStatsPDA(statsProgram.programId);
  const [adminPDA,] = await makeAdminPDA(program.programId);
  const user = (statsProgram.provider as anchor.AnchorProvider).wallet;

  console.log(`initialization stats... | stats account: ${statsPDA} | admin pda: ${adminPDA} | stats programId: ${statsProgram.programId}`);

  const account = await statsProgram.account.statsData.fetchNullable(statsPDA);
  if(account) {
    console.log('account already inited');
  } else {
    await statsProgram.methods.initialize(adminPDA)
      .accounts({
        stats: statsPDA,
        payer: user.publicKey,
      })
      .signers([])
      .rpc();
  }

  console.log('done');
};
