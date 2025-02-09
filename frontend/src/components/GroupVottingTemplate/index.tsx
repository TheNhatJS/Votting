"use client";

import { useEffect, useState } from "react";
import Header from "../Header";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import detectEthereumProvider from "@metamask/detect-provider";
import ContractABI from "@/data/abi.contract.json";
import { ethers } from "ethers";
import Link from "next/link";
import getIpfsUrlFromPinata from "@/app/api/upload/image/utils";
import { time } from "console";
import { toast, Toaster } from "sonner";
import { resolve } from "path";
import Waiting from "../share/Waiting";

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isAdmin, setAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [electionToDelete, setElectionToDelete] = useState<string | null>(null);

    const [isWaiting, setIsWaiting] = useState(false);


    type Elections = {
        id: string,
        name: string,
        imageUrlElection: string,
        describe: string,
        endTime: number,
        candidates: string[]
    }
    const [getAllElection, setAllElection] = useState<Elections[]>([]);

    const fetchElectionList = async () => {
        console.log("đang lấy dữ liệu")
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
                    imageUrlElection: getIpfsUrlFromPinata(election.imageUrlElection),
                    describe: election.describe,
                    endTime: Number(election.endTime),
                    candidates: election.candidates
                }));

                console.log(formattedElections);

                setAllElection(formattedElections.reverse());
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching elections:", error);
            setLoading(false);
        }
    };

    const deleteElection = async (electionId: string) => {
        setElectionToDelete(electionId);
        setIsModalOpen(true);
    }

    const cofirmDeleteElection = async () => {
        if (!electionToDelete) return;

        try {
            setIsWaiting(true);
            const provider: any = await detectEthereumProvider();
            if (provider) {
                const ethersProvider = new ethers.BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                const del = await contract.deleteElection(electionToDelete);

                await del.wait();

                const elections: Elections[] = await contract.getAllElections();

                const formattedElections: Elections[] = elections.map((election: any) => ({
                    id: election.idElection,
                    name: election.name,
                    imageUrlElection: getIpfsUrlFromPinata(election.imageUrlElection),
                    describe: election.describe,
                    endTime: Number(election.endTime),
                    candidates: election.candidates
                }));

                console.log(formattedElections);

                setAllElection(formattedElections.reverse());

                setIsWaiting(false);

                setIsModalOpen(false);

                toast.success("Xóa cuộc bầu cử thành công!");

            }
        } catch (error) {
            console.error("Error deleting election:", error);
            setIsWaiting(false);
        }
    }

    const cancelDeleteElection = () => {
        setIsModalOpen(false);
    }

    useEffect(() => {
        fetchElectionList();
    }, []);

    useEffect(() => {
        if (getAllElection.length > 0) {
            const updateCountDown = () => {
                const currentTime = Math.floor(Date.now() / 1000);
                const newTimeLeft = getAllElection.reduce((acc, election) => {
                    const endTime = election.endTime;
                    const realTime = endTime - currentTime;
                    acc[election.id] = realTime > 0 ? realTime : 0;
                    return acc;
                }, {} as { [key: string]: number });

                setTimeLeft(newTimeLeft);
            };

            updateCountDown();

            const interval = setInterval(() => {
                updateCountDown();
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [getAllElection]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

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
                <Toaster position="top-right" richColors />
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-20">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <h3 className="text-xl font-semibold mb-4 text-center">Bạn chắc chắn muốn xóa cuộc bầu cử này?</h3>
                            <div className="flex justify-center items-center">
                                {
                                    isWaiting ? (
                                        <button
                                            onClick={cofirmDeleteElection}
                                            disabled
                                            className="bg-green-500 text-white py-2 px-16 rounded-lg hover:bg-green-600 transition duration-200">
                                            <Waiting />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={cofirmDeleteElection}
                                                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200 mr-16">
                                                Yes
                                            </button>
                                            <button
                                                onClick={cancelDeleteElection}
                                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200">
                                                No
                                            </button>
                                        </>
                                    )
                                }

                            </div>
                        </div>
                    </div>
                )}

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
                        <>

                            {getAllElection.length === 0 ? (
                                <p className="text-center">Chưa có cuộc bầu cử nào!</p>
                            ) : (
                                <div className="h-[32rem] overflow-y-auto  rounded-lg scroll-smooth scrollbar-thin scrollbar-thumb scrollbar-track">
                                    <ul className="space-y-4 rounded-lg ">
                                        {getAllElection.map((election, index) => (
                                            <li key={election.id} className="p-4 border bg-slate-800 bg-opacity-70 backdrop-blur-sm border-gray-700 rounded-lg transition duration-300">
                                                <h3 className="text-lg font-semibold">{index + 1}. {election.name}</h3>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex w-2/3">
                                                        <img
                                                            src={election.imageUrlElection}
                                                            alt={"Ảnh cuộc bầu cử"}
                                                            className="w-64 h-48 object-cover rounded-lg mb-2 "
                                                        />
                                                        <div className="w-3/4 ml-4">
                                                            <p className="text-[#b7bdc6]">Mô tả: {election.describe}</p>
                                                            <p className={`${timeLeft[election.id] === 0 ? "text-red-600" : "text-[#b7bdc6]"}`}>{timeLeft[election.id] === 0 ? "Cuộc bầu cử đã kết thúc!" : "Thời gian: " + formatTime(timeLeft[election.id])}</p>
                                                            <h4 className="text-md font-semibold mb-2 text-gray-300">Danh sách cử tri:</h4>
                                                            <div className=" overflow-y-auto border border-gray-700 rounded-lg p-2 custom-scrollbar w-2/3 mb-4">
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
                                                        </div>
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
                                                                    <button
                                                                        disabled={timeLeft[election.id] === 0}
                                                                        className={`opacity-70 mt-2 py-2 px-4 w-60 bg-lime-700 text-white rounded-lg  transition duration-200
                                                                    ${timeLeft[election.id] === 0 ? "cursor-not-allowed" : "hover:bg-lime-400 hover:opacity-100"}`}
                                                                    >
                                                                        Sửa cử tri
                                                                    </button>
                                                                </Link>
                                                                <Link href={`/sua-dia-chi-bau-cu/${election.id}`} title={election.name}>
                                                                    <button
                                                                        disabled={timeLeft[election.id] === 0}
                                                                        className={`opacity-70 mt-2 py-2 px-4 w-60 bg-yellow-500 text-white rounded-lg  transition duration-200 
                                                                ${timeLeft[election.id] === 0 ? "cursor-not-allowed" : "hover:bg-yellow-300 hover:opacity-100"}`}
                                                                    >
                                                                        Sửa địa chỉ bình chọn
                                                                    </button>
                                                                </Link>
                                                                <button
                                                                    onClick={() => deleteElection(election.id)}
                                                                    className="opacity-70 mt-2 py-2 px-4 w-60 bg-red-700 text-white rounded-lg hover:bg-red-500 hover:opacity-100 transition duration-200">
                                                                    Xóa cuộc bình chọn
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </>
                    )}
                </div>
            </div>
        </>
    );
}