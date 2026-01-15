import { UploadWorkflowStatus } from "../_utils/statusCodes";

export type Survey = {
  reference: string;
  year: string;
  quarter: string;
};

export type Region = {
  region: string;
};

export type Subregion = {
  subregion: string;
};

export type Category = {
  category: string;
};

export type Product = {
  category: string;
  item: string;
  ageGender?: string;
  sizeStyle?: string;
  unit?: string;
  categoryId?: number;
};

export type Need = {
  survey: {
    reference: string;
    year: string;
    quarter: string;
  };
  region: string;
  subregion?: string;
  product: {
    category: string;
    item: string;
    ageGender?: string;
    sizeStyle?: string;
    unit?: string;
  };
  amount: number;
};

export type NeedAssessment = {
  id: string;
  survey: {
    id: string;
    year: string;
    quarter: string;
    url: string;
    format: string;
  };
  place: {
    region: string;
    subregion?: string;
  };
  product: {
    category: string;
    item: string;
    ageGender?: string;
    sizeStyle?: string;
    unit: string;
  };
  need: number;
};

export type UploadWorkflow<T> = {
  data: T;
  orig: string | T; // Union type allowing either a csv string or parsed JSON object
  status: UploadWorkflowStatus;
  logs: string[];
};

export type UploadWorkflowResults<T> = {
  [Property in keyof UploadWorkflowStatus]: T[];
};

export type RegionUploadWorkflow = UploadWorkflow<Region>;
export type RegionUploadWorkflowResults = UploadWorkflowResults<Region>;

export type SubregionUploadWorkflow = UploadWorkflow<Subregion>;
export type SubregionUploadWorkflowResults = UploadWorkflowResults<Subregion>;

export type SurveyUploadWorkflow = UploadWorkflow<Survey>;
export type SurveyUploadWorkflowResults = UploadWorkflowResults<Survey>;

export type CategoryUploadWorkflow = UploadWorkflow<Category>;
export type CategoryUploadWorkflowResults = UploadWorkflowResults<Category>;

export type ProductUploadWorkflow = UploadWorkflow<Product[]>;
export type ProductUploadWorkflowResults = UploadWorkflowResults<Product[]>;

export type NeedUploadWorkflow = UploadWorkflow<Need[]>;
export type NeedUploadWorkflowResults = UploadWorkflowResults<Need[]>;

export type StrapiRegion = {
  name: string,
  id: number,
  documentId: string
}

export type StrapiSubregion = {
  name: string,
  id: number,
  documentId: string
}

export type StrapiSurvey = {
  reference: string,
  yearQuarter: string,
  id: number,
  documentId: string
}

export type StrapiCategory = {
  name: string,
  id: number,
  documentId: string
}

export type StrapiProduct = {
  name: string,
  id: number,
  documentId: string,
  category: {
    id: number,
    name: string
  }
  ageGender?: string;
  sizeStyle?: string;
}