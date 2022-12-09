import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/src/provider";
import { expect } from 'chai';
import { Stats } from '../target/types/stats';
import { SolanaTicTacToe } from "../target/types/solana_tic_tac_toe";
import { makeAdminPDA, makeStatsPDA } from '../app/utils';

describe("solana-tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaTicTacToe as Program<SolanaTicTacToe>;
  const statsProgram = anchor.workspace.Stats as Program<Stats>;

  async function play(gamePub: anchor.web3.PublicKey, player: Wallet | anchor.web3.Keypair, tile: { x: number, y: number }) {
    await program.methods.play(tile)
      .accounts({game: gamePub, player: player.publicKey})
      .signers(('secretKey' in player) ? [player] : []) // auto signed by wallet
      .rpc();
  }

  async function initStats(forceInit = false) {
    const user = (statsProgram.provider as anchor.AnchorProvider).wallet;
    const adminPDA = await makeAdminPDA(program.programId);
    const statsPDA = await makeStatsPDA(statsProgram.programId);

    const account = await statsProgram.account.statsData.fetchNullable(statsPDA[0]);

    if(forceInit || account === null) {
      await statsProgram.methods.initialize(adminPDA[0])
        .accounts({
          stats: statsPDA[0],
          // payer
        })
        .signers([])
        .rpc();
    }

    return { adminPDA, statsPDA };
  }

  async function startGame() {
    const { adminPDA, statsPDA } = await initStats();
    return startGameEx();
  }

  async function startGameEx() {
    const adminPDA = await makeAdminPDA(program.programId);
    const statsPDA = await makeStatsPDA(statsProgram.programId);

    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();

    await program.methods.startGame(playerTwo.publicKey, adminPDA[1])
      .accounts({
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
        stats: statsPDA[0],
        statsProgram: statsProgram.programId,
        admin: adminPDA[0],
      })
      .signers([gameKeypair])
      .rpc();

    return {
      gameKeypair,
      playerOne,
      playerTwo,
      statsPDA,
      adminPDA,
    }
  }

  it('should start game', async() => {
    const  {
      gameKeypair,
      playerOne,
      playerTwo,
    } = await startGame();

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
    const  {
      gameKeypair,
      playerOne,
      playerTwo,
    } = await startGame();

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
    const  {
      gameKeypair,
      playerOne,
      playerTwo,
    } = await startGame();

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
    const  {
      gameKeypair,
      playerOne,
      playerTwo,
    } = await startGame();

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

  it('should inc games count stats', async () => {
    const  {
      adminPDA,
      statsPDA,
    } = await startGame();

    const countBefore = await statsProgram.account.statsData.fetch(statsPDA[0]).then(o => o.gamesCount.toNumber());

    await startGameEx();

    {
      const stats = await statsProgram.account.statsData.fetch(statsPDA[0]);
      expect(stats.gamesCount.toNumber()).to.eq(countBefore + 1);
    }
  });

  it('cant directly modify stats', async () => {
    const { statsPDA } = await startGame();

    const countBefore = await statsProgram.account.statsData.fetch(statsPDA[0]).then(o => o.gamesCount.toNumber());

    try {
      await statsProgram.methods.incGamesCount()
        .accounts({
          stats: statsPDA[0],
        })
        .signers([])
        .rpc();

      throw new Error('should throw before');
    } catch(_err) {
      expect(_err).instanceof(AnchorError);
      const err = _err as AnchorError;
    }

    {
      const stats = await statsProgram.account.statsData.fetch(statsPDA[0]);
      expect(stats.gamesCount.toNumber()).to.eq(countBefore);
    }
  });

  it('throw at double init of stats', async () => {
    await initStats();
    try {
      await initStats(true);
      throw new Error('should throw before');
    } catch(err) {
      expect('logs' in err).to.be.true;
      expect(err.logs.some(s => s.includes('already in use'))).to.be.true;
    }
  });
});
