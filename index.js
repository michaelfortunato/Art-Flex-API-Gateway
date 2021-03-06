const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const nodemailer = require("nodemailer");
const { buildSchema, SingleFieldSubscriptionsRule } = require("graphql");
const Artist = require("./artist");
const Buyer = require("./buyer");
const User = require("./user");
const signup = require("./signup");
const login = require("./login");
const logout = require("./logout");
const account = require("./account");
const refresh_session = require("./refresh_session");
const checkCredentials = require("./check_credentials");
const cookieParser = require("cookie-parser");
const { S3Client } = require("@aws-sdk/client-s3");
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
        status: String!
        statusMessage: String
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
  artist: (args, context, info) => {},
  artists: (args, context, info) => {},
  buyer: (args, context, info) => {},
  buyers: (args, context, info) => {},

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

  SignInUser: async (args, context, info) => {
    const { input } = args;
    const { email, password } = input;
    const { status, statusMessage, user, accessToken, refreshToken } =
      await User.signin(email, password);

    context.res.cookie("jid", refreshToken, {
      httpOnly: true,
      domain: "artflex.co",
      path: "/",
    });
    return {
      status: status,
      statusMessage: statusMessage,
      user: user,
      accessToken: accessToken,
    };
  },
};

// Our server
const app = express();
const port = process.env.PORT || 8080;

// Configure the S3 Client
app.locals.s3_client = new S3Client({
  region:"us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

app.use(express.json());
app.use(cookieParser());
app.use("/signup", signup);
app.use("/login", login);
app.use("/logout", checkCredentials, logout);
app.use("/account", checkCredentials, account);
app.use("/refresh_session", refresh_session);
app.get("/test", async (req, res) => {
  res.send("fine");
});
app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
