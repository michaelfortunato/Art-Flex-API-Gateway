const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql')
const User = require('./user');
//const schema = require('./schema.js')

// Defining graphql schema, using GraphQL schema language
const schema = buildSchema(`
    type Query {
        artist(name: String!) : Artist
        artists(page: Int): [Artist]!
        buyer(name: String!) : Buyer
        buyers(page: Int) : [Buyer]!
    }
    type Mutation {
        SignUpArtist(input: SignUpInput!) : Artist
        SignUpBuyer(input: SignUpInput!) : Buyer
    }
    input SignUpInput {
        name: String!
        email: String!
        password: String!
    } 
    interface User {
        name: String
        email: String
        password: String
    }
    type Buyer implements User {
        name: String
        email: String
        password: String
    }
    type Artist implements User {
        name: String
        email: String
        password: String
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
`)

const rootResolver = {
    artist: ({name}) => {
        return name
    },
    artists: ({page}) => {
        if (page === null) {
            page = -1
        }
        return {
            "page": page 
        }
    }, 
    buyer: ({name}) => {
       return name 
    },
    buyers: ({page}) => {
        return page
    },
    SignUpArtist: async ({input}) => {
        const res = await User.signup(input) 
        return res
    },
    SignUpBuyer: ({input}) => {

        console.log(input)
        return input
    }
};


// Our server
const app = express();
const port = 8080;

app.use('/graphql', graphqlHTTP({
    schema: schema, 
    rootValue: rootResolver,
    graphiql: true
}))

app.listen(port, ()=> {
    console.log(`Server is listening at http://localhost:${port}/graphql`);
});