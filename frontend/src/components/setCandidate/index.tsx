"use client";

import { useEffect, useState } from "react";
import Header from "../Header";
import { uploadFileToIPFS } from "@/app/api/upload/image/route";
import { FaTrash } from "react-icons/fa6";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import ContractABI from "@/data/abi.contract.json";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { resolve } from "path";
import { useSession } from "next-auth/react";
import Waiting from "../share/Waiting";

type setCandidateData = {
    newCandidate: string[],
    newImageUrl: string[]
}

export default function SetCandidateTemplate({ id }: { id: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    const [NewCandidate, setNewCandidate] = useState<setCandidateData>(
        {
            newCandidate: [],
            newImageUrl: []
        }
    );

    async function onFileChangeCandidate(e: React.ChangeEvent<HTMLInputElement>, index: number) {
        const file = e.target.files?.[0];
        if (file) {
            const data = new FormData();
            data.set("file", file);
            const res: any = await uploadFileToIPFS(data);
            console.log("res: ", res.pinataURL);
            if (res.success) {
                const newImageUrll = [...NewCandidate.newImageUrl];
                newImageUrll[index] = res.pinataURL;
                setNewCandidate(
                    {
                        ...NewCandidate,
                        newImageUrl: newImageUrll
                    }
                );
                //console.log("New image URL: ", NewCandidate.newImageUrl);

            } else {
                console.log(res.message);
            }
        }
    }

    const removeCandidate = (index: number) => {
        setNewCandidate({
            ...NewCandidate,
            newCandidate: NewCandidate.newCandidate.filter((_, i) => i !== index),
            newImageUrl: NewCandidate.newImageUrl.filter((_, i) => i !== index)
        });
    };

    const updateCandidate = async () => {
        try {
            setIsWaiting(true);
            //Phát hiện trình cung cấp Ethereum (Ethereum Provider) trong trình duyệt, thường là MetaMask.
            const provider: any = await detectEthereumProvider();
            if (provider) {
                const ethersProvider = new ethers.BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                if (NewCandidate.newCandidate.length !== NewCandidate.newImageUrl.length) {
                    console.error("Candidates and image URLs must match");
                    return;
                }

                const updateCandidate = await contract.setCandidates(id, NewCandidate.newCandidate, NewCandidate.newImageUrl);
                await updateCandidate.wait();

                console.log("New candidate img: ", NewCandidate.newImageUrl);
                console.log("New candidate: ", NewCandidate.newCandidate);

                setIsWaiting(false);

                toast.success("Cập nhật danh sách ứng cử viên thành công");
                await new Promise((resolve) => setTimeout(resolve, 2000));

                router.push("/hoi-nhom-binh-chon");

            }

        } catch (error) {
            setIsWaiting(false);
            console.log(error);
        }

        // console.log("New candidate img: ", NewCandidate.newImageUrl);
        // console.log("New candidate:  ", NewCandidate.newCandidate);
    }

    useEffect(() => {
        const checkAdmin = async () => {
            if (session?.user?.id) {
                const provider: any = await detectEthereumProvider();
                if (provider) {
                    const ethersProvider = new ethers.BrowserProvider(provider);
                    const signer = await ethersProvider.getSigner();
                    const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                    const owner = await contract.owner();

                    if (owner.toLowerCase() === session.user.id.toLowerCase()) {
                        setIsAdmin(true);
                    } else {
                        router.push("/hoi-nhom-binh-chon");
                    }
                }
            }
        };

        checkAdmin();
    }, [session]);

    return (
        <>
            <Header />
            <div className="flex justify-center items-center min-h-screen">
                <Toaster position="top-right" richColors />
                <div className="p-8 rounded-xl max-w-2xl w-full border border-gray-700 bg-black bg-opacity-65 shadow-xl z-10 backdrop-blur-sm">
                    <h2 className="text-2xl text-center font-bold uppercase mb-6">Cập Nhật Danh Sách Cử Tri</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold" htmlFor="">Danh sách ứng cử viên</label>
                        <input
                            className="mt-2 p-2 border rounded-md w-full text-black"
                            type="text"
                            placeholder="Nhập tên ứng cử viên và nhấn Enter"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                                    setNewCandidate({
                                        ...NewCandidate,
                                        newCandidate: [
                                            ...NewCandidate.newCandidate,
                                            (e.target as HTMLInputElement).value
                                        ],
                                        newImageUrl: [
                                            ...NewCandidate.newImageUrl,
                                            ""
                                        ]
                                    });

                                    (e.target as HTMLInputElement).value = "";
                                }
                            }}
                        />

                        <div className="mt-2">
                            {
                                NewCandidate.newCandidate.map(
                                    (candidate, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center bg-gray-400 px-3 py-2 rounded text-black mb-1"
                                        >
                                            <div className="flex flex-col">
                                                <div>{candidate}</div>
                                                <input
                                                    type="file"
                                                    onChange={(e) => onFileChangeCandidate(e, index)}
                                                />
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

                    <button
                        onClick={updateCandidate}
                        className="mt-4 py-2 px-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 w-full"
                    >
                        {
                            isWaiting ? (
                                <Waiting />
                            ) : (
                                <span>Cập nhật</span>
                            )
                        }



                    </button>
                </div>
            </div>
        </>
    );
}