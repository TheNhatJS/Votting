import SetAllowedVoters from "@/components/setAllowedVoters";

export default async function SetAllowedVotersPage({params}: SearchParamProps) {
    const id = (await params)?.id;
    return <SetAllowedVoters id={id || ''}/>
}