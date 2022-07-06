import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { expect } from 'chai';
import { SolanaTicTacToe } from "../target/types/solana_tic_tac_toe";

describe("solana-tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaTicTacToe as Program<SolanaTicTacToe>;

  it('must start game', async() => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();

    await program.methods.startGame(playerTwo.publicKey)
      .accounts({
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
      })
      .signers([gameKeypair])
      .rpc();

    const game = await program.account.game.fetch(gameKeypair.publicKey);

    expect(game.turn).to.eq(1);
    expect(game.players).to.eql([playerOne.publicKey, playerTwo.publicKey]);
    expect(game.status).to.eql({ active: {} });
    expect(game.board).to.eql([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
  });

  // todo: win, tie, error
});
