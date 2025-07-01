import { GraphQLEnumType } from 'graphql';

export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  description: 'Enum representing the possible member types',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});