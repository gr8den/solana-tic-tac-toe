import type { NextPage } from 'next'
import Head from 'next/head'
import { createContext, useContext, useMemo, useState } from 'react'
import { Wallet } from '../components/Wallet'
import styles from '../styles/Home.module.scss'

const Home: NextPage<{
  board: string[][],
  date: number,
}> = ({date}) => {
  return (
    <div className={styles.container}>
      <h1>Tic Tac Toe</h1>

      <div>Date: {'' + new Date(date)}</div>

      <Wallet />
    </div>
  )
}

export async function getServerSideProps() {
  return {
    props: {
      date: Date.now(),
    },
  }
}

export default Home
