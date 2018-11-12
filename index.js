const { ApolloServer } = require('apollo-server');
const songs = [
  {id: "1", title: "Tom Sawyer", numberOne: true},
  {id: "2", title: "Fly By Night", numberOne: false},
  {id: "3", title: "Limelight", numberOne: true},
  {id: "4", title: "Enough", numberOne: true},
  {id: "5", title: "The Curse", numberOne: true},
  {id: "6", title: "Wheel in the sky", numberOne: true},
  {id: "7", title: "Do You Recall", numberOne: true}
];
const performers = [
  {id: 1, name: "Rush"},
  {id: 2, name: "Disturbed"},
  {id: 3, name: "Journey"}
];
const performerType = [
  "BAND",
  "ARTIST"
];
const typeDefs = `
  type Performer {
    id: ID!
    name: String!
  }
  type Song {
    id: ID!
    title: String!
    numberOne: Boolean
  }
  type Query {
    allSongs: [Song!]!,
    song(title: String): Song!,
    allPerformers: [Performer!]!,
    performer(name: String!): Performer!
  }
`;
const resolvers = {
  Query: {
    allSongs: () => songs,
    allPerformers: () => performers,
    song: (parent, {title}) => songs.find((song) => song.title === title),
    performer: (parent, {name}) => performers.find((p) => p.name === name)
  }
};
const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(console.log);
