#!/usr/bin/env node
import { dispatch } from "./cli.js";

void dispatch(process.argv.slice(2))
  .then(() => {
    process.exit(process.exitCode ?? 0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
