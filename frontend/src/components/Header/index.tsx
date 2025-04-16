"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import ContractABI from "@/data/abi.contract.json";
import Link from "next/link";


export default function Header() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAdmin, setAdmin] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

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

    const handleNavigation = () => {
        router.push("/hoi-nhom-binh-chon");
    };




    return (
        <header className="w-full border-b mb-5 fixed bg-zinc-900 z-50 border-none shadow-lg mt-0">
            <div className="h-[55px] max-w-screen-lg mx-auto flex items-center justify-between relative">
                <span
                    className="text-3xl font-bold text-amber-500 hover:cursor-pointer hover:text-amber-300"
                    onClick={handleNavigation}
                >
                    Votting
                </span>

                {session?.user?.id && (
                    <div className="relative">
                        <span
                            className="flex items-center cursor-pointer text-white bg-zinc-700 py-2 px-4 rounded-lg hover:bg-zinc-600"
                            onClick={() => setShowMenu((prev) => !prev)}
                        >
                            {session?.user?.id?.slice(0, 7)}...{session?.user?.id?.slice(-5)}

                            {showMenu ? (
                                <FaChevronUp className="ml-3" />
                            ) : (

                                <FaChevronDown className="ml-3" />
                            )}

                        </span>

                        {/* Menu tùy chọn */}
                        {showMenu && (
                            <div className="absolute left-0 mt-2 w-full bg-white text-black rounded-lg shadow-lg">
                                {isAdmin && (
                                    <Link href="/nhuong-quyen-owner">
                                    <button
                                        className="w-full px-4 text-center font-bold py-2 border-b-2 border-gray-700 hover:bg-amber-500 hover:rounded-t-lg transition-all"
                                    >
                                        Nhượng quyền Admin
                                    </button>
                                    </Link>
                                )}
                                <button
                                    className="w-full px-4 text-center font-bold py-2 hover:bg-red-500 hover:text-white hover:rounded-b-lg transition-all"
                                    onClick={() => {
                                        signOut({ callbackUrl: "/" });
                                    }}
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header >
    );
}
