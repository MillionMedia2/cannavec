import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-keys";
import { buildToolsForTier, dispatchToolCall } from "@/lib/mcp/tools";
import type { SkillContext } from "@/lib/skills/types";

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: any;
};

function ok(id: any, result: any) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

function rpcError(id: any, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return rpcError(null, -32600, "Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);
  const keyResult = await verifyApiKey(token);
  if (!keyResult.valid) {
    return rpcError(null, -32600, keyResult.error ?? "Invalid API key");
  }

  const tier = keyResult.tier!;

  let body: JsonRpcRequest;
  try {
    body = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id, method, params } = body;

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        serverInfo: { name: "cannavec-mcp", version: "1.0.0" },
        capabilities: { tools: {} },
      });

    case "notifications/initialized":
      return new NextResponse(null, { status: 204 });

    case "tools/list":
      return ok(id, { tools: buildToolsForTier(tier) });

    case "tools/call": {
      const toolName: string = params?.name;
      const toolArgs: Record<string, any> = params?.arguments ?? {};
      const context: SkillContext = {
        userId: keyResult.user_id!,
        tier,
        apiKeyId: keyResult.key_id!,
      };

      try {
        const result = await dispatchToolCall(toolName, toolArgs, context);
        return ok(id, {
          content: [{ type: "text", text: result.text }],
          ...(result.structuredContent
            ? { structuredContent: result.structuredContent }
            : {}),
        });
      } catch (e: any) {
        if (e.message?.startsWith("Unknown tool:")) {
          return rpcError(id, -32601, e.message);
        }
        return ok(id, {
          content: [{ type: "text", text: e.message }],
          isError: true,
        });
      }
    }

    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}
