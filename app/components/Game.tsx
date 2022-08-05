import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { IDL } from "../types/solana_tic_tac_toe";
import { AddressInput } from './AddressInput';
import { Board } from './Board';
import { GameStatus, IBoard, Tile } from '../types/game';

const programId = new PublicKey('9163nkVWAADRHwSsK4NsbXEZ7UvqWXTR4inGDfustd5v');
type DeployStatus = 'none' | 'progress' | 'done';

export const Game: FC = () => {
    const [startStatus, setStartStatus] = useState<DeployStatus>('none');
    const [gameAddress, setGameAddress] = useState<PublicKey | null>(null);
    const [playerOneAddress, setPlayerOneAddress] = useState<PublicKey | null>(null);
    const [playerTwoAddress, setPlayerTwoAddress] = useState<PublicKey | null>(null);
    const [board, setBoard] = useState<IBoard>([
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ]);
    const [status, setStatus] = useState<GameStatus>('active');
    const [winner, setWinner] = useState<PublicKey | null>(null);
    const [turn, setTurn] = useState(0);
    const [playProgress, setPlayProgress] = useState(false);

    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();

    const isCreator = startStatus === 'done' && anchorWallet && playerOneAddress?.equals(anchorWallet.publicKey);
    const mySign = isCreator ? 'X' : 'O';
    const isMyTurn = turn % 2 === (isCreator ? 1 : 0);
    const canPlay = status === 'active' && isMyTurn;

    const provider = useMemo(() => {
        if(!anchorWallet) return;

        return new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
    }, [anchorWallet, connection]);

    useEffect(() => {
        if(!provider) return;
        anchor.setProvider(provider);
    }, [provider]);

    const program = useMemo(() => {
        if(!provider) return;

        return new Program(IDL, programId, provider);
    }, [provider]);

    async function setState(state: any) {
        const status = Object.keys(state.status)[0] as GameStatus;

        const board = (state.board as any).map((row: any) => {
            return row.map((sign: any) => sign && Object.keys(sign)[0].toUpperCase());
        });
        setBoard(board);
        setTurn(state.turn);
        setStatus(status);
        setWinner(status === 'won' ? (state.status as any).won.winner : null);
    }

    useEffect(() => {
        if(!program || !gameAddress || startStatus !== 'done') return;

        let cancelled = false;
        (async function update() {
            console.log('fetch state');
            const state = await program.account.game.fetch(gameAddress);
            if(!cancelled) {
                setState(state);
            }
        })();

        return () => {
            cancelled = true;
        }
    }, [program, gameAddress, startStatus]);

    useEffect(() => {
        if(!program || !gameAddress) return;

        const stateUpdatedListener = program.addEventListener('StateUpdated', (e) => {
            if( !gameAddress.equals(e.game) ) {
                return;
            }

            setState(e);
        });

        return () => {
            program.removeEventListener(stateUpdatedListener);
        };
    }, [program, gameAddress]);

    useEffect(() => {
        if(!program) return;

        const newGameListener = program.addEventListener('NewGame', e => {
            if(startStatus !== 'none' || gameAddress || !anchorWallet) {
                return;
            }

            if(anchorWallet.publicKey.equals(e.playerTwo)) {
                setGameAddress(v => v || e.game);
            }
        });

        return () => {
            program.removeEventListener(newGameListener);
        };
    }, [program, gameAddress, startStatus, anchorWallet]);

    const startGame = useCallback(async () => {
        if(!anchorWallet || !playerTwoAddress || !program) return;

        setStartStatus(() => 'progress');
        try {
            const gameKeypair = anchor.web3.Keypair.generate();

            await program.methods.startGame(playerTwoAddress)
                .accounts({
                    game: gameKeypair.publicKey,
                    playerOne: anchorWallet.publicKey,
                })
                .signers([gameKeypair])
                .rpc();

            setStartStatus('done');
            setGameAddress(gameKeypair.publicKey);
            setPlayerOneAddress(anchorWallet.publicKey);
            setPlayerTwoAddress(playerTwoAddress);
        } catch(err) {
            console.error('error in deploy', err);
            setStartStatus(() => 'progress');
        }
    }, [program, anchorWallet, playerTwoAddress]);

    const joinGame = useCallback(async () => {
        if(!anchorWallet || !gameAddress || !program) return;

        setStartStatus(() => 'progress');
        try {
            const state = await program.account.game.fetch(gameAddress);

            const isImPlayer = state.players[0].equals(anchorWallet.publicKey) || state.players[1].equals(anchorWallet.publicKey);
            if(!isImPlayer) throw new Error('You not player');

            setPlayerOneAddress(state.players[0]);
            setPlayerTwoAddress(state.players[1]);

            setStartStatus(() => 'done');
        } catch(err) {
            console.error('error in deploy', err);
            setStartStatus(() => 'progress');
        }
    }, [program, anchorWallet, gameAddress]);

    const play = useCallback(async (tile: Tile) => {
        try {
            setPlayProgress(true);

            const program = new Program(IDL, programId);
            await program.methods.play(tile)
                .accounts({ game: gameAddress! })
                .rpc()
        } finally {
            setPlayProgress(false);
        }
    }, [gameAddress]);

    const showStartGameEl = anchorWallet && startStatus !== 'done';
    const canStartGame = startStatus === 'none' && playerTwoAddress;
    const canJoinGame = startStatus === 'none' && gameAddress;
    const startGameEl = showStartGameEl && (
        <div>
            <h2>Start game</h2>
            <AddressInput
                label='Player two address'
                address={playerTwoAddress}
                onInput={(e) => setPlayerTwoAddress(e)}
            ></AddressInput>
            <div>
                <button onClick={startGame} disabled={!canStartGame}>
                    { startStatus === 'progress' ? 'Starting...' : 'Start game' }
                </button>
            </div>

            <h2>Join game</h2>
            <AddressInput
                label='Game ID'
                address={gameAddress}
                onInput={v => setGameAddress(v)}
            ></AddressInput>
            <div>
                <button onClick={joinGame} disabled={!canJoinGame}>
                    { startStatus === 'progress' ? 'Joining...' : 'Join' }
                </button>
            </div>
        </div>
    );

    const gameInfo = startStatus === 'done' && (
        <>
            <div>Game address: {gameAddress!.toBase58()}</div>
            <div>Players: {playerOneAddress!.toBase58()} vs {playerTwoAddress!.toBase58()}</div>
            <div>Status: {status}</div>
            <div>
                <span>Turn: {turn}</span>
                { isMyTurn && <b> (Your!)</b> }
            </div>
            <Board
                board={board}
                turnBy={isMyTurn ? mySign : null}
                disabled={!canPlay}
                onSelect={play}
            ></Board>
            { winner && <div>Winner: { winner.toBase58() }</div> }
            { playProgress && <div>Playing...</div> }
        </>
    );

    return (
        <>
            <div>ProgramId: {programId.toBase58()}</div>
            { startGameEl }
            { gameInfo }
        </>
    );
};
