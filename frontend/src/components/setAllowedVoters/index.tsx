"use client"
import { useRouter } from "next/navigation";
import Header from "../Header";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { toast, Toaster } from "sonner";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import ContractABI from "@/data/abi.contract.json";
import { resolve } from "path";
import { useSession } from "next-auth/react";

export default function SetAllowedVoters({ id }: { id: string }) {
    const router = useRouter()

    const {data: session} = useSession();

    const [isAdmin, setIsAdmin] = useState(false);

    const [newVoters, setNewVoters] = useState<string[]>([])

    const updateVoters = async () => {
        if (newVoters.length === 0) {
            return toast.error("Danh sách người tham gia bầu cử không được để trống");
        }
        
        console.log(newVoters);
        
        try {
            const provider: any = await detectEthereumProvider();
            if(provider) {
                const ethersProvider = new ethers.BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                const ts = await contract.setAllowedVoters(id, newVoters);
                await ts.wait();

                toast.success("Cập nhật danh sách người tham gia bầu cử thành công");
                
            }
        }catch (error) {
            console.log("Error: ", error);
        }
        
        await new Promise((resolve) => setTimeout(resolve, 3000));
        router.push("/hoi-nhom-binh-chon");
    }

    const removeVoter = (index: number) => {
        setNewVoters([
            ...newVoters.filter((_, i) => i !== index)
        ]);
    };

    useEffect(() => {
        const checkAdmin = async () => {
            if (session) {
                const provider: any = await detectEthereumProvider();
                if(provider) {
                    const ethersProvider = await new ethers.BrowserProvider(provider);
                    const signer = await ethersProvider.getSigner();
                    const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                    const owner = await contract.owner();

                    if(owner.toLowerCase() === session.user.id.toLowerCase()) {
                        setIsAdmin(true);
                    }
                    else {
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
                <Toaster  position="top-right" richColors/>
                <div className="p-8 rounded-xl max-w-2xl w-full border border-gray-700 bg-black bg-opacity-65 shadow-xl z-10 backdrop-blur-sm">
                    <h2 className="text-2xl text-center font-bold uppercase mb-6">Cập Nhật Danh Sách Địa Chỉ Bầu Cử</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold" htmlFor="">Danh sách người tham gia bầu cử (address)</label>
                        <input
                            type="text"
                            className="mt-2 p-2 border rounded-md w-full text-black"
                            placeholder="Nhập địa chỉ và nhấn Enter"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                                    setNewVoters([
                                        ...newVoters,
                                        (e.target as HTMLInputElement).value
                                    ]);

                                    (e.target as HTMLInputElement).value = "";
                                }
                            }}
                        />

                        <div className="mt-2">
                            {
                                newVoters.map(
                                    (voter, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-400 px-3 py-2 rounded text-black mb-1 flex justify-between items-center"
                                        >
                                            {voter}
                                            <button
                                                className="ml-2 text-red-500"
                                                onClick={() => removeVoter(index)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )
                                )
                            }
                        </div>

                        <button
                        onClick={updateVoters}
                        className="mt-4 py-2 px-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 w-full"
                    >

                        <span>Cập nhật</span>


                    </button>
                    </div>
                </div>
            </div>
        </>
    )
}