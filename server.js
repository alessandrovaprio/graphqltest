var graphql = require('graphql').graphql;
/*var buildSchema = require('graphql').buildSchema;*/
var express = require('express');
var graphqlHTTP = require('express-graphql');
var buildSchema = require('graphql').buildSchema;
var fakeDatabase={};
// Construct a schema, using GraphQL schema language


// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }
  input MessageInput {
    content: String
    author: String
  }
  type Message {
    id: ID!
    content: String
    author: String
  }
  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }
  type Query {
    hello: String
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
    rollDice(numDice: Int!,numSides: Int): [Int]
    getDie(numSides: Int): RandomDie
    getMessage(id: ID!): Message
  }

`);

class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({numRolls}) {
    var output = [];
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
};

class Message {
  constructor(id, {content, author}) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}
// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello world!';
  },
  quoteOfTheDay:() => {
    return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
  },
  random:() => {
    return Math.random();
  },
  rollThreeDice:()=> {
    return [1,2,3].map(_ => 1+ Math.floor(Math.random() *6));
  },
  rollDice:(args)=>{

    //return {numSides,numDice};
    return RollDice(args.numDice,args.numSides);
  },
  getDie: function ({numSides}) {
   return new RandomDie(numSides || 6);
 },
 getMessage: function ({id}) {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id);
    }
    return new Message(id, fakeDatabase[id]);
  },
 createMessage: function ({input}) {
    // Create a random id for our "database".
    var id = require('crypto').randomBytes(10).toString('hex');

    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  updateMessage: function ({id, input}) {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id);
    }
    // This replaces all old data, but some apps might want partial update.
    fakeDatabase[id] = input;
    return new Message(id, input);
  },
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
// Run the GraphQL query '{ hello }' and print out the response
/*graphql(schema, '{ hello }', root).then((response) => {
  console.log(response);
});*/

function RollDice(numDice,numSides){
  var output=[];
  if(numDice != null && numDice!=undefined){
    for(var i=0;i<numDice;i++){
      //output.push(1+Math.floor(Math.random()* (numSides || 6)));
      output.push(1+Math.floor(Math.random()* numSides ));
    }
  }else{
    output=[200,200];
  }

  return output;
}
