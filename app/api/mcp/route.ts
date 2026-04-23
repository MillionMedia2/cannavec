import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-keys";
import { TOOLS, callSearchCannabisKb } from "@/lib/mcp/tools";

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
      return ok(id, { tools: TOOLS });

    case "tools/call": {
      const toolName: string = params?.name;
      const toolArgs = params?.arguments ?? {};

      if (toolName !== "search_cannabis_kb") {
        return rpcError(id, -32601, `Unknown tool: ${toolName}`);
      }

      try {
        const text = await callSearchCannabisKb(toolArgs, tier);
        return ok(id, { content: [{ type: "text", text }] });
      } catch (e: any) {
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
