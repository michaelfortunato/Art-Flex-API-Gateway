const graphql = require('graphql')

const Period = new graphql.GraphQLEnumType({
    name: "Period", 
    values: {
        MONTHLY: {}, 
        YEARLY: {}
    }
})

const RentPrice = new graphql.GraphQLObjectType({
    name: "RentPrice", 
    fields: {
        period: {type: Period}, 
        price: {type: graphql.GraphQLInt}
    }
});

const Price = new graphql.GraphQLObjectType({
    name: "Price", 
    fields: {
        rentPrices: {type: new graphql.GraphQLList(RentPrice)}, 
        buyPrice: {type: graphql.GraphQLInt}
    }
});

const Role = new graphql.GraphQLEnumType({
    name: "Role", 
    values: {
        ADMIN: {},
        BUYER: {},
        SELLER: {}
    }
});

const User = new graphql.GraphQLInterfaceType({
    name: "User",
    fields: {
        id: { type: graphql.GraphQLID}, 
        name: {type: graphql.GraphQLString}, 
        email: {type: graphql.GraphQLString}, 
        role: {type: Role}
    }
});

const Shopper = new graphql.GraphQLObjectType({
    name: "Shopper",
    interfaces: [User],
    fields: {
        billing: { type: graphql.GraphQLString}
    }
});

const Seller = new graphql.GraphQLObjectType({
    name: "Seller",
    interfaces: [User],
    subscription: { type: graphql.GraphQLString}
});

const Artwork = new graphql.GraphQLObjectType({
    name: "Artwork",
    fields: {
        id: { type: graphql.GraphQLID },
        artistID: { type: graphql.GraphQLID },
        name: { type: graphql.GraphQLString },
        price: { type: Price },
        description: { type: graphql.GraphQLString },
        photo: { type: graphql.GraphQLString }
    }
});

const Artist = new graphql.GraphQLObjectType({
    name: 'Artist',
    fields: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
        name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
        personalStatement: { type: graphql.GraphQLString },
        Artworks: { type: new graphql.GraphQLNonNull(new graphql.GraphQLList(graphql.GraphQLString)) },
    }
});

const schema = new graphql.GraphQLSchema({query: Artist});

module.exports = schema