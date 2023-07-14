"use strict";
import fp from "fastify-plugin";

import cors from "@fastify/cors";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
  fastify.register(cors, {
    origin: "*",
    credentials: true,
  });
});
