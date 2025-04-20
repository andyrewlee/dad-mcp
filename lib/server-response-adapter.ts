/*
 * Copyright (c) 2025 Vercel, Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Source: https://github.com/vercel-labs/mcp-for-next.js/blob/main/lib/mcp-api-handler.ts

import { EventEmitter } from "node:events";

import { type ServerResponse } from "node:http";

type WriteheadArgs = {
  statusCode: number;
  headers?: Record<string, string>;
};

/**
 * Anthropic's MCP API requires a server response object. This function
 * creates a fake server response object that can be used to pass to the MCP API.
 */
export function createServerResponseAdapter(
  signal: AbortSignal,
  fn: (re: ServerResponse) => Promise<void> | void
): Promise<Response> {
  let writeHeadResolver: (v: WriteheadArgs) => void;
  const writeHeadPromise = new Promise<WriteheadArgs>(async (resolve) => {
    writeHeadResolver = resolve;
  });

  return new Promise(async (resolve) => {
    let controller: ReadableStreamController<Uint8Array> | undefined;
    let shouldClose = false;
    let wroteHead = false;

    const writeHead = (
      statusCode: number,
      headers?: Record<string, string>
    ) => {
      if (typeof headers === "string") {
        throw new Error("Status message of writeHead not supported");
      }
      wroteHead = true;
      writeHeadResolver({
        statusCode,
        headers,
      });
      return fakeServerResponse;
    };

    const bufferedData: Uint8Array[] = [];

    const write = (
      chunk: Buffer | string,
      encoding?: BufferEncoding
    ): boolean => {
      if (encoding) {
        throw new Error("Encoding not supported");
      }
      if (chunk instanceof Buffer) {
        throw new Error("Buffer not supported");
      }
      if (!wroteHead) {
        writeHead(200);
      }
      if (!controller) {
        bufferedData.push(new TextEncoder().encode(chunk as string));
        return true;
      }
      controller.enqueue(new TextEncoder().encode(chunk as string));
      return true;
    };

    const eventEmitter = new EventEmitter();

    const fakeServerResponse = {
      writeHead,
      write,
      end: (data?: Buffer | string) => {
        if (data) {
          write(data);
        }

        if (!controller) {
          shouldClose = true;
          return fakeServerResponse;
        }
        try {
          controller.close();
        } catch {
          /* May be closed on tcp layer */
        }
        return fakeServerResponse;
      },
      on: (event: string, listener: (...args: unknown[]) => void) => {
        eventEmitter.on(event, listener);
        return fakeServerResponse;
      },
    };

    signal.addEventListener("abort", () => {
      eventEmitter.emit("close");
    });

    fn(fakeServerResponse as ServerResponse);

    const head = await writeHeadPromise;

    const response = new Response(
      new ReadableStream({
        start(c) {
          controller = c;
          for (const chunk of bufferedData) {
            controller.enqueue(chunk);
          }
          if (shouldClose) {
            controller.close();
          }
        },
      }),
      {
        status: head.statusCode,
        headers: head.headers,
      }
    );

    resolve(response);
  });
}
