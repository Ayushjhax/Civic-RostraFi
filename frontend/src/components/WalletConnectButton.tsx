"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";
import { userWalletConnect } from "@/store/userSlice";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useUser } from "@civic/auth-web3/react";

export const WalletConnectButton = () => {
  // const user = useUser();

  const { publicKey, wallet, disconnecting } = useWallet();
  console.log("wallet", wallet);
  const dispatch = useAppDispatch();
  console.log("publicKey", publicKey);

  useEffect(() => {
    if (publicKey) {
      localStorage.setItem("UserId", publicKey.toString());
      dispatch(userWalletConnect(publicKey.toString()));
    }

    if (disconnecting) {
      localStorage.removeItem("UserId");
    }
  }, [publicKey, disconnecting, dispatch]);

  return <WalletMultiButton />;
};
