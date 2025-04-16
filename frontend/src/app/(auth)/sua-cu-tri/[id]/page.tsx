import SetCandidateTemplate from "@/components/setCandidate";
export default async function SetCandidatePage({params}: SearchParamProps) {
    const id  = (await params)?.id;
    return <SetCandidateTemplate id={id || ''}/>;
}