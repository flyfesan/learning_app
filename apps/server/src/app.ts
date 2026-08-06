import express from "express";
import createHttpError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import type { NextFunction, Request, Response } from "express";

import { router as indexRouter } from "@/routes/index";
import { router as usersRouter } from "@/routes/users";
export const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404));
});

// error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(500);
  res.render("error");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
