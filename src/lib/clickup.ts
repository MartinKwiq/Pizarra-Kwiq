import { kv } from '@vercel/kv';
import { getTokens } from './db';
import { decrypt } from './encryption';

const CACHE_TTL = 3600; // 1 hour

export async function getTeamTasks(teamId: string, userId: string = 'default_user') {
  const cacheKey = `clickup:tasks:${teamId}`;

  // 1. Intentar obtener del caché de Vercel KV (Redis)
  try {
    const cachedData = await kv.get(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Serving tasks for team ${teamId} from Redis`);
      return cachedData;
    }
  } catch (error) {
    console.error('[KV Error] Failed to read from Redis', error);
  }

  // 2. Si no hay caché, obtener tokens y consultar ClickUp
  const storedTokens = await getTokens(userId);
  if (!storedTokens) {
    throw new Error('User not authenticated with ClickUp');
  }

  const accessToken = decrypt(storedTokens.access_token);

  // ClickUp API para obtener todas las tareas de un Team (Workspace)
  // Nota: ClickUp requiere iterar por Listas o usar el endpoint filtrado por Team
  const response = await fetch(`https://api.clickup.com/api/v2/team/${teamId}/task?subtasks=true`, {
    method: 'GET',
    headers: {
      'Authorization': accessToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`ClickUp API Error: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();

  // 3. Almacenar en caché para futuras peticiones
  try {
    await kv.set(cacheKey, data, { ex: CACHE_TTL });
    console.log(`[Cache Miss] Tasks for team ${teamId} fetched and stored in Redis`);
  } catch (error) {
    console.warn('[KV Error] Failed to write to Redis', error);
  }

  return data;
}

export async function getTask(taskId: string, userId: string = 'default_user') {
  const storedTokens = await getTokens(userId);
  if (!storedTokens) throw new Error('User not authenticated');
  
  const accessToken = decrypt(storedTokens.access_token);
  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    headers: { 'Authorization': accessToken }
  });

  if (!response.ok) throw new Error('ClickUp API Error');
  return await response.json();
}

export async function createTask(listId: string, taskData: any, userId: string = 'default_user') {
  const storedTokens = await getTokens(userId);
  if (!storedTokens) throw new Error('User not authenticated');
  
  const accessToken = decrypt(storedTokens.access_token);
  const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
    method: 'POST',
    headers: { 
      'Authorization': accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) throw new Error('ClickUp API Error');
  return await response.json();
}
