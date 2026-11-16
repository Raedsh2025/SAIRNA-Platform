

export interface OpenApiDocument {
  openapi?: string;
  swagger?: string;
  info?: { title?: string; version?: string; description?: string };
  servers?: Array<{ url?: string; description?: string }>;
  tags?: Array<{ name?: string; description?: string }>;
  paths?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
}

export interface EndpointDescriptor {
  method: string;
  path: string;
  summary: string;
  operationId: string;
  tags: string[];
}

const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
] as const;

export async function fetchSpec(
  url: string,
  signal?: AbortSignal,
): Promise<OpenApiDocument> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
    credentials: "omit",
  });

  if (!response.ok) {
    throw new Error(`تعذّر جلب المواصفة (HTTP ${response.status})`);
  }

  const text = await response.text();
  const trimmed = text.trimStart();

  if (trimmed.startsWith("<")) {
    throw new Error(
      "الرابط أعاد صفحة HTML (واجهة Swagger UI) وليس ملف JSON. استخدم رابط المواصفة نفسها مثل: /swagger/v1/swagger.json",
    );
  }

  return JSON.parse(text) as OpenApiDocument;
}

export function summarizeEndpoints(doc: OpenApiDocument): EndpointDescriptor[] {
  const endpoints: EndpointDescriptor[] = [];

  for (const [path, operations] of Object.entries(doc.paths ?? {})) {
    if (!operations || typeof operations !== "object") continue;

    for (const method of HTTP_METHODS) {
      const operation = operations[method] as
        | {
            summary?: string;
            description?: string;
            operationId?: string;
            tags?: string[];
          }
        | undefined;

      if (!operation) continue;

      endpoints.push({
        method: method.toUpperCase(),
        path,
        summary:
          operation.summary?.trim() ||
          operation.description?.trim().slice(0, 120) ||
          "",
        operationId: operation.operationId ?? "",
        tags: Array.isArray(operation.tags)
          ? operation.tags.filter(Boolean)
          : [],
      });
    }
  }

  return endpoints.sort(
    (a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method),
  );
}

export function countOperations(doc: OpenApiDocument): number {
  return summarizeEndpoints(doc).length;
}
