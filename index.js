const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema, SingleFieldSubscriptionsRule } = require("graphql");
const Artist = require("./artist");
const Buyer = require("./buyer");
const User = require("./user");
// Defining graphql schema, using GraphQL schema language
const schema = buildSchema(`
    type Query {
        artist(name: String!) : Artist
        artists(page: Int): [Artist]!
        buyer(name: String!) : Buyer
        buyers(page: Int) : [Buyer]!
    }
    type Mutation {
        SignUpArtist(input: SignUpInput!) : SignUpResponse 
        SignUpBuyer(input: SignUpInput!) : SignUpResponse 
        SignInUser(input: SignInInput!) : SignInResponse
    }
    input SignUpInput {
        name: String!
        email: String!
        password: String!
    } 
    input SignInInput {
        email: String! 
        password: String!
    }
    type SignUpResponse {
        status: Boolean!
        statusMessage: String
    }
    type SignInResponse {
        user: User
        accessToken: String
        refreshToken: String
    }
    interface User {
        name: String
        email: String
    }
    type Buyer implements User {
        name: String
        email: String
    }
    type Artist implements User {
        name: String
        email: String
        artworks: [Artwork!]
    }
    type Artwork {
        id: ID !
        owner: Artist !
        name: String !
        price: Price
    }
    type Price {
        rentPrice: [RentPrice]
        buyPrice: Int
    }
    type RentPrice {
        period: Period
        price: Int
    }

    enum Period {
        MONTH
        YEAR
    }
`);

const rootResolver = {
  artist: (args, context, info) => {
    return name;
  },
  artists: (args, context, info) => {
    if (page === null) {
      page = -1;
    }
    return {
      page: page,
    };
  },
  buyer: (args, context, info) => {
    return name;
  },
  buyers: (args, context, info) => {
    return page;
  },
  SignUpArtist: async (args, context, info) => {
    const { input } = args;
    const { name, email, password } = input;
    const artist = new Artist(name, email);
    console.log("OK");
    return await artist.signup(password);
  },
  SignUpBuyer: async (args, context, info) => {
    const { input } = args;
    const { name, email, password } = input;
    const buyer = new Buyer(name, email);
    return await buyer.signup(password);
  },
};

// Our server
const app = express();
const port = 8081;

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: rootResolver,
    graphiql: true,
  })
);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}/graphql`);
});
