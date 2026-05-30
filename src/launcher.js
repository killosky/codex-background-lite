import { execFile } from "node:child_process";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runPowerShell(script) {
  const encoded = Buffer.from(script, "utf16le").toString("base64");
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encoded],
      { windowsHide: true },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error((stderr || error.message).trim()));
        } else {
          resolve(stdout.trim());
        }
      }
    );
  });
}

function escapeCmdlineArg(arg) {
  if (arg && !/[ \t"\n]/.test(arg)) return arg;
  let out = '"';
  let backslashes = 0;
  for (const char of arg) {
    if (char === "\\") {
      backslashes += 1;
    } else {
      if (char === '"') {
        out += "\\".repeat(backslashes * 2 + 1);
      } else {
        out += "\\".repeat(backslashes);
      }
      backslashes = 0;
      out += char;
    }
  }
  out += "\\".repeat(backslashes * 2);
  out += '"';
  return out;
}

function list2cmdline(args) {
  return args.map(escapeCmdlineArg).join(" ");
}

function cdpArgs(port) {
  return [
    `--remote-debugging-port=${port}`,
    "--remote-allow-origins=*"
  ];
}

async function stopWindowsCodex() {
  await runPowerShell(`
$ErrorActionPreference = 'SilentlyContinue'
Get-CimInstance Win32_Process -Filter "Name='Codex.exe' OR Name='codex.exe'" |
  ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction SilentlyContinue }
`);
}

async function activateWindowsMsixCodex(argsLine) {
  const escapedArgsLine = JSON.stringify(argsLine);
  return runPowerShell(`
$ErrorActionPreference = 'Stop'
$pkg = Get-AppxPackage -Name 'OpenAI.Codex' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $pkg) {
  throw 'OpenAI.Codex MSIX package was not found. Install Codex Desktop from the Store, or launch a non-MSIX build manually with CDP args.'
}
$aumid = $pkg.PackageFamilyName + '!App'
$arguments = ${escapedArgsLine}

$code = @'
using System;
using System.Runtime.InteropServices;

[Flags]
public enum ActivateOptions {
    None = 0x00000000,
    DesignMode = 0x00000001,
    NoErrorUI = 0x00000002,
    NoSplashScreen = 0x00000004
}

[ComImport]
[Guid("2e941141-7f97-4756-ba1d-9decde894a3d")]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IApplicationActivationManager {
    int ActivateApplication(
        [MarshalAs(UnmanagedType.LPWStr)] string appUserModelId,
        [MarshalAs(UnmanagedType.LPWStr)] string arguments,
        ActivateOptions options,
        out UInt32 processId);
    int ActivateForFile(IntPtr appUserModelId, IntPtr itemArray, string verb, out UInt32 processId);
    int ActivateForProtocol(IntPtr appUserModelId, IntPtr itemArray, out UInt32 processId);
}

[ComImport]
[Guid("45BA127D-10A8-46EA-8AB7-56EA9078943C")]
class ApplicationActivationManager {}

public static class CodexMsixActivator {
    public static UInt32 Activate(string aumid, string arguments) {
        var manager = (IApplicationActivationManager)new ApplicationActivationManager();
        UInt32 pid;
        int hr = manager.ActivateApplication(aumid, arguments, ActivateOptions.None, out pid);
        Marshal.ThrowExceptionForHR(hr);
        return pid;
    }
}
'@

Add-Type -TypeDefinition $code -Language CSharp
[CodexMsixActivator]::Activate($aumid, $arguments)
`);
}

export async function restartCodexWithCdp({ port = 9222 } = {}) {
  const argsLine = list2cmdline(cdpArgs(port));

  if (process.platform === "win32") {
    await stopWindowsCodex();
    await sleep(500);
    const pid = await activateWindowsMsixCodex(argsLine);
    return { platform: "win32", pid, args: argsLine };
  }

  throw new Error("restart-codex is implemented only for Windows MSIX Codex in this local refactor.");
}
