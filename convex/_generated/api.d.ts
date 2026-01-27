/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as answers from "../answers.js";
import type * as backfill from "../backfill.js";
import type * as charLimits from "../charLimits.js";
import type * as http from "../http.js";
import type * as language from "../language.js";
import type * as logs from "../logs.js";
import type * as push from "../push.js";
import type * as pushActions from "../pushActions.js";
import type * as questions from "../questions.js";
import type * as referrals from "../referrals.js";
import type * as types from "../types.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  answers: typeof answers;
  backfill: typeof backfill;
  charLimits: typeof charLimits;
  http: typeof http;
  language: typeof language;
  logs: typeof logs;
  push: typeof push;
  pushActions: typeof pushActions;
  questions: typeof questions;
  referrals: typeof referrals;
  types: typeof types;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
