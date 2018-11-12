const { ApolloServer } = require('apollo-server');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const typeDefs = `
  type Photo {
    id: ID!
    name: String!
    description: String
    category: PhotoCategory!
    url: String!
    type: String!
    postedBy: String!
  }
  type User {
    githubLogin: ID!
    name: String!
    postedPhotos: [Photo!]!
  }
  enum PhotoCategory {
    LANDSCAPE
    PORTRAIT
  }
  type Mutation {
    postPhoto(name: String!, description: String): Photo! 
    postUser(name: String!): User! 
  }
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
    totalUsers: Int!
    allUsers: [User!]!
    aPhoto(id: ID!): Photo!
  }
`;

const DEFAULT_IMAGE_TYPE = 'jpg';
const photos = []; // just for now
const resolvers = {
  Query: {
    totalPhotos: (parent, args, {photos}) => photos.countDocuments(),
    allPhotos: (parent, args, {photos}) => photos.find().toArray(),
    totalUsers: (parent, args, {users}) => users.countDocuments(),
    allUsers: (parent, args, {users}) => users.find().toArray(),
    aPhoto: (parent, {id}, {photos}) => photos.findOne({id: id})
  },
  Mutation: {
    postPhoto: async (parent, args, {photos}) => {
      const newPhoto = {...args};
      const { insertedId } = await photos.insertOne(newPhoto);
      newPhoto.id = insertedId.toString();
      return newPhoto;
    },
    postUser: async (parent, args, {users}) => {
      const newUser = {...args};
      const { insertedId } = await users.insertOne(newUser);
      newUser.id = insertedId.toString();
      return newUser;
    }
  },
  Photo: {
    id: (parent, {id}, {photos}) => parent.id || parent._id.toString(),
    url: parent => `/img/${parent._id}.${parent.type || DEFAULT_IMAGE_TYPE}`,
    type: (parent, {type}, {photos}) => type || "jpg",
    category: (parent, {category}, {photos}) => category || PhotoCategory.LANDSCAPE,
    postedBy: (parent, args, {users}) => users.findOne({githubLogin: parent._id}) || {}
  },
  User: {
    postedPhotos: (parent, args, {photos}) => photos.find({userID: parent.githubLogin}).toArray()
  }
};

console.warn(`
  -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
  DATABASE HOST: ${process.env.DB_HOST}
  POTATO: ${process.env.POTATO}
  
  photos: ${JSON.stringify(photos)}
`);

const start = async () => {
  const client = await MongoClient.connect(process.env.DB_HOST, {useNewUrlParser: true});
  const db = client.db();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: {
      photos: db.collection('photos'),
      users: db.collection('users')
    }
  });

  server.listen().then(console.log);
};

start();
