// declare type SearchParamProps = {
//     params: { id: string; type: TransformationTypeKey };
//     searchParams: { [key: string]: string | string[] | undefined };
// };

type SearchParamProps = {
    params: Promise<{ id: string }>;
    searchParams: { [key: string]: string | string[] | undefined };
  };
  