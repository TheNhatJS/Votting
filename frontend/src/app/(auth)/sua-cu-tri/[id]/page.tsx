import SetCandidateTemplate from "@/components/setCandidate";
export default function SetCandidatePage({params}: SearchParamProps) {
    const { id } = params;
    return <SetCandidateTemplate id={String(id) || ""}/>;
}