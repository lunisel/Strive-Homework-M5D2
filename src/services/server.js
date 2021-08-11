import express from "express"; // NEW SYNTAX (add "type": "module" to package.json to enable this )
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import studentsRouter from "./services/students/index.js.js";
import booksRouter from "./services/books/index.js.js";
import {
  notFoundErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  genericServerErrorHandler,
} from "./errorHandlers.js.js";

const server = express();

const port = 3001;

// ***************** MIDDLEWARES *******************************

const loggerMiddleware = (req, res, next) => {
  console.log(
    `Req method ${req.method} -- Req URL ${req.url} -- ${new Date()}`
  );
  next(); // MANDATORY!!! I need to execute this function to give the control to what is coming next (either next middleware in chain or route handler)
};

// GLOBAL LEVEL MIDDLEWARES
server.use(loggerMiddleware);
server.use(cors());
server.use(express.json()); // If I do not specify this line of code BEFORE the routes, all the requests' bodies will be UNDEFINED

// *************** ROUTES *****************

server.use("/students", studentsRouter);
server.use("/books", booksRouter);

// **************** ERROR MIDDLEWARES *******************

server.use(notFoundErrorHandler);
server.use(badRequestErrorHandler);
server.use(forbiddenErrorHandler);
server.use(genericServerErrorHandler);

console.table(listEndpoints(server));

server.listen(port, () => {
  console.log("Server listening on port " + port);
});
