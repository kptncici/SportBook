declare type LayoutProps<T extends string = string> = {
  children: React.ReactNode;
  params: Record<string, any>;
};
