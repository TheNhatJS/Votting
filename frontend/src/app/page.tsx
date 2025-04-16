"use client";

import Image from "next/image";
import LoadingSpinner from "../components/share/LoadingSpiner"
import { useContext, useState } from "react";
import Link from "next/link";
import detectEthereumProvider from "@metamask/detect-provider";
import { Toaster, toast } from 'sonner'
import { BrowserProvider } from "ethers";
import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);


  const connectWallet = async () => {
    const provider: any = await detectEthereumProvider();
    if (provider) {
      try {
        setIsLoading(true);
        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const currentAccount = await signer.getAddress();

        await signIn("login-with-id", {
          redirect: false,
          id: currentAccount,
        });

        const network = await ethersProvider.getNetwork();
        const chainID = network.chainId;

        const sepoliaNetworkId = "11155111";

        if (chainID.toString() !== sepoliaNetworkId) {
          toast.warning("Chú ý: chuyển MetaMask sang mạng Sepolia!");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));


      } catch (error) {
        toast.error("Lỗi khi đăng nhập!");
      }
      setIsLoading(false);
      router.push('./hoi-nhom-binh-chon');

    }
  }


  return (
    <div className="flex justify-center items-center min-h-screen">
      <Toaster position="top-right" richColors />
      <div className="p-8 rounded-xl max-w-md w-full border border-gray-700 bg-black bg-opacity-50 shadow-xl z-10 backdrop-blur-sm">
        <h2 className="text-2xl text-center font-bold mb-6">
          ĐĂNG NHẬP
        </h2>
        <div className="space-y-4">
          <button
            onClick={connectWallet}
            className="w-full space-x-2 flex items-center justify-center text-black bg-white hover:bg-gray-500 hover:cursor-pointer font-semibold py-3 rounded-xl transition duration-300"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (

              <>
                <Image
                  priority
                  width={20}
                  height={20}
                  alt=""
                  className="w-5 h-5"
                  src={`/static/image/metamask.png`}
                />
                <span>Kết nối Metamask</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}