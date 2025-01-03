"use client";
import Header from "../Header";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import ContractABI from "@/data/abi.contract.json";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaTrash } from "react-icons/fa6";

type ElectionData = {
    name: string;
    durationInMinutes: number;
    candidates: string[];
    imageUrl: string[];
    imageUrlElection: string;
    allowedVoters: string[];
    describe: string;
};

export default function CreateElectionTemPlate() {

    const [electionData, setElectionData] = useState<ElectionData>({
        name: "",
        durationInMinutes: 1,
        candidates: [],
        imageUrl: [],
        imageUrlElection: "",
        allowedVoters: [],
        describe: "",
    });

    const removeVoter = (index: number) => {
        setElectionData({
            ...electionData,
            allowedVoters: electionData.allowedVoters.filter((_, i) => i !== index)
        });
    };

    const removeCandidate = (index: number) => {
        setElectionData({
            ...electionData,
            candidates: electionData.candidates.filter((_, i) => i !== index)
        })
    }

    return (
        <>
            <Header />
            <div className="flex justify-center items-center min-h-screen">
                <div className="p-8 rounded-xl w-full max-w-2xl border border-gray-700 mt-14 bg-black bg-opacity-65 shadow-xl z-10 backdrop-blur-sm">
                    <h2 className="text-2xl text-center font-bold uppercase mb-4 text-slate-400">Tạo Cuộc Bình Chọn</h2>
                    <div className="max-h-[550px] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb scrollbar-track p-2">
                        <div className="mb-4">
                            <label className="block text-sm font-semibold" htmlFor="">Tên cuộc bình chọn</label>
                            <input
                                className="mt-2 p-2 border rounded-md w-full text-black"
                                type="text"
                                value={electionData.name}
                                required
                                onChange={(e) => {
                                    setElectionData({
                                        ...electionData,
                                        name: e.target.value
                                    })
                                }}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold" htmlFor="">Thời gian cuộc bình chọn (phút)</label>
                            <input
                                className="mt-2 p-2 border rounded-md w-full text-black"
                                type="number"
                                min={1}
                                value={electionData.durationInMinutes}
                                onChange={(e) => {
                                    setElectionData({
                                        ...electionData,
                                        durationInMinutes: + e.target.value
                                    })
                                }}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold" htmlFor="">Danh sách ứng cử viên</label>
                            <input
                                className="mt-2 p-2 border rounded-md w-full text-black"
                                type="text"
                                placeholder="Nhập tên ứng cử viên và nhấn Enter"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                                        setElectionData({
                                            ...electionData,
                                            candidates: [
                                                ...electionData.candidates,
                                                (e.target as HTMLInputElement).value
                                            ]
                                        });

                                        (e.target as HTMLInputElement).value = "";
                                    }
                                }}
                            />

                            <div className="mt-2">
                                {
                                    electionData.candidates.map(
                                        (candidate, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center bg-gray-400 px-3 py-2 rounded text-black mb-1"
                                            >
                                                <div className="flex flex-col">
                                                    <div>{candidate}</div>
                                                    <input type="file" />
                                                </div>
                                                <button
                                                    className="text-red-500"
                                                    onClick={() => removeCandidate(index)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )
                                    )
                                }
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold" htmlFor="">Danh sách người tham gia bầu cử (address)</label>
                            <input
                                type="text"
                                className="mt-2 p-2 border rounded-md w-full text-black"
                                placeholder="Nhập địa chỉ và nhấn Enter"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                                        setElectionData({
                                            ...electionData,
                                            allowedVoters: [
                                                ...electionData.allowedVoters,
                                                (e.target as HTMLInputElement).value
                                            ]
                                        });

                                        (e.target as HTMLInputElement).value = "";
                                    }
                                }}
                            />

                            <div className="mt-2">
                                {
                                    electionData.allowedVoters.map(
                                        (address, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-400 px-3 py-2 rounded text-black mb-1 flex justify-between items-center"
                                            >
                                                {address}
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
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold" htmlFor="">URL Ảnh cuộc bầu cử</label>
                            <input
                                className="mt-2 p-2 border rounded-md w-full text-white"
                                type="file"
                                value={electionData.imageUrlElection}
                                onChange={(e) => {
                                    setElectionData({
                                        ...electionData,
                                        imageUrlElection: e.target.value
                                    })
                                }}
                            />

                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold" htmlFor="">Mô tả cuộc bầu cử</label>
                            <textarea
                                className="mt-2 p-2 border rounded-md w-full text-black"
                                value={electionData.describe}
                                onChange={(e) => {
                                    setElectionData({
                                        ...electionData,
                                        describe: e.target.value
                                    })
                                }}
                            />

                        </div>


                    </div>

                    <button
                        className="mt-4 w-full max-w-80 ml-[50%] translate-x-[-50%] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-500 transition duration-200" onClick={() => console.log(electionData)}
                    >
                        Tạo cuộc bình chọn
                    </button>

                </div>
            </div>
        </>
    )
}