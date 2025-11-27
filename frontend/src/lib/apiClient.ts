import type { GameModel } from "../contexts/GameBuilderContext";
import { getAccessToken } from "@privy-io/react-auth";

export interface PromptIn {
  description: string;
}
export interface CodeGenIn {
  title: string;
  enhanced_prompt: string;
}
export interface GameScoreIn {
  game_id: number;
  score: number;
}
export interface MessageBlock {
  role: string;
  content: string;
}
export interface CodeOut {
  code: string;
  game_id: number;
}

const API_ENDPOINT = import.meta.env.VITE_API_URL;
// const API_ENDPOINT = import.meta.env.VITE_LIVE;
// 🌐 Fetch wrapper: automatically add Authorization header
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  const headers: HeadersInit = {
    Authorization: token ? `Bearer ${token}` : "",
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function enhancePrompt(
  messages: MessageBlock[],
  model: GameModel
): Promise<MessageBlock[]> {
  const res = await fetchWithAuth(
    `${API_ENDPOINT}/api/enhance-prompt?model=${model}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    }
  );

  if (!res.ok) {
    throw new Error(`Enhance prompt failed: ${res.statusText}`);
  }

  return res.json();
}

export async function generateCode(
  messages: MessageBlock[],
  model: GameModel
): Promise<MessageBlock[]> {
  const res = await fetchWithAuth(
    `${API_ENDPOINT}/api/generate-code?model=${model}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    }
  );

  if (!res.ok) {
    throw new Error(`Generate code failed: ${res.statusText}`);
  }

  return res.json();
}

// --- Generate Code with stream (public initiation)
export async function generateCodePublish(
  game_id: number = -1,
  messages: MessageBlock[],
  model: GameModel
): Promise<EventSource> {
  const res = await fetchWithAuth(
    `${API_ENDPOINT}/api/generate-code-publish?model=${model}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, game_id: game_id }),
    }
  );

  if (!res.ok) {
    throw new Error(`Generate code publish failed: ${res.statusText}`);
  }
  const data = await res.json();
  return new EventSource(
    `${API_ENDPOINT}/api/generate-code-stream?channel=${data.channel}`
  );
}

// --- Submit Score (protected with auth)
export async function submitScore(score: GameScoreIn): Promise<void> {
  const res = await fetchWithAuth(`${API_ENDPOINT}/api/scores`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(score),
  });

  if (!res.ok) {
    throw new Error(`Score submission failed: ${res.statusText}`);
  }
}

// --- Preview Game (public)
export async function fetchGameHtml(id: number): Promise<string> {
  const res = await fetchWithAuth(`${API_ENDPOINT}/api/previews/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Game preview not found (id=${id})`);
  }
  return res.text();
}

export async function createProject(
  name: string,
  code: string,
  wallet: string,
  ai_model: string | null = "GEMINI",
  integrate: object = {}
): Promise<number> {
  const res = await fetchWithAuth(`${API_ENDPOINT}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({
      name,
      code,
      wallet,
      integrate,
      ai_model,
    }),
  });
  const data = await res.json();
  return data["game_id"];
}

export async function updateProject(
  id: number,
  name: string,
  code: string,
  ai_model?: string
): Promise<boolean> {
  const res = await fetchWithAuth(`${API_ENDPOINT}/api/projects`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({
      id,
      name,
      code,
      ai_model,
    }),
  });

  return res.ok;
}

export type Project = {
  title: string;
  code: string;
  thumbnail: string;
  preview: string;
  approval: string;
  id: number;
  assets: [string, string][];
};

export async function listProject(gameID?: number): Promise<Project[]> {
  const query = gameID != null ? `?id=${gameID}` : ``;
  const res = await fetchWithAuth(`${API_ENDPOINT}/api/projects${query}`);

  return (await res.json()) as Project[];
}

type FileUploadResponse = {
  filename: string;
  endpoint: string;
};

export async function uploadThumbnail(
  file: File,
  gameID: number
): Promise<FileUploadResponse> {
  const data = new FormData();
  data.append("thumbnail", file);
  data.append("game_id", gameID.toString());

  const res = await fetchWithAuth(`${API_ENDPOINT}/api/projects/thumbnail`, {
    method: "PUT",
    body: data,
  });
  const responseData = await res.json();

  return responseData as FileUploadResponse;
}

export async function uploadAsset(
  name: string,
  file: File,
  gameID: number
): Promise<FileUploadResponse> {
  const data = new FormData();
  data.append("asset", file);
  data.append("game_id", gameID.toString());
  data.append("asset_name", name);

  const res = await fetchWithAuth(`${API_ENDPOINT}/api/projects/assets`, {
    method: "POST",
    body: data,
  });
  const responseData = await res.json();

  return responseData as FileUploadResponse;
}

export async function uploadPreview(
  file: File,
  gameID: number
): Promise<FileUploadResponse> {
  const data = new FormData();
  data.append("preview", file);
  data.append("game_id", gameID.toString());

  const res = await fetchWithAuth(`${API_ENDPOINT}/api/projects/preview`, {
    method: "PUT",
    body: data,
  });
  const responseData = await res.json();

  return responseData as FileUploadResponse;
}

export async function deleteAssets(gameID: number): Promise<boolean> {
  const res = await fetchWithAuth(`${API_ENDPOINT}/api/projects/assets`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: gameID,
    }),
  });
  return res.ok;
}

export async function deleteProject(id: number): Promise<boolean> {
  const res = await fetchWithAuth(`${API_ENDPOINT}/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete project (id=${id}): ${res.statusText}`);
  }

  return res.ok;
}

export type Message = {
  id: number;
  author: string;
  content: string;
  conversation_id: number;
};

export async function GetMessages(convo_id: number) {
  const res = await fetchWithAuth(
    `${API_ENDPOINT}/api/conversations/${convo_id}`
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch messages for convo ${convo_id} ${res.statusText} `
    );
  }

  return (await res.json()) as Message[];
}

export async function PostMessage(
  convo_id: number,
  message: string
): Promise<boolean> {
  const res = await fetchWithAuth(`${API_ENDPOINT}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ convo_id: convo_id, content: message }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update code: ${res.statusText}`);
  }

  return true;
}

export async function IterateGame(
  convo_id: number,
  ai_model = "GEMINI"
): Promise<EventSource> {
  const newCodeRes = await fetchWithAuth(
    `${API_ENDPOINT}/api/projects/iterate`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convo_id: convo_id, ai_model: ai_model }),
    }
  );

  if (!newCodeRes.ok) {
    throw new Error(`Failed to fetch new code: ${newCodeRes.statusText}`);
  }

  const data = await newCodeRes.json();
  return new EventSource(
    `${API_ENDPOINT}/api/generate-code-stream?channel=${data.channel}`
  );
}

export async function ChatFlow(
  convo_id: number,
  message: string,
  gameModel: string = "GEMINI"
): Promise<EventSource> {
  return PostMessage(convo_id, message).then(async (res) => {
    if (!res) {
      throw new Error(`Failed to post message`);
    }

    const data = await IterateGame(convo_id, gameModel);
    return data;
  });
}

export async function RefreshAssets(
  shouldDeleteAssets: boolean,
  gameID: number,
  gameAssetMap: Record<string, File | string | null>
): Promise<boolean> {
  if (shouldDeleteAssets) {
    await deleteAssets(gameID);
  }
  for (const [assetName, assetFile] of Object.entries(gameAssetMap)) {
    if (typeof assetFile === "string" || assetFile === null) {
      continue;
    }

    try {
      await uploadAsset(assetName, assetFile, gameID);
      console.log(`Asset ${assetName} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading asset ${assetName}: ${error}`);
      throw error;
    }
  }

  return;
}
