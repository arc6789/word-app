"use node";
import { OpenAI } from "openai";
import { internalAction, action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { createApi } from 'unsplash-js';
import fetch from 'node-fetch';
import {extractValues, parseOpenAiInputToArray, isOver24Hours, isOver5Minutes} from "./services";
