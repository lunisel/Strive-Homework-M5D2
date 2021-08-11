import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import uniqid from "uniqid";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { blogsValidationMiddleware } from "./validation.js";
import { request } from "http";

const blogsRouter = express.Router();
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const blogsJSONPath = join(currentDirPath, "blogPosts.json");

const getPosts = () => JSON.parse(fs.readFileSync(blogsJSONPath));

const writePosts = (content) =>
  fs.writeFileSync(blogsJSONPath, JSON.stringify(content));

blogsRouter.get("/", (req, res, next) => {
  try {
    const blogPosts = getPosts();

    if (req.query && req.query.title) {
      const filteredPosts = blogPosts.filter(
        (b) => b.title === req.query.title
      );
      res.send(filteredPosts);
    } else {
      res.send(blogPosts);
    }
  } catch (error) {
    next(error); // next(error) transmits the error to the error handlers
  }
});

blogsRouter.get("/:id", (req, res, next) => {
  try {
    const posts = getPosts();

    const post = posts.find((p) => p.id === req.params.id);
    if (post) {
      res.send(post);
    } else {
      next(createHttpError(404, `Post with id ${req.params.id} not found!`)); // 404 error is being sent to error handlers
    }
  } catch (error) {
    next(error); // 500 error is being sent to error handlers
  }
});

blogsRouter.post("/", blogsValidationMiddleware, (req, res, next) => {
  try {
    const errorsList = validationResult(request);

    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      const newPost = { ...request.body, id: uniqid(), createdAt: new Date() };
      const posts = getPosts();
      posts.push(newPost);
      writePosts(posts);
      res.status(201).send({ id: newPost.id });
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:id", (req, res, next) => {
  try {
    const posts = getPosts();

    const remainingPosts = posts.filter((p) => p.id !== req.params.id);

    const modifiedPost = { ...req.body, id: req.params.id };

    remainingPosts.push(modifiedPost);

    writePosts(remainingPosts);

    res.send(modifiedPost);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:id", (req, res, next) => {
  try {
    const posts = getPosts();

    const remainingPosts = posts.filter((p) => p.id !== req.params.id);

    writePosts(remainingPosts);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
