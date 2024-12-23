"use client";

import React, { createContext, useState, ReactNode } from "react";

// Định nghĩa kiểu dữ liệu cho WalletContext
interface WalletContextType {
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  userAddress: string | null;
  setUserAddress: React.Dispatch<React.SetStateAction<string | null>>;
  signer: any;
  setSigner: React.Dispatch<React.SetStateAction<any>>;
}

// Tạo context với giá trị mặc định là undefined
export const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Định nghĩa kiểu cho props của WalletContextProvider
interface WalletContextProviderProps {
  children: ReactNode;
}

/**
 * Đây là một component wrapper dùng để cung cấp trạng thái của WalletContext cho các component con (children) bên trong nó.
 */
export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        setIsConnected,
        userAddress,
        setUserAddress,
        signer,
        setSigner,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
