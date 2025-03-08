import type { NextApiRequest, NextApiResponse } from 'next';
import { globalHandler } from '@/utils/api/global-handler';
import { TaskSchema } from '@/types/todoist/task';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

const QueryParametersSchema = z.string();

const { TODOIST_API_BASE_URL, TODOIST_API_TOKEN } = process.env;

/**
 * I'm ashamed of this code
 */

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req;

  const { project1, project2 } = query;

  const validatedProject1 = QueryParametersSchema.safeParse(project1);
  const validatedProject2 = QueryParametersSchema.safeParse(project2);

  if (!validatedProject1.success) {
    throw new ApiError(400, `Bad request: Invalid query parameter project2. ${validatedProject1.error.issues[0].message}`);
  }

  if (!validatedProject2.success) {
    throw new ApiError(400, `Bad request: Invalid query parameter project2. ${validatedProject2.error.issues[0].message}`);
  }
  
  let project1Response;

  const todoistProject1Query = new URL(`${TODOIST_API_BASE_URL}/tasks`);
  todoistProject1Query.searchParams.append('filter', `#${project1}`);

  try {
    project1Response = await fetch(todoistProject1Query, {
      headers: {
        Authorization: `Bearer ${TODOIST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new ApiError(500, `Internal API: ${message}`); // TODO: Make this more specific
  }

  if (!project1Response.ok) {
    console.error(project1Response.statusText);
    throw new ApiError(project1Response.status, `Todoist API: ${project1Response.statusText}`);
  }

  const unvalidatedProject1Tasks = await project1Response.json();

  const parsedProject1Tasks = TaskSchema.array().safeParse(unvalidatedProject1Tasks);

  if (!parsedProject1Tasks.success) {
    console.log(unvalidatedProject1Tasks);
    console.error(parsedProject1Tasks.error);
    throw new ApiError(500, "Failed to parse tasks");
  }

  const simplifiedProject1Tasks = parsedProject1Tasks.data.map(({
    id, project_id, content, is_completed, priority, order, due,
  }) => {
    return { id, project_id, content, is_completed, priority, order, due };
  });

  let project2Response;

  const todoistProject2Query = new URL(`${TODOIST_API_BASE_URL}/tasks`);
  todoistProject2Query.searchParams.append('filter', `#${project2}`);

  try {
    project2Response = await fetch(todoistProject2Query, {
      headers: {
        Authorization: `Bearer ${TODOIST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new ApiError(500, `Internal API: ${message}`); // TODO: Make this more specific
  }

  if (!project2Response.ok) {
    console.error(project2Response.statusText);
    throw new ApiError(project2Response.status, `Todoist API: ${project2Response.statusText}`);
  }

  const unvalidatedProject2Tasks = await project2Response.json();

  const parsedProject2Tasks = TaskSchema.array().safeParse(unvalidatedProject2Tasks);

  if (!parsedProject2Tasks.success) {
    console.log(unvalidatedProject2Tasks);
    console.error(parsedProject2Tasks.error);
    throw new ApiError(500, "Failed to parse tasks");
  }

  const simplifiedProject2Tasks = parsedProject2Tasks.data.map(({
    id, project_id, content, is_completed, priority, order, due,
  }) => {
    return { id, project_id, content, is_completed, priority, order, due };
  });

  if (project1Response.ok && project2Response.ok) {
    return res.status(200).json({
      project1: {
        name: project1,
        tasks: simplifiedProject1Tasks,
      },
      project2: {
        name: project2,
        tasks: simplifiedProject2Tasks,
      },
    });
  }
  
}

export default globalHandler(handler);