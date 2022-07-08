import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/src/provider";
import { expect } from 'chai';
import { SolanaTicTacToe } from "../target/types/solana_tic_tac_toe";

describe("solana-tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaTicTacToe as Program<SolanaTicTacToe>;

  async function play(gamePub: anchor.web3.PublicKey, player: Wallet | anchor.web3.Keypair, tile: { x: number, y: number }) {
    await program.methods.play(tile)
      .accounts({game: gamePub, player: player.publicKey})
      .signers(('secretKey' in player) ? [player] : [])
      .rpc();
  }

  it('should start game', async() => {
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

  it('should win by 1st player', async () => {
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

    {
      await play(gameKeypair.publicKey, playerOne, { x: 2, y: 1 });

      const game = await program.account.game.fetch(gameKeypair.publicKey);
      expect(game.turn).to.eq(2);
      expect(game.status).to.eql({ active: {} });
      expect(game.board).to.eql([
        [null, null, null],
        [null, null, { x: {} }],
        [null, null, null],
      ]);
    }

    {
      await play(gameKeypair.publicKey, playerTwo, { x: 1, y: 1 });
      await play(gameKeypair.publicKey, playerOne, { x: 2, y: 2 });
      await play(gameKeypair.publicKey, playerTwo, { x: 0, y: 0 });
      await play(gameKeypair.publicKey, playerOne, { x: 2, y: 0 });

      const game = await program.account.game.fetch(gameKeypair.publicKey);
      expect(game.turn).to.eq(5);
      expect(game.status).to.eql({ won: { winner: playerOne.publicKey } });
      expect(game.board).to.eql([
        [{ o: {} },   null,       { x: {} }],
        [null,        { o: {} },  { x: {} }],
        [null,        null,       { x: {} }],
      ]);
    }
  });

  it('should be tie', async () => {
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

    await play(gameKeypair.publicKey, playerOne, { x: 1, y: 0 });
    await play(gameKeypair.publicKey, playerTwo, { x: 0, y: 0 });
    await play(gameKeypair.publicKey, playerOne, { x: 2, y: 0 });
    await play(gameKeypair.publicKey, playerTwo, { x: 1, y: 1 });
    await play(gameKeypair.publicKey, playerOne, { x: 0, y: 1 });
    await play(gameKeypair.publicKey, playerTwo, { x: 2, y: 1 });
    await play(gameKeypair.publicKey, playerOne, { x: 0, y: 2 });
    await play(gameKeypair.publicKey, playerTwo, { x: 1, y: 2 });
    await play(gameKeypair.publicKey, playerOne, { x: 2, y: 2 });

    const game = await program.account.game.fetch(gameKeypair.publicKey);
    expect(game.turn).to.eq(9);
    expect(game.status).to.eql({ tie: {} });
    expect(game.board).to.eql([
      [{ o: {} },   { x: {} },  { x: {} }],
      [{ x: {} },   { o: {} },  { o: {} }],
      [{ x: {} },   { o: {} },  { x: {} }],
    ]);
  });

  it('should throw at second play of same player in row', async () => {
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

    await play(gameKeypair.publicKey, playerOne, { x: 2, y: 1 });

    try {
      await play(gameKeypair.publicKey, playerOne, { x: 2, y: 2 });
      expect(false).is.true;
    } catch(_err) {
      expect(_err).instanceof(AnchorError);
      const err = _err as AnchorError;
      expect(err.program.equals(program.programId)).is.true;
      expect(err.error.errorCode.code).to.eq('NotPlayersTurn');
    }
  });
});
