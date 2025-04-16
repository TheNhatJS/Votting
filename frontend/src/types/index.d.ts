declare type SearchParamProps = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

// type SearchParamProps = {
//     params: Promise<{ id: string }>;
//     searchParams: { [key: string]: string | string[] | undefined };
//   };
  