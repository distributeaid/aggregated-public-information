import type { Struct, Schema } from "@strapi/strapi";

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: "files";
  info: {
    singularName: "file";
    pluralName: "files";
    displayName: "File";
    description: "";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    width: Schema.Attribute.Integer;
    height: Schema.Attribute.Integer;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    ext: Schema.Attribute.String;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    related: Schema.Attribute.Relation<"morphToMany">;
    folder: Schema.Attribute.Relation<"manyToOne", "plugin::upload.folder"> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: "upload_folders";
  info: {
    singularName: "folder";
    pluralName: "folders";
    displayName: "Folder";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    parent: Schema.Attribute.Relation<"manyToOne", "plugin::upload.folder">;
    children: Schema.Attribute.Relation<"oneToMany", "plugin::upload.folder">;
    files: Schema.Attribute.Relation<"oneToMany", "plugin::upload.file">;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: "i18n_locale";
  info: {
    singularName: "locale";
    pluralName: "locales";
    collectionName: "locales";
    displayName: "Locale";
    description: "";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: "strapi_releases";
  info: {
    singularName: "release";
    pluralName: "releases";
    displayName: "Release";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    timezone: Schema.Attribute.String;
    status: Schema.Attribute.Enumeration<
      ["ready", "blocked", "failed", "done", "empty"]
    > &
      Schema.Attribute.Required;
    actions: Schema.Attribute.Relation<
      "oneToMany",
      "plugin::content-releases.release-action"
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: "strapi_release_actions";
  info: {
    singularName: "release-action";
    pluralName: "release-actions";
    displayName: "Release Action";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    type: Schema.Attribute.Enumeration<["publish", "unpublish"]> &
      Schema.Attribute.Required;
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    entryDocumentId: Schema.Attribute.String;
    locale: Schema.Attribute.String;
    release: Schema.Attribute.Relation<
      "manyToOne",
      "plugin::content-releases.release"
    >;
    isEntryValid: Schema.Attribute.Boolean;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: "strapi_workflows";
  info: {
    name: "Workflow";
    description: "";
    singularName: "workflow";
    pluralName: "workflows";
    displayName: "Workflow";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    stages: Schema.Attribute.Relation<
      "oneToMany",
      "plugin::review-workflows.workflow-stage"
    >;
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"[]">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: "strapi_workflows_stages";
  info: {
    name: "Workflow Stage";
    description: "";
    singularName: "workflow-stage";
    pluralName: "workflow-stages";
    displayName: "Stages";
  };
  options: {
    version: "1.1.0";
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String;
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<"#4945FF">;
    workflow: Schema.Attribute.Relation<
      "manyToOne",
      "plugin::review-workflows.workflow"
    >;
    permissions: Schema.Attribute.Relation<"manyToMany", "admin::permission">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface PluginSlugifySlug extends Struct.CollectionTypeSchema {
  collectionName: "slugs";
  info: {
    singularName: "slug";
    pluralName: "slugs";
    displayName: "slug";
  };
  options: {
    draftAndPublish: false;
    comment: "";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    slug: Schema.Attribute.Text;
    count: Schema.Attribute.Integer;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: "up_permissions";
  info: {
    name: "permission";
    description: "";
    singularName: "permission";
    pluralName: "permissions";
    displayName: "Permission";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    role: Schema.Attribute.Relation<
      "manyToOne",
      "plugin::users-permissions.role"
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: "up_roles";
  info: {
    name: "role";
    description: "";
    singularName: "role";
    pluralName: "roles";
    displayName: "Role";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Schema.Attribute.String;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    permissions: Schema.Attribute.Relation<
      "oneToMany",
      "plugin::users-permissions.permission"
    >;
    users: Schema.Attribute.Relation<
      "oneToMany",
      "plugin::users-permissions.user"
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: "up_users";
  info: {
    name: "user";
    description: "";
    singularName: "user";
    pluralName: "users";
    displayName: "User";
  };
  options: {
    timestamps: true;
    draftAndPublish: false;
  };
  attributes: {
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    role: Schema.Attribute.Relation<
      "manyToOne",
      "plugin::users-permissions.role"
    >;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiFinancialCurrencyConversion
  extends Struct.CollectionTypeSchema {
  collectionName: "currency_conversions";
  info: {
    singularName: "currency-conversion";
    pluralName: "currency-conversions";
    displayName: "Financial.CurrencyConversions";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    year: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 4;
      }>;
    month: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
          max: 12;
        },
        number
      >;
    currency: Schema.Attribute.Enumeration<
      ["USD", "GBP", "EUR", "LBP", "LTL", "RSD", "BAM"]
    > &
      Schema.Attribute.Required;
    equivalentToUSD: Schema.Attribute.Float & Schema.Attribute.Required;
    source: Schema.Attribute.String;
    notes: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiGeoCountry extends Struct.CollectionTypeSchema {
  collectionName: "countries";
  info: {
    singularName: "country";
    pluralName: "countries";
    displayName: "Geo.Country";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    Name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    Code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 3;
      }>;
    Slug: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiGeoRegion extends Struct.CollectionTypeSchema {
  collectionName: "regions";
  info: {
    singularName: "region";
    pluralName: "regions";
    displayName: "Geo.Region";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    Name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    Slug: Schema.Attribute.String;
    Map: Schema.Attribute.Media<"images">;
    Overview: Schema.Attribute.RichText;
    GovernmentResponse: Schema.Attribute.RichText;
    Subregions: Schema.Attribute.Relation<"oneToMany", "api::geo.subregion">;
    Countries: Schema.Attribute.Relation<"oneToMany", "api::geo.country">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiGeoSubregion extends Struct.CollectionTypeSchema {
  collectionName: "subregions";
  info: {
    singularName: "subregion";
    pluralName: "subregions";
    displayName: "Geo.Subregion";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    Name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    Slug: Schema.Attribute.String;
    Map: Schema.Attribute.Media<"images">;
    Overview: Schema.Attribute.RichText;
    GovernmentResponse: Schema.Attribute.RichText;
    Region: Schema.Attribute.Relation<"manyToOne", "api::geo.region">;
    Country: Schema.Attribute.Relation<"oneToOne", "api::geo.country">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiGroupGroup extends Struct.CollectionTypeSchema {
  collectionName: "groups";
  info: {
    singularName: "group";
    pluralName: "groups";
    displayName: "Group";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    shortName: Schema.Attribute.String;
    groupName: Schema.Attribute.String;
    umbrellaOrganisation: Schema.Attribute.String;
    region: Schema.Attribute.Relation<"oneToOne", "api::geo.region">;
    notes: Schema.Attribute.Text;
    groupConvertFrom: Schema.Attribute.String;
    shortNameStripped: Schema.Attribute.String;
    groupNameStripped: Schema.Attribute.Text;
    groupConvertFromStripped: Schema.Attribute.String;
    groupType: Schema.Attribute.Enumeration<
      ["Aid group", "In-Kind Donor", "Service Provider"]
    >;
    number: Schema.Attribute.Integer;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiNeedsAssessmentNeed extends Struct.CollectionTypeSchema {
  collectionName: "needs";
  info: {
    singularName: "need";
    pluralName: "needs";
    displayName: "NeedsAssessment.Need";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    survey: Schema.Attribute.Relation<
      "manyToOne",
      "api::needs-assessment.survey"
    >;
    region: Schema.Attribute.Relation<"oneToOne", "api::geo.region">;
    subregion: Schema.Attribute.Relation<"oneToOne", "api::geo.subregion">;
    item: Schema.Attribute.Relation<"oneToOne", "api::product.item">;
    need: Schema.Attribute.Integer & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiNeedsAssessmentSurvey extends Struct.CollectionTypeSchema {
  collectionName: "surveys";
  info: {
    singularName: "survey";
    pluralName: "surveys";
    displayName: "NeedsAssessment.Survey";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    year: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 4;
      }>;
    quarter: Schema.Attribute.Enumeration<["Q1", "Q2", "Q3", "Q4"]> &
      Schema.Attribute.Required;
    needs: Schema.Attribute.Relation<"oneToMany", "api::needs-assessment.need">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiProductCategory extends Struct.CollectionTypeSchema {
  collectionName: "categories";
  info: {
    singularName: "category";
    pluralName: "categories";
    displayName: "Product.Category";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    items: Schema.Attribute.Relation<"oneToMany", "api::product.item">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiProductItem extends Struct.CollectionTypeSchema {
  collectionName: "items";
  info: {
    singularName: "item";
    pluralName: "items";
    displayName: "Product.Item";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    age_gender: Schema.Attribute.String;
    size_style: Schema.Attribute.String;
    category: Schema.Attribute.Relation<"manyToOne", "api::product.category">;
    volume: Schema.Attribute.Component<"product.volume", true>;
    weight: Schema.Attribute.Component<"product.weight", true>;
    needsMet: Schema.Attribute.Component<"product.needs-met", false>;
    secondHand: Schema.Attribute.Component<"product.second-hand", false>;
    value: Schema.Attribute.Component<"product.value", true>;
    packSize: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiReportingCargo extends Struct.CollectionTypeSchema {
  collectionName: "cargos";
  info: {
    singularName: "cargo";
    pluralName: "cargos";
    displayName: "Reporting.Cargo";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    packageCount: Schema.Attribute.Integer;
    packageUnit: Schema.Attribute.Enumeration<
      [
        "Bag",
        "Medium Bag",
        "Large Bag",
        "Box",
        "Banana Box",
        "Pallet",
        "Euro Pallet",
        "Item",
        "Single Item",
      ]
    >;
    used: Schema.Attribute.Boolean;
    itemCount: Schema.Attribute.Integer;
    valueOverride: Schema.Attribute.Boolean;
    valueOverrideCurrency: Schema.Attribute.Enumeration<
      ["USD", "GBP", "EUR", "LBP", "LTL", "RSD", "BAM"]
    >;
    normalizedValuePerItem: Schema.Attribute.Decimal;
    totalNormalizedValue: Schema.Attribute.Decimal;
    valueInSendingCountry: Schema.Attribute.Decimal;
    valueInReceivingCountry: Schema.Attribute.Decimal;
    totalNeedsMet: Schema.Attribute.Decimal;
    shipment: Schema.Attribute.Relation<"manyToOne", "api::reporting.shipment">;
    item: Schema.Attribute.Relation<"oneToOne", "api::product.item">;
    sendingCountry: Schema.Attribute.Relation<"oneToOne", "api::geo.country">;
    receivingCountry: Schema.Attribute.Relation<"oneToOne", "api::geo.country">;
    countryGDPContextCostOverride: Schema.Attribute.Relation<
      "oneToOne",
      "api::geo.country"
    >;
    sender: Schema.Attribute.Relation<"oneToOne", "api::group.group">;
    receiver: Schema.Attribute.Relation<"oneToOne", "api::group.group">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiReportingMovement extends Struct.CollectionTypeSchema {
  collectionName: "movements";
  info: {
    singularName: "movement";
    pluralName: "movements";
    displayName: "Reporting.Movement";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    shipment: Schema.Attribute.Relation<"oneToOne", "api::reporting.shipment">;
    segment: Schema.Attribute.Enumeration<
      ["First Mile", "Last Mile", "Main Leg", "Main Leg-Cont"]
    >;
    pickupDate: Schema.Attribute.Date;
    dropoffDate: Schema.Attribute.Date;
    packageCount: Schema.Attribute.Integer;
    packagingType: Schema.Attribute.String;
    totalCargoVolM3: Schema.Attribute.Decimal;
    totalCargoWeightKG: Schema.Attribute.Decimal;
    vehicleCount: Schema.Attribute.Integer;
    pickUpAddress: Schema.Attribute.Text;
    dropOffAddress: Schema.Attribute.Text;
    distanceKM: Schema.Attribute.Integer;
    notes: Schema.Attribute.Text;
    deliveryMethod: Schema.Attribute.Enumeration<
      [
        "FTL",
        "LTL",
        "Box Truck",
        "Van",
        "Personal Vehicle",
        "FCL: 20 ft",
        "FCL: 40 ft",
        "FCL: 20 ft HC",
        "FCL: 40 ft HC",
        "LCL",
        "Rail",
        "Air",
      ]
    >;
    involvement: Schema.Attribute.Enumeration<
      ["Advised", "Assisted", "Organized", "Not involved"]
    >;
    serviceProvider: Schema.Attribute.Relation<"oneToOne", "api::group.group">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiReportingShipment extends Struct.CollectionTypeSchema {
  collectionName: "shipments";
  info: {
    singularName: "shipment";
    pluralName: "shipments";
    displayName: "Reporting.Shipment";
    description: "";
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    cargo: Schema.Attribute.Relation<"oneToMany", "api::reporting.cargo">;
    carrierId: Schema.Attribute.String;
    carbonOffsetPaid: Schema.Attribute.Boolean;
    CO2TonsGenerated: Schema.Attribute.Decimal;
    carbonOffsetCost: Schema.Attribute.Decimal;
    notes: Schema.Attribute.Text;
    type: Schema.Attribute.Enumeration<
      ["Regular Route", "Ad Hoc", "Aid Swap/Local Transfer", "Other"]
    >;
    DARoles: Schema.Attribute.JSON;
    sendingCountry: Schema.Attribute.Relation<"oneToOne", "api::geo.country">;
    receivingCountry: Schema.Attribute.Relation<"oneToOne", "api::geo.country">;
    number: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    project: Schema.Attribute.Enumeration<
      [
        "Covid 19",
        "Disaster Relief",
        "Moria Fire",
        "Refugee Aid - Europe",
        "Refugee Aid - Lebanon",
        "Social Enterprise Support",
        "Ukraine",
        "US ARR",
        "Other",
      ]
    >;
    importer: Schema.Attribute.Relation<"oneToOne", "api::group.group">;
    exporter: Schema.Attribute.Relation<"oneToOne", "api::group.group">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface ApiTeamMember extends Struct.CollectionTypeSchema {
  collectionName: "members";
  info: {
    singularName: "member";
    pluralName: "members";
    displayName: "Team.Member";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    Pronouns: Schema.Attribute.String;
    Profile: Schema.Attribute.Media<"images"> & Schema.Attribute.Required;
    From: Schema.Attribute.Relation<"oneToOne", "api::geo.country">;
    Bio: Schema.Attribute.RichText;
    Roles: Schema.Attribute.Component<"team.role", true> &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: "admin_permissions";
  info: {
    name: "Permission";
    description: "";
    singularName: "permission";
    pluralName: "permissions";
    displayName: "Permission";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    role: Schema.Attribute.Relation<"manyToOne", "admin::role">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: "admin_users";
  info: {
    name: "User";
    description: "";
    singularName: "user";
    pluralName: "users";
    displayName: "User";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Schema.Attribute.String;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    roles: Schema.Attribute.Relation<"manyToMany", "admin::role"> &
      Schema.Attribute.Private;
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    preferedLanguage: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: "admin_roles";
  info: {
    name: "Role";
    description: "";
    singularName: "role";
    pluralName: "roles";
    displayName: "Role";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Schema.Attribute.String;
    users: Schema.Attribute.Relation<"manyToMany", "admin::user">;
    permissions: Schema.Attribute.Relation<"oneToMany", "admin::permission">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: "strapi_api_tokens";
  info: {
    name: "Api Token";
    singularName: "api-token";
    pluralName: "api-tokens";
    displayName: "Api Token";
    description: "";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<"">;
    type: Schema.Attribute.Enumeration<["read-only", "full-access", "custom"]> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"read-only">;
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Schema.Attribute.DateTime;
    permissions: Schema.Attribute.Relation<
      "oneToMany",
      "admin::api-token-permission"
    >;
    expiresAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: "strapi_api_token_permissions";
  info: {
    name: "API Token Permission";
    description: "";
    singularName: "api-token-permission";
    pluralName: "api-token-permissions";
    displayName: "API Token Permission";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Schema.Attribute.Relation<"manyToOne", "admin::api-token">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: "strapi_transfer_tokens";
  info: {
    name: "Transfer Token";
    singularName: "transfer-token";
    pluralName: "transfer-tokens";
    displayName: "Transfer Token";
    description: "";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<"">;
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Schema.Attribute.DateTime;
    permissions: Schema.Attribute.Relation<
      "oneToMany",
      "admin::transfer-token-permission"
    >;
    expiresAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: "strapi_transfer_token_permissions";
  info: {
    name: "Transfer Token Permission";
    description: "";
    singularName: "transfer-token-permission";
    pluralName: "transfer-token-permissions";
    displayName: "Transfer Token Permission";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Schema.Attribute.Relation<"manyToOne", "admin::transfer-token">;
    createdAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    publishedAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    updatedBy: Schema.Attribute.Relation<"oneToOne", "admin::user"> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String;
  };
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ContentTypeSchemas {
      "plugin::upload.file": PluginUploadFile;
      "plugin::upload.folder": PluginUploadFolder;
      "plugin::i18n.locale": PluginI18NLocale;
      "plugin::content-releases.release": PluginContentReleasesRelease;
      "plugin::content-releases.release-action": PluginContentReleasesReleaseAction;
      "plugin::review-workflows.workflow": PluginReviewWorkflowsWorkflow;
      "plugin::review-workflows.workflow-stage": PluginReviewWorkflowsWorkflowStage;
      "plugin::slugify.slug": PluginSlugifySlug;
      "plugin::users-permissions.permission": PluginUsersPermissionsPermission;
      "plugin::users-permissions.role": PluginUsersPermissionsRole;
      "plugin::users-permissions.user": PluginUsersPermissionsUser;
      "api::financial.currency-conversion": ApiFinancialCurrencyConversion;
      "api::geo.country": ApiGeoCountry;
      "api::geo.region": ApiGeoRegion;
      "api::geo.subregion": ApiGeoSubregion;
      "api::group.group": ApiGroupGroup;
      "api::needs-assessment.need": ApiNeedsAssessmentNeed;
      "api::needs-assessment.survey": ApiNeedsAssessmentSurvey;
      "api::product.category": ApiProductCategory;
      "api::product.item": ApiProductItem;
      "api::reporting.cargo": ApiReportingCargo;
      "api::reporting.movement": ApiReportingMovement;
      "api::reporting.shipment": ApiReportingShipment;
      "api::team.member": ApiTeamMember;
      "admin::permission": AdminPermission;
      "admin::user": AdminUser;
      "admin::role": AdminRole;
      "admin::api-token": AdminApiToken;
      "admin::api-token-permission": AdminApiTokenPermission;
      "admin::transfer-token": AdminTransferToken;
      "admin::transfer-token-permission": AdminTransferTokenPermission;
    }
  }
}
