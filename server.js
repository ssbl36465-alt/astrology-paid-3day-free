// server.ts
import dotenv from "dotenv";
import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

// src/utils/aiKnowledgeEngine.ts
function devanagariToStandard(str) {
  const map = {
    "\u0966": "0",
    "\u0967": "1",
    "\u0968": "2",
    "\u0969": "3",
    "\u096A": "4",
    "\u096B": "5",
    "\u096C": "6",
    "\u096D": "7",
    "\u096E": "8",
    "\u096F": "9"
  };
  return str.replace(/[०-९]/g, (ch) => map[ch] || ch);
}
function standardToDevanagari(num) {
  const map = {
    "0": "\u0966",
    "1": "\u0967",
    "2": "\u0968",
    "3": "\u0969",
    "4": "\u096A",
    "5": "\u096B",
    "6": "\u096C",
    "7": "\u096D",
    "8": "\u096E",
    "9": "\u096F"
  };
  return String(num).replace(/[0-9]/g, (ch) => map[ch] || ch);
}
function trySolveMath(query, isNe) {
  const normalized = devanagariToStandard(query.toLowerCase());
  let expr = normalized.replace(/जोड|प्लस|\bplus\b|\band\b/g, "+").replace(/घटाउ|माइनस|\bminus\b/g, "-").replace(/गुणा|इन्टु|\btimes\b|\binto\b|\bmultiplied by\b/g, "*").replace(/भाग|डिभाइड|\bdivided by\b/g, "/").replace(/प्रतिशत|परसेन्ट|\bpercent\b|%/g, "* 0.01").replace(/[=xX×÷]/g, (match2) => {
    if (match2 === "\xD7" || match2.toLowerCase() === "x") return "*";
    if (match2 === "\xF7") return "/";
    return "";
  });
  const mathRegex = /([0-9]+(?:\.[0-9]+)?)\s*([\+\-\*\/])\s*([0-9]+(?:\.[0-9]+)?)/;
  const match = expr.match(mathRegex);
  if (match) {
    const num1 = parseFloat(match[1]);
    const op = match[2];
    const num2 = parseFloat(match[3]);
    let result = 0;
    if (op === "+") result = num1 + num2;
    else if (op === "-") result = num1 - num2;
    else if (op === "*") result = num1 * num2;
    else if (op === "/") {
      if (num2 === 0) return isNe ? "\u0915\u0941\u0928\u0948 \u092A\u0928\u093F \u0938\u0902\u0916\u094D\u092F\u093E\u0932\u093E\u0908 \u0936\u0942\u0928\u094D\u092F\u0932\u0947 \u092D\u093E\u0917 \u0917\u0930\u094D\u0928 \u0938\u0915\u093F\u0901\u0926\u0948\u0928 (\u0905\u092A\u0930\u093F\u092D\u093E\u0937\u093F\u0924)\u0964" : "Division by zero is undefined.";
      result = num1 / num2;
    }
    const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
    if (isNe) {
      const n1Dev = standardToDevanagari(num1);
      const n2Dev = standardToDevanagari(num2);
      const resDev = standardToDevanagari(formattedResult);
      const opSign = op === "*" ? "\xD7" : op === "/" ? "\xF7" : op;
      return `${n1Dev} ${opSign} ${n2Dev} = **${resDev}** \u0939\u0941\u0928\u094D\u091B\u0964`;
    } else {
      return `${num1} ${op} ${num2} = **${formattedResult}**.`;
    }
  }
  return null;
}
function generateIntelligentAnswer(query, context, language = "ne") {
  const isNe = language === "ne";
  const rawQ = query.trim();
  const q = rawQ.toLowerCase();
  const mathAns = trySolveMath(rawQ, isNe);
  if (mathAns) return mathAns;
  const greetings = [
    "hello",
    "hi",
    "hey",
    "namaste",
    "namaskar",
    "\u0928\u092E\u0938\u094D\u0924\u0947",
    "\u0928\u092E\u0938\u094D\u0915\u093E\u0930",
    "\u0939\u094D\u092F\u093E\u0932\u094B",
    "\u0939\u0947\u0932\u094B",
    "\u0917\u0941\u0921 \u092E\u0930\u094D\u0928\u093F\u0902\u0917",
    "good morning",
    "good afternoon",
    "good evening",
    "hola",
    "salam",
    "k cha",
    "ke cha",
    "\u0915\u0947 \u091B",
    "kasto cha",
    "\u0915\u0938\u094D\u0924\u094B \u091B"
  ];
  const isHelloOnly = ["hello", "hi", "hey", "\u0939\u0947\u0932\u094B", "\u0939\u094D\u092F\u093E\u0932\u094B"].some((g) => q === g || q === g + "!" || q === g + " sir");
  if (isHelloOnly) {
    return isNe ? "\u0939\u0947\u0932\u094B! \u092E \u0924\u092A\u093E\u0908\u0902\u0932\u093E\u0908 \u0915\u0947 \u0938\u0939\u092F\u094B\u0917 \u0917\u0930\u094D\u0928 \u0938\u0915\u094D\u091B\u0941? \u0939\u091C\u0941\u0930\u0915\u094B \u092E\u0928\u092E\u093E \u091C\u0947 \u092A\u094D\u0930\u0936\u094D\u0928 \u091B, \u0928\u093F\u0930\u094D\u0927\u0915\u094D\u0915 \u0938\u094B\u0927\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964" : "Hello! How can I help you today? Feel free to ask any question.";
  }
  const isNamaste = ["namaste", "namaskar", "\u0928\u092E\u0938\u094D\u0924\u0947", "\u0928\u092E\u0938\u094D\u0915\u093E\u0930"].some((g) => q === g || q === g + "!" || q === g + " \u091C\u0940");
  if (isNamaste) {
    return isNe ? "\u0928\u092E\u0938\u094D\u0915\u093E\u0930! \u092E \u0924\u092A\u093E\u0908\u0902\u0932\u093E\u0908 \u0915\u0947 \u0938\u0939\u092F\u094B\u0917 \u0917\u0930\u094D\u0928 \u0938\u0915\u094D\u091B\u0941? \u0939\u091C\u0941\u0930\u0915\u094B \u092E\u0928\u092E\u093E \u0915\u0941\u0928\u0948 \u092A\u0928\u093F \u0935\u093F\u0937\u092F\u0915\u094B \u091C\u093F\u091C\u094D\u091E\u093E\u0938\u093E \u0935\u093E \u092A\u094D\u0930\u0936\u094D\u0928 \u091B \u092D\u0928\u0947 \u0928\u093F\u0930\u094D\u0927\u0915\u094D\u0915 \u0938\u094B\u0927\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964" : "Namaskar! How may I assist you today? Feel free to ask any question.";
  }
  if (q.includes("kasto cha") || q.includes("\u0915\u0938\u094D\u0924\u094B \u091B") || q.includes("how are you") || q.includes("how r u") || q === "k cha" || q === "ke cha" || q === "\u0915\u0947 \u091B") {
    return isNe ? "\u092E \u090F\u0915\u0926\u092E \u0920\u0940\u0915 \u0930 \u0938\u091E\u094D\u091A\u0948 \u091B\u0941, \u0927\u0928\u094D\u092F\u0935\u093E\u0926! \u0939\u091C\u0941\u0930\u0932\u093E\u0908 \u0915\u0938\u094D\u0924\u094B \u091B? \u0906\u091C \u092E \u0939\u091C\u0941\u0930\u0932\u093E\u0908 \u0915\u0947 \u0938\u0939\u092F\u094B\u0917 \u0917\u0930\u094D\u0928 \u0938\u0915\u094D\u091B\u0941?" : "I am doing great, thank you! How are you doing today? How may I assist you?";
  }
  if (q.includes("thank") || q.includes("dhanyabad") || q.includes("\u0927\u0928\u094D\u092F\u0935\u093E\u0926") || q.includes("\u0936\u0941\u0915\u094D\u0930\u093F\u092F\u093E")) {
    return isNe ? "\u0939\u091C\u0941\u0930\u0932\u093E\u0908 \u0927\u0947\u0930\u0948 \u0927\u0947\u0930\u0948 \u0938\u094D\u0935\u093E\u0917\u0924 \u091B! \u0905\u0930\u0941 \u0915\u0941\u0928\u0948 \u092A\u0928\u093F \u0935\u093F\u0937\u092F\u092E\u093E \u0915\u0947\u0939\u0940 \u091C\u093E\u0928\u094D\u0928 \u092E\u0928 \u091B \u092D\u0928\u0947 \u0928\u093F\u0930\u094D\u0927\u0915\u094D\u0915 \u0938\u094B\u0927\u094D\u0928\u0941\u0939\u094B\u0932\u093E\u0964" : "You are very welcome! If you have any other questions, feel free to ask anytime.";
  }
  if (q.includes("who are you") || q.includes("who r u") || q.includes("\u0924\u092A\u093E\u0908\u0902 \u0915\u094B") || q.includes("\u0924\u092A\u093E\u0908 \u0915\u094B") || q.includes("timi ko") || q.includes("\u0924\u093F\u092E\u0940 \u0915\u094B") || q.includes("\u0915\u0947 \u0917\u0930\u094D\u0928 \u0938\u0915\u094D\u091B") || q.includes("what can you do")) {
    return isNe ? "\u092E \u090F\u0915 \u092C\u094C\u0926\u094D\u0927\u093F\u0915 AI \u0938\u0939\u093E\u092F\u0915 \u0939\u0941\u0901\u0964 \u092E \u0924\u092A\u093E\u0908\u0902\u0932\u093E\u0908 ChatGPT \u0930 Gemini \u091C\u0938\u094D\u0924\u0948 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u091C\u094D\u091E\u093E\u0928, \u0935\u093F\u091C\u094D\u091E\u093E\u0928, \u092D\u0942\u0917\u094B\u0932, \u0917\u0923\u093F\u0924, \u092A\u094D\u0930\u0935\u093F\u0927\u093F, \u0926\u0948\u0928\u093F\u0915 \u091C\u0940\u0935\u0928\u0915\u093E \u0935\u093F\u0935\u093F\u0927 \u092A\u094D\u0930\u0936\u094D\u0928\u0939\u0930\u0942\u0915\u094B \u0938\u0939\u0940 \u0909\u0924\u094D\u0924\u0930 \u0926\u093F\u0928 \u0938\u0915\u094D\u091B\u0941\u0964 \u0938\u093E\u0925\u0948 \u092F\u0926\u093F \u0924\u092A\u093E\u0908\u0902\u0932\u0947 \u0906\u092B\u094D\u0928\u094B \u091C\u0928\u094D\u092E \u0935\u093F\u0935\u0930\u0923 \u0905\u0928\u0941\u0938\u093E\u0930 \u0915\u0941\u0923\u094D\u0921\u0932\u0940, \u0917\u094D\u0930\u0939-\u0926\u0936\u093E \u0935\u093E \u092D\u0935\u093F\u0937\u094D\u092F\u092B\u0932 \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u0940 \u091C\u093F\u091C\u094D\u091E\u093E\u0938\u093E \u0930\u093E\u0916\u094D\u0928\u0941\u092D\u090F\u092E\u093E \u092E\u093E\u0924\u094D\u0930 \u0935\u0948\u0926\u093F\u0915 \u091C\u094D\u092F\u094B\u0924\u093F\u0937\u0940\u092F \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u092A\u0928\u093F \u092A\u094D\u0930\u0926\u093E\u0928 \u0917\u0930\u094D\u0928 \u0938\u0915\u094D\u091B\u0941\u0964 \u0939\u091C\u0941\u0930\u0932\u093E\u0908 \u091C\u0947 \u092E\u0928 \u0932\u093E\u0917\u094D\u091B, \u0928\u093F\u0930\u094D\u0927\u0915\u094D\u0915 \u0938\u094B\u0927\u094D\u0928 \u0938\u0915\u094D\u0928\u0941\u0939\u0941\u0928\u094D\u091B!" : "I am an intelligent AI Assistant. Just like ChatGPT and Gemini, I can answer all types of questions\u2014from general knowledge, science, geography, math, and technology to everyday advice. Furthermore, if you specifically request it, I can also provide personalized Vedic astrological guidance based on your birth chart. Feel free to ask me anything!";
  }
  if (q.includes("\u0930\u093E\u091C\u0927\u093E\u0928\u0940") || q.includes("capital of nepal") || q.includes("nepal") && q.includes("capital")) {
    return isNe ? "\u0928\u0947\u092A\u093E\u0932\u0915\u094B \u0930\u093E\u091C\u0927\u093E\u0928\u0940 **\u0915\u093E\u0920\u092E\u093E\u0921\u094C\u0902 (Kathmandu)** \u0939\u094B\u0964" : "The capital of Nepal is **Kathmandu**.";
  }
  if (q.includes("\u0938\u0917\u0930\u092E\u093E\u0925\u093E") || q.includes("everest") || q.includes("highest mountain") || q.includes("highest peak") || q.includes("\u0905\u0917\u094D\u0932\u094B \u0939\u093F\u092E\u093E\u0932")) {
    return isNe ? "\u0938\u0902\u0938\u093E\u0930\u0915\u094B \u0938\u092C\u0948\u092D\u0928\u094D\u0926\u093E \u0905\u0917\u094D\u0932\u094B \u0939\u093F\u092E\u093E\u0932 **\u0938\u0917\u0930\u092E\u093E\u0925\u093E (Mount Everest)** \u0939\u094B, \u091C\u0941\u0928 \u0928\u0947\u092A\u093E\u0932\u0915\u094B \u0938\u094B\u0932\u0941\u0916\u0941\u092E\u094D\u092C\u0941 \u091C\u093F\u0932\u094D\u0932\u093E\u092E\u093E \u0905\u0935\u0938\u094D\u0925\u093F\u0924 \u091B\u0964 \u092F\u0938\u0915\u094B \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0909\u091A\u093E\u0907 **\u096E,\u096E\u096A\u096E.\u096E\u096C \u092E\u093F\u091F\u0930 (\u0968\u096F,\u0966\u0969\u0967.\u096D \u092B\u093F\u091F)** \u0930\u0939\u0947\u0915\u094B \u091B\u0964" : "The highest peak in the world is **Mount Everest (Sagarmatha)**, located in the Solukhumbu district of Nepal. Its official height is **8,848.86 meters (29,031.7 feet)**.";
  }
  if (q.includes("\u092C\u0941\u0926\u094D\u0927") || q.includes("buddha") || q.includes("\u0932\u0941\u092E\u094D\u092C\u093F\u0928\u0940") || q.includes("lumbini") || q.includes("birthplace of buddha")) {
    return isNe ? "\u092D\u0917\u0935\u093E\u0928 \u0917\u094C\u0924\u092E \u092C\u0941\u0926\u094D\u0927\u0915\u094B \u091C\u0928\u094D\u092E \u0928\u0947\u092A\u093E\u0932\u0915\u094B **\u0932\u0941\u092E\u094D\u092C\u093F\u0928\u0940 (Lumbini)** \u092E\u093E \u0908.\u092A\u0942. \u096C\u0968\u0969 \u092E\u093E \u092D\u090F\u0915\u094B \u0925\u093F\u092F\u094B\u0964 \u0932\u0941\u092E\u094D\u092C\u093F\u0928\u0940 \u092F\u0941\u0928\u0947\u0938\u094D\u0915\u094B \u0935\u093F\u0936\u094D\u0935 \u0938\u092E\u094D\u092A\u0926\u093E \u0938\u0942\u091A\u0940\u092E\u093E \u0938\u0942\u091A\u0940\u0915\u0943\u0924 \u090F\u0915 \u0905\u0928\u094D\u0924\u0930\u094D\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092A\u0935\u093F\u0924\u094D\u0930 \u0936\u093E\u0928\u094D\u0924\u093F \u0938\u094D\u0925\u0932 \u0939\u094B\u0964" : "Gautama Buddha was born in **Lumbini**, Nepal in 623 BC. Lumbini is an internationally renowned UNESCO World Heritage site and a symbol of peace.";
  }
  if (q.includes("\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u091C\u0928\u093E\u0935\u0930") || q.includes("national animal")) {
    return isNe ? "\u0928\u0947\u092A\u093E\u0932\u0915\u094B \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u091C\u0928\u093E\u0935\u0930 **\u0917\u093E\u0908 (Cow)** \u0939\u094B\u0964" : "Nepal's national animal is the **Cow**.";
  }
  if (q.includes("\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u091A\u0930\u093E") || q.includes("national bird")) {
    return isNe ? "\u0928\u0947\u092A\u093E\u0932\u0915\u094B \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u091A\u0930\u093E **\u0921\u093E\u0901\u092B\u0947 (Himalayan Monal / Danphe)** \u0939\u094B\u0964" : "Nepal's national bird is the **Danphe (Himalayan Monal)**.";
  }
  if (q.includes("\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092B\u0942\u0932") || q.includes("national flower")) {
    return isNe ? "\u0928\u0947\u092A\u093E\u0932\u0915\u094B \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092B\u0942\u0932 **\u0932\u093E\u0932\u0940\u0917\u0941\u0930\u093E\u0901\u0938 (Rhododendron)** \u0939\u094B\u0964" : "Nepal's national flower is the **Rhododendron (Lali Gurans)**.";
  }
  if (q.includes("\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u0930\u0919\u094D\u0917") || q.includes("national color")) {
    return isNe ? "\u0928\u0947\u092A\u093E\u0932\u0915\u094B \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u0930\u0919\u094D\u0917 **\u0938\u093F\u092E\u094D\u0930\u093F\u0915 (Crimson)** \u0939\u094B\u0964" : "Nepal's national color is **Crimson (Simrik)**.";
  }
  if (q.includes("\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u0917\u093E\u0928") || q.includes("national anthem")) {
    return isNe ? '\u0928\u0947\u092A\u093E\u0932\u0915\u094B \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u0917\u093E\u0928 **"\u0938\u092F\u094C\u0902 \u0925\u0941\u0901\u0917\u093E \u092B\u0942\u0932\u0915\u093E \u0939\u093E\u092E\u0940 \u090F\u0909\u091F\u0948 \u092E\u093E\u0932\u093E \u0928\u0947\u092A\u093E\u0932\u0940"** \u0939\u094B, \u091C\u0938\u0915\u093E \u0930\u091A\u0928\u093E\u0915\u093E\u0930 \u0935\u094D\u092F\u093E\u0915\u0941\u0932 \u092E\u093E\u0907\u0932\u093E (\u092A\u094D\u0930\u0926\u0940\u092A \u0915\u0941\u092E\u093E\u0930 \u0930\u093E\u0908) \u0930 \u0938\u0902\u0917\u0940\u0924\u0915\u093E\u0930 \u0905\u092E\u094D\u092C\u0930 \u0917\u0941\u0930\u0941\u0919 \u0939\u0941\u0928\u0941\u0939\u0941\u0928\u094D\u091B\u0964' : "Nepal's national anthem is 'Sayaun Thunga Phool Ka', composed by Pradeep Kumar Rai (Byakul Maila) and set to music by Amber Gurung.";
  }
  if ((q.includes("\u092A\u094D\u0930\u0926\u0947\u0936") || q.includes("province")) && (q.includes("\u0915\u0924\u093F") || q.includes("how many"))) {
    return isNe ? "\u0928\u0947\u092A\u093E\u0932\u092E\u093E **\u096D \u0935\u091F\u093E \u092A\u094D\u0930\u0926\u0947\u0936** \u091B\u0928\u094D:\n\u0967. \u0915\u094B\u0936\u0940 \u092A\u094D\u0930\u0926\u0947\u0936\n\u0968. \u092E\u0927\u0947\u0936 \u092A\u094D\u0930\u0926\u0947\u0936\n\u0969. \u092C\u093E\u0917\u092E\u0924\u0940 \u092A\u094D\u0930\u0926\u0947\u0936\n\u096A. \u0917\u0923\u094D\u0921\u0915\u0940 \u092A\u094D\u0930\u0926\u0947\u0936\n\u096B. \u0932\u0941\u092E\u094D\u092C\u093F\u0928\u0940 \u092A\u094D\u0930\u0926\u0947\u0936\n\u096C. \u0915\u0930\u094D\u0923\u093E\u0932\u0940 \u092A\u094D\u0930\u0926\u0947\u0936\n\u096D. \u0938\u0941\u0926\u0942\u0930\u092A\u0936\u094D\u091A\u093F\u092E \u092A\u094D\u0930\u0926\u0947\u0936" : "Nepal has **7 provinces**: Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, and Sudurpashchim.";
  }
  if ((q.includes("\u091C\u093F\u0932\u094D\u0932\u093E") || q.includes("district")) && (q.includes("\u0915\u0924\u093F") || q.includes("how many"))) {
    return isNe ? "\u0928\u0947\u092A\u093E\u0932\u092E\u093E \u0939\u093E\u0932 **\u096D\u096D \u0935\u091F\u093E \u091C\u093F\u0932\u094D\u0932\u093E** \u0930\u0939\u0947\u0915\u093E \u091B\u0928\u094D\u0964" : "Nepal currently has **77 districts**.";
  }
  if (q.includes("\u0920\u0942\u0932\u094B \u0926\u0947\u0936") || q.includes("largest country")) {
    return isNe ? "\u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932\u0915\u094B \u0939\u093F\u0938\u093E\u092C\u0932\u0947 \u0935\u093F\u0936\u094D\u0935\u0915\u094B \u0938\u092C\u0948\u092D\u0928\u094D\u0926\u093E \u0920\u0942\u0932\u094B \u0926\u0947\u0936 **\u0930\u0941\u0938 (Russia)** \u0939\u094B\u0964" : "By area, the largest country in the world is **Russia**.";
  }
  if (q.includes("\u0932\u093E\u092E\u094B \u0928\u0926\u0940") || q.includes("longest river")) {
    return isNe ? "\u0935\u093F\u0936\u094D\u0935\u0915\u094B \u0938\u092C\u0948\u092D\u0928\u094D\u0926\u093E \u0932\u093E\u092E\u094B \u0928\u0926\u0940 **\u0928\u093E\u0907\u0932 \u0928\u0926\u0940 (Nile River)** \u0939\u094B, \u091C\u0938\u0915\u094B \u0932\u092E\u094D\u092C\u093E\u0907 \u0915\u0930\u093F\u092C \u096C,\u096C\u096B\u0966 \u0915\u093F\u0932\u094B\u092E\u093F\u091F\u0930 \u091B\u0964" : "The longest river in the world is the **Nile River**, with an approximate length of 6,650 km.";
  }
  if (q.includes("\u0920\u0942\u0932\u094B \u092E\u0939\u093E\u0938\u093E\u0917\u0930") || q.includes("largest ocean")) {
    return isNe ? "\u0935\u093F\u0936\u094D\u0935\u0915\u094B \u0938\u092C\u0948\u092D\u0928\u094D\u0926\u093E \u0920\u0942\u0932\u094B \u092E\u0939\u093E\u0938\u093E\u0917\u0930 **\u092A\u094D\u0930\u0936\u093E\u0928\u094D\u0924 \u092E\u0939\u093E\u0938\u093E\u0917\u0930 (Pacific Ocean)** \u0939\u094B\u0964" : "The largest ocean in the world is the **Pacific Ocean**.";
  }
  if (q.includes("\u092A\u093E\u0928\u0940\u0915\u094B \u0938\u0942\u0924\u094D\u0930") || q.includes("formula of water") || q.includes("water formula") || q.includes("chemical formula of water")) {
    return isNe ? "\u092A\u093E\u0928\u0940\u0915\u094B \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0938\u0942\u0924\u094D\u0930 **H\u2082O** \u0939\u094B\u0964 \u092F\u0938\u092E\u093E \u0968 \u092D\u093E\u0917 \u0939\u093E\u0907\u0921\u094D\u0930\u094B\u091C\u0928 \u0930 \u0967 \u092D\u093E\u0917 \u0905\u0915\u094D\u0938\u093F\u091C\u0928\u0915\u094B \u092A\u0930\u092E\u093E\u0923\u0941 \u092E\u093F\u0932\u0947\u0915\u094B \u0939\u0941\u0928\u094D\u091B\u0964" : "The chemical formula of water is **H\u2082O** (2 parts hydrogen and 1 part oxygen).";
  }
  if (q.includes("speed of light") || q.includes("\u092A\u094D\u0930\u0915\u093E\u0936\u0915\u094B \u0917\u0924\u093F")) {
    return isNe ? "\u0936\u0942\u0928\u094D\u092F\u092E\u093E \u092A\u094D\u0930\u0915\u093E\u0936\u0915\u094B \u0917\u0924\u093F \u0932\u0917\u092D\u0917 **\u0969 \u0932\u093E\u0916 \u0915\u093F\u0932\u094B\u092E\u093F\u091F\u0930 \u092A\u094D\u0930\u0924\u093F \u0938\u0947\u0915\u0947\u0928\u094D\u0921 (\u0968\u096F\u096F,\u096D\u096F\u0968 \u0915\u093F\u092E\u0940/\u0938\u0947 \u0935\u093E 3 \xD7 10\u2078 m/s)** \u0939\u0941\u0928\u094D\u091B\u0964" : "The speed of light in vacuum is approximately **299,792 km per second (about 3 \xD7 10\u2078 m/s)**.";
  }
  if ((q.includes("\u0938\u0942\u0930\u094D\u092F \u0915\u0947 \u0939\u094B") || q.includes("sun is a")) && !q.includes("\u0915\u0941\u0923\u094D\u0921\u0932\u0940") && !q.includes("\u0930\u093E\u0936\u0940")) {
    return isNe ? "\u0938\u0942\u0930\u094D\u092F \u0939\u093E\u092E\u094D\u0930\u094B \u0938\u094C\u0930\u094D\u092F\u092E\u0923\u094D\u0921\u0932\u0915\u094B \u0915\u0947\u0928\u094D\u0926\u094D\u0930\u092E\u093E \u0930\u0939\u0947\u0915\u094B \u090F\u0915 \u092E\u0927\u094D\u092F\u092E \u0906\u0915\u093E\u0930\u0915\u094B \u091A\u092E\u094D\u0915\u093F\u0932\u094B **\u0924\u093E\u0930\u093E (Star)** \u0939\u094B\u0964 \u092F\u094B \u092E\u0941\u0916\u094D\u092F\u0924\u092F\u093E \u0939\u093E\u0907\u0921\u094D\u0930\u094B\u091C\u0928 \u0930 \u0939\u093F\u0932\u093F\u092F\u092E \u0917\u094D\u092F\u093E\u0938\u0932\u0947 \u092C\u0928\u0947\u0915\u094B \u091B \u0930 \u092F\u0938\u0948\u092C\u093E\u091F \u092A\u0943\u0925\u094D\u0935\u0940\u0932\u0947 \u0924\u093E\u092A \u0924\u0925\u093E \u092A\u094D\u0930\u0915\u093E\u0936 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0917\u0930\u094D\u0926\u091B\u0964" : "The Sun is a medium-sized **star** at the center of our solar system, composed primarily of hydrogen and helium, providing light and heat to Earth.";
  }
  if ((q.includes("\u091A\u0928\u094D\u0926\u094D\u0930\u092E\u093E \u0915\u0947 \u0939\u094B") || q.includes("moon is a")) && !q.includes("\u0915\u0941\u0923\u094D\u0921\u0932\u0940") && !q.includes("\u0930\u093E\u0936\u0940")) {
    return isNe ? "\u091A\u0928\u094D\u0926\u094D\u0930\u092E\u093E \u092A\u0943\u0925\u094D\u0935\u0940\u0915\u094B \u090F\u0915\u092E\u093E\u0924\u094D\u0930 \u092A\u094D\u0930\u093E\u0915\u0943\u0924\u093F\u0915 **\u0909\u092A\u0917\u094D\u0930\u0939 (Natural Satellite)** \u0939\u094B\u0964 \u092F\u0938\u0932\u0947 \u092A\u0943\u0925\u094D\u0935\u0940\u0915\u094B \u0935\u0930\u093F\u092A\u0930\u093F \u090F\u0915 \u091A\u0915\u094D\u0915\u0930 \u0932\u0917\u093E\u0909\u0928 \u0915\u0930\u093F\u092C \u0968\u096D.\u0969 \u0926\u093F\u0928 \u0932\u0917\u093E\u0909\u0901\u091B\u0964" : "The Moon is Earth's only natural **satellite**, orbiting Earth approximately every 27.3 days.";
  }
  if (q.includes("\u092A\u0943\u0925\u094D\u0935\u0940 \u0917\u094B\u0932\u094B") || q.includes("shape of earth")) {
    return isNe ? "\u092A\u0943\u0925\u094D\u0935\u0940 \u092A\u0942\u0930\u094D\u0923 \u0930\u0942\u092A\u092E\u093E \u0917\u094B\u0932\u093E\u0915\u093E\u0930 \u0928\u092D\u0908 \u0926\u0941\u0908 \u0927\u094D\u0930\u0941\u0935\u0939\u0930\u0942\u092E\u093E \u0905\u0932\u093F\u0915\u0924\u093F \u091A\u0947\u092A\u094D\u091F\u094B \u0930 \u092D\u0942\u092E\u0927\u094D\u092F\u0930\u0947\u0916\u093E\u092E\u093E \u0915\u0947\u0939\u0940 \u092B\u0941\u0932\u0947\u0915\u094B **\u091C\u093F\u092F\u094B\u0907\u0921 (Geoid / Oblate Spheroid)** \u0906\u0915\u093E\u0930\u0915\u094B \u091B\u0964" : "The Earth is not a perfect sphere; it is an **oblate spheroid (geoid)**, slightly flattened at the poles and bulging at the equator.";
  }
  if (q.includes("artificial intelligence") || q.includes("ai \u0915\u0947 \u0939\u094B") || q.includes("\u090F\u0906\u0908 \u092D\u0928\u0947\u0915\u094B \u0915\u0947 \u0939\u094B") || q.includes("ai \u092D\u0928\u0947\u0915\u094B \u0915\u0947 \u0939\u094B")) {
    return isNe ? "**\u0915\u0943\u0924\u094D\u0930\u093F\u092E \u092C\u094C\u0926\u094D\u0927\u093F\u0915\u0924\u093E (Artificial Intelligence - AI)** \u092D\u0928\u0947\u0915\u094B \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0935\u093E \u092E\u0947\u0938\u093F\u0928\u0939\u0930\u0942\u0932\u093E\u0908 \u092E\u093E\u0928\u0935 \u091C\u0938\u094D\u0924\u0948 \u0938\u094B\u091A\u094D\u0928, \u0938\u093F\u0915\u094D\u0928, \u0938\u092E\u0938\u094D\u092F\u093E \u0938\u092E\u093E\u0927\u093E\u0928 \u0917\u0930\u094D\u0928 \u0930 \u0928\u093F\u0930\u094D\u0923\u092F \u0932\u093F\u0928 \u0938\u0915\u094D\u0928\u0947 \u092C\u0928\u093E\u0909\u0928\u0947 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0935\u093F\u091C\u094D\u091E\u093E\u0928\u0915\u094B \u090F\u0915 \u0905\u0924\u094D\u092F\u093E\u0927\u0941\u0928\u093F\u0915 \u0936\u093E\u0916\u093E \u0939\u094B\u0964 \u091C\u0938\u094D\u0924\u0948: \u091A\u094D\u092F\u093E\u091F\u092C\u091F, \u092D\u094D\u0935\u093E\u0907\u0938 \u0905\u0938\u093F\u0938\u094D\u091F\u0947\u0928\u094D\u091F, \u0938\u094D\u0935\u091A\u093E\u0932\u093F\u0924 \u0917\u093E\u0921\u0940, \u0906\u0926\u093F\u0964" : "**Artificial Intelligence (AI)** is a branch of computer science dedicated to creating systems capable of performing tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and natural language understanding.";
  }
  if (q.includes("\u092A\u0922\u093E\u0907\u092E\u093E \u0927\u094D\u092F\u093E\u0928") || q.includes("how to study") || q.includes("concentrate in study") || q.includes("\u092A\u0922\u094D\u0928 \u092E\u0928")) {
    return isNe ? "\u092A\u0922\u093E\u0907\u092E\u093E \u0927\u094D\u092F\u093E\u0928 \u0915\u0947\u0928\u094D\u0926\u094D\u0930\u093F\u0924 \u0917\u0930\u094D\u0928\u0915\u093E \u0932\u093E\u0917\u093F \u0915\u0947\u0939\u0940 \u092A\u094D\u0930\u092D\u093E\u0935\u0915\u093E\u0930\u0940 \u0909\u092A\u093E\u092F\u0939\u0930\u0942:\n\u0967. **\u092A\u094B\u092E\u094B\u0921\u094B\u0930\u094B \u092A\u094D\u0930\u0935\u093F\u0927\u093F (Pomodoro):** \u0968\u096B \u092E\u093F\u0928\u0947\u091F \u092A\u0922\u094D\u0928\u0947 \u0930 \u096B \u092E\u093F\u0928\u0947\u091F \u0935\u093F\u0936\u094D\u0930\u093E\u092E \u0932\u093F\u0928\u0947 \u0928\u093F\u092F\u092E \u0905\u092A\u0928\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D\u0964\n\u0968. **\u092E\u094B\u092C\u093E\u0907\u0932 \u0930 \u0927\u094D\u092F\u093E\u0928 \u092D\u0921\u094D\u0915\u093E\u0909\u0928\u0947 \u0938\u093E\u0927\u0928 \u091F\u093E\u0922\u093E \u0930\u093E\u0916\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964**\n\u0969. **\u0906\u092B\u094D\u0928\u094B \u0939\u093E\u0924\u0932\u0947 \u092E\u0941\u0916\u094D\u092F \u092C\u0941\u0901\u0926\u093E\u0939\u0930\u0942 \u0928\u094B\u091F \u092C\u0928\u093E\u0909\u0928\u0947 \u092C\u093E\u0928\u0940 \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964**\n\u096A. **\u0926\u0948\u0928\u093F\u0915 \u0928\u093F\u0936\u094D\u091A\u093F\u0924 \u0938\u092E\u092F \u0924\u093E\u0932\u093F\u0915\u093E \u092C\u0928\u093E\u090F\u0930 \u092A\u0922\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964**\n\u096B. **\u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u092A\u093E\u0928\u0940 \u092A\u093F\u0909\u0928\u0941\u0939\u094B\u0938\u094D \u0930 \u0926\u093F\u0928\u092E\u093E \u0915\u092E\u094D\u0924\u0940\u092E\u093E \u096D \u0918\u0923\u094D\u091F\u093E \u0938\u0941\u0924\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964**" : "Tips for effective study concentration:\n1. Use the Pomodoro Technique: Study for 25 minutes, then rest for 5 minutes.\n2. Keep mobile phones and distractions away.\n3. Take handwritten summary notes.\n4. Maintain a regular daily study schedule.\n5. Stay hydrated and get 7-8 hours of sound sleep.";
  }
  if (q.includes("\u0924\u0928\u093E\u0935") || q.includes("stress") || q.includes("\u091A\u093F\u0928\u094D\u0924\u093E \u0939\u091F\u093E\u0909\u0928\u0947")) {
    return isNe ? "\u0924\u0928\u093E\u0935 \u0930 \u091A\u093F\u0928\u094D\u0924\u093E \u0915\u092E \u0917\u0930\u094D\u0928\u0947 \u0915\u0947\u0939\u0940 \u0938\u0930\u0932 \u0930 \u0935\u0948\u091C\u094D\u091E\u093E\u0928\u093F\u0915 \u0909\u092A\u093E\u092F\u0939\u0930\u0942:\n\u0967. **\u0917\u0939\u093F\u0930\u094B \u0938\u093E\u0938 \u092B\u0947\u0930\u094D\u0928\u0947 \u0905\u092D\u094D\u092F\u093E\u0938 (\u092A\u094D\u0930\u093E\u0923\u093E\u092F\u093E\u092E / Deep Breathing):** \u096A \u0938\u0947\u0915\u0947\u0928\u094D\u0921 \u0938\u093E\u0938 \u0932\u093F\u0928\u0947, \u096A \u0938\u0947\u0915\u0947\u0928\u094D\u0921 \u0930\u094B\u0915\u094D\u0928\u0947 \u0930 \u096C \u0938\u0947\u0915\u0947\u0928\u094D\u0921\u092E\u093E \u091B\u094B\u0921\u094D\u0928\u0947\u0964\n\u0968. **\u0926\u0948\u0928\u093F\u0915 \u0915\u092E\u094D\u0924\u0940\u092E\u093E \u0968\u0966-\u0969\u0966 \u092E\u093F\u0928\u0947\u091F \u0939\u093F\u0901\u0921\u094D\u0928\u0947 \u0935\u093E \u0935\u094D\u092F\u093E\u092F\u093E\u092E \u0917\u0930\u094D\u0928\u0947\u0964**\n\u0969. **\u0906\u092B\u094D\u0928\u093E \u092D\u093E\u0935\u0928\u093E\u0939\u0930\u0942 \u0938\u093E\u0925\u0940\u092D\u093E\u0907 \u0935\u093E \u092A\u0930\u093F\u0935\u093E\u0930\u0938\u0901\u0917 \u0938\u093E\u091D\u093E \u0917\u0930\u094D\u0928\u0947\u0964**\n\u096A. **\u0905\u0928\u093E\u0935\u0936\u094D\u092F\u0915 \u0938\u094B\u091A\u092D\u0928\u094D\u0926\u093E \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092A\u0932 (Present Moment) \u092E\u093E \u0927\u094D\u092F\u093E\u0928 \u0926\u093F\u0928\u0947\u0964**" : "Ways to reduce stress:\n1. Practice deep diaphragmatic breathing or meditation.\n2. Go for daily 20-30 minute walks or light exercise.\n3. Share feelings with trusted friends or family.\n4. Focus on present actionable steps rather than overthinking the future.";
  }
  const isAstrologyQuery = [
    "\u0915\u0941\u0923\u094D\u0921\u0932\u0940",
    "\u091A\u093F\u0928\u093E",
    "\u0930\u093E\u0936\u0940",
    "\u0932\u0917\u094D\u0928",
    "\u0917\u094D\u0930\u0939",
    "\u0926\u0936\u093E",
    "\u092E\u0939\u093E\u0926\u0936\u093E",
    "\u0917\u094B\u091A\u0930",
    "\u092D\u0935\u093F\u0937\u094D\u092F\u092B\u0932",
    "\u0915\u0930\u093F\u092F\u0930",
    "\u091C\u093E\u0917\u093F\u0930",
    "\u0935\u094D\u092F\u093E\u092A\u093E\u0930",
    "\u0935\u093F\u0935\u093E\u0939",
    "\u092C\u093F\u0939\u0947",
    "\u091C\u0940\u0935\u0928\u0938\u093E\u0925\u0940",
    "\u092A\u094D\u0930\u0947\u092E",
    "\u0927\u0928",
    "\u092A\u0948\u0938\u093E",
    "\u0906\u0930\u094D\u0925\u093F\u0915",
    "\u0936\u093E\u0928\u094D\u0924\u093F",
    "\u092A\u0942\u091C\u093E",
    "\u0930\u0924\u094D\u0928",
    "\u092E\u093E\u0902\u0917\u0932\u093F\u0915",
    "\u0915\u093E\u0932\u0938\u0930\u094D\u092A",
    "kundali",
    "horoscope",
    "astrology",
    "rashi",
    "lagna",
    "dasha",
    "planet",
    "career",
    "marriage",
    "wealth"
  ].some((term) => q.includes(term));
  if (isAstrologyQuery && context) {
    const lagna = isNe ? context.lagnaNe || "\u092E\u0947\u0937" : context.lagnaEn || "Aries";
    const moon = isNe ? context.moonSignNe || "\u0935\u0943\u0937" : context.moonSignEn || "Taurus";
    const dasha = context.currentDasha || "\u092C\u0943\u0939\u0938\u094D\u092A\u0924\u093F / \u0936\u0928\u093F";
    if (q.includes("career") || q.includes("job") || q.includes("business") || q.includes("\u0915\u0930\u093F\u092F\u0930") || q.includes("\u091C\u093E\u0917\u093F\u0930") || q.includes("\u0935\u094D\u092F\u093E\u092A\u093E\u0930")) {
      return isNe ? `\u0924\u092A\u093E\u0908\u0902\u0915\u094B \u0932\u0917\u094D\u0928 '${lagna}' \u0930 \u091A\u0928\u094D\u0926\u094D\u0930\u092E\u093E '${moon}' \u0930\u093E\u0936\u0940 \u0905\u0928\u0941\u0938\u093E\u0930 \u0926\u0936\u092E \u092D\u093E\u0935 (\u0915\u0930\u094D\u092E \u092D\u093E\u0935) \u0915\u094B \u092A\u094D\u0930\u092D\u093E\u0935\u0932\u0947 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928, \u0928\u0947\u0924\u0943\u0924\u094D\u0935, \u092A\u0930\u093E\u092E\u0930\u094D\u0936 \u0938\u0947\u0935\u093E \u0935\u093E \u0938\u094D\u0935\u0924\u0928\u094D\u0924\u094D\u0930 \u0909\u0926\u094D\u092F\u092E\u092E\u093E \u0930\u093E\u092E\u094D\u0930\u094B \u0938\u092B\u0932\u0924\u093E\u0915\u094B \u0938\u0902\u0915\u0947\u0924 \u0917\u0930\u094D\u0926\u091B\u0964 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0938\u092E\u092F\u092E\u093E \u092F\u094B\u091C\u0928\u093E\u092C\u0926\u094D\u0927 \u0915\u093E\u0930\u094D\u092F \u0930 \u0928\u093F\u0930\u0928\u094D\u0924\u0930\u0915\u094B \u092A\u0930\u093F\u0936\u094D\u0930\u092E\u0932\u0947 \u0909\u091A\u094D\u091A \u092A\u0947\u0936\u093E\u0917\u0924 \u092A\u094D\u0930\u0917\u0924\u093F \u0917\u0930\u093E\u0909\u0928\u0947\u091B\u0964` : `According to your '${lagna}' ascendant and '${moon}' Moon sign, your 10th house indicates strong aptitude for leadership, management, professional consultancy, or independent business. Focused efforts will yield steady career growth.`;
    }
    if (q.includes("marriage") || q.includes("love") || q.includes("spouse") || q.includes("\u0935\u093F\u0935\u093E\u0939") || q.includes("\u092C\u093F\u0939\u0947") || q.includes("\u091C\u0940\u0935\u0928\u0938\u093E\u0925\u0940")) {
      return isNe ? `\u0938\u092A\u094D\u0924\u092E \u092D\u093E\u0935 (\u0926\u093E\u092E\u094D\u092A\u0924\u094D\u092F \u092D\u093E\u0935) \u0930 \u0936\u0941\u0915\u094D\u0930 \u0917\u094D\u0930\u0939\u0915\u094B \u0938\u094D\u0925\u093F\u0924\u093F \u0905\u0928\u0941\u0938\u093E\u0930 \u0924\u092A\u093E\u0908\u0902\u0915\u094B \u0935\u0948\u0935\u093E\u0939\u093F\u0915 \u091C\u0940\u0935\u0928\u092E\u093E \u0906\u092A\u0938\u0940 \u0938\u092E\u091D\u0926\u093E\u0930\u0940, \u0927\u0948\u0930\u094D\u092F \u0930 \u0916\u0941\u0932\u093E \u0938\u0902\u0935\u093E\u0926\u0932\u0947 \u0938\u092E\u094D\u092C\u0928\u094D\u0927 \u0928\u093F\u0915\u0948 \u0938\u0941\u092E\u0927\u0941\u0930 \u0930 \u0938\u0941\u0916\u092E\u092F \u0930\u0939\u0928\u0947\u091B\u0964 '${lagna}' \u0932\u0917\u094D\u0928\u0915\u094B \u092A\u094D\u0930\u0915\u0943\u0924\u093F \u0905\u0928\u0941\u0938\u093E\u0930 \u0939\u0924\u093E\u0930\u092E\u093E \u0928\u093F\u0930\u094D\u0923\u092F \u0932\u093F\u0928\u0941\u092D\u0928\u094D\u0926\u093E \u0936\u093E\u0928\u094D\u0924 \u0930 \u092A\u0930\u093F\u092A\u0915\u094D\u0935 \u0938\u094B\u091A \u0930\u093E\u0916\u094D\u0928\u0941 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0939\u0941\u0928\u094D\u091B\u0964` : `Examining your 7th house and Venus placement, marital harmony thrives on mutual understanding, patience, and clear communication. Your '${lagna}' ascendant temperament supports solid emotional bonding.`;
    }
    if (q.includes("wealth") || q.includes("money") || q.includes("finance") || q.includes("\u0927\u0928") || q.includes("\u092A\u0948\u0938\u093E") || q.includes("\u0906\u0930\u094D\u0925\u093F\u0915")) {
      return isNe ? `\u0926\u094D\u0935\u093F\u0924\u0940\u092F (\u0927\u0928 \u092D\u093E\u0935) \u0930 \u090F\u0915\u093E\u0926\u0936 (\u0932\u093E\u092D \u092D\u093E\u0935) \u0915\u094B \u0936\u0941\u092D \u092A\u094D\u0930\u092D\u093E\u0935 \u0905\u0928\u0941\u0938\u093E\u0930 \u0924\u092A\u093E\u0908\u0902\u0915\u094B \u0906\u0930\u094D\u0925\u093F\u0915 \u092A\u0915\u094D\u0937 \u092E\u091C\u092C\u0941\u0924 \u0930 \u092A\u094D\u0930\u0917\u0924\u093F\u0924\u0930\u094D\u092B \u0909\u0928\u094D\u092E\u0941\u0916 \u091B\u0964 \u0938\u0941\u0928\u093F\u092F\u094B\u091C\u093F\u0924 \u092C\u091A\u0924, \u0938\u0902\u092F\u092E\u093F\u0924 \u0916\u0930\u094D\u091A \u0930 \u0935\u093F\u0935\u0947\u0915\u092A\u0942\u0930\u094D\u0923 \u0932\u0917\u093E\u0928\u0940\u0932\u0947 \u0926\u0940\u0930\u094D\u0918\u0915\u093E\u0932\u0940\u0928 \u0927\u0928\u0938\u092E\u094D\u092A\u0924\u094D\u0924\u093F \u0906\u0930\u094D\u091C\u0928\u092E\u093E \u0930\u093E\u092E\u094D\u0930\u094B \u0932\u093E\u092D \u0926\u093F\u0932\u093E\u0909\u0928\u0947\u091B\u0964` : `Your 2nd and 11th houses suggest strong potential for financial growth and stability through prudent investments and disciplined savings.`;
    }
    if (q.includes("\u0926\u0936\u093E") || q.includes("dasha")) {
      return isNe ? `\u0924\u092A\u093E\u0908\u0902\u0915\u094B \u0915\u0941\u0923\u094D\u0921\u0932\u0940 \u0905\u0928\u0941\u0938\u093E\u0930 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0938\u092E\u092F\u092E\u093E \u092E\u0939\u093E\u0926\u0936\u093E\u0915\u094B \u092A\u094D\u0930\u092D\u093E\u0935 \u091A\u0932\u093F\u0930\u0939\u0947\u0915\u094B \u091B\u0964 \u092F\u0938 \u0905\u0935\u0927\u093F\u092E\u093E \u0915\u0930\u094D\u092E\u092A\u094D\u0930\u0924\u093F \u0928\u093F\u0937\u094D\u0920\u093E\u0935\u093E\u0928 \u0930\u0939\u0901\u0926\u093E, \u0915\u0941\u0932\u0926\u0947\u0935\u0924\u093E\u0915\u094B \u0938\u094D\u092E\u0930\u0923 \u0930 \u0928\u093F\u092F\u092E\u093F\u0924 \u0927\u094D\u092F\u093E\u0928-\u0938\u093E\u0927\u0928\u093E\u0932\u0947 \u0936\u0941\u092D \u092B\u0932 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0939\u0941\u0928\u0947\u091B\u0964` : `According to your chart, current planetary dasha transits encourage steadfast dedication, mindful focus, and spiritual balance for fruitful outcomes.`;
    }
  }
  if (q.includes("\u0915\u0947 \u0939\u094B") || q.includes("what is") || q.includes("\u092D\u0928\u0947\u0915\u094B \u0915\u0947 \u0939\u094B")) {
    return isNe ? `\u0924\u092A\u093E\u0908\u0902\u0932\u0947 \u0938\u094B\u0927\u094D\u0928\u0941\u092D\u090F\u0915\u094B "${rawQ}" \u0935\u093F\u0937\u092F\u092E\u093E:
\u092F\u094B \u090F\u0915 \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0935\u093F\u0937\u092F \u0939\u094B\u0964 \u092F\u0938\u0915\u093E \u092C\u093E\u0930\u0947\u092E\u093E \u0938\u094D\u092A\u0937\u094D\u091F \u092C\u0941\u091D\u094D\u0926\u093E \u092F\u0938\u0915\u094B \u092E\u0941\u0916\u094D\u092F \u092A\u0930\u093F\u092D\u093E\u0937\u093E, \u092F\u0938\u0915\u094B \u0909\u092A\u092F\u094B\u0917\u093F\u0924\u093E \u0930 \u092F\u0938\u0915\u094B \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u092A\u0915\u094D\u0937\u0932\u093E\u0908 \u0927\u094D\u092F\u093E\u0928\u092E\u093E \u0930\u093E\u0916\u094D\u0928\u0941\u092A\u0930\u094D\u091B\u0964 \u092F\u0926\u093F \u0924\u092A\u093E\u0908\u0902\u0932\u093E\u0908 \u092F\u0938\u0915\u094B \u0915\u0941\u0928\u0948 \u0916\u093E\u0938 \u092A\u0915\u094D\u0937 \u0935\u093E \u0909\u0926\u093E\u0939\u0930\u0923\u092C\u093E\u0930\u0947 \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u091A\u093E\u0939\u093F\u0928\u094D\u091B \u092D\u0928\u0947 \u0915\u0943\u092A\u092F\u093E \u0925\u092A \u0938\u094D\u092A\u0937\u094D\u091F \u0917\u0930\u093F\u0926\u093F\u0928\u0941\u0939\u094B\u0932\u093E!` : `Regarding your question "${rawQ}":
This is an insightful topic. To understand it clearly, consider its core definition, practical applications, and significance. If you have a specific angle or example you'd like to explore, feel free to ask!`;
  }
  if (q.includes("\u0915\u0938\u0930\u0940") || q.includes("how to") || q.includes("how can")) {
    return isNe ? `\u0924\u092A\u093E\u0908\u0902\u0932\u0947 \u0938\u094B\u0927\u094D\u0928\u0941\u092D\u090F\u0915\u094B "${rawQ}" \u0915\u094B \u0938\u0928\u094D\u0926\u0930\u094D\u092D\u092E\u093E:
\u092F\u0938 \u0915\u093E\u0930\u094D\u092F\u0932\u093E\u0908 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u092E\u094D\u092A\u0928\u094D\u0928 \u0917\u0930\u094D\u0928 \u091A\u0930\u0923\u092C\u0926\u094D\u0927 (Step-by-step) \u092F\u094B\u091C\u0928\u093E \u092C\u0928\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D, \u092E\u0941\u0916\u094D\u092F \u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F \u0938\u094D\u092A\u0937\u094D\u091F \u0930\u093E\u0916\u094D\u0928\u0941\u0939\u094B\u0938\u094D, \u0930 \u0928\u093F\u092F\u092E\u093F\u0924 \u0905\u092D\u094D\u092F\u093E\u0938 \u0935\u093E \u0915\u093E\u0930\u094D\u092F\u093E\u0928\u094D\u0935\u092F\u0928 \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964 \u0939\u091C\u0941\u0930\u0932\u093E\u0908 \u092F\u0938\u0915\u093E \u0915\u0941\u0928 \u091A\u0930\u0923\u092E\u093E \u0938\u0939\u092F\u094B\u0917 \u091A\u093E\u0939\u093F\u090F\u0915\u094B \u091B, \u0925\u092A \u092C\u0924\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D!` : `Regarding "${rawQ}":
To accomplish this effectively, break the process into structured steps, identify clear milestones, and take consistent action. Let me know which step you would like more detail on!`;
  }
  if (q.includes("\u0915\u093F\u0928") || q.includes("why")) {
    return isNe ? `\u0924\u092A\u093E\u0908\u0902\u0915\u094B \u092A\u094D\u0930\u0936\u094D\u0928 "${rawQ}" \u0915\u094B \u092E\u0941\u0916\u094D\u092F \u0915\u093E\u0930\u0923 \u092C\u0941\u091D\u094D\u0926\u093E \u092F\u0938\u0915\u093E \u092A\u091B\u093E\u0921\u093F \u0935\u0948\u091C\u094D\u091E\u093E\u0928\u093F\u0915, \u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u0935\u093E \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u092A\u0915\u094D\u0937\u0939\u0930\u0942 \u091C\u094B\u0921\u093F\u090F\u0915\u093E \u0939\u0941\u0928\u094D\u091B\u0928\u094D\u0964 \u092F\u0938\u0915\u094B \u0938\u0939\u0940 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923\u0915\u093E \u0932\u093E\u0917\u093F \u0935\u093F\u0937\u092F\u0915\u094B \u092A\u0943\u0937\u094D\u0920\u092D\u0942\u092E\u093F \u092C\u0941\u091D\u094D\u0928\u0941 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0941\u0928\u094D\u091B\u0964 \u0939\u091C\u0941\u0930 \u092F\u0938 \u0935\u093F\u0937\u092F\u092E\u093E \u0915\u0941\u0928 \u0916\u093E\u0938 \u0926\u0943\u0937\u094D\u091F\u093F\u0915\u094B\u0923\u092C\u093E\u091F \u091C\u093E\u0928\u094D\u0928 \u091A\u093E\u0939\u0928\u0941\u0939\u0941\u0928\u094D\u091B?` : `Regarding your inquiry "${rawQ}":
Understanding the reasoning behind this involves examining the underlying practical and contextual factors. Let me know if you would like an analytical or historical perspective!`;
  }
  return isNe ? `\u0924\u092A\u093E\u0908\u0902\u0915\u094B \u092A\u094D\u0930\u0936\u094D\u0928: "${rawQ}"

\u092E \u0924\u092A\u093E\u0908\u0902\u0915\u094B \u092A\u094D\u0930\u0936\u094D\u0928 \u0930\u093E\u092E\u094D\u0930\u094B\u0938\u0901\u0917 \u092C\u0941\u091D\u094D\u0928 \u0938\u0915\u094D\u091B\u0941\u0964 \u092E\u0932\u093E\u0908 \u091C\u0947 \u092A\u094D\u0930\u0936\u094D\u0928 \u0938\u094B\u0927\u094D\u0928\u0941\u092D\u092F\u094B, \u0924\u094D\u092F\u0938\u0948\u0915\u094B \u0906\u0927\u093E\u0930\u092E\u093E \u0938\u0939\u0940 \u0930 \u0938\u094D\u092A\u0937\u094D\u091F \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0926\u093F\u0928 \u0924\u092F\u093E\u0930 \u091B\u0941\u0964 \u0915\u0943\u092A\u092F\u093E \u092F\u0938 \u091C\u093F\u091C\u094D\u091E\u093E\u0938\u093E\u0932\u093E\u0908 \u0905\u091D \u0916\u0941\u0932\u093E\u090F\u0930 \u0938\u094B\u0927\u094D\u0928\u0941\u0939\u094B\u0938\u094D \u0935\u093E \u0939\u091C\u0941\u0930\u0932\u093E\u0908 \u091C\u093E\u0928\u094D\u0928 \u092E\u0928 \u0932\u093E\u0917\u0947\u0915\u094B \u0916\u093E\u0938 \u0915\u0941\u0930\u093E \u0915\u0947 \u0939\u094B, \u092C\u0924\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D!` : `Regarding: "${rawQ}"

I understand your question and am ready to assist with clear, accurate answers. Please let me know what specific details you would like to explore!`;
}

// server.ts
dotenv.config();
function generateSmartFallback(message, context, language) {
  return generateIntelligentAnswer(message, context, language);
}
async function startServer() {
  const app = express();
  app.use(express.json());
  const ADMIN_HASH = process.env.ADMIN_HASH || "05244419492771ec1e0e7a5efc3882e6ed84880d47ac8bcd1172dabefc899c44";
  app.post("/api/admin/verify", (req, res) => {
    const { code } = req.body || {};
    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false });
    }
    const hash = crypto.createHash("sha256").update(code.trim()).digest("hex");
    if (hash === ADMIN_HASH) {
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, error: "Unauthorized" });
  });
  const GURUS_FILE = path.resolve(process.cwd(), "gurus_store.json");
  const GURU_APPS_FILE = path.resolve(process.cwd(), "guru_applications_store.json");
  const getStoredGurus = () => {
    try {
      if (fs.existsSync(GURUS_FILE)) {
        return JSON.parse(fs.readFileSync(GURUS_FILE, "utf-8"));
      }
    } catch (e) {
    }
    return null;
  };
  const saveStoredGurus = (gurus) => {
    try {
      fs.writeFileSync(GURUS_FILE, JSON.stringify(gurus, null, 2));
    } catch (e) {
    }
  };
  const getStoredApps = () => {
    try {
      if (fs.existsSync(GURU_APPS_FILE)) {
        return JSON.parse(fs.readFileSync(GURU_APPS_FILE, "utf-8"));
      }
    } catch (e) {
    }
    return [];
  };
  const saveStoredApps = (apps) => {
    try {
      fs.writeFileSync(GURU_APPS_FILE, JSON.stringify(apps, null, 2));
    } catch (e) {
    }
  };
  app.get("/api/guru_applications", (req, res) => {
    const apps = getStoredApps();
    res.json(apps);
  });
  app.post("/api/guru_applications", (req, res) => {
    const newApp = req.body;
    if (!newApp || !newApp.id) {
      return res.status(400).json({ success: false, error: "Invalid application" });
    }
    const apps = getStoredApps();
    const index = apps.findIndex((a) => a.id === newApp.id);
    if (index >= 0) {
      apps[index] = { ...apps[index], ...newApp };
    } else {
      apps.unshift(newApp);
    }
    saveStoredApps(apps);
    res.json({ success: true, application: newApp });
  });
  app.delete("/api/guru_applications/:id", (req, res) => {
    const { id } = req.params;
    const apps = getStoredApps().filter((a) => a.id !== id);
    saveStoredApps(apps);
    res.json({ success: true });
  });
  app.get("/api/gurus", (req, res) => {
    const gurus = getStoredGurus();
    res.json(gurus || []);
  });
  app.post("/api/gurus", (req, res) => {
    const gurus = req.body;
    if (Array.isArray(gurus)) {
      saveStoredGurus(gurus);
      res.json({ success: true, count: gurus.length });
    } else {
      res.status(400).json({ success: false, error: "Invalid payload" });
    }
  });
  app.post("/api/chat", async (req, res) => {
    const { message, conversationHistory = [], kundaliContext, language = "ne" } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message string is required" });
    }
    const trimmed = (message || "").trim().toLowerCase();
    const isPureGreeting = ["hello", "hi", "hey", "\u0928\u092E\u0938\u094D\u0924\u0947", "\u0928\u092E\u0938\u094D\u0915\u093E\u0930", "\u0939\u0947\u0932\u094B", "\u0939\u094D\u092F\u093E\u0932\u094B", "good morning", "kasto cha", "\u0915\u0938\u094D\u0924\u094B \u091B"].some(
      (g) => trimmed === g || trimmed === g + "!" || trimmed === g + " sir"
    );
    if (isPureGreeting || /^[0-9०-९\s\+\-\*\/÷xX×=]+$/.test(trimmed)) {
      const immediateAns = generateSmartFallback(message, kundaliContext, language);
      return res.json({ reply: immediateAns });
    }
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.API_KEY || "";
      if (!apiKey) {
        const fallbackReply = generateSmartFallback(message, kundaliContext, language);
        return res.json({ reply: fallbackReply });
      }
      const ai = new GoogleGenAI({ apiKey });
      const contents = [];
      const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-6) : [];
      for (const h of recentHistory) {
        if (h && h.text) {
          contents.push({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
      const contextSummary = kundaliContext ? `
User's Kundali Context (Reference ONLY when user asks about their horoscope/astrology/chart/future):
- Name: ${kundaliContext.name || "User"}
- Ascendant (Lagna): ${kundaliContext.lagnaNe || ""} (${kundaliContext.lagnaEn || ""})
- Moon Sign (Rashi): ${kundaliContext.moonSignNe || ""} (${kundaliContext.moonSignEn || ""})
- Sun Sign: ${kundaliContext.sunSignNe || ""} (${kundaliContext.sunSignEn || ""})
- Current Dasha: ${kundaliContext.currentDasha || ""}
- Date of Birth: ${kundaliContext.dob || ""}
- Time of Birth: ${kundaliContext.tob || ""}
- Place of Birth: ${kundaliContext.pob || ""}
` : "No Kundali context available.";
      const systemInstruction = `
You are an intelligent, empathetic, and knowledgeable AI Assistant within the Vedic Jyotish (\u0935\u0948\u0926\u093F\u0915 \u091C\u094D\u092F\u094B\u0924\u093F\u0937) application, inspired by the guidance of Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay).

CRITICAL INSTRUCTIONS ON UNDERSTANDING AND ANSWERING QUESTIONS (\u091C\u0938\u094D\u0924\u094B \u092A\u094D\u0930\u0936\u094D\u0928, \u0924\u094D\u092F\u0938\u094D\u0924\u0948 \u0909\u0924\u094D\u0924\u0930):
1. UNDERSTAND THE USER'S INTENT FIRST:
   - Carefully analyze what the user is asking before responding.
   - DO NOT force an astrological reading or horoscope analysis onto non-astrological questions or greetings!

2. CASUAL GREETINGS & PLEASANTRIES:
   - If the user says "hello", "hi", "\u0928\u092E\u0938\u094D\u0924\u0947", "\u0928\u092E\u0938\u094D\u0915\u093E\u0930", "good morning", "how are you", etc.:
     Reply naturally, warmly, and politely in the user's language without mentioning horoscope or planetary positions!
     Example in Nepali: "\u0928\u092E\u0938\u094D\u0915\u093E\u0930! \u092E \u0924\u092A\u093E\u0908\u0902\u0932\u093E\u0908 \u0906\u091C \u0915\u0938\u0930\u0940 \u0938\u0939\u092F\u094B\u0917 \u0917\u0930\u094D\u0928 \u0938\u0915\u094D\u091B\u0941? \u0939\u091C\u0941\u0930\u0915\u094B \u0915\u0941\u0928\u0948 \u092A\u0928\u093F \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u091C\u093F\u091C\u094D\u091E\u093E\u0938\u093E \u0935\u093E \u092A\u094D\u0930\u0936\u094D\u0928 \u091B \u092D\u0928\u0947 \u0928\u093F\u0930\u094D\u0927\u0915\u094D\u0915 \u0938\u094B\u0927\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964"
     Example in English: "Hello! How can I help you today? Feel free to ask any question."

3. GENERAL KNOWLEDGE & NON-ASTROLOGY QUESTIONS:
   - Just like ChatGPT and Gemini, you are capable of answering ALL types of questions accurately, directly, and helpfully.
   - This includes science, math, history, Nepal geography, technology, programming, daily life, language, cooking, trivia, etc.
   - Answer these questions directly, factually, and clearly. Do NOT link them to astrology unless the user specifically asks for an astrological perspective.

4. ASTROLOGY, KUNDALI & HOROSCOPE QUESTIONS:
   - When the user asks about their career, marriage, health, finances, dasha, future, planetary remedies, or horoscope:
     Refer to their calculated Kundali context provided below to give personalized, insightful, and culturally respectful Vedic guidance.

5. LANGUAGE & TONE:
   - If the user writes in Nepali (Devanagari or Romanized Nepali like "namaste", "kasto cha"), reply in natural, respectful Nepali (\u0939\u091C\u0941\u0930/\u0924\u092A\u093E\u0908\u0902).
   - If the user writes in English, reply in clear, professional, warm English.
   - Keep answers clear, well-formatted, and concise (not unnecessarily long).

${contextSummary}
`;
      const generatePromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("AI response timeout")), 3500)
      );
      const response = await Promise.race([generatePromise, timeoutPromise]);
      const reply = response.text || generateSmartFallback(message, kundaliContext, language);
      return res.json({ reply });
    } catch (err) {
      console.error("Gemini chat error in /api/chat:", err);
      const fallbackReply = generateSmartFallback(message, kundaliContext, language);
      return res.json({ reply: fallbackReply });
    }
  });
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  const PORT = process.env.PORT || 3e3;
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
