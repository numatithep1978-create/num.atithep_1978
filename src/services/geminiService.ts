/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-image'; 

/**
 * Analyzes the provided antenna image using the Gemini API.
 * @param imageBase64 The base64 encoded image data.
 * @param mimeType The MIME type of the image.
 * @returns The analysis result from the Gemini API.
 */
export async function analyzeAntennaImage(imageBase64: string, mimeType: string): Promise<string> {
  try {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const prompt = "วิเคราะห์ภาพถ่ายสายอากาศนี้ และระบุสถานะว่าเป็น 'ปกติ', 'เกิด Flashover', หรือ 'แตกหัก' โปรดตอบกลับด้วยสถานะและคำอธิบายสั้นๆ";

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, { text: prompt }] },
    });

    if (response.text) {
        return response.text;
    } else {
        throw new Error('No text response from Gemini API.');
    }

  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw new Error('Failed to analyze image. Please check the console for more details.');
  }
}
