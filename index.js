const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql')

// Defining graphql schema, using GraphQL schema language

const schema = buildSchema(`
    type Query {
        artist(id: ID!) : Artist
    }
    type Artist {
        id: ID
        name: String
        artworks: [Artwork!]
    }
    type Artwork {
        id: ID
        owner: Artist
        name: String
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
const root = {
    artist: (id) => {
        return {
            "id": id, 
            "name": "Michael"
        }
    }
};


// Our server
const app = express();
const port = 8080;

app.use('/graphql', graphqlHTTP({
    schema: schema, 
    rootValue: root,
    graphiql: true
}))

app.listen(port, ()=> {
    console.log(`Server is listening at http://localhost:${port}/graphql`);
});