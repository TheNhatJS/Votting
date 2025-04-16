"use client"

import Header from "../Header"
import detectEthereumProvider from "@metamask/detect-provider";
import ContractABI from "@/data/abi.contract.json";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "sonner";
import Waiting from "../share/Waiting";

export default function GroupVottingDetailTemplate({ id }: { id: string }) {

    const { data: session } = useSession();

    type ElectionDetail = {
        name: string,
        description: string,
        endtime: number,
        hasVoted: boolean,
        winnerName: string,
        highestVotes: number,
        allowVoters: string[],
        imageURLElection: string
    }

    type Candidate = {
        name: string,
        votes: number,
        image: string
    }

    const [electionDetail, setElectionDetail] = useState<ElectionDetail | null>(
        null
    )

    const [candidates, setCandidates] = useState<Candidate[]>([]);

    const [loadingPage, setLoadingPage] = useState<boolean>(true)

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const [waitingNameVote, setWaitingNameVote] = useState<string | null>(null);

    const fecthElectionDetail = async () => {
        try {
            //@typescript-eslint/no-explicit-any
            const provider: any = await detectEthereumProvider();
            if (provider) {
                const ethersProvider = new ethers.BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                const detailE = await contract.detailElection(id);

                setElectionDetail({
                    name: detailE[0],
                    description: detailE[1],
                    endtime: detailE[2],
                    hasVoted: detailE[3],
                    winnerName: detailE[4],
                    highestVotes: detailE[5],
                    allowVoters: detailE[6],
                    imageURLElection: detailE[7]
                })

                // @typescript-eslint/no-explicit-any
                const candidates: any = await contract.getCandidateVotes(id);
                const formattedCandidate: Candidate[] = candidates.map(
                    //@typescript-eslint/no-explicit-any
                    (candidate: any) => ({
                        name: candidate[0],
                        votes: candidate[1],
                        image: candidate[2]
                    })

                )

                setCandidates(formattedCandidate);


                setLoadingPage(false)

            }
        }
        catch (error) {
            console.error(error)
        }

    }

    const vote = async (candidate: string) => {
        setWaitingNameVote(candidate);
        try {
            //@typescript-eslint/no-explicit-any
            const provider: any = await detectEthereumProvider();

            if (provider) {
                const ethersProvider = new ethers.BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                const contract = new ethers.Contract(ContractABI.address, ContractABI.abi, signer);

                const tx = await contract.vote(id, candidate);
                await tx.wait();

                
                toast.success("Bình chọn thành công!");
                fecthElectionDetail();

            }
        } catch (error) {
            console.error(error)
            
        } finally {
            setWaitingNameVote(null);
        }
    }

    const isAllowedToVote = () => {
        if (!session?.user?.id || !electionDetail) return false;
        return electionDetail.allowVoters.includes(session.user.id);
    };

    useEffect(() => {
        if (id) {
            fecthElectionDetail()
        }
    }, [id])

    useEffect(() => {
        if (electionDetail) {
            const updateCountDown = () => {
                const currentTime = Math.floor(Date.now() / 1000);
                const endTime = Number(electionDetail.endtime);
                const realTime = endTime - currentTime;

                setTimeLeft(realTime > 0 ? realTime : 0);
            }

            updateCountDown();

            const interval = setInterval(() => {
                updateCountDown();
            }, 1000);

            return () => {
                clearInterval(interval);
            }
        }
    }, [electionDetail])

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

    const sortedCandidates = candidates.sort((a, b) => Number(b.votes) - Number(a.votes));

    return (
        <>
            <Header />

            <div className="flex justify-center items-center min-h-screen">
                <Toaster position="top-right" richColors />
                <div className="w-full max-w-5xl p-6">
                    <div className="p-8 w-full rounded-xl mt-16 bg-black bg-opacity-65 shadow-xl z-10 backdrop-blur-sm">
                        {loadingPage ? (
                            <p className="text-red-600">Đang tải chi tiết cuộc bầu cử!</p>
                        ) : (
                            <>
                                {timeLeft == 0 && (
                                    <div className="text-center p-4 mb-8 border rounded-lg shadow-md bg-green-600 text-white">
                                        <h3 className="text-2xl font-bold">
                                            🎉 Người chiến thắng 🎉
                                        </h3>
                                        <p className="text-lg mt-2">
                                            Ứng cử viên: <strong>{electionDetail?.winnerName}</strong>
                                        </p>
                                        <p className="text-lg">
                                            Số phiếu bầu: <strong>{electionDetail?.highestVotes}</strong>
                                        </p>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    {timeLeft !== null && timeLeft > 0 ? (
                                        <p className="text-lg font-medium">
                                            ⏳ Thời gian còn lại:{" "}
                                            <span className="font-bold">{formatTime(timeLeft)}</span>
                                        </p>
                                    ) : (
                                        <p className="text-lg font-medium text-red-600">
                                            ⏳ Cuộc bình chọn đã kết thúc!
                                        </p>
                                    )}
                                </div>

                                <h2 className="text-3xl text-center font-bold uppercase mb-6">
                                    {electionDetail?.name}
                                </h2>

                                <p className="text-lg mb-4">Mô tả: {electionDetail?.description}</p>


                                <img
                                    src={electionDetail?.imageURLElection}
                                    alt="Ảnh cuộc bầu cử"
                                    className="w-4/6 h-80 object-cover rounded-lg mb-6 mx-auto"
                                />

                                <p className="text-lg font-medium mb-6">Danh sách ứng cử viên:</p>

                                <ul className="flex flex-col space-y-6">
                                    {sortedCandidates.map((candidate, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center justify-between p-6 border rounded-lg shadow-md bg-slate-800 bg-opacity-70 backdrop-blur-sm hover:shadow-lg "
                                        >
                                            <div className="text-center w-16">
                                                <h2 className="text-3xl font-bold text-cyan-400">
                                                    {index + 1}
                                                </h2>
                                            </div>

                                            <div className="flex-1 px-4">
                                                <h3 className="text-xl font-semibold mb-2">
                                                    {candidate.name}
                                                </h3>
                                                <img
                                                    src={candidate.image}
                                                    alt={candidate.name}
                                                    className="w-24 h-24 object-cover rounded-lg mb-2"
                                                />
                                                <p className="text-lg">
                                                    Số lượng phiếu bầu:{" "}
                                                    <strong>{candidate.votes}</strong>
                                                </p>
                                            </div>

                                            <div className="flex-shrink-0">
                                                <button
                                                    onClick={() => vote(candidate.name)}
                                                    className={`py-2 px-6 w-60
                                                         rounded font-bold text-white 
                                                        ${Math.floor(Date.now() / 1000) > Number(electionDetail?.endtime) || electionDetail?.hasVoted || !isAllowedToVote()
                                                            ? "bg-gray-500 cursor-not-allowed"
                                                            : "bg-cyan-600 hover:bg-cyan-400"
                                                        }`}
                                                    disabled={
                                                        Math.floor(Date.now() / 1000) > Number(electionDetail?.endtime) || electionDetail?.hasVoted || !isAllowedToVote()
                                                    }
                                                >
                                                    {
                                                        waitingNameVote === candidate.name ? (
                                                            <Waiting />
                                                        ) : (
                                                            Math.floor(Date.now() / 1000) > Number(electionDetail?.endtime)
                                                                ? "Cuộc bình chọn đã kết thúc"
                                                                : electionDetail?.hasVoted
                                                                    ? "Bạn đã bình chọn"
                                                                    : !isAllowedToVote()
                                                                        ? "Bạn không có quyền bình chọn"
                                                                        : "Bình chọn"
                                                        )
                                                    }
                                                </button>

                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}