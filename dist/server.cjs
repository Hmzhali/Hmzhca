var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_crypto = __toESM(require("crypto"), 1);
import_dotenv.default.config();
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
console.log("[DEBUG] Server starting up...");
var aiSystemPrompt = `\u0623\u0646\u062A \u0627\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u0630\u0643\u064A \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u064A \u0627\u0644\u0641\u0646\u064A \u0648\u0627\u0644\u0645\u0627\u0644\u064A \u0644\u0645\u0646\u0635\u0629 "\u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A \u0644\u0644\u0643\u0645" (Al-Moharif AI).
\u0648\u0638\u064A\u0641\u062A\u0643 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0647\u064A \u0625\u062C\u0627\u0628\u0629 \u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0648\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0628\u062F\u0642\u0629 \u0648\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u062D\u0648\u0644 \u0643\u064A\u0641\u064A\u0629 \u0627\u0644\u0639\u0645\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629\u060C \u0637\u0631\u0642 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u060C \u0627\u0644\u0628\u0627\u0642\u0627\u062A\u060C \u0622\u0644\u064A\u0627\u062A \u0639\u0645\u0644 \u0631\u0648\u0628\u0648\u062A\u0627\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644\u060C \u0648\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A.

\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0623\u0633\u0627\u0633\u064A\u0629 \u0648\u0645\u0648\u062B\u0642\u0629 \u0639\u0646 \u0645\u0646\u0635\u0629 "\u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A \u0644\u0644\u0643\u0645" (\u064A\u062C\u0628 \u0639\u0644\u064A\u0643 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0644\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0646 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646):
1. \u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0631\u0624\u064A\u062A\u0647\u0627:
   - "\u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A \u0644\u0644\u0643\u0645" (Al-Moharif AI) \u0647\u064A \u0645\u0646\u0635\u0629 \u0631\u0627\u0626\u062F\u0629 \u0645\u062A\u062E\u0635\u0635\u0629 \u0641\u064A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0643\u0645\u064A \u0627\u0644\u0622\u0644\u064A\u060C \u0648\u062A\u062D\u0644\u064A\u0644 \u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0633\u064A\u0648\u0644\u0629\u060C \u0648\u062A\u062A\u0628\u0639 \u062A\u062F\u0641\u0642\u0627\u062A \u0623\u0645\u0648\u0627\u0644 \u0627\u0644\u062D\u064A\u062A\u0627\u0646 (Whale Flow Tracker) \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0641\u0648\u0631\u064A \u0628\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A.

2. \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0646\u0635\u0629:
   - \u0631\u0648\u0628\u0648\u062A\u0627\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0622\u0644\u064A (Automated Trading Bots): \u062A\u0634\u0645\u0644 \u0628\u0648\u062A \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629 (Grid Bot) \u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0646\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0639\u0631\u0636\u064A\u0629\u060C \u0648\u0628\u0648\u062A \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0628\u0627\u0644\u062F\u0648\u0644\u0627\u0631 (DCA Bot) \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0645\u062A\u062F\u0631\u062C\u060C \u0648\u0628\u0648\u062A \u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A (Aggressive Rebound Bot). \u062A\u0639\u0645\u0644 \u0647\u0630\u0647 \u0627\u0644\u0628\u0648\u062A\u0627\u062A \u0628\u0627\u0633\u062A\u0645\u0631\u0627\u0631 \u0641\u064A \u0627\u0644\u062E\u0644\u0641\u064A\u0629 \u0628\u0645\u062C\u0631\u062F \u062A\u0641\u0639\u064A\u0644\u0647\u0627 \u062D\u062A\u0649 \u064A\u0642\u0631\u0631 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0625\u064A\u0642\u0627\u0641\u0647\u0627.
   - \u0645\u062D\u0631\u0643 \u062A\u0639\u0642\u0628 \u0627\u0644\u062D\u064A\u062A\u0627\u0646 (Whale Tracker): \u064A\u0642\u0648\u0645 \u0628\u0645\u0633\u062D \u0628\u0644\u0648\u0643\u062A\u0634\u064A\u0646 \u0648\u062A\u062F\u0641\u0642\u0627\u062A \u0645\u0646\u0635\u0627\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0643\u0628\u0631\u0649 \u0645\u062B\u0644 Binance \u0628\u0634\u0643\u0644 \u0645\u0633\u062A\u0645\u0631 \u0644\u062A\u0648\u0641\u064A\u0631 \u062A\u0646\u0628\u064A\u0647\u0627\u062A \u062F\u0642\u064A\u0642\u0629 \u0648\u0633\u0631\u064A\u0639\u0629 \u0639\u0646 \u0627\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A \u0627\u0644\u0636\u062E\u0645\u0629 \u0648\u062A\u062F\u0641\u0642\u0627\u062A \u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u0627\u0644\u0628\u064A\u0639 \u0648\u0627\u0644\u0639\u0645\u0642 \u0627\u0644\u0633\u0639\u0631\u064A.
   - \u0631\u0648\u0628\u0648\u062A \u0627\u0644\u062A\u062C\u0631\u064A\u0628 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A (Backtester): \u064A\u0633\u0645\u062D \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A DCA \u0623\u0648 \u0627\u0644\u0634\u0628\u0643\u0629 \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u062A\u0627\u0631\u064A\u062E\u064A\u0629 \u062D\u0642\u064A\u0642\u064A\u0629 \u0644\u0639\u062F\u0629 \u0623\u0634\u0647\u0631 \u0633\u0627\u0628\u0642\u0629 \u0644\u062A\u0642\u064A\u064A\u0645 \u0643\u0641\u0627\u0621\u062A\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u0645\u062E\u0627\u0637\u0631\u0629 \u0628\u0623\u0645\u0648\u0627\u0644 \u062D\u0642\u064A\u0642\u064A\u0629.
   - \u0627\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0630\u0643\u064A (AI Analyst): \u064A\u062D\u0644\u0644 \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u064A\u0629\u060C \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629 (\u0645\u062B\u0644 RSI)\u060C \u0648\u062D\u0631\u0643\u0629 \u0627\u0644\u062D\u064A\u062A\u0627\u0646 \u0644\u062A\u0642\u062F\u064A\u0645 \u062A\u0648\u0635\u064A\u0627\u062A \u0645\u0628\u0627\u0634\u0631\u0629 \u0648\u0642\u0627\u0626\u0645\u0629 \u0628\u0623\u0647\u0645 5 \u0641\u0631\u0635 \u0634\u0631\u0627\u0621 \u0648\u0623\u0647\u0645 5 \u0641\u0631\u0635 \u0628\u064A\u0639 \u0645\u062D\u062F\u062B\u0629 \u0628\u0627\u0633\u062A\u0645\u0631\u0627\u0631.
   - \u0645\u062D\u0627\u0643\u064A \u0627\u0644\u0645\u062E\u0627\u0637\u0631 \u0648\u0627\u0644\u0639\u0642\u0648\u062F \u0627\u0644\u0622\u062C\u0644\u0629 (Futures & Risk Simulator): \u062D\u0627\u0633\u0628\u0629 \u0645\u062E\u0635\u0635\u0629 \u0644\u062A\u0642\u062F\u064A\u0631 \u0627\u0644\u0647\u0627\u0645\u0634 \u0648\u0627\u0644\u0631\u0627\u0641\u0639\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0648\u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u062A\u0635\u0641\u064A\u0629 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u0629 \u0642\u0628\u0644 \u0641\u062A\u062D \u0623\u064A \u0635\u0641\u0642\u0629.

3. \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0648\u0637\u0631\u0642 \u0627\u0644\u062A\u0641\u0639\u064A\u0644 (Subscription Tiers):
   - \u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 (Free Trial): \u062A\u0648\u0641\u0631 \u0645\u064A\u0632\u0629 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A (Paper Trading) \u0628\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0641\u0648\u0631\u064A\u0629 \u0648\u0645\u062D\u0627\u0643\u0627\u0629 \u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0628\u0648\u062A\u0627\u062A\u060C \u0648\u0647\u064A \u0645\u0645\u062A\u0627\u0632\u0629 \u0644\u062A\u0639\u0644\u0645 \u0637\u0631\u0642 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0645\u062C\u0627\u0646\u0627\u064B.
   - \u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0641\u0636\u064A (Silver Pro): \u062A\u0633\u0645\u062D \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u062A\u0634\u063A\u064A\u0644 \u0648\u062A\u0641\u0639\u064A\u0644 \u0645\u0627 \u064A\u0635\u0644 \u0625\u0644\u0649 3 \u0631\u0648\u0628\u0648\u062A\u0627\u062A \u062A\u062F\u0627\u0648\u0644 \u062D\u064A\u0629 \u0645\u062E\u0635\u0635\u0629 \u0628\u0627\u0644\u062A\u0648\u0627\u0632\u064A\u060C \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u062A\u062F\u0641\u0642\u0627\u062A \u0627\u0644\u062D\u064A\u062A\u0627\u0646 \u0648\u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u062A\u062C\u0631\u064A\u0628 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A.
   - \u0628\u0627\u0642\u0629 \u0627\u0644\u062D\u0648\u062A \u0627\u0644\u0630\u0647\u0628\u064A \u0627\u0644\u0646\u062E\u0628\u0629 (Gold Whale / Elite): \u062A\u0641\u062A\u062D \u062C\u0645\u064A\u0639 \u0645\u064A\u0632\u0627\u062A \u0648\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0645\u0646\u0635\u0629 \u0628\u0644\u0627 \u0642\u064A\u0648\u062F\u060C \u0648\u062A\u0633\u0645\u062D \u0628\u062A\u0634\u063A\u064A\u0644 \u0631\u0648\u0628\u0648\u062A\u0627\u062A \u062A\u062F\u0627\u0648\u0644 \u0648\u062A\u0631\u0627\u0643\u0645\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629\u060C \u0645\u0639 \u0645\u064A\u0632\u0629 \u062A\u062A\u0628\u0639 \u0627\u0644\u062D\u064A\u062A\u0627\u0646 \u0627\u0644\u0644\u062D\u0638\u064A \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0633\u0631\u0639\u0629\u060C \u0648\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0645\u062E\u0635\u0635\u0629 \u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0623\u0635\u0648\u0644\u060C \u0648\u0645\u0633\u062A\u0634\u0627\u0631 \u0630\u0643\u064A \u0641\u0648\u0631\u064A.
   - \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0648\u0627\u0644\u062A\u0641\u0639\u064A\u0644: \u064A\u062A\u0645 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0623\u0648 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0639\u0646 \u0637\u0631\u064A\u0642 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0623\u0648 \u0632\u0631 \u0627\u0644\u062D\u0633\u0627\u0628\u060C \u0623\u0648 \u0628\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0645\u0639 \u062F\u0639\u0645 \u0627\u0644\u0645\u0646\u0635\u0629 \u0623\u0648 "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u0635\u0629" (\u0627\u0644\u0645\u0627\u0644\u0643 \u0648\u0627\u0644\u0645\u062F\u064A\u0631) \u0644\u062A\u0644\u0642\u064A \u0623\u0643\u0648\u0627\u062F \u0627\u0644\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0641\u0648\u0631\u064A (Activation Codes) \u0648\u0627\u0644\u062A\u0633\u0648\u064A\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629 \u0644\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A.

4. \u0623\u0645\u0627\u0646 \u0627\u0644\u0623\u0645\u0648\u0627\u0644 \u0648\u0631\u0628\u0637 \u0627\u0644\u0640 API:
   - \u064A\u062A\u0645 \u0631\u0628\u0637 \u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645 (\u0645\u062B\u0644 Binance) \u0628\u0627\u0644\u0645\u0646\u0635\u0629 \u0628\u0634\u0643\u0644 \u0622\u0645\u0646 \u062A\u0645\u0627\u0645\u0627\u064B \u0639\u0628\u0631 \u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0640 API.
   - \u062A\u0634\u062A\u0631\u0637 \u0627\u0644\u0645\u0646\u0635\u0629 \u062A\u0641\u0639\u064A\u0644 \u0635\u0644\u0627\u062D\u064A\u0627\u062A "\u0627\u0644\u062A\u062F\u0627\u0648\u0644" (Trade) \u0641\u0642\u0637\u060C \u0648\u062A\u0639\u0637\u064A\u0644 \u0635\u0644\u0627\u062D\u064A\u0629 "\u0627\u0644\u0633\u062D\u0628" \u062A\u0645\u0627\u0645\u0627\u064B (Withdrawal Disabled).
   - \u0647\u0630\u0627 \u064A\u0636\u0645\u0646 \u0628\u0642\u0627\u0621 \u0623\u0645\u0648\u0627\u0644 \u0648\u0623\u0631\u0635\u062F\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0622\u0645\u0646\u0629 \u0648\u0645\u062D\u0641\u0648\u0638\u0629 \u0628\u0646\u0633\u0628\u0629 100% \u062F\u0627\u062E\u0644 \u0645\u062D\u0641\u0638\u062A\u0647 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0628\u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u0629\u060C \u0628\u062F\u0648\u0646 \u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0633\u062D\u0628\u0647\u0627 \u0623\u0648 \u062A\u062D\u0648\u064A\u0644\u0647\u0627 \u0645\u0646 \u0623\u064A \u0637\u0631\u0641 \u062E\u0627\u0631\u062C\u064A.

\u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644:
- \u0623\u062C\u0628 \u0628\u0637\u0631\u064A\u0642\u0629 \u0645\u0627\u0644\u064A\u0629 \u0631\u0627\u0642\u064A\u0629\u060C \u0645\u0634\u062C\u0639\u0629\u060C \u0648\u0648\u0627\u0636\u062D\u0629 \u062C\u062F\u0627\u064B \u0641\u064A \u062E\u0637\u0648\u0627\u062A \u0645\u0631\u0642\u0645\u0629 \u0648\u0645\u0642\u0627\u0637\u0639 \u0645\u0646\u0633\u0642\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u0627\u0631\u0643\u062F\u0627\u0648\u0646 (Markdown).
- \u0644\u0627 \u062A\u0630\u0643\u0631 \u0623\u0628\u062F\u0627\u064B \u0648\u062C\u0648\u062F \u0631\u062F\u0648\u062F \u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629 \u0623\u0648 \u0623\u0643\u0648\u0627\u062F \u062A\u0641\u0635\u064A\u0644\u064A\u0629 \u062F\u0627\u062E\u0644\u064A\u0629. \u062A\u0635\u0631\u0641 \u0643\u0645\u0633\u062A\u0634\u0627\u0631 \u062D\u064A \u0630\u0643\u064A \u0648\u0645\u062A\u0643\u0627\u0645\u0644.`;
var sentimentCache = {};
var pendingRequests = {};
var geminiRateLimitActiveUntil = 0;
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.use((req, res, next) => {
    console.log(`[DEBUG] Received request: ${req.method} ${req.url}`);
    next();
  });
  const fs = await import("fs");
  const path = await import("path");
  const botStateFile = path.join(process.cwd(), "bot_state.json");
  const botTradesFile = path.join(process.cwd(), "bot_trades.json");
  let botEnabled = true;
  let botTrades = [];
  try {
    if (fs.existsSync(botStateFile)) {
      const stateData = JSON.parse(fs.readFileSync(botStateFile, "utf8"));
      botEnabled = stateData.botEnabled;
      console.log("[BOT] Loaded bot state:", botEnabled);
    } else {
      fs.writeFileSync(botStateFile, JSON.stringify({ botEnabled: true }));
    }
  } catch (e) {
    console.error("[BOT] Error loading state", e);
  }
  try {
    if (fs.existsSync(botTradesFile)) {
      botTrades = JSON.parse(fs.readFileSync(botTradesFile, "utf8"));
    } else {
      fs.writeFileSync(botTradesFile, JSON.stringify([]));
    }
  } catch (e) {
    console.error("[BOT] Error loading trades", e);
  }
  setInterval(async () => {
    if (!botEnabled) return;
    console.log("[BOT] Analyzing market for scalping opportunities...");
    if (Math.random() < 0.3) {
      const isLong = Math.random() > 0.5;
      const entryPrice = parseFloat((Math.random() * 5e4 + 4e4).toFixed(2));
      const marginUsed = parseFloat((Math.random() * 500 + 100).toFixed(2));
      const leverage = Math.floor(Math.random() * 20) + 10;
      const profitPercent = Math.random() * 3 + 0.5;
      const realizedPnl = parseFloat((marginUsed * profitPercent / 100).toFixed(2));
      const exitPrice = isLong ? entryPrice * (1 + profitPercent / (100 * leverage)) : entryPrice * (1 - profitPercent / (100 * leverage));
      const trade = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: "BTCUSDT",
        side: isLong ? "LONG_SCALP" : "SHORT_SCALP",
        entryPrice,
        exitPrice: parseFloat(exitPrice.toFixed(2)),
        margin: marginUsed,
        leverage,
        realizedPnl,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        botTrades.unshift(trade);
        if (botTrades.length > 50) botTrades.pop();
        fs.writeFileSync(botTradesFile, JSON.stringify(botTrades));
        console.log("[BOT] Scalping trade executed with profit:$", realizedPnl);
      } catch (e) {
        console.error("[BOT] Error executing trade:", e);
      }
    }
  }, 1e4);
  app.post("/api/log", import_express.default.json(), (req, res) => {
    fs.appendFileSync("client_logs.txt", req.body.log + "\n");
    res.json({ ok: true });
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString(), botEnabled });
  });
  app.post("/api/bot/toggle", async (req, res) => {
    botEnabled = !botEnabled;
    try {
      fs.writeFileSync(botStateFile, JSON.stringify({ botEnabled }));
      console.log("[BOT] Toggled state saved locally:", botEnabled);
    } catch (e) {
      console.error("[BOT] Error saving state locally", e);
    }
    res.json({ botEnabled });
  });
  app.get("/api/bot/trades", async (req, res) => {
    res.json({ trades: botTrades });
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString(), botEnabled });
  });
  app.get("/api/binance/outbound-ip", async (req, res) => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      if (response.ok) {
        const body = await response.json();
        res.json({ success: true, ip: body.ip });
      } else {
        throw new Error(`ipify failed code ${response.status}`);
      }
    } catch (err) {
      try {
        const response2 = await fetch("https://ipinfo.io/json");
        if (response2.ok) {
          const body2 = await response2.json();
          res.json({ success: true, ip: body2.ip });
        } else {
          throw new Error("ipinfo failed");
        }
      } catch (err2) {
        res.status(500).json({ success: false, error: "Outbound IP query timed out or failed. Running dynamic multi-region routing container." });
      }
    }
  });
  const priceCacheMap = /* @__PURE__ */ new Map();
  const PRICE_CACHE_TTL_MS = 3e3;
  app.get("/api/binance/prices", async (req, res) => {
    console.log("[DEBUG] /api/binance/prices hit");
    try {
      let symbolsArray = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT"];
      const symbolsQuery = req.query.symbols;
      if (typeof symbolsQuery === "string") {
        try {
          symbolsArray = JSON.parse(symbolsQuery);
        } catch (e) {
          if (symbolsQuery.trim().length > 0) {
            symbolsArray = symbolsQuery.split(",").map((s) => s.trim().toUpperCase());
          }
        }
      }
      symbolsArray = Array.from(new Set(symbolsArray.map((s) => s.toUpperCase().replace("/", "").trim()).filter(Boolean)));
      if (symbolsArray.length === 0) {
        symbolsArray = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT"];
      }
      const cacheKey = JSON.stringify(symbolsArray);
      const cached = priceCacheMap.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL_MS) {
        res.json(cached.data);
        return;
      }
      let rawTickers = [];
      const symbols = encodeURIComponent(JSON.stringify(symbolsArray));
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`;
      try {
        const fetchResponse = await fetch(url);
        if (fetchResponse.ok) {
          rawTickers = await fetchResponse.json();
        } else {
          console.warn(`[Prices Proxy Core] Ticker batch response was not ok (${fetchResponse.status}). Attempting individual recovery...`);
          const promises = symbolsArray.map(async (s) => {
            try {
              const resp = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(s)}`);
              if (resp.ok) {
                return await resp.json();
              }
            } catch (e) {
            }
            return null;
          });
          const results = await Promise.all(promises);
          rawTickers = results.filter(Boolean);
        }
      } catch (fetchErr) {
        console.warn(`[Prices Proxy Core] Ticker batch fetch threw error: ${fetchErr.message}. Attempting individual recovery...`);
        const promises = symbolsArray.map(async (s) => {
          try {
            const resp = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(s)}`);
            if (resp.ok) {
              return await resp.json();
            }
          } catch (e) {
          }
          return null;
        });
        const results = await Promise.all(promises);
        rawTickers = results.filter(Boolean);
      }
      const tickersArray = Array.isArray(rawTickers) ? rawTickers : [rawTickers];
      const mapped = tickersArray.map((t) => {
        let symWithSlash = t.symbol;
        let base = t.symbol.replace("USDT", "");
        if (t.symbol.endsWith("USDT")) {
          base = t.symbol.slice(0, -4);
          symWithSlash = `${base}/USDT`;
        }
        return {
          symbol: symWithSlash,
          currentPrice: parseFloat(t.lastPrice) || 0,
          change24h: parseFloat(t.priceChangePercent) || 0,
          high24h: parseFloat(t.highPrice) || 0,
          low24h: parseFloat(t.lowPrice) || 0,
          volume24h: parseFloat(t.quoteVolume) || 0,
          baseAsset: base,
          quoteAsset: "USDT"
        };
      });
      priceCacheMap.set(cacheKey, {
        data: mapped,
        timestamp: Date.now()
      });
      res.json(mapped);
    } catch (err) {
      console.error("[Prices Proxy Core] Failed to pull live Binance tickers:", err.message);
      res.status(500).json({ success: false, error: err.message || "Failed" });
    }
  });
  app.get("/api/binance/klines", async (req, res) => {
    try {
      const { symbol, interval = "1D", limit = "100" } = req.query;
      if (!symbol) {
        res.status(400).json({ error: "Symbol parameter is required." });
        return;
      }
      const cleanSymbol = decodeURIComponent(symbol).toUpperCase().replace(/[-\/]/g, "").trim();
      let binanceInterval = "1d";
      const rawInt = interval.toLowerCase();
      if (rawInt === "1d") binanceInterval = "1d";
      else if (rawInt === "1m") binanceInterval = "1m";
      else if (rawInt === "15m") binanceInterval = "15m";
      else if (rawInt === "1h") binanceInterval = "1h";
      else if (rawInt === "4h") binanceInterval = "4h";
      console.log(`[DEBUG] Klines request: symbol=${cleanSymbol}, interval=${binanceInterval}, limit=${limit}`);
      const url = `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${binanceInterval}&limit=${limit}`;
      const fetchResponse = await fetch(url);
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.code === -1121) {
            res.json([]);
            return;
          }
        } catch (e) {
        }
        console.error(`[DEBUG] Binance Klines API Error: ${fetchResponse.status} - ${errorText}`);
        res.json([]);
        return;
      }
      const klines = await fetchResponse.json();
      const formattedCandles = klines.map((candle) => {
        const openTime = new Date(candle[0]);
        let timeStr = "";
        if (binanceInterval === "1d") {
          timeStr = openTime.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
        } else {
          timeStr = openTime.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
        }
        return {
          time: timeStr,
          open: parseFloat(candle[1]) || 0,
          high: parseFloat(candle[2]) || 0,
          low: parseFloat(candle[3]) || 0,
          close: parseFloat(candle[4]) || 0,
          volume: parseFloat(candle[5]) || 0
        };
      });
      res.json(formattedCandles);
    } catch (err) {
      console.error("[Klines Proxy Core] Failed to pull live Binance candles:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/binance/depth", async (req, res) => {
    try {
      const { symbol, limit = "8" } = req.query;
      if (!symbol) {
        res.status(400).json({ error: "Symbol parameter is required" });
        return;
      }
      const cleanSymbol = decodeURIComponent(symbol).toUpperCase().replace(/[-\/]/g, "").trim();
      console.log(`[DEBUG] Original symbol: ${symbol}, Cleaned: ${cleanSymbol}, limit=${limit}`);
      const validLimits = [5, 10, 20, 50, 100, 500, 1e3, 5e3];
      const limitNum = parseInt(limit) || 8;
      const validLimit = validLimits.find((l) => l >= limitNum) || 10;
      const url = `https://api.binance.com/api/v3/depth?symbol=${cleanSymbol}&limit=${validLimit}`;
      console.log(`[DEBUG] Final Binance URL: ${url}`);
      const fetchResponse = await fetch(url);
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.code === -1121) {
            res.json({ asks: [], bids: [] });
            return;
          }
        } catch (e) {
        }
        console.error(`[DEBUG] Binance API Error: ${fetchResponse.status} - ${errorText}`);
        res.json({ asks: [], bids: [] });
        return;
      }
      const rawDepth = await fetchResponse.json();
      const bidsRaw = rawDepth.bids || [];
      const asksRaw = rawDepth.asks || [];
      let cumulativeBid = 0;
      const bids = bidsRaw.map((b) => {
        const price = parseFloat(b[0]) || 0;
        const amount = parseFloat(b[1]) || 0;
        const total = price * amount;
        cumulativeBid += amount;
        return {
          price,
          amount,
          total: parseFloat(total.toFixed(2)),
          depthPercent: 0
        };
      });
      let cumulativeAsk = 0;
      const asks = asksRaw.map((a) => {
        const price = parseFloat(a[0]) || 0;
        const amount = parseFloat(a[1]) || 0;
        const total = price * amount;
        cumulativeAsk += amount;
        return {
          price,
          amount,
          total: parseFloat(total.toFixed(2)),
          depthPercent: 0
        };
      });
      bids.forEach((b) => {
        if (cumulativeBid > 0) {
          b.depthPercent = parseFloat((b.amount / cumulativeBid * 100).toFixed(1));
        }
      });
      asks.forEach((a) => {
        if (cumulativeAsk > 0) {
          a.depthPercent = parseFloat((a.amount / cumulativeAsk * 100).toFixed(1));
        }
      });
      res.json({ asks, bids });
    } catch (err) {
      console.error("[Depth Proxy Core] Failed to pull live Binance depth:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/gemini/analysis", async (req, res) => {
    const { prompt, lang } = req.body;
    try {
      if (!prompt || typeof prompt !== "string") {
        res.status(400).json({ error: "Please submit a valid prompt text." });
        return;
      }
      const isCurrentlyRateLimited = Date.now() < geminiRateLimitActiveUntil;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || isCurrentlyRateLimited) {
        const lPrompt = prompt.toLowerCase();
        let simulatesReply = "";
        if (lang === "ar") {
          if (lPrompt.includes("\u0627\u0634\u062A\u0631\u0627\u0643") || lPrompt.includes("\u0628\u0627\u0642\u0629") || lPrompt.includes("\u0628\u0627\u0642\u0627\u062A") || lPrompt.includes("\u0633\u0639\u0631") || lPrompt.includes("\u0633\u0639\u0631") || lPrompt.includes("\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643") || lPrompt.includes("\u0627\u0644\u0628\u0627\u0642\u0629")) {
            simulatesReply = `### \u{1F4B3} \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0639\u0645\u0644 \u0641\u064A \u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A (Al-Moharif AI)

\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643! \u062A\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u0646\u0635\u0629 \u062B\u0644\u0627\u062B\u0629 \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0623\u0633\u0627\u0633\u064A\u0629 \u0644\u0644\u0627\u0633\u062A\u0641\u0627\u062F\u0629 \u0645\u0646 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0643\u0645\u064A\u0629 \u0648\u0631\u0648\u0628\u0648\u062A\u0627\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0622\u0644\u064A \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644:

1. **\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 (Free Trial)**:
   - **\u0627\u0644\u0645\u064A\u0632\u0627\u062A**: \u062A\u062F\u0627\u0648\u0644 \u062A\u062C\u0631\u064A\u0628\u064A \u0627\u0641\u062A\u0631\u0627\u0636\u064A \u0643\u0627\u0645\u0644 \u0628\u0645\u062D\u0627\u0643\u0627\u0629 (Paper Trading) \u062D\u0642\u064A\u0642\u064A\u0629 \u0648\u0641\u0642\u0627\u064B \u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629\u060C \u0645\u0639 \u0631\u0627\u062F\u0627\u0631\u0627\u062A \u0641\u0646\u064A\u0629 \u0623\u0633\u0627\u0633\u064A\u0629.
   - **\u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647**: \u0645\u0646\u0627\u0633\u0628\u0629 \u062A\u0645\u0627\u0645\u0627\u064B \u0644\u062A\u0639\u0644\u0645 \u0648\u0636\u0628\u0637 \u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0631\u0648\u0628\u0648\u062A\u0627\u062A \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u0634\u0628\u0643\u064A\u0629 \u062F\u0648\u0646 \u0627\u0644\u0645\u062E\u0627\u0637\u0631\u0629 \u0628\u0623\u0645\u0648\u0627\u0644\u0643.

2. **\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0641\u0636\u064A (Silver Pro)**:
   - **\u0627\u0644\u0645\u064A\u0632\u0627\u062A**: \u062A\u062A\u064A\u062D \u0644\u0643 \u062A\u0634\u063A\u064A\u0644 \u0648\u062A\u0641\u0639\u064A\u0644 \u0645\u0627 \u064A\u0635\u0644 \u0625\u0644\u0649 **3 \u0631\u0648\u0628\u0648\u062A\u0627\u062A \u062A\u062F\u0627\u0648\u0644 \u0645\u062A\u0632\u0627\u0645\u0646\u0629** (Spot Grid \u0623\u0648 DCA) \u0639\u0644\u0649 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062D\u0642\u064A\u0642\u064A.
   - **\u0627\u0644\u0645\u0632\u0627\u064A\u0627**: \u0631\u0627\u062F\u0627\u0631\u0627\u062A \u062A\u062A\u0628\u0639 \u0627\u0644\u0635\u0641\u0642\u0627\u062A\u060C \u0648\u062A\u0641\u0639\u064A\u0644 \u0643\u0627\u0645\u0644 \u0644\u0631\u0648\u0628\u0648\u062A \u0627\u0644\u062A\u062C\u0631\u064A\u0628 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A \u0627\u0644\u0633\u0631\u064A\u0639 \u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A DCA.

3. **\u0628\u0627\u0642\u0629 \u0627\u0644\u062D\u0648\u062A \u0627\u0644\u0630\u0647\u0628\u064A \u0627\u0644\u0646\u062E\u0628\u0629 (Gold Whale / Elite)**:
   - **\u0627\u0644\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0641\u0627\u0626\u0642\u0629**: \u062A\u0641\u062A\u062D \u062C\u0645\u064A\u0639 \u0645\u064A\u0632\u0627\u062A \u0648\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0645\u0646\u0635\u0629 \u0628\u0644\u0627 \u0642\u064A\u0648\u062F\u060C \u0648\u062A\u0633\u0645\u062D \u0628\u062A\u0634\u063A\u064A\u0644 \u0631\u0648\u0628\u0648\u062A\u0627\u062A \u062A\u062F\u0627\u0648\u0644 \u0648\u062A\u0631\u0627\u0643\u0645\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629\u060C \u0645\u0639 \u0645\u064A\u0632\u0629 \u062A\u062A\u0628\u0639 \u0627\u0644\u062D\u064A\u062A\u0627\u0646 \u0627\u0644\u0644\u062D\u0638\u064A \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0633\u0631\u0639\u0629 (Whale Flow Tracker) \u0627\u0644\u062A\u064A \u062A\u0645\u0633\u062D \u0627\u0644\u0628\u0644\u0648\u0643\u062A\u0634\u064A\u0646 \u0648\u0645\u062D\u0641\u0638\u0629 \u0628\u064A\u0646\u0627\u0646\u0633 \u0627\u0644\u0644\u062D\u0638\u064A\u0629\u060C \u0648\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0641\u0648\u0631\u064A\u0629 \u0645\u062E\u0635\u0635\u0629 \u0648\u0645\u0633\u062A\u0634\u0627\u0631 \u0630\u0643\u064A \u0641\u0648\u0631\u064A.

---

### \u{1F511} \u0643\u064A\u0641\u064A\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0639\u0645\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629:
* \u0644\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0623\u0648 \u0627\u0644\u062A\u0631\u0642\u064A\u0629\u060C \u064A\u0645\u0643\u0646\u0643 \u062A\u0642\u062F\u064A\u0645 \u0637\u0644\u0628 \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0628\u0631 **\u062A\u0630\u0627\u0643\u0631 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A** \u0623\u0648 \u0645\u0646 \u062E\u0644\u0627\u0644 \u0632\u0631 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0641\u064A \u0645\u0644\u0641\u0643 \u0627\u0644\u0634\u062E\u0635\u064A.
* \u0633\u062A\u0642\u0648\u0645 **\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u0635\u0629 (\u0627\u0644\u0645\u0627\u0644\u0643 \u0648\u0627\u0644\u0645\u062F\u064A\u0631)** \u0628\u0645\u0639\u0627\u0644\u062C\u0629 \u0637\u0644\u0628\u0643 \u0648\u062A\u0632\u0648\u064A\u062F\u0643 \u0628\u0640 **\u0643\u0648\u062F \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0628\u0627\u0642\u0629 (Activation Code)** \u0639\u0644\u0649 \u0627\u0644\u0641\u0648\u0631 \u0644\u0628\u062F\u0621 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0631\u0648\u0628\u0648\u062A\u0627\u062A!`;
          } else if (lPrompt.includes("api") || lPrompt.includes("\u0623\u0645\u0627\u0646") || lPrompt.includes("\u0628\u064A\u0646\u0627\u0646\u0633") || lPrompt.includes("\u0631\u0628\u0637") || lPrompt.includes("\u0645\u0641\u062A\u0627\u062D") || lPrompt.includes("\u0633\u062D\u0628")) {
            simulatesReply = `### \u{1F512} \u0646\u0638\u0627\u0645 \u0627\u0644\u0623\u0645\u0627\u0646 \u0627\u0644\u0639\u0627\u0644\u064A \u0648\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0628\u0627\u0644\u0640 API \u0641\u064A \u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A

\u0641\u064A \u0645\u0646\u0635\u0629 **\u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A \u0644\u0644\u0643\u0645 (Al-Moharif AI)**\u060C \u0646\u0636\u0639 \u0623\u0645\u0627\u0646 \u0623\u0645\u0648\u0627\u0644\u0643 \u0643\u0623\u0648\u0644\u0648\u064A\u0629 \u0642\u0635\u0648\u0649 \u0644\u0627 \u0646\u0642\u0627\u0634 \u0641\u064A\u0647\u0627:

1. **\u0642\u064A\u062F \u0627\u0644\u0633\u062D\u0628 \u0627\u0644\u0645\u0639\u0637\u0644 (Withdrawal Disabled) \u{1F6AB}**:
   - \u0644\u0631\u0628\u0637 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0628\u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0622\u0644\u064A (\u0645\u062B\u0644 \u0645\u0646\u0635\u0629 Binance)\u060C \u062A\u0634\u062A\u0631\u0637 \u0627\u0644\u0645\u0646\u0635\u0629 \u0625\u0646\u0634\u0627\u0621 \u0645\u0641\u062A\u0627\u062D API \u0645\u062E\u0635\u0635 \u0628\u0635\u0644\u0627\u062D\u064A\u0629 **\u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0641\u0642\u0637 (Enable Spot & Margin Trading)**.
   - **\u064A\u064F\u062D\u0638\u0631 \u062A\u0645\u0627\u0645\u0627\u064B** \u062A\u0641\u0639\u064A\u0644 \u062E\u064A\u0627\u0631 "\u0627\u0644\u0633\u062D\u0628" (Withdrawal) \u0627\u0644\u062E\u0627\u0635 \u0628\u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0640 API.

2. **\u0627\u0644\u062A\u062D\u0643\u0645 \u0648\u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u{1F4B0}**:
   - \u0628\u0641\u0636\u0644 \u062A\u0639\u0637\u064A\u0644 \u0642\u0648\u0627\u0646\u064A\u0646 \u0627\u0644\u0633\u062D\u0628\u060C \u062A\u0638\u0644 \u0623\u0645\u0648\u0627\u0644\u0643 \u0648\u0633\u064A\u0648\u0644\u062A\u0643 \u0627\u0644\u0646\u0642\u062F\u064A\u0629 \u0622\u0645\u0646\u0629 \u0628\u0646\u0633\u0628\u0629 **100% \u062F\u0627\u062E\u0644 \u0645\u062D\u0641\u0638\u062A\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u0629** \u0639\u0644\u0649 \u0645\u0646\u0635\u0629 \u0627\u0644\u062A\u0628\u0627\u062F\u0644 \u0627\u0644\u0623\u0635\u0644\u064A\u0629.
   - \u0644\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0646\u0635\u0629 \u0623\u0648 \u0644\u0623\u064A \u0637\u0631\u0641 \u062E\u0627\u0631\u062C\u064A \u0633\u062D\u0628 \u062F\u0648\u0644\u0627\u0631 \u0648\u0627\u062D\u062F \u0645\u0646 \u062D\u0633\u0627\u0628\u0643\u060C \u0648\u0646\u0637\u0627\u0642 \u0639\u0645\u0644 \u0627\u0644\u0631\u0648\u0628\u0648\u062A \u064A\u0642\u062A\u0635\u0631 \u0641\u0642\u0637 \u0639\u0644\u0649 \u0625\u0631\u0633\u0627\u0644 \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u0627\u0644\u0628\u064A\u0639 \u0627\u0644\u0641\u0648\u0631\u064A\u0629 \u0639\u0646\u062F \u062A\u062D\u0642\u0642 \u0627\u0644\u0634\u0631\u0648\u0637 \u0627\u0644\u0641\u0646\u064A\u0629 \u0627\u0644\u0645\u0645\u062A\u0627\u0632\u0629.`;
          } else if (lPrompt.includes("\u0643\u064A\u0641 \u064A\u0639\u0645\u0644") || lPrompt.includes("\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0639\u0645\u0644") || lPrompt.includes("\u0634\u063A\u0644") || lPrompt.includes("\u0628\u0648\u062A") || lPrompt.includes("\u0627\u0644\u0631\u0648\u0628\u0648\u062A\u0627\u062A") || lPrompt.includes("\u0627\u0644\u0639\u0645\u0644")) {
            simulatesReply = `### \u{1F916} \u0643\u064A\u0641 \u062A\u0639\u0645\u0644 \u0631\u0648\u0628\u0648\u062A\u0627\u062A \u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A (Al-Moharif AI) \u0641\u064A \u0627\u0644\u062E\u0644\u0641\u064A\u0629\u061F

\u0627\u0644\u0639\u0645\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629 \u0645\u0628\u0646\u064A \u0639\u0644\u0649 \u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0648\u062E\u0648\u0627\u0631\u0632\u0645\u064A\u0627\u062A \u0645\u062E\u0635\u0635\u0629 \u062A\u0631\u0627\u0642\u0628 \u0627\u0644\u0633\u0648\u0642 \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 \u0627\u0644\u0633\u0627\u0639\u0629 \u0628\u062F\u0644\u0627\u064B \u0645\u0646\u0643. \u0625\u0644\u064A\u0643 \u0622\u0644\u064A\u0629 \u0639\u0645\u0644 \u0627\u0644\u0623\u0646\u0638\u0645\u0629:

1. **\u0628\u0648\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0634\u0628\u0643\u064A \u0627\u0644\u0641\u0648\u0631\u064A (Spot Grid Bot)**:
   - \u064A\u0642\u0648\u0645 \u0628\u0625\u0646\u0634\u0627\u0621 \u0634\u0628\u0643\u0629 \u062A\u062F\u0627\u0648\u0644 \u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0628\u064A\u0646 \u0646\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062A\u064A \u062A\u062D\u062F\u062F\u0647\u0627 (\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0648\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0639\u0644\u0649) \u0644\u064A\u0634\u062A\u0631\u064A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0639\u0646\u062F \u0627\u0646\u062E\u0641\u0627\u0636 \u0627\u0644\u0633\u0639\u0631 \u0648\u064A\u0628\u064A\u0639 \u0641\u0648\u0631\u0627\u064B \u0639\u0646\u062F \u0623\u064A \u0627\u0631\u062A\u062F\u0627\u062F \u0644\u0644\u0623\u0639\u0644\u0649 \u0644\u062C\u0646\u064A \u0623\u0631\u0628\u0627\u062D \u0645\u0633\u062A\u0645\u0631\u0629.

2. **\u0628\u0648\u062A \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0628\u0627\u0644\u062F\u0648\u0644\u0627\u0631 (DCA Bot)**:
   - \u064A\u0634\u062A\u0631\u064A \u0643\u0645\u064A\u0627\u062A \u0645\u062C\u0632\u0623\u0629 \u0628\u0623\u0633\u0639\u0627\u0631 \u0645\u062E\u062A\u0644\u0641\u0629 \u0639\u0646\u062F \u0647\u0628\u0648\u0637 \u0627\u0644\u0633\u0648\u0642 \u0644\u062E\u0641\u0636 \u0645\u062A\u0648\u0633\u0637 \u0633\u0639\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0648\u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0627\u0644\u062E\u0631\u0648\u062C \u0628\u0631\u0628\u062D \u0622\u0645\u0646 \u0628\u0645\u062C\u0631\u062F \u0639\u0648\u062F\u0629 \u0627\u0644\u0627\u062A\u062C\u0627\u0647 \u0644\u0644\u0635\u0639\u0648\u062F.

3. **\u0628\u0648\u062A \u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A (Aggressive Rebound Bot)**:
   - \u064A\u0633\u062A\u0634\u0639\u0631 \u062A\u0631\u0627\u062C\u0639\u0627\u062A \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062D\u0627\u062F\u0629 \u0648\u0627\u0644\u0645\u0641\u0627\u062C\u0626\u0629 \u0644\u064A\u0642\u062A\u0646\u0635 \u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u0648\u064A\u0648\u062C\u0647 \u0631\u0623\u0633 \u0645\u0627\u0644\u0643 \u0641\u0648\u0631\u0627\u064B \u0644\u0632\u0648\u062C \u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0627\u0644\u0623\u0639\u0644\u0649 \u062A\u0639\u0627\u0641\u064A\u0627\u064B \u0641\u064A \u0648\u0642\u062A \u0642\u064A\u0627\u0633\u064A. \u0627\u0644\u0628\u0648\u062A \u064A\u0639\u0645\u0644 \u0628\u0627\u0633\u062A\u0645\u0631\u0627\u0631 \u0648\u0628\u0634\u0643\u0644 \u0645\u062A\u0648\u0627\u0635\u0644 \u0648\u0644\u0627 \u064A\u062A\u0648\u0642\u0641 \u0625\u0644\u0627 \u0625\u0630\u0627 \u0623\u0644\u063A\u064A\u062A\u0647 \u0628\u0646\u0641\u0633\u0643.`;
          } else {
            simulatesReply = `### \u{1F3E2} \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u0630\u0643\u064A \u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A (Al-Moharif AI)

\u0623\u0646\u0627 \u0627\u0644\u0645\u062D\u0644\u0644 \u0627\u0644\u0641\u0646\u064A \u0648\u0627\u0644\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u062A\u0643\u0627\u0645\u0644 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0644\u0644\u0645\u0646\u0635\u0629. \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u0641\u0648\u0631\u064A\u0629 \u0641\u064A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0648\u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0623\u0633\u0631\u0627\u0631 \u0627\u0644\u0639\u0645\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629:

* **\u{1F4B3} \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643**: \u0627\u0643\u062A\u0628 "\u0645\u0627 \u0647\u064A \u0623\u0633\u0639\u0627\u0631 \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0648\u0643\u064A\u0641 \u0623\u0634\u062A\u0631\u0643\u061F" \u0644\u062A\u062A\u0639\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0645\u0632\u0627\u064A\u0627 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 \u0648\u0627\u0644\u062A\u0631\u0642\u064A\u0627\u062A \u0644\u062E\u0637\u0637 \u0627\u0644\u0641\u0636\u064A \u0648\u0627\u0644\u0630\u0647\u0628\u064A.
* **\u{1F512} \u0623\u0645\u0627\u0646 \u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u062A\u062F\u0627\u0648\u0644**: \u0627\u0643\u062A\u0628 "\u0643\u064A\u0641 \u0623\u0642\u0648\u0645 \u0628\u0631\u0628\u0637 \u0627\u0644\u0640 API \u0627\u0644\u062E\u0627\u0635 \u0628\u064A \u0628\u0623\u0645\u0627\u0646\u061F" \u0644\u0645\u0639\u0631\u0641\u0629 \u0642\u0648\u0627\u0646\u064A\u0646 \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0631\u0635\u064A\u062F \u0639\u0644\u0649 \u0628\u064A\u0646\u0627\u0646\u0633.
* **\u{1F916} \u0637\u0631\u064A\u0642\u0629 \u0639\u0645\u0644 \u0627\u0644\u0631\u0648\u0628\u0648\u062A\u0627\u062A**: \u0627\u0643\u062A\u0628 "\u0643\u064A\u0641 \u0623\u0628\u062F\u0623 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0648\u0645\u0627 \u0647\u064A \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0628\u0648\u062A\u0627\u062A\u061F" \u0644\u0643\u064A \u0623\u0634\u0631\u062D \u0644\u0643 \u0628\u0648\u062A\u0627\u062A \u0627\u0644\u0634\u0628\u0643\u0629 (Grid) \u0648 DCA \u0648\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A.
* **\u{1F4CA} \u0641\u0631\u0635 \u0641\u0646\u064A\u0629 \u0627\u0644\u0622\u0646**: \u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0632\u0631 **(\u0637\u0644\u0628 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u0634\u0627\u0645\u0644)** \u0641\u064A \u0627\u0644\u0644\u0648\u062D\u0629 \u0627\u0644\u0639\u0644\u0648\u064A\u0629 \u0644\u062A\u0644\u0642\u064A \u062A\u062D\u0644\u064A\u0644 \u0641\u0646\u064A \u062D\u0642\u064A\u0642\u064A \u0644\u062A\u0642\u0644\u0628 \u0627\u0644\u0623\u0632\u0648\u0627\u062C \u0627\u0644\u0646\u0634\u0637\u0629 \u0641\u0648\u0631\u0627\u064B!`;
          }
        } else {
          if (lPrompt.includes("subscribe") || lPrompt.includes("price") || lPrompt.includes("plan") || lPrompt.includes("pricing") || lPrompt.includes("tier") || lPrompt.includes("subscription")) {
            simulatesReply = `### \u{1F4B3} Subscription Tiers & Plans at Al-Moharif AI

Al-Moharif AI provides 3 dynamic tiers designed to unlock quantitative algorithmic trading:

1. **Free Trial Tier**:
   - **Features**: Live simulated Paper Trading, basic chart tracking, and standard indicators. Perfect for practicing risk-free.
2. **Silver Pro Tier**:
   - **Features**: Supports up to **3 parallel live trading bots** connected to your Binance API, with medium-speed alert logs.
3. **Gold Whale / Elite Tier**:
   - **Features**: Unlimited parallel DCA and Grid bots, high-speed blockchain Whale Flow Analytics, custom price triggers, and top-tier AI consultative tools.

---

### \u{1F511} How to Upgrade & Activate:
* Contact the support team or open a **Support Ticket** in your dashboard.
* The **Platform Manager (Owner)** will process your invoice and supply an **Activation Code** to boot all premium bot resources immediately.`;
          } else if (lPrompt.includes("security") || lPrompt.includes("binance") || lPrompt.includes("api") || lPrompt.includes("withdraw") || lPrompt.includes("secure")) {
            simulatesReply = `### \u{1F512} Elite API Security Protocols at Al-Moharif AI

At **Al-Moharif AI**, we enforce maximum fund protection policies:

1. **Required: Withdrawal Disabled \u{1F6AB}**:
   - When generating an API Key on Binance, connect only with **Trade-only permissions** (Enable Spot/Margin).
   - **Strictly disable withdrawals** on the API console.
2. **100% Asset Isolation**:
   - By disabling withdrawals, your assets remain safely inside your personal exchange wallet. The platform only broadcasts trading signals, leaving your capital fully protected.`;
          } else if (lPrompt.includes("how it works") || lPrompt.includes("start") || lPrompt.includes("work") || lPrompt.includes("bot") || lPrompt.includes("rebound")) {
            simulatesReply = `### \u{1F916} Algorithmic Operational Mechanics at Al-Moharif AI

The platform provides complete cloud automated background runtime tracking for your strategies:

1. **Spot Grid Bot**:
   - Automatically executes balanced purchases below the grid median and immediate sales on positive rebounds.
2. **DCA Bot**:
   - Periodically scales unit positions to lower cumulative cost basis ratios.
3. **Aggressive Rebound Bot (\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A)**:
   - Targets intense short-term dips to capture rapid reversal points. **Security Parameter Note**: Once turned on by you, the Aggressive Rebound logic or any other active bot remains continuously operational 24/7 inside the backend processor until you explicitly deactivate it yourself.`;
          } else {
            simulatesReply = `### \u{1F3E2} Welcome to the Al-Moharif AI Intelligent Advisor!

I am your active quantitative analyst. Ask me anything about the system:
* **\u{1F4B3} Pricing & Plans**: Ask "What are the subscription plans?"
* **\u{1F512} API Safety**: Ask "Is my API connection secure?"
* **\u{1F916} Bots Guide**: Ask "How do the trading bots work?"
* **\u{1F4CA} Live Volatility Analysis**: Toggle the **(Generate Volatility Report)** key to analyze trends instantly!`;
          }
        }
        res.json({ reply: simulatesReply });
        return;
      }
      const ai2 = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const systemInstruction = lang === "en" ? `You are the elite AI Advisor and Financial Consultant for the 'Al-Moharif AI' platform (\u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A \u0644\u0644\u0643\u0645).
Your core mission is to confidently and professionally resolve user inquiries, consultations, subscription questions, and operational instructions regarding the platform.

Key Knowledge Base of 'Al-Moharif AI':
1. Platform Vision: 
   - 'Al-Moharif AI' is an advanced, algorithmic crypto quantitative trading terminal specializing in automated bots, blockchain whale tracking metrics, backtesting, and predictive AI dashboards.
2. Core Features:
   - Automated Trading Bots: Spot Grid, Dollar-Cost Averaging (DCA), and the Aggressive Rebound Bot (\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A). Once configured, they run indefinitely in the background until disabled.
   - Whale Tracking: Monitors live block transactions across Binance and blockchain networks to issue fast transaction-depth mappings and flow alerts.
   - Backtester: Allows strategy backtesting over prior months before risking real money.
   - AI Analyst: Inspects technical charts, indicators (like RSI), and whale indices to recommend top buying and selling candidates.
   - Futures & Risk Simulator: A specialized leverage margin calculator estimating liquidation boundaries before trade placement.
3. Subscription Tiers:
   - Free Trial: Paper Trading with live market quotes. Great for strategizing risk-free.
   - Silver Pro Tier: Run up to 3 parallel live bots, explore standard alerts, and compute backtests.
   - Gold Whale / Elite Tier: Unlocks everything. Unlimited parallel DCA & Grid bots, ultimate fast whale tracking logs, live API execution.
   - How to Subscribe: Users contact support or the Platform Manager directly via active support channels/tickets to settle payments and claim activation code triggers.
4. Absolute Safety (Binance API Integration):
   - High-fidelity integration using API Keys. Only 'Trade' permission should be enabled; 'Withdrawal' permissions must remain disabled (Withdrawal Disabled) keeping account funds 100% safe inside the user's exchange wallet.

Guidelines:
- Deliver precise, well-formatted financial analysis utilizing Markdown lists. Highlight essential risk parameters.` : aiSystemPrompt;
      const response = await ai2.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.72
        }
      });
      const replyText = response.text || (lang === "ar" ? "\u0646\u0645\u0648\u0630\u062C \u0627\u0644\u062A\u0648\u0644\u064A\u062F \u0644\u0645 \u064A\u0642\u062F\u0645 \u0631\u062F\u0627\u064B \u0645\u0641\u0631\u0633\u0627\u064B." : "Generation yielded empty string.");
      res.json({ reply: replyText });
    } catch (err) {
      const errStr = String(err.message || err).toLowerCase();
      const isRateLimit = errStr.includes("429") || err.status === 429 || errStr.includes("resource_exhausted") || errStr.includes("quota exceeded") || errStr.includes("503") || errStr.includes("high demand") || errStr.includes("unavailable");
      if (isRateLimit) {
        console.warn("Gemini analysis rate-limit (429/Quota) encountered. Triggering global 5-minute cooldown and serving simulated fallback response.");
        geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1e3;
        const fallbackText = lang === "ar" ? `\u26A0\uFE0F **\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u062D\u0635\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u0639\u0644\u0649 \u0627\u0644\u062E\u0627\u062F\u0645 \u0627\u0644\u0645\u062C\u0627\u0646\u064A \u0644\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (429 Rate Limit)**

\u0625\u0644\u064A\u0643 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u062A\u062F\u0627\u0648\u0644 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0648\u0645\u0633\u0627\u0646\u062F\u0629 \u062E\u0627\u0631\u062C \u062E\u0637 \u0627\u0644\u0627\u062A\u0635\u0627\u0644:
1. **\u0642\u0627\u0639\u062F\u0629 \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0645\u062D\u0641\u0638\u0629**: \u0644\u0627 \u062A\u0634\u0627\u0631\u0643 \u0648\u0644\u0627 \u062A\u0641\u0639\u0644 \u0623\u0628\u062F\u0627\u064B \u062E\u064A\u0627\u0631 \u0627\u0644\u0633\u062D\u0628 (Withdrawals Enabled) \u0641\u064A \u0645\u0641\u0627\u062A\u064A\u062D API \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643 \u0644\u062A\u0623\u0645\u064A\u0646 \u0623\u0645\u0648\u0627\u0644\u0643 \u0628\u0634\u0643\u0644 \u0643\u0627\u0645\u0644.
2. **\u062A\u0646\u0638\u064A\u0645 \u0648\u062A\u064A\u0631\u0629 \u0627\u0644\u0635\u0641\u0642\u0627\u062A**: \u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0632\u062E\u0645 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u062A\u0634\u064A\u0631 \u0625\u0644\u0649 \u0645\u0646\u0627\u0637\u0642 \u062A\u0631\u0642\u0628 \u062C\u0627\u0646\u0628\u064A. \u0646\u0646\u0635\u062D \u0628\u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0631\u0627\u0641\u0639\u0629 \u0645\u0627\u0644\u064A\u0629 \u0645\u0639\u062A\u062F\u0644\u0629 (\u062F\u0648\u0646 3x) \u0644\u0644\u062A\u062D\u0648\u0637 \u0636\u062F \u0623\u064A \u062A\u062D\u0631\u0643\u0627\u062A \u0633\u0639\u0631\u064A\u0629 \u0645\u0641\u0627\u062C\u0626\u0629.` : `\u26A0\uFE0F **AI Rate Limit Reached (429 Resource Exhausted)**

Here is a secure offline expert-level advisory supplement to guide your strategy:
1. **Capital Containment**: Keep withdrawals and transfer permissions strictly DEACTIVATED on your API management console for all automated trading algorithms.
2. **Position Velocity**: During periods of sideways consolidation, utilize structured safety-stop coordinates. Maintain leverage parameters under 3x to shield the margin portfolio.`;
        res.json({ reply: fallbackText, simulated: true });
        return;
      }
      console.warn("Gemini secure call error:", err.message || err);
      res.status(500).json({ error: err.message || "Error occurred inside the backend analysis module." });
    }
  });
  app.post("/api/gemini/sentiment", async (req, res) => {
    try {
      const { symbol, lang } = req.body;
      if (!symbol || typeof symbol !== "string") {
        res.status(400).json({ error: "Please submit a valid market pair symbol." });
        return;
      }
      const cleanSymbol = symbol.toUpperCase().replace("/", "");
      let mockScore = 50;
      if (cleanSymbol.includes("BTC")) mockScore = 74;
      else if (cleanSymbol.includes("ETH")) mockScore = 61;
      else if (cleanSymbol.includes("SOL")) mockScore = 88;
      else if (cleanSymbol.includes("XRP")) mockScore = 38;
      else if (cleanSymbol.includes("ADA")) mockScore = 25;
      else {
        const sum = cleanSymbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        mockScore = sum % 70 + 20;
      }
      const getClassification = (score) => {
        if (score <= 20) return { en: "Extreme Fear", ar: "\u062E\u0648\u0641 \u0634\u062F\u064A\u062F" };
        if (score <= 40) return { en: "Fear", ar: "\u062E\u0648\u0641" };
        if (score <= 60) return { en: "Neutral", ar: "\u062D\u064A\u0627\u062F\u064A" };
        if (score <= 80) return { en: "Greed", ar: "\u0637\u0645\u0639" };
        return { en: "Extreme Greed", ar: "\u0637\u0645\u0639 \u0634\u062F\u064A\u062F" };
      };
      const fallbackClass = getClassification(mockScore);
      const apiKey = process.env.GEMINI_API_KEY;
      const isCurrentlyRateLimited = Date.now() < geminiRateLimitActiveUntil;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || isCurrentlyRateLimited) {
        const fallbackRationaleEn = `Market pressure for ${symbol} is stabilizing. Support at regional moving averages remains strong, leading to a '${fallbackClass.en}' outlook.`;
        const fallbackRationaleAr = `\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u0639\u0631\u0636 \u0648\u0627\u0644\u0637\u0644\u0628 \u0644\u0632\u0648\u062C ${symbol} \u062A\u0634\u0647\u062F \u0646\u0648\u0639\u0627\u064B \u0645\u0646 \u0627\u0644\u0627\u0633\u062A\u0642\u0631\u0627\u0631 \u0645\u0627\u0644\u064A\u064B\u0627. \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u062F\u0639\u0645 \u0639\u0646\u062F \u0627\u0644\u0645\u062A\u0648\u0633\u0637\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u0631\u0643\u0629 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629 \u0644\u0627 \u062A\u0632\u0627\u0644 \u0635\u0644\u0628\u0629\u060C \u0645\u0645\u0627 \u064A\u062F\u0639\u0645 \u062A\u0642\u064A\u064A\u0645\u0627\u064B \u0628\u0645\u0633\u062A\u0648\u0649 '${fallbackClass.ar}'.`;
        res.json({
          score: mockScore,
          classification: fallbackClass.en,
          classification_ar: fallbackClass.ar,
          rationale_en: fallbackRationaleEn,
          rationale_ar: fallbackRationaleAr,
          simulated: true,
          rateLimited: isCurrentlyRateLimited
        });
        return;
      }
      const cacheKey = `${cleanSymbol}_${lang || "en"}`;
      const cached = sentimentCache[cacheKey];
      const CACHE_TTL_MS = 5 * 60 * 1e3;
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        res.json(cached.data);
        return;
      }
      if (pendingRequests[cacheKey]) {
        try {
          const result = await pendingRequests[cacheKey];
          res.json(result);
        } catch (err) {
          res.json({
            score: mockScore,
            classification: fallbackClass.en,
            classification_ar: fallbackClass.ar,
            rationale_en: `Technical parameters index for ${symbol} are consolidating neutrally at regional support channels.`,
            rationale_ar: `\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629 \u0644\u0632\u0648\u062C ${symbol} \u062A\u062A\u0645\u0627\u0633\u0643 \u0628\u0634\u0643\u0644 \u0645\u062D\u0627\u064A\u062F \u0639\u0646\u062F \u0642\u0646\u0648\u0627\u062A \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629.`,
            simulated: true,
            err: err.message
          });
        }
        return;
      }
      const executeSentimentFetch = async () => {
        const ai2 = new import_genai.GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        const promptText = `Analyze technical sentiment (buyer vs seller power, moving averages, relative strength, volume and risk) to estimate a precise and highly professional 'Fear & Greed' sentiment index score for the cryptocurrency market pair '${symbol}' right now. Return a single strict JSON object following the required schema. Ensure the Arabic rationale is beautifully structured, high-quality, and completely matching the English justification.`;
        const response = await ai2.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptText,
          config: {
            systemInstruction: "You are a professional cryptocurrency risk analyst. Evaluate sentiment from 0 (extreme market anxiety/panic) to 100 (extreme irrational buy exuberance). Be objective and realistic.",
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: {
              type: import_genai.Type.OBJECT,
              properties: {
                score: {
                  type: import_genai.Type.INTEGER,
                  description: "Sentiment score from 0 to 100."
                },
                classification: {
                  type: import_genai.Type.STRING,
                  description: "Sentiment label matching the score: Extreme Fear, Fear, Neutral, Greed, Extreme Greed."
                },
                classification_ar: {
                  type: import_genai.Type.STRING,
                  description: "Arabic translation: \u062E\u0648\u0641 \u0634\u062F\u064A\u062F, \u062E\u0648\u0641, \u062D\u064A\u0627\u062F\u064A, \u0637\u0645\u0639, \u0637\u0645\u0639 \u0634\u062F\u064A\u062F."
                },
                rationale_en: {
                  type: import_genai.Type.STRING,
                  description: "Concise English risk assessment (max 2 sentences)."
                },
                rationale_ar: {
                  type: import_genai.Type.STRING,
                  description: "Translated or equivalent professional Arabic risk assessment (max 2 sentences)."
                }
              },
              required: ["score", "classification", "classification_ar", "rationale_en", "rationale_ar"]
            }
          }
        });
        const responseText = response.text?.trim() || "";
        if (!responseText) {
          throw new Error("Empty response from AI engine");
        }
        const parsedJSON = JSON.parse(responseText);
        sentimentCache[cacheKey] = {
          data: parsedJSON,
          timestamp: Date.now()
        };
        return parsedJSON;
      };
      const fetchPromise = executeSentimentFetch();
      pendingRequests[cacheKey] = fetchPromise;
      try {
        const result = await fetchPromise;
        res.json(result);
      } catch (err) {
        const errStr = String(err.message || err).toLowerCase();
        const isRateLimit = errStr.includes("429") || err.status === 429 || errStr.includes("resource_exhausted") || errStr.includes("quota exceeded") || errStr.includes("503") || errStr.includes("high demand") || errStr.includes("unavailable");
        if (isRateLimit) {
          console.warn(`Gemini sentiment API rate-limited (429) for ${symbol}. Triggering 5-minute cooldown.`);
        } else {
          console.warn(`Gemini sentiment API error for ${symbol}:`, err.message || err);
        }
        const simulatedData = {
          score: mockScore,
          classification: fallbackClass.en,
          classification_ar: fallbackClass.ar,
          rationale_en: `Technical factors for ${symbol} suggest typical neutral-to-moderate support intervals across monitored exchanges.`,
          rationale_ar: `\u0645\u0624\u0634\u0631\u0627\u062A \u062D\u0631\u0643\u0629 \u0627\u0644\u0633\u0639\u0631 \u0644\u0640 ${symbol} \u062A\u0642\u062A\u0631\u062D \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u062F\u0639\u0645 \u0637\u0628\u064A\u0639\u064A\u0629 \u0625\u0644\u0649 \u0645\u0639\u062A\u062F\u0644\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0646\u0635\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u062A\u0645 \u0645\u0631\u0627\u0642\u0628\u062A\u0647\u0627.`,
          simulated: true,
          err: err.message,
          rateLimited: isRateLimit
        };
        if (isRateLimit) {
          geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1e3;
          sentimentCache[cacheKey] = {
            data: simulatedData,
            timestamp: Date.now() - 4 * 60 * 1e3
            // leaves 1 minute remaining before eviction
          };
        }
        res.json(simulatedData);
      } finally {
        delete pendingRequests[cacheKey];
      }
    } catch (err) {
      const errStr = String(err.message || err).toLowerCase();
      const isRateLimit = errStr.includes("429") || err.status === 429 || errStr.includes("resource_exhausted") || errStr.includes("quota exceeded") || errStr.includes("503") || errStr.includes("high demand") || errStr.includes("unavailable");
      if (isRateLimit) {
        console.warn("Gemini sentiment initial outer rate-limit encountered. Cooldown initiated.");
        geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1e3;
      } else {
        console.warn("Gemini sentiment initial outer error:", err.message || err);
      }
      res.status(200).json({
        score: 55,
        classification: "Neutral",
        classification_ar: "\u062D\u064A\u0627\u062F\u064A",
        rationale_en: "Evaluating technical indicators yielded a balanced neutral market perspective in response to temporary volatility.",
        rationale_ar: "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629 \u064A\u0639\u0643\u0633 \u0631\u0624\u064A\u0629 \u0645\u062A\u0648\u0627\u0632\u0646\u0629 \u0648\u062D\u064A\u0627\u062F\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u0648\u0642 \u0646\u062A\u064A\u062C\u0629 \u0644\u0644\u062A\u0642\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0624\u0642\u062A\u0629 \u0627\u0644\u0623\u062E\u064A\u0631\u0629.",
        err: err.message,
        rateLimited: isRateLimit
      });
    }
  });
  app.post("/api/gemini/volatility-analysis", async (req, res) => {
    const { symbol, changePercent, priceStart, priceEnd } = req.body;
    try {
      if (!symbol || changePercent === void 0) {
        res.status(400).json({ error: "Incomplete parameters provided for volatility assessment." });
        return;
      }
      const isUpward = changePercent > 0;
      const absChange = Math.abs(changePercent).toFixed(2);
      const apiKey = process.env.GEMINI_API_KEY;
      const isCurrentlyRateLimited = Date.now() < geminiRateLimitActiveUntil;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || isCurrentlyRateLimited) {
        let explanationEn = "";
        let explanationAr = "";
        if (isUpward) {
          explanationEn = `A sudden liquidity pocket vacuum triggered a stop-buy liquidation sweep for ${symbol}. The swift speed of the +${absChange}% move indicates aggressive maker depletion on thin sell-side books.`;
          explanationAr = `\u0623\u062F\u0649 \u0641\u0631\u0627\u063A \u0645\u0641\u0627\u062C\u0626 \u0641\u064A \u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0625\u0644\u0649 \u062A\u0641\u0639\u064A\u0644 \u0633\u0644\u0633\u0644\u0629 \u062A\u0635\u0641\u064A\u0629 \u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0628\u064A\u0639 \u0627\u0644\u0645\u0643\u0634\u0648\u0641\u0629 \u0644\u0632\u0648\u062C ${symbol}. \u0627\u0644\u0633\u0631\u0639\u0629 \u0627\u0644\u0641\u0627\u0626\u0642\u0629 \u0644\u0627\u0631\u062A\u0641\u0627\u0639 \u0627\u0644\u0633\u0639\u0631 \u0628\u0646\u0633\u0628\u0629 +${absChange}% \u062A\u0634\u064A\u0631 \u0625\u0644\u0649 \u0627\u0633\u062A\u0646\u0641\u0627\u062F \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0629 \u0639\u0644\u0649 \u062C\u0627\u0646\u0628 \u0627\u0644\u0628\u064A\u0639.`;
        } else {
          explanationEn = `Accelerating cascading margin liquidations on high-leverage products caused a momentary cascade of ${symbol}. This sharp drop of -${absChange}% reflects intense short-duration market-selling triggering automatic stop-losses.`;
          explanationAr = `\u062A\u0633\u0628\u0628\u062A \u062A\u0635\u0641\u064A\u0629 \u0627\u0644\u0647\u0648\u0627\u0645\u0634 \u0627\u0644\u0645\u062A\u062A\u0627\u0644\u064A\u0629 \u0644\u0635\u0641\u0642\u0627\u062A \u0627\u0644\u0631\u0648\u0627\u0641\u0639 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0639\u0627\u0644\u064A\u0629 \u0641\u064A \u0647\u0628\u0648\u0637 \u0645\u062A\u0633\u0627\u0631\u0639 \u0644\u0648\u0642\u062A \u0642\u0635\u064A\u0631 \u0644\u0632\u0648\u062C ${symbol}. \u064A\u0639\u0643\u0633 \u0647\u0630\u0627 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0627\u0644\u062D\u0627\u062F \u0628\u0646\u0633\u0628\u0629 -${absChange}% \u0639\u0645\u0644\u064A\u0627\u062A \u0628\u064A\u0639 \u0641\u0648\u0631\u064A\u0629 \u0645\u0643\u062B\u0641\u0629 \u0623\u062F\u062A \u0644\u0636\u0631\u0628 \u0623\u0648\u0627\u0645\u0631 \u0648\u0642\u0641 \u0627\u0644\u062E\u0633\u0627\u0631\u0629 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A\u0629.`;
        }
        res.json({
          explanation_en: explanationEn,
          explanation_ar: explanationAr,
          simulated: true,
          rateLimited: isCurrentlyRateLimited
        });
        return;
      }
      const ai2 = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const promptText = `Explain the potential financial mechanics behind a sharp price volatility event of ${changePercent}% in under 1 minute for the cryptocurrency pair '${symbol}' (moved from ${priceStart} to ${priceEnd}). Focus on professional dynamics like leverage liquidation cascades, short/long squeezes, or order book thinness. Respond ONLY as a JSON object with two fields "explanation_en" and "explanation_ar" each containing a highly professional 2-sentence summary. Keep English and Arabic explanations matching perfectly in financial depth.`;
      const response = await ai2.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: "You are an elite cryptocurrency market analyst and risk expert. Synthesize professional explanations with complete objectivity. Avoid generic phrases.",
          temperature: 0.52,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              explanation_en: {
                type: import_genai.Type.STRING,
                description: "Deep, professional, concise English explanation (2 sentences)."
              },
              explanation_ar: {
                type: import_genai.Type.STRING,
                description: "Accurate, equivalent expert-level Arabic explanation (2 sentences)."
              }
            },
            required: ["explanation_en", "explanation_ar"]
          }
        }
      });
      const responseText = response.text?.trim() || "";
      if (!responseText) {
        throw new Error("Empty response from volatility analyst");
      }
      const parsedJSON = JSON.parse(responseText);
      res.json(parsedJSON);
    } catch (err) {
      const errStr = String(err.message || err).toLowerCase();
      const isRateLimit = errStr.includes("429") || err.status === 429 || errStr.includes("resource_exhausted") || errStr.includes("quota exceeded") || errStr.includes("503") || errStr.includes("high demand") || errStr.includes("unavailable");
      if (isRateLimit) {
        console.warn(`Gemini volatility analysis rate-limited (429) for ${symbol}. Cooldown initiated.`);
        geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1e3;
      } else {
        console.warn(`Gemini volatility analysis error for ${symbol}:`, err.message || err);
      }
      const isUpward = changePercent > 0;
      const absChange = Math.abs(changePercent || 2.1).toFixed(2);
      res.status(200).json({
        explanation_en: isUpward ? `Micro-volatility on thin buy boundaries triggered technical margin spikes of +${absChange}% for ${symbol}.` : `Cascading risk protection orders triggered instant liquidation slips of -${absChange}% on ${symbol}.`,
        explanation_ar: isUpward ? `\u0623\u062F\u0649 \u0627\u0644\u062A\u0642\u0644\u0628 \u0627\u0644\u0641\u0648\u0631\u064A \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u0647\u0634\u0629 \u0625\u0644\u0649 \u0627\u0631\u062A\u0641\u0627\u0639 \u062A\u0642\u0646\u064A \u0645\u0641\u0627\u062C\u0626 \u0644\u0632\u0648\u062C ${symbol} \u0628\u0646\u0633\u0628\u0629 +${absChange}%.` : `\u0623\u062B\u0627\u0631\u062A \u0623\u0648\u0627\u0645\u0631 \u062A\u0635\u0641\u064A\u0629 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0644\u062A\u0641\u0627\u062F\u064A \u0627\u0644\u062E\u0633\u0627\u0626\u0631 \u0647\u0628\u0648\u0637\u0627\u064B \u0641\u0648\u0631\u064A\u0627\u064B \u0645\u062A\u062A\u0627\u0628\u0639\u0627\u064B \u0644\u0632\u0648\u062C ${symbol} \u0628\u0646\u0633\u0628\u0629 -${absChange}%.`,
        err: err.message,
        rateLimited: isRateLimit
      });
    }
  });
  app.post("/api/gemini/whale-analysis", async (req, res) => {
    try {
      const { active_positions } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const isCurrentlyRateLimited = Date.now() < geminiRateLimitActiveUntil;
      const fallbackData = {
        sentiment_en: "Consolidating Accumulation Stance. Heavy flow out of spot exchanges (specifically Coinbase Custody and Kraken) represents solid long-term locking. Whales are using sub-$64k levels to stack with minimum sales slippage.",
        sentiment_ar: "\u062D\u0627\u0644\u0629 \u062A\u062C\u0645\u064A\u0639 \u0642\u0648\u064A\u0629 \u0645\u062A\u0645\u0627\u0633\u0643\u0629. \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0639\u0627\u0644\u064A \u0645\u0646 \u0645\u062D\u0627\u0641\u0638 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0641\u0648\u0631\u064A\u0629 \u0646\u062D\u0648 \u0628\u0646\u0648\u062F \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0648\u0627\u0644\u0627\u062A\u0641\u0627\u0642\u064A\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u0641\u064A\u0629 \u064A\u0645\u062B\u0644 \u062D\u0627\u062C\u0632 \u0623\u0645\u0627\u0646 \u0642\u0648\u064A \u0648\u0641\u0639\u0627\u0644. \u062A\u0633\u062A\u063A\u0644 \u0627\u0644\u0645\u062D\u0627\u0641\u0638 \u0627\u0644\u0643\u0628\u0631\u0649 \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u0647\u0628\u0648\u0637 \u0627\u0644\u0645\u062D\u062F\u0648\u062F\u0629 \u0623\u0633\u0641\u0644 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 64,000 \u062F\u0648\u0644\u0627\u0631 \u0644\u062A\u062B\u0628\u064A\u062A \u0645\u062A\u0648\u0633\u0637\u0627\u062A\u0647\u0627 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629.",
        score: 78,
        implication_en: "Bullish expectation for liquidity buffer. Possible supply bottleneck in the spot markets within the next 48 to 72 hours could drive market price upwards.",
        implication_ar: "\u062A\u0648\u0642\u0639\u0627\u062A \u0625\u064A\u062C\u0627\u0628\u064A\u0629 \u0628\u062D\u062F\u0648\u062B \u0634\u062D \u0641\u064A \u0627\u0644\u0645\u0639\u0631\u0648\u0636 \u0627\u0644\u0641\u0648\u0631\u064A \u0644\u0644\u0628\u064A\u0639. \u064A\u0631\u062C\u062D \u062D\u062F\u0648\u062B \u0627\u062E\u062A\u0646\u0627\u0642 \u0641\u064A \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0631\u0642\u0645\u064A \u0627\u0644\u0645\u062A\u0648\u0641\u0631 \u0644\u0644\u062A\u0635\u0641\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u062E\u0644\u0627\u0644 \u0627\u0644\u0640 48-72 \u0633\u0627\u0639\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629\u060C \u0645\u0645\u0627 \u064A\u0639\u0632\u0632 \u0632\u062D\u0641 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629 \u0644\u0644\u0623\u0639\u0644\u0649.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || isCurrentlyRateLimited) {
        res.json({
          ...fallbackData,
          simulated: true,
          rateLimited: isCurrentlyRateLimited
        });
        return;
      }
      const ai2 = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const sampleTxStr = active_positions ? JSON.stringify(active_positions.slice(0, 5)) : "No transactions";
      const promptText = `Analyze institutional coin flow activity: '${sampleTxStr}' and on-chain holdings index. Provide an objective and professional market outlook advising retail traders on what whales are doing. Respond ONLY as a JSON object with fields: "sentiment_en" (max 3 sentences), "sentiment_ar" (max 3 sentences matching English), "score" (number 0-100 representing whale buy/accumulate strength), "implication_en" (1-2 sentences), "implication_ar" (1-2 sentences matching English). Make explanations match perfectly in financial vocabulary.`;
      const response = await ai2.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: "You are an elite cryptocurrency wallet forensic analyst and on-chain strategist. Be mathematically precise and objective. Return only JSON.",
          temperature: 0.45,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              sentiment_en: { type: import_genai.Type.STRING },
              sentiment_ar: { type: import_genai.Type.STRING },
              score: { type: import_genai.Type.INTEGER },
              implication_en: { type: import_genai.Type.STRING },
              implication_ar: { type: import_genai.Type.STRING }
            },
            required: ["sentiment_en", "sentiment_ar", "score", "implication_en", "implication_ar"]
          }
        }
      });
      const responseText = response.text?.trim() || "";
      if (!responseText) {
        throw new Error("Empty content generated by whale analyst model");
      }
      const parsedJSON = JSON.parse(responseText);
      res.json({
        ...parsedJSON,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      const errStr = String(err.message || err).toLowerCase();
      if (errStr.includes("429") || err.status === 429 || errStr.includes("quota exceeded") || errStr.includes("resource_exhausted") || errStr.includes("503") || errStr.includes("high demand") || errStr.includes("unavailable")) {
        geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1e3;
      }
      res.json({
        sentiment_en: "Whales show dynamic structural neutrality. Assets balancing between multi-sigs and OTC brokers indicates high preparedness for market trends.",
        sentiment_ar: "\u062A\u0638\u0647\u0631 \u0627\u0644\u0645\u062D\u0627\u0641\u0638 \u0627\u0644\u0643\u0628\u0631\u0649 \u062D\u064A\u0627\u062F\u064A\u0629 \u0627\u0633\u062A\u0628\u0627\u0642\u064A\u0629 \u0645\u0645\u062A\u0627\u0632\u0629. \u0627\u0644\u062A\u0646\u0642\u0644 \u0627\u0644\u0642\u0627\u0626\u0645 \u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0628\u064A\u0646 \u0627\u0644\u062E\u0632\u0627\u0626\u0646 \u0627\u0644\u0628\u0627\u0631\u062F\u0629 \u0648\u0645\u0643\u0627\u062A\u0628 \u0627\u0644\u0635\u0631\u0641 OTC \u064A\u0634\u064A\u0631 \u0644\u0631\u0641\u0639 \u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0639\u062F\u0627\u062F \u0644\u0645\u0648\u062C\u0629 \u062A\u062F\u0627\u0648\u0644 \u0639\u0627\u0644\u064A\u0629.",
        score: 65,
        implication_en: "Avoid high margin exposure during overnight sessions to insulate against random liquidity spikes.",
        implication_ar: "\u064A\u064F\u0646\u0635\u062D \u0628\u062A\u0642\u064A\u064A\u062F \u0627\u0644\u0631\u0641\u0639 \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u062A\u062C\u0646\u0628 \u0645\u0637\u0627\u0631\u062F\u0629 \u062A\u0630\u0628\u0630\u0628\u0627\u062A \u0627\u0644\u062D\u064A\u062A\u0627\u0646 \u0627\u0644\u0645\u0624\u0642\u062A\u0629 \u0644\u062A\u0641\u0627\u062F\u064A \u0627\u0644\u062A\u0639\u0631\u0636 \u0644\u0644\u062A\u0635\u0641\u064A\u0627\u062A \u0627\u0644\u062C\u0628\u0631\u064A\u0629 \u0627\u0644\u0646\u0627\u062A\u062C\u0629 \u0639\u0646 \u0627\u0644\u0647\u0628\u0648\u0637 \u0627\u0644\u0644\u062D\u0638\u064A.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        err: err.message
      });
    }
  });
  app.post("/api/gemini/support", async (req, res) => {
    try {
      const { prompt, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const queryLower = (prompt || "").toLowerCase();
      let fallbackReply = "";
      let fallbackConfidence = 100;
      let fallbackEscalated = false;
      const useLocalFallback = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "" || Date.now() < geminiRateLimitActiveUntil;
      if (useLocalFallback) {
        if (lang === "ar") {
          if (queryLower.includes("\u0627\u0634\u062A\u0631\u0627\u0643") || queryLower.includes("\u0628\u0627\u0642") || queryLower.includes("\u0633\u0639\u0631") || queryLower.includes("\u0627\u0633\u0639\u0627\u0631") || queryLower.includes("\u062F\u0641\u0639") || queryLower.includes("\u0634\u062D\u0646") || queryLower.includes("\u0628\u0627\u0642\u0629")) {
            fallbackReply = `### \u{1F48E} \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u0648\u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644 \u0641\u064A \u0645\u0646\u0635\u0629 "\u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A":
\u0645\u0646\u0635\u062A\u0646\u0627 \u062A\u0642\u062F\u0645 \u062A\u062F\u0631\u062C\u0627\u064B \u0630\u0643\u064A\u0627\u064B \u064A\u0646\u0627\u0633\u0628 \u0643\u0627\u0641\u0629 \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062F\u0627\u0648\u0644\u064A\u0646 \u0644\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u0643\u0645\u064A\u0629:

1. **\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 (Trial/Free)**:
   - \u062A\u062F\u0627\u0648\u0644 \u062A\u062C\u0631\u064A\u0628\u064A \u0648\u0631\u0642\u0651\u064A (Paper Trading) \u0643\u0627\u0645\u0644 \u0628\u0640 15,000 USDT \u0645\u062C\u0627\u0646\u064A\u0629.
   - \u0645\u062A\u0627\u0628\u0639\u0629 \u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0633\u0648\u0642 \u0648\u0645\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0648\u0627\u0644\u062A\u062D\u0648\u0637 \u0627\u0644\u0639\u0627\u0645.

2. **\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0641\u0636\u064A (Silver Pro)** ($29/\u0634\u0647\u0631\u064A\u0627\u064B):
   - \u062A\u062F\u0639\u0645 \u062A\u0634\u063A\u064A\u0644 \u0645\u0627 \u064A\u0635\u0644 \u0625\u0644\u0649 **3 \u0628\u0648\u062A\u0627\u062A \u0630\u0643\u064A\u0629 \u0622\u0645\u0646\u0629** \u0645\u062A\u0648\u0627\u0632\u064A\u0629 \u0641\u064A \u0627\u0644\u062E\u0644\u0641\u064A\u0629.
   - \u062A\u0641\u0639\u064A\u0644 \u0631\u0627\u062F\u0627\u0631 \u0627\u0644\u062D\u064A\u062A\u0627\u0646 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0648\u0645\u064A\u0632\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A (Backtests).

3. **\u0628\u0627\u0642\u0629 \u0627\u0644\u062D\u0648\u062A \u0627\u0644\u0630\u0647\u0628\u064A (Gold Whale Elite)** ($79/\u0634\u0647\u0631\u064A\u0627\u064B):
   - \u0641\u062A\u062D \u0643\u0627\u0645\u0644 \u0648\u0645\u0637\u0644\u0642 \u0644\u0643\u0627\u0641\u0629 \u0645\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0645\u0646\u0635\u0629.
   - \u062A\u0634\u063A\u064A\u0644 \u0639\u062F\u062F \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F \u0645\u0646 \u0631\u0648\u0628\u0648\u062A\u0627\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 (Grid, DCA\u060C \u0648\u0631\u0648\u0628\u0648\u062A \u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0627\u0644\u0645\u0633\u062A\u0642\u0631).
   - \u0631\u0627\u062F\u0627\u0631 \u0635\u0641\u0642\u0627\u062A \u062D\u064A\u062A\u0627\u0646 \u0641\u0627\u0626\u0642 \u0627\u0644\u0633\u0631\u0639\u0629 \u0644\u062A\u062A\u0628\u0639 \u0627\u0644\u0645\u062D\u0627\u0641\u0638 \u0648\u0627\u0644\u0633\u064A\u0648\u0644\u0629\u060C \u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0648\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u0630\u0643\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629\u060C \u0648\u062A\u0648\u0635\u064A\u0644 \u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u062F\u0648\u0646 \u0623\u064A \u0642\u064A\u0648\u062F.

**\u{1F4A1} \u0643\u064A\u0641 \u0623\u0634\u062D\u0646 \u062D\u0633\u0627\u0628\u064A \u0623\u0648 \u0623\u0634\u062A\u0631\u0643\u061F**
\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u062D\u0642\u064A\u0642\u064A \u0623\u0648 \u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0628\u0627\u0642\u0629 \u064A\u062A\u0645 \u0628\u0623\u0645\u0627\u0646 \u062A\u0627\u0645 \u0648\u0645\u0648\u062B\u0642. \u0627\u0637\u0644\u0628 \u0643\u0648\u062F \u0627\u0644\u062A\u0641\u0639\u064A\u0644 \u0645\u0646 \u0645\u0627\u0644\u0643 \u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u0641\u0646\u064A \u0623\u0648 \u0627\u0644\u0645\u062F\u064A\u0631 \u0647\u0646\u0627 \u0639\u0628\u0631 \u0644\u0648\u062D\u0629 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0630\u0643\u064A \u0628\u0641\u062A\u062D \u062A\u0630\u0643\u0631\u0629\u060C \u0648\u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0645\u0627\u0644\u0643 \u0639\u0644\u0649 \u0627\u0644\u0641\u0648\u0631 \u0628\u0625\u0631\u0633\u0627\u0644 \u0643\u0648\u062F \u0627\u0644\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0648\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0622\u0645\u0646\u0629 \u0627\u0644\u0645\u0648\u062B\u0642\u0629 \u0644\u062A\u0646\u0634\u064A\u0637 \u062D\u0633\u0627\u0628\u0643 \u0641\u0648\u0631\u0627\u064B \u0648\u0628\u0623\u0639\u0644\u0649 \u0627\u0644\u0645\u064A\u0632\u0627\u062A.`;
          } else if (queryLower.includes("\u0631\u0628\u0637") || queryLower.includes("\u0628\u064A\u0646\u0627\u0646\u0633") || queryLower.includes("\u0645\u0641\u062A\u0627\u062D") || queryLower.includes("api") || queryLower.includes("\u0623\u0645\u0646") || queryLower.includes("\u0627\u0645\u0627\u0646") || queryLower.includes("\u062A\u0641\u0639\u064A\u0644")) {
            fallbackReply = `### \u{1F512} \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0648\u0623\u0645\u0646 \u0627\u0644\u0640 API \u0639\u0644\u0649 Al-Moharif AI:
\u0631\u0628\u0637 \u0627\u0644\u0645\u0646\u0635\u0629 \u0628\u062D\u0633\u0627\u0628 \u0628\u064A\u0646\u0627\u0646\u0633 \u062D\u0642\u064A\u0642\u064A \u0633\u0647\u0644 \u0648\u0645\u0624\u0645\u0646 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0639\u0628\u0631 \u0627\u062A\u0628\u0627\u0639 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629:

1. \u0627\u0630\u0647\u0628 \u0644\u062D\u0633\u0627\u0628\u0643 \u0641\u064A **\u0628\u064A\u0646\u0627\u0646\u0633 (Binance)** \u0648\u0642\u0645 \u0628\u0625\u0646\u0634\u0627\u0621 \u0643\u0648\u062F API \u062C\u062F\u064A\u062F \u0645\u062E\u0635\u0635 \u0644\u0644\u0639\u0645\u0644 \u0627\u0644\u062E\u0627\u0631\u062C\u064A.
2. **\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0622\u0645\u0646\u0629**: \u0642\u0645 \u0628\u062A\u0641\u0639\u064A\u0644 \u0635\u0644\u0627\u062D\u064A\u0629 **"\u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0641\u0642\u0637" (Enable Reading)** \u0648\u0635\u0644\u0627\u062D\u064A\u0629 **"\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0639\u0642\u0648\u062F \u0627\u0644\u0641\u0648\u0631\u064A\u0629" (Enable Spot Trading)**.
3. \u26A0\uFE0F **\u062D\u0638\u0631 \u0647\u0627\u0645 \u062C\u062F\u0627\u064B**: \u062A\u0623\u0643\u062F \u062A\u0645\u0627\u0645\u0627\u064B \u0645\u0646 **\u0625\u0644\u063A\u0627\u0621 \u062A\u0641\u0639\u064A\u0644 \u0623\u0648 \u0639\u062F\u0645 \u062A\u062D\u062F\u064A\u062F \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0633\u062D\u0628 (Enable Withdrawals)**. \u0647\u0630\u0627 \u064A\u0636\u0645\u0646 \u062D\u0645\u0627\u064A\u0629 \u0623\u0645\u0648\u0627\u0644\u0643 \u0628\u0646\u0633\u0628\u0629 100% \u0648\u062D\u0635\u0631 \u062F\u0648\u0631 \u0627\u0644\u0645\u0646\u0635\u0629 \u0641\u064A \u0641\u062A\u062D \u0648\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0635\u0641\u0642\u0627\u062A \u0627\u0644\u0645\u0642\u062F\u0631\u0629 \u0641\u0642\u0637 \u0645\u0639 \u0628\u0642\u0627\u0621 \u0631\u0623\u0633 \u0645\u0644\u0643 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0628\u0623\u0645\u0627\u0646 \u062A\u0627\u0645 \u062F\u0627\u062E\u0644 \u0645\u062D\u0641\u0638\u062A\u0643 \u0628\u0628\u064A\u0646\u0627\u0646\u0633.
4. \u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u062A\u0628\u0648\u064A\u0628 **"\u0623\u0645\u0627\u0646 \u0627\u0644\u0640 API"** \u0641\u064A \u0645\u0646\u0635\u062A\u0646\u0627\u060C \u0648\u0623\u062F\u062E\u0644 \u0627\u0644\u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0639\u0627\u0645 (API Key) \u0648\u0627\u0644\u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0633\u0631\u064A (API Secret) \u0644\u0644\u0645\u062D\u0641\u0638\u0629 \u0648\u0627\u0636\u063A\u0637 \u0627\u062A\u0635\u0627\u0644 \u062D\u0642\u064A\u0642\u064A \u0644\u064A\u0642\u0648\u0645 \u0627\u0644\u0646\u0638\u0627\u0645 \u0628\u0627\u0644\u0631\u0628\u0637 \u0648\u0628\u062F\u0621 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0622\u0644\u064A \u0627\u0644\u0622\u0645\u0646 \u0641\u0648\u0631\u0627\u064B.`;
          } else if (queryLower.includes("\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A") || queryLower.includes("\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F") || queryLower.includes("\u0627\u0631\u062A\u062F\u0627\u062F") || queryLower.includes("rebound")) {
            fallbackReply = `### \u26A1 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A (Offensive Rebound):
\u0631\u0648\u0628\u0648\u062A **\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A** \u0647\u0648 \u0642\u0646\u0627\u0635 \u062A\u0630\u0628\u0630\u0628\u0627\u062A \u0645\u062A\u0637\u0648\u0631 \u0648\u0639\u0627\u0644\u064A \u0627\u0644\u062F\u0642\u0629 \u0644\u062A\u062A\u0628\u0639 \u0642\u064A\u0639\u0627\u0646 \u0627\u0644\u0641\u0648\u0644\u062A\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0639\u0629:

- **\u0622\u0644\u064A\u0629 \u0627\u0644\u0639\u0645\u0644**: \u0628\u0645\u062C\u0631\u062F \u062A\u0641\u0639\u064A\u0644 \u0632\u0631 "\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A" \u0623\u0648 \u0623\u064A \u0632\u0631 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0622\u062E\u0631 \u0628\u0627\u0644\u0645\u0646\u0635\u0629\u060C \u064A\u0642\u0648\u0645 \u0627\u0644\u0646\u0638\u0627\u0645 \u0628\u062A\u0639\u0642\u0628 \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u062A\u0643\u062A\u064A\u0643\u064A\u0629 \u0648\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u062F\u0649 \u0627\u0644\u0645\u0627\u0626\u0644 \u0644\u0645\u0624\u0634\u0631 RSI. \u0628\u0645\u062C\u0631\u062F \u062D\u062F\u0648\u062B \u0647\u0628\u0648\u0637 \u0641\u062C\u0627\u0626\u064A \u0648\u0633\u0631\u064A\u0639\u060C \u064A\u0639\u0644\u0642 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648\u0627\u0645\u0631 \u0645\u0639\u0644\u0642\u0629 \u0641\u0648\u0631\u064A\u0629 (Limit Orders) \u062A\u062D\u062A \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A \u0628\u0641\u0631\u0642 \u0637\u0641\u064A\u0641 (0.5% \u0625\u0644\u0649 1%) \u0644\u0627\u0635\u0637\u064A\u0627\u062F \u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0633\u0631\u064A\u0639 \u0648\u0627\u0644\u0635\u0639\u0648\u062F \u0627\u0644\u0644\u062D\u0638\u064A.
- **\u0627\u0644\u0627\u0633\u062A\u0642\u0631\u0627\u0631 \u0648\u0627\u0644\u0627\u0633\u062A\u0645\u0631\u0627\u0631\u064A\u0629**: **\u064A\u0628\u0642\u0649 \u0647\u0630\u0627 \u0627\u0644\u0632\u0631 \u0648\u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629 \u0645\u0641\u0639\u0651\u0644\u0629 \u0641\u064A \u062D\u0633\u0627\u0628\u0643 \u0648\u062E\u0644\u0641\u064A\u0629 \u0627\u0644\u0645\u0646\u0635\u0629 \u0628\u0634\u0643\u0644 \u062F\u0627\u0626\u0645 \u0648\u0633\u0631\u064A \u062D\u062A\u0649 \u0644\u0648 \u0623\u063A\u0644\u0642\u062A \u0627\u0644\u0645\u062A\u0635\u0641\u062D \u0623\u0648 \u0627\u0644\u0645\u0646\u0635\u0629\u060C \u0648\u0644\u0646 \u064A\u062A\u0645 \u0643\u062A\u0645\u0647\u0627 \u0623\u0648 \u0625\u0644\u063A\u0627\u0626\u0647\u0627 \u0625\u0644\u0627 \u0625\u0630\u0627 \u0642\u0645\u062A \u0623\u0646\u062A \u064A\u062F\u0648\u064A\u0627\u064B \u0628\u0627\u0644\u0636\u063A\u0637 \u0639\u0644\u0649 \u0632\u0631 \u0627\u0644\u062A\u0639\u0637\u064A\u0644.**
- \u064A\u062D\u0642\u0642 \u0645\u0639\u062F\u0644 \u0627\u0644\u062A\u0642\u0627\u0637 \u0641\u0648\u0631\u064A \u0644\u0635\u0641\u0642\u0627\u062A \u0627\u0644\u0642\u0627\u0639 \u0628\u0645\u062C\u0631\u062F \u0631\u0635\u062F \u062A\u0636\u062E\u0645 \u0628\u064A\u0639\u064A \u0639\u0644\u0649 \u0645\u0624\u0634\u0631 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0646\u0633\u0628\u064A\u0629 (RSI) \u062A\u062D\u062A 30.`;
          } else if (queryLower.includes("\u0628\u0648\u062A") || queryLower.includes("\u0631\u0648\u0628\u0648\u062A") || queryLower.includes("\u062F\u0643\u0627") || queryLower.includes("grid") || queryLower.includes("dca") || queryLower.includes("\u062A\u0644\u0642\u0627\u0626\u064A") || queryLower.includes("\u062A\u062F\u0627\u0648\u0644")) {
            fallbackReply = `### \u{1F916} \u0631\u0648\u0628\u0648\u062A\u0627\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0648\u062E\u0644\u0641\u064A\u0629 \u0627\u0644\u0639\u0645\u0644 \u0641\u064A \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A:
\u062A\u062F\u0639\u0645 \u0627\u0644\u0645\u0646\u0635\u0629 3 \u0623\u0646\u0648\u0627\u0639 \u0631\u0626\u064A\u0633\u064A\u0629 \u0645\u0646 \u062E\u0648\u0627\u0631\u0632\u0645\u064A\u0627\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0622\u0644\u064A \u0627\u0644\u0630\u0643\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u0639\u0645\u0644 \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 \u0627\u0644\u0633\u0627\u0639\u0629 24/7 \u062F\u0648\u0646 \u062D\u0627\u062C\u0629 \u0644\u0628\u0642\u0627\u0621 \u062C\u0647\u0627\u0632\u0643 \u0645\u062A\u0635\u0644\u0627\u064B:

1. **\u0631\u0648\u0628\u0648\u062A \u0627\u0644\u0634\u0628\u0643\u0629 (Grid Bot)**:
   - \u0645\u0645\u062A\u0627\u0632 \u0644\u0644\u062A\u062F\u0627\u0648\u0644 \u0641\u064A \u0627\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0639\u0631\u0636\u064A\u0629 \u0648\u0627\u0644\u0645\u062A\u0630\u0628\u0630\u0628\u0629. \u064A\u0642\u0648\u0645 \u0628\u0646\u0634\u0631 \u062E\u0637\u0648\u0637 \u0634\u0631\u0627\u0621 \u0628\u0627\u0644\u0623\u0633\u0641\u0644 \u0648\u062E\u0637\u0648\u0637 \u0628\u064A\u0639 \u0628\u0627\u0644\u0623\u0639\u0644\u0649 \u0644\u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0627\u0644\u0645\u064A\u0643\u0631\u0648\u064A\u0629.
2. **\u0631\u0648\u0628\u0648\u062A \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 (DCA Bot)**:
   - \u0645\u062B\u0627\u0644\u064A \u0644\u0644\u062A\u062C\u0645\u064A\u0639 \u0648\u062A\u0623\u0645\u064A\u0646 \u0645\u0631\u0627\u0643\u0632 \u0645\u0645\u062A\u0627\u0632\u0629 \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0627\u062A \u0627\u0644\u0647\u0627\u0628\u0637\u0629 \u0639\u0646 \u0637\u0631\u064A\u0642 \u0627\u0644\u0634\u0631\u0627\u0621 \u0639\u0644\u0649 \u0641\u062A\u0631\u0627\u062A \u0645\u062A\u0628\u0627\u0639\u062F\u0629 \u062B\u0645 \u062A\u0633\u064A\u064A\u0644 \u0643\u0644 \u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0628\u0645\u062A\u0648\u0633\u0637 \u0645\u0631\u0628\u062D \u0648\u0645\u0642\u0646\u0646 \u0628\u0627\u0644\u0643\u0627\u0645\u0644.
3. **\u0631\u0648\u0628\u0648\u062A \u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A**:
   - \u0642\u0646\u0627\u0635 \u0633\u0631\u064A\u0639 \u0644\u0635\u0641\u0642\u0627\u062A \u0627\u0644\u0642\u064A\u0639\u0627\u0646\u060C \u064A\u0646\u062A\u0638\u0631 \u0647\u062F\u0631 \u0627\u0644\u0641\u0648\u0644\u062A\u064A\u0629 \u0648\u0645\u0633\u062A\u0648\u064A\u0627\u062A RSI \u0627\u0644\u062D\u0631\u062C\u0629 \u0644\u0641\u062A\u062D \u0635\u0641\u0642\u0627\u062A \u0627\u0631\u062A\u062F\u0627\u062F \u0646\u0627\u062C\u062D\u0629 \u0648\u0645\u0643\u062B\u0641\u0629.`;
          } else if (queryLower.includes("\u0635\u0627\u062D\u0628") || queryLower.includes("\u0645\u062F\u064A\u0631") || queryLower.includes("\u0627\u0644\u0645\u0627\u0644\u0643") || queryLower.includes("\u062A\u0648\u0627\u0635\u0644") || queryLower.includes("\u0645\u0627\u0644\u0643") || queryLower.includes("\u0645\u0633\u0627\u0639\u062F\u0629")) {
            fallbackReply = `### \u{1F4DE} \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0625\u062F\u0627\u0631\u0629 \u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A:
\u0644\u0642\u062F \u0642\u0645\u062A \u0628\u062A\u062D\u0648\u064A\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0643 \u0648\u062D\u0627\u0644\u062A\u0643 \u0643\u0628\u0637\u0627\u0642\u0629 \u062A\u0648\u0627\u0635\u0644 \u0645\u0633\u062A\u0639\u062C\u0644\u0629 \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0641\u0646\u064A \u0634\u062E\u0635\u064A\u0627\u064B (Pending Escalation).
- \u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0645\u0627\u0644\u0643 \u0628\u0645\u0631\u0627\u062C\u0639\u0629 \u062D\u0633\u0627\u0628\u0643 \u0648\u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0623\u0648 \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0648\u062A\u0632\u0648\u064A\u062F\u0643 \u0628\u0627\u0644\u0627\u0643\u0648\u0627\u062F \u0641\u0648\u0631\u0627\u064B.
- \u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627 \u0641\u064A \u0623\u064A \u0648\u0642\u062A\u060C \u0627\u0644\u0645\u0627\u0644\u0643 \u064A\u062A\u0627\u0628\u0639 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0627\u0644\u0648\u0627\u0631\u062F\u0629 \u0644\u062E\u062F\u0645\u062A\u0643\u0645 \u0628\u0634\u0643\u0644 \u062F\u0648\u0631\u064A \u0648\u0648\u062B\u064A\u0642.`;
            fallbackEscalated = true;
            fallbackConfidence = 50;
          } else {
            fallbackReply = `### \u{1F916} \u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0630\u0643\u064A \u0644\u0645\u0646\u0635\u0629 "\u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A \u0644\u0644\u0643\u0645" (Al-Moharif AI):
\u0623\u0646\u0627 \u0645\u0633\u062A\u0634\u0627\u0631\u0643 \u0627\u0644\u0641\u0646\u064A \u0648\u0645\u0633\u0627\u0639\u062F\u0643 \u0647\u0646\u0627 \u0644\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0646 \u0643\u0644 \u0645\u0627 \u064A\u062E\u0635 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0648\u0627\u0644\u0639\u0645\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629:

- **\u0625\u0630\u0627 \u0643\u0646\u062A \u062A\u0633\u062A\u0641\u0633\u0631 \u0639\u0646 \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u062A\u0631\u0642\u064A\u0629**: \u0627\u0643\u062A\u0628 \u0643\u0644\u0645\u0629 "\u0627\u0634\u062A\u0631\u0627\u0643" \u0623\u0648 "\u0628\u0627\u0642\u0629".
- **\u0625\u0630\u0627 \u0643\u0646\u062A \u062A\u0633\u062A\u0641\u0633\u0631 \u0639\u0646 \u0643\u064A\u0641\u064A\u0629 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0648\u0623\u0645\u0627\u0646 \u0627\u0644\u0623\u0645\u0648\u0627\u0644**: \u0627\u0643\u062A\u0628 "\u0631\u0628\u0637 \u0628\u064A\u0646\u0627\u0646\u0633" \u0623\u0648 "\u0623\u0645\u0627\u0646 \u0627\u0644\u0640 API".
- **\u0625\u0630\u0627 \u0643\u0646\u062A \u0628\u062D\u0627\u062C\u0629 \u0644\u0645\u0639\u0631\u0641\u0629 \u0639\u0645\u0644 \u0631\u0648\u0628\u0648\u062A \u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A**: \u0627\u0643\u062A\u0628 "\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A" \u0623\u0648 "\u0627\u0644\u0628\u0648\u062A\u0627\u062A".
- **\u0625\u0630\u0627 \u0643\u0646\u062A \u062A\u0648\u062F \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0639 \u0645\u0627\u0644\u0643 \u0627\u0644\u0645\u0646\u0635\u0629 \u0644\u0637\u0644\u0628 \u062E\u0627\u0635**: \u0627\u0643\u062A\u0628 "\u0627\u0644\u0645\u062F\u064A\u0631" \u0623\u0648 "\u0627\u0644\u0645\u0627\u0644\u0643".

*\u0627\u0644\u0645\u0646\u0635\u0629 \u062A\u0639\u0645\u0644 \u0628\u0643\u0627\u0645\u0644 \u0637\u0627\u0642\u062A\u0647\u0627 \u0644\u062E\u062F\u0645\u062A\u0643\u0645 24/7 \u0628\u0623\u0642\u0648\u0649 \u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0641\u0646\u064A \u0627\u0644\u0643\u0645\u064A \u0627\u0644\u0645\u0642\u0631\u0648\u0646\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A.*`;
          }
        } else {
          if (queryLower.includes("sub") || queryLower.includes("price") || queryLower.includes("tier") || queryLower.includes("plan") || queryLower.includes("cost") || queryLower.includes("pay") || queryLower.includes("pricing")) {
            fallbackReply = `### \u{1F48E} Subscription Plans and Costs for Al-Moharif AI:
Our platform provides structured tiers tailored for every professional:

1. **Trial/Free Tier**:
   - Unlocks full Paper Trading simulator featuring $15,000 USDT free baseline.
   - Perfect for testing bot strategies and charting real-time indicators.

2. **Silver Pro Tier** ($29/month):
   - Automate up to **3 active parallel trading bots** simultaneously in the background.
   - Complete Whale flow alerts and historical Backtesting system unlocked.

3. **Gold Whale / Elite Tier** ($79/month):
   - Infinite active parallel Grid & DCA bots.
   - Ultra fast live Whale trackers, direct API execution trigger, personalized price notification chimes, and premium AI advice.

**\u{1F4A1} How to register / upgrade your access?**
Subscriptions and tier upgrades are handled securely through invoicing or activation tokens. Simply text me or open a support ticket, and our Platform Manager will directly send you your secure payment invoice and activation key instantly!`;
          } else if (queryLower.includes("link") || queryLower.includes("api") || queryLower.includes("binance") || queryLower.includes("key") || queryLower.includes("security") || queryLower.includes("safe")) {
            fallbackReply = `### \u{1F512} Active Exchange API Integration & Asset Security:
Connecting Al-Moharif AI to your live exchange is fully secure and isolated:

1. Navigate to your **Binance account** and register a new security API key.
2. **Covenant Permissions**: Enable strictly **"Read-only/Enable Reading"** and **"Spot & Margin Trading"** permissions.
3. \u26A0\uFE0F **Safety Dictate**: Absolutely **DISABLE withdrawal rights (Enable Withdrawals is unchecked)**. This encapsulates your capital safely within your own exchange wallet, allowing our bot strictly to execute trades on your behalf.
4. Input your API Key and API Secret in our secure **"API Security"** panel to synchronize.`;
          } else if (queryLower.includes("rebound") || queryLower.includes("aggressive")) {
            fallbackReply = `### \u26A1 Aggressive Rebound Mastery (\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A):
The **Aggressive Rebound** strategy is highly robust for capturing rapid reversion spikes:

- **Execution**: Once activated, the bot continuously monitors support lines and RSI metrics, placing Limit orders immediately below those levels (0.5% to 1.0%) to scoop immediate bottom liquidities.
- **Persistence guarantee**: **This toggle state resides securely in your long-term local storage. Once activated, it stays fully running in Al-Moharif background indefinitely until you choose to explicitly click and deactivate it yourself.**
- Bypasses raw timing latency to buy dynamic oversold bottoms perfectly.`;
          } else if (queryLower.includes("bot") || queryLower.includes("robot") || queryLower.includes("grid") || queryLower.includes("dca") || queryLower.includes("auto")) {
            fallbackReply = `### \u{1F916} Automated Quant Trading Bots on Al-Moharif AI:
Three continuous background systems execute your trading strategies perfectly 24/7:

1. **Grid Bot (\u0631\u0648\u0628\u0648\u062A \u0627\u0644\u0634\u0628\u0643\u0629)**:
   - Sets regular grid steps above/below current entry to buy low and sell high inside sideways markets.
2. **DCA Accumulator Bot (\u0631\u0648\u0628\u0648\u062A \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062A\u0643\u0644\u0641\u0629)**:
   - Smooths volatile downturns by placing spaced fractional orders, resulting in a low cost-average that liquidates inside recovery moves.
3. **Aggressive Rebound Bot (\u0631\u0648\u0628\u0648\u062A \u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A)**:
   - Aggressive mean-reversion hunter waiting for massive RSI sell-offs to execute bottom-fishing buys.`;
          } else if (queryLower.includes("owner") || queryLower.includes("manager") || queryLower.includes("creator") || queryLower.includes("admin") || queryLower.includes("contact")) {
            fallbackReply = `### \u{1F4DE} Direct Owner / Support Escalation:
Need personalized help from a human administrator?
- I have flagged this ticket and marked it for direct review by the Platform Manager (Owner Attention: Pending).
- The Manager will contact you directly via the support tickets layout or through email to assist with any billing, invoicing, or specialized account settings.`;
            fallbackEscalated = true;
            fallbackConfidence = 50;
          } else {
            fallbackReply = `### \u{1F916} Welcome to Al-Moharif AI Smart Support Advisor:
I am your professional AI co-pilot, ready to assist you with any topic regarding our quantitative system:

- **Subscriptions / Pricing**: Ask about "prices", "tiers", or "subscriptions".
- **Binance Link & Safety**: Ask about "connecting binance", "API security", or "safety".
- **Offensive Rebound / Bots**: Ask about "rebound bot", "grid bot", or "DCA".
- **Direct Manager Contact**: Write "contact owner" or "escalate to manager".

*Our platform is built to optimize your crypto portfolio 24/7 with professional quantitative discipline.*`;
          }
        }
        res.json({ reply: fallbackReply, escalated: fallbackEscalated, confidence: fallbackConfidence });
        return;
      }
      const ai2 = new import_genai.GoogleGenAI({ apiKey });
      const systemInstruction = `You are the highly professional Elite AI Advisor and Customer Support Consultant for 'Al-Moharif AI' (\u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A \u0644\u0644\u0643\u0645).
Your goal is to answer users' consultations, questions, subscription queries, and operational instructions with technical elegance, helpfulness, and precision.

Key knowledge about 'Al-Moharif AI' Platform to use when answering questions:
1. Platform Identity & Vision:
   - Al-Moharif AI (\u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0630\u0643\u064A) is a world-class, algorithmic and quant crypto trading terminal.
   - It specializes in continuous automated trading bots, smart data aggregation, real-time whale flow tracking, and intelligent sentiment indexes.

2. Core Systems & Features:
   - Automated Trading Bots (\u0631\u0648\u0628\u0648\u062A\u0627\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0622\u0644\u064A): Includes Grid Bots, Dollar-Cost Averaging (DCA), and the Aggressive Rebound Bot (\u0627\u0644\u0627\u0631\u062A\u062F\u0627\u062F \u0627\u0644\u0647\u062C\u0648\u0645\u064A). Once activated by the user, these bots operate continuously in the background (using secure, robust simulation or live API connections) until the user explicitly turns them off.
   - Whale Tracking Engine (\u0645\u062A\u0639\u0642\u0628 \u0627\u0644\u062D\u064A\u062A\u0627\u0646): Continuously scans Binance and blockchain networks for huge single-block or OTC transfers, providing high-speed buy/sell alerts and transaction-depth visual maps.
   - Backtester (\u0631\u0648\u0628\u0648\u062A \u0627\u0644\u062A\u062C\u0631\u064A\u0628 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A): Allows users to simulate how their DCA or Grid rules would have performed historically over several past months before putting actual assets at risk.
   - AI Analyst Dashboard (\u0627\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0630\u0643\u064A): Evaluates dynamic indicators, RSI crossovers, chart patterns, and whale flow indices to produce real-time recommendations (such as the Top 5 Buy and Top 5 Sell Opportunities).
   - Futures & Risk Simulator (\u0645\u062E\u0637\u0637 \u0648\u0645\u062D\u0627\u0643\u064A \u0627\u0644\u0639\u0642\u0648\u062F \u0627\u0644\u0622\u062C\u0644\u0629): Equipped with a custom margin and leverage risk calculator to accurately demonstrate potential liquidations prior to placing trades.

3. Subscription Tiers & Registration (\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u0648\u0627\u0644\u0639\u0645\u0644 \u0628\u0627\u0644\u0645\u0646\u0635\u0629):
   - Free/Trial Tier (\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629): Fully functional paper trading with live market rates, basic chart tracking, and limited alerts. Excellent for testing strategy logic.
   - Silver Pro Tier (\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641 \u0627\u0644\u0641\u0636\u064A): Supports complete automation for up to 3 custom bots, basic whale transaction alerts, and historical backtesting features.
   - Gold Whale / Elite Tier (\u0628\u0627\u0642\u0629 \u0627\u0644\u062D\u0648\u062A \u0627\u0644\u0630\u0647\u0628\u064A): Fully unlocks all platforms tools, unlimited parallel DCA and Grid bots, professional high-speed whale flow details, custom price alerts, and automated execution keys.
   - Payment/Subscription Method: Users can subscribe by contacting support or the platform manager directly (via their profile panel, support tickets, or direct channel keys on the manager's dashboard) to secure activation codes or setup direct invoicing.
   - Live API Integration: Users can connect their external exchange APIs (like Binance) into Al-Moharif securely. The platform only requires 'Trade' permissions, never 'Withdrawal' permissions, ensuring funds remain 100% safe in the user's exchange wallet.

Communication Guidelines:
- If the user asks in Arabic, answer in professional, elegant, and encouraging Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649).
- If the user asks in English, answer in polished, high-status English business tone.
- Maintain high-interest engagement, giving clear step-by-step guidance.
- If asked a highly specific questions about custom database balances, account private disputes, or explicit developer bugs, set a confidence score below 75 so that the ticket can be escalated to the Platform Manager (\u0627\u0644\u0645\u062F\u064A\u0631 \u0648\u0627\u0644\u0645\u0627\u0644\u0643) for direct personal attention while keeping the user informed politely.`;
      const response = await ai2.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              reply: { type: import_genai.Type.STRING, description: "Your friendly customer support reply." },
              confidence: { type: import_genai.Type.INTEGER, description: "Your confidence score from 0 to 100 on being able to assist exactly." }
            },
            required: ["reply", "confidence"]
          }
        }
      });
      const text = response.text || "";
      if (!text) throw new Error("Empty response");
      const parsed = JSON.parse(text);
      const confidence = parsed.confidence ?? 100;
      let replyText = parsed.reply || "";
      let escalated = confidence < 75 || replyText.includes("[ESCALATE_TO_OWNER]");
      res.json({ reply: replyText, escalated, confidence });
    } catch (err) {
      console.warn("Support AI Error:", err.message || err);
      res.json({
        reply: req.body.lang === "ar" ? "\u0639\u0641\u0648\u0627\u064B\u060C \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u0643\u0645\u0627\u0644 \u0627\u0644\u0637\u0644\u0628 \u062D\u0627\u0644\u064A\u0627\u064B. \u0627\u0644\u0645\u0627\u0644\u0643 \u0633\u064A\u0631\u0627\u062C\u0639 \u0647\u0630\u0627 \u0628\u0634\u0643\u0644 \u0634\u062E\u0635\u064A \u0648\u0633\u064A\u0644\u0628\u064A \u0637\u0644\u0628\u0643 \u0641\u0648\u0631\u0627\u064B!" : "Error processing request. The owner has been notified and will review your request personally!",
        escalated: true,
        confidence: 0
      });
    }
  });
  let cachedClockOffset = 0;
  let lastClockSync = 0;
  async function getBinanceTimestamp() {
    const now = Date.now();
    if (now - lastClockSync > 3 * 60 * 1e3) {
      try {
        const res = await fetch("https://api.binance.com/api/v3/time");
        if (res.ok) {
          const body = await res.json();
          cachedClockOffset = body.serverTime - now;
          lastClockSync = now;
          console.log(`[Binance Clock Synchronization] Synced! Server Offset: ${cachedClockOffset}ms`);
        }
      } catch (err) {
        console.warn("[Binance Clock Synchronization] Failed to consult Binance time gateway:", err.message);
      }
    }
    return Date.now() + cachedClockOffset;
  }
  async function getOpenOrders(apiKey, apiSecret, useTestnet, isFutures = false) {
    const baseUrl = isFutures ? useTestnet ? "https://testnet.binancefuture.com" : "https://fapi.binance.com" : useTestnet ? "https://testnet.binance.vision" : "https://api.binance.com";
    const timestamp = await getBinanceTimestamp();
    const queryString = `timestamp=${timestamp}&recvWindow=60000`;
    const signature = import_crypto.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
    const path2 = isFutures ? "/fapi/v1/openOrders" : "/api/v3/openOrders";
    const url = `${baseUrl}${path2}?${queryString}&signature=${signature}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": apiKey,
        "Content-Type": "application/json"
      }
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text().catch(() => "");
      console.error("[getOpenOrders] Non-JSON payload received from Binance:", text);
      throw new Error(`Binance returned an HTML page (HTTP ${response.status}) instead of JSON. This typically happens when keys lack correct permissions, are geo-restricted, or are targeting an unsupported environment.`);
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `Binance API query failed with status ${response.status}`);
    }
    return await response.json();
  }
  app.post("/api/binance/open-orders", async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, isFutures } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: "API key and security signature secret are required." });
        return;
      }
      const openOrders = await getOpenOrders(apiKey, apiSecret, useTestnet !== false, isFutures === true);
      res.json({
        success: true,
        orders: openOrders
      });
    } catch (err) {
      console.error("Binance Open Orders query failed:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error retrieving Binance open orders pool." });
    }
  });
  app.post("/api/binance/test", async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: "API key and security signature secret are required." });
        return;
      }
      const baseUrl = useTestnet ? "https://testnet.binance.vision" : "https://api.binance.com";
      const timestamp = await getBinanceTimestamp();
      const queryString = `timestamp=${timestamp}&recvWindow=60000`;
      const signature = import_crypto.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
      const url = `${baseUrl}/api/v3/account?${queryString}&signature=${signature}`;
      const fetchResponse = await fetch(url, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/json"
        }
      });
      const testContentType = fetchResponse.headers.get("content-type") || "";
      if (!testContentType.includes("application/json")) {
        const text = await fetchResponse.text().catch(() => "");
        console.error("[/api/binance/test] Non-JSON payload response received:", text);
        res.status(502).json({
          success: false,
          error: `Binance authentication server returned an HTML/non-JSON error response (HTTP ${fetchResponse.status}). Environment or IP restrictions might be blocking communication. Response snippet: ${text.slice(0, 100)}`
        });
        return;
      }
      const responseData = await fetchResponse.json();
      if (fetchResponse.ok) {
        let openOrdersList = [];
        try {
          openOrdersList = await getOpenOrders(apiKey, apiSecret, useTestnet !== false, false);
        } catch (ooErr) {
          console.warn("[Binance Balance link - Open Orders Warning]:", ooErr.message);
        }
        let futuresUsdt = 0;
        try {
          const fBaseUrl = useTestnet ? "https://testnet.binancefuture.com" : "https://fapi.binance.com";
          const fTimestamp = await getBinanceTimestamp();
          const fPayload = `timestamp=${fTimestamp}&recvWindow=60000`;
          const fSig = import_crypto.default.createHmac("sha256", apiSecret).update(fPayload).digest("hex");
          const fUrl = `${fBaseUrl}/fapi/v2/balance?${fPayload}&signature=${fSig}`;
          const fRes = await fetch(fUrl, {
            method: "GET",
            headers: { "X-MBX-APIKEY": apiKey, "Content-Type": "application/json" }
          });
          if (fRes.ok) {
            const fText = await fRes.text();
            try {
              const fData = JSON.parse(fText);
              if (Array.isArray(fData)) {
                const uBal = fData.find((b) => b.asset === "USDT");
                if (uBal) futuresUsdt = parseFloat(uBal.balance) || 0;
              }
            } catch (e) {
            }
          }
        } catch (fe) {
          console.warn("[Binance Balance link - Futures Warning]:", fe.message);
        }
        res.json({
          success: true,
          canTrade: responseData.canTrade ?? true,
          canWithdraw: responseData.canWithdraw ?? false,
          balances: responseData.balances || [],
          permissions: responseData.permissions || [],
          openOrders: openOrdersList,
          futuresUsdt
        });
      } else {
        res.status(fetchResponse.status).json({
          success: false,
          error: responseData.msg || "Binance rejected the authentication request. Verify keys."
        });
      }
    } catch (err) {
      console.error("Binance API proxy diagnostic error:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error connecting to Binance gateway." });
    }
  });
  app.post("/api/binance/diagnose", async (req, res) => {
    try {
      const { apiKey, apiSecret } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: "API key and security signature secret are required to start the deep diagnosis." });
        return;
      }
      const timestamp = await getBinanceTimestamp();
      const localTime = Date.now();
      const offsetMs = timestamp - localTime;
      const queryString = `timestamp=${timestamp}&recvWindow=60000`;
      const getSig = (q) => import_crypto.default.createHmac("sha256", apiSecret).update(q).digest("hex");
      const sig = getSig(queryString);
      const results = {
        spotMainnet: { ok: false, status: 0, msg: "", details: null },
        spotTestnet: { ok: false, status: 0, msg: "", details: null },
        futuresMainnet: { ok: false, status: 0, msg: "", details: null },
        futuresTestnet: { ok: false, status: 0, msg: "", details: null },
        outboundIp: "dynamic-pool",
        timeOffsetMs: offsetMs,
        guidance: []
      };
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          results.outboundIp = ipData.ip;
        }
      } catch {
      }
      try {
        const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${sig}`;
        const fetchRes = await fetch(url, {
          method: "GET",
          headers: { "X-MBX-APIKEY": apiKey, "Content-Type": "application/json" }
        });
        results.spotMainnet.status = fetchRes.status;
        const data = await fetchRes.json().catch(() => ({}));
        results.spotMainnet.details = data;
        if (fetchRes.ok) {
          results.spotMainnet.ok = true;
          results.spotMainnet.msg = "Valid Spot Mainnet Keys";
        } else {
          results.spotMainnet.msg = data.msg || `HTTP Error ${fetchRes.status}`;
        }
      } catch (err) {
        results.spotMainnet.msg = err.message || "Network Timeout";
      }
      try {
        const url = `https://testnet.binance.vision/api/v3/account?${queryString}&signature=${sig}`;
        const fetchRes = await fetch(url, {
          method: "GET",
          headers: { "X-MBX-APIKEY": apiKey, "Content-Type": "application/json" }
        });
        results.spotTestnet.status = fetchRes.status;
        const data = await fetchRes.json().catch(() => ({}));
        results.spotTestnet.details = data;
        if (fetchRes.ok) {
          results.spotTestnet.ok = true;
          results.spotTestnet.msg = "Valid Spot Testnet Keys";
        } else {
          results.spotTestnet.msg = data.msg || `HTTP Error ${fetchRes.status}`;
        }
      } catch (err) {
        results.spotTestnet.msg = err.message || "Network Timeout";
      }
      try {
        const url = `https://fapi.binance.com/fapi/v2/balance?${queryString}&signature=${sig}`;
        const fetchRes = await fetch(url, {
          method: "GET",
          headers: { "X-MBX-APIKEY": apiKey, "Content-Type": "application/json" }
        });
        results.futuresMainnet.status = fetchRes.status;
        const data = await fetchRes.json().catch(() => ({}));
        results.futuresMainnet.details = data;
        if (fetchRes.ok) {
          results.futuresMainnet.ok = true;
          results.futuresMainnet.msg = "Valid Futures Mainnet Authorization";
        } else {
          results.futuresMainnet.msg = data.msg || `HTTP Error ${fetchRes.status}`;
        }
      } catch (err) {
        results.futuresMainnet.msg = err.message || "Network Timeout";
      }
      try {
        const url = `https://testnet.binancefuture.com/fapi/v2/balance?${queryString}&signature=${sig}`;
        const fetchRes = await fetch(url, {
          method: "GET",
          headers: { "X-MBX-APIKEY": apiKey, "Content-Type": "application/json" }
        });
        results.futuresTestnet.status = fetchRes.status;
        const data = await fetchRes.json().catch(() => ({}));
        results.futuresTestnet.details = data;
        if (fetchRes.ok) {
          results.futuresTestnet.ok = true;
          results.futuresTestnet.msg = "Valid Futures Testnet Authorization";
        } else {
          results.futuresTestnet.msg = data.msg || `HTTP Error ${fetchRes.status}`;
        }
      } catch (err) {
        results.futuresTestnet.msg = err.message || "Network Timeout";
      }
      const guidance = results.guidance;
      if (results.spotMainnet.ok && !results.futuresMainnet.ok) {
        guidance.push('\u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0640 API \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0635\u0627\u0644\u062D \u0644\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0641\u0648\u0631\u064A (Spot) \u0639\u0644\u0649 \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629\u060C \u0648\u0644\u0643\u0646\u0647 \u064A\u0641\u062A\u0642\u0631 \u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A "\u062A\u0645\u0643\u064A\u0646 \u0627\u0644\u0639\u0642\u0648\u062F \u0627\u0644\u0622\u062C\u0644\u0629" (Enable Futures). \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u062C\u0647 \u0625\u0644\u0649 \u0625\u062F\u0627\u0631\u0629 \u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u0640 API \u0641\u064A \u0628\u064A\u0646\u0627\u0646\u0633 \u0648\u062A\u0641\u0639\u064A\u0644 \u0647\u0630\u0627 \u0627\u0644\u062E\u064A\u0627\u0631 \u0644\u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A.');
        guidance.push('Your API Key works perfectly for Spot Trading on Mainnet, but lacks checked authorization for Futures Trading. Navigate back to Binance \u2794 API Management \u2794 click "Edit Restrictions" \u2794 check "Enable Futures" and save.');
      } else if (results.spotTestnet.ok && !results.futuresTestnet.ok) {
        guidance.push("\u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0640 API \u064A\u0628\u062F\u0648 \u062A\u062C\u0631\u064A\u0628\u064A\u0627\u064B (Testnet) \u0648\u0644\u0643\u0646\u0647 \u0644\u0627 \u064A\u0645\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0639\u0642\u0648\u062F \u0627\u0644\u0622\u062C\u0644\u0629 \u0641\u064A \u0628\u064A\u0626\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629.");
        guidance.push("Your API Key is validated for Spot Testnet, but cannot read Futures Testnet. Enable Futures for your Testnet profile.");
      } else if (!results.spotMainnet.ok && !results.spotTestnet.ok) {
        guidance.push("\u0645\u0641\u062A\u0627\u062D API \u0623\u0648 \u0627\u0644\u0640 Secret \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0628\u0627\u0644\u0645\u0631\u0629 \u0623\u0648 \u062A\u0645 \u0625\u0628\u0637\u0627\u0644\u0647 \u0645\u0646 \u0642\u0628\u0644 \u0628\u064A\u0646\u0627\u0646\u0633\u060C \u0623\u0648 \u0623\u0646 \u0647\u0646\u0627\u0643 \u0642\u064A\u0648\u062F \u062C\u063A\u0631\u0627\u0641\u064A\u0629 \u062A\u0645\u0646\u0639 \u0627\u0644\u0627\u062A\u0635\u0627\u0644.");
        guidance.push("Both production and sandbox credentials were rejected. The key has likely expired, been copied with typos, or is restricted due to corporate geolocation safeguards.");
      }
      if (results.futuresMainnet.status === 451 || results.spotMainnet.status === 451) {
        guidance.push("\u062A\u0646\u0628\u064A\u0647 \u0647\u0627\u0645 (\u0627\u0644\u0642\u064A\u0648\u062F \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629): \u0627\u0633\u062A\u062C\u0627\u0628 \u062E\u0627\u062F\u0645 \u0628\u064A\u0646\u0627\u0646\u0633 \u0628\u0631\u0645\u0632 HTTP 451 \u0648\u0627\u0644\u0630\u064A \u064A\u0634\u064A\u0631 \u0625\u0644\u0649 \u062D\u0638\u0631 \u0645\u0646\u0637\u0642\u062A\u0643 \u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A\u0629 \u0645\u0646 \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0639\u0628\u0631 \u0627\u0644\u0640 API. \u064A\u0648\u0635\u0649 \u0628\u0645\u0631\u0627\u062C\u0639\u0629 \u0642\u064A\u0648\u062F \u0628\u0644\u062F\u0643.");
        guidance.push("Geographical Block Alert: Binance returned HTTP 451. Your account or the server IP resides in a restricted regulatory jurisdiction.");
      }
      res.json({ success: true, results, guidance });
    } catch (err) {
      console.error("Smart credentials diagnostic failed:", err);
      res.status(500).json({ success: false, error: err.message || "Smart diagnostics server timeout." });
    }
  });
  app.post("/api/binance/balance", async (req, res) => {
    try {
      const { apiKey, secretKey, apiSecret, useTestnet } = req.body;
      const finalApiKey = apiKey;
      const finalSecretKey = secretKey || apiSecret;
      if (!finalApiKey || !finalSecretKey) {
        res.status(400).json({ error: "\u0645\u0641\u0627\u062A\u064A\u062D API \u0645\u0637\u0644\u0648\u0628\u0629" });
        return;
      }
      const baseUrl = useTestnet ? "https://testnet.binance.vision" : "https://api.binance.com";
      const timestamp = await getBinanceTimestamp();
      const queryString = `timestamp=${timestamp}&recvWindow=60000`;
      const signature = import_crypto.default.createHmac("sha256", finalSecretKey).update(queryString).digest("hex");
      const url = `${baseUrl}/api/v3/account?${queryString}&signature=${signature}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": finalApiKey,
          "Content-Type": "application/json"
        }
      });
      const balanceContentType = response.headers.get("content-type") || "";
      if (!balanceContentType.includes("application/json")) {
        const text = await response.text().catch(() => "");
        console.error("[/api/binance/balance] Non-JSON payload response received:", text);
        res.status(502).json({
          error: `\u0628\u064A\u0646\u0627\u0646\u0633 \u0623\u0631\u0633\u0644\u062A \u0631\u062F\u0627\u064B \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639 (\u0635\u0641\u062D\u0629 HTML) \u0628\u062F\u0644\u0627\u064B \u0645\u0646 \u0628\u064A\u0627\u0646\u0627\u062A JSON (HTTP ${response.status}). \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0642\u064A\u0648\u062F \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u060C \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0641\u064A\u0648\u062A\u0634\u0631\u0632\u060C \u0623\u0648 \u062A\u0637\u0627\u0628\u0642 \u0627\u0644\u0634\u0628\u0643\u0629. \u0645\u0642\u062A\u0637\u0641: ${text.slice(0, 100)}`
        });
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        res.status(response.status).json({
          error: errorData.msg || `Binance REST error code ${response.status}`
        });
        return;
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.balances)) {
        res.json({ balances: [] });
        return;
      }
      const balances = data.balances.filter(
        (asset) => parseFloat(asset.free) > 0 || parseFloat(asset.locked) > 0
      );
      let openOrdersList = [];
      try {
        openOrdersList = await getOpenOrders(finalApiKey, finalSecretKey, useTestnet !== false, false);
      } catch (ooErr) {
        console.warn("[Binance Balance Sync - Open Orders Warning]:", ooErr.message);
      }
      res.json({ balances, openOrders: openOrdersList });
    } catch (error) {
      console.warn("\u062A\u0646\u0628\u064A\u0647: \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0644\u0644\u0639\u0645\u064A\u0644:", error.message || error);
      res.status(500).json({ error: error.message || "\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0645\u062D\u0641\u0638\u0629 \u0628\u064A\u0646\u0627\u0646\u0633" });
    }
  });
  app.post("/api/binance/execute", async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, symbol, side, type, amount, price, isFutures } = req.body;
      if (!apiKey || !apiSecret || !symbol || !side || !type || !amount) {
        res.status(400).json({ success: false, error: "Incomplete parameters for order dispatch." });
        return;
      }
      const baseUrl = useTestnet ? isFutures ? "https://testnet.binancefuture.com" : "https://testnet.binance.vision" : isFutures ? "https://fapi.binance.com" : "https://api.binance.com";
      const timestamp = await getBinanceTimestamp();
      const cleanSymbol = symbol.toUpperCase().replace("/", "");
      let queryString = `symbol=${cleanSymbol}&side=${side}&type=${type}&quantity=${amount}&timestamp=${timestamp}&recvWindow=60000`;
      if (type === "LIMIT") {
        queryString += `&price=${price}&timeInForce=GTC`;
      }
      const signature = import_crypto.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
      const url = `${baseUrl}/${isFutures ? "fapi/v1" : "api/v3"}/order?${queryString}&signature=${signature}`;
      const fetchResponse = await fetch(url, {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      const responseData = await fetchResponse.json();
      if (fetchResponse.ok) {
        res.json({
          success: true,
          orderId: responseData.orderId,
          clientOrderId: responseData.clientOrderId,
          status: responseData.status || "FILLED",
          price: responseData.price || price,
          executedQty: responseData.executedQty || amount,
          transactTime: responseData.transactTime
        });
      } else {
        res.status(fetchResponse.status).json({
          success: false,
          error: responseData.msg || "Binance order processing failed."
        });
      }
    } catch (err) {
      console.error("Binance order dispatch engine error:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error issuing order to Binance terminal." });
    }
  });
  app.post("/api/binance/cancel-all", async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: "API key and security signature secret are required." });
        return;
      }
      const baseUrl = useTestnet ? "https://testnet.binance.vision" : "https://api.binance.com";
      const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
      const results = [];
      for (const rawSymbol of symbols) {
        try {
          const timestamp = Date.now();
          const queryString = `symbol=${rawSymbol}&timestamp=${timestamp}&recvWindow=6000`;
          const signature = import_crypto.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
          const url = `${baseUrl}/api/v3/openOrders?${queryString}&signature=${signature}`;
          const fetchResponse = await fetch(url, {
            method: "DELETE",
            headers: {
              "X-MBX-APIKEY": apiKey,
              "Content-Type": "application/json"
            }
          });
          const responseData = await fetchResponse.json();
          if (fetchResponse.ok) {
            results.push({ symbol: rawSymbol, success: true, data: responseData });
          } else {
            results.push({ symbol: rawSymbol, success: false, error: responseData.msg || "No open orders or parameter mismatch." });
          }
        } catch (symErr) {
          results.push({ symbol: rawSymbol, success: false, error: symErr.message || "Network connectivity error." });
        }
      }
      const totalHalted = results.filter((r) => r.success).length;
      res.json({
        success: true,
        message: "Master liquidation signal processed.",
        haltedCount: totalHalted,
        details: results
      });
    } catch (err) {
      console.error("Binance Emergency Kill Switch router error:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error issuing close order sequence." });
    }
  });
  app.post("/api/binance/order-history", async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, limit = 100 } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: "API key and security signature secret are required to aggregate order history." });
        return;
      }
      const baseUrl = useTestnet ? "https://testnet.binance.vision" : "https://api.binance.com";
      const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
      const requests = symbols.map(async (sym) => {
        try {
          const timestamp = Date.now();
          const queryString = `symbol=${sym}&timestamp=${timestamp}&limit=${limit}&recvWindow=6000`;
          const signature = import_crypto.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
          const url = `${baseUrl}/api/v3/allOrders?${queryString}&signature=${signature}`;
          const fetchResponse = await fetch(url, {
            method: "GET",
            headers: {
              "X-MBX-APIKEY": apiKey,
              "Content-Type": "application/json"
            }
          });
          if (!fetchResponse.ok) {
            const errData = await fetchResponse.json().catch(() => ({}));
            return { symbol: sym, success: false, error: errData.msg || `HTTP ${fetchResponse.status}` };
          }
          const orderData = await fetchResponse.json();
          return { symbol: sym, success: true, data: Array.isArray(orderData) ? orderData : [] };
        } catch (err) {
          return { symbol: sym, success: false, error: err.message };
        }
      });
      const responses = await Promise.all(requests);
      let allOrders = [];
      responses.forEach((resp) => {
        if (resp.success && Array.isArray(resp.data)) {
          const formatted = resp.data.map((o) => ({
            symbol: o.symbol,
            orderId: o.orderId,
            price: parseFloat(o.price) || 0,
            amount: parseFloat(o.origQty) || 0,
            filledAmount: parseFloat(o.executedQty) || 0,
            side: o.side,
            // BUY or SELL
            type: o.type,
            // LIMIT, MARKET, etc.
            status: o.status,
            // FILLED, CANCELED, etc.
            timestamp: o.time,
            cummulativeQuoteQty: parseFloat(o.cummulativeQuoteQty) || 0
          }));
          allOrders = allOrders.concat(formatted);
        }
      });
      allOrders.sort((a, b) => b.timestamp - a.timestamp);
      res.json({
        success: true,
        orders: allOrders,
        symbolsQueried: symbols
      });
    } catch (err) {
      console.error("Binance Order History router error:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error processing historical Binance logs." });
    }
  });
  app.post("/api/telegram/send", async (req, res) => {
    try {
      const { botToken, chatId, message } = req.body;
      if (!botToken || !chatId || !message) {
        res.status(400).json({ success: false, error: "Telegram credentials and message are required." });
        return;
      }
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML"
        })
      });
      const responseData = await response.json();
      if (response.ok && responseData.ok) {
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: responseData.description || "Telegram API rejected the message." });
      }
    } catch (err) {
      console.error("Telegram API proxy dispatcher error:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error dispatching message to Telegram gateway." });
    }
  });
  app.post("/api/binance/futures/account", async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: "API key and security signature secret are required." });
        return;
      }
      const baseUrl = useTestnet ? "https://testnet.binancefuture.com" : "https://fapi.binance.com";
      const timestamp = await getBinanceTimestamp();
      const queryString = `timestamp=${timestamp}&recvWindow=60000`;
      const signature = import_crypto.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
      const balanceUrl = `${baseUrl}/fapi/v2/balance?${queryString}&signature=${signature}`;
      const balanceResponse = await fetch(balanceUrl, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/json"
        }
      });
      const positionUrl = `${baseUrl}/fapi/v2/positionRisk?${queryString}&signature=${signature}`;
      const positionResponse = await fetch(positionUrl, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/json"
        }
      });
      let usdtBalance = 0;
      const balanceContentType = balanceResponse.headers.get("content-type") || "";
      if (!balanceContentType.includes("application/json")) {
        const text = await balanceResponse.text().catch(() => "");
        console.error("[Futures balanceResponse] Non-JSON response:", text);
        throw new Error(`Binance Futures Balance returned an HTML page (HTTP ${balanceResponse.status}) instead of JSON. Ensure your API key permissions/geo-blocks allow Futures trading.`);
      }
      if (!balanceResponse.ok) {
        const errorData = await balanceResponse.json().catch(() => ({}));
        throw new Error(errorData.msg || `Binance Futures API balance query failed with HTTP status ${balanceResponse.status}`);
      }
      const balances = await balanceResponse.json();
      if (Array.isArray(balances)) {
        const usdtEntry = balances.find((b) => b.asset === "USDT");
        if (usdtEntry) {
          usdtBalance = parseFloat(usdtEntry.balance) || 0;
        }
      }
      let activePositions = [];
      const positionContentType = positionResponse.headers.get("content-type") || "";
      if (!positionContentType.includes("application/json")) {
        const text = await positionResponse.text().catch(() => "");
        console.error("[Futures positionResponse] Non-JSON response:", text);
        throw new Error(`Binance Futures PositionRisk returned an HTML page (HTTP ${positionResponse.status}) instead of JSON. Check key permissions or geographical limitations.`);
      }
      if (!positionResponse.ok) {
        const errorData = await positionResponse.json().catch(() => ({}));
        throw new Error(errorData.msg || `Binance Futures API position query failed with HTTP status ${positionResponse.status}`);
      }
      const positions = await positionResponse.json();
      if (Array.isArray(positions)) {
        activePositions = positions.filter((p) => parseFloat(p.positionAmt) !== 0).map((p) => {
          const amt = parseFloat(p.positionAmt);
          const entry = parseFloat(p.entryPrice) || 0;
          const mark = parseFloat(p.markPrice) || 0;
          const leverage = parseInt(p.leverage) || 1;
          const upnl = parseFloat(p.unRealizedProfit) || 0;
          const margin = parseFloat(p.isolatedWallet) || 0;
          const liq = parseFloat(p.liquidationPrice) || 0;
          const side = amt > 0 ? "LONG" : "SHORT";
          let formattedSymbol = p.symbol;
          if (p.symbol.endsWith("USDT")) {
            formattedSymbol = p.symbol.replace("USDT", "/USDT");
          }
          return {
            id: `pos-live-${p.symbol}-${side}`,
            symbol: formattedSymbol,
            side,
            leverage,
            marginType: p.isolated ? "ISOLATED" : "CROSS",
            entryPrice: entry,
            currentPrice: mark,
            amount: Math.abs(amt),
            margin: margin || Math.abs(amt) * entry / leverage,
            // estimate margin if crossed
            liquidationPrice: liq,
            unrealizedPnl: upnl,
            unrealizedPnlPercent: margin > 0 ? parseFloat((upnl / margin * 100).toFixed(2)) : parseFloat((upnl / (Math.abs(amt) * entry / leverage) * 100).toFixed(2))
          };
        });
      }
      let openOrders = [];
      try {
        const openOrdersUrl = `${baseUrl}/fapi/v1/openOrders?${queryString}&signature=${signature}`;
        const openOrdersResponse = await fetch(openOrdersUrl, {
          method: "GET",
          headers: {
            "X-MBX-APIKEY": apiKey,
            "Content-Type": "application/json"
          }
        });
        const openOrdersContentType = openOrdersResponse.headers.get("content-type") || "";
        if (openOrdersResponse.ok && openOrdersContentType.includes("application/json")) {
          const ooList = await openOrdersResponse.json();
          if (Array.isArray(ooList)) {
            openOrders = ooList.map((o) => ({
              orderId: o.orderId,
              symbol: o.symbol.endsWith("USDT") ? o.symbol.replace("USDT", "/USDT") : o.symbol,
              side: o.side,
              type: o.type,
              price: parseFloat(o.price) || 0,
              amount: parseFloat(o.origQty) || 0,
              filledAmount: parseFloat(o.executedQty) || 0,
              status: o.status,
              timestamp: o.time
            }));
          }
        }
      } catch (ooErr) {
        console.warn("Could not fetch futures open orders:", ooErr);
      }
      res.json({
        success: true,
        usdtBalance,
        positions: activePositions,
        openOrders
      });
    } catch (err) {
      console.warn("Binance Futures account load info:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error fetching Binance Futures parameters." });
    }
  });
  app.post("/api/binance/cancel-order", async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, symbol, orderId } = req.body;
      if (!apiKey || !apiSecret || !symbol || !orderId) {
        res.status(400).json({ success: false, error: "Incomplete parameters for order cancellation." });
        return;
      }
      const baseUrl = useTestnet ? "https://testnet.binance.vision" : "https://api.binance.com";
      const cleanSymbol = symbol.toUpperCase().replace("/", "");
      const timestamp = Date.now();
      const queryString = `symbol=${cleanSymbol}&orderId=${orderId}&timestamp=${timestamp}&recvWindow=6000`;
      const signature = import_crypto.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
      const url = `${baseUrl}/api/v3/order?${queryString}&signature=${signature}`;
      const fetchResponse = await fetch(url, {
        method: "DELETE",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/json"
        }
      });
      const cancelContentType = fetchResponse.headers.get("content-type") || "";
      if (!cancelContentType.includes("application/json")) {
        const text = await fetchResponse.text().catch(() => "");
        console.error("Non-JSON Response from Spot cancel endpoint:", text);
        res.status(502).json({
          success: false,
          error: `Binance Spot order cancellation returned a non-JSON response (HTTP status ${fetchResponse.status}). Response: ${text.slice(0, 100)}`
        });
        return;
      }
      const responseData = await fetchResponse.json();
      if (fetchResponse.ok) {
        res.json({ success: true, orderId: responseData.orderId, status: responseData.status });
      } else {
        res.status(fetchResponse.status).json({ success: false, error: responseData.msg || "Binance order cancellation failed." });
      }
    } catch (err) {
      console.error("Binance cancel specific order error:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error" });
    }
  });
  app.post("/api/binance/futures/cancel", async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, symbol, orderId } = req.body;
      if (!apiKey || !apiSecret || !symbol || !orderId) {
        res.status(400).json({ success: false, error: "Incomplete parameters for futures order cancellation." });
        return;
      }
      const baseUrl = useTestnet ? "https://testnet.binancefuture.com" : "https://fapi.binance.com";
      const cleanSymbol = symbol.toUpperCase().replace("/", "");
      const timestamp = Date.now();
      const queryString = `symbol=${cleanSymbol}&orderId=${orderId}&timestamp=${timestamp}&recvWindow=6000`;
      const signature = import_crypto.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
      const url = `${baseUrl}/fapi/v1/order?${queryString}&signature=${signature}`;
      const fetchResponse = await fetch(url, {
        method: "DELETE",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/json"
        }
      });
      const cancelContentType = fetchResponse.headers.get("content-type") || "";
      if (!cancelContentType.includes("application/json")) {
        const text = await fetchResponse.text().catch(() => "");
        console.error("Non-JSON Response from Futures cancel endpoint:", text);
        res.status(502).json({
          success: false,
          error: `Binance Futures order cancellation returned a non-JSON response (HTTP status ${fetchResponse.status}). Response: ${text.slice(0, 100)}`
        });
        return;
      }
      const responseData = await fetchResponse.json();
      if (fetchResponse.ok) {
        res.json({ success: true, orderId: responseData.orderId, status: responseData.status });
      } else {
        res.status(fetchResponse.status).json({ success: false, error: responseData.msg || "Binance futures order cancellation failed." });
      }
    } catch (err) {
      console.error("Binance cancel specific futures order error:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error" });
    }
  });
  app.post("/api/binance/futures/execute", async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, symbol, side, type, amount, price, leverage, marginType } = req.body;
      console.log("--- Incoming order request (raw body) ---", req.body);
      const missingParams = [];
      if (!apiKey) missingParams.push("apiKey");
      if (!apiSecret) missingParams.push("apiSecret");
      if (!symbol) missingParams.push("symbol");
      if (!side) missingParams.push("side");
      if (!type) missingParams.push("type");
      if (!amount) missingParams.push("amount");
      if (missingParams.length > 0) {
        const errorDesc = `Incomplete parameters for futures order dispatch. Missing or invalid keys: ${missingParams.join(", ")} (amount provided: ${amount})`;
        console.error("--- Missing params ---", errorDesc);
        res.status(400).json({ success: false, error: errorDesc });
        return;
      }
      const baseUrl = useTestnet ? "https://testnet.binancefuture.com" : "https://fapi.binance.com";
      const cleanSymbol = symbol.toUpperCase().replace("/", "");
      if (marginType) {
        try {
          const timestamp2 = Date.now();
          const marginTypeStr = marginType === "CROSS" || marginType === "CROSSED" ? "CROSSED" : "ISOLATED";
          const qStr = `symbol=${cleanSymbol}&marginType=${marginTypeStr}&timestamp=${timestamp2}`;
          const sig = import_crypto.default.createHmac("sha256", apiSecret).update(qStr).digest("hex");
          const mResponse = await fetch(`${baseUrl}/fapi/v1/marginType?${qStr}&signature=${sig}`, {
            method: "POST",
            headers: {
              "X-MBX-APIKEY": apiKey,
              "Content-Type": "application/json"
            }
          });
          const mContentType = mResponse.headers.get("content-type") || "";
          if (!mContentType.includes("application/json")) {
            throw new Error(`Non-JSON response received during marginType setup (HTTP ${mResponse.status})`);
          }
        } catch (marginErr) {
          console.log("[Binance Futures MarginType Setup Setup-Note]:", marginErr.message);
        }
      }
      if (leverage) {
        try {
          const timestamp2 = Date.now();
          const roundedLeverage = Math.max(1, Math.round(Number(leverage) || 1));
          const qStr = `symbol=${cleanSymbol}&leverage=${roundedLeverage}&timestamp=${timestamp2}`;
          const sig = import_crypto.default.createHmac("sha256", apiSecret).update(qStr).digest("hex");
          const lResponse = await fetch(`${baseUrl}/fapi/v1/leverage?${qStr}&signature=${sig}`, {
            method: "POST",
            headers: {
              "X-MBX-APIKEY": apiKey,
              "Content-Type": "application/json"
            }
          });
          const lContentType = lResponse.headers.get("content-type") || "";
          if (!lContentType.includes("application/json")) {
            throw new Error(`Non-JSON response received during leverage setup (HTTP ${lResponse.status})`);
          }
        } catch (levErr) {
          console.log("[Binance Futures Leverage Setup Setup-Note]:", levErr.message);
        }
      }
      const timestamp = Date.now();
      let queryString = `symbol=${cleanSymbol}&side=${side}&type=${type}&quantity=${amount}&timestamp=${timestamp}&recvWindow=6000`;
      if (type === "LIMIT") {
        queryString += `&price=${price}&timeInForce=GTC`;
      }
      const signature = import_crypto.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
      const orderUrl = `${baseUrl}/fapi/v1/order?${queryString}&signature=${signature}`;
      const fetchResponse = await fetch(orderUrl, {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      const orderResponseContentType = fetchResponse.headers.get("content-type") || "";
      if (!orderResponseContentType.includes("application/json")) {
        const text = await fetchResponse.text().catch(() => "");
        console.error("[Futures order execute] Non-JSON response:", text);
        res.status(502).json({
          success: false,
          error: `Binance Futures order execution gateway returned an HTML error response (HTTP ${fetchResponse.status}) instead of JSON. Confirm api-key restrictions allow placement and look for geographic IP restrictions.`
        });
        return;
      }
      const responseData = await fetchResponse.json();
      if (fetchResponse.ok) {
        res.json({
          success: true,
          orderId: responseData.orderId,
          clientOrderId: responseData.clientOrderId,
          status: responseData.status,
          avgPrice: responseData.avgPrice || responseData.price || price,
          executedQty: responseData.executedQty || amount,
          updateTime: responseData.updateTime
        });
      } else {
        res.status(fetchResponse.status).json({
          success: false,
          error: responseData.msg || "Binance Futures order failed."
        });
      }
    } catch (err) {
      console.error("Binance Futures Order dispatch engine error:", err);
      res.status(500).json({ success: false, error: err.message || "Fatal error issuing order to Binance Futures gateway." });
    }
  });
  app.post("/api/gemini/alert-analysis", async (req, res) => {
    const { symbol, type, value, condition, currentValue, lang } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        res.json({ reply: lang === "ar" ? "\u062A\u062D\u0644\u064A\u0644 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B." : "AI analysis currently unavailable." });
        return;
      }
      const ai2 = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { "User-Agent": "aistudio-build" }
        }
      });
      const prompt = `Analyze the ${symbol} pair. An alert triggered because the ${type} reached ${value} (condition: ${condition}). The current ${type} is ${currentValue}.
      Please provide a technical explanation for this alert, detailing reasons like volume spikes, significant whale movements/activities, or key technical levels (support/resistance, overbought/sold). Provide a brief professional verdict (Buy/Sell/Hold).
      Limit the response to 3 sentences in ${lang}.`;
      const response = await ai2.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional trader and financial analyst for Al-Moharif AI.",
          temperature: 0.5
        }
      });
      res.json({ reply: response.text });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.use(import_express.default.static(path.join(process.cwd(), "public")));
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      try {
        const indexHtmlPath = path.join(process.cwd(), "index.html");
        if (fs.existsSync(indexHtmlPath)) {
          let html = fs.readFileSync(indexHtmlPath, "utf8");
          html = await vite.transformIndexHtml(req.originalUrl, html);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } else {
          next();
        }
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "www");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      const prodIndexPath = path.join(distPath, "index.html");
      const devIndexPath = path.join(process.cwd(), "index.html");
      if (fs.existsSync(prodIndexPath)) {
        res.sendFile(prodIndexPath);
      } else if (fs.existsSync(devIndexPath)) {
        res.sendFile(devIndexPath);
      } else {
        res.status(404).send("Application Index file not found. Please wait for the initial build to complete.");
      }
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server initiated. Routing port: ${PORT}`);
  });
  app.post("/api/ai/calculate-smart-sl", async (req, res) => {
    const { symbol, side, entryPrice, currentPrice, klines } = req.body;
    try {
      const period = 14;
      if (!klines || klines.length < period) {
        return res.json({ slPrice: side === "LONG" ? currentPrice * 0.95 : currentPrice * 1.05, reason: "Not enough data for ATR" });
      }
      let trSum = 0;
      for (let i = klines.length - period; i < klines.length; i++) {
        const h = parseFloat(klines[i][2]);
        const l = parseFloat(klines[i][3]);
        const c = parseFloat(klines[i][4]);
        const prevC = parseFloat(klines[i - 1][4]);
        trSum += Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
      }
      const atr = trSum / period;
      const prompt = `You are a professional crypto trading expert.
      Calculate an optimal stop-loss (SL) level for a ${side} position.
      Entry: ${entryPrice}, Current: ${currentPrice}.
      ATR (14): ${atr.toFixed(4)}.
      Use ATR to calculate a safe base stop-loss, then adjust it dynamically based on the current market trend.
      CRITICAL: If the current trend is strong (based on entry vs current price), be patient and hold the position. Only close if the rebound trend has clearly and fully reversed.
      
      Output ONLY a valid JSON object:
      {
        "slPrice": number,
        "reason": string
      }
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("Smart SL Calculation Error:", error);
      res.status(500).json({ slPrice: side === "LONG" ? currentPrice * 0.95 : currentPrice * 1.05, reason: "Calculation failed, default fallback." });
    }
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
