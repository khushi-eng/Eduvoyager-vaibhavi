import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Roadmap, GameQuestion, AssessmentQuestion, Job, Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-3-flash-preview";

export const generateAssessmentQuestions = async (designation: string, domain: string, age: number): Promise<AssessmentQuestion[]> => {
  const prompt = `
    Context: A user (Designation: ${designation}, Age: ${age}) wants to pursue a goal/domain in: "${domain}".
    
    Task: Generate 5 specific multiple-choice assessment questions.
    
    CRITICAL REQUIREMENT: 
    - Questions about "Learning Style", "Interests", or "Tools used" MUST allow multiple selections. Set 'allowMultiple' to true for these.
    - Questions about "Skill Level" or "Experience" should be single selection. Set 'allowMultiple' to false.

    Topics to cover:
    1. Current skill level in "${domain}" (Single Select).
    2. Specific interests within "${domain}" (Multi Select).
    3. Learning preferences (e.g. Video, Reading, Projects) (Multi Select).
    4. Tools/Technologies already known (Multi Select).
    5. Time availability (Single Select).
    
    Return a JSON array where each object has:
    - 'question': string
    - 'options': array of strings
    - 'allowMultiple': boolean
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              allowMultiple: { type: Type.BOOLEAN }
            },
            required: ["question", "options", "allowMultiple"]
          },
        },
      },
    });

    const json = JSON.parse(response.text || "[]");
    return json;
  } catch (error) {
    console.error("Error generating assessment:", error);
    return [
      { question: `What is your current experience with ${domain}?`, options: ["Complete Beginner", "Basic Knowledge", "Intermediate", "Advanced"], allowMultiple: false },
      { question: "How much time can you dedicate daily?", options: ["Less than 1 hour", "1-2 hours", "2-4 hours", "Full time"], allowMultiple: false },
      { question: "What are your preferred learning styles? (Select all that apply)", options: ["Video Tutorials", "Reading Documentation", "Hands-on Projects", " mentorship", "Audiobooks"], allowMultiple: true },
      { question: "What is your ultimate goal?", options: ["Get a Job", "Start a Business", "Hobby/Fun", "Academic Success"], allowMultiple: false },
      { question: "What is your budget?", options: ["Free only", "Low budget", "Premium courses"], allowMultiple: false }
    ];
  }
};

const resourceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    url: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['video', 'article', 'course', 'book'] },
    isPaid: { type: Type.BOOLEAN },
    priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
  },
  required: ["title", "url", "type", "isPaid", "priority"],
};

const roadmapSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    domain: { type: Type.STRING },
    targetNsqfLevel: { type: Type.NUMBER },
    learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
    softSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          resources: {
            type: Type.ARRAY,
            items: resourceSchema
          }
        },
        required: ["name", "description", "resources"]
      }
    },
    decisionPrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          nsqfLevel: { type: Type.NUMBER },
          estimatedHours: { type: Type.NUMBER },
          completed: { type: Type.BOOLEAN },
          resources: {
            type: Type.ARRAY,
            items: resourceSchema,
          },
        },
        required: ["id", "title", "description", "nsqfLevel", "estimatedHours", "resources"],
      },
    },
  },
  required: ["title", "description", "domain", "targetNsqfLevel", "learningObjectives", "softSkills", "decisionPrompts", "steps"],
};

export const generateRoadmap = async (
  userProfile: any,
  answers: { question: string; answer: string }[]
): Promise<Roadmap> => {
  
  const designation = userProfile.designation || "Learner";
  const domain = userProfile.domain || "General Skills";

  // PART C: Roadmap Generation Context
  const systemContext = `
    You are an expert career counselor EduVoyager. 
    User Profile: ${designation}, Goal: ${domain}.
    
    Task: Map the user's answers to an NSQF Level (National Skills Qualifications Framework).
    
    SCORING LOGIC:
    - Beginners/Hobbyists -> NSQF Level 1-4.
    - Intermediate/Undergrads -> NSQF Level 5-7.
    - Advanced/Professionals -> NSQF Level 8-10.
    
    Create a JSON roadmap tailored to the domain "${domain}".
    - 'targetNsqfLevel': Determine based on answers.
    - 'learningObjectives': 3 bullet points on what they will achieve.
    - 'softSkills': Identify 5 CRITICAL soft skills and behavioral qualities required for this role from a RECRUITMENT & PLACEMENT perspective.
      MANDATORY: You MUST include 'Effective Communication' and 'Leadership' (or Teamwork) if relevant.
      Other examples: Emotional Intelligence, Adaptability, Problem Solving, Presentation Skills.
      For EACH soft skill, provide:
       1. 'name': The skill name (e.g. "Leadership & Team Management", "Professional Communication").
       2. 'description': A brief explanation of why recruiters value this skill for a ${designation} in ${domain}.
       3. 'resources': Provide exactly 4 resources. 
          - 2 MUST be high-quality FREE resources (e.g., YouTube, Blogs).
          - 2 MUST be top-rated PAID resources (e.g., Coursera, Udemy, Books) to give the user premium options.
          Ensure 'isPaid' is correctly set to true or false for each.
    - 'decisionPrompts': 2-3 questions for self-reflection.
    - 'steps': A step-by-step technical learning path.
  `;

  const prompt = `
    ${systemContext}
    
    User Profile: ${JSON.stringify(userProfile)}
    Assessment Answers: ${JSON.stringify(answers)}
    
    Generate the roadmap JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
      },
    });

    const data = JSON.parse(response.text || "{}");
    if (data.steps) {
        data.steps = data.steps.map((step: any, index: number) => ({
            ...step,
            id: step.id || `step-${index}`,
            completed: false
        }));
    }
    // Ensure domain is populated if AI omits it
    if (!data.domain) data.domain = domain;
    
    // Fallback if softSkills is missing or empty
    if (!data.softSkills || data.softSkills.length === 0) {
        data.softSkills = [
            { 
                name: "Professional Communication", 
                description: "Essential for placement: Articulating ideas clearly in interviews and team settings.", 
                resources: [
                    { title: "Communication for Professionals (Free)", url: "https://www.youtube.com/results?search_query=professional+communication+skills", type: "video", isPaid: false, priority: "high" },
                    { title: "Mastering Communication (Paid)", url: "https://www.udemy.com/topic/communication-skills/", type: "course", isPaid: true, priority: "medium" }
                ] 
            },
            { 
                name: "Leadership & Ownership", 
                description: "Taking initiative and guiding others, a key trait recruiters look for.", 
                resources: [
                    { title: "Leadership Fundamentals (Free)", url: "https://www.youtube.com/results?search_query=leadership+skills+for+beginners", type: "video", isPaid: false, priority: "high" },
                    { title: "Leadership: Practical Skills (Paid)", url: "https://www.coursera.org/courses?query=leadership", type: "course", isPaid: true, priority: "medium" }
                ] 
            }
        ];
    }
    
    return data as Roadmap;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw new Error("Failed to generate roadmap");
  }
};

export const generateNextLevelRoadmap = async (
  currentRoadmap: Roadmap,
  nextFocus: string,
): Promise<Roadmap> => {
  
  const nextLevel = Math.min(10, currentRoadmap.targetNsqfLevel + 1);
  const prompt = `
    Context: User has completed an NSQF Level ${currentRoadmap.targetNsqfLevel} roadmap in "${currentRoadmap.domain}".
    They now want to focus on: "${nextFocus}".
    
    Task: Create a follow-up roadmap for NSQF Level ${nextLevel} (or higher if appropriate).
    Title should reflect the next stage of learning (e.g., "Advanced ${currentRoadmap.domain}" or "Mastering ${nextFocus}").
    
    Current Domain: ${currentRoadmap.domain}
    Next Focus: ${nextFocus}
    
    Structure the response exactly like the previous roadmap JSON.
    Include 5 advanced 'softSkills' crucial for CAREER ADVANCEMENT and PLACEMENT at this higher level.
    Examples: Strategic Leadership, Conflict Resolution, Negotiation, Public Speaking.
    For each soft skill, provide 4 specific learning resources: 2 FREE and 2 PAID options. Ensure 'isPaid' flag is accurate.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
      },
    });

    const data = JSON.parse(response.text || "{}");
    if (data.steps) {
        data.steps = data.steps.map((step: any, index: number) => ({
            ...step,
            id: step.id || `next-step-${index}-${Date.now()}`,
            completed: false
        }));
    }
    if (!data.domain) data.domain = currentRoadmap.domain;
    if (!data.softSkills) {
         data.softSkills = [
            { 
                name: "Strategic Leadership", 
                description: "Leading teams and projects effectively with a long-term vision.", 
                resources: [
                    { title: "Strategic Leadership (Free)", url: "https://www.youtube.com/results?search_query=strategic+leadership", type: "video", isPaid: false, priority: "high" },
                    { title: "Executive Leadership (Paid)", url: "https://www.coursera.org/learn/strategic-leadership", type: "course", isPaid: true, priority: "high" }
                ] 
            },
             { 
                name: "Advanced Negotiation", 
                description: "Crucial for senior roles and business deals.", 
                resources: [
                    { title: "Negotiation Skills (Free)", url: "https://www.youtube.com/results?search_query=negotiation+skills", type: "video", isPaid: false, priority: "high" },
                    { title: "Successful Negotiation (Paid)", url: "https://www.udemy.com/topic/negotiation/", type: "course", isPaid: true, priority: "high" }
                ] 
            }
        ];
    }
    
    return data as Roadmap;
  } catch (error) {
    console.error("Error generating next level roadmap:", error);
    throw new Error("Failed to generate next level roadmap");
  }
};

export const generateGameQuestions = async (topic: string, difficulty: string): Promise<GameQuestion[]> => {
  const prompt = `
    Generate 5 ${difficulty} difficulty aptitude or technical questions related to: "${topic}".
    These are for revision purposes.
    Include an explanation for the correct answer.
  `;

  const gameSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswerIndex: { type: Type.NUMBER },
        explanation: { type: Type.STRING },
        difficulty: { type: Type.STRING },
      },
      required: ["question", "options", "correctAnswerIndex", "explanation", "difficulty"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: gameSchema,
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((q: any, i: number) => ({ ...q, id: `q-${i}-${Date.now()}` }));
  } catch (error) {
    console.error("Error generating game:", error);
    return [];
  }
};

export const generateJobs = async (userDesignation: string, skills: string[]): Promise<Job[]> => {
  const prompt = `
    Based on a user who is a ${userDesignation} with the following skills: ${skills.join(", ")},
    recommend 5 relevant job roles available on major job portals.
    
    For each job:
    1. Create a realistic title and hypothetical company name.
    2. Determine the job type and platform (LinkedIn, Indeed, etc).
    3. Generate a SEARCH URL that would find this type of job on that platform (e.g. "https://www.linkedin.com/jobs/search/?keywords=React+Developer").
    4. Provide an estimated match score (70-99).
    5. List key skills required.
  `;

  const jobSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        company: { type: Type.STRING },
        location: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Full-time', 'Part-time', 'Internship', 'Remote'] },
        salaryRange: { type: Type.STRING },
        platform: { type: Type.STRING, enum: ['LinkedIn', 'Indeed', 'Glassdoor', 'Naukri'] },
        url: { type: Type.STRING },
        matchScore: { type: Type.NUMBER },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["title", "company", "location", "type", "salaryRange", "platform", "url", "matchScore", "skills"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: jobSchema,
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((job: any, i: number) => ({ ...job, id: `job-${i}-${Date.now()}` }));
  } catch (error) {
    console.error("Error generating jobs:", error);
    return [
      {
        id: "mock-1",
        title: "Junior Developer",
        company: "Tech Solutions Inc.",
        location: "Remote",
        type: "Full-time",
        salaryRange: "$60k - $80k",
        platform: "LinkedIn",
        url: "https://www.linkedin.com/jobs/search/?keywords=Junior+Developer",
        matchScore: 95,
        skills: ["React", "TypeScript"]
      }
    ];
  }
};

export const generateDailyTasks = async (stepTitle: string, stepDescription: string, count: number = 3): Promise<Task[]> => {
  const prompt = `
    The user is currently working on this learning roadmap step:
    Title: "${stepTitle}"
    Description: "${stepDescription}"
    
    Task: Generate ${count} very specific, actionable, bite-sized micro-tasks for today that will help them complete this step.
    Each task should take 15-30 minutes.
    
    Examples:
    - "Watch the video tutorial on Variables."
    - "Write a script that prints 'Hello World'."
    - "Read the documentation on Arrays."
    
    Return a JSON array of strings (just the task text).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    const taskTexts = JSON.parse(response.text || "[]");
    return taskTexts.map((text: string, i: number) => ({
      id: `daily-task-${Date.now()}-${i}`,
      text: text,
      isCompleted: false,
      type: 'core'
    }));
  } catch (error) {
    console.error("Error generating daily tasks:", error);
    return [
      { id: 'dt-1', text: `Review resources for ${stepTitle}`, isCompleted: false, type: 'core' },
      { id: 'dt-2', text: 'Practice key concepts for 20 mins', isCompleted: false, type: 'core' },
      { id: 'dt-3', text: 'Take notes on the main topic', isCompleted: false, type: 'core' },
    ];
  }
};