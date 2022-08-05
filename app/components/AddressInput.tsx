import { PublicKey } from '@solana/web3.js';
import { FC, useState } from 'react';

function parseKey(s: string): PublicKey | null {
  try {
    return new PublicKey(s);
  } catch(e) {
    return null;
  }
}

export const AddressInput: FC<{
  address: PublicKey | null,
  label?: string,
  onInput: (v: PublicKey | null) => void,
}> = ({ address, label, onInput }) => {
  const [value, setValue] = useState('');
  const [savedAddress, setSavedAddress] = useState(address);

  if(address !== savedAddress) {
    setSavedAddress(address);
    setValue(address ? address.toBase58() : '');
  }

  function onInputChecked(e: any) {
    const v = e.target.value;
    const newAddress = parseKey(v)

    setValue(v);
    setSavedAddress(newAddress);
    onInput(newAddress);
  }

  return (
    <>
      <label>{label}: </label>
      <input
        type="text"
        value={value}
        onInput={onInputChecked}
      ></input>
    </>
  )
};
