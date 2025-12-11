import { useSectionLoaderStore } from "../store/sectionLoaderStore";


export const useSectionLoader = (sectionName: string) => {
  const isLoading = useSectionLoaderStore((state) => state.loadingStates[sectionName] ?? false);
  const setLoading = useSectionLoaderStore((state) => state.setLoading);

  return {
    loading: isLoading,
    setLoading: (value: boolean) => setLoading(sectionName, value),
  };
};
