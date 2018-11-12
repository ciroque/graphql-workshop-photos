const { ApolloServer } = require('apollo-server');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const typeDefs = `
  type Photo {
    id: ID!
    name: String!
    description: String
  }
  type Mutation {
    postPhoto(name: String!, description: String): Photo! 
  }
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }
`;

const photos = []; // just for now
const resolvers = {
  Query: {
    totalPhotos: (parent, args, {photos}) => photos.countDocuments(),
    allPhotos: (parent, args, {photos}) => photos.find().toArray()
  },
  Mutation: {
    postPhoto: async (parent, args, {photos}) => {
      const newPhoto = {...args};
      const { insertedId } = await photos.insertOne(newPhoto);
      newPhoto.id = insertedId.toString();
      return newPhoto;
    }
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
      photos: db.collection('photos')
    }
  });

  server.listen().then(console.log);
};

start();
