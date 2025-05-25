export interface SearchItem {
  id: number;
  title: string;
  description: string;
  avatar: string;
  data: {
    accountId: number;
    isCommercial: boolean;
    address: string;
    buildingType: string;
    roomsCount: number;
    residentsCount: number;
    totalArea: number | null;
    consumption: Record<string, number>;
    is_commercial_prob: number;
  };
}

export const fetchSearchItems = async (page: number = 1, perPage: number = 10): Promise<SearchItem[]> => {
  const response = await fetch(`http://localhost:8000/consumers/?page=${page}&per_page=${perPage}`);
  if (!response.ok) throw new Error('Failed to fetch search items');
  return response.json();
};

export const fetchConsumer = async (accountId: number) => {
  const response = await fetch(`http://localhost:8000/dashboard/${accountId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch consumer');
  }
  return response.json();
};