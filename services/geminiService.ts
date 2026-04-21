
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Language, UserEligibilityData } from "../types";

// Always use named parameter for apiKey and assume process.env.API_KEY is available
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const getLanguageName = (lang: Language) => {
  if (lang === 'ta') return 'Tamil';
  return 'English';
};

export const getSchemeSpecificRequirements = async (schemeName: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `For the Tamil Nadu welfare scheme: "${schemeName}", identify exactly 3-4 specific details or questions that are CRITICAL to determine eligibility but are NOT standard (Standard fields are: age, income, gender, education, location).
    Focus on details that help identify if someone is truly in poverty or has specific needs.
    
    Examples:
    - For Housing: "Do you currently own any pucca house anywhere?"
    - For Pudhumai Penn: "Did the student study in a Government school from 6th to 12th?"
    - For Farmers: "What is the total land holding in acres?"
    
    Return a JSON array of fields. Each field should have:
    - id: string (camelCase)
    - label: string (clear question in ${langName})
    - type: 'text' | 'number' | 'boolean'
    - description: string (why this is needed)
    
    Respond only in ${langName}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            label: { type: Type.STRING },
            type: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["id", "label", "type", "description"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const searchSchemes = async (query: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find relevant and current Tamil Nadu state government welfare schemes for: ${query}. Focus on vulnerable families. 
    You MUST respond with a JSON array of schemes. Each object should have:
    - name: The full official name of the scheme.
    - shortSummary: A 1-sentence catchy summary.
    - description: Full detailed explanation.
    - eligibility: A list of key criteria.
    - benefits: Specific financial or physical benefits provided.
    - sector: One of (Women, Education, Agriculture, Housing, Health, Social Security, Labor, Fisheries, Disabled).
    
    Respond in ${langName}.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            shortSummary: { type: Type.STRING },
            description: { type: Type.STRING },
            eligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
            benefits: { type: Type.STRING },
            sector: { type: Type.STRING }
          },
          required: ["name", "shortSummary", "description", "eligibility", "benefits", "sector"]
        }
      }
    },
  });

  try {
    const parsed = JSON.parse(response.text || '[]');
    return {
      schemes: parsed,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    console.error("Failed to parse JSON response", e);
    return { schemes: [], sources: [] };
  }
};

export const analyzeGrievance = async (description: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this public grievance for a Tamil Nadu citizen: "${description}". 
    Perform the following:
    1. Categorize into a department: (Revenue, Housing, Health, Education, Social Welfare, or Food & Consumer Protection).
    2. Provide a 1-sentence formal summary.
    3. Suggest the "Requested Action".
    
    Respond in ${langName} as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          department: { type: Type.STRING },
          formalSummary: { type: Type.STRING },
          requestedAction: { type: Type.STRING },
          urgency: { type: Type.STRING, description: "Low, Medium, or High" }
        },
        required: ["department", "formalSummary", "requestedAction", "urgency"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const reverseGeocodeToTN = async (lat: number, lng: number, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the precise coordinates (lat: ${lat}, lng: ${lng}) into a highly accurate Tamil Nadu administrative address.
    Search for the exact location to identify:
    1. The specific Village/Area/Panchayat name.
    2. The relevant Taluk (Sub-district).
    3. The District name.
    4. The 6-digit Pincode.
    
    You MUST return JSON format with these exact fields:
    - doorNo: Suggest a likely street name or area if door number isn't found.
    - district: Valid Tamil Nadu district.
    - taluk: Valid Tamil Nadu taluk.
    - village: Village or local area name.
    - pincode: 6-digit postal code.
    
    Ensure names match official Tamil Nadu government records.
    Respond in ${langName}.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          doorNo: { type: Type.STRING },
          district: { type: Type.STRING },
          taluk: { type: Type.STRING },
          village: { type: Type.STRING },
          pincode: { type: Type.STRING }
        },
        required: ["district", "taluk", "village", "pincode"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse address JSON", e);
    return {};
  }
};

export const verifyDocumentQuality = async (base64Data: string, docType: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  // Extract mime type from base64 if possible
  const mimeTypeMatch = base64Data.match(/^data:(.*);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
  const cleanBase64 = base64Data.replace(/^data:.*;base64,/, '');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: `Check this image of a "${docType}". 
          1. Is it clear and legible? 
          2. Does it appear to be the correct document type ("${docType}")? 
          3. Is it from Tamil Nadu (if applicable)?
          Provide a helpful response in ${langName}.
          Return as JSON: { "isValid": boolean, "feedback": string }`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING }
        },
        required: ["isValid", "feedback"]
      }
    }
  });

  return JSON.parse(response.text || '{"isValid": false, "feedback": "Error analyzing"}');
};

export const verifyDetailedEligibility = async (userData: UserEligibilityData, schemeName: string, lang: Language = 'en', extraData: Record<string, any> = {}) => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const familySizeStr = userData.familySize >= 6 ? 'More than 5' : userData.familySize.toString();
  const calculatedAnnualIncome = userData.incomePeriod === 'monthly' ? userData.income * 12 : userData.income;

  const prompt = `
    Analyze this citizen's profile specifically for the Tamil Nadu state government welfare scheme: "${schemeName}".
    
    User Profile Details (from Tamil Nadu):
    - Name: ${userData.name}
    - Phone: +91 ${userData.phone}
    - Calculated Annual Income: ₹${calculatedAnnualIncome}
    - Poverty Status (BPL/APL): ${userData.povertyStatus || 'Unknown'}
    - No. of Family Members: ${familySizeStr}
    - Occupation: ${userData.occupation}
    - Education Level: ${userData.education}
    - Employment Status: ${userData.employmentStatus}
    - Category: ${userData.category}
    
    Scheme Specific Additional Details Provided:
    ${Object.entries(extraData).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
    
    Strictly evaluate if this Tamil Nadu resident meets ALL criteria for "${schemeName}". 
    Special Mandate: Prioritize poor and BPL (Below Poverty Line) citizens.
    
    You MUST generate a highly detailed 6-step enrollment roadmap that covers the entire journey from "Master Profile Submission" to "Final Benefit Receipt / Enrollment Completion". 
    Each step MUST include:
    - label: Short title of the step.
    - description: Clear explanation of what exactly happens and what the citizen needs to do (if anything).
    - authority: The specific government official or department responsible for this step (e.g., "VAO (Village Administrative Officer)", "Revenue Inspector", "District Collector", "Lead Bank Manager", "Scheme Nodal Officer").
    
    Also, find the most appropriate official URL for applying to this scheme (e.g., https://tnesevai.tn.gov.in, https://pudhumaischeme.tn.gov.in, or similar official domain).
    
    Respond in ${langName} in JSON format.
    The response should be an object:
    - isEligible: boolean
    - evaluationReason: string
    - potentialBenefits: string
    - documentsVerified: string[]
    - portalUrl: string (official government portal link)
    - roadmap: array of { label: string, description: string } (exactly 6 items representing the FULL process path)
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isEligible: { type: Type.BOOLEAN },
          evaluationReason: { type: Type.STRING },
          potentialBenefits: { type: Type.STRING },
          documentsVerified: { type: Type.ARRAY, items: { type: Type.STRING } },
          portalUrl: { type: Type.STRING },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                authority: { type: Type.STRING }
              },
              required: ["label", "description", "authority"]
            }
          }
        },
        required: ["isEligible", "evaluationReason", "potentialBenefits", "documentsVerified", "portalUrl", "roadmap"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const searchNearbyCenters = async (lat: number, lng: number, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find nearest E-Sevai centers, CSCs, and Tahsildar offices near lat: ${lat}, lng: ${lng} in Tamil Nadu. Provide names and approximate locations. Respond in ${langName}.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const checkEligibility = async (userInput: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Analyze user situation for Tamil Nadu state welfare schemes: ${userInput}. Suggest matches. Respond in ${langName}.`,
    config: {
      thinkingConfig: { thinkingBudget: 1000 }
    }
  });

  return response.text;
};

export const analyzeCivicPhoto = async (base64Data: string, issueType: string, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const mimeTypeMatch = base64Data.match(/^data:(.*);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
  const cleanBase64 = base64Data.replace(/^data:.*;base64,/, '');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: `Analyze this image of a civic issue in Tamil Nadu. The user has categorized it as: "${issueType}". 
          Please identify:
          1. Exact nature of damage/issue.
          2. Severity (Low, Medium, High, Critical).
          3. Technical details:
             - If it's a street light: Look for any "Pole ID" or asset numbers visible on the pole.
             - If it's a road: Estimate pothole size or road damage extent.
             - If it's garbage: Identify volume and potential health hazards.
          4. Safety risks for citizens.
          5. Verify if the category "${issueType}" is correct. If not, suggest the most accurate one (garbage, light, road, drainage, water, traffic, property, other).
          
          Respond in ${langName} as JSON: { 
            "analysis": string, 
            "severity": string, 
            "details": string, 
            "safetyRisk": string,
            "detectedIssueType": string,
            "identifier": string
          }`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          severity: { type: Type.STRING },
          details: { type: Type.STRING },
          safetyRisk: { type: Type.STRING },
          detectedIssueType: { type: Type.STRING },
          identifier: { type: Type.STRING }
        },
        required: ["analysis", "severity", "details", "safetyRisk", "detectedIssueType", "identifier"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getProactiveRecommendations = async (userData: UserEligibilityData, lang: Language = 'en') => {
  const ai = getAIClient();
  const langName = getLanguageName(lang);
  
  const profileSummary = `
    - Occupation: ${userData.occupation}
    - Annual Income: ₹${userData.incomePeriod === 'monthly' ? userData.income * 12 : userData.income}
    - Family Members: ${userData.familySize}
    - Documents available: ${Object.keys(userData.documents).filter(k => !!(userData.documents as any)[k]).join(', ')}
    - Poverty Status: ${userData.povertyStatus}
    - Gender: ${userData.gender}
    - Education: ${userData.education}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this Tamil Nadu citizen's profile: ${profileSummary}, identify 2-3 specific government schemes they are ALMOST CERTAINLY eligible for but haven't applied to.
    Create proactive "Agent" style notifications.
    
    Respond in ${langName} as a JSON array of objects:
    - id: string
    - type: "scheme"
    - title: "Scheme Match Found!"
    - description: "e.g., Based on your new Income Certificate, you qualify for..."
    - schemeId: string (generic ID or name)
    - cta: "Draft Application"
    
    Respond in ${langName}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            schemeId: { type: Type.STRING },
            cta: { type: Type.STRING }
          },
          required: ["id", "type", "title", "description", "schemeId", "cta"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const getDashboardStats = async () => {
  return [
    { category: 'Financial Assistance', impactValue: 85 },
    { category: 'Education Support', impactValue: 72 },
    { category: 'Housing & Shelter', impactValue: 54 },
    { category: 'Healthcare Reach', impactValue: 91 },
    { category: 'Farmer Subsidies', impactValue: 68 },
  ];
};
