
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  KeyRound,
  Plus,
  RotateCw,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Activity,
  LockKeyhole,
} from "lucide-react";

const BRAND = "Webcraft Solution";

const availableScopes = [
  {
    id: "messages:send",
    label: "messages:send",
    desc: "Send individual and batch messages",
  },
  {
    id: "templates:read",
    label: "templates:read",
    desc: "Read approved message templates",
  },
  {
    id: "contacts:read",
    label: "contacts:read",
    desc: "Read contacts and consent details",
  },
  {
    id: "contacts:write",
    label: "contacts:write",
    desc: "Create and update contacts",
  },
  {
    id: "webhooks:listen",
    label: "webhooks:listen",
    desc: "Receive delivery status callbacks",
  },
];

type TestResult = {
  success: boolean;
  statusCode: number;
  message: string;
  remainingLimit: number;
};

export const TenantApiKeys: React.FC = () => {
  const {
    apiKeys,
    generateApiKey,
    revokeApiKey,
    rotateApiKey,
    testApiCall,
    currentCompany,
  } = useApp();

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "messages:send",
    "templates:read",
  ]);
  const [rateLimitRpm, setRateLimitRpm] = useState(120);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [testEndpoint, setTestEndpoint] = useState(
    "/api/v1/messages/send"
  );
  const [selectedTestKey, setSelectedTestKey] = useState(
    apiKeys.find(
      (key) =>
        key.companyId === currentCompany.id &&
        key.status === "ACTIVE"
    )?.keyPrefix || ""
  );
  const [testResult, setTestResult] =
    useState<TestResult | null>(null);

  const companyKeys = apiKeys.filter(
    (key) => key.companyId === currentCompany.id
  );

  const activeKeys = companyKeys.filter(
    (key) => key.status === "ACTIVE"
  );

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newKeyName.trim() || selectedScopes.length === 0) return;

    const { rawKey } = generateApiKey(
      newKeyName.trim(),
      selectedScopes,
      rateLimitRpm
    );

    setIsGenerateOpen(false);
    setRevealedKey(rawKey);
    setNewKeyName("");
    setSelectedScopes(["messages:send", "templates:read"]);
  };

  const handleRotate = (keyId: string) => {
    const confirmed = window.confirm(
      "Rotate this API key? The existing key may stop working immediately."
    );

    if (!confirmed) return;

    const { newRawKey } = rotateApiKey(keyId);

    if (newRawKey) {
      setRevealedKey(newRawKey);
    }
  };

  const handleRevoke = (keyId: string) => {
    const confirmed = window.confirm(
      "Revoke this API key? Applications using it may lose access."
    );

    if (confirmed) {
      revokeApiKey(keyId);
    }
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(true);
      setCopyError("");

      window.setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      setCopiedKey(false);
      setCopyError(
        "Copy failed. Select the secret and copy it manually."
      );
    }
  };

  const handleRunTestCall = () => {
    if (!selectedTestKey) {
      setTestResult({
        success: false,
        statusCode: 401,
        message: "Select an active API key before testing.",
        remainingLimit: 0,
      });
      return;
    }

    const result = testApiCall(selectedTestKey, testEndpoint);
    setTestResult(result);
  };

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((previous) =>
      previous.includes(scopeId)
        ? previous.filter((scope) => scope !== scopeId)
        : [...previous, scopeId]
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/50">
                <KeyRound className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide text-white">
                  {BRAND}
                </p>
                <p className="text-xs text-slate-500">
                  Developer & Integrations
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              API Key Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage API credentials, permissions, and request limits
              for your company integrations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsGenerateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Plus className="h-4 w-4" />
            Create API Key
          </button>
        </header>

        {/* Security notice */}
        <section className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 sm:p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

          <div>
            <h2 className="text-sm font-semibold text-white">
              Security best practices
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Treat API secrets like passwords. Reveal a secret only when
              creating or rotating a key, store it securely, grant only
              the permissions required, and revoke compromised credentials
              immediately.
            </p>
            <p className="mt-2 text-xs leading-5 text-amber-300">
              Verify that your backend hashes secrets securely and enforces
              tenant isolation, permissions, expiration, and rate limits.
              This interface alone does not implement those protections.
            </p>
          </div>
        </section>

        {/* Overview cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Total credentials</p>
              <KeyRound className="h-5 w-5 text-blue-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-white">
              {companyKeys.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Issued to this company
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Active keys</p>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-white">
              {activeKeys.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Currently marked active
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Company workspace</p>
              <Building2 className="h-5 w-5 text-indigo-400" />
            </div>
            <p className="mt-3 truncate text-xl font-bold text-white">
              {currentCompany.name}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Company-scoped credentials
            </p>
          </div>
        </section>

        {/* Credentials table */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-white">
                API Credentials
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Review permissions, usage, status, and expiration.
              </p>
            </div>

            <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              {activeKeys.length} active
            </span>
          </div>

          {companyKeys.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
                <KeyRound className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="mt-4 font-semibold text-white">
                No API keys yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Create your first API key to connect an authorized
                application or integration.
              </p>
              <button
                type="button"
                onClick={() => setIsGenerateOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Create your first key
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Credential</th>
                    <th className="px-4 py-4 font-semibold">Permissions</th>
                    <th className="px-4 py-4 font-semibold">Usage</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Expires</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {companyKeys.map((key) => {
                    const usagePercent =
                      key.rateLimitRpm > 0
                        ? Math.min(
                            100,
                            Math.max(
                              0,
                              (key.currentMinuteUsage /
                                key.rateLimitRpm) *
                                100
                            )
                          )
                        : 0;

                    const isActive = key.status === "ACTIVE";
                    const isExpired =
                      new Date(key.expiresAt).getTime() <= Date.now();

                    return (
                      <tr
                        key={key.id}
                        className="transition hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">
                            {key.name}
                          </p>
                          <p className="mt-1 font-mono text-xs text-blue-300">
                            {key.keyPrefix}••••••••
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            ID: {key.id}
                          </p>
                        </td>

                        <td className="max-w-xs px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {key.scopes.map((scope) => (
                              <span
                                key={scope}
                                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[10px] text-slate-300"
                              >
                                {scope}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="w-32 space-y-2">
                            <div className="flex justify-between gap-2 text-xs">
                              <span className="text-slate-300">
                                {key.currentMinuteUsage}/
                                {key.rateLimitRpm}
                              </span>
                              <span
                                className={
                                  usagePercent >= 80
                                    ? "text-amber-400"
                                    : "text-slate-500"
                                }
                              >
                                {usagePercent.toFixed(0)}%
                              </span>
                            </div>
                            <div
                              className="h-1.5 overflow-hidden rounded-full bg-slate-800"
                              role="progressbar"
                              aria-valuenow={usagePercent}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Usage for ${key.name}`}
                            >
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usagePercent >= 80
                                    ? "bg-amber-400"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Requests per minute
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                              isActive && !isExpired
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : "border-red-500/20 bg-red-500/10 text-red-400"
                            }`}
                          >
                            {isExpired && isActive
                              ? "EXPIRED"
                              : key.status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(key.expiresAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {isActive && !isExpired ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRotate(key.id)}
                                  title="Rotate API key"
                                  aria-label={`Rotate ${key.name}`}
                                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-blue-300"
                                >
                                  <RotateCw className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRevoke(key.id)}
                                  title="Revoke API key"
                                  aria-label={`Revoke ${key.name}`}
                                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <span className="px-2 py-2 text-xs text-slate-500">
                                No actions
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500">
            Displaying credentials belonging to {currentCompany.name}.
          </div>
        </section>

        {/* API Playground */}
        <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-3">
              <Terminal className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                API Integration Tester
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Test your configured authorization and endpoint rules.
                Results depend on your existing AppContext implementation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="test-key"
                className="mb-2 block text-xs font-medium text-slate-400"
              >
                API credential
              </label>
              <select
                id="test-key"
                value={selectedTestKey}
                onChange={(e) => setSelectedTestKey(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="">Select a key</option>
                {companyKeys.map((key) => (
                  <option key={key.id} value={key.keyPrefix}>
                    {key.name} — {key.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="test-endpoint"
                className="mb-2 block text-xs font-medium text-slate-400"
              >
                Endpoint
              </label>
              <select
                id="test-endpoint"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="/api/v1/messages/send">
                  POST /api/v1/messages/send
                </option>
                <option value="/api/v1/templates/list">
                  GET /api/v1/templates/list
                </option>
                <option value="/api/v1/contacts/query">
                  GET /api/v1/contacts/query
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleRunTestCall}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Activity className="h-4 w-4" />
                Test configuration
              </button>
            </div>
          </div>

          {testResult && (
            <div
              role="status"
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                testResult.statusCode === 200
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : testResult.statusCode === 429
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-red-500/20 bg-red-500/5"
              }`}
            >
              {testResult.statusCode === 200 ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              )}

              <div>
                <p className="text-sm font-semibold text-white">
                  HTTP {testResult.statusCode}
                  {" · "}
                  Remaining quota: {testResult.remainingLimit} RPM
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Create API key modal */}
        {isGenerateOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setIsGenerateOpen(false);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-key-title"
              className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2
                    id="create-key-title"
                    className="font-semibold text-white"
                  >
                    Create API credential
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Configure a name, permissions, and request limit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  aria-label="Close dialog"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleGenerateSubmit}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="key-name"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Credential name
                  </label>
                  <input
                    id="key-name"
                    type="text"
                    maxLength={100}
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Website Production"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">
                      Permissions
                    </label>
                    <span className="text-xs text-slate-500">
                      {selectedScopes.length} selected
                    </span>
                  </div>

                  <div className="space-y-2">
                    {availableScopes.map((scope) => (
                      <label
                        key={scope.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope.id)}
                          onChange={() => toggleScope(scope.id)}
                          className="mt-1 h-4 w-4 accent-blue-500"
                        />
                        <span className="min-w-0">
                          <span className="block font-mono text-xs font-semibold text-slate-200">
                            {scope.label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            {scope.desc}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {selectedScopes.length === 0 && (
                    <p className="mt-2 text-xs text-amber-400">
                      Select at least one permission.
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label
                      htmlFor="rate-limit"
                      className="text-sm font-medium text-slate-300"
                    >
                      Request limit
                    </label>
                    <span className="font-mono text-sm font-semibold text-blue-400">
                      {rateLimitRpm} RPM
                    </span>
                  </div>
                  <input
                    id="rate-limit"
                    type="range"
                    min={60}
                    max={600}
                    step={30}
                    value={rateLimitRpm}
                    onChange={(e) =>
                      setRateLimitRpm(Number(e.target.value))
                    }
                    className="w-full accent-blue-500"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>60 RPM</span>
                    <span>600 RPM</span>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsGenerateOpen(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !newKeyName.trim() || selectedScopes.length === 0
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Generate credential
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* One-time secret reveal */}
        {revealedKey && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="secret-title"
              className="my-auto w-full max-w-lg space-y-5 rounded-2xl border border-blue-500/30 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <LockKeyhole className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2
                    id="secret-title"
                    className="text-lg font-bold text-white"
                  >
                    Save your API secret
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Copy this secret and store it in a secure secret
                    manager. After closing this dialog, it will no longer
                    be displayed here.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                <div className="flex items-start gap-3">
                  <code className="min-w-0 flex-1 break-all font-mono text-sm text-blue-300">
                    {revealedKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(revealedKey)}
                    aria-label="Copy API secret"
                    className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700"
                  >
                    {copiedKey ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {copiedKey && (
                  <p className="mt-3 text-xs text-emerald-400">
                    Copied to clipboard.
                  </p>
                )}

                {copyError && (
                  <p className="mt-3 text-xs text-amber-400">
                    {copyError}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-300">
                Never share API secrets in public repositories, screenshots,
                frontend source code, or client-side environment variables.
              </div>

              <button
                type="button"
                onClick={() => {
                  setRevealedKey(null);
                  setCopiedKey(false);
                  setCopyError("");
                }}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                I have saved my secret
              </button>
            </section>
          </div>
        )}

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-5 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND}
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Developer Console
          </p>
        </footer>
      </div>
    </main>
  );
};

export default TenantApiKeys;
