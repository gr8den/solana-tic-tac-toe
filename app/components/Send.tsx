import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import React, { FC, useCallback } from 'react';
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { IDL } from "../types/solana_tic_tac_toe";


export const Send: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const anchorWallet = useAnchorWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports: Math.round(0.001 * LAMPORTS_PER_SOL),
            })
        );

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed');
    }, [publicKey, sendTransaction, connection]);

    const startGame = useCallback(async () => {
        if(!anchorWallet) return;

        anchor.setProvider(new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions()));

        // anchor.getProvider().
        // const program = anchor.workspace.SolanaTicTacToe as Program<SolanaTicTacToe>;
        const programId = new PublicKey('9163nkVWAADRHwSsK4NsbXEZ7UvqWXTR4inGDfustd5v');
        const program = new Program(IDL, programId);

        // const playerOne = (program.provider as anchor.AnchorProvider).wallet;
        const gameKeypair = anchor.web3.Keypair.generate();
        const playerTwo = anchor.web3.Keypair.generate();

        console.log('wallet', anchorWallet.publicKey);
        console.log('game', gameKeypair.publicKey);
        console.log('player two', gameKeypair.publicKey);

        await program.methods.startGame(playerTwo.publicKey)
            .accounts({
                game: gameKeypair.publicKey,
                playerOne: anchorWallet.publicKey,
            })
            .signers([gameKeypair])
            .rpc();
    }, [anchorWallet, connection]);

    return (
        <>
            <button onClick={onClick} disabled={!publicKey}>
                Send 1 lamport to a random address!
            </button>
            <button onClick={startGame} disabled={!anchorWallet}>
                Start game
            </button>
        </>
    );
};
