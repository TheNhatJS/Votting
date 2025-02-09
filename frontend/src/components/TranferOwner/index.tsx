"use client"

import { useRouter } from "next/navigation";
import Header from "../Header";
import ContractABI from "@/data/abi.contract.json";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import { toast, Toaster } from "sonner";
import Waiting from "../share/Waiting";

export default function TranferOwner() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);
    const [newOwner, setNewOwner] = useState<string>("");
    const [isWaiting, setIsWaiting] = useState(false);

    const handleTransferOwner = async () => {
        try {
            setIsWaiting(true);
            const provider: any = await detectEthereumProvider();
            if (provider) {
                const ethersProvider = new ethers.BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                const ts = await contract.transferOwner(newOwner);
                await ts.wait();
                setIsWaiting(false);
                toast.success("Chuyển quyền quản lí thành công");
                await new Promise((resolve) => setTimeout(resolve, 3000));
                router.push("/hoi-nhom-binh-chon");
            }
        } catch (error) {
            console.error("Error transfering owner", error);
            setIsWaiting(false);
        }
    }

    useEffect(() => {
        const checkAdmin = async () => {
            if (session) {
                const provider: any = await detectEthereumProvider();
                if (provider) {
                    const ethersProvider = new ethers.BrowserProvider(provider);
                    const signer = await ethersProvider.getSigner();
                    const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                    const ownerAddress = await contract.owner();
                    const userAddress = session.user.id;
                    if (ownerAddress.toLowerCase() === userAddress.toLowerCase()) {
                        setIsAdmin(true);
                    } else {
                        router.push("/hoi-nhom-binh-chon");
                    }
                }
            }
        }
        checkAdmin();
    }, [session])


    return (
        <>
            <Header />
            <div className="flex justify-center items-center min-h-screen">
                <Toaster position="top-right" richColors />
                <div className="p-8 rounded-xl max-w-2xl w-full border border-gray-700 bg-black bg-opacity-65 shadow-xl z-10 backdrop-blur-sm">
                    <h2 className="text-2xl text-center font-bold uppercase mb-6">Chuyển quyền quản lí</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold" htmlFor="">Địa chỉ Admin mới (address)</label>
                        <input
                            type="text"
                            className="mt-2 p-2 border rounded-md w-full text-black"
                            placeholder="Nhập địa chỉ Admin mới"
                            onChange={(e) => setNewOwner(
                                (e.target as HTMLInputElement).value
                            )}
                        />

                        <button
                            onClick={handleTransferOwner}
                            className="mt-4 py-2 px-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 w-full"
                        >
                            {
                                isWaiting ? (
                                    <Waiting />
                                ) : (
                                    <span>Chuyển quyền</span>
                                )
                            }
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}