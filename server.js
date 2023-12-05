const path = require("path");

const app = require("fastify")({
  // set this to true for detailed logging:
  logger: false
});

const MAX_SECONDS = 10;

app.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

app.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

app.get("/", function(request, reply) {
  let params = {
    greeting: "SLEEP AS A SERVICE 😴"
  };
  reply.view("/src/pages/index.hbs", params);
});

app.setErrorHandler(function (error, request, reply) {
  this.log.error(error);
  reply.status(400).send({ error: error.message });
})

app.get("/sleep", function(request, reply) {
  throw new Error("You must specify the number of seconds to sleep");
});

app.get("/sleep/:seconds", function(request, reply) {
  let seconds = request.params.seconds;

  if (isNaN(seconds) || seconds === "") {
    console.log("Rejected non-number");
    throw new Error("You must specify a number");
  }

  if (seconds > MAX_SECONDS) {
    console.log("Rejected large number");
    throw new Error("Sorry, try a lower number");
  }

  console.log(`Sleeping for ${seconds}s`);
  sleep(seconds * 1000).then(() => {
    console.log(`Slept for ${seconds}s`)
    reply.send({ slept: seconds });
  });
});

app.listen({ port: process.env.PORT || "8080", host: "0.0.0.0" }, function(err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  app.log.info(`server listening on ${address}`);
});

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
