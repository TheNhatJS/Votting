"use client";

import { useEffect, useState } from "react";
import Header from "../Header";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import detectEthereumProvider from "@metamask/detect-provider";
import ContractABI from "@/data/abi.contract.json";
import { ethers } from "ethers";
import Link from "next/link";


export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isAdmin, setAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    type Elections = {
        id: string,
        name: string,
        imageUrlElection: string,
        describe: string,
        endTime: Number,
        candidates: string[]
    }
    const [getAllElection, setAllElection] = useState<Elections[]>([]);


    const fetchElectionList = async () => {
        try {
            const provider: any = await detectEthereumProvider();
            if (provider) {
                const ethersProvider = new ethers.BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                const elections: any[] = await contract.getAllElections();

                const formattedElections: Elections[] = elections.map((election: any) => ({
                    id: election.idElection,
                    name: election.name,
                    imageUrlElection: election.imageUrlElection,
                    describe: election.describe,
                    endTime: election.endTime,
                    candidates: election.candidates
                }));

                console.log(formattedElections);

                setAllElection(formattedElections);
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to fetch elections:", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchElectionList();
    })


    useEffect(() => {
        const checkAdmin = async () => {
            if (session?.user?.id) {
                const provider: any = await detectEthereumProvider();

                if (provider) {
                    const ethersProvider = new ethers.BrowserProvider(provider);
                    const signer = await ethersProvider.getSigner();
                    try {
                        const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);
                        const ownerAddress = await contract.owner();
                        const userAddress = session.user.id;
                        if (ownerAddress.toLowerCase() === userAddress.toLowerCase()) {
                            setAdmin(true)
                        } else {
                            setAdmin(false)
                        }
                    } catch (error) {
                        console.error("Error checking Admin", error);
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
                <div className="p-8 rounded-xl w-full max-w-5xl border border-gray-700 mt-16 bg-black bg-opacity-65 shadow-xl z-10 backdrop-blur-sm">
                    <h2 className="text-2xl text-center font-bold uppercase mb-4">Danh Sách Cuộc Bình Chọn</h2>
                    <div className="mb-4 text-center">
                        {isAdmin && (
                            <Link href="/tao-cuoc-bau-cu">
                                <button className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200">
                                    Tạo Cuộc Bầu Cử
                                </button>
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <p className="text-center">Đang tải danh sách cuộc bầu cử...</p>
                    ) : (
                        <div className="h-[28rem] overflow-y-auto border border-gray-700 rounded-lg">
                            <ul className="space-y-4 rounded-lg bg-opacity-70 backdrop-blur-sm">
                                {getAllElection.map((election) => (
                                    <li key={election.id} className="p-4 border bg-slate-800 bg-opacity-70 backdrop-blur-sm border-gray-700 rounded-lg transition duration-300 flex justify-between items-center">
                                        <div className="w-2/3">
                                            <h3 className="text-lg font-semibold">{election.name}</h3>
                                            <h4 className="text-md font-semibold mb-2 text-gray-300">Danh sách cử tri:</h4>
                                            <div className="h-32 overflow-y-auto border border-gray-700 rounded-lg p-2 custom-scrollbar">
                                                {election.candidates.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {election.candidates.map((candidate, index) => (
                                                            <li key={index} className="p-2 bg-gray-800 text-gray-200 rounded-lg">
                                                                {candidate}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-gray-400">Chưa có cử tri trong danh sách.</p>
                                                )}
                                            </div>
                                            <h5 className="text-lg font-semibold">Thời gian: {String(election.endTime)}</h5>

                                            <p className="text-[#b7bdc6]">Mô tả: {election.describe}</p>
                                            <img
                                                src={'../../../public/static/image/bg.jpg'}
                                                alt={"Ảnh cuộc bầu cử"}
                                                className="w-2/3 h-32 object-contain rounded-lg mb-2"
                                            />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <Link href={`/hoi-nhom-binh-chon/${election.id}`} title={election.name}>
                                                <button className="opacity-70 mt-2 py-2 px-4 w-60 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:opacity-100 transition duration-200">
                                                    Tham gia bình chọn
                                                </button>
                                            </Link>
                                            {isAdmin && (
                                                <>
                                                    <Link href={`/sua-cu-tri/${election.id}`} title={election.name}>
                                                        <button className="opacity-70 mt-2 py-2 px-4 w-60 bg-lime-700 text-white rounded-lg hover:bg-lime-400 hover:opacity-100 transition duration-200">
                                                            Sửa cử tri
                                                        </button>
                                                    </Link>
                                                    <Link href={`/sua-dia-chi-bau-cu/${election.id}`} title={election.name}>
                                                        <button className="opacity-70 mt-2 py-2 px-4 w-60 bg-yellow-500 text-white rounded-lg hover:bg-yellow-300 hover:opacity-100 transition duration-200">
                                                            Sửa địa chỉ bình chọn
                                                        </button>
                                                    </Link>
                                                    <button
                                                        className="opacity-70 mt-2 py-2 px-4 w-60 bg-red-700 text-white rounded-lg hover:bg-red-500 hover:opacity-100 transition duration-200">
                                                        Xóa cuộc bình chọn
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
