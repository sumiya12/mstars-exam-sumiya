import type { Request } from "express";
import type { JwtUser } from "../middleware/authMiddleware.js";

export type RequestParams = Record<string, string>;
export type RequestQuery = Record<string, string | undefined>;
export type RequestBody = Record<string, any>;

export type AppRequest<
  Params extends RequestParams = RequestParams,
  Body = RequestBody,
  Query extends RequestQuery = RequestQuery
> = Request<Params, unknown, Body, Query> & {
  user?: JwtUser;
};

export type PaymentBreakdown = {
  cash?: number;
  card?: number;
  account?: number;
  [key: string]: unknown;
};

export type BookingAddon = {
  size?: string;
  count?: number;
  code?: string;
  price?: number;
  realPrice?: number;
  [key: string]: unknown;
};
