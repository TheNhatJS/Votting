// import GroupVottingDetailTemplate from '@/components/GroupVottingDetailTemplate';

// export default function GroupVotingDetailPage({params}: SearchParamProps) {
//     const { id } = params;
//     return <GroupVottingDetailTemplate id={String(id) || ""}/>;
// }

import GroupVottingDetailTemplate from '@/components/GroupVottingDetailTemplate';
 
export default async function GroupVotingDetailPage({ params }: SearchParamProps) {
    const id = (await params)?.id;
  
    return <GroupVottingDetailTemplate id={id || ''} />;
  }
