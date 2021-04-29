# Public API Specification 

## Queries
- Home page with artworks
    1. Query artworks(range: Num = 20)
- Inidividual Artwork 
    1. Query artwork(id: ID!)
- Individual Artist
    1. Query Artist(id: ID!, name: String!)
- Profile Page Home
    1. Query Profile(username: String!) MUST BE LockedDOWN 
 
 ## Mutations
- Login Page
    1. Mutation Login(username: String!, password: String!)
-Sign Up Page
   2. Mutation Register(name: String!, password String!, address: String!)



## GraphQL Schema
    Query artworks(number: Int = 20)
    Query artwork(id: ID!)
    Query Arist(id: ID!)

    Query Profile(): User/Null [Authentication Required, Authorization Required Nullable] 
    Mutation Register(name, password, address) : Boolean!
    Mutation Login(username: String!, password: String!): LoginResponse 

    type Artist {
        id: ID!
        name: String!
        personalStatement: String
        Artworks: [Artwork!]!
    }
    type Artwork {
        id: ID!
        artistID: ID!  
        name: String!
        price: Price!
        description: String!
        photo: String!
    }
    interface User {
        id: ID!
        name: String!
        email: String!
        password String!
        role: Role!
    }
    type Shopper implements User {
        billing: String
    }
    type Seller implements User {
        subscription: String
    }

    type Price {
        rentPrice: [RentPrice]
        buyPrice: Int
    }
    type RentPrice {
        period: Period
        price: Int
    } 

    enum Period

    type LoginResponse {
        success: Boolean!
        accessToken: String
    }

