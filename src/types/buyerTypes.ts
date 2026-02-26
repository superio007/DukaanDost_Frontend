export interface IBuyer {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBuyerDTO {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface UpdateBuyerDTO {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface BuyerFilters {
  name?: string;
  email?: string;
}

export interface BuyersResponse {
  buyers: IBuyer[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ActiveBuyer {
  _id: string;
  name: string;
  contactPerson: string;
}
