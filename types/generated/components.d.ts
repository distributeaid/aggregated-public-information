import type { Schema, Attribute } from '@strapi/strapi';

export interface GeoLocation extends Schema.Component {
  collectionName: 'components_geo_locations';
  info: {
    displayName: 'Location';
    icon: 'pinMap';
  };
  attributes: {
    Name: Attribute.String & Attribute.Required;
    Country: Attribute.Relation<'geo.location', 'oneToOne', 'api::geo.country'>;
  };
}

export interface ProductNeedsMet extends Schema.Component {
  collectionName: 'components_product_needs_mets';
  info: {
    displayName: 'Needs Met';
    description: '';
  };
  attributes: {
    Items: Attribute.Integer;
    People: Attribute.Integer;
    Type: Attribute.Enumeration<['DA', 'SPHERE']>;
    Months: Attribute.Integer;
    MonthlyNeedsMetPerUnit: Attribute.Decimal;
    Notes: Attribute.Text;
  };
}

export interface ProductSecondHand extends Schema.Component {
  collectionName: 'components_product_second_hands';
  info: {
    displayName: 'Second Hand';
    description: '';
  };
  attributes: {
    canBeUsed: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    priceAdjustment: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 100;
        },
        number
      > &
      Attribute.DefaultTo<100>;
  };
}

export interface ProductValue extends Schema.Component {
  collectionName: 'components_product_values';
  info: {
    displayName: 'Value';
    description: '';
  };
  attributes: {
    Price: Attribute.Decimal;
    Count: Attribute.Integer;
    PricePerUnit: Attribute.Decimal;
    PricingSource: Attribute.String;
    LogDate: Attribute.Date;
    Notes: Attribute.Text;
  };
}

export interface ProductVolume extends Schema.Component {
  collectionName: 'components_product_volumes';
  info: {
    displayName: 'Volume';
    description: '';
  };
  attributes: {
    packageVolume: Attribute.Decimal & Attribute.Required;
    volumeUnit: Attribute.Enumeration<
      ['cubic in', 'cubic cm', 'cubic ft', 'cubic m']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'cubic in'>;
    countPerPackage: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Attribute.DefaultTo<1>;
    itemVolumeCBCM: Attribute.Decimal;
    countPerCBM: Attribute.Decimal;
    volumeSource: Attribute.String & Attribute.Required;
    logDate: Attribute.Date & Attribute.Required;
    notes: Attribute.Text;
  };
}

export interface ProductWeight extends Schema.Component {
  collectionName: 'components_product_weights';
  info: {
    displayName: 'Weight';
    description: '';
  };
  attributes: {
    packageWeight: Attribute.Decimal & Attribute.Required;
    packageWeightUnit: Attribute.Enumeration<['lb', 'oz', 'g', 'kg']> &
      Attribute.Required;
    countPerPackage: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    itemWeightKg: Attribute.Decimal;
    countPerKg: Attribute.Decimal;
    weightSource: Attribute.String & Attribute.Required;
    logDate: Attribute.Date & Attribute.Required;
    notes: Attribute.String;
  };
}

export interface TeamRole extends Schema.Component {
  collectionName: 'components_team_roles';
  info: {
    displayName: 'Role';
    icon: 'handHeart';
    description: '';
  };
  attributes: {
    Title: Attribute.String & Attribute.Required;
    Type: Attribute.JSON &
      Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'Contributor',
          'Volunteer',
          'Maintainer',
          'Coordinator',
          'Director',
          'Board',
          'Advisory Board',
          'Founder'
        ]
      >;
    Location: Attribute.Component<'geo.location'>;
    Duration: Attribute.Component<'time.duration'>;
  };
}

export interface TimeDuration extends Schema.Component {
  collectionName: 'components_time_durations';
  info: {
    displayName: 'Duration';
    icon: 'clock';
  };
  attributes: {
    Start: Attribute.DateTime & Attribute.Required;
    End: Attribute.DateTime;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'geo.location': GeoLocation;
      'product.needs-met': ProductNeedsMet;
      'product.second-hand': ProductSecondHand;
      'product.value': ProductValue;
      'product.volume': ProductVolume;
      'product.weight': ProductWeight;
      'team.role': TeamRole;
      'time.duration': TimeDuration;
    }
  }
}
