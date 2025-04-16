// import GroupVottingDetailTemplate from '@/components/GroupVottingDetailTemplate';

// export default function GroupVotingDetailPage({params}: SearchParamProps) {
//     const { id } = params;
//     return <GroupVottingDetailTemplate id={String(id) || ""}/>;
// }

import GroupVottingDetailTemplate from '@/components/GroupVottingDetailTemplate';

type SearchParamProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function GroupVotingDetailPage({ params }: SearchParamProps) {
    const resolvedParams = await params; // Đảm bảo params được resolve
    const { id } = resolvedParams;
  
    return <GroupVottingDetailTemplate id={id || ''} />;
  }
