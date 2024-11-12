import type { Schema, Struct } from "@strapi/strapi";

export interface GeoLocation extends Struct.ComponentSchema {
  collectionName: "components_geo_locations";
  info: {
    displayName: "Location";
    icon: "pinMap";
  };
  attributes: {
    Country: Schema.Attribute.Relation<"oneToOne", "api::geo.country">;
    Name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductNeedsMet extends Struct.ComponentSchema {
  collectionName: "components_product_needs_mets";
  info: {
    displayName: "Needs Met";
  };
  attributes: {
    items: Schema.Attribute.Integer;
    monthlyNeedsMetPerItem: Schema.Attribute.Decimal;
    months: Schema.Attribute.Integer;
    notes: Schema.Attribute.Text;
    people: Schema.Attribute.Integer;
    type: Schema.Attribute.Enumeration<["DA", "SPHERE"]>;
  };
}

export interface ProductSecondHand extends Struct.ComponentSchema {
  collectionName: "components_product_second_hands";
  info: {
    displayName: "Second Hand";
  };
  attributes: {
    canBeUsed: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    priceAdjustment: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
  };
}

export interface ProductValue extends Struct.ComponentSchema {
  collectionName: "components_product_values";
  info: {
    displayName: "Value";
  };
  attributes: {
    countPerPackage: Schema.Attribute.Integer;
    logDate: Schema.Attribute.Date & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    packagePrice: Schema.Attribute.Decimal;
    packagePriceUnit: Schema.Attribute.Enumeration<["USD"]> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<"USD">;
    pricePerItemUSD: Schema.Attribute.Decimal;
    source: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductVolume extends Struct.ComponentSchema {
  collectionName: "components_product_volumes";
  info: {
    description: "";
    displayName: "Volume";
  };
  attributes: {
    countPerCBM: Schema.Attribute.Decimal;
    countPerPackage: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    itemVolumeCBCM: Schema.Attribute.Decimal;
    logDate: Schema.Attribute.Date & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    packageVolume: Schema.Attribute.Decimal & Schema.Attribute.Required;
    packageVolumeUnit: Schema.Attribute.Enumeration<
      ["cubic in", "cubic cm", "cubic ft", "cubic m"]
    > &
      Schema.Attribute.Required;
    source: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductWeight extends Struct.ComponentSchema {
  collectionName: "components_product_weights";
  info: {
    displayName: "Weight";
  };
  attributes: {
    countPerKg: Schema.Attribute.Decimal;
    countPerPackage: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    itemWeightKg: Schema.Attribute.Decimal;
    logDate: Schema.Attribute.Date & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    packageWeight: Schema.Attribute.Decimal & Schema.Attribute.Required;
    packageWeightUnit: Schema.Attribute.Enumeration<["lb", "oz", "g", "kg"]> &
      Schema.Attribute.Required;
    source: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TeamRole extends Struct.ComponentSchema {
  collectionName: "components_team_roles";
  info: {
    description: "";
    displayName: "Role";
    icon: "handHeart";
  };
  attributes: {
    Duration: Schema.Attribute.Component<"time.duration", false>;
    Location: Schema.Attribute.Component<"geo.location", false>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
    Type: Schema.Attribute.String;
  };
}

export interface TimeDuration extends Struct.ComponentSchema {
  collectionName: "components_time_durations";
  info: {
    displayName: "Duration";
    icon: "clock";
  };
  attributes: {
    End: Schema.Attribute.DateTime;
    Start: Schema.Attribute.DateTime & Schema.Attribute.Required;
  };
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ComponentSchemas {
      "geo.location": GeoLocation;
      "product.needs-met": ProductNeedsMet;
      "product.second-hand": ProductSecondHand;
      "product.value": ProductValue;
      "product.volume": ProductVolume;
      "product.weight": ProductWeight;
      "team.role": TeamRole;
      "time.duration": TimeDuration;
    }
  }
}
