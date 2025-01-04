export default function getIpfsUrlFromPinata(pinataUrl: string): string {
    const urlParts = pinataUrl.split("/");
    const lastIndex = urlParts.length - 1;
    const ipfsHash = urlParts[lastIndex];
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    return ipfsUrl;
}