import SetAllowedVoters from "@/components/setAllowedVoters";

export default function SetAllowedVotersPage({params}: SearchParamProps) {
    const {id} = params;
    return <SetAllowedVoters id={String(id) || ""}/>
}