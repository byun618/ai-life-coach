import { Injectable, Logger } from '@nestjs/common'
import { spawn, ChildProcess } from 'child_process'

interface StreamDelta {
  type: 'delta'
  text: string
}

interface StreamDone {
  type: 'done'
  sessionId: string
  result: string
}

interface StreamError {
  type: 'error'
  message: string
}

export type ClaudeStreamEvent = StreamDelta | StreamDone | StreamError

interface StartStreamInput {
  prompt: string
  sessionId: string
  isResume: boolean
  cwd?: string
}

@Injectable()
export class ClaudeCliService {
  private readonly logger = new Logger(ClaudeCliService.name)
  private readonly cliPath = process.env.CLAUDE_CLI_PATH ?? 'claude'
  private readonly defaultCwd = process.env.BRAIN_REPO_PATH ?? process.cwd()
  private readonly processes = new Map<string, ChildProcess>()

  async *stream(input: StartStreamInput): AsyncIterable<ClaudeStreamEvent> {
    const args = [
      '--print',
      '--output-format',
      'stream-json',
      '--verbose',
      '--include-partial-messages',
      '--model',
      'sonnet',
      ...(input.isResume
        ? ['--resume', input.sessionId]
        : ['--session-id', input.sessionId]),
      input.prompt,
    ]

    this.logger.log(`Starting claude CLI: session=${input.sessionId}`)

    const proc = spawn(this.cliPath, args, {
      cwd: input.cwd ?? this.defaultCwd,
      env: process.env,
    })

    this.processes.set(input.sessionId, proc)

    let buffer = ''
    let stderrBuffer = ''

    proc.stderr.on('data', (chunk: Buffer) => {
      stderrBuffer += chunk.toString()
    })

    try {
      for await (const chunk of proc.stdout) {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          const event = this.parseEvent(line)
          if (event) yield event
        }
      }

      if (buffer.trim()) {
        const event = this.parseEvent(buffer)
        if (event) yield event
      }

      const exitCode: number | null = await new Promise((resolve) => {
        if (proc.exitCode !== null) {
          resolve(proc.exitCode)
        } else {
          proc.once('exit', (code) => resolve(code))
        }
      })

      if (exitCode !== 0) {
        yield {
          type: 'error',
          message: `claude exited with code ${exitCode}: ${stderrBuffer.slice(0, 500)}`,
        }
      }
    } finally {
      this.processes.delete(input.sessionId)
    }
  }

  abort(sessionId: string): boolean {
    const proc = this.processes.get(sessionId)
    if (!proc) return false
    proc.kill('SIGTERM')
    this.processes.delete(sessionId)
    this.logger.log(`Aborted claude CLI: session=${sessionId}`)
    return true
  }

  private parseEvent(line: string): ClaudeStreamEvent | null {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(line)
    } catch {
      return null
    }

    const type = parsed.type

    if (type === 'stream_event') {
      const event = parsed.event as Record<string, unknown> | undefined
      if (event?.type === 'content_block_delta') {
        const delta = event.delta as Record<string, unknown> | undefined
        if (delta?.type === 'text_delta' && typeof delta.text === 'string') {
          return { type: 'delta', text: delta.text }
        }
      }
      return null
    }

    if (type === 'result') {
      const subtype = parsed.subtype
      if (subtype === 'success' && typeof parsed.result === 'string') {
        return {
          type: 'done',
          sessionId: String(parsed.session_id ?? ''),
          result: parsed.result,
        }
      }
      if (parsed.is_error) {
        return {
          type: 'error',
          message: typeof parsed.result === 'string' ? parsed.result : 'claude error',
        }
      }
    }

    return null
  }
}
