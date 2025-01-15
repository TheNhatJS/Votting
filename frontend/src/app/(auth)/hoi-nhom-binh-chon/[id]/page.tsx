import GroupVottingDetailTemplate from '@/components/GroupVottingDetailTemplate';

export default function GroupVotingDetailPage({params}: SearchParamProps) {
    const { id } = params;
    return <GroupVottingDetailTemplate id={String(id) || ""}/>;
}