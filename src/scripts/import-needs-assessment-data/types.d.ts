import { UploadWorkflowStatus } from "../statusCodes";

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

export type Region = {
  region: string;
};

export type Subregion = {
  subregion: string;
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

export type ResponseHandleParams = (RegionUploadWorkflow | SubregionUploadWorkflow) & {
  response: Response,
  successMessage: string
}
